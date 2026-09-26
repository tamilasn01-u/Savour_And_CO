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

export default function Footer() {
  return (
    <footer style={{ background: "#111", color: "#888", padding: "3rem 5rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #222", userSelect: "none" }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", color: "#FDFAF5" }}>
        Savor <span style={{ color: theme.gold, fontStyle: "italic" }}>&</span> Co.
      </div>
      <div style={{ display: "flex", gap: "2rem" }}>
        {[["/how", "How it works"], ["/chefs", "Chefs"], ["/menus", "Menus"], ["/booking", "Book"]].map(([href, label]) => (
          <Link key={href} to={href} style={{ textDecoration: "none", fontSize: "0.78rem", color: "#888", letterSpacing: "0.06em", textTransform: "uppercase", transition: "color 0.2s" }}
            onMouseEnter={e => e.target.style.color = theme.gold}
            onMouseLeave={e => e.target.style.color = "#888"}
            onDragStart={e => e.preventDefault()}>
            {label}
          </Link>
        ))}
      </div>
      <div style={{ fontSize: "0.78rem" }}>© 2026 Savor & Co. All rights reserved.</div>
    </footer>
  );
}
