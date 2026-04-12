import re
from collections.abc import Iterable


SENTENCE_SPLIT_RE = re.compile(r"(?<=[.!?])\s+")
TOKEN_RE = re.compile(r"[a-z0-9]+")
CLAIMED_SPLIT_RE = re.compile(r"^(?P<prefix>.*?\bclaimed\b\s+)(?P<left>.+?)\s+and\s+(?P<right>.+)$", re.IGNORECASE)


def split_into_sentences(text: str) -> list[tuple[str, int, int]]:
    cleaned = " ".join(text.strip().split())
    if not cleaned:
        return []

    sentences: list[tuple[str, int, int]] = []
    cursor = 0
    for part in SENTENCE_SPLIT_RE.split(cleaned):
        stripped = part.strip()
        if not stripped:
            continue
        start = cleaned.find(stripped, cursor)
        end = start + len(stripped)
        sentences.append((stripped, start, end))
        cursor = end
    return sentences


def normalize_tokens(text: str) -> set[str]:
    return set(TOKEN_RE.findall(text.lower()))


def lexical_overlap(a: str, b: str) -> float:
    tokens_a = normalize_tokens(a)
    tokens_b = normalize_tokens(b)
    if not tokens_a or not tokens_b:
        return 0.0
    overlap = tokens_a.intersection(tokens_b)
    return len(overlap) / max(len(tokens_a), 1)


def take_top_nonempty(values: Iterable[str], limit: int) -> list[str]:
    results: list[str] = []
    for value in values:
        if value.strip():
            results.append(value.strip())
        if len(results) >= limit:
            break
    return results


def split_compound_claim(sentence: str) -> list[str]:
    match = CLAIMED_SPLIT_RE.match(sentence.strip())
    if not match:
        return [sentence.strip()]
    prefix = match.group("prefix").strip()
    left = match.group("left").strip().rstrip(".")
    right = match.group("right").strip()
    return [f"{prefix} {left}".strip(), f"{prefix} {right}".strip()]
