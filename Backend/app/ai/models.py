from sqlalchemy import Column, Integer, String, DateTime, JSON
from app.db.database import Base
from datetime import datetime

class AnalysisHistory(Base):
    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True) # Storing email or ID from auth token
    input_type = Column(String) # 'text' or 'image'
    input_content = Column(String) # The text or filename
    title = Column(String, nullable=True) # User-defined title
    summary = Column(String) # Brief summary for the list view
    full_result = Column(JSON) # Complete analysis JSON
    created_at = Column(DateTime, default=datetime.utcnow)
