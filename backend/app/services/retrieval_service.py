from app.core.settings import Settings
from app.retrieval.corpus import load_corpus
from app.retrieval.faiss_index import FaissDocumentIndex
from app.schemas.evidence import EvidenceBundle, EvidenceItem
from app.utils.text import lexical_overlap


class RetrievalService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def retrieve(self, claim_id: str, query: str, top_k: int) -> EvidenceBundle:
        dense_items = self._search_dense(query, top_k)
        if dense_items:
            return EvidenceBundle(claim_id=claim_id, query=query, items=dense_items)

        lexical_items = self._search_lexical(query, top_k)
        return EvidenceBundle(claim_id=claim_id, query=query, items=lexical_items)

    def _search_dense(self, query: str, top_k: int) -> list[EvidenceItem]:
        try:
            index = FaissDocumentIndex(
                self.settings.retrieval_index_path,
                self.settings.sentence_transformer_model,
            )
            return index.search(query, top_k)
        except RuntimeError:
            return []

    def _search_lexical(self, query: str, top_k: int) -> list[EvidenceItem]:
        scored_items: list[EvidenceItem] = []
        for document in load_corpus(self.settings.corpus_path):
            score = lexical_overlap(query, document.text)
            if score <= 0:
                continue
            scored_items.append(
                EvidenceItem(
                    evidence_id=document.document_id,
                    title=document.title,
                    snippet=document.text[:320],
                    url=document.url,
                    published_at=document.published_at,
                    score=score,
                    stance_hint=document.stance_hint,
                )
            )
        scored_items.sort(key=lambda item: item.score, reverse=True)
        return scored_items[:top_k]
