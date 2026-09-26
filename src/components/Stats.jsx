const theme = {
  gold: "#C9933A",
  muted: "#7A6F62",
};

export default function Stats() {
  const stats = [["48", "Expert Chefs"], ["200+", "Events Served"], ["15+", "Cuisines"], ["98%", "Client Satisfaction"]];
  return (
    <div style={{ background: "#1C1C1A", padding: "3rem 5rem", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2rem", textAlign: "center" }}>
      {stats.map(([num, label]) => (
        <div key={label}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.4rem", color: theme.gold, display: "block" }}>{num}</span>
          <span style={{ fontSize: "0.78rem", color: "#aaa", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "0.3rem", display: "block" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}
