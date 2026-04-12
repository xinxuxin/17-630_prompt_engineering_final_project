from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any

from app.core.settings import get_settings
from app.schemas.pipeline import AnalyzeRequest
from app.services.fact_check import FactCheckService

try:
    from eval.eval_utils import (
        claim_to_dict,
        create_run_dir,
        normalize_examples,
        summarize_examples,
        write_csv,
        write_json,
    )
    from eval.metrics import compute_metrics
except ImportError:
    from eval_utils import claim_to_dict, create_run_dir, normalize_examples, summarize_examples, write_csv, write_json
    from metrics import compute_metrics


def run_multistage(
    *,
    dataset_path: Path,
    dataset_name: str,
    output_root: Path,
    top_k: int,
    max_claims: int,
    include_rewrite: bool,
) -> Path:
    settings = get_settings()
    service = FactCheckService(settings)
    examples = normalize_examples(dataset_path)
    dataset_summary = summarize_examples(examples)
    run_dir = create_run_dir(output_root, "multistage", dataset_name)

    example_outputs: list[dict[str, Any]] = []
    claim_rows: list[dict[str, Any]] = []

    for example in examples:
        response = service.analyze(
            AnalyzeRequest(
                input_text=example.input_text,
                dataset_name=dataset_name,
                include_rewrite=include_rewrite,
                max_claims=max_claims,
                top_k_evidence=top_k,
            )
        )
        example_outputs.append(
            {
                "example_id": example.example_id,
                "input_text": example.input_text,
                "example_metadata": example.metadata,
                "gold_claims": [claim_to_dict(claim) for claim in example.claims],
                "response": response.model_dump(),
            }
        )
        claim_rows.extend(_align_multistage_claims(example, response.model_dump()))

    metrics = compute_metrics(claim_rows, top_k=top_k)
    summary = {
        "mode": "multistage",
        "dataset_name": dataset_name,
        "dataset_path": str(dataset_path),
        "dataset_summary": dataset_summary,
        "metrics": metrics,
        "examples": len(examples),
        "run_dir": str(run_dir),
    }

    write_json(run_dir / "config.json", {
        "mode": "multistage",
        "dataset_name": dataset_name,
        "dataset_path": str(dataset_path),
        "dataset_summary": dataset_summary,
        "top_k": top_k,
        "max_claims": max_claims,
        "include_rewrite": include_rewrite,
    })
    write_json(run_dir / "predictions.json", example_outputs)
    write_csv(run_dir / "claim_predictions.csv", claim_rows)
    write_json(run_dir / "summary.json", summary)
    return run_dir


def _align_multistage_claims(example, response: dict[str, Any]) -> list[dict[str, Any]]:
    predicted_claims = response["claims"]
    rows: list[dict[str, Any]] = []
    for index, gold_claim in enumerate(example.claims):
        prediction = predicted_claims[index] if index < len(predicted_claims) else None
        evidence = prediction.get("evidence", []) if prediction else []
        rows.append(
            {
                "example_id": example.example_id,
                "dataset_track": example.metadata.get("dataset_track", "benchmark_style"),
                "claim_index": index + 1,
                "gold_claim_id": gold_claim.claim_id,
                "gold_claim_text": gold_claim.text,
                "predicted_claim_text": prediction.get("claim_text", "") if prediction else "",
                "gold_label": gold_claim.gold_label,
                "predicted_label": prediction.get("label", "not_enough_info") if prediction else "not_enough_info",
                "correct": (
                    None
                    if gold_claim.gold_label is None
                    else (
                        gold_claim.gold_label == prediction.get("label")
                        if prediction
                        else False
                    )
                ),
                "rationale": prediction.get("rationale", "Missing prediction.") if prediction else "Missing prediction.",
                "confidence": prediction.get("confidence") if prediction else None,
                "source_article_title": gold_claim.source_article_title,
                "publication_date": gold_claim.publication_date,
                "source_url": gold_claim.source_url,
                "claim_notes": gold_claim.notes,
                "retrieved_evidence_ids": [item.get("evidence_id") for item in evidence],
                "retrieved_source_document_ids": [
                    item.get("source_document_id") for item in evidence if item.get("source_document_id")
                ],
                "gold_evidence_ids": gold_claim.gold_evidence_ids,
                "gold_source_document_ids": gold_claim.gold_source_document_ids,
                "evidence_count": len(evidence),
                "run_id": response["run_id"],
            }
        )
    return rows


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", required=True, type=Path)
    parser.add_argument("--dataset-name", required=True)
    parser.add_argument("--output-root", default="eval/results", type=Path)
    parser.add_argument("--top-k", default=4, type=int)
    parser.add_argument("--max-claims", default=6, type=int)
    parser.add_argument("--include-rewrite", action="store_true", default=False)
    args = parser.parse_args()

    run_dir = run_multistage(
        dataset_path=args.dataset,
        dataset_name=args.dataset_name,
        output_root=args.output_root,
        top_k=args.top_k,
        max_claims=args.max_claims,
        include_rewrite=args.include_rewrite,
    )
    print(f"Multistage evaluation complete: {run_dir}")


if __name__ == "__main__":
    main()
