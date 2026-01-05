# Vercel serverless function entry point
import sys
import os
import traceback

# Add the project root to the Python path
# In Vercel: __file__ is /var/task/api/index.py
# We need /var/task in the path (one level up from api/)
# This allows us to import app.main and config.settings
current_file = os.path.abspath(__file__)  # /var/task/api/index.py
api_dir = os.path.dirname(current_file)   # /var/task/api
project_root = os.path.dirname(api_dir)   # /var/task

if project_root not in sys.path:
    sys.path.insert(0, project_root)

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

