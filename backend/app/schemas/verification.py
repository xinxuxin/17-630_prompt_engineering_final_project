from pydantic import Field

from app.schemas.claims import AtomicClaim
from app.schemas.common import StrictModel, VerdictLabel
from app.schemas.evidence import EvidenceItem


class VerificationInput(StrictModel):
    claim: AtomicClaim
    evidence_items: list[EvidenceItem] = Field(default_factory=list)


class VerificationOutput(StrictModel):
    label: VerdictLabel
    confidence: float = Field(ge=0.0, le=1.0)
    rationale: str = Field(min_length=3)
    citation_ids: list[str] = Field(default_factory=list)
    evidence_strength: float = Field(default=0.0, ge=0.0, le=1.0)
