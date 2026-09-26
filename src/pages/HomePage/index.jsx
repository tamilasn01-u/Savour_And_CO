import { useRef, useState, useEffect } from "react";
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

export default function HomePage() {
  return (
    <section id="home" style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", paddingTop: 80 }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "6rem 4rem 6rem 5rem", background: theme.warmWhite, animation: "fadeUp 0.8s ease forwards" }}>
        <p style={{ fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", color: theme.gold, marginBottom: "1.5rem", fontWeight: 500 }}>Premium Catering Consultants</p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.8rem, 4vw, 3.8rem)", lineHeight: 1.15, color: theme.charcoal, marginBottom: "1.8rem" }}>
          Exceptional dining,<br /><em style={{ color: theme.brown }}>curated for you</em>
        </h1>
        <p style={{ fontSize: "1rem", lineHeight: 1.8, color: theme.muted, maxWidth: 400, marginBottom: "3rem" }}>
          We connect you with India's finest private chefs to craft unforgettable culinary experiences — from intimate dinners to grand celebrations.
        </p>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link to="/booking" style={{ background: theme.gold, color: theme.warmWhite, padding: "0.9rem 2rem", fontSize: "0.82rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", border: "none", borderRadius: "2px", textDecoration: "none", transition: "background 0.2s", display: "inline-block" }}
            onMouseEnter={e => e.currentTarget.style.background = theme.brown}
            onMouseLeave={e => e.currentTarget.style.background = theme.gold}>
            Book a Consultation
          </Link>
          <Link to="/chefs" style={{ background: "transparent", color: theme.charcoal, padding: "0.9rem 2rem", fontSize: "0.82rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", border: `1px solid ${theme.border}`, borderRadius: "2px", textDecoration: "none", display: "inline-block" }}
            onMouseEnter={e => { e.target.style.borderColor = theme.charcoal; }}
            onMouseLeave={e => { e.target.style.borderColor = theme.border; }}>
            Meet Our Chefs
          </Link>
        </div>
      </div>
      <div style={{ position: "relative", background: theme.cream, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 3 }}>
          {[
            { url: "https://images.unsplash.com/photo-1555244162-803834f70033?w=600&q=80", gridRow: "1 / 3" },
            { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80" },
            { url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80" },
          ].map((c, i) => (
            <div key={i} style={{ backgroundImage: `url(${c.url})`, backgroundSize: "cover", backgroundPosition: "center", filter: "saturate(0.85)", gridRow: c.gridRow, transition: "filter 0.4s" }}
              onMouseEnter={e => e.currentTarget.style.filter = "saturate(1)"}
              onMouseLeave={e => e.currentTarget.style.filter = "saturate(0.85)"} />
          ))}
        </div>
        <div style={{ position: "absolute", bottom: "2.5rem", left: "2.5rem", background: theme.charcoal, color: theme.cream, padding: "1rem 1.5rem", borderRadius: 4, fontSize: "0.8rem", letterSpacing: "0.05em" }}>
          <strong style={{ display: "block", fontSize: "1.6rem", fontFamily: "'Playfair Display', serif", color: theme.gold }}>200+</strong>
          Events delivered
        </div>
      </div>
    </section>
  );
}
