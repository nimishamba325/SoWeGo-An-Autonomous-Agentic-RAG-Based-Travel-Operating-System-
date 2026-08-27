import json
import os
from datetime import datetime
from typing import Any, List, Optional, TypedDict

import chromadb
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_ollama import ChatOllama
from langgraph.graph import END, START, StateGraph
from pydantic import BaseModel

app = FastAPI(title="SoWeGo Autonomous Travel OS")

# Allow Vite frontend (port 5173) to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. CONNECT TO CLOUD GPU
llm = ChatOllama(
    base_url="https://dana-back-findarticles-changed.trycloudflare.com",  # 👈 Your active Colab URL
    model="llama3.1",
    temperature=0.0,
    format="json",
)

# 2. CONNECT TO LOCAL MEMORY
client = chromadb.PersistentClient(path="./sowego_memory")
collection = client.get_or_create_collection(name="coastal_gems")

# --- CONVERSATIONAL FIDUCIARY SYSTEM PROMPT (DRILL SERGEANT EDITION) ---
SYSTEM_PROMPT = """You are "SoWeGo", an Autonomous Travel OS strictly for the Mangaluru-to-Goa coastal corridor.

CRITICAL INSTRUCTION: Output ONLY raw valid JSON. No markdown wrappers. DO NOT write trip plans or lists inside the "reply" string.

--- 🚨 IMMEDIATE FULFILLMENT (NO STALLING) ---
If the user asks to plan a trip, YOU MUST IMMEDIATELY populate the `itinerary` JSON object in your very first response. DO NOT just reply "I can plan that for you" and wait. Output the actual itinerary immediately.

--- 🚨 STRICT GEOGRAPHY & RAG ALIGNMENT (NO HALLUCINATIONS) ---
1. GEOGRAPHICAL ACCURACY: You MUST check the 'District' metadata of the locations in the REGIONAL DATABASE CONTEXT. You CANNOT put a place from Udupi into a Goa itinerary. 
2. ZERO INVENTIONS: If the user asks for Goa, and the context only gives you Udupi places, DO NOT invent Goa places. Instead, reply: "I don't have enough verified hidden gems for Goa in my database yet, but I can show you some amazing places in Udupi!" and set itinerary to null.
3. USE THE DATA: Only recommend places, prices, and transit hubs explicitly provided in the REGIONAL DATABASE CONTEXT.

--- 🚨 STRICT CARD ISOLATION (CHOOSE ONLY ONE) ---
You must ONLY populate ONE data card per response based on the user's primary intent. The other two MUST be explicitly set to `null`.
- If planning a trip -> Populate `itinerary`. (`budget` and `prep_checklist` MUST be null).
- If asking for costs -> Populate `budget`. (`itinerary` and `prep_checklist` MUST be null).
- If asking for packing -> Populate `prep_checklist`. (`itinerary` and `budget` MUST be null).

--- UNIFIED OUTPUT JSON SCHEMA ---
{
  "reply": "Brief, friendly conversational message.",
  "suggested_options": [], 
  "itinerary": null, 
  "budget": null,
  "prep_checklist": null
}

--- CARD SCHEMAS (Use ONLY when triggered, otherwise null) ---

ITINERARY SCHEMA:
{
  "itinerary_title": "Title of Trip",
  "start_location": "Starting Point",
  "destination": "Destination Name",
  "total_days": 2,
  "estimated_budget": "₹8,000",
  "days": [
    {
      "day": 1,
      "title": "Day Theme",
      "morning": "Morning activity details using EXACT places/prices from context",
      "evening": "Evening activity details using EXACT places/prices from context"
    }
  ]
}

BUDGET SCHEMA:
{
  "title": "Optimized Cost Breakdown",
  "total_budget": "₹8,000",
  "breakdown": [
    {"category": "Accommodation", "amount": 4000, "percentage": 50},
    {"category": "Food & Shacks", "amount": 4000, "percentage": 50}
  ]
}

PREP CHECKLIST SCHEMA:
{
  "destination": "Destination Name",
  "items": [
    {
      "category": "Weather Forecast (Inferred)",
      "advice": "Dynamically predict the weather based on the destination and the CURRENT MONTH provided in the prompt. Give temperature ranges and specific packing advice."
    },
    {
      "category": "Essentials",
      "advice": "General packing advice for this specific trip."
    }
  ]
}
"""

