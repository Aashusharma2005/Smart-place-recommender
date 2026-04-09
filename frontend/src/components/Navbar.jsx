import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);

  // 🔥 USER SYNC (STABLE)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser({
          name: u.displayName,
          email: u.email,
          image: u.photoURL,
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // 🔓 LOGOUT SAFE
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate("/auth");
    } catch (err) {
      console.log(err);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div style={nav}>
      
      {/* LOGO */}
      <div style={logo} onClick={() => navigate("/")}>
        Explore<span style={{ color: "#ff7a18" }}>India</span>
      </div>

      {/* MENU */}
      <div style={menu}>
        
        <span
          style={isActive("/") ? activeLink : link}
          onClick={() => navigate("/")}
        >
          Home
        </span>

        {/* 🔥 EXPLORE */}
        <span
          style={{
            ...(isActive("/explore") ? activeLink : link),
            ...exploreStyle,
            ...(!user ? exploreGlow : {}),
          }}
          onClick={() => {
            if (!user) navigate("/auth");
            else navigate("/explore");
          }}
        >
          Explore ✨
        </span>

        {/* 🔥 PLAN TRIP (PREMIUM BUTTON STYLE) */}
        <span
          style={{
            ...(isActive("/trip-planner") ? activeBtn : tripBtn),
          }}
          onClick={() => {
            if (!user) navigate("/auth");
            else navigate("/trip-planner");
          }}
        >
          🧭 Plan Trip
        </span>

        {/* 🔥 SAVED */}
        {user && (
          <span
            style={isActive("/saved") ? activeLink : link}
            onClick={() => navigate("/saved")}
          >
            ❤️ Saved
          </span>
        )}
      </div>

      {/* RIGHT */}
      <div style={right}>
        {user ? (
          <div style={profileWrapper}>
            
            <div
              style={profile}
              onClick={() => navigate("/profile")}
            >
              {user.image ? (
                <img src={user.image} style={profileImg} alt="profile" />
              ) : (
                (user.name?.[0] || user.email?.[0]).toUpperCase()
              )}
            </div>

            {/* 🔥 LOGOUT BUTTON */}
            <button style={logoutBtn} onClick={logout}>
              Logout
            </button>

          </div>
        ) : (
          <button
            style={loginBtn}
            onClick={() => navigate("/auth")}
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
}

export default Navbar;

/////////////////////////////////////////////////////////
// 🔥 PREMIUM STYLES
/////////////////////////////////////////////////////////

const nav = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 30px",
  background: "rgba(15,23,42,0.85)",
  backdropFilter: "blur(20px)",
  color: "white",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  position: "sticky",
  top: 0,
  zIndex: 999,
};

const logo = {
  fontSize: "22px",
  fontWeight: "bold",
  cursor: "pointer",
  letterSpacing: "1px",
};

const menu = {
  display: "flex",
  gap: "28px",
  alignItems: "center",
};

const link = {
  cursor: "pointer",
  opacity: 0.7,
  transition: "0.3s",
};

const activeLink = {
  cursor: "pointer",
  color: "#ff7a18",
  borderBottom: "2px solid #ff7a18",
  paddingBottom: "3px",
};

const exploreStyle = {
  fontWeight: "bold",
  fontSize: "17px",
};

const exploreGlow = {
  color: "#ff7a18",
  textShadow: "0 0 12px rgba(255,122,24,0.8)",
};

/* 🔥 PREMIUM TRIP BUTTON */
const tripBtn = {
  padding: "8px 16px",
  borderRadius: "20px",
  background: "linear-gradient(45deg, #ff7a18, #ffb347)",
  cursor: "pointer",
  fontWeight: "bold",
  transition: "0.3s",
};

const activeBtn = {
  ...tripBtn,
  boxShadow: "0 0 15px rgba(255,122,24,0.8)",
};

const right = {
  display: "flex",
  alignItems: "center",
};

const profileWrapper = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const profile = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  background: "#1e293b",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  overflow: "hidden",
};

const profileImg = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const loginBtn = {
  padding: "8px 18px",
  borderRadius: "8px",
  background: "linear-gradient(45deg, #ff7a18, #ffb347)",
  border: "none",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
};

const logoutBtn = {
  padding: "6px 12px",
  borderRadius: "8px",
  background: "#ef4444",
  border: "none",
  color: "white",
  cursor: "pointer",
  fontSize: "12px",
};