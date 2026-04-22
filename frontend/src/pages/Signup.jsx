import { useState, useEffect } from "react";
import { signupUser } from "../services/authService";
import { getCharities } from "../services/charityService";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    charity_id: "", 
    charity_percentage: 10 
  });
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getCharities().then(res => setCharities(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { 
        ...form, 
        charity_id: form.charity_id ? Number(form.charity_id) : null,
        charity_percentage: Number(form.charity_percentage),
        country: "India" // Default for now
      };
      await signupUser(payload);
      alert("Welcome Hero! Your account is ready. Please log in.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card">
        <h2>Join Digital Heroes</h2>
        <p className="subtitle">Start your journey today</p>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input 
              type="text"
              placeholder="Full Name" 
              required
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
            />
          </div>
          <div className="input-group">
            <input 
              type="email"
              placeholder="Email Address" 
              required
              onChange={(e) => setForm({ ...form, email: e.target.value })} 
            />
          </div>
          <div className="input-group">
            <input 
              type="password" 
              placeholder="Password" 
              required
              onChange={(e) => setForm({ ...form, password: e.target.value })} 
            />
          </div>

          <div className="input-group">
            <label>Select Your Charity</label>
            {charities.length > 0 ? (
              <select 
                required
                onChange={(e) => setForm({ ...form, charity_id: e.target.value })}
              >
                <option value="">-- Choose a Charity --</option>
                {charities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            ) : (
              <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', color: '#ef4444', fontSize: '0.8rem' }}>
                ⚠️ No charities found. Please add charities in the Admin Portal or check your database connection.
              </div>
            )}
          </div>

          <div className="input-group">
            <label>Charity Contribution: {form.charity_percentage}%</label>
            <input 
              type="range" 
              min="10" 
              max="100" 
              step="5"
              value={form.charity_percentage}
              onChange={(e) => setForm({ ...form, charity_percentage: e.target.value })}
            />
            <small>Minimum 10% contribution required</small>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;