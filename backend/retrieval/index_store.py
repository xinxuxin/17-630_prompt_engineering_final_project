from __future__ import annotations

import json
from dataclasses import asdict
from pathlib import Path

from retrieval.chunking import EvidenceChunk


class IndexStore:
    def __init__(self, index_path: Path, chunk_manifest_path: Path) -> None:
        self.index_path = index_path
        self.chunk_manifest_path = chunk_manifest_path
        self.metadata_path = index_path.with_suffix(".meta.json")

    def write_chunk_manifest(self, chunks: list[EvidenceChunk]) -> Path:
        self.chunk_manifest_path.parent.mkdir(parents=True, exist_ok=True)
        self.chunk_manifest_path.write_text(
            "\n".join(chunk.to_json() for chunk in chunks) + ("\n" if chunks else ""),
            encoding="utf-8",
        )
        return self.chunk_manifest_path

    def load_chunk_manifest(self) -> list[EvidenceChunk]:
        if not self.chunk_manifest_path.exists():
            return []
        chunks: list[EvidenceChunk] = []
        for line in self.chunk_manifest_path.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            payload = json.loads(line)
            if "chunk_id" not in payload or "document_id" not in payload:
                continue
            chunks.append(EvidenceChunk(**payload))
        return chunks

    def build_dense_index(
        self,
        *,
        chunks: list[EvidenceChunk],
        model_name: str,
    ) -> Path:
        try:
            import faiss
        except ImportError as exc:
            raise RuntimeError("FAISS is not installed. Use backend[retrieval].") from exc

        from app.retrieval.embedder import SentenceTransformerEmbedder

        if not chunks:
            raise RuntimeError("Cannot build an index with zero chunks.")

        texts = [chunk.text for chunk in chunks]
        embeddings = SentenceTransformerEmbedder(model_name).encode(texts)
        index = faiss.IndexFlatIP(embeddings.shape[1])
        index.add(embeddings)

        self.index_path.parent.mkdir(parents=True, exist_ok=True)
        faiss.write_index(index, str(self.index_path))
        self.metadata_path.write_text(
            json.dumps([asdict(chunk) for chunk in chunks], indent=2),
            encoding="utf-8",
        )
        return self.index_path

    def has_dense_index(self) -> bool:
        return self.index_path.exists() and self.metadata_path.exists()

    def load_index_chunks(self) -> list[EvidenceChunk]:
        if self.metadata_path.exists():
            payload = json.loads(self.metadata_path.read_text(encoding="utf-8"))
            return [EvidenceChunk(**item) for item in payload]
        return self.load_chunk_manifest()
