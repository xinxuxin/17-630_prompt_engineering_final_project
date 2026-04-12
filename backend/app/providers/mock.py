from app.providers.base import StructuredProvider, T


class MockLLMProvider(StructuredProvider):
    name = "mock"
    configured = False

    def generate_structured(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        response_model: type[T],
        max_retries: int = 1,
    ) -> T:
        raise RuntimeError(
            "Mock provider is intentionally non-generative. "
            "The pipeline will fall back to deterministic heuristics."
        )
