import React, { useState } from 'react';
import { apiBaseUrl } from '../config';

const Register = ({ onClose, onRegister }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [title, setTitle] = useState('');
  const [expertise, setExpertise] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [field, setField] = useState('');

  const fieldOptions = [
    'Technical',
    'Medical',
    'Marketing',
    'Finance',
    'Education',
    'Design',
    'Sales',
    'Human Resources',
    'Operations',
    'Legal',
    'Consulting',
    'Other'
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      setProfileImage(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    (async () => {
      try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('firstName', firstName);
        formData.append('lastName', lastName);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('bio', bio);
        formData.append('title', title);
        formData.append('field', field);
        formData.append('expertise', expertise.split(',').map(item => item.trim()).join(','));
        
        if (profileImage) {
          formData.append('profileImage', profileImage);
        }

        const res = await fetch(`${apiBaseUrl}/api/register`, {
          method: 'POST',
          body: formData,
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
          Field
          <select
            value={field}
            onChange={(e) => setField(e.target.value)}
            required
          >
            <option value="">Select your field</option>
            {fieldOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
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
          Profile Photo
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ 
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 'white'
            }}
          />
          {profileImage && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
              Selected: {profileImage.name}
            </div>
          )}
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


