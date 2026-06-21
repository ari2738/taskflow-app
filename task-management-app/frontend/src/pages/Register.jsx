import AuthCarousel from "../components/AuthCarousel.jsx";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import api from "../api.js";

export default function Register() {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await api.post("/auth/register", { name, email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user",  JSON.stringify(res.data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <AuthCarousel />

      <div className="auth-right">
        <div className="auth-card">
          <h2>Create account ✨</h2>
          <p className="auth-sub">Get started — it's free forever</p>

          {error && <div className="error-text">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Your name" required />
            </div>
            <div className="field">
              <label>Email address</label>
              <input type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters" required />
            </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}
              style={{ marginTop:8 }}>
              {loading
                ? <><span className="spinner" /> Creating…</>
                : <><UserPlus size={16} /> Create Account</>}
            </button>
          </form>

          <div className="switch-text">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}