from fastapi import FastAPI, Depends
from app.auth.dependencies import get_current_user
from app.auth.router import router as auth_router
from app.profile.router import router as profile_router
from app.ai.router import router as ai_router
from app.food.router import router as food_router

app = FastAPI(
    title="AI-Native Food Intelligence Backend",
    swagger_ui_parameters={"persistAuthorization": True}
)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all. In production, specify ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(profile_router, prefix="/api")
app.include_router(ai_router, prefix="/api")
app.include_router(food_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
