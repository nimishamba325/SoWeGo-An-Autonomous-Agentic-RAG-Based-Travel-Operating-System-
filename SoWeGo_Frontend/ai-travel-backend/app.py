import os
import json
import time
from google import genai
from google.genai import types
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Updated to match Manvitha's frontend port
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

# --- SOWEGO CLIENT INITIALIZATION ---
try:
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    # Using 2.5-flash as the stable production model for Pitch Tank Round 2
    MODEL_ID = "gemini-2.5-flash"
    print(f"✨ SoWeGo Stable Brain Initialized on {MODEL_ID}.")
except Exception as e:
    print(f"❌ SoWeGo Configuration Error: {e}")
    exit()

# --- SOWEGO FIDUCIARY SYSTEM PROMPT ---
SYSTEM_PROMPT = """
You are "SoWeGo", an Autonomous Travel OS and fiduciary layer. 
Your goal is to eliminate manual booking friction by providing structured, actionable data.

**RESPONSE MODES:**
1. If the user asks for a trip plan/itinerary: Return "ITINERARY SCHEMA".
2. If the user asks for a budget/expenses: Return "BUDGET SCHEMA".

**1. ITINERARY SCHEMA:**
{
  "itinerary_title": "Descriptive Title",
  "total_days": 7,
  "days": [
    { "day": 1, "title": "Theme", "morning": "Actionable detail", "evening": "Actionable detail" }
  ]
}

**2. BUDGET SCHEMA (Strictly for BudgetPieChart.jsx):**
{
  "budget_plan": {
    "title": "Optimized Budget for [Location]",
    "total_budget": "¥250,000 or ₹1,50,000",
    "breakdown": [
      {"category": "Accommodation 🏨", "amount": 100000, "percentage": 40},
      {"category": "Food 🍽️", "amount": 50000, "percentage": 20},
      {"category": "Activities 🏄", "amount": 50000, "percentage": 20},
      {"category": "Transport 🚆", "amount": 25000, "percentage": 10},
      {"category": "Contingency 💰", "amount": 25000, "percentage": 10}
    ]
  }
}

**RULES:**
- In Budget Schema, 'amount' and 'percentage' MUST be numbers, not strings.
- Always use local currency (e.g., ¥ for Tokyo, ₹ for India).
- Fiduciary First: Always suggest the most cost-effective and safe options.
"""

@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        frontend_history = data.get("history", [])
        language_code = data.get("language", "en")
        user_location = data.get("location")
        user_profile = data.get("userProfile")

        if not frontend_history:
            return jsonify({"error": "No history provided"}), 400

        # Convert history
        chat_history = []
        for msg in frontend_history[:-1]:
            role = "model" if msg["role"] == "ai" else "user"
            content = msg["content"]
            if isinstance(content, dict):
                content = content.get("reply", json.dumps(content))
            chat_history.append(types.Content(role=role, parts=[types.Part.from_text(text=str(content))]))

        latest_query = frontend_history[-1]["content"]

        # Build context
        context_parts = []
        if user_profile: context_parts.append(f"Profile: {json.dumps(user_profile)}")
        if user_location: context_parts.append(f"Location: {user_location}")
        lang_name = {"hi": "Hindi", "kn": "Kannada"}.get(language_code, "English")
        
        final_prompt = f"{' | '.join(context_parts)} | Request: '{latest_query}' | Language: {lang_name}."

        # --- RESILIENCY LOOP (Handling 503 Overloads) ---
        MAX_RETRIES = 3
        INITIAL_DELAY = 1 
        response_text = None

        for attempt in range(MAX_RETRIES):
            try:
                chat_session = client.chats.create(
                    model=MODEL_ID,
                    config=types.GenerateContentConfig(
                        system_instruction=types.Part.from_text(text=SYSTEM_PROMPT),
                        temperature=0.7
                    ),
                    history=chat_history
                )
                response = chat_session.send_message(final_prompt)
                response_text = response.text.strip()
                break  # Success!
            except Exception as e:
                if "503" in str(e) or "overloaded" in str(e).lower():
                    print(f"⚠️ SoWeGo Retry Attempt {attempt + 1}: Overloaded.")
                    time.sleep(INITIAL_DELAY * (2 ** attempt))
                    continue
                raise e

        if not response_text:
             return jsonify({"reply": "I'm optimizing your budget. Please try again in 5 seconds."}), 503

        # --- JSON EXTRACTION ---
        try:
            clean_reply = response_text.replace("```json", "").replace("```", "").strip()
            start = clean_reply.find('{')
            end = clean_reply.rfind('}') + 1

            if start != -1 and end != -1:
                parsed = json.loads(clean_reply[start:end])
                
                # Check terminal for this trace to verify numbers are correct
                print("\n🔍 SoWeGo JSON Trace:")
                print(json.dumps(parsed, indent=2))
                
                if "itinerary_title" in parsed or "budget_plan" in parsed:
                    return jsonify(parsed)
            
            return jsonify({"reply": response_text})

        except json.JSONDecodeError:
            return jsonify({"reply": response_text})

    except Exception as e:
        print(f"❌ SoWeGo Backend Error: {str(e)}")
        return jsonify({"reply": f"Internal Error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)