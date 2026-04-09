import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";

function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const user = result.user;

      const newUser = {
        email: user.email,
        name: user.displayName,
        image: user.photoURL,
      };

      localStorage.setItem("currentUser", JSON.stringify(newUser));

      navigate("/");
    } catch (err) {
      console.log(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Explore India 🌍</h1>
        <p style={styles.subtitle}>Login to continue</p>

        <button
          onClick={handleGoogleLogin}
          style={styles.btn}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Continue with Google"}
        </button>
      </div>
    </div>
  );
}

// 🎨 PREMIUM STYLES (UPGRADED)
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background:
      "linear-gradient(135deg, #0f172a, #020617, #020617, #0f172a)",
  },

  card: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(20px)",
    padding: "40px",
    borderRadius: "20px",
    width: "320px",
    textAlign: "center",
    color: "white",
    boxShadow: "0 10px 40px rgba(0,0,0,0.7)",
    transition: "0.3s",
  },

  title: {
    marginBottom: "10px",
  },

  subtitle: {
    opacity: 0.7,
    marginBottom: "20px",
  },

  btn: {
    width: "100%",
    padding: "12px",
    marginTop: "10px",
    background: "linear-gradient(45deg, #ff5722, #ff9800)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "0.3s",
  },
};

export default Auth;