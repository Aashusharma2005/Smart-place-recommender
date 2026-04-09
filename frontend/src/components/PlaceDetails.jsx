import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import places from "../data/places.json";
import hiddenGems from "../data/hiddengems.json";

function PlaceDetails() {
  const { name } = useParams();
  const navigate = useNavigate();

  const [images, setImages] = useState([]);
  const [saved, setSaved] = useState(false);
  const [visited, setVisited] = useState(false);

  const [restaurants, setRestaurants] = useState([]);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);

  const [reviewText, setReviewText] = useState("");
  const [ratingInput, setRatingInput] = useState(5);
  const [reviews, setReviews] = useState([]);

  const user = JSON.parse(localStorage.getItem("currentUser"));

  const decodedName = decodeURIComponent(name);
  const allPlaces = [...places, ...hiddenGems];

  const place = allPlaces.find(
    (p) =>
      (p?.Name || "").toLowerCase().trim() ===
      decodedName.toLowerCase().trim()
  );

  if (!place) return <h2 style={{ color: "white" }}>Place not found</h2>;

  // =============================
  // 🔥 DISTANCE FUNCTION
  // =============================
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  // =============================
  // 🔥 IMAGES
  // =============================
  useEffect(() => {
    fetch(`http://127.0.0.1:5000/place-image?q=${place.Name} ${place.City}`)
      .then((res) => res.json())
      .then((data) => setImages((data.images || []).slice(0, 4)));
  }, [place]);

  // =============================
  // 🔥 RESTAURANTS + DISTANCE
  // =============================
  useEffect(() => {
    fetch(
      `http://127.0.0.1:5000/nearby-restaurants?lat=${place.latitude}&lng=${place.longitude}`
    )
      .then((res) => res.json())
      .then((data) => {
        const list = (data.restaurants || []).map((r) => ({
          ...r,
          distance: getDistance(
            place.latitude,
            place.longitude,
            r.lat,
            r.lng
          ),
        }));
        setRestaurants(list);
      });
  }, [place]);

  // =============================
  // 🔥 NEARBY PLACES
  // =============================
  useEffect(() => {
    const near = allPlaces
      .filter((p) => p.Name !== place.Name)
      .map((p) => ({
        ...p,
        distance: getDistance(
          place.latitude,
          place.longitude,
          p.latitude,
          p.longitude
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 8);

    setNearbyPlaces(near);
  }, [place]);

  // =============================
  // 🔥 REVIEWS LOAD
  // =============================
  useEffect(() => {
    const allReviews = JSON.parse(localStorage.getItem("reviews")) || {};
    setReviews(allReviews[place.Name] || []);
  }, [place]);

  const addReview = () => {
    if (!user) return alert("Login first ❌");

    let allReviews = JSON.parse(localStorage.getItem("reviews")) || {};

    if (!allReviews[place.Name]) allReviews[place.Name] = [];

    allReviews[place.Name].push({
      rating: ratingInput,
      text: reviewText,
      user: user.email,
      date: new Date().toLocaleString(),
    });

    localStorage.setItem("reviews", JSON.stringify(allReviews));
    setReviews(allReviews[place.Name]);
    setReviewText("");
  };

  // =============================
  // UI
  // =============================
  return (
    <div style={container}>
      {/* BACK */}
      <button style={backBtn} onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* IMAGES */}
      <div style={imageRow}>
        {images.map((img, i) => (
          <img key={i} src={img} style={imgStyle} onClick={() => window.open(img)} />
        ))}
      </div>

      {/* MAIN */}
      <div style={grid}>
        <div>
          <h1>{place.Name}</h1>
          <p>📍 {place.City}</p>
          <p>🏷 {place.Type}</p>
          <p>⭐ {place["Google review rating"] || 4}</p>
          <p>💰 {place["Entrance Fee in INR"]}</p>
          <p>{place["FULL ADDRESS"]}</p>

          <div style={btnRow}>
            <a
              href={`https://www.google.com/maps?q=${place.latitude},${place.longitude}`}
              target="_blank"
            >
              <button style={btn}>📍 Map</button>
            </a>

            <button style={saveBtn}>{saved ? "❤️ Saved" : "🤍 Save"}</button>
            <button style={visitBtn}>{visited ? "✅ Visited" : "📍 Visit"}</button>
          </div>
        </div>

        <div style={mapBox}>
          <iframe
            width="100%"
            height="100%"
            src={`https://maps.google.com/maps?q=${place.latitude},${place.longitude}&z=15&output=embed`}
          />
        </div>
      </div>

      {/* 🍽 RESTAURANTS */}
      <h2>🍽 Nearby Restaurants</h2>
      <div style={scrollRow}>
        {restaurants.map((r, i) => (
          <div
            key={i}
            style={card}
            onClick={() =>
              window.open(
                `https://www.google.com/maps/search/?api=1&query=${r.lat},${r.lng}`
              )
            }
          >
            <h4>{r.name}</h4>
            <p>⭐ {r.rating}</p>
            <p style={{ color: "#aaa" }}>{r.address}</p>
            <p style={{ color: "#ff7a18" }}>
              {r.distance.toFixed(1)} km away
            </p>
          </div>
        ))}
      </div>

      {/* 📍 NEARBY PLACES */}
      <h2>📍 Nearby Places</h2>
      <div style={scrollRow}>
        {nearbyPlaces.map((p, i) => (
          <div
            key={i}
            style={card}
            onClick={() => navigate(`/place/${p.Name}`)}
          >
            <h4>{p.Name}</h4>
            <p>{p.City}</p>
            <p style={{ color: "#ff7a18" }}>
              {p.distance.toFixed(1)} km away
            </p>
          </div>
        ))}
      </div>

      {/* ⭐ REVIEWS */}
      <h2>⭐ Reviews</h2>

      <div style={reviewBox}>
        <textarea
          placeholder="Write your experience..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          style={textarea}
        />

        <div style={reviewControls}>
          <input
            type="number"
            min="1"
            max="5"
            value={ratingInput}
            onChange={(e) => setRatingInput(e.target.value)}
          />
          <button onClick={addReview} style={btn}>
            Submit
          </button>
        </div>
      </div>

      <div>
        {reviews.map((r, i) => (
          <div key={i} style={reviewCard}>
            <p>⭐ {r.rating}</p>
            <p>{r.text}</p>
            <small>{r.user}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlaceDetails;

/* ================= STYLES ================= */

const container = { padding: "30px", color: "white" };

const backBtn = {
  position: "fixed",
  top: "20px",
  left: "20px",
};

const imageRow = {
  display: "flex",
  gap: "12px",
  overflowX: "auto",
};

const imgStyle = {
  height: "170px",
  borderRadius: "14px",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "30px",
};

const mapBox = { borderRadius: "20px", overflow: "hidden" };

const btnRow = { display: "flex", gap: "10px" };

const btn = {
  padding: "10px",
  background: "#ff7a18",
  borderRadius: "10px",
};

const saveBtn = { padding: "10px", background: "#ef4444", borderRadius: "10px" };
const visitBtn = { padding: "10px", background: "#22c55e", borderRadius: "10px" };

const scrollRow = {
  display: "flex",
  gap: "15px",
  overflowX: "auto",
};

const card = {
  minWidth: "230px",
  background: "rgba(255,255,255,0.05)",
  padding: "15px",
  borderRadius: "15px",
  backdropFilter: "blur(10px)",
};

const reviewBox = {
  marginTop: "20px",
};

const textarea = {
  width: "100%",
  height: "80px",
  borderRadius: "10px",
  padding: "10px",
};

const reviewControls = {
  display: "flex",
  gap: "10px",
  marginTop: "10px",
};

const reviewCard = {
  background: "#1f2937",
  padding: "10px",
  borderRadius: "10px",
  marginTop: "10px",
};