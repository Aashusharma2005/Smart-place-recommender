import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

function Saved() {
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    let currentUser = null;

    const loadSaved = (u) => {
      if (!u) return;

      const key = `savedPlaces_${u.email}`;
      const data = JSON.parse(localStorage.getItem(key)) || [];
      setSavedPlaces(data);
      setLoading(false);
    };

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        currentUser = { email: firebaseUser.email };
        setUser(currentUser);
        loadSaved(currentUser);
      } else {
        setUser(null);
        setSavedPlaces([]);
        setLoading(false);
      }
    });

    const sync = () => {
      if (currentUser) loadSaved(currentUser);
    };

    window.addEventListener("savedUpdated", sync);
    window.addEventListener("storage", sync);

    return () => {
      unsubscribe();
      window.removeEventListener("savedUpdated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // REMOVE
  const removePlace = (e, name) => {
    e.stopPropagation(); // 🔥 IMPORTANT FIX

    if (!user) return;
    if (!window.confirm("Remove this place?")) return;

    const key = `savedPlaces_${user.email}`;
    const updated = savedPlaces.filter((p) => p.Name !== name);

    setSavedPlaces(updated);
    localStorage.setItem(key, JSON.stringify(updated));
    window.dispatchEvent(new Event("savedUpdated"));
  };

  // CLEAR
  const clearAll = () => {
    if (!user) return;
    if (!window.confirm("Clear all saved places?")) return;

    const key = `savedPlaces_${user.email}`;
    localStorage.removeItem(key);

    setSavedPlaces([]);
    window.dispatchEvent(new Event("savedUpdated"));
  };

  const filtered = savedPlaces.filter((p) =>
    (p.Name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={container}>
      <h1 style={title}>❤️ Saved Places</h1>

      <input
        type="text"
        placeholder="Search saved places..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={searchBox}
      />

      {user && savedPlaces.length > 0 && (
        <button style={clearBtn} onClick={clearAll}>
          🗑 Clear All
        </button>
      )}

      {loading ? (
        <p style={{ textAlign: "center" }}>Loading...</p>
      ) : !user ? (
        <div style={emptyBox}>
          <h2>🔐 Login to access saved places</h2>
          <button style={loginBtn} onClick={() => navigate("/auth")}>
            Continue with Google 🚀
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={emptyBox}>
          <h2>No saved places 😢</h2>
        </div>
      ) : (
        <div style={grid}>
          {filtered.map((place, index) => {
            let price = place["Entrance Fee in INR"];
            price =
              price === "Free" || price === "0" || price === 0
                ? 0
                : Number(price) || 0;

            let rating = Number(place["Google review rating"]);
            if (isNaN(rating)) rating = 4.0;

            return (
              <div
                key={index}
                style={card}
                className="hover-card"
                onClick={() =>
                  navigate(`/place/${encodeURIComponent(place.Name)}`)
                }
              >
                {/* IMAGE */}
                <div style={imgContainer}>
                  <img
                    src={
                      place.image ||
                      "https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg"
                    }
                    alt={place.Name}
                    style={img}
                  />

                  <div style={overlay}></div>

                  <div style={imgText}>
                    <h3>{place.Name}</h3>
                    <p>{place.City}</p>
                  </div>
                </div>

                {/* INFO */}
                <div style={clickArea}>
                  <div style={info}>
                    <span>💰 {price === 0 ? "Free" : `₹ ${price}`}</span>
                    <span>⭐ {rating}</span>
                  </div>
                </div>

                {/* REMOVE */}
                <button
                  style={removeBtn}
                  onClick={(e) => removePlace(e, place.Name)}
                >
                  ❌ Remove
                </button>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .hover-card {
          transition: all 0.3s ease;
        }

        .hover-card:hover {
          transform: translateY(-8px) scale(1.03);
          box-shadow: 0 20px 50px rgba(255,122,24,0.3);
        }

        .hover-card img {
          transition: 0.4s;
        }

        .hover-card:hover img {
          transform: scale(1.08);
        }
      `}</style>
    </div>
  );
}

export default Saved;

/* STYLES */

const container = {
  padding: "30px",
  background: "linear-gradient(135deg, #020617, #0f172a)",
  minHeight: "100vh",
  color: "white",
};

const title = {
  textAlign: "center",
  marginBottom: "20px",
  fontSize: "32px",
};

const searchBox = {
  display: "block",
  margin: "0 auto 15px",
  padding: "12px",
  borderRadius: "10px",
  border: "none",
  width: "300px",
  background: "#1e293b",
  color: "white",
};

const clearBtn = {
  display: "block",
  margin: "0 auto 20px",
  padding: "10px",
  background: "linear-gradient(45deg, #ff7a18, #ff3d3d)",
  border: "none",
  borderRadius: "8px",
  color: "white",
};

const emptyBox = {
  textAlign: "center",
  marginTop: "50px",
};

const loginBtn = {
  marginTop: "10px",
  padding: "10px 20px",
  borderRadius: "8px",
  background: "linear-gradient(45deg, #ff7a18, #ff3d3d)",
  border: "none",
  color: "white",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
  gap: "20px",
};

const card = {
  borderRadius: "16px",
  overflow: "hidden",
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(10px)",
  cursor: "pointer",
};

const imgContainer = {
  position: "relative",
};

const img = {
  width: "100%",
  height: "150px",
  objectFit: "cover",
};

const overlay = {
  position: "absolute",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  pointerEvents: "none", // 🔥 FIX
};

const imgText = {
  position: "absolute",
  bottom: "10px",
  left: "10px",
};

const clickArea = {
  padding: "10px",
};

const info = {
  display: "flex",
  justifyContent: "space-between",
};

const removeBtn = {
  width: "100%",
  padding: "10px",
  background: "#ef4444",
  border: "none",
  color: "white",
  cursor: "pointer",
};