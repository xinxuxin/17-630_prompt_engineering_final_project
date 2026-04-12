from app.core.settings import Settings
from app.pipeline.base import run_stage
from app.retrieval.corpus import load_corpus
from app.retrieval.faiss_index import FaissDocumentIndex
from app.schemas.common import StageTrace
from app.schemas.evidence import (
    EvidenceItem,
    EvidenceRetrieverInput,
    EvidenceRetrievalOutput,
)
from app.utils.text import lexical_overlap


class EvidenceRetriever:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def run(
        self,
        stage_input: EvidenceRetrieverInput,
    ) -> tuple[EvidenceRetrievalOutput, StageTrace]:
        claim_id = stage_input.claim.claim_id

        def primary() -> EvidenceRetrievalOutput:
            dense_items = self._search_dense(stage_input.query.query_text, stage_input.top_k)
            if not dense_items:
                raise RuntimeError("Dense retrieval returned no candidates.")
            return EvidenceRetrievalOutput(
                claim_id=claim_id,
                query_text=stage_input.query.query_text,
                retrieval_strategy="dense",
                items=dense_items,
            )

        def fallback() -> EvidenceRetrievalOutput:
            lexical_items = self._search_lexical(stage_input.query.query_text, stage_input.top_k)
            return EvidenceRetrievalOutput(
                claim_id=claim_id,
                query_text=stage_input.query.query_text,
                retrieval_strategy="lexical_fallback",
                items=lexical_items,
            )

        return run_stage(
            "evidence_retriever",
            0,
            primary,
            fallback,
            claim_id=claim_id,
        )

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
                    retrieval_score=score,
                    stance_hint=document.stance_hint,
                )
            )
        scored_items.sort(key=lambda item: item.retrieval_score, reverse=True)
        return scored_items[:top_k]
