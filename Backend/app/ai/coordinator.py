"""
Multi-Agent Coordinator
Orchestrates the decision engine workflow
"""
from app.ai.intent_classifier import intent_classifier
from app.ai.ingredient_interpreter import ingredient_interpreter
from app.ai.decision_engine import decision_engine
from app.ai.explanation_agent import explanation_agent
from app.ai.schemas import DecisionRequest, DecisionEngineResponse

class DecisionEngineCoordinator:
    """
    Coordinates the multi-agent decision engine system.
    Flow: Intent Classification -> Ingredient Interpretation -> Decision -> Explanation
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
        
        return DecisionEngineResponse(
            verdict=decision.verdict,
            explanation=explanation,
            intent_classified=intent,
            key_signals=decision.key_signals,
            structured_analysis=structured_analysis  # Include for transparency
        )

coordinator = DecisionEngineCoordinator()

