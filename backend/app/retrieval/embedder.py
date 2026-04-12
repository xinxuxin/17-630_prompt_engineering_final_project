from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    import numpy as np


class SentenceTransformerEmbedder:
    def __init__(self, model_name: str) -> None:
        try:
            from sentence_transformers import SentenceTransformer
        except ImportError as exc:
            raise RuntimeError(
                "Dense retrieval requires installing backend[retrieval]."
            ) from exc

        self.model_name = model_name
        self._model = SentenceTransformer(model_name)

    def encode(self, texts: list[str]) -> "np.ndarray":
        return self._model.encode(
            texts,
            normalize_embeddings=True,
            convert_to_numpy=True,
        )
