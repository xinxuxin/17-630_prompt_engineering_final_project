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
    ) -> object:
        raise RuntimeError(
            "Mock provider does not call an external LLM. "
            "Stages should fall back to deterministic logic."
        )
