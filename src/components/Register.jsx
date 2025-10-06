import React, { useState } from 'react';

const Register = ({ onClose, onRegister }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [title, setTitle] = useState('');
  const [expertise, setExpertise] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    (async () => {
      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstName, lastName, email, password, bio, title, expertise: expertise.split(',').map(item => item.trim()) }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (res.status === 409) {
            alert(data.message || 'Email already registered');
          } else {
            alert(data.message || 'Registration failed');
          }
          return;
        }
        alert('Registration successful');
        if (typeof onRegister === 'function') onRegister(data);
        else onClose?.();
      } catch (err) {
        alert('Network error');
      }
    })();
  };

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Create your account</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <label>
            First name
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              required
            />
          </label>
          <label>
            Last name
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              required
            />
          </label>
        </div>
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
        <label>
          Bio
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself..."
          />
        </label>
        <label>
          Title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Software Engineer, Marketing Manager"
          />
        </label>
        <label>
          Expertise
          <input
            type="text"
            value={expertise}
            onChange={(e) => setExpertise(e.target.value)}
            placeholder="e.g., React, Node.js, Digital Marketing"
          />
        </label>
        <button type="submit" className="cta-primary" style={{ width: '100%' }}>Create Account</button>
        <button type="button" className="badge" onClick={onClose} style={{ width: '100%', textAlign: 'center' }}>Back</button>
      </form>
    </div>
  );
};

export default Register;


