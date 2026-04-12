import json
from pathlib import Path
from typing import Any

from app.retrieval.corpus import CorpusDocument, load_corpus
from app.retrieval.embedder import SentenceTransformerEmbedder
from app.schemas.evidence import EvidenceItem


class FaissDocumentIndex:
    def __init__(self, index_path: Path, model_name: str) -> None:
        self.index_path = index_path
        self.metadata_path = index_path.with_suffix(".meta.json")
        self.model_name = model_name

    def build_from_jsonl(self, corpus_path: Path) -> int:
        try:
            import faiss
        except ImportError as exc:
            raise RuntimeError(
                "FAISS indexing requires installing backend[retrieval]."
            ) from exc

        documents = load_corpus(corpus_path)
        if not documents:
            raise RuntimeError(f"No corpus documents found at {corpus_path}.")

        embedder = SentenceTransformerEmbedder(self.model_name)
        embeddings = embedder.encode([document.text for document in documents])
        index = faiss.IndexFlatIP(embeddings.shape[1])
        index.add(embeddings)

        self.index_path.parent.mkdir(parents=True, exist_ok=True)
        faiss.write_index(index, str(self.index_path))
        self.metadata_path.write_text(
            json.dumps([document.__dict__ for document in documents], indent=2),
            encoding="utf-8",
        )
        return len(documents)

    def search(self, query: str, top_k: int) -> list[EvidenceItem]:
        try:
            import faiss
        except ImportError as exc:
            raise RuntimeError(
                "FAISS search requires installing backend[retrieval]."
            ) from exc

        if not self.index_path.exists() or not self.metadata_path.exists():
            return []

        metadata = json.loads(self.metadata_path.read_text(encoding="utf-8"))
        embedder = SentenceTransformerEmbedder(self.model_name)
        query_embedding = embedder.encode([query])
        index = faiss.read_index(str(self.index_path))
        scores, indices = index.search(query_embedding, top_k)

        items: list[EvidenceItem] = []
        for score, index_position in zip(scores[0], indices[0], strict=False):
            if index_position < 0 or index_position >= len(metadata):
                continue
            record = metadata[index_position]
            items.append(
                EvidenceItem(
                    evidence_id=record["document_id"],
                    title=record["title"],
                    snippet=record["text"][:320],
                    url=record.get("url"),
                    published_at=record.get("published_at"),
                    score=float(score),
                    retrieval_score=float(score),
                    stance_hint=record.get("stance_hint"),
                )
            )
        return items
