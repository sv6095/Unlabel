# Food Intelligence Co-pilot
*An AI-Native Consumer Health Experience*

## 🧠 The Core Question
**What does a consumer health experience look like when AI is the interface, not a feature?**

Generative AI enables systems that reason, infer intent, and reduce cognitive effort. This project reimagines how people make sense of food ingredients at the moment decisions matter.

## 🌟 What Is an "AI-Native" Experience?

Traditional apps are menu-driven, form-based, and data-heavy, requiring significant user effort.

**Our AI-Native System:**
*   **Intent-First:** Infers what determines value without explicit configuration.
*   **Reasoning-Driven:** Acts as a co-pilot, not a lookup tool.
*   **Dynamic Adaptation:** Reasons under uncertainty and adapts responses dynamically.
*   **Cognitive Offloading:** Does the cognitive work on the user's behalf.

## 🚀 Problem Statement
**The Consumer Health Information Gap**

Food labels are optimized for regulatory compliance, not human understanding. Usage of long ingredient lists, unfamiliar chemical names, and conflicting health guidance leaves consumers uncertain.

Existing solutions often:
*   Surface raw data instead of insight.
*   Require high-friction manual input.
*   Treat AI as an add-on.

**Our Solution:** An intelligent co-pilot that interprets ingredient information, translates complex context into human-level insight, and communicates uncertainty honestly.

## 🏗️ Architecture Overview

This project is built as a modern full-stack application connecting a fluid React frontend with a powerful Python/FastAPI backend powered by Google's Gemini 2.5 Flash model and integrated with Open Food Facts API.

### 📂 Project Structure
```
IIT Guwahti/
├── Frontend/          # React + TypeScript + Tailwind CSS
├── Backend/           # FastAPI + SQLAlchemy + Gemini AI
└── README.md          # This file
```

---

## 🎨 Frontend Architecture (`/Frontend`)

### Technology Stack
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS with custom Glassmorphism design system
- **Routing:** React Router DOM v6
- **State Management:** React Context API
- **HTTP Client:** Axios
- **UI Components:** Radix UI primitives + custom components
- **Icons:** Lucide React

### Directory Structure
```
Frontend/src/
├── components/
│   ├── layout/
│   │   └── Header.tsx              # Global navigation header
│   ├── sections/
│   │   └── HowItWorksOrbital.tsx   # Landing page sections
│   └── ui/
│       ├── AIInput.tsx             # AI chat input component
│       ├── FoodScanner.tsx         # Camera/image upload
│       ├── GlassCard.tsx           # Glassmorphic card component
│       ├── FloatingSeeds.tsx       # Animated background
│       └── [60+ Radix UI components]
├── contexts/
│   └── AuthContext.tsx             # Authentication state management
├── hooks/
│   └── [Custom React hooks]
├── lib/
│   ├── api.ts                      # Axios instance with interceptors
│   └── utils.ts                    # Utility functions
├── pages/
│   ├── Home.tsx                    # Landing page
│   ├── Copilot.tsx                 # AI chat interface for analysis
│   ├── FoodSearch.tsx              # Global food product search
│   ├── History.tsx                 # User analysis history
│   ├── Login.tsx                   # Authentication
│   ├── Register.tsx                # User registration
│   ├── Profile.tsx                 # User profile management
│   └── NotFound.tsx                # 404 page
├── App.tsx                         # Root component with routing
├── main.tsx                        # Application entry point
└── index.css                       # Global styles + design tokens
```

### Key Features
1. **Design System**
   - Custom Glassmorphism aesthetic with watermelon-inspired color palette
   - Dark theme with deep greens (primary) and soft reds (secondary)
   - Reusable glass card components with glow effects
   - Smooth animations and transitions

2. **Pages & Routes**
   - `/` - Landing page with hero and features
   - `/analyze` - AI-powered food label analysis (chat interface)
   - `/analyze/:id` - View specific analysis from history
   - `/food-search` - Search global food products database
   - `/history` - User's past analyses
   - `/login` & `/register` - Authentication
   - `/profile` - User profile management

3. **State Management**
   - AuthContext for global authentication state
   - JWT token storage and automatic request injection
   - Protected routes with authentication checks

4. **API Integration**
   - Centralized Axios instance (`lib/api.ts`)
   - Automatic JWT token attachment
   - Request/response interceptors
   - Error handling

---

## ⚙️ Backend Architecture (`/Backend`)

### Technology Stack
- **Framework:** FastAPI (Python)
- **Database:** SQLite with SQLAlchemy ORM
- **AI Model:** Google Gemini 2.5 Flash (`google-generativeai`)
- **Authentication:** JWT tokens with Argon2 password hashing
- **External APIs:** Open Food Facts API
- **Validation:** Pydantic models

