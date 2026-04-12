from app.pipeline.base import run_stage
from app.pipeline.prompts import rewrite_prompts
from app.providers.base import StructuredProvider
from app.schemas.claims import AtomicClaim
from app.schemas.common import Citation, StageTrace, VerdictLabel
from app.schemas.contracts import RewriteOutput
from app.schemas.evidence import EvidenceBundle
from app.schemas.pipeline import CorrectedRewrite


class RewriteGenerator:
    def __init__(self, provider: StructuredProvider, max_retries: int) -> None:
        self.provider = provider
        self.max_retries = max_retries

    def rewrite(
        self,
        claim: AtomicClaim,
        evidence_bundle: EvidenceBundle,
        label: VerdictLabel,
    ) -> tuple[CorrectedRewrite | None, StageTrace]:
        def primary() -> CorrectedRewrite | None:
            if label == VerdictLabel.NOT_ENOUGH_INFO:
                return None
            if not self.provider.configured:
                raise RuntimeError("No live provider configured for corrective rewrites.")
            system_prompt, user_prompt = rewrite_prompts(claim.text, evidence_bundle)
            output = self.provider.generate_structured(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                response_model=RewriteOutput,
                max_retries=self.max_retries,
            )
            return CorrectedRewrite(
                text=output.text,
                citations=_citations_from_ids(evidence_bundle, output.citation_ids),
                edit_summary=output.edit_summary,
            )

        def fallback() -> CorrectedRewrite | None:
            if label != VerdictLabel.REFUTED or not evidence_bundle.items:
                return None
            best_item = evidence_bundle.items[0]
            rewrite_text = best_item.snippet.strip()
            if not rewrite_text.endswith("."):
                rewrite_text += "."
            return CorrectedRewrite(
                text=rewrite_text,
                citations=[
                    Citation(
                        evidence_id=best_item.evidence_id,
                        title=best_item.title,
                        url=best_item.url,
                    )
                ],
                edit_summary="Fallback rewrite uses the top evidence passage when no live LLM rewrite provider is configured.",
            )

        return run_stage("corrective_rewrite", self.max_retries, primary, fallback)


def _citations_from_ids(
    evidence_bundle: EvidenceBundle,
    citation_ids: list[str],
) -> list[Citation]:
    citations: list[Citation] = []
    for item in evidence_bundle.items:
        if item.evidence_id in citation_ids:
            citations.append(
                Citation(
                    evidence_id=item.evidence_id,
                    title=item.title,
                    url=item.url,
                )
            )
    return citations
