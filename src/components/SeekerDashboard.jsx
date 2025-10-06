import React, { useState } from 'react';

const SeekerDashboard = ({ onClose, user, onSwitchToCreator }) => {
  const [active, setActive] = useState('home');
  const [showDropdown, setShowDropdown] = useState(false);

  const email = user?.email || 'user@example.com';
  const displayName = user?.firstName ? `${user?.firstName}${user?.lastName ? ' ' + user?.lastName : ''}` : email;
  const initials = (user?.firstName || email || 'U').slice(0,1).toUpperCase() + (user?.lastName ? user?.lastName.slice(0,1).toUpperCase() : '');

  const handleSwitchToCreator = () => {
    setShowDropdown(false);
    if (onSwitchToCreator) {
      onSwitchToCreator();
    }
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (e) => {
    if (!e.target.closest('.seeker-role-container')) {
      setShowDropdown(false);
    }
  };

  // Add event listener for clicking outside
  React.useEffect(() => {
    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdown]);

  const mentors = [
    {
      id: 1,
      name: 'Rahul Kumar',
      experience: '10+ years · Career Coach',
      rating: 4.9,
      reviews: 128,
      expertise: ['Career Guidance', 'Interview Prep', 'Resume Review'],
      image: 'https://xsgames.co/randomusers/assets/avatars/male/12.jpg',
    },
    {
      id: 2,
      name: 'Priya Sharma',
      experience: '8 years · Leadership Mentor',
      rating: 4.8,
      reviews: 96,
      expertise: ['Leadership', 'Communication', 'Presentation'],
      image: 'https://xsgames.co/randomusers/assets/avatars/female/18.jpg',
    },
    {
      id: 3,
      name: 'Amit Patel',
      experience: '7 years · Tech Advisor',
      rating: 4.7,
      reviews: 152,
      expertise: ['System Design', 'DSA', 'Career Switch'],
      image: 'https://xsgames.co/randomusers/assets/avatars/male/28.jpg',
    },
    {
      id: 4,
      name: 'Neha Verma',
      experience: '9 years · Product Strategist',
      rating: 4.9,
      reviews: 141,
      expertise: ['Product Management', 'Roadmaps', 'Case Interviews'],
      image: 'https://xsgames.co/randomusers/assets/avatars/female/7.jpg',
    },
    {
      id: 5,
      name: 'Suresh Iyer',
      experience: '12 years · Data Science Mentor',
      rating: 4.8,
      reviews: 88,
      expertise: ['Machine Learning', 'Analytics', 'Python'],
      image: 'https://xsgames.co/randomusers/assets/avatars/male/36.jpg',
    },
  ];

  return (
    <div className="seeker-shell">
      <aside className="seeker-sidebar">
        <div className="seeker-account">
          <div className="seeker-email">{email}</div>
          <div className="seeker-role-container">
            <button 
              className="seeker-role-btn" 
              onClick={() => setShowDropdown(!showDropdown)}
            >
              Seeker Dashboard ▾
            </button>
            {showDropdown && (
              <div className="seeker-dropdown">
                <button 
                  className="dropdown-item"
                  onClick={handleSwitchToCreator}
                >
                  <span className="dropdown-icon">👨‍💼</span>
                  Creator Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="seeker-logo">topmate</div>
        <nav className="seeker-nav">
          {[
            { id: 'home', label: 'Home', icon: '🏠' },
            { id: 'bookings', label: 'Bookings', icon: '📅' },
            { id: 'find', label: 'Find People', icon: '🔎' },
            { id: 'profile', label: 'Profile', icon: '👤' },
            { id: 'rewards', label: 'Rewards', icon: '🎁' },
            { id: 'category', label: 'Find by Category', icon: '🗂️' },
            { id: 'news', label: "What's New", icon: '🔔' },
          ].map(item => (
            <button
              key={item.id}
              className={`seeker-link ${active === item.id ? 'active' : ''}`}
              onClick={() => setActive(item.id)}
            >
              <span className="nav-icn">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="seeker-main">
        <header className="seeker-header">
          <h1>{active === 'home' ? 'Home' : active[0].toUpperCase() + active.slice(1)}</h1>
          <div className="seeker-user">
              <span className="seeker-user-name">{displayName}</span>
              <div className="seeker-avatar">{initials}</div>
            </div>
            {user?.title && <p className="seeker-user-title">Title: {user?.title}</p>}
            {user?.bio && <p className="seeker-user-bio">Bio: {user?.bio}</p>}
            {user?.expertise && Array.isArray(user?.expertise) && user?.expertise.length > 0 && (
              <div className="seeker-expertise">
                <h4>My Expertise:</h4>
                <div className="expertise-tags">
                  {user?.expertise?.map((exp, index) => (
                    <span key={index} className="expertise-tag">{exp}</span>
                  ))}
                </div>
              </div>
            )}
        </header>

        {active === 'home' && (
          <section className="seeker-home">
            <h2 className="seeker-title">Next in Your Career Journey</h2>
            <p className="seeker-subtitle">Set a goal that moves you forward — from finding clarity to acing your next opportunity</p>

            <div className="seeker-cards">
              <div className="seeker-card">
                <div className="card-header">
                  <span className="tag">Interested ▾</span>
                  <div className="card-icon">🗺️</div>
                </div>
                <div className="card-body">
                  <h3>Not sure what direction to take?</h3>
                  <button className="seeker-cta">Book a career exploration session</button>
                </div>
              </div>

              <div className="seeker-card">
                <div className="card-header">
                  <div className="card-icon">🪜</div>
                  <span className="tag">Interested ▾</span>
                </div>
                <div className="card-body">
                  <h3>Need help creating a strong first resume?</h3>
                  <button className="seeker-cta">Resume review for freshers</button>
                </div>
              </div>

              <div className="seeker-card">
                <div className="card-header">
                  <span className="tag">Interested ▾</span>
                  <div className="card-icon">✈️</div>
                </div>
                <div className="card-body">
                  <h3>Applied to a few jobs but no response?</h3>
                  <button className="seeker-cta">Get application strategy help</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {active === 'find' && (
          <section className="seeker-find">
            <h2 className="find-mentors-title">Find Mentors</h2>
            <div className="seeker-mentor-grid">
              {mentors.map(m => (
                <div key={m.id} className="mentor-card-new">
                  <div className="mentor-card-header">
                    <img className="mentor-avatar" src={m.image} alt={m.name} />
                    <div className="mentor-basic-info">
                      <h3 className="mentor-name-new">{m.name}</h3>
                      <p className="mentor-role">{m.experience}</p>
                    </div>
                  </div>
                  <div className="mentor-card-body">
                    <div className="mentor-rating-new">
                      <span className="star">⭐</span>
                      <span className="rating-value">{m.rating}</span>
                      <span className="rating-count-new">({m.reviews})</span>
                    </div>
                    <div className="mentor-expertise">
                      {m.expertise.map((tag, i) => (
                        <span key={i} className="expertise-tag">{tag}</span>
                      ))}
                    </div>
                    <div className="mentor-actions-new">
                      <button className="view-profile-btn">View Profile</button>
                      <button className="book-session-btn">Book Session</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {active === 'profile' && (
          <section className="seeker-profile">
            <div className="profile-container">
              <div className="profile-header">
                <div className="profile-avatar-section">
                  <div className="profile-avatar-large">
                    {user?.profileImage ? (
                      <img src={user?.profileImage} alt={displayName} />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>
                  <button className="change-photo-btn">Change Photo</button>
                </div>
                <div className="profile-info">
                  <h2 className="profile-name">{displayName}</h2>
                  <p className="profile-email">{email}</p>
                  <div className="profile-stats">
                    <div className="stat-item">
                      <span className="stat-number">12</span>
                      <span className="stat-label">Sessions Booked</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">8</span>
                      <span className="stat-label">Completed</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">4.8</span>
                      <span className="stat-label">Avg Rating</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="profile-sections">
                <div className="profile-section">
                  <h3 className="section-title">Personal Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Full Name</label>
                      <p>{displayName}</p>
                    </div>
                    <div className="info-item">
                      <label>Email</label>
                      <p>{email}</p>
                    </div>
                    <div className="info-item">
                      <label>Phone</label>
                      <p>{user?.phone || '+91 98765 43210'}</p>
                    </div>
                    <div className="info-item">
                      <label>Location</label>
                      <p>{user?.location || 'Mumbai, India'}</p>
                    </div>
                  </div>
                </div>

                <div className="profile-section">
                  <h3 className="section-title">Career Goals</h3>
                  <div className="goals-container">
                    <div className="goal-item">
                      <span className="goal-icon">🎯</span>
                      <div className="goal-content">
                        <h4>Primary Goal</h4>
                        <p>{user?.primaryGoal || 'Land a software engineering role at a top tech company'}</p>
                      </div>
                    </div>
                    <div className="goal-item">
                      <span className="goal-icon">📈</span>
                      <div className="goal-content">
                        <h4>Target Role</h4>
                        <p>{user?.targetRole || 'Full Stack Developer'}</p>
                      </div>
                    </div>
                    <div className="goal-item">
                      <span className="goal-icon">💰</span>
                      <div className="goal-content">
                        <h4>Expected Salary</h4>
                        <p>{user?.expectedSalary || '₹8-12 LPA'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="profile-section">
                  <h3 className="section-title">Skills & Interests</h3>
                  <div className="skills-container">
                    {user?.skills || ['JavaScript', 'React', 'Node.js', 'Python', 'Data Structures', 'System Design'].map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>

                <div className="profile-section">
                  <h3 className="section-title">Recent Activity</h3>
                  <div className="activity-list">
                    <div className="activity-item">
                      <div className="activity-icon">📅</div>
                      <div className="activity-content">
                        <p>Booked session with Rahul Kumar</p>
                        <span className="activity-time">2 days ago</span>
                      </div>
                    </div>
                    <div className="activity-item">
                      <div className="activity-icon">✅</div>
                      <div className="activity-content">
                        <p>Completed interview prep session</p>
                        <span className="activity-time">1 week ago</span>
                      </div>
                    </div>
                    <div className="activity-item">
                      <div className="activity-icon">⭐</div>
                      <div className="activity-content">
                        <p>Rated Priya Sharma 5 stars</p>
                        <span className="activity-time">2 weeks ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="profile-actions">
                <button className="edit-profile-btn">Edit Profile</button>
                <button className="download-resume-btn">Download Resume</button>
                <button className="share-profile-btn">Share Profile</button>
              </div>
            </div>
          </section>
        )}
      </main>

      <button className="seeker-close" onClick={onClose}>×</button>
    </div>
  );
};

export default SeekerDashboard;


