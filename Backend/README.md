# Backend - Food Intelligence Co-pilot

## 🧠 Overview
The backend serves as the **Reasoning Engine**. It does not just look up ingredients in a database; it uses a Large Language Model (Gemini 2.5 Flash) to *infer* implications, health trade-offs, and context from food labels. Additionally, it integrates with the **Open Food Facts API** to provide global food product search capabilities.

## 🛠️ Technology Stack
*   **Framework:** FastAPI (Python)
*   **AI Model:** Google Gemini 2.5 Flash (`google-generativeai`)
*   **Database:** PostgreSQL (via SQLAlchemy)
*   **Authentication:** JWT (JSON Web Tokens) with Argon2 hashing.
*   **External APIs:** Open Food Facts API for global product database access

## 📂 Architecture
*   `app/ai`: Contains the `FoodReasoningEngine` and `AnalysisHistory` models.
    *   `service.py`: Encapsulates interaction with Gemini API.
    *   `router.py`: Exposes `/analyze/text`, `/analyze/image`, and `/analyze/history`.
*   `app/auth`: Handles User registration, login, and token generation.
*   `app/db`: Database connection and session management.
*   `app/food`: **NEW** - Open Food Facts integration
    *   `router.py`: Exposes `/food/search` endpoint for product search.

## 🤖 The Reasoning Engine (`FoodReasoningEngine`)
Located in `app/ai/service.py`, this class:
1.  Constructs a "Persona" system prompt (Calm, futuristic, regulatory-aware).
2.  Handles Multimodal input (Images + Text).
3.  Enforces a strict JSON Schema for the output to ensure the Frontend can parse it reliably.
4.  Implements error handling to return "Uncertainty" notes rather than crashing.

## 🌍 Open Food Facts Integration
The `/api/food/search` endpoint provides:
*   **Global Product Search:** Access to 3+ million products from the Open Food Facts database
*   **Case-Insensitive Search:** Flexible search that handles partial product names
*   **Rich Product Data:** Returns product names, brands, images, nutrition grades, and ingredients
*   **Error Handling:** Graceful handling of "no results" scenarios with user-friendly messages

### Example Usage:
```bash
GET /api/food/search?query=ketchup
```

## 💾 Data Persistence
*   **AnalysisHistory:** Every successful analysis is saved to the `analysis_history` table using a relational model, linked to the `User`.
*   **Privacy:** Data is scoped to the authenticated user.

## 🚀 Running Locally
```bash
# Create virtual environment
python -m venv venv
# Activate venv (Windows: venv\Scripts\activate)
pip install -r requirements.txt

# Run Server
uvicorn app.main:app --reload
```
API Documentation available at: `http://127.0.0.1:8000/docs`
