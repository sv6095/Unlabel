"""
Product Comparison Service
Compares two products side-by-side
"""
import asyncio
from app.ai.coordinator import coordinator
from app.ai.schemas import DecisionRequest
from app.ai.comparison_schemas import ComparisonRequest, ComparisonResponse, ComparisonInsight
import google.generativeai as genai
from app.ai.key_manager import key_manager
import json


class ComparisonService:
    """
    Service for comparing two food products.
    Uses the decision engine for individual analysis,
    then synthesizes a comparison.
    """
    
    def __init__(self):
        if not key_manager:
            self.use_key_manager = False
            return
        self.use_key_manager = True
        print("✅ ComparisonService initialized with key_manager (multi-key fallback enabled)")
    
    async def compare_products(self, request: ComparisonRequest) -> ComparisonResponse:
        """
        Compare two products side-by-side.
        
        Steps:
        1. Analyze both products in parallel using decision engine
        2. Generate comparison insight using AI
        3. Synthesize recommendation
        """
        
        # Set default names if not provided
        product_a_name = request.product_a_name or "Product A"
        product_b_name = request.product_b_name or "Product B"
        
        # Step 1: Analyze both products in PARALLEL
        print(f"🔍 Comparing: {product_a_name} vs {product_b_name}")
        
        async def analyze_a():
            req = DecisionRequest(text=request.product_a_text)
            return await coordinator.process(req)
        
        async def analyze_b():
            req = DecisionRequest(text=request.product_b_text)
            return await coordinator.process(req)
        
        # Run analyses in parallel for speed
        analysis_a, analysis_b = await asyncio.gather(analyze_a(), analyze_b())
        
        # Step 2: Generate comparison insight
        comparison_insight = await self._generate_comparison_insight(
            product_a_name, product_b_name,
            analysis_a, analysis_b
        )
        
        # Step 3: Generate recommendation
        recommendation = await self._generate_recommendation(
            product_a_name, product_b_name,
            comparison_insight, analysis_a, analysis_b
        )
        
        return ComparisonResponse(
            product_a_name=product_a_name,
            product_b_name=product_b_name,
            product_a_analysis=analysis_a,
            product_b_analysis=analysis_b,
            comparison_insight=comparison_insight,
            recommendation=recommendation
        )
    
    async def _generate_comparison_insight(
        self, 
        name_a: str, 
        name_b: str,
        analysis_a,
        analysis_b
    ) -> ComparisonInsight:
        """Generate high-level comparison insight using AI"""
        
        if not self.use_key_manager:
            # Fallback if AI not available
            return ComparisonInsight(
                winner="Similar",
                summary=f"{name_a} and {name_b} have similar profiles.",
                key_differences=["Unable to generate detailed comparison"]
            )
        
        prompt = f"""Compare these two food products based on their analyses.

PRODUCT A ({name_a}):
- Quick Insight: {analysis_a.quick_insight.summary}
- Key Signals: {', '.join(analysis_a.key_signals[:3])}
- Intent: {analysis_a.intent_classified}

PRODUCT B ({name_b}):
- Quick Insight: {analysis_b.quick_insight.summary}
- Key Signals: {', '.join(analysis_b.key_signals[:3])}
- Intent: {analysis_b.intent_classified}

Provide a comparison in JSON format:
{{
    "winner": "A" or "B" or "Similar" (which is better overall),
    "summary": "One clear sentence comparing them (max 20 words)",
    "key_differences": [
        "First key difference (max 15 words)",
        "Second key difference (max 15 words)",
        "Third key difference (max 15 words)"
    ]
}}

Focus on practical differences that matter to consumers.
Be honest if they're similar.
"""
        
        try:
            async def execute_comparison(model):
                loop = asyncio.get_event_loop()
                response = await loop.run_in_executor(
                    None,
                    lambda: model.generate_content(
                        prompt,
                        generation_config=genai.types.GenerationConfig(
                            response_mime_type="application/json",
                            temperature=0.4
                        )
                    )
                )
                return response
            
            response = await key_manager.execute_with_fallback(execute_comparison)
            
            data = json.loads(response.text.strip())
            return ComparisonInsight(**data)
            
        except Exception as e:
            print(f"Comparison insight generation error: {e}")
            # Fallback
            return ComparisonInsight(
                winner="Similar",
                summary=f"{name_a} and {name_b} have different characteristics.",
                key_differences=[
                    f"{name_a}: {analysis_a.key_signals[0] if analysis_a.key_signals else 'No data'}",
                    f"{name_b}: {analysis_b.key_signals[0] if analysis_b.key_signals else 'No data'}",
                    "See individual analyses for details"
                ]
            )
    
    async def _generate_recommendation(
        self,
        name_a: str,
        name_b: str,
        comparison: ComparisonInsight,
        analysis_a,
        analysis_b
    ) -> str:
        """Generate recommendation based on comparison"""
        
        if not self.use_key_manager:
            return f"Both products have distinct characteristics. Review the analyses to decide which fits your needs."
        
        prompt = f"""Based on this comparison, provide a clear, actionable recommendation.

COMPARISON WINNER: {comparison.winner}
SUMMARY: {comparison.summary}
KEY DIFFERENCES: {', '.join(comparison.key_differences)}

{name_a} EXPLANATION:
- Why it matters: {', '.join(analysis_a.explanation.why_this_matters[:2])}
- When it makes sense: {analysis_a.explanation.when_it_makes_sense}

{name_b} EXPLANATION:
- Why it matters: {', '.join(analysis_b.explanation.why_this_matters[:2])}
- When it makes sense: {analysis_b.explanation.when_it_makes_sense}

Provide a recommendation (2-3 sentences, max 50 words total) that:
1. States which is better and why
2. Mentions when the other might be preferable
3. Uses clear, consumer-friendly language

Return ONLY the recommendation text, no JSON.
"""
        
        try:
            async def execute_recommendation(model):
                loop = asyncio.get_event_loop()
                response = await loop.run_in_executor(
                    None,
                    lambda: model.generate_content(prompt)
                )
                return response
            
            response = await key_manager.execute_with_fallback(execute_recommendation)
            
            return response.text.strip()
            
        except Exception as e:
            print(f"Recommendation generation error: {e}")
            if comparison.winner == "A":
                return f"{name_a} appears to be the better choice overall. However, {name_b} may be preferable depending on your specific needs."
            elif comparison.winner == "B":
                return f"{name_b} appears to be the better choice overall. However, {name_a} may be preferable depending on your specific needs."
            else:
                return f"Both products are comparable. Choose based on your personal preferences and dietary goals."


# Singleton instance
comparison_service = ComparisonService()
