import pytest
from pydantic import ValidationError

from app.schemas.claims import ClaimExtractionInput, QueryGenerationOutput


def test_claim_extraction_input_forbids_extra_fields() -> None:
    with pytest.raises(ValidationError):
        ClaimExtractionInput.model_validate(
            {
                "source_text": "This is a valid source sentence for testing.",
                "max_claims": 4,
                "unexpected": True,
            }
        )


def test_query_generation_output_enforces_required_fields() -> None:
    with pytest.raises(ValidationError):
        QueryGenerationOutput.model_validate(
            {
                "claim_id": "claim_001",
                "keywords": ["riverdale", "solar"],
            }
        )
