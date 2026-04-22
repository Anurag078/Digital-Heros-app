import { useState, useEffect } from "react";
import { logout } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { getToken } from "../utils/auth";
import { cancelSubscription } from "../services/subscriptionService";

function ProfileSettings() {
    const [user, setUser] = useState(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [percentage, setPercentage] = useState(10);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
            setUser(storedUser);
            setName(storedUser.name);
            setEmail(storedUser.email);
            setPercentage(storedUser.charity_percentage || 10);
        }
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await API.put("/auth/profile", { name, email, charity_percentage: percentage }, {
                headers: { Authorization: getToken() }
            });
            alert("Profile updated!");
            // Update local storage
            const updated = { ...user, name, email, charity_percentage: percentage };
            localStorage.setItem("user", JSON.stringify(updated));
            setUser(updated);
        } catch (err) {
            alert("Update failed.");
        }
    };

    if (!user) return null;

    return (
        <div className="dashboard-container" style={{ maxWidth: '800px' }}>
            <div className="glass-card" style={{ maxWidth: '100%', padding: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <h2 style={{ margin: 0 }}>Profile & Settings</h2>
                    <button className="logout-btn" onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                    {/* Profile Form */}
                    <div>
                        <h3 style={{ marginBottom: '20px' }}>Personal Information</h3>
                        <form onSubmit={handleUpdate}>
                            <div className="input-group">
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Full Name</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                            </div>
                            <div className="input-group">
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Email Address</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                            <div className="input-group">
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Charity Contribution (%)</label>
                                <input 
                                    type="number" 
                                    min="10" 
                                    max="100" 
                                    value={percentage} 
                                    onChange={(e) => setPercentage(e.target.value)} 
                                    required 
                                />
                                <small style={{ color: 'var(--text-muted)' }}>Minimum 10% required</small>
                            </div>
                            <button type="submit">Update Profile</button>
                        </form>
                    </div>

                    {/* Subscription Details */}
                    <div>
                        <h3 style={{ marginBottom: '20px' }}>Account Status</h3>
                        <div className="glass-card" style={{ padding: '24px', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ marginBottom: '15px' }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Current Plan</p>
                                <p style={{ fontSize: '1.2rem', fontWeight: '700', textTransform: 'capitalize' }}>{user.plan || 'No Active Plan'}</p>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Role</p>
                                <p style={{ fontSize: '1rem', textTransform: 'capitalize' }}>{user.role}</p>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '10px' }}>
                                Next billing cycle: 21st May 2026
                            </p>
                            <button 
                                style={{ marginTop: '20px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', boxShadow: 'none', width: '100%' }}
                                onClick={async () => {
                                    if(window.confirm("Are you sure you want to cancel your subscription?")) {
                                        try {
                                            await cancelSubscription();
                                            alert("Subscription cancelled.");
                                            const updated = { ...user, subscription_status: 0 };
                                            localStorage.setItem("user", JSON.stringify(updated));
                                            setUser(updated);
                                        } catch (err) { alert("Cancellation failed."); }
                                    }
                                }}
                            >
                                Cancel Auto-Renewal
                            </button>
                        </div>
                        
                        <h3 style={{ marginBottom: '20px', marginTop: '30px' }}>Direct Impact</h3>
                        <div className="glass-card" style={{ padding: '24px', background: 'rgba(34, 197, 94, 0.03)', border: '1px solid rgba(34, 197, 94, 0.1)' }}>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Make an independent donation</p>
                            <button 
                                style={{ marginTop: '15px', background: 'var(--success)', width: '100%' }}
                                onClick={() => alert("Redirecting to secure donation gateway...")}
                            >
                                Heart-to-Heart Donation
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '60px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '30px', textAlign: 'center' }}>
                    <button 
                        className="logout-btn" 
                        style={{ width: 'auto', padding: '10px 30px' }}
                        onClick={() => { logout(); navigate("/login"); }}
                    >
                        Secure Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProfileSettings;
