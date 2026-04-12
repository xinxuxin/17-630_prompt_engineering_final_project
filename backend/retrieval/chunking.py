from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any


@dataclass(slots=True)
class EvidenceDocument:
    document_id: str
    title: str
    text: str
    url: str | None = None
    published_at: str | None = None
    source_path: str | None = None
    source_type: str = "json"
    stance_hint: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class EvidenceChunk:
    chunk_id: str
    document_id: str
    title: str
    text: str
    position: int
    start_word: int
    end_word: int
    url: str | None = None
    published_at: str | None = None
    source_path: str | None = None
    source_type: str = "json"
    stance_hint: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_json(self) -> str:
        return json.dumps(asdict(self), ensure_ascii=True)


@dataclass(slots=True)
class ChunkingConfig:
    chunk_size_words: int = 110
    chunk_overlap_words: int = 25
    min_chunk_words: int = 25


def load_documents_from_directory(corpus_dir: Path) -> list[EvidenceDocument]:
    documents: list[EvidenceDocument] = []
    if not corpus_dir.exists():
        return documents

    for path in sorted(corpus_dir.rglob("*")):
        if path.is_dir():
            continue
        suffix = path.suffix.lower()
        if suffix == ".json":
            payload = json.loads(path.read_text(encoding="utf-8"))
            documents.append(
                EvidenceDocument(
                    document_id=payload["document_id"],
                    title=payload["title"],
                    text=payload["text"],
                    url=payload.get("url"),
                    published_at=payload.get("published_at"),
                    source_path=str(path),
                    source_type="json",
                    stance_hint=payload.get("stance_hint"),
                    metadata=payload.get("metadata", {}),
                )
            )
        elif suffix in {".txt", ".md"}:
            text = path.read_text(encoding="utf-8").strip()
            if not text:
                continue
            documents.append(
                EvidenceDocument(
                    document_id=path.stem,
                    title=path.stem.replace("_", " ").title(),
                    text=text,
                    source_path=str(path),
                    source_type=suffix.lstrip("."),
                )
            )
    return documents


def chunk_document(document: EvidenceDocument, config: ChunkingConfig) -> list[EvidenceChunk]:
    words = document.text.split()
    if not words:
        return []

    chunks: list[EvidenceChunk] = []
    start = 0
    step = max(1, config.chunk_size_words - config.chunk_overlap_words)

    while start < len(words):
        end = min(len(words), start + config.chunk_size_words)
        chunk_words = words[start:end]
        if len(chunk_words) < config.min_chunk_words and chunks:
            break
        position = len(chunks)
        chunks.append(
            EvidenceChunk(
                chunk_id=f"{document.document_id}::chunk_{position:03d}",
                document_id=document.document_id,
                title=document.title,
                text=" ".join(chunk_words),
                position=position,
                start_word=start,
                end_word=end,
                url=document.url,
                published_at=document.published_at,
                source_path=document.source_path,
                source_type=document.source_type,
                stance_hint=document.stance_hint,
                metadata=document.metadata.copy(),
            )
        )
        if end >= len(words):
            break
        start += step

    return chunks


def chunk_documents(
    documents: list[EvidenceDocument],
    config: ChunkingConfig,
) -> list[EvidenceChunk]:
    chunks: list[EvidenceChunk] = []
    for document in documents:
        chunks.extend(chunk_document(document, config))
    return chunks
