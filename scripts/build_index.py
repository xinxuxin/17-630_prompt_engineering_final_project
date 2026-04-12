from __future__ import annotations

import argparse
from pathlib import Path

from app.core.settings import get_settings
from retrieval.chunking import ChunkingConfig, chunk_documents, load_documents_from_directory
from retrieval.index_store import IndexStore


def main() -> None:
    parser = argparse.ArgumentParser(description="Build a chunk manifest and FAISS index.")
    parser.add_argument("--corpus-dir", type=Path, default=None)
    parser.add_argument("--chunk-manifest", type=Path, default=None)
    parser.add_argument("--index-path", type=Path, default=None)
    parser.add_argument("--model-name", type=str, default=None)
    args = parser.parse_args()

    settings = get_settings()
    corpus_dir = args.corpus_dir or settings.corpus_dir
    chunk_manifest = args.chunk_manifest or settings.corpus_path
    index_path = args.index_path or settings.retrieval_index_path
    model_name = args.model_name or settings.sentence_transformer_model

    documents = load_documents_from_directory(corpus_dir)
    chunking_config = ChunkingConfig(
        chunk_size_words=settings.chunk_size_words,
        chunk_overlap_words=settings.chunk_overlap_words,
    )
    chunks = chunk_documents(documents, chunking_config)

    store = IndexStore(index_path=index_path, chunk_manifest_path=chunk_manifest)
    store.write_chunk_manifest(chunks)
    store.build_dense_index(chunks=chunks, model_name=model_name)

    print(f"Loaded {len(documents)} documents from {corpus_dir}")
    print(f"Wrote {len(chunks)} chunks to {chunk_manifest}")
    print(f"Built FAISS index at {index_path}")


if __name__ == "__main__":
    main()
