from fastapi import APIRouter, HTTPException, Query
import requests

router = APIRouter(
    prefix="/food",
    tags=["Food Integration"]
)

OPEN_FOOD_FACTS_SEARCH_URL = "https://world.openfoodfacts.org/cgi/search.pl"
OPEN_FOOD_FACTS_PRODUCT_URL = "https://world.openfoodfacts.org/api/v2/product"

@router.get("/search")
def search_food(query: str = Query(..., min_length=1)):
    """
    Search for food products using Open Food Facts API.
    Returns a list of products matching the query.
    """
    try:
        # Open Food Facts API search parameters
        params = {
            "search_terms": query,
            "search_simple": 1,
            "action": "process",
            "json": 1,
            "page_size": 20  # Limit results
        }
        
        # Add User-Agent as requested by Open Food Facts policy
        headers = {
            "User-Agent": "FoodIntelligenceApp/1.0 (Integration Test)"
        }

        response = requests.get(OPEN_FOOD_FACTS_SEARCH_URL, params=params, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        
        if "products" in data and len(data["products"]) > 0:
            # Simplify the response for the frontend
            results = []
            for product in data["products"]:
                results.append({
                    "id": product.get("code", ""),
                    "product_name": product.get("product_name", "Unknown Product"),
                    "brands": product.get("brands", ""),
                    "image_url": product.get("image_front_url", None),
                    "nutrition_grade": product.get("nutrition_grades", "N/A").upper(),
                    "ingredients_text": product.get("ingredients_text", "Ingredients not available.")
                })
            return {"status": "success", "data": results}
        else:
            return {"status": "error", "message": f"No products found for '{query}'. Please try a different keyword.", "data": []}

    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"External API error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/product/{barcode}")
def get_product_details(barcode: str):
    """
    Get detailed information about a specific product by barcode.
    """
    try:
        headers = {
            "User-Agent": "FoodIntelligenceApp/1.0 (Integration Test)"
        }
        
        response = requests.get(f"{OPEN_FOOD_FACTS_PRODUCT_URL}/{barcode}", headers=headers)
        response.raise_for_status()
        
        data = response.json()
        
        if data.get("status") == 1 and "product" in data:
            product = data["product"]
            
            # Extract comprehensive product information
            detailed_info = {
                "id": product.get("code", barcode),
                "product_name": product.get("product_name", "Unknown Product"),
                "brands": product.get("brands", ""),
                "categories": product.get("categories", ""),
                "labels": product.get("labels", ""),
                "quantity": product.get("quantity", ""),
                "packaging": product.get("packaging", ""),
                "manufacturing_places": product.get("manufacturing_places", ""),
                "origins": product.get("origins", ""),
                "countries": product.get("countries", ""),
                
                # Images
                "image_url": product.get("image_front_url", None),
                "image_nutrition_url": product.get("image_nutrition_url", None),
                "image_ingredients_url": product.get("image_ingredients_url", None),
                
                # Nutrition
                "nutrition_grade": product.get("nutrition_grades", "N/A").upper(),
                "nutriments": product.get("nutriments", {}),
                "nutriscore_score": product.get("nutriscore_score", None),
                
                # Ingredients
                "ingredients_text": product.get("ingredients_text", "Ingredients not available."),
                "allergens": product.get("allergens", ""),
                "traces": product.get("traces", ""),
                
                # Additional info
                "nova_group": product.get("nova_group", None),
                "ecoscore_grade": product.get("ecoscore_grade", "").upper(),
                "additives_tags": product.get("additives_tags", []),
            }
            
            return {"status": "success", "data": detailed_info}
        else:
            return {"status": "error", "message": "Product not found.", "data": None}
    
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"External API error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
