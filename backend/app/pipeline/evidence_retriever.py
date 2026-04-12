from app.core.settings import Settings
from app.pipeline.base import run_stage
from app.schemas.common import StageTrace
from app.schemas.evidence import (
    EvidenceRetrieverInput,
    EvidenceRetrievalOutput,
)
from retrieval.chunking import ChunkingConfig
from retrieval.retriever import LocalEvidenceRetriever


class EvidenceRetriever:
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

    def run(
        self,
        stage_input: EvidenceRetrieverInput,
    ) -> tuple[EvidenceRetrievalOutput, StageTrace]:
        claim_id = stage_input.claim.claim_id

        def primary() -> EvidenceRetrievalOutput:
            items, strategy = self.retriever.retrieve(
                stage_input.query.query_text,
                top_k=stage_input.top_k,
            )
            if not items:
                raise RuntimeError("Retriever returned no candidates.")
            return EvidenceRetrievalOutput(
                claim_id=claim_id,
                query_text=stage_input.query.query_text,
                retrieval_strategy=strategy,
                items=items,
            )

        def fallback() -> EvidenceRetrievalOutput:
            lexical_items, _ = self.retriever.retrieve(
                stage_input.query.query_text,
                top_k=stage_input.top_k,
            )
            return EvidenceRetrievalOutput(
                claim_id=claim_id,
                query_text=stage_input.query.query_text,
                retrieval_strategy="lexical_fallback",
                items=lexical_items,
            )

        return run_stage(
            "evidence_retriever",
            0,
            primary,
            fallback,
            claim_id=claim_id,
        )
