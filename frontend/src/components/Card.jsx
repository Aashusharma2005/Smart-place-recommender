import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

function Card({ place }) {

  if (!place || typeof place !== "object") return null;

  const [user, setUser] = useState(null);
  const [image, setImage] = useState("");
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const imagesRef = useRef({});

  // =============================
  // 🔥 USER LOAD
  // =============================
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser"));
    setUser(storedUser);
  }, []);

  // =============================
  // 🔥 SAVED SYNC
  // =============================
  useEffect(() => {
    if (!user?.email) return;

    const key = `savedPlaces_${user.email}`;
    const list = JSON.parse(localStorage.getItem(key)) || [];
    setSavedPlaces(list);

    const sync = () => {
      const updated = JSON.parse(localStorage.getItem(key)) || [];
      setSavedPlaces(updated);
    };

    window.addEventListener("savedUpdated", sync);
    return () => window.removeEventListener("savedUpdated", sync);

  }, [user?.email]);

  // =============================
  // 🔥 IMAGE FETCH (FIXED + SMART)
  // =============================
  useEffect(() => {
    if (!place?.Name) return;

    if (imagesRef.current[place.Name]) {
      setImage(imagesRef.current[place.Name]);
      setLoading(false);
      return;
    }

    const fetchImage = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:5000/place-image?q=${encodeURIComponent(
            `${place.Name} ${place.City}`
          )}`
        );

        const data = await res.json();

        let img = "";

        if (Array.isArray(data?.images) && data.images.length > 0) {
          img = data.images[0];
        }

        // fallback
        if (!img) {
          img = `https://source.unsplash.com/400x300/?${place.Name},${place.City}`;
        }

        imagesRef.current[place.Name] = img;
        setImage(img);

      } catch {
        const fallback = `https://source.unsplash.com/400x300/?travel,${place.City}`;
        imagesRef.current[place.Name] = fallback;
        setImage(fallback);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [place]);

  // =============================
  // 🔥 SAVE
  // =============================
  const toggleSave = (e) => {
    e.stopPropagation();

    if (!user) {
      alert("Login first ❌");
      return;
    }

    const key = `savedPlaces_${user.email}`;
    let list = JSON.parse(localStorage.getItem(key)) || [];

    const exists = list.some((p) => p?.Name === place?.Name);

    if (exists) {
      list = list.filter((p) => p?.Name !== place?.Name);
    } else {
      list.push({
        ...place,
        Image: image,
      });
    }

    localStorage.setItem(key, JSON.stringify(list));
    setSavedPlaces(list);

    window.dispatchEvent(new Event("savedUpdated"));
  };

  // =============================
  // 🔥 PRICE
  // =============================
  let rawPrice = place?.["Entrance Fee in INR"];
  let price;

  if (rawPrice === "Free" || rawPrice === "0" || rawPrice === 0) {
    price = "Free";
  } else {
    const num = Number(rawPrice);
    price = isNaN(num) ? "Free" : `₹ ${num}`;
  }

  // =============================
  // 🔥 RATING
  // =============================
  let rating = Number(place?.["Google review rating"]);
  if (isNaN(rating) || rating <= 0) rating = 4.0;

  const isSaved = savedPlaces.some(
    (p) => p?.Name === place?.Name
  );

  return (
    <>
      <div
        style={card}
        className="netflix-card"
        onClick={() =>
          place?.Name &&
          navigate(`/place/${encodeURIComponent(place.Name)}`)
        }
      >
        {/* IMAGE */}
        <div style={imageContainer}>
          
          {/* LOADING SHIMMER */}
          {loading && <div className="shimmer"></div>}

          <img
            src={image}
            alt={place?.Name}
            style={{
              ...img,
              opacity: loading ? 0 : 1
            }}
          />

          <div style={overlay}></div>

          {/* SAVE */}
          <button onClick={toggleSave} style={saveBtn}>
            {isSaved ? "❤️" : "🤍"}
          </button>

          {/* BADGE */}
          {place?.Type === "Hidden Gem" && (
            <span style={badge}>Hidden Gem</span>
          )}

          {/* TEXT */}
          <div style={imageText}>
            <h3 style={placeName}>{place?.Name}</h3>
            <p>{place?.City}</p>
          </div>
        </div>

        {/* DETAILS */}
        <div style={details}>
          <span style={type}>{place?.Type || "Place"}</span>

          <div style={infoRow}>
            <span>{price}</span>
            <span>⭐ {rating}</span>
          </div>

          <button style={btn}>View Details →</button>
        </div>
      </div>

      {/* 🔥 NETFLIX STYLE */}
      <style>{`
        .netflix-card {
          backdrop-filter: blur(16px);
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          transition: all 0.4s ease;
          position: relative;
        }

        .netflix-card:hover {
          transform: scale(1.08);
          z-index: 10;
          box-shadow: 0 30px 80px rgba(0,0,0,0.8);
          border: 1px solid rgba(255,122,24,0.6);
        }

        .netflix-card img {
          transition: 0.6s ease;
        }

        .netflix-card:hover img {
          transform: scale(1.15);
        }

        .shimmer {
          position: absolute;
          width: 100%;
          height: 150px;
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.05) 25%,
            rgba(255,255,255,0.2) 50%,
            rgba(255,255,255,0.05) 75%
          );
          animation: shimmer 1.5s infinite;
          border-radius: 12px;
        }

        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }
      `}</style>
    </>
  );
}

export default Card;


/* ================= STYLES ================= */

const card = {
  minWidth: "240px",
  width: "240px",
  borderRadius: "18px",
  overflow: "hidden",
  cursor: "pointer",
};

const imageContainer = {
  position: "relative",
};

const img = {
  width: "100%",
  height: "150px",
  objectFit: "cover",
  transition: "0.4s",
};

const overlay = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
};

const saveBtn = {
  position: "absolute",
  top: "10px",
  right: "10px",
  background: "rgba(0,0,0,0.6)",
  border: "none",
  padding: "6px",
  borderRadius: "50%",
  fontSize: "16px",
  cursor: "pointer",
};

const badge = {
  position: "absolute",
  bottom: "10px",
  left: "10px",
  background: "linear-gradient(45deg, #ff7a18, #ff3d3d)",
  padding: "4px 8px",
  borderRadius: "6px",
  fontSize: "12px",
};

const imageText = {
  position: "absolute",
  bottom: "10px",
  left: "10px",
  color: "white",
};

const placeName = {
  margin: 0,
};

const details = {
  padding: "12px",
};

const type = {
  fontSize: "12px",
  color: "#ccc",
};

const infoRow = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "6px",
};

const btn = {
  marginTop: "12px",
  width: "100%",
  padding: "9px",
  background: "linear-gradient(45deg, #ff7a18, #ff3d3d)",
  border: "none",
  borderRadius: "10px",
  color: "white",
  cursor: "pointer",
};