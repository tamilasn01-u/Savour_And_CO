import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

function useInView(ref, threshold = 0.15) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return visible;
}

function AnimatedSection({ children, style, className }) {
  const ref = useRef();
  const visible = useInView(ref);
  return (
    <div ref={ref} className={className} style={{ opacity: 0, transform: "translateY(24px)", transition: "opacity 0.7s ease, transform 0.7s ease", ...(visible ? { opacity: 1, transform: "translateY(0)" } : {}), ...style }}>
      {children}
    </div>
  );
}

function ChefModal({ chef, onClose }) {
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoadingEvents(true);
        const response = await fetch(`http://localhost:5000/api/admin/events/chef/${chef._id}`);
        if (!response.ok) throw new Error("Failed to fetch events");
        const eventsData = await response.json();
        setEvents(eventsData);
      } catch (err) {
        console.error("Error fetching events:", err);
        setEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, [chef._id]);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "2rem",
      backdropFilter: "blur(4px)",
    }}
      onClick={onClose}>
      <div style={{
        background: theme.warmWhite,
        borderRadius: 8,
        padding: "2rem",
        maxWidth: 900,
        maxHeight: "90vh",
        overflow: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}
        onClick={e => e.stopPropagation()}>
        {/* Chef Header */}
        <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem", paddingBottom: "1.5rem", borderBottom: `1px solid ${theme.border}` }}>
          <div style={{ width: 120, height: 120, borderRadius: 8, backgroundImage: `url(${chef.image || "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&q=80"})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          <div style={{ flex: 1 }}>
            <button onClick={onClose} style={{ float: "right", background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: theme.muted }}>✕</button>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", color: theme.charcoal, marginBottom: "0.5rem" }}>{chef.title}</h2>
            <p style={{ fontSize: "0.95rem", color: theme.gold, marginBottom: "0.8rem" }}>🌟 {chef.specialty || "Specialist Chef"}</p>
            <p style={{ fontSize: "0.9rem", color: theme.muted, lineHeight: 1.6 }}>{chef.description}</p>
          </div>
        </div>

        {/* Events Section */}
        <div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", color: theme.charcoal, marginBottom: "1.5rem" }}>Events & Client Feedback</h3>
          {loadingEvents ? (
            <p style={{ color: theme.muted, textAlign: "center", padding: "2rem" }}>Loading events...</p>
          ) : events.length === 0 ? (
            <p style={{ color: theme.muted, textAlign: "center", padding: "2rem" }}>No events with feedback yet.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
              {events.map((event) => (
                <div key={event._id} style={{ background: "white", border: `1px solid ${theme.border}`, borderRadius: 6, padding: "1.5rem", transition: "box-shadow 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = ""}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
                    <div>
                      <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", color: theme.charcoal, marginBottom: "0.3rem" }}>{event.title}</h4>
                      <p style={{ fontSize: "0.8rem", color: theme.gold, textTransform: "uppercase" }}>{event.eventType}</p>
                    </div>
                    <span style={{ fontSize: "0.75rem", color: theme.muted, background: theme.goldLight, padding: "0.3rem 0.8rem", borderRadius: 20 }}>
                      {new Date(event.eventDate).toLocaleDateString()}
                    </span>
                  </div>

                  {event.description && <p style={{ fontSize: "0.85rem", color: theme.muted, marginBottom: "1rem", lineHeight: 1.5 }}>{event.description}</p>}

                  {/* Feedback Section */}
                  {event.feedback && (
                    <div style={{ background: theme.cream, borderRadius: 4, padding: "1rem", marginTop: "1rem", borderLeft: `3px solid ${theme.gold}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                        <span style={{ fontSize: "0.9rem", fontWeight: 500, color: theme.charcoal }}>{event.feedback.customerName || "Anonymous"}</span>
                        {event.feedback.rating && (
                          <span style={{ fontSize: "0.85rem", color: theme.gold }}>
                            {"⭐".repeat(event.feedback.rating)}{" "}({event.feedback.rating}/5)
                          </span>
                        )}
                      </div>
                      {event.feedback.comment && (
                        <p style={{ fontSize: "0.8rem", color: theme.muted, fontStyle: "italic", lineHeight: 1.5 }}>"{event.feedback.comment}"</p>
                      )}
                    </div>
                  )}

                  {/* Event Details */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", marginTop: "1rem", paddingTop: "1rem", borderTop: `1px solid ${theme.border}`, fontSize: "0.8rem" }}>
                    {event.guestCount && <p><span style={{ fontWeight: 500, color: theme.charcoal }}>Guests:</span> {event.guestCount}</p>}
                    {event.venue && <p><span style={{ fontWeight: 500, color: theme.charcoal }}>Venue:</span> {event.venue}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChefsPage() {
  const navigate = useNavigate();
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchChefs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/admin/items?t=${Date.now()}`, {
        cache: "no-store"
      });
      if (!response.ok) throw new Error("Failed to fetch chefs");
      const allItems = await response.json();
      const chefsData = allItems.filter((item) => item.category === "chef");
      setChefs(chefsData);
    } catch (err) {
      console.error("Error fetching chefs:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChefs();
  }, []);

  if (loading) {
    return (
      <section style={{ background: theme.warmWhite, padding: "6rem 5rem", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: "1rem", color: theme.muted }}>Loading chefs...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section style={{ background: theme.warmWhite, padding: "6rem 5rem", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: "1rem", color: "#d32f2f" }}>Error: {error}</p>
      </section>
    );
  }

  return (
    <section style={{ background: theme.warmWhite, padding: "6rem 5rem", minHeight: "100vh" }}>
      <AnimatedSection>
        <p style={{ fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", color: theme.gold, fontWeight: 500, marginBottom: "0.8rem" }}>Our talent</p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 3vw, 2.8rem)", color: theme.charcoal, marginBottom: "1rem" }}>Meet the chefs</h1>
        <p style={{ fontSize: "0.95rem", lineHeight: 1.8, color: theme.muted, maxWidth: 520, marginBottom: "3rem" }}>Click any chef to view their events and client feedback.</p>
      </AnimatedSection>
      {chefs.length === 0 ? (
        <p style={{ fontSize: "0.95rem", color: theme.muted, textAlign: "center", padding: "2rem" }}>No chefs available yet.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
          {chefs.map((chef, i) => (
            <AnimatedSection key={chef._id} style={{ transitionDelay: `${i * 0.12}s` }}>
              <div style={{ background: theme.warmWhite, border: `1px solid ${theme.border}`, borderRadius: 4, overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s, cursor 0.2s", cursor: "pointer" }}
                onClick={() => navigate(`/chef/${chef._id}`)}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.09)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                <div style={{ height: 260, backgroundImage: `url(${chef.image || "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&q=80"})`, backgroundSize: "cover", backgroundPosition: "center top", filter: "saturate(0.82)", position: "relative" }}>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(28,28,26,0.5) 0%, transparent 50%)" }} />
                  <span style={{ position: "absolute", bottom: "1rem", left: "1rem", background: theme.gold, color: theme.warmWhite, fontSize: "0.68rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.3rem 0.8rem", borderRadius: 2 }}>{chef.specialty || "Specialist"}</span>
                </div>
                <div style={{ padding: "1.5rem" }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem", color: theme.charcoal, marginBottom: "0.3rem" }}>{chef.title}</div>
                  <div style={{ fontSize: "0.82rem", color: theme.gold, marginBottom: "0.8rem" }}>{chef.createdBy?.name || "Chef"}</div>
                  <p style={{ fontSize: "0.87rem", color: theme.muted, lineHeight: 1.7, marginBottom: "1.2rem" }}>{chef.description}</p>
                  <p style={{ fontSize: "0.77rem", color: theme.gold, textTransform: "uppercase", fontWeight: 500, letterSpacing: "0.06em", cursor: "pointer" }}>View Events →</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      )}
    </section>
  );
}
