from dotenv import load_dotenv
import os
from pathlib import Path


def load_environment():
    """Load environment variables from .env file"""
    # Get the base directory
    BASE_DIR = Path(__file__).resolve().parent.parent
    dotenv_path = BASE_DIR / 'config' / '.env'

    load_dotenv(dotenv_path=dotenv_path)

    # You can access environment variables using os.getenv
    # Example: api_key = os.getenv('API_KEY')
    return os.environ


def get_openai_key():
    load_environment()
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError(
            "API key not found. Make sure you have a .env file with "
            "OPENAI_API_KEY set."
        )
    return api_key
