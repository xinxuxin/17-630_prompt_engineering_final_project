from pydantic import BaseModel, ConfigDict, Field


class EvidenceItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    evidence_id: str
    title: str
    snippet: str
    url: str | None = None
    published_at: str | None = None
    score: float = Field(default=0.0)
    stance_hint: str | None = None


class EvidenceBundle(BaseModel):
    model_config = ConfigDict(extra="forbid")

    claim_id: str
    query: str
    items: list[EvidenceItem] = Field(default_factory=list)
