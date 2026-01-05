from pydantic import BaseModel
from typing import List, Optional, Literal

# Legacy schemas (kept for backward compatibility)
class IngredientAnalysisRequest(BaseModel):
    text: str

class TradeOff(BaseModel):
    pros: List[str]
    cons: List[str]

class AnalysisResponse(BaseModel):
    insight: str
    detailed_reasoning: str
    trade_offs: TradeOff
    uncertainty_note: Optional[str] = None

# New Decision Engine Schemas
class IngredientSummary(BaseModel):
    primary_components: List[str]
    added_sugars_present: bool
    sweetener_type: Literal["none", "natural", "added", "mixed"]
    fiber_level: Literal["none", "low", "moderate", "high"]
    protein_level: Literal["none", "low", "moderate", "high"]
    fat_level: Literal["none", "low", "moderate", "high"]
    processing_level: Literal["low", "moderate", "high"]
    ultra_processed_markers: List[str]
    ingredient_count: int

class FoodProperties(BaseModel):
    sugar_dominant: bool
    fiber_protein_support: Literal["none", "weak", "moderate", "strong"]
    energy_release_pattern: Literal["rapid", "mixed", "slow"]
    satiety_support: Literal["low", "moderate", "high"]
    formulation_complexity: Literal["simple", "moderate", "complex"]

class ConfidenceNotes(BaseModel):
    data_completeness: Literal["high", "medium", "low"]
    ambiguity_flags: List[str]

class StructuredIngredientAnalysis(BaseModel):
    ingredient_summary: IngredientSummary
    food_properties: FoodProperties
    confidence_notes: ConfidenceNotes

class DecisionRequest(BaseModel):
    text: str
    user_intent: Optional[Literal["quick_yes_no", "comparison", "risk_check", "curiosity"]] = None
    include_nutrition: Optional[str] = None  # Optional nutrition info

class Decision(BaseModel):
    verdict: Literal["Daily", "Occasional", "Limit Frequent Use"]
    key_signals: List[str]

class ConsumerExplanation(BaseModel):
    verdict: str
    why_this_matters: List[str]  # Max 3 bullet points
    when_it_makes_sense: str
    what_to_know: str

class IngredientTranslation(BaseModel):
    """Simple explanation of complex ingredients"""
    term: str
    simple_explanation: str
    category: str  # e.g., "preservative", "sweetener", "emulsifier"

class QuickInsight(BaseModel):
    """One-line summary for instant understanding"""
    summary: str  # One clear sentence
    uncertainty_reason: Optional[str] = None

class DecisionEngineResponse(BaseModel):
    # Instant understanding (show first)
    quick_insight: QuickInsight
    
    # Consumer-facing (primary)
    verdict: str  # "Daily", "Occasional", or "Limit Frequent Use"
    explanation: ConsumerExplanation
    
    # Supporting information
    intent_classified: Literal["quick_yes_no", "comparison", "risk_check", "curiosity"]
    key_signals: List[str]  # Top signals that influenced the decision
    
    # Ingredient translation (explain complex terms)
    ingredient_translations: List[IngredientTranslation] = []
    
    # Uncertainty flags
    uncertainty_flags: List[str] = []
    
    # Technical details (optional, for transparency/debugging)
    structured_analysis: Optional[StructuredIngredientAnalysis] = None

