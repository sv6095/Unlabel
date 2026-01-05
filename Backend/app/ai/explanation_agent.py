"""
Consumer Explanation Agent
Explains pre-computed decisions clearly and calmly
"""
import google.generativeai as genai
import json
from config.settings import GEMINI_API_KEY
from app.ai.schemas import Decision, ConsumerExplanation, QuickInsight, StructuredIngredientAnalysis

class ExplanationAgent:
    def __init__(self):
        if not GEMINI_API_KEY:
            self.model = None
            return
        genai.configure(api_key=GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-2.5-flash')

    async def generate_quick_insight(
        self, 
        decision: Decision, 
        structured_analysis: StructuredIngredientAnalysis
    ) -> QuickInsight:
        """
        Generate a one-line summary for instant understanding.
        """
        if not self.model:
            return QuickInsight(
                summary=f"This product is rated '{decision.verdict}' based on its ingredient profile.",
                uncertainty_reason=None
            )

        system_prompt = """You are a food intelligence assistant.

Generate a ONE-SENTENCE summary that gives instant understanding.
Be clear, direct, and avoid jargon."""

        user_prompt = f"""Create a one-sentence summary for this decision:

Verdict: {decision.verdict}
Key Signals: {', '.join(decision.key_signals[:3])}
Processing Level: {structured_analysis.ingredient_summary.processing_level}
Sugar Dominant: {structured_analysis.food_properties.sugar_dominant}

Return JSON:
{{
  "summary": "One clear sentence (max 20 words)",
  "uncertainty_reason": "null or brief reason if information is incomplete"
}}"""

        try:
            import asyncio
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.model.generate_content(
                    [system_prompt, user_prompt],
                    generation_config=genai.types.GenerationConfig(
                        response_mime_type="application/json",
                        temperature=0.4
                    )
                )
            )
            
            data = json.loads(response.text.strip())
            return QuickInsight(**data)
        except Exception as e:
            print(f"Quick insight generation error: {e}")
            return QuickInsight(
                summary=f"This product is rated '{decision.verdict}'."
            )

    async def explain(self, decision: Decision) -> ConsumerExplanation:
        """
        Generate consumer-friendly explanation of the decision.
        """
        if not self.model:
            # Fallback explanation
            return ConsumerExplanation(
                verdict=decision.verdict,
                why_this_matters=["Processing level affects nutrient availability", "Ingredient composition impacts energy release"],
                when_it_makes_sense="Consider your individual needs and context",
                what_to_know="This is informational, not medical advice"
            )

        system_prompt = """You are a consumer food explanation assistant.

Your job is to explain a pre-computed decision clearly and calmly.

You MUST:
- Use simple language
- Avoid fear-based tone
- Avoid medical claims
- Stay under 120 words"""

        user_prompt = f"""Using the decision below, explain the result to a general consumer.

DECISION:
Verdict: {decision.verdict}
Key Signals:
{chr(10).join(f'- {signal}' for signal in decision.key_signals)}

OUTPUT FORMAT (STRICT JSON):

{{
  "verdict": "{decision.verdict}",
  "why_this_matters": ["bullet 1", "bullet 2", "bullet 3"],
  "when_it_makes_sense": "One sentence",
  "what_to_know": "One sentence"
}}

Do not add extra information."""

        try:
            import asyncio
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.model.generate_content(
                    [system_prompt, user_prompt],
                    generation_config=genai.types.GenerationConfig(
                        response_mime_type="application/json",
                        temperature=0.5  # Slightly higher for natural language
                    )
                )
            )
            
            data = json.loads(response.text.strip())
            
            # Ensure verdict matches
            data["verdict"] = decision.verdict
            
            # Limit why_this_matters to 3 items
            if "why_this_matters" in data and isinstance(data["why_this_matters"], list):
                data["why_this_matters"] = data["why_this_matters"][:3]
            
            return ConsumerExplanation(**data)
        except Exception as e:
            print(f"Explanation generation error: {e}")
            # Fallback
            return ConsumerExplanation(
                verdict=decision.verdict,
                why_this_matters=decision.key_signals[:3] if len(decision.key_signals) >= 3 else decision.key_signals,
                when_it_makes_sense="Consider your individual dietary needs and preferences",
                what_to_know="This analysis is informational and not medical advice"
            )

explanation_agent = ExplanationAgent()

