# Vercel serverless function entry point
import sys
import os
import traceback

# Add the Backend directory to the Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Suppress warnings about unused modules
import warnings
warnings.filterwarnings("ignore")

try:
    # Import only what we need
    from mangum import Mangum
    
    # Import app after path is set
    from app.main import app
    
    # Create Mangum handler for Vercel
    # lifespan="off" disables lifespan events which can cause issues in serverless
    handler = Mangum(app, lifespan="off")
    
except ImportError as e:
    # Log import errors specifically
    error_msg = f"Import error: {str(e)}\n{traceback.format_exc()}"
    print(error_msg)
    
    # Create a minimal error handler that matches Vercel's expected format
    def error_handler(event, context):
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": f'{{"error": "Import failed", "details": "{str(e)}"}}'
        }
    handler = error_handler
except Exception as e:
    # Log other errors
    error_msg = f"Failed to initialize app: {str(e)}\n{traceback.format_exc()}"
    print(error_msg)
    
    # Create a minimal error handler that matches Vercel's expected format
    def error_handler(event, context):
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": f'{{"error": "Initialization failed", "details": "{str(e)}"}}'
        }
    handler = error_handler

