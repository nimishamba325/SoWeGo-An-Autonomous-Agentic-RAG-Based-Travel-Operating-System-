import json
import os
import chromadb

# Initialize ChromaDB
client = chromadb.PersistentClient(path="./sowego_memory")
collection = client.get_or_create_collection(name="coastal_gems")

STAGING_FILE = "staging_gems.json"

def approve_gems():
    print("\n🛡️ SoWeGo Admin Interface: Quarantine Zone")
    print("-----------------------------------------")
    
    if not os.path.exists(STAGING_FILE):
        print("✨ Quarantine zone is empty. No new submissions to review.")
        return

    with open(STAGING_FILE, "r") as f:
        try:
            staging_data = json.load(f)
        except json.JSONDecodeError:
            staging_data = []

    if not staging_data:
        print("✨ Quarantine zone is empty. No new submissions to review.")
        return

    print(f"📦 Found {len(staging_data)} gems pending approval.\n")
    remaining_gems = []
    approved_count = 0

    for gem in staging_data:
        print("="*50)
        print(f"🆕 NEW GEM SUBMISSION: {gem.get('name', 'Unknown')}")
        print(f"📍 District: {gem.get('district', 'N/A')} | 🏷️ Category: {gem.get('category', 'N/A')}")
        print(f"💰 Price Cap: ₹{gem.get('price_cap', 0)} | ⏱️ Duration: {gem.get('duration_hrs', 0)} hrs")
        print(f"📝 Description: {gem.get('description', 'No description')}")
        print("="*50)
        
        choice = input("Approve and embed into live database? (y/n/skip): ").strip().lower()
        
        if choice == 'y':
            # Safely handle floats in case the frontend sent a string or null
            try:
                price = float(gem.get('price_cap', 0))
            except (ValueError, TypeError):
                price = 0.0
                
            try:
                duration = float(gem.get('duration_hrs', 2.0))
            except (ValueError, TypeError):
                duration = 2.0

            # 1. Format for ChromaDB (Semantic Document)
            doc_text = (
                f"Name: {gem.get('name', '')}. "
                f"Description: {gem.get('description', '')} "
                f"Vibes: {gem.get('vibe_tags', '')}. "
                f"Accessibility: {gem.get('accessibility', '')}."
            )
            
            # 2. Format Metadata (Strict Filters)
            meta = {
                "name": str(gem.get('name', '')).strip(),
                "district": str(gem.get('district', '')).strip(),
                "category": str(gem.get('category', '')).strip(),
                "price_cap": price,
                "duration_hrs": duration,
                "best_time": str(gem.get('best_time', '')).strip(),
                "nearest_transit_hub": str(gem.get('nearest_transit_hub', '')).strip(),
                "google_maps_url": str(gem.get('google_maps_url', '')).strip()
            }
            
            # 3. Push to live memory (Upsert prevents crashes on duplicate IDs)
            collection.upsert(
                documents=[doc_text],
                metadatas=[meta],
                ids=[gem['id']]
            )
            approved_count += 1
            print(f"✅ Approved! {gem.get('name')} is now live in SoWeGo.\n")
        
        elif choice == 'n':
            print(f"🗑️ Rejected. Deleting {gem.get('name')} from staging.\n")
        
        else:
            print(f"⏭️ Skipped. Keeping {gem.get('name')} in quarantine for later.\n")
            remaining_gems.append(gem)

    # Update the staging file with only the skipped gems
    with open(STAGING_FILE, "w") as f:
        json.dump(remaining_gems, f, indent=4)

    print(f"🎉 Action complete. {approved_count} new gems embedded into SoWeGo Memory.")

if __name__ == "__main__":
    approve_gems()