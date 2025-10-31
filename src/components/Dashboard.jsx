import React, { useState, useEffect } from 'react';
import { apiBaseUrl } from '../config';

const Dashboard = ({ onClose, user, onSwitchDashboard, onOpenVerify }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [animateStats, setAnimateStats] = useState(false);
  const [sessionFilter, setSessionFilter] = useState('upcoming');
  const [mentorStatus, setMentorStatus] = useState(null);
  const [realNotifications, setRealNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [fullName, setFullName] = useState(user?.firstName && user?.lastName ? `${user?.firstName} ${user?.lastName}` : '');
  const [professionalTitle, setProfessionalTitle] = useState(user?.title || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [expertiseTags, setExpertiseTags] = useState(Array.isArray(user?.expertise) ? user?.expertise : []);
  const [newExpertiseTag, setNewExpertiseTag] = useState('');
  
  const displayName = user?.firstName ? `${user?.firstName}${user?.lastName ? ' ' + user?.lastName : ''}` : (user?.email || 'User');
  const initials = (user?.firstName || user?.email || 'U').slice(0,1).toUpperCase() + (user?.lastName ? user?.lastName.slice(0,1).toUpperCase() : '');

  // Slots state
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotError, setSlotError] = useState(null);

  // Bookings state for mentor dashboard
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState(null);

  // Booking action states
  const [confirmingBooking, setConfirmingBooking] = useState(null);
  const [bookingActionError, setBookingActionError] = useState(null);

  // form state for new slot (replace single datetime-local state)
  const [newSlotDate, setNewSlotDate] = useState('');         // yyyy-mm-dd
  const [newSlotTime, setNewSlotTime] = useState('09:00');    // hh:mm (12-hour shown with AM/PM)
  const [newSlotAmPm, setNewSlotAmPm] = useState('AM');       // 'AM' | 'PM'
  const [newSlotDuration, setNewSlotDuration] = useState(45);
  const [newSlotPrice, setNewSlotPrice] = useState('');
  const [newSlotLabel, setNewSlotLabel] = useState('');
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [editingSlotValues, setEditingSlotValues] = useState({
    date: '',
    time: '09:00',
    ampm: 'AM',
    durationMinutes: 45,
    price: '',
    label: ''
  });

  // helper: build ISO string from date (yyyy-mm-dd), time (hh:mm) and AM/PM
  const buildIsoFromParts = (dateStr, timeStr, ampm) => {
    if (!dateStr || !timeStr) return null;
    // timeStr expected "hh:mm" in 12-hour input; convert to 24-hour
    let [hh, mm] = timeStr.split(':').map(Number);
    if (ampm === 'PM' && hh < 12) hh = hh + 12;
    if (ampm === 'AM' && hh === 12) hh = 0;
    // construct a Date in local timezone
    const [yyyy, mmD, dd] = dateStr.split('-').map(Number);
    const dt = new Date(yyyy, mmD - 1, dd, hh, mm, 0, 0);
    return dt.toISOString();
  };

  // helper to parse session.time strings like "Today, 3:00 PM", "Tomorrow, 11:00 AM", "23 Oct, 2:00 PM"
  const parseSessionTime = (timeStr = '') => {
    if (!timeStr) return { dayLabel: '', smallTime: '', ampm: '', fullTime: '' };
    const parts = timeStr.split(',').map(p => p.trim());
    const dayLabel = parts[0] || '';
    const timePart = parts.slice(1).join(', ') || '';
    const match = timePart.match(/(\d{1,2}:\d{2})(?:\s*(AM|PM|am|pm))?/i);
    const smallTime = match ? match[1] : (timePart || '');
    const ampm = match && match[2] ? match[2].toUpperCase() : '';
    return { dayLabel, smallTime, ampm, fullTime: timePart };
  };

  // format a Date into parts used by sessions UI (local timezone)
  const formatSessionParts = (dt) => {
    if (!dt || isNaN(+dt)) return { month: '', day: '', time: '' };
    const month = dt.toLocaleString('en-US', { month: 'short' });
    const day = String(dt.getDate());
    const time = dt.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' });
    return { month, day, time };
  };

  // Fetch mentor status and notifications
  const fetchMentorStatus = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/mentor-status`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setMentorStatus(data);
      }
    } catch (error) {
      console.error('Error fetching mentor status:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/notifications`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setRealNotifications(data);
        setUnreadCount(data.filter(n => !n.isRead).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await fetch(`${apiBaseUrl}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        credentials: 'include'
      });
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${apiBaseUrl}/api/notifications/read-all`, {
        method: 'PUT',
        credentials: 'include'
      });
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const fetchSlots = async () => {
    try {
      setSlotsLoading(true);
      setSlotError(null);
      const res = await fetch(`${apiBaseUrl}/api/slots`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch slots');
      const data = await res.json();
      setSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setSlotError('Could not load slots');
    } finally {
      setSlotsLoading(false);
    }
  };

  const fetchMentorBookings = async () => {
    try {
      setBookingsLoading(true);
      setBookingsError(null);
      const res = await fetch(`${apiBaseUrl}/api/mentor/bookings`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setBookingsError('Could not load bookings');
    } finally {
      setBookingsLoading(false);
    }
  };

  // adapted add slot handler using the parts
  const handleAddSlot = async (e) => {
    e.preventDefault();
    try {
      const startIso = buildIsoFromParts(newSlotDate, newSlotTime, newSlotAmPm);
      if (!startIso) throw new Error('Please provide date and time');

      const payload = {
        start: startIso,
        durationMinutes: Number(newSlotDuration),
        price: newSlotPrice ? Number(newSlotPrice) : 0,
        label: newSlotLabel || ''
      };
      const res = await fetch(`${apiBaseUrl}/api/slots`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(()=>({message:'Error'}));
        throw new Error(err.message || 'Failed to create slot');
      }
      setNewSlotDate('');
      setNewSlotTime('09:00');
      setNewSlotAmPm('AM');
      setNewSlotDuration(45);
      setNewSlotPrice('');
      setNewSlotLabel('');
      fetchSlots();
      alert('Slot created');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to create slot');
    }
  };

  const handleDeleteSlot = async (id) => {
    if (!confirm('Delete this slot?')) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/slots/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to delete slot');
      fetchSlots();
    } catch (err) {
      console.error(err);
      alert('Unable to delete slot');
    }
  };

  // start editing: fill editingSlotValues with separate date/time/ampm
  const startEditing = (slot) => {
    const d = slot.start ? new Date(slot.start) : null;
    const toLocalDate = (dt) => {
      if (!dt) return '';
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const day = String(dt.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    const toLocalTimeAmPm = (dt) => {
      if (!dt) return { time: '09:00', ampm: 'AM' };
      let h = dt.getHours(); // 0-23
      const min = String(dt.getMinutes()).padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      if (h === 0) h = 12;
      else if (h > 12) h = h - 12;
      const time = String(h).padStart(2, '0') + ':' + min;
      return { time, ampm };
    };

    const localDate = toLocalDate(d);
    const { time, ampm } = toLocalTimeAmPm(d);
    setEditingSlotId(slot._id);
    setEditingSlotValues({
      date: localDate,
      time,
      ampm,
      durationMinutes: slot.durationMinutes || (slot.end ? Math.round((new Date(slot.end)-new Date(slot.start))/60000) : 45),
      price: slot.price || '',
      label: slot.label || ''
    });
  };

  const handleUpdateSlot = async (id) => {
    try {
      const startIso = buildIsoFromParts(editingSlotValues.date, editingSlotValues.time, editingSlotValues.ampm);
      if (!startIso) throw new Error('Please provide date and time');
      const payload = {
        start: startIso,
        durationMinutes: Number(editingSlotValues.durationMinutes),
        price: editingSlotValues.price ? Number(editingSlotValues.price) : 0,
        label: editingSlotValues.label || ''
      };
      const res = await fetch(`${apiBaseUrl}/api/slots/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(()=>({message:'Error'}));
        throw new Error(err.message || 'Failed to update slot');
      }
      setEditingSlotId(null);
      setEditingSlotValues({ date: '', time: '09:00', ampm: 'AM', durationMinutes: 45, price: '', label: '' });
      fetchSlots();
      alert('Slot updated');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to update slot');
    }
  };

  // Mock data
  const stats = {
    totalSessions: 24,
    upcomingSessions: 3,
    totalEarnings: '₹12,500',
    profileViews: 152,
    conversionRate: '68%'
  };

  const handleProfileMenuToggle = () => {
    setShowProfileMenu(prev => !prev);
  };

  const handleSwitchDashboard = (type) => {
    if (onSwitchDashboard) {
      onSwitchDashboard(type);
    } else {
      // Fallback: just log for now if no handler provided
      // eslint-disable-next-line no-console
      console.log(`Switch to ${type} dashboard requested`);
    }
    setShowProfileMenu(false);
  };


  const handleAddExpertise = (e) => {
    if (e.key === 'Enter' && newExpertiseTag.trim() !== '') {
      e.preventDefault();
      setExpertiseTags([...expertiseTags, newExpertiseTag.trim()]);
      setNewExpertiseTag('');
    }
  };

  const handleRemoveExpertise = (tagToRemove) => {
    setExpertiseTags(expertiseTags.filter(tag => tag !== tagToRemove));
  };

  const handleSaveChanges = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          id: user?.id,
          firstName: fullName.split(' ')[0],
          lastName: fullName.split(' ').slice(1).join(' '),
          title: professionalTitle,
          bio: bio,
          expertise: expertiseTags,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedUser = await response.json();
      // Assuming onLogin is passed down from App.jsx to update the user state
      // This is a placeholder, you might need to adjust how user state is updated in App.jsx
      if (onSwitchDashboard) { // Re-using onSwitchDashboard to trigger a user state update in App.jsx
        onSwitchDashboard('dashboard', updatedUser); // Pass updatedUser back to App.jsx
      }
      alert('Profile changes saved successfully!');
    } catch (error) {
      console.error('Error saving profile changes:', error);
      alert('Failed to save profile changes.');
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout endpoint to clear server session
      await fetch(`${apiBaseUrl}/api/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state and redirect
      localStorage.removeItem('user');
      window.location.href = '/';
    }
  };

  // open verify page via parent
  const openVerify = () => {
    if (onOpenVerify) onOpenVerify();
  };

  // Handle confirming a booking by adding meeting link
  const handleConfirmBooking = async (bookingId) => {
    const meetingLink = prompt('Enter the meeting link for this session:');
    if (!meetingLink || !meetingLink.trim()) return;

    setConfirmingBooking(bookingId);
    setBookingActionError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/api/bookings/${bookingId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingLink: meetingLink.trim() })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to confirm booking' }));
        throw new Error(err.message || 'Failed to confirm booking');
      }
      fetchMentorBookings(); // Refresh bookings
      alert('Booking confirmed successfully!');
    } catch (err) {
      console.error(err);
      setBookingActionError(err.message);
      alert(err.message || 'Failed to confirm booking');
    } finally {
      setConfirmingBooking(null);
    }
  };

  useEffect(() => {
    // Trigger stats animation after component mounts
    setTimeout(() => setAnimateStats(true), 300);

    // Fetch mentor status and notifications on component mount
    fetchMentorStatus();
    fetchNotifications();
    fetchSlots();
    fetchMentorBookings();

    // Set up polling for notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const renderTabContent = () => {
    switch(activeTab) {
      case 'home':
        return (
          <>
            <div className="welcome-banner">
              <div className="welcome-text">
                <h2>Welcome back, {displayName}!</h2>
                <p>Signed in as {user?.email || '—'}</p>
                <p>Here's what's happening with your mentoring business today.</p>
                {user?.title && <p className="user-title">Title: {user?.title}</p>}
                {user?.bio && <p className="user-bio">Bio: {user?.bio}</p>}
              </div>
              <div className="quick-actions">
                <button className="action-btn primary">Create Service</button>
                <button className="action-btn secondary">Share Profile</button>
                {mentorStatus?.status !== 'approved' && (
                  <button 
                    className="action-btn verify" 
                    onClick={openVerify}
                  >
                    ✅ Verify Profile
                  </button>
                )}
                {mentorStatus?.status === 'approved' && (
                  <div className="mentor-approved-badge">
                    🎉 Mentor Verified!
                  </div>
                )}
              </div>
            </div>
            
            <div className="stats-container">
              {user?.expertise && Array.isArray(user?.expertise) && user?.expertise.length > 0 && (
                <div className="stat-card full-width">
                  <h3>My Expertise</h3>
                  <div className="expertise-tags">
                    {user?.expertise?.map((exp, index) => (
                      <span key={index} className="expertise-tag">{exp}</span>
                    ))}
                  </div>
                </div>
              )}


              <div className="stat-card">
                <h3>Total Sessions</h3>
                <p className="stat-value">{stats.totalSessions}</p>
                <span className="stat-trend positive">↑ 12% from last month</span>
              </div>
              <div className="stat-card">
                <h3>Upcoming Sessions</h3>
                <p className="stat-value">{stats.upcomingSessions}</p>
                <span className="stat-trend">Next: Today at 3:00 PM</span>
              </div>
              <div className="stat-card">
                <h3>Total Earnings</h3>
                <p className="stat-value">{stats.totalEarnings}</p>
                <span className="stat-trend positive">↑ 8% from last month</span>
              </div>
              <div className="stat-card">
                <h3>Profile Views</h3>
                <p className="stat-value">{stats.profileViews}</p>
                <span className="stat-trend positive">↑ 24% from last month</span>
              </div>
            </div>
            
            <div className="dashboard-sections">
              <div className="section upcoming-sessions">
                <div className="section-header">
                  <h2>Upcoming Sessions</h2>
                  <button className="view-all-btn">View All</button>
                </div>
                <div className="session-list">
                  {slots && slots.length > 0 ? (
                    slots.map(s => (
                      <div className="session-card" key={s._id}>
                        <div className="session-info">
                          <div className="session-status-indicator" data-status="available"></div>
                          <h3>{s.label || 'Available slot'}</h3>
                          <p style={{ margin: 0, color: '#4b5563' }}>Time: {new Date(s.start).toLocaleString()}</p>
                          <p className="session-time" style={{ marginTop: 6 }}>{s.durationMinutes ? `${s.durationMinutes} min` : ''} {s.price ? ` • ₹${s.price}` : ' • Free'}</p>
                        </div>
                        <div className="session-actions">
                          <button className="join-btn">Book</button>
                          <button className="reschedule-btn" onClick={() => startEditing(s)}>Edit</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: 16, color:'#6b7280' }}>
                      No upcoming sessions. Create slots below to allow bookings.
                    </div>
                  )}
                </div>
              </div>
              
              <div className="section performance">
                <div className="section-header">
                  <h2>Performance</h2>
                </div>
                <div className="performance-metrics">
                  <div className="metric-card">
                    <div className="metric-icon">👁</div>
                    <div className="metric-details">
                      <h3>Profile Views</h3>
                      <p>{stats.profileViews} views this month</p>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon">💹</div>
                    <div className="metric-details">
                      <h3>Conversion Rate</h3>
                      <p>{stats.conversionRate} booking rate</p>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon">⭐</div>
                    <div className="metric-details">
                      <h3>Rating</h3>
                      <p>4.9/5 from 18 reviews</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      case 'sessions':
        const getSessionsToDisplay = () => {
          const now = new Date();
          return bookings.filter(booking => {
            const slotStart = new Date(booking.slotId.start);
            if (sessionFilter === 'upcoming') {
              return slotStart > now && booking.status !== 'cancelled';
            } else if (sessionFilter === 'past') {
              return slotStart < now || booking.status === 'completed';
            } else if (sessionFilter === 'cancelled') {
              return booking.status === 'cancelled';
            }
            return true;
          });
        };

        return (
          <div className="sessions-tab">
            <h2>Manage Your Sessions</h2>
            <div className="sessions-filter">
              <button
                className={`filter-btn ${sessionFilter === 'upcoming' ? 'active' : ''}`}
                onClick={() => setSessionFilter('upcoming')}
              >
                Upcoming
              </button>
              <button
                className={`filter-btn ${sessionFilter === 'past' ? 'active' : ''}`}
                onClick={() => setSessionFilter('past')}
              >
                Past
              </button>
              <button
                className={`filter-btn ${sessionFilter === 'cancelled' ? 'active' : ''}`}
                onClick={() => setSessionFilter('cancelled')}
              >
                Cancelled
              </button>
            </div>

            <div className="sessions-manage-slots" style={{ marginBottom: 16, padding: 12, background: '#fff', borderRadius: 8 }}>
              <h3 style={{ marginTop: 0 }}>Manage Available Slots</h3>
              <form onSubmit={handleAddSlot} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <label style={{ display:'flex', flexDirection:'column', fontSize:12 }}>
                  Date
                  <input type="date" required value={newSlotDate} onChange={(e)=>setNewSlotDate(e.target.value)} />
                </label>

                <label style={{ display:'flex', flexDirection:'column', fontSize:12 }}>
                  Time
                  <input type="time" required value={newSlotTime} onChange={(e)=>setNewSlotTime(e.target.value)} />
                </label>

                <label style={{ display:'flex', flexDirection:'column', fontSize:12 }}>
                  AM/PM
                  <select value={newSlotAmPm} onChange={(e)=>setNewSlotAmPm(e.target.value)}>
                    <option>AM</option>
                    <option>PM</option>
                  </select>
                </label>

                <label style={{ display:'flex', flexDirection:'column', fontSize:12 }}>
                  Duration (min)
                  <input type="number" min="1" required value={newSlotDuration} onChange={(e)=>setNewSlotDuration(e.target.value)} style={{ width:100 }} />
                </label>
                <label style={{ display:'flex', flexDirection:'column', fontSize:12 }}>
                  Price
                  <input type="number" min="0" value={newSlotPrice} onChange={(e)=>setNewSlotPrice(e.target.value)} style={{ width:100 }} />
                </label>
                <label style={{ display:'flex', flexDirection:'column', fontSize:12 }}>
                  Label
                  <input type="text" value={newSlotLabel} onChange={(e)=>setNewSlotLabel(e.target.value)} />
                </label>
                <div style={{ display:'flex', gap:8 }}>
                  <button type="submit" className="cta-primary" style={{ height: 40 }}>Add Slot</button>
                </div>
              </form>

              <div style={{ marginTop:12 }}>
                {slotsLoading ? <div>Loading slots...</div> : slotError ? <div style={{ color:'red' }}>{slotError}</div> : (
                  <div style={{ display:'grid', gap:8 }}>
                    {slots.length === 0 && <div style={{ color:'#6b7280' }}>No slots created yet.</div>}
                    {slots.map(s => (
                      <div key={s._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:8, background:'#f8fafc', borderRadius:8 }}>
                        <div>
                          <div style={{ fontWeight:700 }}>{new Date(s.start).toLocaleString()}</div>
                          <div style={{ color:'#6b7280' }}>{(s.durationMinutes ? `${s.durationMinutes} min` : (s.end ? `${Math.round((new Date(s.end)-new Date(s.start))/60000)} min` : '—'))} • {s.price ? `₹${s.price}` : 'Free'}</div>
                          {s.label && <div style={{ color:'#374151' }}>{s.label}</div>}
                        </div>

                        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                          {editingSlotId === s._id ? (
                            <>
                              <input type="date" value={editingSlotValues.date} onChange={(e)=>setEditingSlotValues(v=>({...v, date: e.target.value}))} />
                              <input type="time" value={editingSlotValues.time} onChange={(e)=>setEditingSlotValues(v=>({...v, time: e.target.value}))} />
                              <select value={editingSlotValues.ampm} onChange={(e)=>setEditingSlotValues(v=>({...v, ampm: e.target.value}))}>
                                <option>AM</option>
                                <option>PM</option>
                              </select>
                              <input type="number" style={{ width:80 }} value={editingSlotValues.durationMinutes} onChange={(e)=>setEditingSlotValues(v=>({...v, durationMinutes: e.target.value}))} />
                              <button onClick={()=>handleUpdateSlot(s._id)} style={{ padding:'6px 10px' }}>Save</button>
                              <button onClick={()=>{ setEditingSlotId(null); setEditingSlotValues({ date:'', time:'09:00', ampm:'AM', durationMinutes:45, price:'', label:'' }); }} style={{ padding:'6px 10px' }}>Cancel</button>
                            </>
                          ) : (

                            <>

                              <button onClick={()=>startEditing(s)} style={{ padding:'6px 10px' }}>Edit</button>
                              <button onClick={()=>handleDeleteSlot(s._id)} style={{ padding:'6px 10px', background:'#fee2e2', border:'none' }}>Delete</button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="session-list">
              {bookingsLoading ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>Loading bookings...</div>
              ) : bookingsError ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'red' }}>{bookingsError}</div>
              ) : getSessionsToDisplay().length === 0 ? (
                <div style={{ padding: 24, background: '#fff', borderRadius: 12, textAlign: 'center', color: '#6b7280' }}>
                  <h3 style={{ marginTop: 0 }}>No sessions yet</h3>
                  <p>You don't have any {sessionFilter} sessions. Create slots above so learners can book with you.</p>
                </div>
              ) : (
                getSessionsToDisplay().map(booking => {
                  const slot = booking.slotId;
                  const user = booking.userId;
                  const slotStart = new Date(slot.start);
                  const { month, day, time } = formatSessionParts(slotStart);
                  return (
                    <div
                      className="session-card detailed"
                      key={booking._id}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="session-date-badge">
                        <div className="date-month">{month}</div>
                        <div className="date-day">{day}</div>
                      </div>
                      <div className="session-info" style={{ marginLeft: 12, flex:1 }}>
                        <h3 style={{ margin:'6px 0' }}>{slot.label || 'Session'}</h3>
                        <p style={{ margin:'0 0 6px 0', color:'#4b5563' }}>Client: {user.firstName} {user.lastName}</p>
                        <p style={{ margin:'0 0 6px 0', color:'#1d4ed8', fontWeight:600 }}>Time: {time}</p>
                        {booking.meetingLink && (
                          <p style={{ margin:'0 0 6px 0', color:'#059669' }}>
                            Meeting Link: <a href={booking.meetingLink} target="_blank" rel="noopener noreferrer">{booking.meetingLink}</a>
                          </p>
                        )}
                        <div className="session-tags" style={{ display:'flex', gap:8, marginTop:8 }}>
                          <span className={`tag ${booking.status}`} style={{ background: booking.status === 'confirmed' ? '#ecfdf5' : booking.status === 'completed' ? '#f0f9ff' : '#fee2e2', color: booking.status === 'confirmed' ? '#047857' : booking.status === 'completed' ? '#0369a1' : '#dc2626', padding:'6px 10px', borderRadius:12, fontWeight:600, fontSize:12 }}>
                            {booking.status}
                          </span>
                          <span className="tag" style={{ background:'#ecfdfb', color:'#0369a1', padding:'6px 10px', borderRadius:12, fontWeight:600 }}>{`${slot.durationMinutes || 45} min`}</span>
                          {booking.notes && <span className="tag reason" style={{ background:'#f3f4f6', color:'#374151' }}>{booking.notes}</span>}
                        </div>
                      </div>
                      <div className="session-actions vertical" style={{ marginLeft: 12 }}>
                        {sessionFilter === 'upcoming' && (
                          <>
                            {!booking.meetingLink && (
                              <button
                                className="join-btn"
                                onClick={() => handleConfirmBooking(booking._id)}
                                disabled={confirmingBooking === booking._id}
                              >
                                {confirmingBooking === booking._id ? 'Confirming...' : 'Confirm'}
                              </button>
                            )}
                            {booking.meetingLink && (
                              <button className="join-btn" onClick={() => window.open(booking.meetingLink, '_blank')}>
                                Join Session
                              </button>
                            )}
                            <button className="cancel-btn">Cancel</button>
                          </>
                        )}
                        {sessionFilter === 'past' && (
                          <>
                            <button className="view-notes-btn">View Notes</button>
                            <button className="feedback-btn">Feedback</button>
                          </>
                        )}
                        {sessionFilter === 'cancelled' && (
                          <button className="reschedule-btn">Reschedule</button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      case 'earnings':
        return (
          <div className="earnings-tab">
            <h2>Your Earnings</h2>
            <div className="earnings-summary">
              <div className="summary-card">
                <h3>Total Earnings</h3>
                <p className="amount">₹12,500</p>
              </div>
              <div className="summary-card">
                <h3>This Month</h3>
                <p className="amount">₹4,200</p>
              </div>
            </div>
            
            <div className="earnings-chart">
              <h3>Monthly Earnings</h3>
              <div className="chart-placeholder">
                {/* In a real app, you would use a chart library like Chart.js or Recharts */}
                <div className="mock-chart">
                  <div className="chart-bar" style={{height: '60%'}}><span>Jun</span></div>
                  <div className="chart-bar" style={{height: '75%'}}><span>Jul</span></div>
                  <div className="chart-bar" style={{height: '45%'}}><span>Aug</span></div>
                  <div className="chart-bar" style={{height: '90%'}}><span>Sep</span></div>
                  <div className="chart-bar" style={{height: '65%'}}><span>Oct</span></div>
                </div>
              </div>
            </div>
            
            <div className="transactions">
              <h3>Recent Transactions</h3>
              <div className="transaction-list">
                <div className="transaction-item">
                  <div className="transaction-info">
                    <h4>Resume Review Session</h4>
                    <p>Oct 15, 2023</p>
                  </div>
                  <div className="transaction-amount positive">+₹1,500</div>
                </div>
                <div className="transaction-item">
                  <div className="transaction-info">
                    <h4>Career Guidance Session</h4>
                    <p>Oct 12, 2023</p>
                  </div>
                  <div className="transaction-amount positive">+₹2,000</div>
                </div>
                <div className="transaction-item">
                  <div className="transaction-info">
                    <h4>Platform Fee</h4>
                    <p>Oct 12, 2023</p>
                  </div>
                  <div className="transaction-amount negative">-₹200</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="settings-tab">
            <h2>Account Settings</h2>
            
            <div className="settings-section">
              <h3>Profile Information</h3>
              <div className="profile-edit">
                <div className="profile-image">
                  {user?.profileImage ? (
                    <img 
                      src={`${apiBaseUrl}${user?.profileImage}`} 
                      alt="Profile"
                      className="avatar-large"
                      style={{ borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="avatar-large">{initials}</div>
                  )}
                  <button className="change-avatar-btn">Change Photo</button>
                </div>
                
                <div className="profile-form">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Professional Title</label>
                    <input type="text" value={professionalTitle} onChange={(e) => setProfessionalTitle(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Bio</label>
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)}></textarea>
                  </div>
                  <div className="form-group">
                    <label>Expertise</label>
                    <div className="tags-input">
                      {expertiseTags.map((tag, index) => (
                        <span key={index} className="tag">
                          {tag}
                          <button type="button" onClick={() => handleRemoveExpertise(tag)}>×</button>
                        </span>
                      ))}
                      <input
                        type="text"
                        placeholder="Add expertise..."
                        value={newExpertiseTag}
                        onChange={(e) => setNewExpertiseTag(e.target.value)}
                        onKeyDown={handleAddExpertise}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <button className="cta-primary" onClick={handleSaveChanges} style={{ marginTop: '1.5rem' }}>Save Changes</button>
            </div>
            
            <div className="settings-section">
              <h3>Services & Pricing</h3>
              <div className="services-list">
                <div className="service-item">
                  <div className="service-info">
                    <h4>1:1 Career Consultation</h4>
                    <p>45 minutes • ₹2,000</p>
                  </div>
                  <div className="service-actions">
                    <button className="edit-btn">Edit</button>
                    <button className="delete-btn">Delete</button>
                  </div>
                </div>
                <div className="service-item">
                  <div className="service-info">
                    <h4>Resume Review & Feedback</h4>
                    <p>30 minutes • ₹1,500</p>
                  </div>
                  <div className="service-actions">
                    <button className="edit-btn">Edit</button>
                    <button className="delete-btn">Delete</button>
                  </div>
                </div>
                <button className="add-service-btn">+ Add New Service</button>
              </div>
            </div>
            
            <div className="settings-section">
              <h3>Availability</h3>
              <div className="availability-settings">
                <div className="weekday-selector">
                  <button className="day-btn active">Mon</button>
                  <button className="day-btn active">Tue</button>
                  <button className="day-btn active">Wed</button>
                  <button className="day-btn active">Thu</button>
                  <button className="day-btn active">Fri</button>
                  <button className="day-btn">Sat</button>
                  <button className="day-btn">Sun</button>
                </div>
                <div className="time-slots">
                  <div className="time-slot">
                    <span>10:00 AM - 12:00 PM</span>
                    <button className="remove-slot">×</button>
                  </div>
                  <div className="time-slot">
                    <span>2:00 PM - 5:00 PM</span>
                    <button className="remove-slot">×</button>
                  </div>
                  <button className="add-slot-btn">+ Add Time Slot</button>
                </div>
              </div>
            </div>
            
            <button className="save-settings-btn">Save Changes</button>
          </div>
        );
      case 'profile':
        return (
          <div className="profile-tab">
            <h2>My Profile</h2>
            <div className="profile-preview">
              <div className="profile-header">
                {user?.profileImage ? (
                  <img 
                    src={`${apiBaseUrl}${user?.profileImage}?${Date.now()}`} 
                    alt="Profile"
                    className="profile-avatar"
                    onError={(e) => {
                      console.error('Profile image failed to load:', `${apiBaseUrl}${user?.profileImage}`);
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log('Profile image loaded successfully:', `${apiBaseUrl}${user?.profileImage}`);
                    }}
                  />
                ) : (
                  <div className="profile-avatar">{initials || 'U'}</div>
                )}
                <div className="profile-title">
                  <h3>{displayName}</h3>
                  <p>{user?.email || '—'}</p>
                </div>
              </div>
              {user?.title && (
                <div className="profile-title-display">
                  <h3>Title</h3>
                  <p>{user?.title}</p>
                </div>
              )}
              {user?.bio && (
                <div className="profile-bio">
                  <h3>About Me</h3>
                  <p>{user?.bio}</p>
                </div>
              )}
              {user?.expertise && Array.isArray(user?.expertise) && user?.expertise.length > 0 && (
                <div className="profile-expertise">
                  <h3>Areas of Expertise</h3>
                  <div className="expertise-tags">
                    {user?.expertise?.map((exp, index) => (
                      <span key={index} className="expertise-tag">{exp}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="profile-actions">
                <button className="edit-profile-btn" onClick={() => setActiveTab('settings')}>Edit Profile</button>
                <button className="view-public-btn">View Public Profile</button>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Select a tab</div>;
    }
  };
  
  return (
    <div className="dashboard-container">
      <style jsx>{`
        .mentor-approved-badge {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }
        
        .no-notifications {
          padding: 20px;
          text-align: center;
          color: #6b7280;
          font-style: italic;
        }
        
        .notification-item.unread {
          background-color: #f0f9ff;
          border-left: 3px solid #3b82f6;
        }
        
        .notification-item {
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .notification-item:hover {
          background-color: #f9fafb;
        }
      `}</style>
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>Clarity Call</h2>
        </div>
        <div className="sidebar-menu">
          <div 
            className={`menu-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <span className="menu-icon">🏠</span>
            <span>Home</span>
          </div>
          <div 
            className={`menu-item ${activeTab === 'sessions' ? 'active' : ''}`}
            onClick={() => setActiveTab('sessions')}
          >
            <span className="menu-icon">📅</span>
            <span>Sessions</span>
          </div>
          <div 
            className={`menu-item ${activeTab === 'earnings' ? 'active' : ''}`}
            onClick={() => setActiveTab('earnings')}
          >
            <span className="menu-icon">💰</span>
            <span>Earnings</span>
          </div>
          <div 
            className={`menu-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <span className="menu-icon">⚙</span>
            <span>Settings</span>
          </div>
          {/* Analytics module removed as requested */}
          <div 
            className={`menu-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span className="menu-icon">👤</span>
            <span>My Profile</span>
          </div>
        </div>
      </div>
      
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <div className="header-actions">
            <div className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
              🔔
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              {showNotifications && (
                <div className="notifications-dropdown">
                  <h3>Notifications</h3>
                  <div className="notifications-list">
                    {realNotifications.length > 0 ? (
                      realNotifications.map(notification => (
                        <div 
                          key={notification._id} 
                          className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                          onClick={() => markNotificationAsRead(notification._id)}
                        >
                          <p><strong>{notification.title}</strong></p>
                          <p>{notification.message}</p>
                          <span className="notification-time">
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="no-notifications">No notifications yet</div>
                    )}
                  </div>
                  {realNotifications.length > 0 && (
                    <button className="mark-all-read" onClick={markAllAsRead}>
                      Mark all as read
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="user-profile" onClick={handleProfileMenuToggle} style={{ position: 'relative', cursor: 'pointer' }}>
              <span className="user-name">{displayName}</span>
              {user?.profileImage ? (
                <img 
                  src={`${apiBaseUrl}${user?.profileImage}`} 
                  alt="Profile"
                  className="user-avatar"
                  style={{ borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div className="user-avatar">{initials || 'U'}</div>
              )}
              {showProfileMenu && (
                <div className="profile-dropdown" style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', minWidth: '200px', zIndex: 20 }}>
                  <button className="dropdown-item" onClick={() => handleSwitchDashboard('seeker')} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: 'transparent', border: 'none' }}>Seeker Dashboard</button>
                  <button className="dropdown-item" onClick={() => handleSwitchDashboard('creator')} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: 'transparent', border: 'none' }}>Creator Dashboard</button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="dashboard-content">
          {renderTabContent()}
        </div>
      </div>
      
      <button className="close-btn" onClick={onClose}>×</button>

    </div>
  );
};

export default Dashboard;