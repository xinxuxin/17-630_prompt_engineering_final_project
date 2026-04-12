import json
from dataclasses import dataclass
from pathlib import Path


@dataclass(slots=True)
class CorpusDocument:
    document_id: str
    title: str
    text: str
    url: str | None = None
    published_at: str | None = None
    stance_hint: str | None = None


def load_corpus(path: Path) -> list[CorpusDocument]:
    if not path.exists():
        return []

    documents: list[CorpusDocument] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        item = json.loads(line)
        documents.append(
            CorpusDocument(
                document_id=item["document_id"],
                title=item["title"],
                text=item["text"],
                url=item.get("url"),
                published_at=item.get("published_at"),
                stance_hint=item.get("stance_hint"),
            )
        )
    return documents