# --- REQUEST SCHEMAS ---
class Message(BaseModel):
    role: str
    content: Any

class ChatRequest(BaseModel):
    history: List[Message]
    language: str = "en"
    location: Optional[str] = None
    userProfile: Optional[dict] = None

# --- PHASE 2: UGC (USER GENERATED CONTENT) SCHEMA ---
class GemSubmission(BaseModel):
    name: str
    district: str
    category: str
    vibe_tags: str
    price_cap: float
    duration_hrs: float
    best_time: str
    nearest_transit_hub: str
    accessibility: str
    google_maps_url: str
    description: str


# --- LANGGRAPH STATE & NODES ---
class AgentState(TypedDict):
    messages: list
    latest_query: str
    rag_context: str
    final_response: str

def retrieve_regional_data(state: AgentState):
    """NODE 1: Searches ChromaDB for hidden gems based on the user's latest query."""
    try:
        # 🔥 Increased n_results from 3 to 5 for deeper dataset retrieval
        results = collection.query(
            query_texts=[state['latest_query']],
            n_results=5
        )
        
        if results and results.get('documents') and results['documents'][0]:
            docs = results['documents'][0]
            metas = results['metadatas'][0]
            
            combined_context = []
            for i in range(len(docs)):
                doc_string = docs[i]
                meta = metas[i]
                
                meta_string = (
                    f" | District: {meta.get('district')} | Category: {meta.get('category')} "
                    f"| LOCAL PRICE: ₹{meta.get('price_cap')} | Transit: {meta.get('nearest_transit_hub')} "
                    f"| Best Time: {meta.get('best_time')} | Maps: {meta.get('google_maps_url')}"
                )
                combined_context.append(doc_string + meta_string)
                
            formatted_context = "\n\n".join(combined_context)
        else:
            formatted_context = "No specific local gems found in database."
            
    except Exception as e:
        print(f"RAG Error: {str(e)}")
        formatted_context = "No specific local gems found in database."
        
    return {"rag_context": formatted_context}

def generate_fiduciary_json(state: AgentState):
    """NODE 2: Injects RAG data and conversation history into LLM."""
    dynamic_system_prompt = (
        SYSTEM_PROMPT + 
        f"\n\n--- REGIONAL DATABASE CONTEXT ---\nUse this verified local data if relevant:\n{state['rag_context']}"
    )
    full_conversation = [SystemMessage(content=dynamic_system_prompt)] + state['messages']
    response = llm.invoke(full_conversation)
    return {"final_response": response.content.strip()}

# --- BUILD THE AGENT GRAPH ---
workflow = StateGraph(AgentState)
workflow.add_node("retriever", retrieve_regional_data)
workflow.add_node("llm_generator", generate_fiduciary_json)
workflow.add_edge(START, "retriever")
workflow.add_edge("retriever", "llm_generator")
workflow.add_edge("llm_generator", END)
sowego_agent = workflow.compile()


