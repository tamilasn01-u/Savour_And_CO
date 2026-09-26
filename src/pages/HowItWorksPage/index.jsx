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

export default function HowItWorksPage() {
  const steps = [
    ["01", "Tell us your vision", "Share the occasion, guest count, cuisine preferences, and budget through our quick consultation form."],
    ["02", "Get matched", "We hand-pick 2–3 chefs from our curated network who are the perfect fit for your event."],
    ["03", "Taste & confirm", "Schedule a tasting session, review custom menus, and finalise every detail with your chef."],
    ["04", "Enjoy the experience", "Sit back while your chef and team deliver a flawless culinary experience from prep to plate."],
  ];
  
  return (
    <section style={{ background: theme.cream, padding: "6rem 5rem", minHeight: "100vh" }}>
      <AnimatedSection>
        <p style={{ fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", color: theme.gold, fontWeight: 500, marginBottom: "0.8rem" }}>The process</p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 3vw, 2.8rem)", color: theme.charcoal, marginBottom: "1rem" }}>How Savor & Co. works</h1>
        <p style={{ fontSize: "0.95rem", lineHeight: 1.8, color: theme.muted, maxWidth: 520, marginBottom: "3rem" }}>From your first inquiry to the last bite, we make every step effortless.</p>
      </AnimatedSection>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem" }}>
        {steps.map(([num, title, desc], i) => (
          <AnimatedSection key={num} style={{ transitionDelay: `${i * 0.1}s` }}>
            <div style={{ padding: "2rem 1.5rem", background: theme.warmWhite, border: `1px solid ${theme.border}`, borderRadius: 4, height: "100%", cursor: "default", transition: "transform 0.2s, box-shadow 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.07)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "3rem", color: theme.goldLight, lineHeight: 1, marginBottom: "1rem" }}>{num}</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.05rem", color: theme.charcoal, marginBottom: "0.6rem", fontWeight: 400 }}>{title}</h3>
              <p style={{ fontSize: "0.87rem", color: theme.muted, lineHeight: 1.7 }}>{desc}</p>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </section>
  );
}
