from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import VerdictLabel


class RetrievalQueryOutput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    query_text: str = Field(min_length=3)
    disambiguation_keywords: list[str] = Field(default_factory=list)


class ClaimClassificationOutput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    label: VerdictLabel
    confidence: float = Field(ge=0.0, le=1.0)
    justification: str = Field(min_length=3)
    citation_ids: list[str] = Field(default_factory=list)


class RewriteOutput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    text: str = Field(min_length=3)
    citation_ids: list[str] = Field(default_factory=list)
    edit_summary: str = Field(min_length=3)
