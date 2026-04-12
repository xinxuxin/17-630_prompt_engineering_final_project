from pathlib import Path

from retrieval.chunking import EvidenceDocument, load_documents_from_directory


def load_demo_corpus(corpus_dir: Path) -> list[EvidenceDocument]:
    return load_documents_from_directory(corpus_dir)
