from app.core.settings import Settings
from app.schemas.claims import AtomicClaim, QueryGenerationOutput
from app.schemas.evidence import EvidenceItem, EvidenceRetrievalOutput
from retrieval.chunking import ChunkingConfig
from retrieval.retriever import LocalEvidenceRetriever


class RetrievalService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.retriever = LocalEvidenceRetriever(
            corpus_dir=settings.corpus_dir,
            chunk_manifest_path=settings.corpus_path,
            index_path=settings.retrieval_index_path,
            model_name=settings.sentence_transformer_model,
            chunking_config=ChunkingConfig(
                chunk_size_words=settings.chunk_size_words,
                chunk_overlap_words=settings.chunk_overlap_words,
            ),
        )

    def retrieve(
        self,
        claim: AtomicClaim,
        query: QueryGenerationOutput,
        top_k: int,
    ) -> EvidenceRetrievalOutput:
        items, strategy = self.retriever.retrieve(query.query_text, top_k)
        return EvidenceRetrievalOutput(
            claim_id=claim.claim_id,
            query_text=query.query_text,
            retrieval_strategy=strategy,
            items=items,
        )
