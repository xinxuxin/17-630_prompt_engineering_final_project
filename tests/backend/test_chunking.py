from pathlib import Path

from retrieval.chunking import ChunkingConfig, chunk_document, load_documents_from_directory


def test_chunking_preserves_metadata() -> None:
    corpus_dir = Path(__file__).resolve().parents[2] / "data" / "corpus" / "demo"
    documents = load_documents_from_directory(corpus_dir)
    riverdale_doc = next(document for document in documents if document.document_id == "doc_riverdale_energy")

    chunks = chunk_document(
        riverdale_doc,
        ChunkingConfig(chunk_size_words=18, chunk_overlap_words=4, min_chunk_words=8),
    )

    assert len(chunks) >= 2
    assert chunks[0].document_id == riverdale_doc.document_id
    assert chunks[0].title == riverdale_doc.title
    assert chunks[0].url == riverdale_doc.url
    assert chunks[0].source_path is not None
