import google.generativeai as genai
import json
from app.ai.key_manager import key_manager
from app.ai.schemas import AnalysisResponse, TradeOff

class FoodReasoningEngine:
    def __init__(self):
        # Use key_manager for automatic API key fallback
        if not key_manager:
            print("WARNING: Key manager not initialized. AI features will fail.")
            self.use_key_manager = False
            return
        
        self.use_key_manager = True
        print("✅ FoodReasoningEngine initialized with key_manager (multi-key fallback enabled)")

    async def _generate_analysis(self, prompt: str, image_data: bytes = None, mime_type: str = None) -> AnalysisResponse:
        """Shared helper to run generation on text or [text, image] inputs."""
        if not self.use_key_manager:
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
            import asyncio
            
            # Prepare content
            if image_data:
                import PIL.Image
                import io
                image = PIL.Image.open(io.BytesIO(image_data))
                contents = [system_instruction, prompt, image]
            else:
                contents = [system_instruction, prompt]
            
            # Define the function to execute with key fallback
            async def execute_analysis(model):
                """Execute the analysis with a specific model instance"""
                loop = asyncio.get_event_loop()
                response = await loop.run_in_executor(
                    None,
                    lambda: model.generate_content(
                        contents,
                        generation_config=genai.types.GenerationConfig(
                            response_mime_type="application/json"
                        )
                    )
                )
                return response
            
            # Use key_manager with automatic fallback
            response = await key_manager.execute_with_fallback(execute_analysis)
            
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
            print(f"AI Error (all keys failed): {e}")
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
        return await self._generate_analysis(prompt)

    async def analyze_image(self, image_data: bytes, mime_type: str) -> AnalysisResponse:
        prompt = "Analyze this food label image."
        return await self._generate_analysis(prompt, image_data, mime_type)

ai_service = FoodReasoningEngine()
