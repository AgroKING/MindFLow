import re
from dataclasses import dataclass
from typing import Literal
import logging

logger = logging.getLogger(__name__)


@dataclass
class CrisisResult:
    is_crisis: bool
    severity: Literal["none", "low", "medium", "high", "critical"]
    indicators: list[str]
    confidence: float


class CrisisDetector:
    """
    Detects crisis indicators in text using keyword matching and patterns.
    This is a safety-critical component - err on the side of caution.
    """

    # High-priority patterns (immediate concern)
    CRITICAL_PATTERNS = [
        r"\b(kill|end|take)\s+(myself|my life|it all)\b",
        r"\bsuicid(e|al)\b",
        r"\bdon'?t\s+want\s+to\s+(live|be here|exist)\b",
        r"\b(want|going)\s+to\s+die\b",
        r"\bending\s+(it|my life|everything)\b",
        r"\bno\s+reason\s+to\s+live\b",
    ]

    # Medium-priority patterns (significant concern)
    HIGH_PATTERNS = [
        r"\bself[- ]?harm\b",
        r"\bhurt(ing)?\s+myself\b",
        r"\bcut(ting)?\s+myself\b",
        r"\bworthless\b",
        r"\beveryone.*better.*without\s+me\b",
        r"\bgive\s+up\b",
        r"\bno\s+hope\b",
    ]

    # Lower-priority patterns (worth monitoring)
    MEDIUM_PATTERNS = [
        r"\bhopeless\b",
        r"\bdesperate\b",
        r"\bcan'?t\s+(go on|take it|cope)\b",
        r"\btrapped\b",
        r"\bburdren\b",
        r"\bexhausted\b.*(living|life)\b",
    ]

    def __init__(self):
        self.critical_re = [re.compile(p, re.IGNORECASE) for p in self.CRITICAL_PATTERNS]
        self.high_re = [re.compile(p, re.IGNORECASE) for p in self.HIGH_PATTERNS]
        self.medium_re = [re.compile(p, re.IGNORECASE) for p in self.MEDIUM_PATTERNS]

    async def analyze(self, text: str) -> CrisisResult:
        """
        Analyze text for crisis indicators.
        
        Returns CrisisResult with severity level and matched indicators.
        """
        if not text:
            return CrisisResult(is_crisis=False, severity="none", indicators=[], confidence=0.0)

        indicators = []
        severity_scores = {"critical": 0, "high": 0, "medium": 0}

        # Check critical patterns
        for pattern in self.critical_re:
            if pattern.search(text):
                indicators.append(f"critical: {pattern.pattern}")
                severity_scores["critical"] += 1

        # Check high patterns
        for pattern in self.high_re:
            if pattern.search(text):
                indicators.append(f"high: {pattern.pattern}")
                severity_scores["high"] += 1

        # Check medium patterns
        for pattern in self.medium_re:
            if pattern.search(text):
                indicators.append(f"medium: {pattern.pattern}")
                severity_scores["medium"] += 1

        # Determine overall severity
        if severity_scores["critical"] > 0:
            severity = "critical"
            confidence = 0.95
        elif severity_scores["high"] > 0:
            severity = "high"
            confidence = 0.85
        elif severity_scores["medium"] >= 2:
            severity = "medium"
            confidence = 0.7
        elif severity_scores["medium"] == 1:
            severity = "low"
            confidence = 0.5
        else:
            severity = "none"
            confidence = 0.9

        is_crisis = severity in ["medium", "high", "critical"]

        if indicators:
            logger.warning(f"Crisis indicators detected: severity={severity}, count={len(indicators)}")

        return CrisisResult(
            is_crisis=is_crisis,
            severity=severity,
            indicators=indicators,
            confidence=confidence,
        )


# Singleton
crisis_detector = CrisisDetector()
