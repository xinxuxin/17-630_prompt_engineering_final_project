from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


class VerdictLabel(StrEnum):
    SUPPORTED = "supported"
    REFUTED = "refuted"
    NOT_ENOUGH_INFO = "not_enough_info"


class StageStatus(StrEnum):
    SUCCESS = "success"
    FALLBACK = "fallback"


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class SourceSpan(StrictModel):
    start: int = Field(ge=0)
    end: int = Field(ge=0)


class Citation(StrictModel):
    evidence_id: str
    title: str
    url: str | None = None


class StageTrace(StrictModel):
    stage: str
    status: StageStatus
    detail: str
    duration_ms: int = Field(ge=0)
    retries: int = Field(default=0, ge=0)
    claim_id: str | None = None
