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
  // DISTANCE FUNCTION
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
  // IMAGES
  // =============================
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/place-image?q=${place.Name} ${place.City}`
        );

        const data = await response.json();

        console.log("Images:", data);

        const validImages = (data.images || [])
          .filter(
            (img) =>
              img &&
              img.startsWith("http")
          )
          .slice(0, 4);

        setImages(validImages);

      } catch (error) {
        console.log("Image Fetch Error:", error);
        setImages([]);
      }
    };

    fetchImages();
  }, [place]);

  // =============================
  // RESTAURANTS
  // =============================
  useEffect(() => {

    if (!place.latitude || !place.longitude) return;

    fetch(
      `http://127.0.0.1:5000/nearby-restaurants?lat=${place.latitude}&lng=${place.longitude}`
    )
      .then((res) => res.json())
      .then((data) => {

        console.log("Restaurants:", data);

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
      })
      .catch((err) => {
        console.log("Restaurant Error:", err);
      });

  }, [place]);

  // =============================
  // NEARBY PLACES
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
  // LOAD REVIEWS
  // =============================
  useEffect(() => {
    const allReviews = JSON.parse(localStorage.getItem("reviews")) || {};
    setReviews(allReviews[place.Name] || []);
  }, [place]);

  // =============================
  // LOAD SAVE/VISITED STATUS
  // =============================
  useEffect(() => {
    if (!user) return;

    const savedKey = `savedPlaces_${user.email}`;
    const visitedKey = `visitedPlaces_${user.email}`;

    const savedPlaces =
      JSON.parse(localStorage.getItem(savedKey)) || [];

    const visitedPlaces =
      JSON.parse(localStorage.getItem(visitedKey)) || [];

    setSaved(
      savedPlaces.some((p) => p.Name === place.Name)
    );

    setVisited(
      visitedPlaces.some((p) => p.Name === place.Name)
    );

  }, [place, user]);

  // =============================
  // SAVE PLACE
  // =============================
  const handleSave = () => {

    if (!user) {
      alert("Login first ❌");
      return;
    }

    const key = `savedPlaces_${user.email}`;

    let savedPlaces =
      JSON.parse(localStorage.getItem(key)) || [];

    const alreadySaved =
      savedPlaces.find((p) => p.Name === place.Name);

    if (alreadySaved) {

      savedPlaces = savedPlaces.filter(
        (p) => p.Name !== place.Name
      );

      setSaved(false);

    } else {

      const placeData = {
        ...place,
        image:
          images[0] ||
          "https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg",
      };

      savedPlaces.push(placeData);

      setSaved(true);
    }

    localStorage.setItem(
      key,
      JSON.stringify(savedPlaces)
    );

    window.dispatchEvent(new Event("savedUpdated"));
  };

  // =============================
  // VISITED
  // =============================
  const handleVisited = () => {

    if (!user) {
      alert("Login first ❌");
      return;
    }

    const key = `visitedPlaces_${user.email}`;

    let visitedPlaces =
      JSON.parse(localStorage.getItem(key)) || [];

    const alreadyVisited =
      visitedPlaces.find((p) => p.Name === place.Name);

    if (alreadyVisited) {

      visitedPlaces = visitedPlaces.filter(
        (p) => p.Name !== place.Name
      );

      setVisited(false);

    } else {

      visitedPlaces.push(place);

      setVisited(true);
    }

    localStorage.setItem(
      key,
      JSON.stringify(visitedPlaces)
    );
  };

  // =============================
  // ADD REVIEW
  // =============================
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
        {images.length > 0 ? (
          images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt="place"
              style={imgStyle}
              referrerPolicy="no-referrer"
              onClick={() => window.open(img)}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ))
        ) : (
          <p style={{ color: "white" }}>
            No Images Found
          </p>
        )}
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
              rel="noreferrer"
            >
              <button style={btn}>📍 Map</button>
            </a>

            <button
              style={saveBtn}
              onClick={handleSave}
            >
              {saved ? "❤️ Saved" : "🤍 Save"}
            </button>

            <button
              style={visitBtn}
              onClick={handleVisited}
            >
              {visited ? "✅ Visited" : "📍 Visit"}
            </button>

          </div>
        </div>

        {/* MAP */}
        <div style={mapBox}>
          <iframe
            title="map"
            width="100%"
            height="100%"
            src={`https://maps.google.com/maps?q=${place.latitude},${place.longitude}&z=15&output=embed`}
          />
        </div>

      </div>

      {/* RESTAURANTS */}
      <h2>🍽 Nearby Restaurants</h2>

      <div style={scrollRow}>
        {restaurants.length > 0 ? (
          restaurants.map((r, i) => (
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

              <p style={{ color: "#aaa" }}>
                {r.address}
              </p>

              <p style={{ color: "#ff7a18" }}>
                {r.distance.toFixed(1)} km away
              </p>
            </div>
          ))
        ) : (
          <p style={{ color: "white" }}>
            No Restaurants Found
          </p>
        )}
      </div>

      {/* NEARBY PLACES */}
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

      {/* REVIEWS */}
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

      {/* REVIEW LIST */}
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

const container = {
  padding: "30px",
  color: "white",
};

const backBtn = {
  position: "fixed",
  top: "20px",
  left: "20px",
};

const imageRow = {
  display: "flex",
  gap: "12px",
  overflowX: "auto",
  marginBottom: "20px",
};

const imgStyle = {
  height: "170px",
  width: "250px",
  objectFit: "cover",
  borderRadius: "14px",
  cursor: "pointer",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "30px",
};

const mapBox = {
  borderRadius: "20px",
  overflow: "hidden",
  minHeight: "350px",
};

const btnRow = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "14px",
  marginTop: "25px",
  flexWrap: "wrap",
};

const btn = {
  padding: "10px 18px",
  background: "#ff7a18",
  border: "none",
  borderRadius: "10px",
  color: "white",
  cursor: "pointer",
};

const saveBtn = {
  padding: "10px 18px",
  background: "#ef4444",
  border: "none",
  borderRadius: "10px",
  color: "white",
  cursor: "pointer",
};

const visitBtn = {
  padding: "10px 18px",
  background: "#22c55e",
  border: "none",
  borderRadius: "10px",
  color: "white",
  cursor: "pointer",
};

const scrollRow = {
  display: "flex",
  gap: "15px",
  overflowX: "auto",
  paddingBottom: "10px",
};

const card = {
  minWidth: "230px",
  background: "rgba(255,255,255,0.05)",
  padding: "15px",
  borderRadius: "15px",
  backdropFilter: "blur(10px)",
  cursor: "pointer",
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