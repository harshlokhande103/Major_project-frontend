import React, { useState } from 'react';
import { apiBaseUrl } from '../config';

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

  const [mentors, setMentors] = React.useState([]);
  const [loadingMentors, setLoadingMentors] = React.useState(true);
  const [mentorError, setMentorError] = React.useState(null);

  const [bookings, setBookings] = React.useState([]);
  const [loadingBookings, setLoadingBookings] = React.useState(false);
  const [bookingError, setBookingError] = React.useState(null);

  React.useEffect(() => {
    setLoadingMentors(true);
    setMentorError(null);
    fetch(`${apiBaseUrl}/api/mentors`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch mentors');
        return res.json();
      })
      .then(data => {
        // Filter out current user (by id or email) so mentors list doesn't include self
        const currentUserId = String(user?.id || user?._id || '');
        const currentUserEmail = (user?.email || '').toLowerCase();

        const filtered = (Array.isArray(data) ? data : []).filter(m => {
          const mid = String(m._id || m.id || '');
          const mEmail = (m.email || '').toLowerCase();
          if (currentUserId && mid && mid === currentUserId) return false;
          if (currentUserEmail && mEmail && mEmail === currentUserEmail) return false;
          return true;
        });

        // Map backend fields to frontend card fields
        const mapped = filtered.map(m => ({
          id: m._id,
          name: `${m.name || m.firstName || 'Mentor'}${m.lastName ? ' ' + m.lastName : ''}`,
          experience: m.domain || m.title || 'Mentor',
          rating: m.rating || 4.8,
          reviews: m.reviews || 0,
          expertise: m.expertise || (m.bio ? [m.bio] : []),
          image: m.profileImage ? `${apiBaseUrl}${m.profileImage}` : 'https://via.placeholder.com/320x160',
        }));
        setMentors(mapped);
        setLoadingMentors(false);
      })
      .catch(err => {
        setMentorError(err.message);
        setLoadingMentors(false);
      });
  }, [user]);

  // Fetch bookings when bookings tab is active
  React.useEffect(() => {
    if (active === 'bookings') {
      setLoadingBookings(true);
      setBookingError(null);
      fetch(`${apiBaseUrl}/api/bookings`, { credentials: 'include' })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch bookings');
          return res.json();
        })
        .then(data => {
          setBookings(Array.isArray(data) ? data : []);
          setLoadingBookings(false);
        })
        .catch(err => {
          setBookingError(err.message);
          setLoadingBookings(false);
        });
    }
  }, [active]);

  // Open mentor public profile page
  const openMentorProfile = (mentorId) => {
    if (!mentorId) return;
    // update URL and notify App's popstate listener
    window.history.pushState({}, '', `/mentors/${mentorId}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

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
              {user?.profileImage ? (
                <img 
                  src={`${apiBaseUrl}${user?.profileImage}`} 
                  alt="Profile"
                  className="seeker-avatar"
                  style={{ borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div className="seeker-avatar">{initials}</div>
              )}
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
              {loadingMentors ? (
                <div>Loading mentors...</div>
              ) : mentorError ? (
                <div style={{color:'red'}}>Failed to load mentors: {mentorError}</div>
              ) : mentors.length === 0 ? (
                <div>No mentors found.</div>
              ) : mentors.map(m => (
                <div key={m.id} className="mentor-card-new">
                  <div className="mentor-card-header">
                    {m.image && m.image !== 'https://via.placeholder.com/320x160' ? (
                      <img 
                        className="mentor-avatar" 
                        src={m.image} 
                        alt={m.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="mentor-avatar" style={{
                        background: 'var(--lavender)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        fontWeight: 'bold'
                      }}>
                        {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                    )}
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
                      {Array.isArray(m.expertise) && m.expertise.length > 0 ? (
                        m.expertise.map((tag, i) => (
                          <span key={i} className="expertise-tag">{tag}</span>
                        ))
                      ) : (
                        <span className="expertise-tag">No expertise listed</span>
                      )}
                    </div>
                    <div className="mentor-actions-new">
                      <button className="view-profile-btn" onClick={() => openMentorProfile(m.id)}>View Profile</button>
                      <button className="book-session-btn">Book Session</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {active === 'bookings' && (
          <section className="seeker-bookings">
            <h2 className="bookings-title">My Bookings</h2>
            {loadingBookings ? (
              <div>Loading bookings...</div>
            ) : bookingError ? (
              <div style={{color:'red'}}>Failed to load bookings: {bookingError}</div>
            ) : bookings.length === 0 ? (
              <div style={{ padding: 24, background: '#fff', borderRadius: 12, textAlign: 'center', color: '#6b7280' }}>
                <h3 style={{ marginTop: 0 }}>No bookings yet</h3>
                <p>You haven't booked any sessions yet. Browse mentors to get started!</p>
              </div>
            ) : (
              <div className="bookings-list">
                {bookings.map(booking => (
                  <div key={booking._id} className="booking-card">
                    <div className="booking-header">
                      <div className="mentor-info">
                        {booking.mentorId?.profileImage ? (
                          <img 
                            src={`${apiBaseUrl}${booking.mentorId.profileImage}`} 
                            alt={booking.mentorId.firstName} 
                            className="mentor-avatar-small"
                          />
                        ) : (
                          <div className="mentor-avatar-small">
                            {(booking.mentorId?.firstName || 'M')[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h3>{booking.mentorId?.firstName} {booking.mentorId?.lastName}</h3>
                          <p>{booking.mentorId?.title || 'Mentor'}</p>
                        </div>
                      </div>
                      <div className={`booking-status ${booking.status}`}>
                        {booking.status}
                      </div>
                    </div>
                    <div className="booking-details">
                      <div className="booking-time">
                        <span className="icon">📅</span>
                        <span>{new Date(booking.slotId?.start).toLocaleString()}</span>
                      </div>
                      <div className="booking-duration">
                        <span className="icon">⏱️</span>
                        <span>{booking.slotId?.durationMinutes || 45} minutes</span>
                      </div>
                      {booking.slotId?.price > 0 && (
                        <div className="booking-price">
                          <span className="icon">💰</span>
                          <span>₹{booking.slotId.price}</span>
                        </div>
                      )}
                      {booking.notes && (
                        <div className="booking-notes">
                          <span className="icon">📝</span>
                          <span>{booking.notes}</span>
                        </div>
                      )}
                    </div>
                    <div className="booking-actions">
                      {booking.status === 'confirmed' && (
                        <>
                          <button className="join-session-btn">Join Session</button>
                          <button className="reschedule-btn">Reschedule</button>
                          <button className="cancel-btn">Cancel</button>
                        </>
                      )}
                      {booking.status === 'completed' && (
                        <>
                          <button className="view-notes-btn">View Notes</button>
                          <button className="rate-session-btn">Rate Session</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {active === 'profile' && (
          <section className="seeker-profile">
            <div className="profile-container">
              <div className="profile-header">
                <div className="profile-avatar-section">
                  <div className="profile-avatar-large">
                    {user?.profileImage ? (
                      <img src={`${apiBaseUrl}${user?.profileImage}`} alt={displayName} />
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
                      <span className="stat-number">{bookings.length}</span>
                      <span className="stat-label">Sessions Booked</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">{bookings.filter(b => b.status === 'completed').length}</span>
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
                    {bookings.slice(0, 3).map(booking => (
                      <div key={booking._id} className="activity-item">
                        <div className="activity-icon">📅</div>
                        <div className="activity-content">
                          <p>Booked session with {booking.mentorId?.firstName} {booking.mentorId?.lastName}</p>
                          <span className="activity-time">{new Date(booking.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                    {bookings.filter(b => b.status === 'completed').slice(0, 3).map(booking => (
                      <div key={`completed-${booking._id}`} className="activity-item">
                        <div className="activity-icon">✅</div>
                        <div className="activity-content">
                          <p>Completed session with {booking.mentorId?.firstName} {booking.mentorId?.lastName}</p>
                          <span className="activity-time">{new Date(booking.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                    {bookings.length === 0 && (
                      <>
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
                      </>
                    )}
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


