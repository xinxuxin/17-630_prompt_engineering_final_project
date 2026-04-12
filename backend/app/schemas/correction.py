from pydantic import Field

from app.schemas.claims import AtomicClaim
from app.schemas.common import Citation, StrictModel
from app.schemas.evidence import EvidenceItem
from app.schemas.verification import VerificationOutput


class CorrectionRewriteInput(StrictModel):
    claim: AtomicClaim
    verification: VerificationOutput
    evidence_items: list[EvidenceItem] = Field(default_factory=list)


class CorrectionRewriteOutput(StrictModel):
    text: str = Field(min_length=3)
    citations: list[Citation] = Field(default_factory=list)
    citation_ids: list[str] = Field(default_factory=list)
    edit_summary: str = Field(min_length=3)
