import { useRef, useState, useEffect } from "react";

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

const testimonials = [
  { quote: "Chef Arjun transformed our daughter's wedding into a true feast. Every dish was authentic, beautifully presented, and exactly what we envisioned. Completely stress-free.", author: "Meena Subramaniam", event: "Wedding reception · 350 guests · Chennai" },
  { quote: "We've used Savor & Co. for three consecutive annual dinners. Chef Priya's continental menus are consistently outstanding — our leadership team always asks who the caterer is.", author: "Vikram Raghunathan", event: "Corporate gala · 120 guests · Bangalore" },
  { quote: "I wanted an intimate anniversary dinner at home. They matched us with a chef who designed a custom 5-course menu around our favourite memories. Absolutely magical.", author: "Deepa & Suresh Iyer", event: "Private dinner · 2 guests · Coimbatore" },
];

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

export default function TestimonialsPage() {
  return (
    <section style={{ background: theme.charcoal, padding: "6rem 5rem", minHeight: "100vh" }}>
      <AnimatedSection>
        <p style={{ fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", color: theme.gold, fontWeight: 500, marginBottom: "0.8rem" }}>Client love</p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 3vw, 2.8rem)", color: "#FDFAF5", marginBottom: "1rem" }}>What our clients say</h1>
        <p style={{ fontSize: "0.95rem", lineHeight: 1.8, color: "#aaa", maxWidth: 520, marginBottom: "3rem" }}>We measure success by how our guests feel at the end of the night.</p>
      </AnimatedSection>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
        {testimonials.map((t, i) => (
          <AnimatedSection key={t.author} style={{ transitionDelay: `${i * 0.12}s` }}>
            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, padding: "2rem" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", color: theme.gold, lineHeight: 1, marginBottom: "0.5rem" }}>"</div>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.8, color: "#ccc", marginBottom: "1.5rem" }}>{t.quote}</p>
              <div style={{ fontSize: "0.82rem", color: theme.gold, fontWeight: 500 }}>{t.author}</div>
              <div style={{ fontSize: "0.78rem", color: "#888", marginTop: "0.2rem" }}>{t.event}</div>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </section>
  );
}
