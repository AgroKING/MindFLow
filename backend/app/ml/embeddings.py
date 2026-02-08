try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    SentenceTransformer = None

from functools import lru_cache
import numpy as np
import logging

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Generate text embeddings for semantic search."""

    def __init__(self):
        self._model = None
        self.dimension = 384  # all-MiniLM-L6-v2 output dimension

    @property
    def model(self):
        if self._model is None:
            if SentenceTransformer is None:
                logger.warning("sentence-transformers not installed. Embeddings will be zero vectors.")
                return None
            
            try:
                logger.info("Loading embedding model...")
                self._model = SentenceTransformer("all-MiniLM-L6-v2")
            except Exception as e:
                logger.error(f"Failed to load embedding model: {e}")
                return None
        return self._model

    async def generate(self, text: str) -> list[float]:
        """Generate embedding vector for text."""
        if not text or self.model is None:
            return [0.0] * self.dimension

        try:
            embedding = self.model.encode(text, convert_to_numpy=True)
            return embedding.tolist()
        except Exception as e:
            logger.error(f"Embedding generation error: {e}")
            return [0.0] * self.dimension

    async def generate_batch(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings for multiple texts."""
        if not texts or self.model is None:
            return [[0.0] * self.dimension for _ in texts]

        try:
            embeddings = self.model.encode(texts, convert_to_numpy=True)
            return embeddings.tolist()
        except Exception as e:
            logger.error(f"Batch embedding error: {e}")
            return [[0.0] * self.dimension for _ in texts]


# Singleton
embedding_service = EmbeddingService()
