from app.core.settings import get_settings
from app.retrieval.faiss_index import FaissDocumentIndex


def main() -> None:
    settings = get_settings()
    index = FaissDocumentIndex(
        settings.retrieval_index_path,
        settings.sentence_transformer_model,
    )
    count = index.build_from_jsonl(settings.corpus_path)
    print(
        f"Built FAISS index at {settings.retrieval_index_path} "
        f"from {count} documents."
    )


if __name__ == "__main__":
    main()
