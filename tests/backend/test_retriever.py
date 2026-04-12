from pathlib import Path

from retrieval.chunking import ChunkingConfig
from retrieval.retriever import LocalEvidenceRetriever


def test_retriever_returns_relevant_demo_chunk(tmp_path: Path) -> None:
    repo_root = Path(__file__).resolve().parents[2]
    retriever = LocalEvidenceRetriever(
        corpus_dir=repo_root / "data" / "corpus" / "demo",
        chunk_manifest_path=tmp_path / "chunks.jsonl",
        index_path=tmp_path / "faiss.index",
        model_name="all-MiniLM-L6-v2",
        chunking_config=ChunkingConfig(chunk_size_words=40, chunk_overlap_words=10),
    )

    items, strategy = retriever.retrieve("state funding for riverdale solar expansion", top_k=3)

    assert strategy == "lexical_fallback"
    assert items
    assert items[0].source_document_id == "doc_riverdale_grant"
    assert items[0].chunk_id is not None
