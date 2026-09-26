import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

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

function AnimatedSection({ children, style, className }) {
  const ref = useRef();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setVisible(true);
    }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} style={{ opacity: 0, transform: "translateY(24px)", transition: "opacity 0.7s ease, transform 0.7s ease", ...(visible ? { opacity: 1, transform: "translateY(0)" } : {}), ...style }}>
      {children}
    </div>
  );
}

export default function ChefDetailPage() {
  const { chefId } = useParams();
  const navigate = useNavigate();
  const [chef, setChef] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchChefAndEvents = async () => {
    try {
      setLoading(true);

      // Fetch chef details with cache-busting
      const chefResponse = await fetch(`http://localhost:5000/api/admin/items/${chefId}?t=${Date.now()}`, {
        cache: "no-store"
      });
      if (!chefResponse.ok) throw new Error("Failed to fetch chef details");
      const chefData = await chefResponse.json();
      setChef(chefData);

      // Fetch chef's events with cache-busting
      const eventsResponse = await fetch(`http://localhost:5000/api/admin/events/chef/${chefId}?t=${Date.now()}`, {
        cache: "no-store"
      });
      if (!eventsResponse.ok) throw new Error("Failed to fetch events");
      const eventsData = await eventsResponse.json();
      setEvents(eventsData);

      setError(null);
    } catch (err) {
      console.error("Error fetching chef details:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChefAndEvents();
  }, [chefId]);

  if (loading) {
    return (
      <section style={{ background: theme.warmWhite, padding: "6rem 5rem", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: "1rem", color: theme.muted }}>Loading chef details...</p>
      </section>
    );
  }

  if (error || !chef) {
    return (
      <section style={{ background: theme.warmWhite, padding: "6rem 5rem", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "1rem", color: "#d32f2f", marginBottom: "1rem" }}>Error: {error || "Chef not found"}</p>
          <button
            onClick={() => navigate("/chefs")}
            style={{
              background: theme.charcoal,
              color: "white",
              padding: "0.8rem 1.5rem",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            Back to Chefs
          </button>
        </div>
      </section>
    );
  }

  // Calculate average rating
  const feedbackArray = events
    .filter(event => event.feedback && event.feedback.rating)
    .map(event => event.feedback.rating);
  const averageRating = feedbackArray.length > 0 ? (feedbackArray.reduce((a, b) => a + b) / feedbackArray.length).toFixed(1) : 0;
  const totalReviews = feedbackArray.length;

  return (
    <main style={{ background: theme.warmWhite, minHeight: "100vh" }}>
      {/* Hero Section with Chef Image */}
      <section style={{ background: `linear-gradient(135deg, rgba(201,147,58,0.1) 0%, rgba(240,217,168,0.1) 100%)`, padding: "3rem 5rem", display: "flex", gap: "4rem", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <img
            src={chef.image || "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&q=80"}
            alt={chef.title}
            style={{ width: "100%", height: 500, objectFit: "cover", borderRadius: 8, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
          />
        </div>

        <div style={{ flex: 1, paddingTop: "2rem" }}>
          <button
            onClick={() => navigate("/chefs")}
            style={{
              background: "none",
              border: "none",
              color: theme.gold,
              cursor: "pointer",
              fontSize: "0.85rem",
              marginBottom: "1rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: 500,
            }}
          >
            ← Back to Chefs
          </button>

          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "3rem", color: theme.charcoal, marginBottom: "0.5rem" }}>
            {chef.title}
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: "2rem", marginBottom: "2rem" }}>
            <div>
              <p style={{ fontSize: "0.9rem", color: theme.gold, textTransform: "uppercase", fontWeight: 600, marginBottom: "0.3rem" }}>🌟 Specialty</p>
              <p style={{ fontSize: "1.2rem", color: theme.charcoal, fontWeight: 500 }}>{chef.specialty || "Professional Chef"}</p>
            </div>
            {totalReviews > 0 && (
              <div style={{ borderLeft: `2px solid ${theme.border}`, paddingLeft: "2rem" }}>
                <p style={{ fontSize: "0.9rem", color: theme.gold, textTransform: "uppercase", fontWeight: 600, marginBottom: "0.3rem" }}>⭐ Average Rating</p>
                <p style={{ fontSize: "1.2rem", color: theme.charcoal, fontWeight: 500 }}>
                  {averageRating} / 5 ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
                </p>
              </div>
            )}
          </div>

          <div style={{ paddingTop: "1rem", borderTop: `1px solid ${theme.border}` }}>
            <p style={{ fontSize: "1rem", color: theme.muted, lineHeight: 1.8, marginBottom: "1.5rem" }}>
              {chef.description}
            </p>
          </div>
        </div>
      </section>

      {/* Projects/Events Section */}
      <section style={{ padding: "6rem 5rem" }}>
        <AnimatedSection>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", color: theme.charcoal, marginBottom: "1rem" }}>
            Projects & Events
          </h2>
          <p style={{ fontSize: "0.95rem", color: theme.muted, marginBottom: "3rem", maxWidth: 600 }}>
            {events.length === 0
              ? "This chef hasn't worked on any projects yet."
              : `${events.length} successful ${events.length === 1 ? "event" : "events"} completed with excellent client feedback.`}
          </p>
        </AnimatedSection>

        {events.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", background: "white", borderRadius: 8, border: `1px solid ${theme.border}` }}>
            <p style={{ fontSize: "1rem", color: theme.muted }}>No projects completed yet.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "2rem" }}>
            {events.map((event, i) => (
              <AnimatedSection key={event._id} style={{ transitionDelay: `${i * 0.1}s` }}>
                <div style={{
                  background: "white",
                  border: `1px solid ${theme.border}`,
                  borderRadius: 8,
                  padding: "2rem",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  cursor: "pointer",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "";
                    e.currentTarget.style.boxShadow = "";
                  }}>

                  {/* Event Header */}
                  <div style={{ marginBottom: "1.5rem" }}>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", color: theme.charcoal, marginBottom: "0.5rem" }}>
                      {event.title}
                    </h3>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", background: theme.goldLight, color: theme.charcoal, padding: "0.3rem 0.8rem", borderRadius: 20, textTransform: "uppercase", fontWeight: 600 }}>
                        {event.eventType}
                      </span>
                      <span style={{ fontSize: "0.85rem", color: theme.muted }}>
                        {new Date(event.eventDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>

                  {/* Event Details */}
                  {event.description && (
                    <p style={{ fontSize: "0.9rem", color: theme.muted, lineHeight: 1.6, marginBottom: "1.5rem", flex: 1 }}>
                      {event.description}
                    </p>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: `1px solid ${theme.border}`, fontSize: "0.85rem" }}>
                    {event.guestCount && (
                      <div>
                        <span style={{ color: theme.gold, fontWeight: 600 }}>👥 Guests</span>
                        <p style={{ color: theme.charcoal, marginTop: "0.3rem" }}>{event.guestCount} people</p>
                      </div>
                    )}
                    {event.venue && (
                      <div>
                        <span style={{ color: theme.gold, fontWeight: 600 }}>📍 Venue</span>
                        <p style={{ color: theme.charcoal, marginTop: "0.3rem" }}>{event.venue}</p>
                      </div>
                    )}
                  </div>

                  {/* Customer Feedback */}
                  {event.feedback && (
                    <div style={{ background: theme.cream, borderRadius: 6, padding: "1.5rem", borderLeft: `3px solid ${theme.gold}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.8rem" }}>
                        <strong style={{ color: theme.charcoal, fontSize: "0.95rem" }}>
                          {event.feedback.customerName || "Client"}
                        </strong>
                        {event.feedback.rating && (
                          <span style={{ fontSize: "0.85rem", color: theme.gold }}>
                            {"⭐".repeat(event.feedback.rating)}
                          </span>
                        )}
                      </div>
                      {event.feedback.comment && (
                        <p style={{ fontSize: "0.9rem", color: theme.muted, fontStyle: "italic", lineHeight: 1.6 }}>
                          "{event.feedback.comment}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </AnimatedSection>
            ))}
          </div>
        )}
      </section>

      {/* Customer Reviews Summary */}
      {events.some(e => e.feedback) && (
        <section style={{ padding: "6rem 5rem", background: theme.cream }}>
          <AnimatedSection>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", color: theme.charcoal, marginBottom: "3rem", textAlign: "center" }}>
              Client Testimonials
            </h2>
          </AnimatedSection>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", maxWidth: 1200, margin: "0 auto" }}>
            {events
              .filter(event => event.feedback && event.feedback.comment)
              .map((event, i) => (
                <AnimatedSection key={event._id} style={{ transitionDelay: `${i * 0.1}s` }}>
                  <div style={{
                    background: "white",
                    padding: "2rem",
                    borderRadius: 8,
                    border: `1px solid ${theme.border}`,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}>
                    {/* Rating Stars */}
                    <div style={{ marginBottom: "1rem" }}>
                      {event.feedback.rating && (
                        <div style={{ display: "flex", gap: "0.3rem", marginBottom: "0.8rem" }}>
                          {Array(event.feedback.rating)
                            .fill(0)
                            .map((_, i) => (
                              <span key={i} style={{ fontSize: "1.2rem", color: theme.gold }}>⭐</span>
                            ))}
                          <span style={{ fontSize: "0.85rem", color: theme.muted, marginLeft: "0.5rem" }}>
                            {event.feedback.rating}.0
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Comment */}
                    <p style={{ fontSize: "1rem", color: theme.charcoal, lineHeight: 1.8, marginBottom: "1.5rem", fontStyle: "italic" }}>
                      "{event.feedback.comment}"
                    </p>

                    {/* Customer Name and Event */}
                    <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: "1.5rem" }}>
                      <p style={{ fontWeight: 600, color: theme.charcoal, marginBottom: "0.3rem" }}>
                        {event.feedback.customerName || "Client"}
                      </p>
                      <p style={{ fontSize: "0.85rem", color: theme.muted }}>
                        from {event.eventType} event - {event.title}
                      </p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section style={{ padding: "4rem 5rem", background: theme.charcoal, color: "white", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", marginBottom: "1rem" }}>
          Ready to book {chef.title.split(" ")[0]}?
        </h2>
        <p style={{ fontSize: "1.1rem", marginBottom: "2rem", opacity: 0.9, maxWidth: 600, margin: "0 auto 2rem" }}>
          Bring your event to life with world-class catering and culinary expertise.
        </p>
        <button
          onClick={() => navigate("/booking")}
          style={{
            background: theme.gold,
            color: theme.charcoal,
            padding: "1rem 2.5rem",
            border: "none",
            borderRadius: 4,
            fontSize: "1rem",
            fontWeight: 600,
            cursor: "pointer",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            transition: "transform 0.2s",
          }}
          onMouseEnter={e => e.target.style.transform = "scale(1.05)"}
          onMouseLeave={e => e.target.style.transform = ""}
        >
          Book Now
        </button>
      </section>
    </main>
  );
}
