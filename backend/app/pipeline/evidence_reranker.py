from app.pipeline.base import run_stage
from app.schemas.common import StageTrace
from app.schemas.evidence import (
    EvidenceRerankerInput,
    EvidenceRerankerOutput,
)
from retrieval.reranker import HeuristicReranker


class EvidenceReranker:
    def __init__(self, weak_evidence_threshold: float) -> None:
        self.weak_evidence_threshold = weak_evidence_threshold
        self.reranker = HeuristicReranker()

    def run(
        self,
        stage_input: EvidenceRerankerInput,
    ) -> tuple[EvidenceRerankerOutput, StageTrace]:
        claim_id = stage_input.claim.claim_id

        def primary() -> EvidenceRerankerOutput:
            reranked_items = self.reranker.rerank(
                claim_text=stage_input.claim.text,
                evidence_items=stage_input.evidence_items,
                top_k=stage_input.top_k,
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
