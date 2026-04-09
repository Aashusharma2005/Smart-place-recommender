import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Card from "./components/Card";
import PlaceDetails from "./components/PlaceDetails";
import Explore from "./components/explore";
import Saved from "./components/saved";
import Auth from "./components/Auth";
import Profile from "./components/profile";

// ✅ ADD THIS IMPORT
import AITripPlanner from "./components/AITripPlanner";

// 🔥 HOME (PUBLIC)
function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");

  return (
    <div style={{ background: "#0f0f0f", minHeight: "100vh", color: "white" }}>
      <Hero search={search} setSearch={setSearch} />

      <Card
        searchData={search}
        category={category}
        budget={budget}
      />
    </div>
  );
}

// 🔒 PROTECTED ROUTE
function ProtectedRoute({ user, children, loading }) {

  if (loading) return null;

  if (!user) return <Navigate to="/auth" />;

  return children;
}

// 🔥 MAIN APP
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <>
      <Navbar />

      <Routes>

        {/* ✅ PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />

        {/* 🔒 PROTECTED */}
        <Route
          path="/place/:name"
          element={
            <ProtectedRoute user={user} loading={loading}>
              <PlaceDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/explore"
          element={
            <ProtectedRoute user={user} loading={loading}>
              <Explore />
            </ProtectedRoute>
          }
        />

        <Route
          path="/saved"
          element={
            <ProtectedRoute user={user} loading={loading}>
              <Saved />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute user={user} loading={loading}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* ✅ NEW TRIP PLANNER ROUTE */}
        <Route
          path="/trip-planner"
          element={
            <ProtectedRoute user={user} loading={loading}>
              <AITripPlanner />
            </ProtectedRoute>
          }
        />

        {/* 🔁 DEFAULT */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </>
  );
}

export default App;