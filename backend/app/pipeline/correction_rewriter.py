from app.pipeline.base import invoke_structured_generation, run_stage
from app.pipeline.prompts import correction_prompts
from app.providers.base import StructuredProvider
from app.schemas.common import Citation, StageTrace, VerdictLabel
from app.schemas.correction import CorrectionRewriteInput, CorrectionRewriteOutput


class CorrectionRewriter:
    def __init__(self, provider: StructuredProvider, max_retries: int) -> None:
        self.provider = provider
        self.max_retries = max_retries

    def run(
        self,
        stage_input: CorrectionRewriteInput,
    ) -> tuple[CorrectionRewriteOutput | None, StageTrace]:
        claim_id = stage_input.claim.claim_id

        def primary() -> CorrectionRewriteOutput | None:
            if stage_input.verification.label == VerdictLabel.NOT_ENOUGH_INFO:
                return None
            if not self.provider.configured:
                raise RuntimeError("No live provider configured for correction rewriting.")
            system_prompt, user_prompt = correction_prompts(
                stage_input.claim.text,
                stage_input.verification.label.value,
                stage_input.evidence_items,
            )
            output = invoke_structured_generation(
                provider=self.provider,
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                response_model=CorrectionRewriteOutput,
                max_retries=self.max_retries,
                stage_name="correction_rewriter",
                claim_id=claim_id,
            )
            citations = _citations_from_ids(stage_input.evidence_items, output.citation_ids)
            return output.model_copy(update={"citations": citations})

        def fallback() -> CorrectionRewriteOutput | None:
            if (
                stage_input.verification.label != VerdictLabel.REFUTED
                or not stage_input.evidence_items
            ):
                return None
            top_item = stage_input.evidence_items[0]
            rewrite_text = top_item.snippet.strip()
            if not rewrite_text.endswith("."):
                rewrite_text += "."
            citation_ids = [top_item.evidence_id]
            return CorrectionRewriteOutput(
                text=rewrite_text,
                citations=_citations_from_ids(stage_input.evidence_items, citation_ids),
                citation_ids=citation_ids,
                edit_summary="Fallback rewrite uses the highest-ranked evidence passage when no external rewrite model is configured.",
            )

        return run_stage(
            "correction_rewriter",
            self.max_retries,
            primary,
            fallback,
            claim_id=claim_id,
        )


def _citations_from_ids(evidence_items: list, citation_ids: list[str]) -> list[Citation]:
    citations: list[Citation] = []
    for item in evidence_items:
        if item.evidence_id in citation_ids:
            citations.append(
                Citation(
                    evidence_id=item.evidence_id,
                    title=item.title,
                    url=item.url,
                )
            )
    return citations
