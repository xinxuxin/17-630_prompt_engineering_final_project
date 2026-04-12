from app.core.settings import Settings
from app.pipeline.claim_extractor import ClaimExtractor
from app.pipeline.correction_rewriter import CorrectionRewriter
from app.pipeline.evidence_reranker import EvidenceReranker
from app.pipeline.evidence_retriever import EvidenceRetriever
from app.pipeline.query_generator import QueryGenerator
from app.pipeline.verifier import Verifier
from app.providers.base import StructuredProvider
from app.schemas.claims import ClaimExtractionInput, QueryGenerationInput
from app.schemas.common import StageStatus, StageTrace, VerdictLabel
from app.schemas.correction import CorrectionRewriteInput
from app.schemas.evidence import EvidenceRerankerInput, EvidenceRetrieverInput
from app.schemas.pipeline import (
    AnalyzeRequest,
    AnalyzeResponse,
    AnalysisSummary,
    ClaimAnalysisResult,
    PipelineMetadata,
)
from app.schemas.verification import VerificationInput
from app.utils.experiment_io import write_experiment_output
from app.utils.ids import new_run_id


class PipelineOrchestrator:
    def __init__(self, settings: Settings, provider: StructuredProvider) -> None:
        self.settings = settings
        self.provider = provider
        self.claim_extractor = ClaimExtractor(provider, settings.max_stage_retries)
        self.query_generator = QueryGenerator(provider, settings.max_stage_retries)
        self.evidence_retriever = EvidenceRetriever(settings)
        self.evidence_reranker = EvidenceReranker(settings.conservative_nei_threshold)
        self.verifier = Verifier(provider, settings)
        self.correction_rewriter = CorrectionRewriter(provider, settings.max_stage_retries)

    def run(self, request: AnalyzeRequest) -> AnalyzeResponse:
        run_id = new_run_id()
        stage_trace: list[StageTrace] = []

        extraction_output, extraction_trace = self.claim_extractor.run(
            ClaimExtractionInput(
                source_text=request.input_text,
                max_claims=min(request.max_claims, self.settings.max_claims_per_request),
            )
        )
        stage_trace.append(extraction_trace)

        claim_results: list[ClaimAnalysisResult] = []
        loops_used = min(1, self.settings.max_pipeline_loops)

        for claim in extraction_output.claims:
            claim_result, claim_traces = self._analyze_claim(claim, request)
            claim_results.append(claim_result)
            stage_trace.extend(claim_traces)

        summary = AnalysisSummary(
            total_claims=len(claim_results),
            supported=sum(1 for item in claim_results if item.label == VerdictLabel.SUPPORTED),
            refuted=sum(1 for item in claim_results if item.label == VerdictLabel.REFUTED),
            not_enough_info=sum(
                1 for item in claim_results if item.label == VerdictLabel.NOT_ENOUGH_INFO
            ),
        )

        metadata = PipelineMetadata(
            run_id=run_id,
            dataset_name=request.dataset_name,
            provider_name=self.provider.name,
            provider_configured=self.provider.configured,
            max_stage_retries=self.settings.max_stage_retries,
            max_pipeline_loops=self.settings.max_pipeline_loops,
            loops_used=loops_used,
            total_stage_fallbacks=sum(
                1 for trace in stage_trace if trace.status == StageStatus.FALLBACK
            ),
        )

        response = AnalyzeResponse(
            run_id=run_id,
            dataset_name=request.dataset_name,
            input_text=request.input_text,
            claims=claim_results,
            stage_trace=stage_trace,
            summary=summary,
            pipeline_metadata=metadata,
        )
        write_experiment_output(self.settings.fact_check_eval_root, response)
        return response

    def _analyze_claim(
        self,
        claim,
        request: AnalyzeRequest,
    ) -> tuple[ClaimAnalysisResult, list[StageTrace]]:
        claim_traces: list[StageTrace] = []

        query_output, query_trace = self.query_generator.run(
            QueryGenerationInput(claim=claim)
        )
        claim_traces.append(query_trace)

        retrieval_output, retrieval_trace = self.evidence_retriever.run(
            EvidenceRetrieverInput(
                claim=claim,
                query=query_output,
                top_k=request.top_k_evidence,
            )
        )
        claim_traces.append(retrieval_trace)

        rerank_output, rerank_trace = self.evidence_reranker.run(
            EvidenceRerankerInput(
                claim=claim,
                evidence_items=retrieval_output.items,
                top_k=request.top_k_evidence,
            )
        )
        claim_traces.append(rerank_trace)

        verification_output, verification_trace = self.verifier.run(
            VerificationInput(
                claim=claim,
                evidence_items=rerank_output.items,
            )
        )
        claim_traces.append(verification_trace)

        corrected_rewrite = None
        if request.include_rewrite:
            corrected_rewrite, correction_trace = self.correction_rewriter.run(
                CorrectionRewriteInput(
                    claim=claim,
                    verification=verification_output,
                    evidence_items=rerank_output.items,
                )
            )
            claim_traces.append(correction_trace)

        result = ClaimAnalysisResult(
            claim_id=claim.claim_id,
            claim_text=claim.text,
            query_text=query_output.query_text,
            alternative_queries=query_output.alternative_queries,
            label=verification_output.label,
            confidence=verification_output.confidence,
            rationale=verification_output.rationale,
            justification=verification_output.rationale,
            evidence=rerank_output.items,
            corrected_rewrite=corrected_rewrite,
            stage_trace=claim_traces,
        )
        return result, claim_traces
