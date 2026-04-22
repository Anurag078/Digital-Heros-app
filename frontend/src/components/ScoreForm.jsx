import { useState } from "react";
import { addScore } from "../services/scoreService";

function ScoreForm({ refresh }) {
  const [score, setScore] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!score || !date) return alert("Please fill in all fields");
    
    setLoading(true);
    try {
      await addScore({ score, date });
      setScore("");
      setDate("");
      refresh();
    } catch (err) {
      alert(err.response?.data?.message || "Error adding score");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="score-form">
      <h3 style={{ marginBottom: "20px", fontSize: "1.4rem", fontWeight: "600" }}>Add New Score</h3>
      <form onSubmit={handleSubmit} style={{ gap: "16px" }}>
        <div className="input-group">
          <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>Score (1-45)</label>
          <input 
            type="number" 
            placeholder="Enter score" 
            value={score}
            min="1"
            max="45"
            required
            onChange={(e) => setScore(e.target.value)} 
          />
        </div>
        <div className="input-group">
          <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>Date</label>
          <input 
            type="date" 
            value={date}
            required
            onChange={(e) => setDate(e.target.value)} 
          />
        </div>
        <button type="submit" disabled={loading} style={{ marginTop: "10px" }}>
          {loading ? "Adding..." : "Add Score"}
        </button>
      </form>
    </div>
  );
}

export default ScoreForm;