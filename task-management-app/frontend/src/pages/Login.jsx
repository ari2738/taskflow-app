import AuthCarousel from "../components/AuthCarousel.jsx";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import api from "../api.js";

export default function Login() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user",  JSON.stringify(res.data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <AuthCarousel />

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-card">
          <h2>Welcome back 👋</h2>
          <p className="auth-sub">Sign in to continue to TaskFlow</p>

          {error && <div className="error-text">{error}</div>}

          <form onSubmit={handleSubmit}>
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
                placeholder="••••••••" required />
            </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}
              style={{ marginTop:8 }}>
              {loading
                ? <><span className="spinner" /> Signing in…</>
                : <><LogIn size={16} /> Sign In</>}
            </button>
          </form>

          <div className="switch-text">
            New to TaskFlow? <Link to="/register">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}