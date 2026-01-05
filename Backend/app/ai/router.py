from fastapi import APIRouter, HTTPException, File, UploadFile
from app.ai.schemas import IngredientAnalysisRequest, AnalysisResponse
from app.ai.service import ai_service

router = APIRouter(prefix="/analyze", tags=["AI Analysis"])

@router.post("/text", response_model=AnalysisResponse)
async def analyze_ingredients_text(request: IngredientAnalysisRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
        
    result = await ai_service.analyze_text(request.text)
    return result

@router.post("/image", response_model=AnalysisResponse)
async def analyze_ingredients_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
        
    try:
        contents = await file.read()
        result = await ai_service.analyze_image(contents, file.content_type)
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
