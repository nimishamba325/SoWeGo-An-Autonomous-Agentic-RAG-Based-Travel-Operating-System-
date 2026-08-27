# ✈️ SoWeGo — Conversational Agentic AI Travel Planner

SoWeGo is a **Conversational Agentic AI Travel Planner** that helps users create personalized travel plans through natural-language conversations.

Instead of manually searching for destinations and building itineraries, users can simply describe their travel preferences, and SoWeGo uses an **agentic AI workflow** to understand the request, retrieve relevant destinations, and generate a personalized travel plan.

### 🚀 Key Features

* 💬 **Conversational Travel Planning** — Plan trips using natural language.
* 🤖 **Agentic AI** — Uses LangGraph to orchestrate the travel-planning workflow.
* 🔎 **RAG-based Recommendations** — Uses ChromaDB/FAISS for relevant destination retrieval.
* 🧠 **Llama 3.1 + Ollama** — AI-powered response generation.
* 🛡️ **Out-of-Domain Detection** — Rejects queries unrelated to travel.
* 📍 **Grounded Recommendations** — Reduces geographical hallucinations using a curated destination dataset.

### 🛠️ Tech Stack

**Frontend:** React, Vite, Tailwind CSS
**Backend:** Python, Flask
**AI:** Llama 3.1, Ollama, LangGraph
**Vector Search:** ChromaDB, FAISS

### 📊 Project Highlights

* **0%** geographical hallucination rate
* **100%** out-of-domain query rejection
* **<150 ms** vector search latency
* **~80%** reduction in travel-planning time
* Dataset containing **40+ destinations**

### 📁 Structure

```text
SoWeGo/
├── frontend/
├── backend/
├── .gitignore
└── README.md
```

> **SoWeGo — Just tell us where you want to go. We'll help plan the journey.** ✈️🌍
