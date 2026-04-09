import React from "react";
import { useNavigate } from "react-router-dom";
import RecommendationSlider from "./RecommendationSlider";

function Hero() {
  const navigate = useNavigate();

  return (
    <>
      <div style={hero}>
        <div style={bg}></div>
        <div style={overlay}></div>

        <div style={content}>
          <h1 style={heading} className="fade-in">
            Discover Hidden Gems of India{" "}
            <span className="spark">✨</span>
          </h1>

          <p style={subtitle} className="fade-in delay">
            Handpicked destinations. Smart recommendations. Discover places
            beyond the ordinary.
          </p>

          {/* 🚀 BUTTON */}
          <div style={{ marginTop: "30px" }} className="fade-in delay2">
            <button
              style={exploreBtn}
              className="glow-btn"
              onClick={() => navigate("/explore")}
            >
              Explore Places →
            </button>
          </div>
        </div>

        {/* 🔥 ANIMATIONS */}
        <style>{`
          @keyframes zoom {
            from { transform: scale(1); }
            to { transform: scale(1.1); }
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes glow {
            0% { box-shadow: 0 0 10px rgba(255,122,24,0.5); }
            50% { box-shadow: 0 0 30px rgba(255,61,61,0.8); }
            100% { box-shadow: 0 0 10px rgba(255,122,24,0.5); }
          }

          @keyframes sparkle {
            0% { transform: scale(1); }
            50% { transform: scale(1.3); }
            100% { transform: scale(1); }
          }

          .fade-in {
            animation: fadeIn 1s ease forwards;
          }

          .delay {
            animation-delay: 0.5s;
          }

          .delay2 {
            animation-delay: 1s;
          }

          .glow-btn {
            animation: glow 2s infinite;
          }

          .glow-btn:hover {
            transform: scale(1.07);
          }

          .spark {
            display: inline-block;
            animation: sparkle 1.5s infinite;
          }
        `}</style>
      </div>

      {/* 🔥 RECOMMENDATION SECTION */}
      <div style={recommendWrapper}>
        <RecommendationSlider />
      </div>
    </>
  );
}

export default Hero;

/* ================= STYLES ================= */

const hero = {
  height: "92vh",
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
};

const bg = {
  position: "absolute",
  width: "100%",
  height: "100%",
  backgroundImage:
    "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  animation: "zoom 20s infinite alternate",
};

const overlay = {
  position: "absolute",
  width: "100%",
  height: "100%",
  background:
    "linear-gradient(to bottom, rgba(0,0,0,0.75), rgba(0,0,0,0.95))",
  zIndex: 1,
};

const content = {
  position: "relative",
  zIndex: 2,
  textAlign: "center",
  color: "white",
  maxWidth: "700px",
  padding: "20px",
};

const heading = {
  fontSize: "52px",
  fontWeight: "800",
  marginBottom: "15px",
  lineHeight: "1.2",
  textShadow: "0 0 25px rgba(255,122,24,0.5)",
};

const subtitle = {
  fontSize: "18px",
  marginBottom: "10px",
  color: "#d1d5db",
};

const exploreBtn = {
  padding: "14px 32px",
  borderRadius: "30px",
  border: "none",
  fontSize: "16px",
  fontWeight: "600",
  background: "linear-gradient(45deg, #ff7a18, #ff3d3d)",
  color: "white",
  cursor: "pointer",
  transition: "0.3s",
};

const recommendWrapper = {
  padding: "50px 20px",
  background: "#020617",
};