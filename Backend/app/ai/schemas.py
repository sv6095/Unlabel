from pydantic import BaseModel
from typing import List, Optional

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

