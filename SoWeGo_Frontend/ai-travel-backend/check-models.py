import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

try:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
except Exception as e:
    print(f"Error configuring API key: {e}")
    print("Make sure your .env file has the correct GEMINI_API_KEY")
    exit()

print("Listing available models for your API key...")
print("="*30)

try:
    for m in genai.list_models():
        # We only care about models that support 'generateContent'
        if 'generateContent' in m.supported_generation_methods:
            print(f"Model name: {m.name}")
            print(f"  Description: {m.description}\n")
except Exception as e:
    print(f"An error occurred while listing models: {e}")
    print("This could be an issue with your API key or project setup in Google AI Studio.")

print("="*30)
print("Find a suitable model name (like 'models/gemini-1.5-flash-latest' or 'models/gemini-1.0-pro') and update app.py")