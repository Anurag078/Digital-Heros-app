import { useState } from "react";
import { loginUser } from "../services/authService";
import { setToken } from "../utils/auth";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser(form);
      setToken(res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user)); // Save user for role checks
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card">
        <h2>Welcome Back</h2>
        <p className="subtitle">Sign in to your account</p>
        
        <form onSubmit={handleSubmit}>
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
          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/signup">Create one</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;