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

export default function MenusPage() {
  const [allMenuItems, setAllMenuItems] = useState([]);
  const [menus, setMenus] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/admin/items?t=${Date.now()}`, {
          cache: "no-store"
        });
        if (!response.ok) throw new Error("Failed to fetch menus");
        const allItems = await response.json();
        
        // Store all menu items (including forPackageOnly)
        setAllMenuItems(allItems.filter((item) => item.category === "menu"));
        
        // Display only standard menus (not forPackageOnly)
        const menusData = allItems.filter((item) => item.category === "menu" && !item.forPackageOnly);
        const packagesData = allItems.filter((item) => item.category === "package");
        
        setMenus(menusData);
        setPackages(packagesData);
      } catch (err) {
        console.error("Error fetching menus:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMenus();
  }, []);

  if (loading) {
    return (
      <section style={{ background: theme.cream, padding: "6rem 5rem", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: "1rem", color: theme.muted }}>Loading menus...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section style={{ background: theme.cream, padding: "6rem 5rem", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: "1rem", color: "#d32f2f" }}>Error: {error}</p>
      </section>
    );
  }

  // Package Detail Modal
  const PackageModal = ({ pkg, allMenuItems, onClose }) => {
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
          borderRadius: 12,
          padding: "2.5rem",
          maxWidth: 700,
          maxHeight: "85vh",
          overflow: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
          onClick={e => e.stopPropagation()}>
          {/* Close Button */}
          <button onClick={onClose} style={{ float: "right", background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: theme.muted }}>
            ✕
          </button>

          {/* Package Image */}
          {pkg.image && (
            <img
              src={pkg.image}
              alt={pkg.title}
              style={{ width: "100%", height: 250, objectFit: "cover", borderRadius: 8, marginBottom: "1.5rem" }}
            />
          )}

          {/* Package Title */}
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", color: theme.charcoal, marginBottom: "0.8rem" }}>
            {pkg.title}
          </h2>

          {/* Package Description */}
          <p style={{ fontSize: "0.95rem", color: theme.muted, lineHeight: 1.8, marginBottom: "2rem" }}>
            {pkg.description}
          </p>

          {/* Included Menus/Dishes */}
          {pkg.menus && pkg.menus.length > 0 && (
            <div style={{ borderTop: `2px solid ${theme.border}`, paddingTop: "1.5rem" }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", color: theme.charcoal, marginBottom: "1rem" }}>
                🍽️ Included Dishes ({pkg.menus.length})
              </h3>
              <div style={{ display: "grid", gap: "1rem" }}>
                {pkg.menus.map((menu, idx) => {
                  // Handle both populated objects and IDs
                  const menuItem = typeof menu === "object" ? menu : allMenuItems.find(m => m._id === menu);
                  return menuItem ? (
                    <div key={idx} style={{ padding: "1rem", background: "white", border: `1px solid ${theme.border}`, borderRadius: 6 }}>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.05rem", color: theme.charcoal, marginBottom: "0.4rem" }}>
                        {menuItem.title}
                      </div>
                      <p style={{ fontSize: "0.85rem", color: theme.muted, lineHeight: 1.6 }}>
                        {menuItem.description}
                      </p>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Close Button at Bottom */}
          <button
            onClick={onClose}
            style={{
              width: "100%",
              marginTop: "1.5rem",
              padding: "0.9rem",
              background: theme.gold,
              color: "white",
              border: "none",
              borderRadius: 6,
              fontSize: "0.95rem",
              fontWeight: 500,
              cursor: "pointer",
              letterSpacing: "0.05em",
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <section style={{ background: theme.cream, padding: "6rem 5rem", minHeight: "100vh" }}>
      {selectedPackage && (
        <PackageModal pkg={selectedPackage} allMenuItems={allMenuItems} onClose={() => setSelectedPackage(null)} />
      )}
      <AnimatedSection>
        <p style={{ fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", color: theme.gold, fontWeight: 500, marginBottom: "0.8rem" }}>Culinary offerings</p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 3vw, 2.8rem)", color: theme.charcoal, marginBottom: "1rem" }}>Our menus</h1>
        <p style={{ fontSize: "0.95rem", lineHeight: 1.8, color: theme.muted, maxWidth: 520, marginBottom: "2.5rem" }}>Curated menus across occasions. All menus are fully customisable to match your event's vision.</p>
      </AnimatedSection>

      {/* Regular Menus Section */}
      <AnimatedSection style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", color: theme.charcoal, marginBottom: "1.5rem" }}>Standard Menus</h2>
        {menus.length === 0 ? (
          <p style={{ fontSize: "0.95rem", color: theme.muted, textAlign: "center", padding: "2rem" }}>No menus available yet.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
            {menus.map((item, i) => (
              <AnimatedSection key={item._id} style={{ transitionDelay: `${i * 0.07}s` }}>
                <div style={{ padding: "1.5rem", background: theme.warmWhite, border: `1px solid ${theme.border}`, borderRadius: 4, height: "100%" }}>
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 4, marginBottom: "0.8rem" }}
                    />
                  )}
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.05rem", color: theme.charcoal, marginBottom: "0.4rem" }}>{item.title}</div>
                  <p style={{ fontSize: "0.85rem", color: theme.muted, lineHeight: 1.6 }}>{item.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        )}
      </AnimatedSection>

      {/* Packages Section */}
      {packages.length > 0 && (
        <AnimatedSection>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", color: theme.charcoal, marginBottom: "1.5rem" }}>Menu Packages</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "1.5rem" }}>
            {packages.map((pkg, i) => (
              <AnimatedSection key={pkg._id} style={{ transitionDelay: `${i * 0.1}s` }}>
                <div
                  onClick={() => setSelectedPackage(pkg)}
                  style={{ 
                    padding: "2rem", 
                    background: theme.warmWhite, 
                    border: `2px solid ${theme.gold}`, 
                    borderRadius: 8,
                    cursor: "pointer",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.boxShadow = "0 12px 30px rgba(201, 147, 58, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "";
                  }}
                >
                  {/* Image Placeholder - Fixed Height */}
                  <div style={{ width: "100%", height: 200, background: pkg.image ? "transparent" : theme.border, borderRadius: 4, marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {pkg.image && (
                      <img
                        src={pkg.image}
                        alt={pkg.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 4 }}
                      />
                    )}
                    {!pkg.image && (
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", color: theme.charcoal, margin: "0 0 0.5rem 0" }}>
                          Savor <span style={{ color: theme.gold, fontStyle: "italic" }}>&</span> Co.
                        </p>
                        <p style={{ fontSize: "0.75rem", color: theme.muted, margin: 0 }}>Premium Catering</p>
                      </div>
                    )}
                  </div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", color: theme.charcoal, marginBottom: "0.5rem" }}>{pkg.title}</div>
                  <p style={{ fontSize: "0.9rem", color: theme.muted, lineHeight: 1.6, marginBottom: "1.5rem" }}>{pkg.description}</p>
                  
                  {/* Nested Menus in Package */}
                  {pkg.menus && pkg.menus.length > 0 && (
                    <div>
                      <p style={{ fontSize: "0.85rem", fontWeight: 600, color: theme.charcoal, marginBottom: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        📋 Includes: {pkg.menus.length} dishes
                      </p>
                      <p style={{ fontSize: "0.8rem", color: theme.gold, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer" }}>
                        Click to view →
                      </p>
                    </div>
                  )}
                </div>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>
      )}
    </section>
  );
}
