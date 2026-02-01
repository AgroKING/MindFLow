from transformers import pipeline
from functools import lru_cache
import logging

logger = logging.getLogger(__name__)


class SentimentAnalyzer:
    def __init__(self):
        self._model = None

    @property
    def model(self):
        if self._model is None:
            logger.info("Loading sentiment model...")
            self._model = pipeline(
                "sentiment-analysis",
                model="cardiffnlp/twitter-roberta-base-sentiment-latest",
                device=-1,  # CPU, use 0 for GPU
            )
        return self._model

    async def analyze(self, text: str) -> dict:
        """
        Analyze sentiment of text.
        
        Returns:
            {
                "score": float,  # -1.0 to 1.0
                "label": str,    # "positive", "negative", "neutral"
                "confidence": float
            }
        """
        if not text or len(text.strip()) < 3:
            return {"score": 0.0, "label": "neutral", "confidence": 0.0}

        try:
            # Truncate for model limits
            truncated = text[:512]
            result = self.model(truncated)[0]

            # Map labels to scores
            label = result["label"].lower()
            confidence = result["score"]

            if label == "positive":
                score = confidence
            elif label == "negative":
                score = -confidence
            else:
                score = 0.0

            return {
                "score": round(score, 4),
                "label": label,
                "confidence": round(confidence, 4),
            }

        except Exception as e:
            logger.error(f"Sentiment analysis error: {e}")
            return {"score": 0.0, "label": "neutral", "confidence": 0.0}

    async def detect_emotion(self, text: str) -> str | None:
        """Detect primary emotion from text."""
        # Simple keyword-based for now - can enhance with emotion model
        text_lower = text.lower()
        
        emotion_keywords = {
            "joy": ["happy", "excited", "grateful", "wonderful", "amazing", "great"],
            "sadness": ["sad", "depressed", "lonely", "hopeless", "empty", "crying"],
            "anxiety": ["anxious", "worried", "nervous", "panic", "scared", "fear"],
            "anger": ["angry", "frustrated", "annoyed", "furious", "irritated"],
            "calm": ["peaceful", "relaxed", "calm", "content", "serene"],
        }

        scores = {}
        for emotion, keywords in emotion_keywords.items():
            score = sum(1 for kw in keywords if kw in text_lower)
            if score > 0:
                scores[emotion] = score

        if scores:
            return max(scores, key=scores.get)
        return None


# Singleton
sentiment_analyzer = SentimentAnalyzer()