### Directory Structure
```
Backend/app/
├── ai/
│   ├── models.py                   # AnalysisHistory SQLAlchemy model
│   ├── schemas.py                  # Pydantic request/response schemas
│   ├── service.py                  # FoodReasoningEngine (Gemini integration)
│   └── router.py                   # AI analysis endpoints
├── auth/
│   ├── models.py                   # User SQLAlchemy model
│   ├── schemas.py                  # Auth request/response schemas
│   ├── dependencies.py             # JWT verification & user extraction
│   ├── utils.py                    # Password hashing utilities
│   └── router.py                   # Auth endpoints (login, register)
├── food/
│   └── router.py                   # Open Food Facts API integration
├── profile/
│   ├── schemas.py                  # Profile update schemas
│   └── router.py                   # User profile endpoints
├── db/
│   ├── base.py                     # SQLAlchemy Base class
│   ├── database.py                 # Database connection & session
│   └── init_db.py                  # Database initialization
├── config/
│   └── [Configuration files]
└── main.py                         # FastAPI application entry point
```

### API Endpoints

#### Authentication (`/api/auth`)
- `POST /register` - Create new user account
- `POST /login` - Authenticate and receive JWT token

#### AI Analysis (`/api/analyze`)
- `POST /text` - Analyze ingredient text
- `POST /image` - Analyze food label image (multimodal)
- `GET /history` - Get user's analysis history
- `GET /history/{id}` - Get specific analysis details

#### Food Search (`/api/food`)
- `GET /search?query={term}` - Search Open Food Facts database
- `GET /product/{barcode}` - Get detailed product information

#### User Profile (`/api/profile`)
- `GET /me` - Get current user profile
- `PUT /me` - Update user profile

### Core Components

#### 1. **FoodReasoningEngine** (`ai/service.py`)
The heart of the AI system:
- Constructs persona-based system prompts
- Handles multimodal input (text + images)
- Enforces strict JSON schema for reliable parsing
- Implements uncertainty handling
- Returns structured analysis with:
  - Insight summary
  - Detailed reasoning
  - Trade-offs (pros/cons)
  - Uncertainty notes

#### 2. **Authentication System** (`auth/`)
- Argon2 password hashing for security
- JWT token generation and validation
- Protected route decorators
- User session management

#### 3. **Database Models**
- **User**: Authentication and profile data
- **AnalysisHistory**: Stores all AI analyses with full results
- Relationships: User ↔ AnalysisHistory (one-to-many)

#### 4. **Open Food Facts Integration** (`food/router.py`)
- Case-insensitive product search
- Partial name matching
- Comprehensive product data extraction:
  - Nutrition grades (Nutri-Score, Eco-Score)
  - Nutritional values
  - Ingredients and allergens
  - Manufacturing details
  - Product images

### Data Flow
```
User Input → Frontend → API Request → Backend Router
                                          ↓
                                    Authentication Check
                                          ↓
                                    Service Layer (AI/Database)
                                          ↓
                                    External APIs (Gemini/Open Food Facts)
                                          ↓
                                    Response Processing
                                          ↓
                                    JSON Response → Frontend → UI Update
```

### Security Features
- JWT-based authentication
- Argon2 password hashing
- Protected API endpoints
- CORS configuration
- Input validation with Pydantic
- SQL injection prevention (SQLAlchemy ORM)

### Database Schema
```sql
users
├── id (Primary Key)
├── email (Unique)
├── name
├── hashed_password
└── created_at

analysis_history
├── id (Primary Key)
├── user_id (Foreign Key → users.id)
├── input_type (text/image)
├── input_content
├── full_result (JSON)
├── title
└── created_at
```


## ⚡ Workflow
1.  **Conversational Input:** User chats with the AI or shows a label in a fluid message stream.
2.  **Inference:** The AI Reasoning Engine (Backend) processes the visual/textual data.
3.  **Analysis:** Ingredients are identified, and nutritional context is extracted.
4.  **Reasoning:** The model evaluates trade-offs (pros/cons), health implications, and uncertainties.
5.  **Output:** Structured insights are presented as interactive cards within the chat.
6.  **History:** All conversations and analyses are stored for the user to review later.

## 🛠️ Setup & Running

### Prerequisites
*   Node.js & npm
*   Python 3.10+
*   Google Gemini API Key

### Quick Start
1.  **Backend:**
    ```bash
    cd Backend
    pip install -r requirements.txt
    # Set GEMINI_API_KEY in .env
    uvicorn app.main:app --reload
    ```
2.  **Frontend:**
    ```bash
    cd Frontend
    npm install
    npm run dev
    ```

## 🎯 Key Features
*   **Multimodal Analysis:** Understands both text and images.
*   **Partial Data Resilience:** Can read partially obscured or blurry labels.
*   **Tone & Safety:** Avoids alarmist language; strictly distinct from medical advice.
*   **History Tracking:** Saves past analyses for longitudinal insights.
*   **Global Food Database:** Search and explore 3+ million products from Open Food Facts.

---

## 🔮 Future Scope

### 🎯 Enhanced AI Capabilities
1. **Personalized Health Recommendations**
   - User health profiles (allergies, dietary restrictions, health goals)
   - Personalized ingredient analysis based on individual needs
   - Custom alerts for specific ingredients or allergens
   - Dietary preference tracking (vegan, gluten-free, keto, etc.)

