from fastapi import APIRouter, HTTPException, File, UploadFile
from app.ai.schemas import (
    IngredientAnalysisRequest, 
    AnalysisResponse,
    DecisionRequest,
    DecisionEngineResponse
)
from app.ai.service import ai_service
from app.ai.coordinator import coordinator

router = APIRouter(prefix="/analyze", tags=["AI Analysis"])

@router.post("/text", response_model=AnalysisResponse)
async def analyze_ingredients_text(request: IngredientAnalysisRequest):
    """Legacy endpoint for backward compatibility"""
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
        
    result = await ai_service.analyze_text(request.text)
    return result

@router.post("/image", response_model=AnalysisResponse)
async def analyze_ingredients_image(file: UploadFile = File(...)):
    """Legacy endpoint for backward compatibility"""
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

@router.post("/decision", response_model=DecisionEngineResponse)
async def analyze_decision(request: DecisionRequest):
    """
    New transparent decision engine endpoint.
    Uses multi-agent coordination:
    1. Intent Classification
    2. Ingredient Interpretation (structured signals)
    3. Rule-based Decision Engine
    4. Consumer Explanation
    """
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    try:
        result = await coordinator.process(request)
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Decision engine error: {str(e)}")

@router.post("/decision/image", response_model=DecisionEngineResponse)
async def analyze_decision_image(file: UploadFile = File(...)):
    """
    Decision engine endpoint for image input.
    Extracts ingredient/nutrition info from image, then processes through decision engine.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        import google.generativeai as genai
        import PIL.Image
        import io
        from config.settings import GEMINI_API_KEY
        
        if not GEMINI_API_KEY:
            raise HTTPException(status_code=500, detail="AI service not configured")
        
        # Read image
        contents = await file.read()
        image = PIL.Image.open(io.BytesIO(contents))
        
        # Extract text from image using Gemini Vision
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        extraction_prompt = """Extract all ingredient and nutrition information from this food label image.

Return ONLY the following information in a clear, structured format:
1. Ingredients list (if visible)
2. Nutrition facts (if visible) - include all values like calories, carbs, sugars, protein, fiber, fat, etc.
3. Any other relevant product information

Format your response as:
INGREDIENTS:
[list all ingredients]

NUTRITION FACTS:
[all nutrition information]

If any information is unclear or missing, note that in your response."""
        
        import asyncio
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: model.generate_content([extraction_prompt, image])
        )
        
        extracted_text = response.text.strip()
        
        # Create DecisionRequest with extracted text
        decision_request = DecisionRequest(text=extracted_text)
        
        # Process through decision engine
        result = await coordinator.process(decision_request)
        return result
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Decision engine image processing error: {str(e)}")