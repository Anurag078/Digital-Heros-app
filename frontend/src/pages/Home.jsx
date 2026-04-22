import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getCharities } from "../services/charityService";

function Home() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    getCharities().then(res => {
      const hero = res.data.find(c => c.is_recipient);
      setFeatured(hero || res.data[0]);
    });
  }, []);

  return (
    <div className="home-container" style={{ padding: '60px 20px' }}>
      
      {/* Hero Section: Emotion-Driven Header */}
      <div className="reveal" style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto 80px' }}>
        <span style={{ color: 'var(--hero-gold)', fontWeight: '800', fontSize: '0.85rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '15px', display: 'block' }}>Play with Purpose</span>
        <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', fontWeight: '800', lineHeight: '1.1', marginBottom: '25px', letterSpacing: '-0.02em' }}>
          Be the Hero <br/>
          <span style={{ background: 'var(--gradient)', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Behind the Game.</span>
        </h1>
        <p style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '40px', maxWidth: '700px', margin: '0 auto 40px' }}>
          Digital Heroes turns your golf performance into real-world change. Support your local missions, enter the draw, and watch your contribution save lives.
        </p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="hero-btn" style={{ padding: '16px 36px', fontSize: '1rem' }} onClick={() => navigate("/signup")}>
            Join the Mission
          </button>
          <button style={{ padding: '16px 36px', fontSize: '1rem', background: 'rgba(255,255,255,0.05)', boxShadow: 'none' }} onClick={() => navigate("/charities")}>
            Explore Charities
          </button>
        </div>
      </div>

      {/* Feature Grid: Communicating Value */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', width: '100%', maxWidth: '1100px', margin: '0 auto' }}>
        <div className="glass-card reveal" style={{ padding: '30px', textAlign: 'left', borderBottom: '4px solid var(--primary)', maxWidth: 'none' }}>
          <div style={{ fontSize: '2rem', marginBottom: '20px' }}>🛡️</div>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '12px' }}>Choose Your Mission</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>Select a charity partner you believe in. 10% of every subscription goes directly to fuel their cause.</p>
        </div>
        <div className="glass-card reveal" style={{ padding: '30px', textAlign: 'left', borderBottom: '4px solid var(--success)', maxWidth: 'none' }}>
          <div style={{ fontSize: '2rem', marginBottom: '20px' }}>📉</div>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '12px' }}>Log Your Score</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>Enter your latest 5 golf scores. Our algorithm uses your performance to enter you into the hero's draw.</p>
        </div>
        <div className="glass-card reveal" style={{ padding: '30px', textAlign: 'left', borderBottom: '4px solid var(--hero-gold)', maxWidth: 'none' }}>
          <div style={{ fontSize: '2rem', marginBottom: '20px' }}>🏆</div>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '12px' }}>Win & Payout</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>Match the monthly draw numbers to win big. Equal prize splitting and jackpot rollovers ensure massive rewards.</p>
        </div>
      </div>

      {/* Featured Charity Spotlight */}
      {featured && (
        <div className="glass-card reveal spotlight-card" style={{ maxWidth: '1100px', width: '100%', margin: '60px auto 0', padding: '35px', display: 'flex', gap: '30px', alignItems: 'center', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
           <div style={{ flex: 1 }}>
              <span style={{ color: 'var(--hero-gold)', fontWeight: '800', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Current Hero Spotlight</span>
              <h2 style={{ fontSize: '1.8rem', marginTop: '10px', marginBottom: '15px', textAlign: 'left' }}>{featured.name}</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>{featured.description.substring(0, 200)}...</p>
              <button 
                className="select-btn" 
                style={{ marginTop: '20px', width: 'auto', padding: '10px 30px' }}
                onClick={() => navigate("/charities")}
              >
                Learn More
              </button>
           </div>
           <div className="spotlight-icon" style={{ width: '160px', height: '160px', background: 'var(--gradient)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2.5rem', flexShrink: 0 }}>
              🤝
           </div>
        </div>
      )}

      {/* Footer Navigation */}
      <footer style={{ marginTop: '80px', padding: '40px 0', borderTop: '1px solid rgba(255,255,255,0.05)', width: '100%', maxWidth: '1100px', margin: '80px auto 0', display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '30px' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate("/charities")}>Charity Directory</span>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate("/mechanics")}>The Draw Mechanics</span>
        </div>
        <div>
          <span>© 2026 DIGITAL HEROES • SECURE MEMBER PORTAL</span>
        </div>
      </footer>
    </div>
  );
}

export default Home;
