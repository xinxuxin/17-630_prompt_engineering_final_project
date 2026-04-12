from __future__ import annotations

from abc import ABC, abstractmethod

from app.schemas.evidence import EvidenceItem
from app.utils.text import lexical_overlap


class BaseReranker(ABC):
    @abstractmethod
    def rerank(self, *, claim_text: str, evidence_items: list[EvidenceItem], top_k: int) -> list[EvidenceItem]:
        raise NotImplementedError


class HeuristicReranker(BaseReranker):
    def rerank(self, *, claim_text: str, evidence_items: list[EvidenceItem], top_k: int) -> list[EvidenceItem]:
        rescored: list[EvidenceItem] = []
        for item in evidence_items:
            lexical_score = lexical_overlap(claim_text, item.snippet)
            number_bonus = 0.08 if _shares_number(claim_text, item.snippet) else 0.0
            stance_bonus = 0.06 if item.stance_hint in {"supports", "refutes"} else 0.0
            rerank_score = min(
                1.0,
                (item.retrieval_score * 0.5) + (lexical_score * 0.4) + number_bonus + stance_bonus,
            )
            rescored.append(
                item.model_copy(update={"rerank_score": rerank_score, "score": rerank_score})
            )
        rescored.sort(key=lambda item: (item.rerank_score or 0.0, item.retrieval_score), reverse=True)
        return rescored[:top_k]


def _shares_number(a: str, b: str) -> bool:
    numbers_a = {token for token in a.split() if any(char.isdigit() for char in token)}
    numbers_b = {token for token in b.split() if any(char.isdigit() for char in token)}
    return bool(numbers_a.intersection(numbers_b))
