import google.genai as genai
from google.genai import types
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Mental health guardrails for system prompts
MENTAL_HEALTH_SYSTEM_PROMPT = """You are MindFlow, a caring and empathetic mental wellness companion.

CORE PRINCIPLES:
1. Always respond with empathy and understanding
2. NEVER diagnose mental health conditions - you are not a clinician
3. NEVER provide medication advice
4. If someone expresses thoughts of self-harm or suicide, immediately provide crisis resources
5. Encourage professional help when appropriate
6. Focus on evidence-based wellness techniques (breathing, grounding, mindfulness)
7. Be warm, supportive, and non-judgmental
8. Keep responses concise but caring

RESPONSE STYLE:
- Acknowledge feelings before offering suggestions
- Ask open-ended questions to understand better
- Offer actionable wellness techniques when appropriate
- Use a warm, conversational tone

SAFETY BOUNDARIES:
- If crisis indicators detected, prioritize safety resources over conversation
- Never encourage isolation or harmful behaviors
- Always validate the person's worth and importance
"""

CRISIS_ESCALATION_PROMPT = """IMPORTANT: The user may be in crisis. 
- Respond with immediate empathy and validation
- Gently offer crisis resources (988 Suicide & Crisis Lifeline in US)
- Ask if they are safe without being pushy
- DO NOT try to fix or minimize their feelings
- Prioritize connection and safety over advice"""


class GeminiClient:
    def __init__(self):
        try:
            if settings.gemini_api_key:
                self.client = genai.Client(api_key=settings.gemini_api_key)
            else:
                self.client = None
                logger.warning("Gemini API Key not found. AI features will be disabled.")
        except Exception as e:
            self.client = None
            logger.error(f"Failed to initialize Gemini client: {e}")
            
        self.model = "gemini-2.5-flash"  # or "gemini-2.5-pro" for better quality

    async def chat(
        self,
        messages: list[dict],
        system_prompt: str | None = None,
        is_crisis: bool = False,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> dict:
        """
        Send chat messages to Gemini and get response.
        
        Args:
            messages: List of {"role": "user"|"assistant", "content": str}
            system_prompt: Optional custom system prompt
            is_crisis: If True, adds crisis escalation instructions
            temperature: Response randomness (0-1)
            max_tokens: Maximum response length
            
        Returns:
            {
                "content": str,
                "tokens_used": int,
                "model": str,
                "suggestions": list[str] | None
            }
        """
        if not self.client:
            return {
                "content": "AI features are currently disabled (missing API key).",
                "tokens_used": 0,
                "model": "disabled",
                "suggestions": None,
            }

        try:
            # Build system instruction
            system = system_prompt or MENTAL_HEALTH_SYSTEM_PROMPT
            if is_crisis:
                system += "\n\n" + CRISIS_ESCALATION_PROMPT

            # Convert to Gemini format
            gemini_messages = []
            for msg in messages:
                role = "user" if msg["role"] == "user" else "model"
                gemini_messages.append(
                    types.Content(
                        role=role,
                        parts=[types.Part.from_text(text=msg["content"])]
                    )
                )

            # Create generation config
            config = types.GenerateContentConfig(
                system_instruction=system,
                temperature=temperature,
                max_output_tokens=max_tokens,
                safety_settings=[
                    types.SafetySetting(
                        category="HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold="BLOCK_ONLY_HIGH"
                    ),
                    types.SafetySetting(
                        category="HARM_CATEGORY_HARASSMENT",
                        threshold="BLOCK_ONLY_HIGH"
                    ),
                ]
            )

            # Generate response
            response = await self.client.aio.models.generate_content(
                model=self.model,
                contents=gemini_messages,
                config=config,
            )

            content = response.text
            tokens = response.usage_metadata.total_token_count if response.usage_metadata else 0

            # Extract suggested quick replies (if we can parse them from response)
            suggestions = self._extract_suggestions(content)

            return {
                "content": content,
                "tokens_used": tokens,
                "model": self.model,
                "suggestions": suggestions,
            }

        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            return {
                "content": self._fallback_response(is_crisis),
                "tokens_used": 0,
                "model": "fallback",
                "suggestions": None,
            }

    def _extract_suggestions(self, content: str) -> list[str] | None:
        """Extract any suggested quick replies from AI response."""
        # Simple heuristic - could be enhanced
        suggestions = []
        if "breathing" in content.lower():
            suggestions.append("Try breathing exercise")
        if "talk" in content.lower() or "feel" in content.lower():
            suggestions.append("Tell me more")
        if not suggestions:
            suggestions = ["I understand", "Continue"]
        return suggestions[:3]

    def _fallback_response(self, is_crisis: bool) -> str:
        if is_crisis:
            return (
                "I'm here for you. If you're in crisis, please reach out to "
                "the 988 Suicide & Crisis Lifeline by calling or texting 988. "
                "You matter, and help is available."
            )
        return (
            "I'm here to support you. Could you tell me a bit more about "
            "how you're feeling right now?"
        )


# Singleton instance
gemini_client = GeminiClient()
