import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import places from "../data/places.json";
import hiddenGems from "../data/hiddengems.json";
import Card from "./Card";

/* STYLES */
const container = {
  padding: "40px",
  background: "linear-gradient(135deg, #0f172a, #020617)",
  minHeight: "100vh",
  color: "white",
};

const headerCard = {
  textAlign: "center",
  padding: "40px",
  borderRadius: "25px",
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(25px)",
  boxShadow: "0 10px 50px rgba(0,0,0,0.7)",
  marginBottom: "30px",
};

const avatar = {
  width: "110px",
  height: "110px",
  borderRadius: "50%",
  background: "#1e293b",
  border: "3px solid #00f7ff",
};

const primaryBtn = {
  marginTop: "15px",
  padding: "10px 20px",
  background: "#3b82f6",
  borderRadius: "10px",
  color: "white",
  border: "none",
};

const statsRow = {
  display: "flex",
  gap: "20px",
  marginTop: "30px",
};

const statCard = {
  flex: 1,
  background: "rgba(255,255,255,0.05)",
  padding: "25px",
  borderRadius: "15px",
  textAlign: "center",
  cursor: "pointer",
};

const section = { marginTop: "40px" };
const sectionTitle = { fontSize: "22px" };

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(250px,1fr))",
  gap: "20px",
};

const reviewCard = {
  background: "#1e293b",
  padding: "12px",
  borderRadius: "10px",
  marginBottom: "10px",
};

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(null);

  const [name, setName] = useState("");
  const [image, setImage] = useState("");

  const [saved, setSaved] = useState([]);
  const [visited, setVisited] = useState([]);
  const [userReviews, setUserReviews] = useState([]);

  const [sortType, setSortType] = useState("latest");
  const [editIndex, setEditIndex] = useState(null);
  const [editText, setEditText] = useState("");

  const allPlaces = [...places, ...hiddenGems];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const currentUser = {
        email: firebaseUser.email,
        name: firebaseUser.displayName || "User",
        image: firebaseUser.photoURL || "",
      };

      setUser(currentUser);
      setName(currentUser.name);
      setImage(currentUser.image);

      loadUserData(currentUser.email);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const update = () => {
      if (user) loadUserData(user.email);
    };

    window.addEventListener("savedUpdated", update);
    return () => window.removeEventListener("savedUpdated", update);
  }, [user]);

  const loadUserData = (email) => {
    const savedData =
      JSON.parse(localStorage.getItem(`savedPlaces_${email}`)) || [];

    const visitedData =
      JSON.parse(localStorage.getItem(`visitedPlaces_${email}`)) || [];

    setSaved(savedData);
    setVisited(visitedData);

    const allReviews = JSON.parse(localStorage.getItem("reviews")) || {};
    let userRev = [];

    for (let place in allReviews) {
      allReviews[place].forEach((r) => {
        if (r.user === email) {
          userRev.push({ ...r, place });
        }
      });
    }

    setUserReviews(userRev);
  };

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const saveProfile = () => {
    const updatedUser = { ...user, name, image };
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setEditMode(false);
  };

  // ✅ UPDATED LOGOUT WITH CONFIRMATION
  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    await signOut(auth);
    localStorage.clear();
    navigate("/auth");
  };

  const handleToggle = (tab) => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  const sortedReviews = [...userReviews].sort((a, b) => {
    if (sortType === "latest") return new Date(b.date) - new Date(a.date);
    return b.rating - a.rating;
  });

  const deleteReview = (index) => {
    let updated = sortedReviews.filter((_, i) => i !== index);

    let newObj = {};
    updated.forEach((r) => {
      if (!newObj[r.place]) newObj[r.place] = [];
      newObj[r.place].push(r);
    });

    localStorage.setItem("reviews", JSON.stringify(newObj));
    loadUserData(user.email);
  };

  const startEdit = (i, text) => {
    setEditIndex(i);
    setEditText(text);
  };

  const saveEdit = (index) => {
    let updated = sortedReviews.map((r, i) =>
      i === index ? { ...r, text: editText } : r
    );

    let newObj = {};
    updated.forEach((r) => {
      if (!newObj[r.place]) newObj[r.place] = [];
      newObj[r.place].push(r);
    });

    localStorage.setItem("reviews", JSON.stringify(newObj));
    setEditIndex(null);
    loadUserData(user.email);
  };

  if (loading) return null;
  if (!user) return null;

  return (
    <div style={container}>
      <div style={headerCard}>
        {image ? (
          <img src={image} style={avatar} alt="profile" />
        ) : (
          <div style={avatar}>{(name || "U")[0]}</div>
        )}

        <h2>{name}</h2>
        <p>{user.email}</p>

        {/* ❌ EDIT PROFILE BUTTON REMOVED */}

        <button
          style={{ ...primaryBtn, background: "#ef4444", marginLeft: "10px" }}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      <div style={statsRow}>
        <div style={statCard} onClick={() => handleToggle("visited")}>
          <h3>{visited.length}</h3>
          <p>Visited</p>
        </div>

        <div style={statCard} onClick={() => handleToggle("saved")}>
          <h3>{saved.length}</h3>
          <p>Saved</p>
        </div>

        <div style={statCard} onClick={() => handleToggle("reviews")}>
          <h3>{userReviews.length}</h3>
          <p>Reviews</p>
        </div>
      </div>

      {activeTab === "visited" && (
        <section style={section}>
          <h2 style={sectionTitle}>Visited Places 📍</h2>
          <div style={grid}>
            {visited.map((p, i) => (
              <Card key={i} place={p} />
            ))}
          </div>
        </section>
      )}

      {activeTab === "saved" && (
        <section style={section}>
          <h2 style={sectionTitle}>Saved Places ❤️</h2>
          <div style={grid}>
            {saved.map((p, i) => (
              <Card key={i} place={p} />
            ))}
          </div>
        </section>
      )}

      {activeTab === "reviews" && (
        <section style={section}>
          <h2 style={sectionTitle}>My Reviews ⭐</h2>

          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
          >
            <option value="latest">Latest</option>
            <option value="rating">Highest Rating</option>
          </select>

          {sortedReviews.map((r, i) => (
            <div key={i} style={reviewCard}>
              <p><b>{r.place}</b></p>
              <p>{"⭐".repeat(r.rating)}</p>

              {editIndex === i ? (
                <>
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <button onClick={() => saveEdit(i)}>Save</button>
                </>
              ) : (
                <p>{r.text}</p>
              )}

              <button onClick={() => startEdit(i, r.text)}>✏️</button>
              <button onClick={() => deleteReview(i)}>🗑️</button>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

export default Profile;