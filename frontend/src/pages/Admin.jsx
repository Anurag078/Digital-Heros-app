import { useState, useEffect } from "react";
import { runDraw, publishDraw } from "../services/drawService";
import { getAllWinnings, verifyWinning } from "../services/winningsService";
import { getAllUsers, updateUser, getSystemAnalytics, getUserScoresAdmin, updateScoreAdmin, deleteScoreAdmin } from "../services/userService";
import { getCharities, createCharity, updateCharity, deleteCharity, setRecipient as setCharityRecipient } from "../services/charityService";
import { getCampaigns, createCampaign, updateCampaign, deleteCampaign } from "../services/campaignService";
import { useNavigate } from "react-router-dom";

function Admin() {
    const [activeTab, setActiveTab] = useState("draws");
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({ winners: [], users: [], charities: [], campaigns: [] });
    const [stats, setStats] = useState({ totalUsers: 0, activeSubscribers: 0, charityImpact: 0, totalPrizePool: 0, drawStats: 0 });
    const [drawLogic, setDrawLogic] = useState("random");
    // Modals & Forms
    const [charityModal, setCharityModal] = useState(null);
    const [cForm, setCForm] = useState({ name: "", description: "", image_url: "", events: "", country: "India" });
    const [userModal, setUserModal] = useState(null);
    const [uForm, setUForm] = useState({ name: "", email: "", subscription_status: 0, plan: "" });
    const [scoreView, setScoreView] = useState(null); // { userId, scores: [] }
    const [campaignModal, setCampaignModal] = useState(null);
    const [campForm, setCampForm] = useState({ name: "", description: "", image_url: "", start_date: "", end_date: "", status: "draft" });
    const [deletingId, setDeletingId] = useState(null);

    const navigate = useNavigate();

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const [winnersRes, usersRes, charitiesRes, statsRes, campaignsRes] = await Promise.allSettled([
                getAllWinnings(),
                getAllUsers(),
                getCharities(),
                getSystemAnalytics(),
                getCampaigns()
            ]);

            setData({
                winners: winnersRes.status === 'fulfilled' ? winnersRes.value.data : [],
                users: usersRes.status === 'fulfilled' ? usersRes.value.data : [],
                charities: charitiesRes.status === 'fulfilled' ? charitiesRes.value.data : [],
                campaigns: campaignsRes.status === 'fulfilled' ? campaignsRes.value.data : []
            });

            if (statsRes.status === 'fulfilled') {
                setStats(statsRes.value.data);
            }
        } catch (err) {
            console.error("Admin data fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, [activeTab]);

    useEffect(() => {
        if (charityModal) setCForm({ 
            name: charityModal.name || "", 
            description: charityModal.description || "",
            image_url: charityModal.image_url || "",
            events: charityModal.events || "",
            country: charityModal.country || "India"
        });
        else setCForm({ name: "", description: "", image_url: "", events: "", country: "India" });
    }, [charityModal]);

    useEffect(() => {
        if (userModal) setUForm({ ...userModal });
    }, [userModal]);

    useEffect(() => {
        if (campaignModal) setCampForm({
            name: campaignModal.name || "",
            description: campaignModal.description || "",
            image_url: campaignModal.image_url || "",
            start_date: campaignModal.start_date ? campaignModal.start_date.split('T')[0] : "",
            end_date: campaignModal.end_date ? campaignModal.end_date.split('T')[0] : "",
            status: campaignModal.status || "draft"
        });
        else setCampForm({ name: "", description: "", image_url: "", start_date: "", end_date: "", status: "draft" });
    }, [campaignModal]);

    const [simulation, setSimulation] = useState(null);

    const handleSaveCampaign = async (e) => {
        e.preventDefault();
        try {
            if (campaignModal.id) {
                await updateCampaign(campaignModal.id, campForm);
                alert("Campaign updated");
            } else {
                await createCampaign(campForm);
                alert("Campaign created");
            }
            setCampaignModal(null);
            fetchAdminData();
        } catch (err) { alert("Save failed"); }
    };

    const handleDeleteCampaign = async (id) => {
        if (!window.confirm("Delete this campaign?")) return;
        try {
            await deleteCampaign(id);
            alert("Campaign deleted");
            fetchAdminData();
        } catch (err) { alert("Delete failed"); }
    };

    const handleDraw = async () => {
        setLoading(true);
        try {
            const res = await runDraw(drawLogic);
            setSimulation(res.data);
            alert("Draw simulation completed! Review results below.");
            fetchAdminData();
        } catch (err) {
            alert("Error executing simulation.");
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async () => {
        if (!simulation) return;
        setLoading(true);
        try {
            await publishDraw(simulation.drawId);
            alert("Draw results published officially!");
            setSimulation(null);
            fetchAdminData();
        } catch (err) {
            alert("Error publishing draw.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (winningId, status, proofImage = null) => {
        const notes = prompt("Enter verification notes (optional):") || "";
        try {
            await verifyWinning(winningId, status, notes, proofImage);
            alert(`Winner updated successfully`);
            fetchAdminData();
        } catch (err) {
            alert("Verification failed.");
        }
    };

    const handleViewScores = async (userId) => {
        try {
            const res = await getUserScoresAdmin(userId);
            setScoreView({ userId, scores: res.data });
        } catch (err) { alert("Failed to fetch scores"); }
    };

    const handleEditScore = async (scoreId, oldScore) => {
        const newScore = prompt("Enter new score (1-45):", oldScore);
        if (!newScore) return;
        try {
            await updateScoreAdmin(scoreId, { score: newScore, date: new Date().toISOString().split('T')[0] });
            alert("Score updated!");
            handleViewScores(scoreView.userId);
        } catch (err) { alert("Update failed"); }
    };

    const handleDeleteScore = async (scoreId) => {
        if (!window.confirm("Delete this score entry?")) return;
        try {
            await deleteScoreAdmin(scoreId);
            alert("Score deleted");
            handleViewScores(scoreView.userId);
        } catch (err) { alert("Delete failed"); }
    };

    const handleSaveCharity = async (e) => {
        e.preventDefault();
        try {
            if (charityModal.id) {
                await updateCharity(charityModal.id, cForm);
                alert("Charity updated");
            } else {
                await createCharity(cForm);
                alert("Charity created");
            }
            setCharityModal(null);
            fetchAdminData();
        } catch (err) { alert("Save failed"); }
    };

    const handleDeleteCharity = async (id) => {
        if (!window.confirm("Delete this charity?")) return;
        try {
            await deleteCharity(id);
            alert("Charity deleted");
            fetchAdminData();
        } catch (err) { alert("Delete failed"); }
    };

    const handleSetRecipient = async (id) => {
        try {
            await setCharityRecipient(id);
            alert("Hero Charity updated!");
            fetchAdminData();
        } catch (err) { alert("Action failed"); }
    };

    return (
        <div className="dashboard-container">
            {/* Top Stats Bar */}
            <div className="stats-grid">
                <div className="glass-card" style={{ padding: "20px", background: "rgba(99, 102, 241, 0.05)" }}>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Total Heroes</p>
                    <h3 style={{ fontSize: "1.8rem" }}>{stats.totalUsers}</h3>
                </div>
                <div className="glass-card" style={{ padding: "20px", background: "rgba(34, 197, 94, 0.05)" }}>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Active Subscribers</p>
                    <h3 style={{ fontSize: "1.8rem" }}>{stats.activeSubscribers}</h3>
                </div>
                <div className="glass-card" style={{ padding: "20px", background: "rgba(168, 85, 247, 0.05)" }}>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Annual Charity Impact</p>
                    <h3 style={{ fontSize: "1.8rem" }}>${stats.charityImpact}</h3>
                </div>
                <div className="glass-card" style={{ padding: "20px", background: "rgba(245, 158, 11, 0.05)" }}>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Total Prize Pool</p>
                    <h3 style={{ fontSize: "1.8rem" }}>${parseFloat(stats.totalPrizePool).toFixed(2)}</h3>
                </div>
            </div>

            <div className="glass-card" style={{ borderRadius: "24px" }}>
                <header className="dashboard-header">
                    <div>
                        <h2>Admin Portal</h2>
                        <p className="subtitle" style={{ textAlign: "left", marginBottom: 0 }}>System Governance & Checklist Verification</p>
                    </div>
                    <button style={{ margin: 0 }} onClick={() => navigate("/dashboard")}>Exit Portal</button>
                </header>

                <div className="tab-container" style={{ display: "flex", gap: "10px", marginBottom: "30px", overflowX: "auto", paddingBottom: "5px", scrollbarWidth: "none", msOverflowStyle: "none" }}>
                    <style>{`.tab-container::-webkit-scrollbar { display: none; }`}</style>
                    {["draws", "winners", "users", "charities", "campaigns", "reports"].map(tab => (
                        <button 
                            key={tab}
                            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                            style={{ 
                                padding: "10px 24px", 
                                background: activeTab === tab ? 'var(--gradient)' : 'rgba(255,255,255,0.05)',
                                color: activeTab === tab ? 'white' : 'var(--text-muted)',
                                border: "none",
                                borderRadius: "12px",
                                cursor: "pointer",
                                flexShrink: 0,
                                fontWeight: "600",
                                transition: "all 0.3s ease"
                            }}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.toUpperCase()}
                        </button>
                    ))}
                </div>

                <div className="glass-card" style={{ background: "rgba(255,255,255,0.02)", padding: "30px", minHeight: "500px" }}>

                    {activeTab === "draws" && (
                        <div style={{ textAlign: "center", padding: "40px 0" }}>
                            <h3>Monthly Draw Management</h3>
                            {!simulation ? (
                                <div style={{ marginTop: "40px" }}>
                                    <div className="input-group" style={{ maxWidth: "300px", margin: "0 auto 20px" }}>
                                        <label>Draw Methodology</label>
                                        <select 
                                            value={drawLogic} 
                                            onChange={(e) => setDrawLogic(e.target.value)}
                                            style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "white", padding: "10px", borderRadius: "10px", width: "100%" }}
                                        >
                                            <option value="random">Standard Random</option>
                                            <option value="algorithmic">Weighted Algorithmic</option>
                                        </select>
                                    </div>
                                    <button onClick={handleDraw} disabled={loading} style={{ padding: "20px 60px", fontSize: "1.3rem" }}>
                                        {loading ? "Running..." : "🎲 Run New Simulation"}
                                    </button>
                                </div>
                            ) : (
                                <div className="glass-card" style={{ maxWidth: "600px", margin: "40px auto", background: "rgba(255,255,255,0.02)", padding: "30px" }}>
                                    <h4>Simulation Results</h4>
                                    <div className="draw-numbers-container" style={{ margin: "20px 0" }}>
                                        {simulation.numbers.map((num, i) => (
                                            <div key={i} className="draw-number">{num}</div>
                                        ))}
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", textAlign: "left", marginBottom: "30px" }}>
                                        <div><p>Total Pool:</p><b>${simulation.totalPool}</b></div>
                                        <div><p>Rollover:</p><b>${simulation.rolloverAmount}</b></div>
                                        <div><p>5-Match Winners:</p><b>{simulation.stats.winners5}</b></div>
                                        <div><p>4-Match Winners:</p><b>{simulation.stats.winners4}</b></div>
                                    </div>
                                    <div style={{ display: "flex", gap: "10px" }}>
                                        <button onClick={handlePublish} style={{ flex: 1, background: "var(--success)" }}>🚀 Publish Official Results</button>
                                        <button onClick={() => setSimulation(null)} style={{ flex: 1, background: "rgba(255,255,255,0.1)" }}>Discard</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "winners" && (
                        <div>
                            <h3 style={{ marginBottom: "20px" }}>Verification Queue</h3>
                            <div style={{ display: "grid", gap: "12px" }}>
                                {data.winners.map(w => (
                                    <div key={w.id} className="glass-card" style={{ padding: "16px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", alignItems: "center" }}>
                                        <div><p style={{ fontWeight: "700" }}>{w.users?.name || "Unknown Hero"}</p></div>
                                        <div><p>${parseFloat(w.amount).toFixed(2)}</p></div>
                                        <div><span className={`badge badge-${w.status}`}>{w.status}</span></div>
                                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                                            <button className="select-btn" onClick={() => { const p = prompt("Proof Image URL:", w.proof_image || ""); if(p!==null) handleVerify(w.id, w.status, p); }}>Edit Proof</button>
                                            {w.proof_image && <a href={w.proof_image} target="_blank" rel="noreferrer" className="select-btn" style={{ textDecoration: 'none' }}>View Proof</a>}
                                            {w.status === 'pending' && <button onClick={() => handleVerify(w.id, 'paid')} style={{ background: 'var(--success)' }}>Approve</button>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "users" && (
                        <div>
                            <h3 style={{ marginBottom: "20px" }}>Hero Directory</h3>
                            <div style={{ display: "grid", gap: "10px" }}>
                                {data.users.map(u => (
                                    <div key={u.id} className="glass-card" style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                            <b>{u.name}</b> 
                                            <span style={{ color: "var(--text-muted)", marginLeft: "10px" }}>{u.email}</span>
                                            <span style={{ marginLeft: "10px", fontSize: "0.7rem", padding: "2px 6px", background: "rgba(255,255,255,0.05)", borderRadius: "4px" }}>{u.country}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button className="select-btn" onClick={() => handleViewScores(u.id)}>Scores</button>
                                            <button className="select-btn" onClick={() => { setUserModal(u); setUForm({ ...u }); }}>Profile</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "charities" && (
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                <h3>Charity Partners</h3>
                                <button onClick={() => setCharityModal({ name: "" })}>+ Add Charity</button>
                            </div>
                            <div style={{ display: "grid", gap: "12px" }}>
                                {data.charities.map(c => (
                                    <div key={c.id} className="glass-card" style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <b>{c.name}</b>
                                                <span style={{ fontSize: "0.7rem", padding: "2px 6px", background: "rgba(255,255,255,0.05)", borderRadius: "4px" }}>{c.country}</span>
                                            </div>
                                            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{c.description}</p>
                                        </div>
                                        <div style={{ display: "flex", gap: "10px" }}>
                                            <button 
                                                className="select-btn" 
                                                style={{ background: c.is_recipient ? 'var(--hero-gold)' : 'rgba(255,255,255,0.05)' }} 
                                                onClick={() => handleSetRecipient(c.id)}
                                            >
                                                {c.is_recipient ? "⭐ Hero Charity" : "Make Hero"}
                                            </button>
                                            <button className="select-btn" onClick={() => setCharityModal(c)}>Edit</button>
                                            <button className="select-btn" style={{ background: "var(--danger)" }} onClick={() => handleDeleteCharity(c.id)}>Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "campaigns" && (
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                <h3>Hero Campaigns</h3>
                                <button onClick={() => setCampaignModal({ name: "" })}>+ Create Campaign</button>
                            </div>
                            <div style={{ display: "grid", gap: "12px" }}>
                                {data.campaigns.map(c => (
                                    <div key={c.id} className="glass-card" style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <b>{c.name}</b>
                                                <span className={`badge badge-${c.status}`} style={{ fontSize: '0.65rem' }}>{c.status}</span>
                                            </div>
                                            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{c.description}</p>
                                            <small style={{ color: 'var(--text-muted)' }}>{c.start_date ? new Date(c.start_date).toLocaleDateString() : 'N/A'} to {c.end_date ? new Date(c.end_date).toLocaleDateString() : 'N/A'}</small>
                                        </div>
                                        <div style={{ display: "flex", gap: "10px" }}>
                                            <button className="select-btn" onClick={() => setCampaignModal(c)}>Edit</button>
                                            <button className="select-btn" style={{ background: "var(--danger)" }} onClick={() => handleDeleteCampaign(c.id)}>Delete</button>
                                        </div>
                                    </div>
                                ))}
                                {data.campaigns.length === 0 && (
                                    <div className="glass-card" style={{ padding: "40px", textAlign: "center", background: "rgba(255,255,255,0.01)" }}>
                                        <p style={{ color: "var(--text-muted)" }}>No active campaigns. Start one to boost hero engagement!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "reports" && (
                        <div>
                            <h3 style={{ textAlign: "center", marginBottom: "30px" }}>Platform Analytics</h3>
                            <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
                                <div className="glass-card" style={{ background: "rgba(99, 102, 241, 0.03)", padding: "24px", border: "1px solid rgba(99, 102, 241, 0.1)" }}>
                                    <h4 style={{ color: "var(--text-muted)", fontSize: "0.9rem", textTransform: "uppercase" }}>Charity Impact</h4>
                                    <p style={{ fontSize: "2.5rem", margin: "15px 0", fontWeight: "800", color: "var(--primary)" }}>${stats.charityImpact}</p>
                                    <div style={{ height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                                        <div style={{ width: "70%", height: "100%", background: "var(--gradient)" }}></div>
                                    </div>
                                    <p style={{ marginTop: "15px", fontSize: "0.85rem", color: "var(--text-muted)" }}>Hero contributions generated this cycle.</p>
                                </div>
                                <div className="glass-card" style={{ background: "rgba(34, 197, 94, 0.03)", padding: "24px", border: "1px solid rgba(34, 197, 94, 0.1)" }}>
                                    <h4 style={{ color: "var(--text-muted)", fontSize: "0.9rem", textTransform: "uppercase" }}>Draw Integrity</h4>
                                    <p style={{ fontSize: "2.5rem", margin: "15px 0", fontWeight: "800", color: "var(--success)" }}>{stats.drawStats}</p>
                                    <div style={{ height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                                        <div style={{ width: "90%", height: "100%", background: "var(--success)" }}></div>
                                    </div>
                                    <p style={{ marginTop: "15px", fontSize: "0.85rem", color: "var(--text-muted)" }}>Verified monthly draw cycles completed.</p>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Modals */}
            {scoreView && (
                <div className="modal-overlay">
                    <div className="glass-card" style={{ maxWidth: "600px" }}>
                        <h3>Manage User Scores</h3>
                        <div style={{ maxHeight: "400px", overflowY: "auto", marginTop: "20px" }}>
                            {scoreView.scores.map(s => (
                                <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                    <span>Score: <b>{s.score}</b> ({s.date})</span>
                                    <div style={{ display: "flex", gap: "10px" }}>
                                        <button className="select-btn" onClick={() => handleEditScore(s.id, s.score)}>Edit</button>
                                        <button className="select-btn" style={{ background: "var(--danger)" }} onClick={() => handleDeleteScore(s.id)}>Del</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button style={{ width: "100%", marginTop: "20px" }} onClick={() => setScoreView(null)}>Close</button>
                    </div>
                </div>
            )}

            {charityModal && (
                <div className="modal-overlay">
                    <div className="glass-card" style={{ maxWidth: "500px" }}>
                        <h3>{charityModal.id ? "Edit Charity" : "Add New Charity"}</h3>
                        <form onSubmit={handleSaveCharity} style={{ marginTop: "20px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label>Charity Name</label>
                                    <input type="text" value={cForm.name} onChange={(e) => setCForm({ ...cForm, name: e.target.value })} required />
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label>Country</label>
                                    <input type="text" value={cForm.country} onChange={(e) => setCForm({ ...cForm, country: e.target.value })} />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Image URL</label>
                                <input type="text" value={cForm.image_url} onChange={(e) => setCForm({ ...cForm, image_url: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Description</label>
                                <textarea value={cForm.description} onChange={(e) => setCForm({ ...cForm, description: e.target.value })} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "none", borderRadius: "12px", padding: "12px", color: "white", minHeight: "80px" }} />
                            </div>
                            <div className="input-group">
                                <label>Upcoming Events</label>
                                <textarea value={cForm.events} onChange={(e) => setCForm({ ...cForm, events: e.target.value })} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "none", borderRadius: "12px", padding: "12px", color: "white", minHeight: "80px" }} />
                            </div>
                            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                                <button type="submit" style={{ flex: 1 }}>Save</button>
                                <button type="button" style={{ flex: 1, background: "rgba(255,255,255,0.1)" }} onClick={() => setCharityModal(null)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {userModal && (
                <div className="modal-overlay">
                    <div className="glass-card" style={{ maxWidth: "500px" }}>
                        <h3>Edit Hero Profile</h3>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                                await updateUser(userModal.id, uForm);
                                alert("User updated");
                                setUserModal(null);
                                fetchAdminData();
                            } catch (err) { alert("Update failed"); }
                        }} style={{ marginTop: "20px" }}>
                            <div className="input-group">
                                <label>Name</label>
                                <input type="text" value={uForm.name} onChange={(e) => setUForm({ ...uForm, name: e.target.value })} required />
                            </div>
                            <div className="input-group">
                                <label>Email</label>
                                <input type="email" value={uForm.email} onChange={(e) => setUForm({ ...uForm, email: e.target.value })} required />
                            </div>
                            <div className="input-group">
                                <label>Subscription</label>
                                <select value={uForm.subscription_status} onChange={(e) => setUForm({ ...uForm, subscription_status: Number(e.target.value) })}>
                                    <option value={1}>Active</option>
                                    <option value={0}>Inactive</option>
                                </select>
                            </div>
                            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                                <button type="submit" style={{ flex: 1 }}>Save</button>
                                <button type="button" style={{ flex: 1, background: "rgba(255,255,255,0.1)" }} onClick={() => setUserModal(null)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {campaignModal && (
                <div className="modal-overlay">
                    <div className="glass-card" style={{ maxWidth: "500px" }}>
                        <h3>{campaignModal.id ? "Edit Campaign" : "Launch New Campaign"}</h3>
                        <form onSubmit={handleSaveCampaign} style={{ marginTop: "20px" }}>
                            <div className="input-group">
                                <label>Campaign Name</label>
                                <input type="text" value={campForm.name} onChange={(e) => setCampForm({ ...campForm, name: e.target.value })} required />
                            </div>
                            <div className="input-group">
                                <label>Mission Description</label>
                                <textarea value={campForm.description} onChange={(e) => setCampForm({ ...campForm, description: e.target.value })} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "none", borderRadius: "12px", padding: "12px", color: "white", minHeight: "100px" }} />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label>Start Date</label>
                                    <input type="date" value={campForm.start_date} onChange={(e) => setCampForm({ ...campForm, start_date: e.target.value })} required />
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label>End Date</label>
                                    <input type="date" value={campForm.end_date} onChange={(e) => setCampForm({ ...campForm, end_date: e.target.value })} required />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Status</label>
                                <select value={campForm.status} onChange={(e) => setCampForm({ ...campForm, status: e.target.value })}>
                                    <option value="draft">Draft</option>
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                                <button type="submit" style={{ flex: 1 }}>{campaignModal.id ? "Update" : "Launch"}</button>
                                <button type="button" style={{ flex: 1, background: "rgba(255,255,255,0.1)" }} onClick={() => setCampaignModal(null)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Admin;