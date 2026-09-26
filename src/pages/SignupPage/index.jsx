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

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Clear error when user starts typing
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Client-side validation
    if (!formData.name.trim()) {
      setError("Name is required");
      setLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      setLoading(false);
      return;
    }

    if (!formData.password) {
      setError("Password is required");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          passwordConfirm: formData.passwordConfirm,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      // Store token in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setSuccess("Account created successfully! Redirecting...");
      
      // Redirect to home after 1.5 seconds
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setError("Connection error. Make sure the backend server is running.");
      console.error(err);
    }

    setLoading(false);
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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: theme.warmWhite, paddingTop: 80, paddingBottom: 40 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <Link to="/" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", color: theme.charcoal, textDecoration: "none" }}>
            Savor <span style={{ color: theme.gold, fontStyle: "italic" }}>&</span> Co.
          </Link>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", color: theme.charcoal, marginTop: "1.5rem", marginBottom: "0.5rem" }}>
            Create Account
          </h1>
          <p style={{ fontSize: "0.95rem", color: theme.muted }}>Join us for exclusive catering services</p>
        </div>

        <form onSubmit={handleRegister} style={{ background: "white", padding: "2.5rem", borderRadius: 8, border: `1px solid ${theme.border}`, boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
          {error && (
            <div style={{ background: "#fee", border: "1px solid #fcc", color: "#c33", padding: "0.9rem", borderRadius: 4, marginBottom: "1.5rem", fontSize: "0.85rem" }}>
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div style={{ background: "#efe", border: "1px solid #cfc", color: "#3c3", padding: "0.9rem", borderRadius: 4, marginBottom: "1.5rem", fontSize: "0.85rem" }}>
              ✓ {success}
            </div>
          )}

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: theme.muted, marginBottom: "0.5rem" }}>
              Full Name <span style={{ color: "#c33" }}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              style={inputStyle}
              required
              onFocus={(e) => (e.target.style.borderColor = theme.gold)}
              onBlur={(e) => (e.target.style.borderColor = theme.border)}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: theme.muted, marginBottom: "0.5rem" }}>
              Email Address <span style={{ color: "#c33" }}>*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              style={inputStyle}
              required
              onFocus={(e) => (e.target.style.borderColor = theme.gold)}
              onBlur={(e) => (e.target.style.borderColor = theme.border)}
            />
            <p style={{ fontSize: "0.75rem", color: theme.muted, marginTop: "0.3rem" }}>Must be unique (can't be repeated)</p>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: theme.muted, marginBottom: "0.5rem" }}>
              Password <span style={{ color: "#c33" }}>*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              style={inputStyle}
              required
              onFocus={(e) => (e.target.style.borderColor = theme.gold)}
              onBlur={(e) => (e.target.style.borderColor = theme.border)}
            />
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: theme.muted, marginBottom: "0.5rem" }}>
              Confirm Password <span style={{ color: "#c33" }}>*</span>
            </label>
            <input
              type="password"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleChange}
              placeholder="Re-enter your password"
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
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
            <p style={{ fontSize: "0.85rem", color: theme.muted }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: theme.gold, textDecoration: "none", fontWeight: 500 }}>
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
