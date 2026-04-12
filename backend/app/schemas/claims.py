from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import SourceSpan


class AtomicClaim(BaseModel):
    model_config = ConfigDict(extra="forbid")

    claim_id: str
    text: str = Field(min_length=3)
    source_span: SourceSpan | None = None
    notes: str | None = None


class ClaimExtractionOutput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    claims: list[AtomicClaim] = Field(default_factory=list)
