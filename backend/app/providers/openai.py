from app.providers.base import StructuredProvider, T


class OpenAICompatibleProvider(StructuredProvider):
    name = "openai-compatible"

    def __init__(self, api_key: str | None, model: str, base_url: str | None = None) -> None:
        self.api_key = api_key
        self.model = model
        self.base_url = base_url
        self.configured = bool(api_key)

    def generate_structured(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        response_model: type[T],
        max_retries: int = 1,
    ) -> object:
        if not self.api_key:
            raise RuntimeError("OpenAI API key is not configured.")

        try:
            from openai import OpenAI
        except ImportError as exc:
            raise RuntimeError(
                "OpenAI support requires installing backend[openai]."
            ) from exc

        client = OpenAI(api_key=self.api_key, base_url=self.base_url)
        response = client.responses.parse(
            model=self.model,
            input=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            text_format=response_model,
        )
        parsed = getattr(response, "output_parsed", None)
        if parsed is None:
            raise RuntimeError("OpenAI structured response did not parse correctly.")
        return parsed
