from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import Citation, StageTrace, VerdictLabel
from app.schemas.evidence import EvidenceItem


class CorrectedRewrite(BaseModel):
    model_config = ConfigDict(extra="forbid")

    text: str = Field(min_length=3)
    citations: list[Citation] = Field(default_factory=list)
    edit_summary: str


class ClaimAssessment(BaseModel):
    model_config = ConfigDict(extra="forbid")

    claim_id: str
    claim_text: str
    label: VerdictLabel
    confidence: float = Field(ge=0.0, le=1.0)
    justification: str
    evidence: list[EvidenceItem] = Field(default_factory=list)
    corrected_rewrite: CorrectedRewrite | None = None


class FactCheckRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    input_text: str = Field(min_length=10)
    dataset_name: str = "custom"
    include_rewrite: bool = True
    max_claims: int = Field(default=6, ge=1, le=12)
    top_k_evidence: int = Field(default=4, ge=1, le=8)


class FactCheckSummary(BaseModel):
    model_config = ConfigDict(extra="forbid")

    total_claims: int
    supported: int
    refuted: int
    not_enough_info: int


class FactCheckResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    run_id: str
    dataset_name: str
    input_text: str
    claims: list[ClaimAssessment]
    stage_trace: list[StageTrace]
    summary: FactCheckSummary
