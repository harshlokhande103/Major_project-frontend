import React, { useState } from 'react';
import './VerifyMentor.css';
import { apiBaseUrl } from '../config';

const VerifyMentor = ({ onSuccess, email, name }) => {
  const [form, setForm] = useState({
    email: email || '',
    name: name || '',
    phoneNumber: '',
    bio: '',
    domain: '',
    linkedin: '',
    portfolio: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      // Only send backend-expected fields
      const { phoneNumber, bio, domain, linkedin, portfolio } = form;
      const payload = { phoneNumber, bio, domain, linkedin, portfolio, name: form.name };
      const res = await fetch(`${apiBaseUrl}/api/mentor-applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (onSuccess) onSuccess();
      alert('Verification submitted!');
      window.history.pushState({}, '', '/dashboard');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Failed to submit verification.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="verify-root">
      <div className="verify-container">
        <div className="mb-8">
          <button onClick={() => window.history.back()} className="verify-back">
            <span>←</span>
            <span>Back</span>
          </button>
        </div>
        <div className="verify-grid">
          <div className="verify-info">
            <div className="verify-pill">🌟 Become a Mentor</div>
            <h2 className="verify-title">Mentor Verification</h2>
            <p className="verify-desc">Please provide your details to apply as a mentor. This helps us maintain a high-quality network of experts.</p>
            <ul className="verify-list">
              <li><span className="icon">✅</span><span>Showcase your expertise and background</span></li>
              <li><span className="icon">✅</span><span>Get approved to start hosting paid sessions</span></li>
              <li><span className="icon">✅</span><span>Profile badge after approval</span></li>
            </ul>
          </div>
          <div className="verify-card">
            <div className="bar"></div>
            <form onSubmit={handleSubmit} className="verify-form">
              <div className="verify-group">
                <label className="verify-label">Email</label>
                <div className="verify-input-wrap">
                  <span className="verify-icon">📧</span>
                  <input className="verify-input" type="email" value={form.email} readOnly required placeholder="Your email" autoComplete="email" />
                </div>
              </div>
              <div className="verify-group">
                <label className="verify-label">Full Name</label>
                <div className="verify-input-wrap">
                  <span className="verify-icon">👤</span>
                  <input className="verify-input" type="text" value={form.name} readOnly required placeholder="Your name" autoComplete="name" />
                </div>
              </div>
              <div className="verify-row">
                <div className="verify-group">
                  <label className="verify-label">Phone Number</label>
                  <div className="verify-input-wrap">
                    <span className="verify-icon">📞</span>
                    <input className="verify-input" type="tel" value={form.phoneNumber} onChange={(e) => updateField('phoneNumber', e.target.value)} required placeholder="e.g. +91 9876543210" autoComplete="tel" inputMode="tel" />
                  </div>
                </div>
                <div className="verify-group">
                  <label className="verify-label">Domain</label>
                  <div className="verify-input-wrap">
                    <span className="verify-icon">🏷️</span>
                    <input className="verify-input" type="text" value={form.domain} onChange={(e) => updateField('domain', e.target.value)} required placeholder="e.g. Data Science, Product" />
                  </div>
                </div>
              </div>
              <div className="verify-row">
                <div className="verify-group">
                  <label className="verify-label">LinkedIn Profile</label>
                  <div className="verify-input-wrap">
                    <span className="verify-icon">🔗</span>
                    <input className="verify-input" type="url" value={form.linkedin} onChange={(e) => updateField('linkedin', e.target.value)} placeholder="https://linkedin.com/in/username" autoComplete="url" />
                  </div>
                </div>
                <div className="verify-group">
                  <label className="verify-label">Portfolio</label>
                  <div className="verify-input-wrap">
                    <span className="verify-icon">🌐</span>
                    <input className="verify-input" type="url" value={form.portfolio} onChange={(e) => updateField('portfolio', e.target.value)} placeholder="https://your-portfolio.com" autoComplete="url" />
                  </div>
                </div>
              </div>
              <div className="verify-group">
                <label className="verify-label">Bio</label>
                <textarea className="verify-textarea" value={form.bio} onChange={(e) => updateField('bio', e.target.value)} rows={5} placeholder="Tell us about your experience" />
              </div>
              <div className="verify-actions">
                <button type="button" onClick={() => window.history.back()} className="btn btn-outline">Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? 'Submitting...' : 'Submit'}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyMentor;
