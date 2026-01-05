from fastapi import APIRouter, HTTPException, File, UploadFile, Depends
from sqlalchemy.orm import Session
from app.ai.schemas import IngredientAnalysisRequest, AnalysisResponse, HistoryItem, HistoryDetail, HistoryUpdate
from app.ai.service import ai_service
from app.ai.models import AnalysisHistory
from app.auth.dependencies import get_current_user
from app.db.database import SessionLocal, engine
from app.db.models import User
from typing import List

# Ensure table exists (only create if they don't exist)
try:
    AnalysisHistory.metadata.create_all(bind=engine, checkfirst=True)
except Exception as e:
    print(f"AI table initialization warning: {e}")

router = APIRouter(prefix="/analyze", tags=["AI Analysis"])

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/history", response_model=List[HistoryItem])
async def get_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    history = db.query(AnalysisHistory).filter(AnalysisHistory.user_id == current_user.id).order_by(AnalysisHistory.created_at.desc()).all()
    return [
        HistoryItem(
            id=str(h.id),
            date=h.created_at.strftime("%Y-%m-%d"),
            time=h.created_at.strftime("%I:%M %p"),
            title=h.title,
            preview=h.summary,
            variant="neutral"
        ) for h in history
    ]

@router.get("/history/{item_id}", response_model=HistoryDetail)
async def get_history_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(AnalysisHistory).filter(
        AnalysisHistory.id == item_id,
        AnalysisHistory.user_id == current_user.id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    return HistoryDetail(
        id=str(item.id),
        date=item.created_at.strftime("%Y-%m-%d"),
        time=item.created_at.strftime("%I:%M %p"),
        title=item.title,
        preview=item.summary,
        variant="neutral",
        full_result=item.full_result,
        input_type=item.input_type,
        input_content=item.input_content
    )

@router.patch("/history/{item_id}", response_model=HistoryItem)
async def update_history_item(
    item_id: int,
    update: HistoryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(AnalysisHistory).filter(
        AnalysisHistory.id == item_id,
        AnalysisHistory.user_id == current_user.id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    item.title = update.title
    db.commit()
    db.refresh(item)
    
    return HistoryItem(
        id=str(item.id),
        date=item.created_at.strftime("%Y-%m-%d"),
        time=item.created_at.strftime("%I:%M %p"),
        title=item.title,
        preview=item.summary,
        variant="neutral"
    )

@router.post("/text", response_model=AnalysisResponse)
async def analyze_ingredients_text(
    request: IngredientAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
        
    result = await ai_service.analyze_text(request.text)
    
    # Save to history
    history_entry = AnalysisHistory(
        user_id=current_user.id,
        input_type="text",
        input_content=request.text[:500], # Trucate if necessary
        summary=result.insight,
        full_result=result.dict()
    )
    db.add(history_entry)
    db.commit()
    
    return result

@router.post("/image", response_model=AnalysisResponse)
async def analyze_ingredients_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
        
    try:
        contents = await file.read()
        result = await ai_service.analyze_image(contents, file.content_type)
        
        # Save to history
        history_entry = AnalysisHistory(
            user_id=current_user.id,
            input_type="image",
            input_content=f"Image upload: {file.filename}",
            summary=result.insight,
            full_result=result.dict()
        )
        db.add(history_entry)
        db.commit()
        
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
