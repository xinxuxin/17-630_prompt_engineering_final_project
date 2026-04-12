from app.pipeline.base import invoke_structured_generation, run_stage
from app.pipeline.prompts import claim_extraction_prompts
from app.providers.base import StructuredProvider
from app.schemas.claims import AtomicClaim, ClaimExtractionInput, ClaimExtractionOutput
from app.schemas.common import SourceSpan, StageTrace
from app.utils.text import split_compound_claim, split_into_sentences


class ClaimExtractor:
    def __init__(self, provider: StructuredProvider, max_retries: int) -> None:
        self.provider = provider
        self.max_retries = max_retries

    def run(
        self,
        stage_input: ClaimExtractionInput,
    ) -> tuple[ClaimExtractionOutput, StageTrace]:
        def primary() -> ClaimExtractionOutput:
            if not self.provider.configured:
                raise RuntimeError("No live provider configured for claim extraction.")
            system_prompt, user_prompt = claim_extraction_prompts(
                stage_input.max_claims,
                stage_input.source_text,
            )
            return invoke_structured_generation(
                provider=self.provider,
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                response_model=ClaimExtractionOutput,
                max_retries=self.max_retries,
                stage_name="claim_extractor",
            )

        def fallback() -> ClaimExtractionOutput:
            claims: list[AtomicClaim] = []
            for sentence, start, end in split_into_sentences(stage_input.source_text):
                for candidate in split_compound_claim(sentence):
                    if len(candidate) < 20:
                        continue
                    claims.append(
                        AtomicClaim(
                            claim_id=f"claim_{len(claims) + 1:03d}",
                            text=candidate,
                            source_span=SourceSpan(start=start, end=end),
                            notes="Deterministic sentence-level fallback extraction.",
                        )
                    )
                    if len(claims) >= stage_input.max_claims:
                        break
                if len(claims) >= stage_input.max_claims:
                    break
            return ClaimExtractionOutput(claims=claims)

        return run_stage("claim_extractor", self.max_retries, primary, fallback)
