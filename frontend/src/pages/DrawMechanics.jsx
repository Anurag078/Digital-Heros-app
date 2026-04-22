import { useNavigate } from "react-router-dom";

function DrawMechanics() {
    const navigate = useNavigate();

    return (
        <div className="dashboard-container reveal" style={{ maxWidth: '1000px' }}>
            <div className="glass-card" style={{ maxWidth: '100%', padding: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <h2 style={{ margin: 0 }}>How the Draw Works</h2>
                    <button className="logout-btn" onClick={() => navigate("/")}>Back to Home</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <section>
                        <h3 style={{ color: 'var(--primary)', marginBottom: '10px' }}>1. Enter Your Scores</h3>
                        <p className="subtitle" style={{ textAlign: 'left', marginBottom: 0 }}>
                            Track your golf performance by entering your Stableford scores (1-45). Your last 5 scores are always active for the monthly draw.
                        </p>
                    </section>

                    <section>
                        <h3 style={{ color: 'var(--primary)', marginBottom: '10px' }}>2. The Monthly Draw</h3>
                        <p className="subtitle" style={{ textAlign: 'left', marginBottom: 0 }}>
                            Once a month, the system generates 5 winning numbers. We compare these numbers against your stored scores.
                        </p>
                    </section>

                    <section className="glass-card" style={{ padding: '30px', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                        <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>Prize Pool Distribution</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', textAlign: 'center' }}>
                            <div>
                                <h4 style={{ color: 'var(--primary)' }}>5-Match</h4>
                                <p style={{ fontSize: '1.5rem', fontWeight: '800' }}>40%</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>of Pool</p>
                            </div>
                            <div>
                                <h4 style={{ color: 'var(--primary)' }}>4-Match</h4>
                                <p style={{ fontSize: '1.5rem', fontWeight: '800' }}>35%</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>of Pool</p>
                            </div>
                            <div>
                                <h4 style={{ color: 'var(--primary)' }}>3-Match</h4>
                                <p style={{ fontSize: '1.5rem', fontWeight: '800' }}>25%</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>of Pool</p>
                            </div>
                        </div>
                    </section>

                    <section className="reveal" style={{ animationDelay: '0.6s' }}>
                        <h3 style={{ color: 'var(--primary)', marginBottom: '10px' }}>3. Double Your Impact</h3>
                        <p className="subtitle" style={{ textAlign: 'left', marginBottom: '20px' }}>
                            Win or lose, your subscription makes a difference. 10% of every fee directly empowers the charity of your choice. When you win, we all win — fueling the mission for a better world.
                        </p>
                        <button 
                            className="hero-btn" 
                            style={{ width: 'auto', padding: '14px 60px', borderRadius: '100px' }}
                            onClick={() => navigate("/signup")}
                        >
                            Become a Hero Today
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default DrawMechanics;
