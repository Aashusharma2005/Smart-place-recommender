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
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

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

# 📏 DISTANCE
def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return round(R * c, 2)

# 🔥 AI TRIP GENERATOR
@app.route("/generate-trip", methods=["POST"])
def generate_trip():
    try:
        data = request.json
        prompt = data.get("prompt")

        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
        )

        response = requests.post(
            url,
            json={
                "contents": [
                    {
                        "parts": [
                            {"text": prompt}
                        ]
                    }
                ]
            }
        )

        res_json = response.json()

        print("FULL RESPONSE:", res_json)

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

    # ✅ CACHE
    if query in image_cache and len(image_cache[query]) >= 4:
        return jsonify({"images": image_cache[query]})

    images = []

    try:

        # 🔍 GOOGLE PLACE SEARCH
        search_url = (
            "https://maps.googleapis.com/maps/api/place/textsearch/json"
            f"?query={query}"
            f"&key={GOOGLE_API_KEY}"
        )

        search_res = requests.get(search_url).json()

        print("GOOGLE SEARCH:", search_res)

        # ✅ GOOGLE PHOTOS
        if search_res.get("results"):

            for result in search_res["results"][:3]:

                photos = result.get("photos", [])

                for photo in photos:

                    photo_ref = photo.get("photo_reference")

                    if photo_ref:

                        photo_url = (
                            "https://maps.googleapis.com/maps/api/place/photo"
                            f"?maxwidth=1200"
                            f"&photo_reference={photo_ref}"
                            f"&key={GOOGLE_API_KEY}"
                        )

                        if photo_url not in images:
                            images.append(photo_url)

                    if len(images) >= 4:
                        break

                if len(images) >= 4:
                    break

    except Exception as e:
        print("GOOGLE IMAGE ERROR:", e)

    # 🔁 SMART FALLBACK
    if len(images) < 4:

        try:

            headers = {
                "Authorization": PEXELS_API_KEY
            }

            pexels_query = f"{query} india monument"

            pexels_url = (
                f"https://api.pexels.com/v1/search"
                f"?query={pexels_query}"
                f"&per_page=10"
            )

            pexels_res = requests.get(
                pexels_url,
                headers=headers
            ).json()

            for photo in pexels_res.get("photos", []):

                img = photo["src"]["large"]

                if img not in images:
                    images.append(img)

                if len(images) >= 4:
                    break

        except Exception as e:
            print("PEXELS ERROR:", e)

    # ✅ REMOVE DUPLICATES
    images = list(dict.fromkeys(images))

    # 💾 SAVE CACHE
    image_cache[query] = images
    save_cache()

    return jsonify({
        "images": images[:4]
    })

# 🍽️ RESTAURANTS
@app.route("/nearby-restaurants")
def nearby_restaurants():

    lat = request.args.get("lat")
    lng = request.args.get("lng")

    if not lat or not lng:
        return jsonify({"restaurants": []})

    try:

        url = (
            "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
            f"?location={lat},{lng}"
            f"&radius=3000"
            f"&type=restaurant"
            f"&key={GOOGLE_API_KEY}"
        )

        response = requests.get(url)

        data = response.json()

        print("RESTAURANT API:", data)

        restaurants = []

        for place in data.get("results", [])[:10]:

            location = place.get("geometry", {}).get("location", {})

            restaurants.append({
                "name": place.get("name", "Restaurant"),
                "rating": place.get("rating", 4.0),
                "address": place.get("vicinity", ""),
                "lat": location.get("lat"),
                "lng": location.get("lng")
            })

        return jsonify({
            "restaurants": restaurants
        })

    except Exception as e:
        print("Restaurant Error:", e)

        return jsonify({
            "restaurants": []
        })

# 🚀 RUN
if __name__ == "__main__":
    app.run(debug=True)