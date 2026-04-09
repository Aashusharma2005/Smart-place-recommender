from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import requests
import json
import os
import math

# 🔥 LOAD ENV
load_dotenv()

app = Flask(__name__)
CORS(app)

# 🔑 KEYS
PEXELS_API_KEY = os.getenv("PEXELS_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")   # ✅ NEW

# 📁 CACHE FILE
CACHE_FILE = "image_cache.json"

# 🔄 LOAD CACHE
if os.path.exists(CACHE_FILE):
    try:
        with open(CACHE_FILE, "r") as f:
            image_cache = json.load(f)
    except:
        image_cache = {}
else:
    image_cache = {}

# 💾 SAVE CACHE
def save_cache():
    try:
        with open(CACHE_FILE, "w") as f:
            json.dump(image_cache, f)
    except Exception as e:
        print("Cache save error:", e)

# 📏 DISTANCE FIXED (BUG FIX)
def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)   # ✅ FIXED

    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * \
        math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


# 🔥 AI TRIP GENERATOR (NEW 🔥)
@app.route("/generate-trip", methods=["POST"])
def generate_trip():
    try:
        data = request.json
        prompt = data.get("prompt")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"

        response = requests.post(url, json={
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ]
        })

        res_json = response.json()

        print("FULL RESPONSE:", res_json)

        # ✅ SAFE PARSE
        try:
            text = res_json["candidates"][0]["content"]["parts"][0]["text"]
        except:
            text = "AI response failed"

        return jsonify({"trip": text})

    except Exception as e:
        print("AI ERROR:", e)
        return jsonify({"trip": "Error generating trip"})


# 🔥 PLACE IMAGE
@app.route("/place-image")
def place_image():
    query = request.args.get("q")

    if not query:
        return jsonify({"images": []})

    if query in image_cache and len(image_cache[query]) >= 4:
        return jsonify({"images": image_cache[query]})

    images = []

    try:
        search_query = f"{query} India landmark"

        url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?query={search_query}&key={GOOGLE_API_KEY}"
        res = requests.get(url).json()

        if res.get("results"):
            place = res["results"][0]
            photos = place.get("photos", [])

            for p in photos[:5]:
                ref = p.get("photo_reference")

                if ref:
                    images.append(
                        f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference={ref}&key={GOOGLE_API_KEY}"
                    )

    except Exception as e:
        print("Google Image Error:", e)

    # 🔁 FALLBACK
    if len(images) < 4:
        try:
            headers = {"Authorization": PEXELS_API_KEY}
            pexels_url = f"https://api.pexels.com/v1/search?query={query}&per_page=5"

            res = requests.get(pexels_url, headers=headers).json()

            for photo in res.get("photos", []):
                images.append(photo["src"]["large"])

                if len(images) >= 5:
                    break

        except Exception as e:
            print("Pexels Error:", e)

    images = images[:5]

    image_cache[query] = images
    save_cache()

    return jsonify({"images": images})


# 🍽️ RESTAURANTS
@app.route("/nearby-restaurants")
def nearby_restaurants():
    lat = request.args.get("lat")
    lng = request.args.get("lng")

    if not lat or not lng:
        return jsonify({"restaurants": []})

    try:
        url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={lat},{lng}&radius=2000&type=restaurant&key={GOOGLE_API_KEY}"

        res = requests.get(url).json()

        restaurants = []

        for p in res.get("results", [])[:10]:
            location = p.get("geometry", {}).get("location", {})

            restaurants.append({
                "name": p.get("name"),
                "rating": p.get("rating", 4.0),
                "address": p.get("vicinity"),
                "lat": location.get("lat"),
                "lng": location.get("lng")
            })

        return jsonify({"restaurants": restaurants})

    except Exception as e:
        print("Restaurant Error:", e)
        return jsonify({"restaurants": []})


# 🚀 RUN
if __name__ == "__main__":
    app.run(debug=True)