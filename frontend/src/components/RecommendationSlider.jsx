import React, { useEffect, useRef } from "react";
import Card from "./Card";
import places from "../data/places.json";
import hiddenGems from "../data/hiddengems.json";

function RecommendationSlider() {
  const scrollRef = useRef();

  const allPlaces = [...places, ...hiddenGems];

  const recommended = allPlaces.slice(0, 12); // top 12

  // 🔥 AUTO SLIDE
  useEffect(() => {
    const interval = setInterval(() => {
      const container = scrollRef.current;

      if (!container) return;

      if (
        container.scrollLeft + container.clientWidth >=
        container.scrollWidth
      ) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: 260, behavior: "smooth" });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <div style={container}>
      <h2 style={title}>✨ Recommended For You</h2>

      <div style={wrapper}>
        <button style={leftBtn} onClick={scrollLeft}>⬅️</button>

        <div style={slider} ref={scrollRef}>
          {recommended.map((p, i) => (
            <Card key={i} place={p} />
          ))}
        </div>

        <button style={rightBtn} onClick={scrollRight}>➡️</button>
      </div>
    </div>
  );
}

export default RecommendationSlider;

/* 🔥 STYLES */

const container = {
  marginTop: "40px",
};

const title = {
  fontSize: "24px",
  marginBottom: "15px",
};

const wrapper = {
  position: "relative",
  display: "flex",
  alignItems: "center",
};

const slider = {
  display: "flex",
  gap: "20px",
  overflowX: "auto",
  scrollBehavior: "smooth",
  padding: "10px",
};

const leftBtn = {
  position: "absolute",
  left: "-10px",
  zIndex: 2,
  background: "#1f1f1f",
  border: "none",
  padding: "10px",
  borderRadius: "50%",
  cursor: "pointer",
};

const rightBtn = {
  position: "absolute",
  right: "-10px",
  zIndex: 2,
  background: "#1f1f1f",
  border: "none",
  padding: "10px",
  borderRadius: "50%",
  cursor: "pointer",
};