2. **Advanced AI Features**
   - Multi-language support for global ingredient labels
   - Voice input for hands-free analysis
   - Comparative analysis (compare multiple products side-by-side)
   - Trend analysis (track nutritional choices over time)
   - AI-powered meal planning based on analyzed products

3. **Enhanced Computer Vision**
   - Real-time barcode scanning with instant lookup
   - OCR improvements for better label reading accuracy
   - Batch scanning (analyze multiple products at once)
   - Augmented Reality overlay for in-store shopping

### 📊 Data & Analytics
1. **User Insights Dashboard**
   - Nutritional intake tracking over time
   - Visualization of eating patterns
   - Health score trends
   - Ingredient frequency analysis
   - Personalized health reports

2. **Community Features**
   - Product reviews and ratings
   - User-contributed product information
   - Community health insights
   - Social sharing of analyses
   - Expert nutritionist Q&A

3. **Advanced Search & Discovery**
   - Filter by nutrition grade, allergens, dietary preferences
   - Product recommendations based on history
   - "Find alternatives" feature for healthier options
   - Price comparison across retailers
   - Sustainability and eco-score filtering

### 🏪 E-commerce Integration
1. **Shopping Features**
   - Direct purchase links to online retailers
   - Shopping list creation from analyzed products
   - Price tracking and alerts
   - Subscription management for regular purchases
   - Integration with grocery delivery services

2. **Retailer Partnerships**
   - In-store navigation to healthier alternatives
   - Exclusive deals on recommended products
   - Loyalty program integration
   - Digital receipt analysis

### 🔬 Advanced Health Features
1. **Medical Integration**
   - Integration with health tracking apps (Apple Health, Google Fit)
   - Medication interaction warnings
   - Blood sugar impact predictions
   - Calorie and macro tracking
   - Integration with fitness goals

2. **Professional Tools**
   - Nutritionist dashboard for client management
   - Meal plan creation tools
   - Clinical trial data integration
   - Research paper citations for ingredients
   - Export reports for healthcare providers

### 🌍 Sustainability & Ethics
1. **Environmental Impact**
   - Carbon footprint calculation per product
   - Packaging sustainability scores
   - Local vs. imported product indicators
   - Seasonal availability information
   - Water usage and environmental impact data

2. **Ethical Sourcing**
   - Fair trade certification tracking
   - Animal welfare scores
   - Labor practice transparency
   - Supply chain traceability
   - Corporate responsibility ratings

### 🔐 Enterprise & B2B Features
1. **Business Solutions**
   - API access for third-party developers
   - White-label solutions for retailers
   - Bulk analysis for food manufacturers
   - Compliance checking for regulatory requirements
   - Product development insights

2. **Educational Tools**
   - Nutrition education modules
   - Gamification for healthy eating habits
   - School and university partnerships
   - Interactive learning experiences
   - Certification programs

### 🚀 Technical Enhancements
1. **Performance & Scalability**
   - Migration to PostgreSQL for production
   - Redis caching for faster responses
   - CDN integration for global performance
   - Microservices architecture
   - GraphQL API option

2. **Mobile Applications**
   - Native iOS app (Swift/SwiftUI)
   - Native Android app (Kotlin/Jetpack Compose)
   - Offline mode with local AI models
   - Push notifications for product recalls
   - Wearable device integration

3. **Advanced Security**
   - Two-factor authentication (2FA)
   - Biometric authentication
   - End-to-end encryption for health data
   - GDPR and HIPAA compliance
   - Data anonymization options

### 🤖 AI Model Improvements
1. **Model Enhancements**
   - Fine-tuned models for specific dietary needs
   - Ensemble models for higher accuracy
   - Continuous learning from user feedback
   - Multi-modal fusion (text + image + voice)
   - Explainable AI for transparency

2. **New AI Capabilities**
   - Recipe generation from available ingredients
   - Meal compatibility suggestions
   - Cooking instruction generation
   - Nutritional deficiency detection
   - Predictive health modeling

### 🌐 Global Expansion
1. **Internationalization**
   - Support for 50+ languages
   - Regional food databases
   - Local dietary guidelines integration
   - Cultural food preferences
   - International nutrition standards

2. **Market Expansion**
   - Restaurant menu analysis
   - Food service industry tools
   - Catering and event planning features
   - School cafeteria nutrition tracking
   - Hospital meal planning integration

### 📱 Integration Ecosystem
1. **Smart Home Integration**
   - Smart refrigerator connectivity
   - Pantry management systems
   - Automated grocery ordering
   - Recipe suggestions based on available items
   - Expiration date tracking

2. **Third-Party Integrations**
   - Fitness app synchronization
   - Meal kit service integration
   - Restaurant reservation platforms
   - Food delivery app partnerships
   - Health insurance provider connections

---

## 🎓 Research & Innovation Opportunities
- **Academic Partnerships**: Collaborate with nutrition science departments
- **Clinical Studies**: Conduct research on AI-assisted dietary decisions
- **Open Source Contributions**: Release components for community development
- **AI Ethics**: Develop frameworks for responsible AI in health tech
- **Accessibility**: Ensure inclusive design for users with disabilities

---
