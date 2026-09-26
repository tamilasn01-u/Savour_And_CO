import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const theme = {
  cream: "#F9F5EE",
  warmWhite: "#FDFAF5",
  charcoal: "#1C1C1A",
  brown: "#5C3D2E",
  gold: "#C9933A",
  goldLight: "#F0D9A8",
  muted: "#7A6F62",
  border: "#E5DDD0",
};

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [authUser, setAuthUser] = useState(() => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  });
  const [authAdmin, setAuthAdmin] = useState(() => {
    const adminStr = localStorage.getItem("adminUser");
    return adminStr ? JSON.parse(adminStr) : null;
  });
  const [, setRefresh] = useState(0);

  // Force update function
  const updateAuth = () => {
    const userStr = localStorage.getItem("user");
    const adminStr = localStorage.getItem("adminUser");
    setAuthUser(userStr ? JSON.parse(userStr) : null);
    setAuthAdmin(adminStr ? JSON.parse(adminStr) : null);
  };

  // Initialize and listen for auth changes
  useEffect(() => {
    // Listen for storage changes (e.g., logout from another tab)
    window.addEventListener("storage", updateAuth);
    
    // Listen for page focus to sync when returning to tab
    const handleFocus = () => {
      updateAuth();
    };
    window.addEventListener("focus", handleFocus);
    
    // Listen for visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateAuth();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      window.removeEventListener("storage", updateAuth);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Periodically sync auth state (more responsive to same-tab changes)
  useEffect(() => {
    const interval = setInterval(() => {
      const userStr = localStorage.getItem("user");
      const adminStr = localStorage.getItem("adminUser");
      const currentUser = userStr ? JSON.parse(userStr) : null;
      const currentAdmin = adminStr ? JSON.parse(adminStr) : null;
      
      // Only update if changed (to avoid unnecessary re-renders)
      if (JSON.stringify(authUser) !== JSON.stringify(currentUser)) {
        setAuthUser(currentUser);
      }
      if (JSON.stringify(authAdmin) !== JSON.stringify(currentAdmin)) {
        setAuthAdmin(currentAdmin);
      }
    }, 300); // Check every 300ms
    
    return () => clearInterval(interval);
  }, [authUser, authAdmin]);

  const user = authUser;
  const admin = authAdmin;
  const isAdmin = !!admin;
  const isLoggedIn = !!user || !!admin;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileOpen && e.target.closest("li") === null) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [profileOpen]);

  const links = [["/", "Home"], ["/how", "How it works"], ["/chefs", "Our Chefs"], ["/menus", "Menus"]];

  const handleLogout = () => {
    // Clear both user and admin sessions
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setProfileOpen(false);
    setAuthUser(null);
    setAuthAdmin(null);
    
    // Reload page to ensure clean state
    setTimeout(() => {
      window.location.href = "/";
    }, 200);
  };

  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: scrolled ? "0.9rem 4rem" : "1.2rem 4rem", background: "rgba(253,250,245,0.93)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${theme.border}`, transition: "padding 0.3s", userSelect: "none" }}>
      <Link to="/" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", color: theme.charcoal, textDecoration: "none" }} onDragStart={e => e.preventDefault()}>
        Savor <span style={{ color: theme.gold, fontStyle: "italic" }}>&</span> Co.
      </Link>
      <ul style={{ display: "flex", gap: "2.5rem", listStyle: "none", alignItems: "center" }}>
        {links.map(([href, label]) => (
          <li key={href}>
            <Link to={href} style={{ textDecoration: "none", fontSize: "0.82rem", fontWeight: 400, color: theme.muted, letterSpacing: "0.07em", textTransform: "uppercase", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = theme.gold}
              onMouseLeave={e => e.target.style.color = theme.muted}
              onDragStart={e => e.preventDefault()}>
              {label}
            </Link>
          </li>
        ))}
        {isAdmin && (
          <li>
            <Link to="/admin" style={{ textDecoration: "none", fontSize: "0.82rem", fontWeight: 400, color: theme.gold, letterSpacing: "0.07em", textTransform: "uppercase", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = theme.charcoal}
              onMouseLeave={e => e.target.style.color = theme.gold}
              onDragStart={e => e.preventDefault()}>
              Admin
            </Link>
          </li>
        )}
        {isLoggedIn && (
          admin ? (
            <li style={{ position: "relative" }}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                style={{
                  textDecoration: "none",
                  fontSize: "0.82rem",
                  fontWeight: 500,
                  color: theme.gold,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  transition: "color 0.2s",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.target.style.color = theme.charcoal)}
                onMouseLeave={(e) => (e.target.style.color = theme.gold)}
              >
                👤 {admin.name}
              </button>
              {profileOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: "0.5rem",
                    background: "white",
                    border: `1px solid ${theme.border}`,
                    borderRadius: 4,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    minWidth: 150,
                    zIndex: 1000,
                  }}
                >
                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "0.9rem 1.2rem",
                      fontSize: "0.8rem",
                      fontWeight: 400,
                      color: theme.charcoal,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => (e.target.style.background = theme.goldLight)}
                    onMouseLeave={(e) => (e.target.style.background = "none")}
                  >
                    Logout
                  </button>
                </div>
              )}
            </li>
          ) : user ? (
            <li style={{ position: "relative" }}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                style={{
                  textDecoration: "none",
                  fontSize: "0.82rem",
                  fontWeight: 500,
                  color: theme.gold,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  transition: "color 0.2s",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.target.style.color = theme.charcoal)}
                onMouseLeave={(e) => (e.target.style.color = theme.gold)}
              >
                👤 {user.name}
              </button>
              {profileOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: "0.5rem",
                    background: "white",
                    border: `1px solid ${theme.border}`,
                    borderRadius: 4,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    minWidth: 150,
                    zIndex: 1000,
                  }}
                >
                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "0.9rem 1.2rem",
                      fontSize: "0.8rem",
                      fontWeight: 400,
                      color: theme.charcoal,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => (e.target.style.background = theme.goldLight)}
                    onMouseLeave={(e) => (e.target.style.background = "none")}
                  >
                    Logout
                  </button>
                </div>
              )}
            </li>
          ) : null
        )}
        {!isLoggedIn && (
          <li>
            <Link
              to="/login"
              style={{
                textDecoration: "none",
                fontSize: "0.82rem",
                fontWeight: 400,
                color: theme.muted,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.color = theme.gold)}
              onMouseLeave={(e) => (e.target.style.color = theme.muted)}
            >
              Login
            </Link>
          </li>
        )}
        <li>
          <Link to="/booking" style={{ textDecoration: "none", fontSize: "0.82rem", fontWeight: 500, color: theme.warmWhite, background: theme.charcoal, padding: "0.5rem 1.4rem", borderRadius: "2px", letterSpacing: "0.06em", textTransform: "uppercase", transition: "background 0.2s", display: "inline-block" }}
            onMouseEnter={e => e.target.style.background = theme.brown}
            onMouseLeave={e => e.target.style.background = theme.charcoal}>
            Book now
          </Link>
        </li>
      </ul>
    </nav>
  );
}
