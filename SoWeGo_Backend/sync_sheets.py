import csv
import io
import chromadb
import requests

# 1. Connect to ChromaDB
client = chromadb.PersistentClient(path="./sowego_memory")

# 2. Google Sheets "Publish to Web" CSV link
SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQYVH10nRgz9pGMQxUMy-Yx2Hm3kYCRbE7fTP2M-gEEpaMVrRFD2JNeyzRRSMhl_AriY3b6zIItvXnj/pub?gid=505039243&single=true&output=csv"

print("⏳ Fetching live data from Google Sheets...")

try:
    response = requests.get(SHEET_CSV_URL)
    response.raise_for_status()

    # Enforce UTF-8 decoding so emojis and ₹ symbols don't break
    csv_data = io.StringIO(response.content.decode("utf-8"))
    reader = csv.DictReader(csv_data)

    documents = []
    metadatas = []
    ids = []

    for row in reader:
        # Skip empty rows safely
        if not row.get("id") or str(row.get("id")).strip() == "":
            continue

        # Safely extract text fields
        name = str(row.get("name", "")).strip()
        description = str(row.get("description", "")).strip()
        vibes = str(row.get("vibe_tags", "")).strip()
        accessibility = str(row.get("accessibility", "")).strip()

        doc_text = f"Name: {name}. Description: {description} Vibes: {vibes}. Accessibility: {accessibility}."
        documents.append(doc_text)

        # Safely extract numbers
        try:
            price = float(row.get("price_cap", 0))
        except (ValueError, TypeError):
            price = 0.0

        try:
            duration = float(row.get("duration_hrs", 2.0))
        except (ValueError, TypeError):
            duration = 2.0

        meta = {
            "name": name,
            "district": str(row.get("district", "")).strip(),
            "category": str(row.get("category", "")).strip(),
            "price_cap": price,
            "duration_hrs": duration,
            "best_time": str(row.get("best_time", "")).strip(),
            "nearest_transit_hub": str(row.get("nearest_transit_hub", "")).strip(),
            "google_maps_url": str(row.get("google_maps_url", "")).strip(),
        }
        metadatas.append(meta)
        ids.append(str(row.get("id")).strip())

    if documents:
        # 🔥 CLEAN RESET: Delete old collection to purge stale/deleted rows from Google Sheets
        try:
            client.delete_collection(name="coastal_gems")
        except Exception:
            pass  # Collection didn't exist yet

        collection = client.create_collection(name="coastal_gems")
        collection.add(documents=documents, metadatas=metadatas, ids=ids)

        print(f"✅ SUCCESS! Cleanly synchronized {len(documents)} coastal gems into `./sowego_memory`.")
        print("📌 NOTE: You ONLY need to run this script when you add or update rows in your Google Sheet!")
    else:
        print("⚠️ Warning: Connected to the sheet, but no valid rows were found. Check your CSV link and tabs!")

except requests.exceptions.RequestException as e:
    print(f"❌ Network Error fetching from Google Sheets: {e}")
except Exception as e:
    print(f"❌ Unexpected Error: {e}")