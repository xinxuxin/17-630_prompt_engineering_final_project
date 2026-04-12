from __future__ import annotations

from pathlib import Path

from app.schemas.evidence import EvidenceItem
from app.utils.text import lexical_overlap
from retrieval.chunking import ChunkingConfig, EvidenceChunk, chunk_documents, load_documents_from_directory
from retrieval.index_store import IndexStore


class LocalEvidenceRetriever:
    def __init__(
        self,
        *,
        corpus_dir: Path,
        chunk_manifest_path: Path,
        index_path: Path,
        model_name: str,
        chunking_config: ChunkingConfig,
    ) -> None:
        self.corpus_dir = corpus_dir
        self.index_store = IndexStore(index_path=index_path, chunk_manifest_path=chunk_manifest_path)
        self.model_name = model_name
        self.chunking_config = chunking_config

    def retrieve(self, query_text: str, top_k: int) -> tuple[list[EvidenceItem], str]:
        dense_items = self._retrieve_dense(query_text, top_k)
        if dense_items:
            return dense_items, "dense"
        return self._retrieve_lexical(query_text, top_k), "lexical_fallback"

    def load_demo_chunks(self) -> list[EvidenceChunk]:
        chunks = self.index_store.load_chunk_manifest()
        if chunks:
            return chunks
        documents = load_documents_from_directory(self.corpus_dir)
        return chunk_documents(documents, self.chunking_config)

    def _retrieve_dense(self, query_text: str, top_k: int) -> list[EvidenceItem]:
        if not self.index_store.has_dense_index():
            return []

        try:
            import faiss
        except ImportError:
            return []

        from app.retrieval.embedder import SentenceTransformerEmbedder

        chunks = self.index_store.load_index_chunks()
        if not chunks:
            return []

        query_embedding = SentenceTransformerEmbedder(self.model_name).encode([query_text])
        index = faiss.read_index(str(self.index_store.index_path))
        scores, indices = index.search(query_embedding, top_k)

        results: list[EvidenceItem] = []
        for score, chunk_idx in zip(scores[0], indices[0], strict=False):
            if chunk_idx < 0 or chunk_idx >= len(chunks):
                continue
            results.append(_chunk_to_evidence_item(chunks[chunk_idx], float(score), float(score)))
        return results

    def _retrieve_lexical(self, query_text: str, top_k: int) -> list[EvidenceItem]:
        chunks = self.load_demo_chunks()
        scored: list[EvidenceItem] = []
        for chunk in chunks:
            score = lexical_overlap(query_text, chunk.text)
            if score <= 0:
                continue
            scored.append(_chunk_to_evidence_item(chunk, score, score))
        scored.sort(key=lambda item: item.retrieval_score, reverse=True)
        return scored[:top_k]


def _chunk_to_evidence_item(
    chunk: EvidenceChunk,
    retrieval_score: float,
    score: float,
) -> EvidenceItem:
    return EvidenceItem(
        evidence_id=chunk.chunk_id,
        chunk_id=chunk.chunk_id,
        source_document_id=chunk.document_id,
        title=chunk.title,
        snippet=chunk.text,
        url=chunk.url,
        published_at=chunk.published_at,
        source_path=chunk.source_path,
        source_type=chunk.source_type,
        score=score,
        retrieval_score=retrieval_score,
        stance_hint=chunk.stance_hint,
    )
