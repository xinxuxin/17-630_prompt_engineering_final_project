from app.core.settings import Settings
from app.pipeline.base import invoke_structured_generation, run_stage
from app.pipeline.prompts import verification_prompts
from app.providers.base import StructuredProvider
from app.schemas.common import StageTrace, VerdictLabel
from app.schemas.verification import VerificationInput, VerificationOutput
from app.utils.text import lexical_overlap


class Verifier:
    def __init__(self, provider: StructuredProvider, settings: Settings) -> None:
        self.provider = provider
        self.settings = settings

    def run(
        self,
        stage_input: VerificationInput,
    ) -> tuple[VerificationOutput, StageTrace]:
        claim_id = stage_input.claim.claim_id

        def primary() -> VerificationOutput:
            if not self.provider.configured:
                raise RuntimeError("No live provider configured for verification.")
            system_prompt, user_prompt = verification_prompts(
                stage_input.claim.text,
                stage_input.evidence_items,
            )
            return invoke_structured_generation(
                provider=self.provider,
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                response_model=VerificationOutput,
                max_retries=self.settings.max_stage_retries,
                stage_name="verifier",
                claim_id=claim_id,
            )

        def fallback() -> VerificationOutput:
            if not stage_input.evidence_items:
                return VerificationOutput(
                    label=VerdictLabel.NOT_ENOUGH_INFO,
                    confidence=0.18,
                    rationale="No evidence was retrieved, so the verifier falls back to a conservative not_enough_info decision.",
                    citation_ids=[],
                    evidence_strength=0.0,
                )

            top_item = stage_input.evidence_items[0]
            top_score = top_item.rerank_score or top_item.retrieval_score
            decisive_opposite = next(
                (
                    item
                    for item in stage_input.evidence_items[1:]
                    if item.stance_hint in {"supports", "refutes"}
                    and item.stance_hint != top_item.stance_hint
                    and (item.rerank_score or item.retrieval_score) >= top_score - 0.05
                ),
                None,
            )

            if decisive_opposite and top_score < 0.6:
                return VerificationOutput(
                    label=VerdictLabel.NOT_ENOUGH_INFO,
                    confidence=0.31,
                    rationale="Retrieved evidence includes mixed or non-decisive signals, so the verifier remains conservative.",
                    citation_ids=[top_item.evidence_id],
                    evidence_strength=min(top_score, 1.0),
                )

            if top_item.stance_hint not in {"supports", "refutes"}:
                return VerificationOutput(
                    label=VerdictLabel.NOT_ENOUGH_INFO,
                    confidence=0.29,
                    rationale="The highest-ranked evidence adds context but does not directly support or refute the claim.",
                    citation_ids=[top_item.evidence_id],
                    evidence_strength=min(top_score, 1.0),
                )

            if top_item.stance_hint == "refutes":
                return VerificationOutput(
                    label=VerdictLabel.REFUTED,
                    confidence=min(0.9, 0.52 + top_score),
                    rationale="The top reranked evidence directly contradicts the claim.",
                    citation_ids=[top_item.evidence_id],
                    evidence_strength=min(top_score, 1.0),
                )

            overlap = lexical_overlap(stage_input.claim.text, top_item.snippet)
            support_threshold = max(0.4, self.settings.conservative_nei_threshold - 0.08)
            if top_score < support_threshold or overlap < 0.18:
                return VerificationOutput(
                    label=VerdictLabel.NOT_ENOUGH_INFO,
                    confidence=0.34,
                    rationale="The evidence is topically related but still too weak to support or refute the claim safely.",
                    citation_ids=[top_item.evidence_id],
                    evidence_strength=min(top_score, 1.0),
                )

            return VerificationOutput(
                label=VerdictLabel.SUPPORTED,
                confidence=min(0.89, 0.48 + top_score),
                rationale="The top reranked evidence aligns strongly with the factual content of the claim.",
                citation_ids=[top_item.evidence_id],
                evidence_strength=min(top_score, 1.0),
            )

        return run_stage(
            "verifier",
            self.settings.max_stage_retries,
            primary,
            fallback,
            claim_id=claim_id,
        )
