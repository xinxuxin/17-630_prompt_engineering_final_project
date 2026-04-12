from datetime import UTC, datetime

from pydantic import Field

from app.schemas.common import StageTrace, StrictModel, VerdictLabel
from app.schemas.correction import CorrectionRewriteOutput
from app.schemas.evidence import EvidenceItem


class ClaimAnalysisResult(StrictModel):
    claim_id: str
    claim_text: str
    query_text: str
    alternative_queries: list[str] = Field(default_factory=list)
    label: VerdictLabel
    confidence: float = Field(ge=0.0, le=1.0)
    rationale: str
    justification: str
    evidence: list[EvidenceItem] = Field(default_factory=list)
    corrected_rewrite: CorrectionRewriteOutput | None = None
    stage_trace: list[StageTrace] = Field(default_factory=list)


class AnalyzeRequest(StrictModel):
    input_text: str = Field(min_length=10)
    dataset_name: str = "custom"
    include_rewrite: bool = True
    max_claims: int = Field(default=6, ge=1, le=12)
    top_k_evidence: int = Field(default=4, ge=1, le=8)


class AnalysisSummary(StrictModel):
    total_claims: int
    supported: int
    refuted: int
    not_enough_info: int


class PipelineMetadata(StrictModel):
    run_id: str
    dataset_name: str
    provider_name: str
    provider_configured: bool
    generated_at: str = Field(
        default_factory=lambda: datetime.now(UTC).isoformat().replace("+00:00", "Z")
    )
    max_stage_retries: int = Field(ge=0)
    max_pipeline_loops: int = Field(ge=1)
    loops_used: int = Field(ge=1)
    total_stage_fallbacks: int = Field(ge=0)


class AnalyzeResponse(StrictModel):
    run_id: str
    dataset_name: str
    input_text: str
    claims: list[ClaimAnalysisResult]
    stage_trace: list[StageTrace]
    summary: AnalysisSummary
    pipeline_metadata: PipelineMetadata


FactCheckRequest = AnalyzeRequest
FactCheckResponse = AnalyzeResponse
FactCheckSummary = AnalysisSummary
ClaimAssessment = ClaimAnalysisResult
