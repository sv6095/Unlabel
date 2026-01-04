from dotenv import load_dotenv
import os

load_dotenv()

ENV = os.getenv("ENV", "development")
DEBUG = os.getenv("DEBUG", "false").lower() == "true"
SECRET_KEY = os.getenv("SECRET_KEY", "default-insecure-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./food_intelligence.db")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
