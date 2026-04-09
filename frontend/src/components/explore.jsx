import React, { useState, useEffect } from "react";
import places from "../data/places.json";
import hiddenGems from "../data/hiddengems.json";
import Card from "./Card";

function Explore() {
  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState("");
  const [rating, setRating] = useState("");
  const [budget, setBudget] = useState("");
  const [sort, setSort] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [visible, setVisible] = useState(false);

  const allPlaces = [...places, ...hiddenGems];

  useEffect(() => {
    setVisible(true);
  }, []);

  const categories = [
    "All","Temple","Beach","Fort","Nature","Mall","Hidden","Park","Museum"
  ];

  // 🔍 SEARCH + SUGGESTIONS
  const handleSearch = (value) => {
    setSearchText(value);

    if (value.length > 0) {
      const search = value.toLowerCase();

      const filtered = allPlaces
        .filter((p) =>
          p["Name"]?.toLowerCase().includes(search) ||
          p["City"]?.toLowerCase().includes(search) ||
          p["Type"]?.toLowerCase().includes(search)
        )
        .slice(0, 6);

      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  // 🔥 ENTER SEARCH
  const handleEnter = (e) => {
    if (e.key === "Enter") {
      setSuggestions([]);
    }
  };

  // 🔍 FILTER + SMART SEARCH
  let filteredPlaces = allPlaces.filter((place) => {
    const search = searchText.toLowerCase();

    return (
      (search === "" ||
        place["Name"]?.toLowerCase().includes(search) ||
        place["City"]?.toLowerCase().includes(search) ||
        place["Type"]?.toLowerCase().includes(search)) &&

      (category === "" ||
        category === "All" ||
        (category === "Hidden"
          ? place["Type"]?.toLowerCase().includes("hidden")
          : place["Type"] === category)) &&

      (rating === "" ||
        Number(place["Google review rating"]) >= Number(rating)) &&

      (budget === "" ||
        Number(place["Entrance Fee in INR"]) <= Number(budget))
    );
  });

  // 🔥 SMART SORT (search priority)
  if (searchText) {
    const s = searchText.toLowerCase();
    filteredPlaces.sort((a, b) => {
      const aScore = a.Name.toLowerCase().startsWith(s) ? 2 : 1;
      const bScore = b.Name.toLowerCase().startsWith(s) ? 2 : 1;
      return bScore - aScore;
    });
  }

  // 🔥 SORT
  if (sort === "rating") {
    filteredPlaces.sort(
      (a, b) =>
        Number(b["Google review rating"]) -
        Number(a["Google review rating"])
    );
  } else if (sort === "price") {
    filteredPlaces.sort(
      (a, b) =>
        Number(a["Entrance Fee in INR"]) -
        Number(b["Entrance Fee in INR"])
    );
  }

  const clearFilters = () => {
    setSearchText("");
    setCategory("");
    setRating("");
    setBudget("");
    setSort("");
  };

  const getTitle = () => {
    if (searchText) return `🔍 Results for "${searchText}"`;
    if (category && category !== "All") return `✨ ${category} Places`;
    return "✨ Explore Places";
  };

  return (
    <div style={{ ...container, opacity: visible ? 1 : 0 }}>
      <h1 style={title}>✨ Explore India</h1>

      {/* 🔥 FILTER BAR */}
      <div style={stickyBar}>
        <div style={chipContainer}>
          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => setCategory(cat)}
              style={{
                ...chip,
                background:
                  category === cat
                    ? "linear-gradient(45deg,#ff6a00,#ee0979)"
                    : "rgba(255,255,255,0.08)",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={searchBox}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="🔍 Search city, place, category..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={handleEnter}
              style={input}
            />

            {suggestions.length > 0 && (
              <div style={suggestionBox}>
                {suggestions.map((item, i) => (
                  <div
                    key={i}
                    style={suggestionItem}
                    onClick={() => {
                      setSearchText(item["Name"]);
                      setSuggestions([]);
                    }}
                  >
                    <strong>{item["Name"]}</strong>
                    <div style={{ fontSize: "12px", opacity: 0.7 }}>
                      {item["City"]} • {item["Type"]}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <select onChange={(e) => setRating(e.target.value)} style={select}>
            <option value="">Rating</option>
            <option value="4">4+ ⭐</option>
            <option value="4.5">4.5+ ⭐</option>
          </select>

          <input
            type="number"
            placeholder="💸 Max Budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            style={inputSmall}
          />

          <select onChange={(e) => setSort(e.target.value)} style={select}>
            <option value="">Sort</option>
            <option value="rating">⭐ Rating High → Low</option>
            <option value="price">💸 Price Low → High</option>
          </select>

          <button onClick={clearFilters} style={clearBtn}>
            Clear
          </button>
        </div>
      </div>

      <h2 style={sectionTitle}>{getTitle()}</h2>

      {/* 🔥 CARDS GRID */}
      <div style={grid}>
        {filteredPlaces.length > 0 ? (
          filteredPlaces.map((place, index) => (
            <div key={index} style={cardWrapper}>
              <Card place={place} />
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center" }}>
            <p>No results 😕</p>
            <button onClick={clearFilters} style={clearBtn}>
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* 🎨 SAME STYLES (UNCHANGED) */

const container = {
  padding: "25px",
  paddingTop: "110px",
  color: "white",
  transition: "0.6s",
};

const title = {
  textAlign: "center",
  fontSize: "44px",
  marginBottom: "25px",
  background: "linear-gradient(45deg,#ff6a00,#ee0979)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const stickyBar = {
  position: "sticky",
  top: "70px",
  zIndex: 100,
  padding: "15px",
  borderRadius: "18px",
  backdropFilter: "blur(15px)",
  background: "rgba(20,20,20,0.7)",
  boxShadow: "0 8px 25px rgba(0,0,0,0.5)",
  marginBottom: "25px",
};

const chipContainer = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  justifyContent: "center",
  marginBottom: "10px",
};

const chip = {
  padding: "8px 16px",
  borderRadius: "25px",
  border: "none",
  color: "white",
  cursor: "pointer",
  transition: "0.3s",
};

const searchBox = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  justifyContent: "center",
};

const input = {
  padding: "12px",
  borderRadius: "12px",
  width: "240px",
  border: "1px solid rgba(255,255,255,0.2)",
  background: "#1e1e1e",
  color: "white",
};

const inputSmall = {
  ...input,
  width: "150px",
};

const select = {
  padding: "12px",
  borderRadius: "12px",
};

const clearBtn = {
  padding: "12px",
  borderRadius: "12px",
  background: "#ff4444",
  color: "white",
  border: "none",
  cursor: "pointer",
};

const suggestionBox = {
  position: "absolute",
  top: "50px",
  width: "100%",
  background: "#2a2a2a",
  borderRadius: "12px",
  zIndex: 10,
};

const suggestionItem = {
  padding: "10px",
  cursor: "pointer",
  borderBottom: "1px solid #444",
};

const sectionTitle = {
  textAlign: "center",
  margin: "20px 0",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
  gap: "25px",
};

const cardWrapper = {
  transition: "0.4s",
};

export default Explore;