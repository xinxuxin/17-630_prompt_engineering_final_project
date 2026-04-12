from pydantic import Field

from app.schemas.claims import AtomicClaim, QueryGenerationOutput
from app.schemas.common import StrictModel


class EvidenceItem(StrictModel):
    evidence_id: str
    chunk_id: str | None = None
    source_document_id: str | None = None
    title: str
    snippet: str
    url: str | None = None
    published_at: str | None = None
    source_path: str | None = None
    source_type: str | None = None
    score: float = Field(default=0.0, ge=0.0)
    retrieval_score: float = Field(default=0.0, ge=0.0)
    rerank_score: float | None = Field(default=None, ge=0.0)
    stance_hint: str | None = None


class EvidenceRetrieverInput(StrictModel):
    claim: AtomicClaim
    query: QueryGenerationOutput
    top_k: int = Field(default=4, ge=1, le=10)


class EvidenceRetrievalOutput(StrictModel):
    claim_id: str
    query_text: str
    retrieval_strategy: str
    items: list[EvidenceItem] = Field(default_factory=list)


class EvidenceRerankerInput(StrictModel):
    claim: AtomicClaim
    evidence_items: list[EvidenceItem] = Field(default_factory=list)
    top_k: int = Field(default=4, ge=1, le=10)


class EvidenceRerankerOutput(StrictModel):
    claim_id: str
    items: list[EvidenceItem] = Field(default_factory=list)
    selected_evidence_ids: list[str] = Field(default_factory=list)
    weak_evidence: bool = False
