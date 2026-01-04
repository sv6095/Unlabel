from google import genai
from google.genai import types
import json
from config.settings import GEMINI_API_KEY
from app.ai.schemas import AnalysisResponse, TradeOff

class FoodReasoningEngine:
    def __init__(self):
        if not GEMINI_API_KEY:
            print("WARNING: GEMINI_API_KEY not set. AI features will fail.")
            self.client = None
            return
            
        self.client = genai.Client(api_key=GEMINI_API_KEY)
        # Using gemini-2.5-flash as per available models
        self.model_id = 'gemini-2.5-flash'

    async def _generate_analysis(self, user_content: list) -> AnalysisResponse:
        """Shared helper to run generation on text or [text, image] inputs."""
        if not self.client:
            raise ValueError("AI Service not configured (Missing API Key)")

        system_instruction = """
        You are a calm, futuristic Food Intelligence Co-pilot. 
        Your goal is NOT to tell users what to eat, but to help them understand trade-offs and make informed decisions.
        
        Analyze the provided input (Ingredients list text OR Image of a food label).
        
        **CORE BEHAVIORS:**
        1. **Infer Intent:** If the user asks "Is this healthy?", do not just say "Yes/No". Ask yourself: "Healthy for whom? For energy? For weight loss?" and provide a nuanced answer.
        2. **Reasoning-First:** Don't just list ingredients. Explain the *mechanism*. (e.g., instead of "Contains Caffeine", say "Caffeine blocks adenosine receptors, providing temporary alertness but potentially disrupting sleep if taken late").
        3. **Honest Uncertainty:** If the image is blurry or text is ambiguous, YOU MUST SAY SO. Do not hallucinate. Use the 'uncertainty_note' field.

        **Output Format:** JSON only, strictly adhering to this schema:
        {
            "insight": "One clear, human-readable sentence summarizing the essence. (e.g. 'This is a high-energy fuel source, best for pre-workout, but likely to cause a crash if sedentary.')",
            "detailed_reasoning": "A paragraph explaining *why* this matters. Connect ingredients to physiological effects. Discuss processing levels and density.",
            "trade_offs": {
                "pros": ["Benefit 1 (e.g. 'Dense micronutrients')", "Benefit 2"],
                "cons": ["Drawback 1 (e.g. 'High glycemic index')", "Drawback 2"]
            },
            "uncertainty_note": "Mention if anything is vague, blurry, or if this is not medical advice."
        }
        
        **Tone & Safety Guidelines:**
        - **Objective but Opinionated on Quality:** It's okay to say "This is highly processed."
        - **Regulatory Framing:** If an ingredient is approved but controversial, provide context.
        - **No Medical Advice:** Always frame health implications as "associations" or "general knowledge".
        - If the input is NOT food (e.g., a person, a car), return an insight saying "This doesn't look like a food label."
        """

        try:
            response = await self.client.aio.models.generate_content(
                model=self.model_id,
                contents=user_content,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json"
                )
            )
            
            # With response_mime_type="application/json", text should be valid JSON
            clean_text = response.text.strip()
            data = json.loads(clean_text)
            
            return AnalysisResponse(
                insight=data.get("insight", "Analysis complete."),
                detailed_reasoning=data.get("detailed_reasoning", "No details provided."),
                trade_offs=TradeOff(
                    pros=data.get("trade_offs", {}).get("pros", []),
                    cons=data.get("trade_offs", {}).get("cons", [])
                ),
                uncertainty_note=data.get("uncertainty_note")
            )
        except Exception as e:
            print(f"AI Error: {e}")
            return AnalysisResponse(
                insight="Could not analyze at this moment.",
                detailed_reasoning=f"The reasoning engine encountered an error: {str(e)}",
                trade_offs=TradeOff(pros=[], cons=[]),
                uncertainty_note="System Error"
            )

    async def analyze_text(self, text: str) -> AnalysisResponse:
        prompt = f"""
        Ingredients to analyze:
        "{text}"
        """
        return await self._generate_analysis([prompt])

    async def analyze_image(self, image_data: bytes, mime_type: str) -> AnalysisResponse:
        image_part = types.Part.from_bytes(data=image_data, mime_type=mime_type)
        prompt = "Analyze this food label image."
        # Input to generate_content can be a list of parts/strings
        return await self._generate_analysis([prompt, image_part])

ai_service = FoodReasoningEngine()
