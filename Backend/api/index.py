# Vercel serverless function entry point
import sys
import os

# Add project root to Python path
_backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

try:
    from mangum import Mangum
    from app.main import app
    
    # Create Mangum adapter for FastAPI
    adapter = Mangum(app, lifespan="off")
except Exception as e:
    import traceback
    print(f"Error initializing handler: {e}")
    traceback.print_exc()
    raise

# Vercel handler function - must be a callable function
def handler(event, context):
    try:
        return adapter(event, context)
    except Exception as e:
        import traceback
        print(f"Error in handler: {e}")
        traceback.print_exc()
        raise

