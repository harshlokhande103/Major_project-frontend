import React from 'react';

const Navbar = ({ onSignIn, onRegister, onDashboard, isLoggedIn }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <nav className="navbar">
      <div className="logo">
        <img src="/logo-removebg-preview.png" alt="Clarity Call Logo" className="logo-img" />
        <span className="logo-text">CLARITY CALL</span>
      </div>
      <button className="mobile-toggle" aria-label="Toggle menu" onClick={() => setOpen(!open)}>☰</button>
      <div className={`nav-links ${open ? 'open' : ''}`} onClick={() => setOpen(false)}>
        <a href="#features">Features</a>
        <a href="#mentors">Mentors</a>
        <a href="#pricing">Pricing</a>
        {!isLoggedIn ? (
          <>
            <button className="sign-in" onClick={onSignIn}>Sign In</button>
            <button className="register" onClick={onRegister}>Register</button>
            <button className="start-mentoring">Start Mentoring</button>
          </>
        ) : (
          <button className="dashboard-btn" onClick={onDashboard}>Dashboard</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;