# --- FASTAPI CHAT ENDPOINT ---
@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        if not request.history:
            return {
                "reply": "Hey there! I'm SoWeGo. Where are you planning to travel along the coast? Or can I suggest some beautiful coastal places?",
                "suggested_options": ["Places in Mangaluru", "Hidden gems in Goa", "Best coastal food"],
                "itinerary": None,
                "budget": None,
                "prep_checklist": None
            }

        has_itinerary = False
        has_budget = False
        has_checklist = False

        langchain_messages = []
        for msg in request.history[:-1]:
            if msg.role == "ai" and isinstance(msg.content, dict):
                if msg.content.get("itinerary"): has_itinerary = True
                if msg.content.get("budget"): has_budget = True
                if msg.content.get("prep_checklist"): has_checklist = True
            
            content_str = str(msg.content.get('reply', json.dumps(msg.content))) if isinstance(msg.content, dict) else str(msg.content)
            langchain_messages.append(AIMessage(content=content_str) if msg.role == "ai" else HumanMessage(content=content_str))

        latest_query = request.history[-1].content
        if isinstance(latest_query, dict):
            latest_query = latest_query.get('reply', json.dumps(latest_query))

        context_parts = []
        
        current_month = datetime.now().strftime("%B")
        context_parts.append(f"Current Month (Use for Weather Inference): {current_month}")

        if request.userProfile: context_parts.append(f"User Profile: {json.dumps(request.userProfile)}")
        if request.location: context_parts.append(f"Location: {request.location}")
        
        final_prompt_text = f"{' | '.join(context_parts)} | Request: '{latest_query}'" if context_parts else str(latest_query)
        langchain_messages.append(HumanMessage(content=final_prompt_text))

        initial_state = {
            "messages": langchain_messages,
            "latest_query": str(latest_query),
            "rag_context": "",
            "final_response": ""
        }
        
        result = sowego_agent.invoke(initial_state)
        response_text = result["final_response"]

        try:
            clean_reply = response_text.replace("```json", "").replace("```", "").strip()
            start = clean_reply.find('{')
            end = clean_reply.rfind('}') + 1

            if start != -1 and end != -1:
                parsed = json.loads(clean_reply[start:end])
                
                if parsed.get("itinerary"): has_itinerary = True
                if parsed.get("budget"): has_budget = True
                if parsed.get("prep_checklist"): has_checklist = True

                valid_chips = []
                if not has_itinerary: valid_chips.append("Plan 2-day itinerary")
                if not has_budget: valid_chips.append("Calculate budget")
                if not has_checklist: valid_chips.append("Packing checklist")
                
                discovery_fallbacks = ["Explore food spots", "Show hidden gems", "Local transport tips", "Best beaches"]
                for fb in discovery_fallbacks:
                    if len(valid_chips) >= 3: break
                    if fb not in valid_chips: valid_chips.append(fb)

                parsed["suggested_options"] = valid_chips[:3]
                return parsed
            
            return {
                "reply": response_text,
                "suggested_options": ["Plan my itinerary", "Calculate budget", "Travel checklist"]
            }

        except json.JSONDecodeError:
            return {
                "reply": response_text,
                "suggested_options": ["Plan my itinerary", "Calculate budget", "Travel checklist"]
            }

    except Exception as e:
        print(f"❌ Local Backend Error: {str(e)}")
        return {
            "reply": f"Internal Server Error: {str(e)}",
            "suggested_options": ["Retry request", "Start over", "Contact support"]
        }

# --- PHASE 2: STAGING ENDPOINT (The Quarantine Zone) ---
@app.post("/api/submit-gem")
async def submit_gem_endpoint(gem: GemSubmission):
    try:
        staging_file = "staging_gems.json"
        
        new_record = gem.model_dump()
        new_record["id"] = f"TEMP_{int(datetime.timestamp(datetime.now()))}"
        new_record["status"] = "pending_review"
        new_record["submitted_at"] = datetime.now().isoformat()

        existing_data = []
        if os.path.exists(staging_file):
            with open(staging_file, "r") as f:
                try:
                    existing_data = json.load(f)
                except json.JSONDecodeError:
                    existing_data = []

        existing_data.append(new_record)
        with open(staging_file, "w") as f:
            json.dump(existing_data, f, indent=4)

        print(f"✅ New Gem Submitted: {gem.name} (Awaiting Approval)")

        return {
            "success": True, 
            "message": "Gem submitted to Quarantine Zone successfully.",
            "points_awarded": 50
        }
        
    except Exception as e:
        print(f"❌ Error saving gem: {str(e)}")
        return {"success": False, "message": "Internal Server Error."}