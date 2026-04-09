import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return null;

  // 🔒 NOT LOGGED IN UI
  if (!user) {
    return (
      <div style={container}>
        <div style={card}>
          <h1 style={lock}>🔒</h1>

          <h2 style={title}>
            Login to unlock the full experience ✨
          </h2>

          <p style={desc}>
            Discover hidden gems, save your favorites, and explore India like never before.
          </p>

          <button
            style={btn}
            onClick={() => navigate("/auth")}
          >
            Continue with Google 🚀
          </button>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;


// STYLES
const container = {
  height: "90vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#0f172a",
};

const card = {
  background: "rgba(255,255,255,0.05)",
  padding: "40px",
  borderRadius: "20px",
  textAlign: "center",
  backdropFilter: "blur(10px)",
  boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
};

const lock = {
  fontSize: "50px",
};

const title = {
  color: "white",
};

const desc = {
  color: "#cbd5e1",
  fontSize: "14px",
  margin: "10px 0 20px",
};

const btn = {
  background: "#ff7a18",
  border: "none",
  padding: "12px 20px",
  borderRadius: "10px",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};