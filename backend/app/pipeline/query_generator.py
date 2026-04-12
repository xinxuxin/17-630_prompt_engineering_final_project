from app.pipeline.base import invoke_structured_generation, run_stage
from app.pipeline.prompts import query_generation_prompts
from app.providers.base import StructuredProvider
from app.schemas.claims import QueryGenerationInput, QueryGenerationOutput
from app.schemas.common import StageTrace
from app.utils.text import extract_keywords


class QueryGenerator:
    def __init__(self, provider: StructuredProvider, max_retries: int) -> None:
        self.provider = provider
        self.max_retries = max_retries

    def run(
        self,
        stage_input: QueryGenerationInput,
    ) -> tuple[QueryGenerationOutput, StageTrace]:
        claim_id = stage_input.claim.claim_id

        def primary() -> QueryGenerationOutput:
            if not self.provider.configured:
                raise RuntimeError("No live provider configured for query generation.")
            system_prompt, user_prompt = query_generation_prompts(stage_input.claim.text)
            return invoke_structured_generation(
                provider=self.provider,
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                response_model=QueryGenerationOutput,
                max_retries=self.max_retries,
                stage_name="query_generator",
                claim_id=claim_id,
            )

        def fallback() -> QueryGenerationOutput:
            keywords = extract_keywords(stage_input.claim.text, stage_input.max_keywords)
            query_text = " ".join([stage_input.claim.text, *keywords]).strip()
            alternative_queries = [" ".join(keywords)] if keywords else []
            return QueryGenerationOutput(
                claim_id=claim_id,
                query_text=query_text,
                alternative_queries=alternative_queries,
                keywords=keywords,
            )

        return run_stage(
            "query_generator",
            self.max_retries,
            primary,
            fallback,
            claim_id=claim_id,
        )
