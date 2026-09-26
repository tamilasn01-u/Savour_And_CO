import { useRef, useState, useEffect } from "react";

const WHATSAPP_NUMBER = "916385504387";

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

export default function BookingPage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", date: "", eventType: "", guests: "", notes: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = () => {
    const msg = `🍽️ *New Consultation Request - Savor & Co.*\n\n*Name:* ${form.name}\n*Phone:* ${form.phone}\n*Email:* ${form.email}\n*Event Date:* ${form.date}\n*Event Type:* ${form.eventType}\n*Guests:* ${form.guests}\n*Notes:* ${form.notes}`;
    
    // Try to open WhatsApp app first
    const appUrl = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(msg)}`;
    const webUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    
    // Open app URL (if not available, it will open web version)
    window.location.href = appUrl;
    
    // Fallback to web after 1 second if app doesn't open
    setTimeout(() => {
      window.open(webUrl, "_blank");
    }, 1000);
    
    setSubmitted(true);
  };

  const inputStyle = { padding: "0.7rem 0.9rem", border: `1px solid ${theme.border}`, background: theme.warmWhite, borderRadius: 2, fontSize: "0.9rem", color: theme.charcoal, outline: "none", width: "100%", fontFamily: "'DM Sans', sans-serif" };
  const labelStyle = { fontSize: "0.76rem", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: theme.muted, marginBottom: "0.4rem", display: "block" };

  const perks = [
    ["✦", "Free chef matching", "We do the hard work of finding the right chef for your event, cuisine, and budget."],
    ["◎", "Tasting before you commit", "All clients get a complimentary tasting session before signing any agreement."],
    ["◈", "End-to-end support", "From planning and logistics to day-of coordination — we're with you every step."],
  ];

  return (
    <section style={{ background: theme.warmWhite, padding: "6rem 5rem", minHeight: "100vh" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "5rem", alignItems: "start" }}>
        <AnimatedSection>
          <p style={{ fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", color: theme.gold, fontWeight: 500, marginBottom: "0.8rem" }}>Get started</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 3vw, 2.8rem)", color: theme.charcoal, marginBottom: "1rem" }}>Book a free consultation</h1>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.8, color: theme.muted, maxWidth: 420, marginBottom: "2.5rem" }}>Tell us about your event and we'll match you with the perfect chef within 24 hours — no commitment required.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
            {perks.map(([icon, title, desc]) => (
              <div key={title} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div style={{ width: 36, height: 36, minWidth: 36, background: theme.cream, border: `1px solid ${theme.border}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", color: theme.gold }}>{icon}</div>
                <div>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: 500, color: theme.charcoal, marginBottom: "0.2rem" }}>{title}</h4>
                  <p style={{ fontSize: "0.83rem", color: theme.muted, lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection style={{ transitionDelay: "0.15s" }}>
          <div style={{ background: theme.cream, border: `1px solid ${theme.border}`, borderRadius: 6, padding: "2.5rem" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: theme.charcoal, marginBottom: "1.8rem" }}>Request a consultation</div>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: theme.gold, fontFamily: "'Playfair Display', serif", fontSize: "1.2rem" }}>
                ✦ Thank you! We'll be in touch within 24 hours.
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  {[["name", "Your name", "text", "Ananya Krishnan"], ["phone", "Phone number", "tel", "+91 98765 43210"], ["email", "Email address", "email", "you@example.com"], ["date", "Event date", "date", ""]].map(([name, label, type, ph]) => (
                    <div key={name} style={{ display: "flex", flexDirection: "column" }}>
                      <label style={labelStyle}>{label}</label>
                      <input name={name} type={type} placeholder={ph} value={form[name]} onChange={handleChange} style={inputStyle}
                        onFocus={e => e.target.style.borderColor = theme.gold}
                        onBlur={e => e.target.style.borderColor = theme.border} />
                    </div>
                  ))}
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <label style={labelStyle}>Event type</label>
                    <select name="eventType" value={form.eventType} onChange={handleChange} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = theme.gold}
                      onBlur={e => e.target.style.borderColor = theme.border}>
                      <option value="">Select occasion</option>
                      {["Wedding", "Corporate event", "Private dinner", "Birthday celebration", "Other"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <label style={labelStyle}>Guest count</label>
                    <select name="guests" value={form.guests} onChange={handleChange} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = theme.gold}
                      onBlur={e => e.target.style.borderColor = theme.border}>
                      <option value="">Select range</option>
                      {["1–10 guests", "11–50 guests", "51–200 guests", "200+ guests"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Cuisine preferences / notes</label>
                    <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Tell us about your dream menu, dietary restrictions, or any special requests..." style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
                      onFocus={e => e.target.style.borderColor = theme.gold}
                      onBlur={e => e.target.style.borderColor = theme.border} />
                  </div>
                </div>
                <button onClick={handleSubmit} style={{ width: "100%", marginTop: "1rem", background: theme.charcoal, color: theme.cream, padding: "1rem", fontSize: "0.85rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", border: "none", cursor: "pointer", borderRadius: 2, transition: "background 0.2s", fontFamily: "'DM Sans', sans-serif" }}
                  onMouseEnter={e => e.target.style.background = theme.brown}
                  onMouseLeave={e => e.target.style.background = theme.charcoal}>
                  Send via WhatsApp ✦
                </button>
              </>
            )}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
