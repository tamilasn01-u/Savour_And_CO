import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const user = localStorage.getItem("user");
    const admin = localStorage.getItem("adminUser");
    if (user || admin) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Try admin login first
      const adminResponse = await fetch("http://localhost:5000/api/admin-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const adminData = await adminResponse.json();

      if (adminResponse.ok) {
        // Admin login successful
        console.log("✅ Admin login successful");
        localStorage.setItem("adminToken", adminData.token);
        localStorage.setItem("adminUser", JSON.stringify(adminData.admin));
        setEmail("");
        setPassword("");
        setLoading(false);
        
        setTimeout(() => {
          navigate("/admin");
        }, 100);
        return;
      }

      // Admin login failed, try user login
      const userResponse = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const userData = await userResponse.json();

      if (!userResponse.ok) {
        console.log("❌ Both admin and user login failed");
        setError(userData.message || "Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }

      // User login successful
      console.log("✅ User login successful");
      localStorage.setItem("token", userData.token);
      localStorage.setItem("user", JSON.stringify(userData.user));
      setEmail("");
      setPassword("");
      setLoading(false);

      // Small delay before redirect to ensure state updates
      setTimeout(() => {
        navigate("/");
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
            Welcome Back
          </h1>
          <p style={{ fontSize: "0.95rem", color: theme.muted }}>Sign in as user or admin</p>
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
              placeholder="you@example.com"
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
              Don't have an account?{" "}
              <Link to="/signup" style={{ color: theme.gold, textDecoration: "none", fontWeight: 500 }}>
                Create one
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
