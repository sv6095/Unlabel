# Vercel serverless function entry point
import sys
import os

# Add the Backend directory to the Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from mangum import Mangum
from app.main import app

# Create Mangum handler for Vercel
# lifespan="off" disables lifespan events which can cause issues in serverless
handler = Mangum(app, lifespan="off")

