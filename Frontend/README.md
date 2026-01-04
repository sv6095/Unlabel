# Frontend - Food Intelligence Co-pilot

## 🎨 Overview
The interface is designed to be **AI-Native**, meaning it minimizes forms and menus in favor of direct intent. The aesthetic uses a **Premium Glassmorphism** style to feel futuristic, clean, and fluid. The application now includes a **Global Food Search** feature powered by the Open Food Facts database.

## 🛠️ Technology Stack
*   **Framework:** React 18 + Vite
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS (Custom Configuration)
*   **Icons:** Lucide React
*   **Routing:** React Router DOM
*   **State/Auth:** Context API
*   **HTTP Client:** Axios

## 📂 Project Structure
*   `src/components/ui`: Reusable UI components (GlassCard, GlassButton) adhering to the design system.
*   `src/pages`: Main views (Analyze, History, Login, Profile, **FoodSearch**).
*   `src/lib/api.ts`: Centralized Axios instance for backend communication.
*   `src/contexts`: Authentication and Theme contexts.

## ✨ Key Features
1.  **Conversational Co-pilot:**
    *   Chat-based interface for effortless interaction.
    *   Integrated Camera/Image upload within the chat stream.
    
2.  **Dynamic Result Cards:**
    *   AI reasoning is presented as interactive Glassmorphism cards.
    *   Color-coded cards (Green/Red/Neutral) based on AI reasoning (future implementation).

3.  **History Integration:**
    *   Fetches past user analyses from the backend.
    *   Displays a chronological feed of food insights.

4.  **Global Food Search (NEW):**
    *   Search across 3+ million products from Open Food Facts database
    *   **Case-insensitive search** with partial name matching (e.g., "ketchup" finds all ketchup products)
    *   **Real-time search recommendations** as you type
    *   **Rich product cards** displaying:
        *   Product images
        *   Brand information
        *   Nutrition grades (A-E color-coded badges)
        *   Ingredient lists
    *   **Error handling** with user-friendly messages when products aren't found
    *   **Responsive grid layout** optimized for all screen sizes

## 🔍 Food Search Usage
Navigate to `/food-search` or click "Food Search" in the navigation menu. Enter any product name (full or partial) to see matching results. The search is:
- **Not case-sensitive** - "KETCHUP", "ketchup", or "Ketchup" all work
- **Partial match enabled** - "ket" will show ketchup products
- **Real-time** - Results appear as you search

## 🚀 Running Locally
```bash
npm install
npm run dev
```
Access at `http://localhost:5173`
