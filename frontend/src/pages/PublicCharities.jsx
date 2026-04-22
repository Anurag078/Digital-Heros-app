import { useEffect, useState } from "react";
import { getCharities } from "../services/charityService";
import { useNavigate } from "react-router-dom";

function PublicCharities() {
    const [charities, setCharities] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedCharity, setSelectedCharity] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        getCharities().then(res => setCharities(res.data));
    }, []);

    const filtered = charities.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.description.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="dashboard-container reveal" style={{ maxWidth: '1200px' }}>
            <div className="glass-card" style={{ maxWidth: '100%', padding: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h2 style={{ margin: 0 }}>Charity Directory</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '5px' }}>Support local missions through your performance</p>
                    </div>
                    <button className="logout-btn" onClick={() => navigate("/")}>Back to Home</button>
                </div>
                
                <div className="input-group" style={{ marginBottom: '40px' }}>
                    <input 
                        type="text" 
                        placeholder="🔍 Search charities by name or cause..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ padding: '16px 24px', fontSize: '1.1rem' }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
                    {filtered.map((c, i) => (
                        <div key={c.id} className="glass-card reveal" style={{ padding: '30px', background: 'rgba(255,255,255,0.03)', height: '100%', display: 'flex', flexDirection: 'column', animationDelay: `${i * 0.1}s`, border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ color: 'var(--primary)', marginBottom: '15px' }}>{c.name}</h3>
                                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>{c.description.substring(0, 150)}...</p>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                                <button 
                                    className="select-btn" 
                                    style={{ flex: 1, background: 'rgba(255,255,255,0.05)' }}
                                    onClick={() => setSelectedCharity(c)}
                                >
                                    View Profile
                                </button>
                                <button 
                                    className="hero-btn" 
                                    style={{ flex: 1 }}
                                    onClick={() => navigate("/signup")}
                                >
                                    Support
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedCharity && (
                <div className="modal-overlay" onClick={() => setSelectedCharity(null)}>
                    <div className="glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px', padding: '0', overflow: 'hidden', position: 'relative', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                        <button 
                            onClick={() => setSelectedCharity(null)}
                            style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.3)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}
                        >
                            ×
                        </button>
                        <div style={{ flexShrink: 0, height: '200px', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <h2 style={{ color: 'white', fontSize: '2.5rem', textAlign: 'center', padding: '0 20px' }}>{selectedCharity.name}</h2>
                        </div>
                        <div style={{ padding: '40px', overflowY: 'auto' }}>
                            <h3 style={{ marginBottom: '15px', color: 'var(--primary)' }}>About this Mission</h3>
                            <p style={{ color: '#cbd5e1', lineHeight: '1.8', fontSize: '1.05rem', marginBottom: '30px' }}>{selectedCharity.description}</p>
                            
                            <div className="glass-card" style={{ background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '20px' }}>
                                <h4 style={{ color: 'var(--success)', marginBottom: '10px' }}>Upcoming Hero Events</h4>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <li style={{ marginBottom: '10px' }}>⛳ Charity Golf Day - July 15, 2026</li>
                                    <li>🤝 Community Awareness Meet - Aug 2, 2026</li>
                                </ul>
                            </div>

                            <div style={{ display: 'flex', gap: '15px', marginTop: '40px' }}>
                                <button className="hero-btn" style={{ flex: 1 }} onClick={() => navigate("/signup")}>Partner with this Charity</button>
                                <button className="select-btn" style={{ flex: 1, background: 'rgba(255,255,255,0.1)', boxShadow: 'none' }} onClick={() => setSelectedCharity(null)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PublicCharities;
