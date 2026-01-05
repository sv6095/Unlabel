# Vercel serverless function entry point
import sys
import os

# Add project root to Python path
_backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

# Lazy load to avoid issues with Vercel's handler detection
_adapter = None

def _get_adapter():
    global _adapter
    if _adapter is None:
        from mangum import Mangum
        from app.main import app
        _adapter = Mangum(app, lifespan="off")
    return _adapter

# Vercel handler function - must be named 'handler'
def handler(event, context):
    return _get_adapter()(event, context)

