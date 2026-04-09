import React from "react";
import places from "../data/places.json";
import hiddenGems from "../data/hiddengems.json";
import Card from "./Card";

function Trending() {
  // 🔥 Merge data
  const allPlaces = [...places, ...hiddenGems];

  // 🔥 Sort by rating (top places)
  const trendingPlaces = [...allPlaces]
    .sort(
      (a, b) =>
        (b["Google review rating"] || 0) -
        (a["Google review rating"] || 0)
    )
    .slice(0, 20);

  return (
    <div style={container}>
      <h2 style={title}>🔥 Trending Now</h2>

      {/* Reuse Card */}
      <Card
        searchData=""
        category=""
        budget=""
      />
    </div>
  );
}

export default Trending;

/* STYLES */

const container = {
  padding: "40px",
};

const title = {
  color: "white",
  fontSize: "26px",
  marginBottom: "20px",
};