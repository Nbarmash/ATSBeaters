
import os
import logging
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# API Keys
# Note: As a Gemini-first suite, we utilize Google GenAI for all intelligence tasks
GOOGLE_API_KEY = os.getenv("API_KEY") 
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")

# Email Configuration
FROM_EMAIL = os.getenv("FROM_EMAIL", "reports@atsbeaters.ai")
SUPPORT_EMAIL = os.getenv("SUPPORT_EMAIL", "support@atsbeaters.ai")

# File Paths
OUTPUT_DIR = os.getenv("OUTPUT_DIR", "generated_outputs")

# Logging Configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("atsbeaters_backend.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("ATSBeatersBackend")

# Ensure output directory exists
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)
