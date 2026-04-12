from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any

from pydantic import Field

from app.core.settings import get_settings
from app.pipeline.base import invoke_structured_generation
from app.providers.factory import build_provider
from app.schemas.common import StrictModel, VerdictLabel
from app.schemas.evidence import EvidenceItem
from eval_utils import claim_to_dict, create_run_dir, normalize_examples, write_csv, write_json
from metrics import compute_metrics
from retrieval.chunking import ChunkingConfig
from retrieval.retriever import LocalEvidenceRetriever
from retrieval.reranker import HeuristicReranker


class BaselinePrediction(StrictModel):
    label: VerdictLabel
    confidence: float = Field(ge=0.0, le=1.0)
    rationale: str = Field(min_length=3)


def run_baseline(
    *,
    dataset_path: Path,
    dataset_name: str,
    output_root: Path,
    top_k: int,
) -> Path:
    settings = get_settings()
    provider = build_provider(settings)
    retriever = LocalEvidenceRetriever(
        corpus_dir=settings.corpus_dir,
        chunk_manifest_path=settings.corpus_path,
        index_path=settings.retrieval_index_path,
        model_name=settings.sentence_transformer_model,
        chunking_config=ChunkingConfig(
            chunk_size_words=settings.chunk_size_words,
            chunk_overlap_words=settings.chunk_overlap_words,
        ),
    )
    reranker = HeuristicReranker()
    examples = normalize_examples(dataset_path)
    run_dir = create_run_dir(output_root, "baseline", dataset_name)

    example_outputs: list[dict[str, Any]] = []
    claim_rows: list[dict[str, Any]] = []

    for example in examples:
        example_claims: list[dict[str, Any]] = []
        for index, gold_claim in enumerate(example.claims, start=1):
            evidence_items, retrieval_strategy = retriever.retrieve(gold_claim.text, top_k=top_k)
            reranked_items = reranker.rerank(
                claim_text=gold_claim.text,
                evidence_items=evidence_items,
                top_k=top_k,
            )
            prediction = _predict_claim(
                provider=provider,
                claim_text=gold_claim.text,
                evidence_items=reranked_items,
                max_retries=settings.max_stage_retries,
            )
            example_claims.append(
                {
                    "claim_index": index,
                    "claim_text": gold_claim.text,
                    "prediction": prediction.model_dump(),
                    "evidence": [item.model_dump() for item in reranked_items],
                    "retrieval_strategy": retrieval_strategy,
                }
            )
            claim_rows.append(
                {
                    "example_id": example.example_id,
                    "claim_index": index,
                    "gold_claim_id": gold_claim.claim_id,
                    "gold_claim_text": gold_claim.text,
                    "predicted_claim_text": gold_claim.text,
                    "gold_label": gold_claim.gold_label,
                    "predicted_label": prediction.label.value,
                    "correct": gold_claim.gold_label == prediction.label.value,
                    "rationale": prediction.rationale,
                    "confidence": prediction.confidence,
                    "retrieved_evidence_ids": [item.evidence_id for item in reranked_items],
                    "retrieved_source_document_ids": [
                        item.source_document_id for item in reranked_items if item.source_document_id
                    ],
                    "gold_evidence_ids": gold_claim.gold_evidence_ids,
                    "gold_source_document_ids": gold_claim.gold_source_document_ids,
                    "evidence_count": len(reranked_items),
                    "run_id": "",
                }
            )

        example_outputs.append(
            {
                "example_id": example.example_id,
                "input_text": example.input_text,
                "gold_claims": [claim_to_dict(claim) for claim in example.claims],
                "claims": example_claims,
            }
        )

    metrics = compute_metrics(claim_rows, top_k=top_k)
    summary = {
        "mode": "baseline",
        "dataset_name": dataset_name,
        "dataset_path": str(dataset_path),
        "metrics": metrics,
        "examples": len(examples),
        "provider_name": provider.name,
        "provider_configured": provider.configured,
        "run_dir": str(run_dir),
    }

    write_json(run_dir / "config.json", {
        "mode": "baseline",
        "dataset_name": dataset_name,
        "dataset_path": str(dataset_path),
        "top_k": top_k,
        "provider_name": provider.name,
    })
    write_json(run_dir / "predictions.json", example_outputs)
    write_csv(run_dir / "claim_predictions.csv", claim_rows)
    write_json(run_dir / "summary.json", summary)
    return run_dir


def _predict_claim(
    *,
    provider,
    claim_text: str,
    evidence_items: list[EvidenceItem],
    max_retries: int,
) -> BaselinePrediction:
    if provider.configured:
        system_prompt = (
            "Role: You are a single-prompt baseline fact checker.\n\n"
            "Task: Judge one claim using the provided evidence snippets and return JSON only.\n\n"
            "Constraints:\n"
            "- Use only the supplied evidence.\n"
            "- If the evidence is weak, indirect, or mixed, return not_enough_info.\n"
            "- Do not overclaim from topical similarity.\n"
            "- Return valid JSON only.\n"
        )
        evidence_block = "\n\n".join(
            f"- [{item.evidence_id}] {item.title}: {item.snippet}"
            for item in evidence_items
        ) or "- No evidence retrieved."
        user_prompt = (
            f"Claim:\n{claim_text}\n\n"
            f"Evidence:\n{evidence_block}\n\n"
            f"Schema:\n{BaselinePrediction.model_json_schema()}"
        )
        return invoke_structured_generation(
            provider=provider,
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            response_model=BaselinePrediction,
            max_retries=max_retries,
            stage_name="baseline_single_prompt",
        )

    if not evidence_items:
        return BaselinePrediction(
            label=VerdictLabel.NOT_ENOUGH_INFO,
            confidence=0.22,
            rationale="No evidence was retrieved, so the baseline falls back to not_enough_info.",
        )

    top_item = evidence_items[0]
    top_score = top_item.rerank_score or top_item.retrieval_score
    if top_item.stance_hint == "refutes":
        return BaselinePrediction(
            label=VerdictLabel.REFUTED,
            confidence=min(0.85, 0.5 + top_score),
            rationale="The top retrieved evidence directly contradicts the claim.",
        )
    if top_item.stance_hint == "supports" and top_score >= 0.4:
        return BaselinePrediction(
            label=VerdictLabel.SUPPORTED,
            confidence=min(0.82, 0.46 + top_score),
            rationale="The top retrieved evidence supports the claim strongly enough for the baseline decision.",
        )
    return BaselinePrediction(
        label=VerdictLabel.NOT_ENOUGH_INFO,
        confidence=0.33,
        rationale="The evidence is too weak or indirect for a confident single-prompt decision.",
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", required=True, type=Path)
    parser.add_argument("--dataset-name", required=True)
    parser.add_argument("--output-root", default="eval/results", type=Path)
    parser.add_argument("--top-k", default=4, type=int)
    args = parser.parse_args()

    run_dir = run_baseline(
        dataset_path=args.dataset,
        dataset_name=args.dataset_name,
        output_root=args.output_root,
        top_k=args.top_k,
    )
    print(f"Baseline evaluation complete: {run_dir}")


if __name__ == "__main__":
    main()
