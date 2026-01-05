"""
Ingredient Translator Agent
Translates complex scientific/regulatory terms into simple explanations
"""
import google.generativeai as genai
import json
from config.settings import GEMINI_API_KEY
from app.ai.schemas import IngredientTranslation
from typing import List

class IngredientTranslator:
    def __init__(self):
        if not GEMINI_API_KEY:
            self.model = None
            return
        genai.configure(api_key=GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-2.5-flash')

    async def translate_ingredients(self, ingredient_text: str, max_translations: int = 5) -> List[IngredientTranslation]:
        """
        Identify complex ingredients and provide simple explanations.
        Focus on terms that consumers might not understand.
        """
        if not self.model:
            return []

        system_prompt = """You are an ingredient translation assistant.

Your job is to identify complex scientific or regulatory ingredient names
and explain them in simple, consumer-friendly language.

Focus on:
- Chemical-sounding names (e.g., "sodium benzoate", "xanthan gum")
- Regulatory terms (e.g., "artificial flavors", "preservatives")
- Technical terms that might confuse consumers

Do NOT translate:
- Common ingredients (e.g., "sugar", "salt", "water", "flour")
- Brand names
- Simple food names

For each complex ingredient, provide:
- The term as it appears
- A simple 1-sentence explanation
- A category (preservative, sweetener, emulsifier, color, flavor, etc.)"""

        user_prompt = f"""Analyze these ingredients and translate complex terms:

{ingredient_text}

Return JSON array with up to {max_translations} translations:
[
  {{
    "term": "exact ingredient name",
    "simple_explanation": "One clear sentence explaining what this is",
    "category": "preservative | sweetener | emulsifier | color | flavor | other"
  }}
]

Only include ingredients that need translation. Return empty array if none need translation."""

        try:
            import asyncio
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.model.generate_content(
                    [system_prompt, user_prompt],
                    generation_config=genai.types.GenerationConfig(
                        response_mime_type="application/json",
                        temperature=0.3
                    )
                )
            )
            
            data = json.loads(response.text.strip())
            
            # Handle both array and object responses
            if isinstance(data, list):
                translations = data
            elif isinstance(data, dict) and "translations" in data:
                translations = data["translations"]
            else:
                translations = []
            
            return [IngredientTranslation(**t) for t in translations[:max_translations]]
        except Exception as e:
            print(f"Ingredient translation error: {e}")
            return []

ingredient_translator = IngredientTranslator()

