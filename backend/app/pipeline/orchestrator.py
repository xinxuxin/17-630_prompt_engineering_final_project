from time import perf_counter

from app.core.settings import Settings
from app.pipeline.claim_extractor import ClaimExtractor
from app.pipeline.rewrite_generator import RewriteGenerator
from app.pipeline.verdict_classifier import VerdictClassifier
from app.providers.base import StructuredProvider
from app.schemas.claims import AtomicClaim
from app.schemas.common import StageStatus, StageTrace, VerdictLabel
from app.schemas.pipeline import (
    ClaimAssessment,
    FactCheckRequest,
    FactCheckResponse,
    FactCheckSummary,
)
from app.services.retrieval_service import RetrievalService
from app.utils.experiment_io import write_experiment_output
from app.utils.ids import new_run_id


class FactCheckOrchestrator:
    def __init__(
        self,
        settings: Settings,
        provider: StructuredProvider,
        retrieval_service: RetrievalService,
    ) -> None:
        self.settings = settings
        self.provider = provider
        self.retrieval_service = retrieval_service
        self.claim_extractor = ClaimExtractor(provider, settings.max_stage_retries)
        self.verdict_classifier = VerdictClassifier(provider, settings)
        self.rewrite_generator = RewriteGenerator(provider, settings.max_stage_retries)

    def run(self, request: FactCheckRequest) -> FactCheckResponse:
        run_id = new_run_id()
        stage_trace: list[StageTrace] = []

        extraction_output, extraction_trace = self.claim_extractor.extract(
            request.input_text,
            max_claims=min(request.max_claims, self.settings.max_claims_per_request),
        )
        stage_trace.append(extraction_trace)

        claim_results: list[ClaimAssessment] = []
        for claim in extraction_output.claims:
            assessment, traces = self._assess_claim(claim, request)
            claim_results.append(assessment)
            stage_trace.extend(traces)

        summary = FactCheckSummary(
            total_claims=len(claim_results),
            supported=sum(1 for item in claim_results if item.label == VerdictLabel.SUPPORTED),
            refuted=sum(1 for item in claim_results if item.label == VerdictLabel.REFUTED),
            not_enough_info=sum(
                1 for item in claim_results if item.label == VerdictLabel.NOT_ENOUGH_INFO
            ),
        )

        response = FactCheckResponse(
            run_id=run_id,
            dataset_name=request.dataset_name,
            input_text=request.input_text,
            claims=claim_results,
            stage_trace=stage_trace,
            summary=summary,
        )
        write_experiment_output(self.settings.fact_check_eval_root, response)
        return response

    def _assess_claim(
        self,
        claim: AtomicClaim,
        request: FactCheckRequest,
    ) -> tuple[ClaimAssessment, list[StageTrace]]:
        traces: list[StageTrace] = []
        retrieval_start = perf_counter()
        evidence_bundle = self.retrieval_service.retrieve(
            claim_id=claim.claim_id,
            query=claim.text,
            top_k=request.top_k_evidence,
        )
        traces.append(
            StageTrace(
                stage="evidence_retrieval",
                status=StageStatus.SUCCESS if evidence_bundle.items else StageStatus.FALLBACK,
                detail=(
                    f"Retrieved {len(evidence_bundle.items)} evidence items."
                    if evidence_bundle.items
                    else "No dense or lexical evidence matched the claim."
                ),
                duration_ms=int((perf_counter() - retrieval_start) * 1000),
                retries=0,
            )
        )
        classification_output, classification_trace = self.verdict_classifier.classify(
            claim,
            evidence_bundle,
        )
        traces.append(classification_trace)

        corrected_rewrite = None
        if request.include_rewrite:
            corrected_rewrite, rewrite_trace = self.rewrite_generator.rewrite(
                claim,
                evidence_bundle,
                classification_output.label,
            )
            traces.append(rewrite_trace)

        assessment = ClaimAssessment(
            claim_id=claim.claim_id,
            claim_text=claim.text,
            label=classification_output.label,
            confidence=classification_output.confidence,
            justification=classification_output.justification,
            evidence=evidence_bundle.items,
            corrected_rewrite=corrected_rewrite,
        )
        return assessment, traces
