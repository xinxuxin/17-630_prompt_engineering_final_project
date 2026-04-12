from functools import lru_cache
from pathlib import Path

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = Field(
        default="Multi-Stage Prompt-Agent Automated Fact Checking System",
        validation_alias="APP_NAME",
    )
    app_env: str = Field(default="development", validation_alias="APP_ENV")
    app_log_level: str = Field(default="INFO", validation_alias="APP_LOG_LEVEL")
    api_v1_prefix: str = Field(default="/api/v1", validation_alias="APP_API_V1_PREFIX")
    frontend_origin: str = Field(
        default="http://localhost:3000",
        validation_alias="APP_FRONTEND_ORIGIN",
    )

    provider: str = Field(default="mock", validation_alias="FACT_CHECK_PROVIDER")
    openai_model: str = Field(
        default="gpt-4.1-mini",
        validation_alias="FACT_CHECK_OPENAI_MODEL",
    )
    openai_base_url: str | None = Field(
        default=None,
        validation_alias="FACT_CHECK_OPENAI_BASE_URL",
    )
    openai_api_key: str | None = Field(
        default=None,
        validation_alias="FACT_CHECK_OPENAI_API_KEY",
    )

    fact_check_data_root: Path | None = Field(
        default=None,
        validation_alias="FACT_CHECK_DATA_ROOT",
    )
    corpus_dir: Path | None = Field(
        default=None,
        validation_alias="FACT_CHECK_CORPUS_DIR",
    )
    fact_check_eval_root: Path | None = Field(
        default=None,
        validation_alias="FACT_CHECK_EVAL_ROOT",
    )
    corpus_path: Path | None = Field(
        default=None,
        validation_alias="FACT_CHECK_CORPUS_PATH",
    )
    retrieval_index_path: Path | None = Field(
        default=None,
        validation_alias="FACT_CHECK_RETRIEVAL_INDEX_PATH",
    )
    sentence_transformer_model: str = Field(
        default="all-MiniLM-L6-v2",
        validation_alias="FACT_CHECK_SENTENCE_TRANSFORMER_MODEL",
    )
    chunk_size_words: int = Field(
        default=110,
        ge=40,
        le=400,
        validation_alias="FACT_CHECK_CHUNK_SIZE_WORDS",
    )
    chunk_overlap_words: int = Field(
        default=25,
        ge=0,
        le=120,
        validation_alias="FACT_CHECK_CHUNK_OVERLAP_WORDS",
    )
    retrieval_candidate_pool: int = Field(
        default=8,
        ge=2,
        le=20,
        validation_alias="FACT_CHECK_RETRIEVAL_CANDIDATE_POOL",
    )

    max_claims_per_request: int = Field(
        default=12,
        ge=1,
        le=24,
        validation_alias="FACT_CHECK_MAX_CLAIMS_PER_REQUEST",
    )
    max_stage_retries: int = Field(
        default=2,
        ge=0,
        le=5,
        validation_alias="FACT_CHECK_MAX_STAGE_RETRIES",
    )
    max_pipeline_loops: int = Field(
        default=1,
        ge=1,
        le=3,
        validation_alias="FACT_CHECK_MAX_PIPELINE_LOOPS",
    )
    conservative_nei_threshold: float = Field(
        default=0.48,
        ge=0.0,
        le=1.0,
        validation_alias="FACT_CHECK_CONSERVATIVE_NEI_THRESHOLD",
    )

    model_config = SettingsConfigDict(env_file=".env", extra="ignore", populate_by_name=True)

    @model_validator(mode="after")
    def hydrate_paths(self) -> "Settings":
        backend_root = Path(__file__).resolve().parents[2]
        repo_root = backend_root.parent

        if self.fact_check_data_root is None:
            self.fact_check_data_root = repo_root / "data"
        if self.corpus_dir is None:
            self.corpus_dir = self.fact_check_data_root / "corpus" / "demo"
        if self.fact_check_eval_root is None:
            self.fact_check_eval_root = repo_root / "eval"
        if self.corpus_path is None:
            self.corpus_path = self.fact_check_data_root / "processed" / "evidence_chunks.jsonl"
        if self.retrieval_index_path is None:
            self.retrieval_index_path = self.fact_check_data_root / "corpus" / "faiss.index"

        return self


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
