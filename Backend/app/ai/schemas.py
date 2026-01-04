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

class HistoryItem(BaseModel):
    id: str
    date: str
    time: str
    title: Optional[str] = None
    preview: str
    variant: str = "neutral"

class HistoryDetail(HistoryItem):
    full_result: dict
    input_type: str
    input_content: str

class HistoryUpdate(BaseModel):
    title: str
