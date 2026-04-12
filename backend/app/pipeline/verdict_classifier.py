from app.core.settings import Settings
from app.pipeline.base import run_stage
from app.pipeline.prompts import classification_prompts
from app.providers.base import StructuredProvider
from app.schemas.claims import AtomicClaim
from app.schemas.contracts import ClaimClassificationOutput
from app.schemas.evidence import EvidenceBundle
from app.schemas.common import StageTrace, VerdictLabel
from app.utils.text import lexical_overlap


class VerdictClassifier:
    def __init__(self, provider: StructuredProvider, settings: Settings) -> None:
        self.provider = provider
        self.settings = settings

    def classify(
        self,
        claim: AtomicClaim,
        evidence_bundle: EvidenceBundle,
    ) -> tuple[ClaimClassificationOutput, StageTrace]:
        def primary() -> ClaimClassificationOutput:
            if not self.provider.configured:
                raise RuntimeError("No live provider configured for verdict classification.")
            system_prompt, user_prompt = classification_prompts(claim.text, evidence_bundle)
            return self.provider.generate_structured(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                response_model=ClaimClassificationOutput,
                max_retries=self.settings.max_stage_retries,
            )

        def fallback() -> ClaimClassificationOutput:
            if not evidence_bundle.items:
                return ClaimClassificationOutput(
                    label=VerdictLabel.NOT_ENOUGH_INFO,
                    confidence=0.22,
                    justification="No relevant evidence was retrieved, so the system falls back to a conservative NEI decision.",
                    citation_ids=[],
                )

            best_item = max(
                evidence_bundle.items,
                key=lambda item: lexical_overlap(claim.text, item.snippet),
            )
            overlap = lexical_overlap(claim.text, best_item.snippet)

            if best_item.stance_hint == "refutes":
                return ClaimClassificationOutput(
                    label=VerdictLabel.REFUTED,
                    confidence=min(0.82, 0.55 + overlap),
                    justification="The strongest retrieved evidence is explicitly tagged as refuting the claim.",
                    citation_ids=[best_item.evidence_id],
                )

            if overlap >= self.settings.conservative_nei_threshold:
                return ClaimClassificationOutput(
                    label=VerdictLabel.SUPPORTED,
                    confidence=min(0.86, 0.5 + overlap),
                    justification="The top evidence passage has strong lexical alignment with the claim.",
                    citation_ids=[best_item.evidence_id],
                )

            return ClaimClassificationOutput(
                label=VerdictLabel.NOT_ENOUGH_INFO,
                confidence=0.34,
                justification="The retrieved passages are topically related but not decisive enough to support or refute the claim.",
                citation_ids=[best_item.evidence_id],
            )

        return run_stage("verdict_classification", self.settings.max_stage_retries, primary, fallback)
