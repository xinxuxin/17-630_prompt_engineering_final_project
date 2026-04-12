from app.utils.text import split_compound_claim


def test_split_compound_claim_breaks_linked_assertions() -> None:
    sentence = (
        "The same announcement claimed the project received no state funding "
        "and made Riverdale the first carbon-neutral campus in Pennsylvania."
    )

    parts = split_compound_claim(sentence)

    assert len(parts) == 2
    assert "no state funding" in parts[0]
    assert "first carbon-neutral campus" in parts[1]
