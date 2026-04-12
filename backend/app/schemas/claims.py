from pydantic import Field

from app.schemas.common import SourceSpan, StrictModel


class AtomicClaim(StrictModel):
    claim_id: str
    text: str = Field(min_length=3)
    source_span: SourceSpan | None = None
    notes: str | None = None


class ClaimExtractionInput(StrictModel):
    source_text: str = Field(min_length=10)
    max_claims: int = Field(default=6, ge=1, le=24)


class ClaimExtractionOutput(StrictModel):
    claims: list[AtomicClaim] = Field(default_factory=list)


class QueryGenerationInput(StrictModel):
    claim: AtomicClaim
    max_keywords: int = Field(default=5, ge=1, le=8)


class QueryGenerationOutput(StrictModel):
    claim_id: str
    query_text: str = Field(min_length=3)
    alternative_queries: list[str] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)
