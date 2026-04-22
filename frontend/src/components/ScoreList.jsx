function ScoreList({ scores, loading }) {
  if (loading) return <p style={{ color: "var(--text-muted)" }}>Loading scores...</p>;

  return (
    <div className="score-list">
      <h3 style={{ marginBottom: "20px", fontSize: "1.4rem", fontWeight: "600" }}>Your Recent Scores</h3>
      {scores.length === 0 ? (
        <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "20px" }}>No scores yet. Add one to get started!</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {scores.map((s) => (
            <div 
              key={s.id} 
              className="glass-card" 
              style={{ 
                padding: "16px 20px", 
                background: "rgba(255, 255, 255, 0.05)", 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                transition: "transform 0.2s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateX(5px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateX(0)"}
            >
              <div>
                <span style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--primary)" }}>{s.score}</span>
                <span style={{ marginLeft: "8px", fontSize: "0.85rem", color: "var(--text-muted)" }}>Points</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "0.9rem", fontWeight: "500" }}>
                  {new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      <p style={{ marginTop: "20px", fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center" }}>
        * Only the last 5 scores are kept.
      </p>
    </div>
  );
}

export default ScoreList;