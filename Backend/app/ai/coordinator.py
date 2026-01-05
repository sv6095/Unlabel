"""
Multi-Agent Coordinator
Orchestrates the decision engine workflow
"""
from app.ai.intent_classifier import intent_classifier
from app.ai.ingredient_interpreter import ingredient_interpreter
from app.ai.decision_engine import decision_engine
from app.ai.explanation_agent import explanation_agent
from app.ai.ingredient_translator import ingredient_translator
from app.ai.schemas import DecisionRequest, DecisionEngineResponse

class DecisionEngineCoordinator:
    """
    Coordinates the multi-agent decision engine system.
    Flow: Intent Classification -> Ingredient Interpretation -> Decision -> Explanation + Translation
    """
    
    async def process(self, request: DecisionRequest) -> DecisionEngineResponse:
        """
        Main orchestration method.
        """
        # Step 1: Classify intent (if not provided)
        if request.user_intent:
            intent = request.user_intent
        else:
            intent = await intent_classifier.classify(request.text)
        
        # Step 2: Interpret ingredients into structured signals
        structured_analysis = await ingredient_interpreter.interpret(
            ingredient_text=request.text,
            nutrition_info=request.include_nutrition
        )
        
        # Step 3: Apply rule-based decision engine
        decision = decision_engine.decide(structured_analysis)
        
        # Step 4: Generate consumer-friendly explanation
        explanation = await explanation_agent.explain(decision)
        
        # Step 5: Generate quick insight (one-line summary)
        quick_insight = await explanation_agent.generate_quick_insight(decision, structured_analysis)
        
        # Step 6: Translate complex ingredients (in parallel with explanation)
        ingredient_translations = await ingredient_translator.translate_ingredients(request.text)
        
        return DecisionEngineResponse(
            quick_insight=quick_insight,
            verdict=decision.verdict,
            explanation=explanation,
            intent_classified=intent,
            key_signals=decision.key_signals,
            ingredient_translations=ingredient_translations,
            uncertainty_flags=structured_analysis.confidence_notes.ambiguity_flags,
            structured_analysis=structured_analysis  # Include for transparency
        )

coordinator = DecisionEngineCoordinator()

