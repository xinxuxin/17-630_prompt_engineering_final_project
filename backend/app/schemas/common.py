from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


class VerdictLabel(StrEnum):
    SUPPORTED = "supported"
    REFUTED = "refuted"
    NOT_ENOUGH_INFO = "not_enough_info"


class StageStatus(StrEnum):
    SUCCESS = "success"
    FALLBACK = "fallback"


class SourceSpan(BaseModel):
    model_config = ConfigDict(extra="forbid")

    start: int = Field(ge=0)
    end: int = Field(ge=0)


class Citation(BaseModel):
    model_config = ConfigDict(extra="forbid")

    evidence_id: str
    title: str
    url: str | None = None


class StageTrace(BaseModel):
    model_config = ConfigDict(extra="forbid")

    stage: str
    status: StageStatus
    detail: str
    duration_ms: int = Field(ge=0)
    retries: int = Field(default=0, ge=0)
