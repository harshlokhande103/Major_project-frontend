import React, { useState } from 'react';
import { apiBaseUrl } from '../config';

const Login = ({ onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Minimal client-side admin shortcut (as requested). Backend validation still exists.
    if (email === 'admin@gmail.com' && password === 'admin123') {
      alert('Admin Login successful');
      if (typeof onLogin === 'function') onLogin({ role: 'admin' });
      else onClose?.();
      return;
    }

    try {
      const res = await fetch(`${apiBaseUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.message || 'Login failed');
        return;
      }
      // If backend indicates admin, signal admin to parent without changing UI
      if (data && (data.role === 'admin' || data.redirect === '/admin/dashboard')) {
        alert('Admin Login successful');
        if (typeof onLogin === 'function') onLogin({ role: 'admin' });
        else onClose?.();
        return;
      }
      alert('Login successful');
      if (typeof onLogin === 'function') onLogin(data); // Pass user data for regular login
      else onClose?.();
    } catch (err) {
      alert('Network error');
    }
  };

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Welcome back</h2>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </label>
        <button type="submit" className="cta-primary" style={{ width: '100%' }}>Sign In</button>
        <button type="button" className="badge" onClick={onClose} style={{ width: '100%', textAlign: 'center' }}>Back</button>
      </form>
    </div>
  );
};

export default Login;


