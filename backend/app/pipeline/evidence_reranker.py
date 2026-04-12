from app.pipeline.base import run_stage
from app.schemas.common import StageTrace
from app.schemas.evidence import (
    EvidenceItem,
    EvidenceRerankerInput,
    EvidenceRerankerOutput,
)
from app.utils.text import lexical_overlap


class EvidenceReranker:
    def __init__(self, weak_evidence_threshold: float) -> None:
        self.weak_evidence_threshold = weak_evidence_threshold

    def run(
        self,
        stage_input: EvidenceRerankerInput,
    ) -> tuple[EvidenceRerankerOutput, StageTrace]:
        claim_id = stage_input.claim.claim_id

        def primary() -> EvidenceRerankerOutput:
            reranked_items = self._rerank_items(
                stage_input.claim.text,
                stage_input.evidence_items,
                stage_input.top_k,
            )
            weak_evidence = not reranked_items or (
                (reranked_items[0].rerank_score or 0.0) < self.weak_evidence_threshold
            )
            return EvidenceRerankerOutput(
                claim_id=claim_id,
                items=reranked_items,
                selected_evidence_ids=[item.evidence_id for item in reranked_items],
                weak_evidence=weak_evidence,
            )

        def fallback() -> EvidenceRerankerOutput:
            items = stage_input.evidence_items[: stage_input.top_k]
            for item in items:
                if item.rerank_score is None:
                    item.rerank_score = item.retrieval_score
            return EvidenceRerankerOutput(
                claim_id=claim_id,
                items=items,
                selected_evidence_ids=[item.evidence_id for item in items],
                weak_evidence=True,
            )

        return run_stage(
            "evidence_reranker",
            0,
            primary,
            fallback,
            claim_id=claim_id,
        )

    def _rerank_items(
        self,
        claim_text: str,
        evidence_items: list[EvidenceItem],
        top_k: int,
    ) -> list[EvidenceItem]:
        rescored: list[EvidenceItem] = []
        for item in evidence_items:
            lexical_score = lexical_overlap(claim_text, item.snippet)
            stance_bonus = 0.08 if item.stance_hint in {"supports", "refutes"} else 0.0
            rerank_score = min(1.0, (item.retrieval_score * 0.55) + (lexical_score * 0.45) + stance_bonus)
            rescored.append(
                item.model_copy(update={"rerank_score": rerank_score, "score": rerank_score})
            )
        rescored.sort(
            key=lambda item: (item.rerank_score or 0.0, item.retrieval_score),
            reverse=True,
        )
        return rescored[:top_k]
