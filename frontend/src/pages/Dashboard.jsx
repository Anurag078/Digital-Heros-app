import { useState, useEffect } from "react";
import API from "../services/api";
import { logout } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import ScoreForm from "../components/ScoreForm";
import ScoreList from "../components/ScoreList";
import CharityList from "../components/CharityList";
import { getScores } from "../services/scoreService";
import { subscribeUser } from "../services/subscriptionService";
import { getLastDraw, getAllDraws } from "../services/drawService";
import { getCharities, selectCharity } from "../services/charityService";
import { getMyWinnings, claimWinning } from "../services/winningsService";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [scores, setScores] = useState([]);
  const [draw, setDraw] = useState(null);
  const [drawHistory, setDrawHistory] = useState([]);
  const [charities, setCharities] = useState([]);
  const [winnings, setWinnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [charityModal, setCharityModal] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const uRes = await API.get("/auth/me");
      setUser(uRes.data);

      const [scoresRes, drawRes, charitiesRes, winningsRes, historyRes] = await Promise.all([
        getScores().catch(() => ({ data: [] })),
        getLastDraw().catch(() => ({ data: null })),
        getCharities().catch(() => ({ data: [] })),
        getMyWinnings().catch(() => ({ data: [] })),
        getAllDraws().catch(() => ({ data: [] }))
      ]);
      setScores(scoresRes.data);
      setDraw(drawRes.data);
      setCharities(charitiesRes.data);
      setWinnings(winningsRes.data);
      setDrawHistory(historyRes.data);
    } catch (err) {
      console.error("Fetch error:", err);
      if (err.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubscribe = async (plan) => {
    try {
      await subscribeUser(plan, "tok_mock_hero_card");
      alert(`Subscribed to ${plan} plan!`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Subscription failed.");
    }
  };

  const handleCharitySelect = async (id) => {
    try {
      await selectCharity(id);
      setCharityModal(false);
      alert("Charity updated!");
      fetchData();
    } catch (err) {
      alert("Selection failed.");
    }
  };

  const handleClaim = async (winningId) => {
    const proofImage = prompt("Provide proof image link:");
    try {
      await claimWinning(winningId, proofImage);
      alert("Claimed! Pending verification.");
      fetchData();
    } catch (err) {
      alert("Claim failed.");
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h2>Hero Dashboard</h2>
          <p className="subtitle" style={{ textAlign: "left", marginBottom: 0 }}>
            Welcome back, {user?.name || "Hero"}!
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {user?.role === 'admin' && (
            <button className="select-btn" onClick={() => navigate("/admin")} style={{ background: 'var(--hero-gold)', color: 'black', border: 'none', boxShadow: '0 4px 15px rgba(251, 191, 36, 0.3)' }}>Admin Portal</button>
          )}
          <button className="select-btn" onClick={() => { logout(); navigate("/login"); }} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>Logout</button>
        </div>
      </header>

      {loading ? (
        <div style={{ textAlign: "center", padding: "100px" }}>
          <div className="loader"></div>
          <p>Loading Hero Data...</p>
        </div>
      ) : (
        <div className="reveal">
          <div className="stats-grid">
            <div className="glass-card" style={{ padding: "24px", background: "rgba(99, 102, 241, 0.05)" }}>
              <h3 style={{ fontSize: "1.1rem" }}>Status</h3>
              <p style={{ fontSize: "1.2rem", fontWeight: "700", color: user?.subscription_status ? "var(--success)" : "var(--danger)" }}>
                {user?.subscription_status ? "ACTIVE" : "INACTIVE"}
              </p>
            </div>
            <div className="glass-card" style={{ padding: "24px", background: "rgba(251, 191, 36, 0.05)" }}>
              <h3 style={{ fontSize: "1.1rem" }}>My Charity</h3>
              <p style={{ fontSize: "1.2rem", fontWeight: "700" }}>
                {charities?.find(c => Number(c.id) === Number(user?.charity_id))?.name || "Not Set"}
              </p>
              <button className="select-btn" style={{ width: '100%', marginTop: '10px' }} onClick={() => setCharityModal(true)}>Change</button>
            </div>
            <div className="glass-card" style={{ padding: "24px", background: "rgba(255, 255, 255, 0.05)" }}>
              <h3 style={{ fontSize: "1.1rem" }}>History</h3>
              <p style={{ fontSize: "1.5rem", fontWeight: "800" }}>{drawHistory?.length || 0} Draws</p>
            </div>

            <div className="glass-card" style={{ padding: "24px", background: "rgba(255, 255, 255, 0.02)", textAlign: 'center' }}>
              <h3 style={{ fontSize: "1.1rem" }}>Next Draw</h3>
              {draw ? (
                <div className="draw-numbers-container" style={{ marginTop: '10px' }}>
                  {draw.numbers?.split(",").map((num, i) => (
                    <div key={i} className="draw-number" style={{ width: '35px', height: '35px', fontSize: '0.9rem' }}>{num}</div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "var(--text-muted)", marginTop: '10px', fontSize: '0.8rem' }}>Waiting...</p>
              )}
            </div>
          </div>

          {winnings.filter(w => w.status !== 'paid').length > 0 && (
            <div style={{ marginBottom: "30px" }}>
              <div className="glass-card" style={{ padding: "20px", background: "rgba(245, 158, 11, 0.03)" }}>
                <h3>🏆 Winnings</h3>
                {winnings.filter(w => w.status !== 'paid').map(w => (
                  <div key={w.id} style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", alignItems: 'center' }}>
                    <span>${parseFloat(w.amount).toFixed(2)} ({w.match_type}-Match)</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <span className={`badge badge-${w.status}`}>{w.status}</span>
                        {w.status === 'unclaimed' && <button className="select-btn" onClick={() => handleClaim(w.id)}>Claim</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="main-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            <div className="glass-card" style={{ padding: "20px", position: "relative" }}>
              <h3>Add New Score</h3>
              {!user?.subscription_status && <div className="overlay">Subscription Required</div>}
              <ScoreForm refresh={fetchData} />
            </div>

            <div className="glass-card" style={{ padding: "20px" }}>
              <h3>Your Recent Scores</h3>
              <ScoreList scores={scores} loading={loading} />
            </div>

            <div className="side-grid">
              <div className="glass-card" style={{ padding: "20px" }}>
                <h3>Subscription Plan</h3>
                <div className="sub-grid" style={{ marginTop: '15px' }}>
                    <div className={`sub-card ${user?.plan === 'monthly' ? 'active' : ''}`} onClick={() => handleSubscribe("monthly")}>Monthly</div>
                    <div className={`sub-card ${user?.plan === 'yearly' ? 'active' : ''}`} onClick={() => handleSubscribe("yearly")}>Yearly</div>
                </div>
              </div>
              <div className="glass-card" style={{ padding: "20px" }}>
                <h3>Draw History</h3>
                <div style={{ marginTop: "15px", maxHeight: '200px', overflowY: 'auto' }}>
                    {drawHistory.map(d => (
                        <div key={d.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: '0.85rem' }}>
                            <span>Draw #{d.id}</span>
                            <b>{d.numbers}</b>
                        </div>
                    ))}
                    {drawHistory.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No history yet.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {charityModal && (
        <div className="modal-overlay">
          <div className="glass-card" style={{ maxWidth: "600px", padding: "30px" }}>
            <h3>Choose Charity</h3>
            <CharityList charities={charities} onSelect={handleCharitySelect} />
            <button style={{ width: "100%", marginTop: "20px" }} onClick={() => setCharityModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;