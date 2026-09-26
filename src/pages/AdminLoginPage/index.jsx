import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const theme = {
  cream: "#F9F5EE",
  warmWhite: "#FDFAF5",
  charcoal: "#1C1C1A",
  brown: "#5C3D2E",
  gold: "#C9933A",
  muted: "#7A6F62",
  border: "#E5DDD0",
};

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in as admin or navigate to unified login
  useEffect(() => {
    const adminUser = localStorage.getItem("adminUser");
    if (adminUser) {
      navigate("/admin");
    } else {
      // Redirect to unified login page
      navigate("/login");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    console.log("🔐 Admin login attempt with:", { email, password: password ? "***" : "empty" });

    try {
      const response = await fetch("http://localhost:5000/api/admin-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("✅ Response from backend:", { status: response.status, data });

      if (!response.ok) {
        console.log("❌ Login failed:", data.message);
        setError(data.message || "Admin login failed. Please check your credentials.");
        setLoading(false);
        return;
      }

      // Store admin token and info in localStorage
      console.log("💾 Storing admin data in localStorage");
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser", JSON.stringify(data.admin));
      console.log("✅ Admin data stored. Redirecting to /admin");

      // Clear form
      setEmail("");
      setPassword("");
      setLoading(false);

      // Small delay before redirect to ensure state updates
      setTimeout(() => {
        navigate("/admin");
      }, 100);
    } catch (err) {
      console.log("❌ Connection error:", err.message);
      setError("Connection error. Make sure the backend server is running.");
      console.error(err);
      setLoading(false);
    }
  };

  const inputStyle = {
    padding: "0.9rem",
    border: `1px solid ${theme.border}`,
    background: theme.warmWhite,
    borderRadius: 4,
    fontSize: "0.95rem",
    color: theme.charcoal,
    outline: "none",
    width: "100%",
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.2s",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: theme.warmWhite, paddingTop: 80 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <Link to="/" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", color: theme.charcoal, textDecoration: "none" }}>
            Savor <span style={{ color: theme.gold, fontStyle: "italic" }}>&</span> Co.
          </Link>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", color: theme.charcoal, marginTop: "1.5rem", marginBottom: "0.5rem" }}>
            Admin Portal
          </h1>
          <p style={{ fontSize: "0.95rem", color: theme.muted }}>Sign in to admin dashboard</p>
        </div>

        <form onSubmit={handleLogin} style={{ background: "white", padding: "2.5rem", borderRadius: 8, border: `1px solid ${theme.border}`, boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
          {error && (
            <div style={{ background: "#fee", border: "1px solid #fcc", color: "#c33", padding: "0.9rem", borderRadius: 4, marginBottom: "1.5rem", fontSize: "0.85rem" }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: theme.muted, marginBottom: "0.5rem" }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              style={inputStyle}
              required
              onFocus={(e) => (e.target.style.borderColor = theme.gold)}
              onBlur={(e) => (e.target.style.borderColor = theme.border)}
            />
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: theme.muted, marginBottom: "0.5rem" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={inputStyle}
              required
              onFocus={(e) => (e.target.style.borderColor = theme.gold)}
              onBlur={(e) => (e.target.style.borderColor = theme.border)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: loading ? theme.muted : theme.charcoal,
              color: theme.cream,
              padding: "1rem",
              fontSize: "0.85rem",
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              border: "none",
              borderRadius: 4,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => !loading && (e.target.style.background = theme.brown)}
            onMouseLeave={(e) => !loading && (e.target.style.background = theme.charcoal)}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
            <p style={{ fontSize: "0.85rem", color: theme.muted }}>
              <Link to="/" style={{ color: theme.gold, textDecoration: "none", fontWeight: 500 }}>
                Back to home
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
