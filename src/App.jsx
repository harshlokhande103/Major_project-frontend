import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import SeekerDashboard from './components/SeekerDashboard'
import AdminDashboard from './components/admin/AdminDashboard'
import VerifyMentor from './components/VerifyMentor'
import MentorApplicationsPanel from './components/admin/MentorApplicationsPanel'
import MentorProfile from './components/MentorProfile'
import ChatPage from './components/ChatPage'
import { apiBaseUrl } from './config'
import './App.css'

function App() {
  const initialView = (() => {
    const path = window.location.pathname || '/'
    if (path.startsWith('/verify')) return 'verify'
    if (path.startsWith('/admin/mentor-applications')) return 'adminMentorApplications'
    if (path.startsWith('/admin')) return 'admin'
    if (path.startsWith('/dashboard')) return 'dashboard'
    if (path.startsWith('/seeker-dashboard')) return 'seekerDashboard'
    if (path.startsWith('/login')) return 'login'
    if (path.startsWith('/register')) return 'register'
    if (path.startsWith('/mentors/')) return 'mentorProfile'
    if (path.startsWith('/chat')) return 'chat'
    return 'home'
  })()
  const [view, setView] = useState(initialView);
  const [user, setUser] = useState(null);
  
  // Check for existing session on page load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/profile`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsLoggedIn(true);
          // Do not override current view; preserve the page on refresh.
          // If user is not admin but on an admin route, send to home.
          const path = window.location.pathname;
          if (userData.role !== 'admin' && path.startsWith('/admin')) {
            setView('home');
          }
        } else {
          // No valid session - only redirect if on protected pages
          const path = window.location.pathname;
          if (path.startsWith('/dashboard') || path.startsWith('/admin') || path.startsWith('/verify')) {
            setView('home');
          }
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        // Only redirect if on protected pages
        const path = window.location.pathname;
        if (path.startsWith('/dashboard') || path.startsWith('/admin') || path.startsWith('/verify')) {
          setView('home');
        }
        setIsLoggedIn(false);
      }
    };
    
    checkSession();
  }, []);
  const platformHighlights = [
    {
      title: "Verified Mentor Profiles",
      description: "Only approved mentors can host sessions and create availability slots.",
      imageUrl: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=700&q=80"
    },
    {
      title: "Live Chat + Video Calls",
      description: "Move from booking to real conversation with built-in chat and instant video rooms.",
      imageUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=700&q=80"
    },
    {
      title: "Session Workflow",
      description: "Confirm, complete, or cancel sessions with notifications for all participants.",
      imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=700&q=80"
    },
    {
      title: "Smart Notifications",
      description: "Instant updates for booking confirmations, cancellations, and completed sessions.",
      imageUrl: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=700&q=80"
    }
  ];

  const roleTracks = [
    {
      role: "For Seekers",
      points: ["Discover approved mentors", "Book slots quickly", "Chat and join video calls"],
      imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
    },
    {
      role: "For Mentors",
      points: ["Get profile verified", "Create paid availability slots", "Manage upcoming sessions"],
      imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
    }
  ];
  const openLogin = () => setView('login');
  const openRegister = () => setView('register');
  const openDashboard = () => {
    console.log('Opening dashboard');
    setView('dashboard');
  };
  const backHome = () => setView('home');
  
  // Track if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Update login handler to set logged in state
  const handleLogin = (loggedInUser) => {
    setIsLoggedIn(true);
    // If admin, route to admin dashboard without altering UI design
    if ((typeof loggedInUser === 'string' && loggedInUser === 'admin') || (loggedInUser && loggedInUser.role === 'admin')) {
      setUser({ role: 'admin' });
      setView('admin');
      return;
    }
    // Ensure expertise is an array for normal users
    if (loggedInUser && typeof loggedInUser.expertise === 'string') {
      loggedInUser.expertise = loggedInUser.expertise.split(',').map(item => item.trim());
    }
    setUser(loggedInUser);
    setView('seekerDashboard'); // Start with SeekerDashboard
  };

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/admin/mentor-applications')) {
        setView('adminMentorApplications');
      } else if (path.startsWith('/admin')) {
        setView('admin');
      } else if (path.startsWith('/dashboard')) {
        setView('dashboard');
      } else if (path.startsWith('/seeker-dashboard')) {
        setView('seekerDashboard');
      } else if (path.startsWith('/verify')) {
        setView('verify');
      } else if (path.startsWith('/login')) {
        setView('login');
      } else if (path.startsWith('/register')) {
        setView('register');
      } else if (path.startsWith('/mentors/')) {
        setView('mentorProfile');
      } else if (path.startsWith('/chat')) {
        setView('chat');
      } else if (path.startsWith('/')) {
        setView('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Keep URL in sync with view (minimal routing)
  useEffect(() => {
    if (view === 'adminMentorApplications') {
      window.history.pushState({}, '', '/admin/mentor-applications');
    } else if (view === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else if (view === 'dashboard') {
      window.history.pushState({}, '', '/dashboard');
    } else if (view === 'seekerDashboard') {
      window.history.pushState({}, '', '/seeker-dashboard');
    } else if (view === 'verify') {
      window.history.pushState({}, '', '/verify');
    } else if (view === 'login') {
      window.history.pushState({}, '', '/login');
    } else if (view === 'register') {
      window.history.pushState({}, '', '/register');
    } else if (view === 'home') {
      window.history.pushState({}, '', '/');
    }
  }, [view])
  
  // Update register handler to set logged in state
  const handleRegister = (registeredUser) => {
    setIsLoggedIn(true);
    // Ensure expertise is an array
    if (registeredUser && typeof registeredUser.expertise === 'string') {
      registeredUser.expertise = registeredUser.expertise.split(',').map(item => item.trim());
    }
    setUser(registeredUser);
    setView('seekerDashboard'); // Start with SeekerDashboard
  };
  
  return (
    <div className="app-container">
      <Navbar 
        onSignIn={openLogin} 
        onRegister={openRegister} 
        onDashboard={openDashboard}
        isLoggedIn={isLoggedIn} 
      />
      {view === 'login' && <Login onClose={backHome} onLogin={handleLogin} />}
      {view === 'register' && <Register onClose={backHome} onRegister={handleRegister} />}
      {view === 'dashboard' && user && (
        <Dashboard 
          onClose={backHome} 
          user={user} 
          onOpenVerify={() => setView('verify')}
          onSwitchDashboard={(dashboardType, updatedUser = null) => {
            setView(dashboardType === 'seeker' ? 'seekerDashboard' : 'dashboard');
            if (updatedUser) {
              setUser(updatedUser);
            }
          }} 
        />
      )}
      {view === 'seekerDashboard' && (
        <SeekerDashboard 
          onClose={backHome} 
          user={user} 
          onSwitchToCreator={() => setView('dashboard')} 
        />
      )}
      {view === 'admin' && (
        <AdminDashboard />
      )}
      {view === 'verify' && (
          <VerifyMentor onSuccess={() => setView('dashboard')} email={user?.email || ''} name={user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : (user?.firstName || '')} />
        )}
      {view === 'adminMentorApplications' && (
        <MentorApplicationsPanel />
      )}
      {view === 'mentorProfile' && (
        <MentorProfile onBack={() => setView('seekerDashboard')} />
      )}
      {view === 'chat' && (
        <ChatPage user={user} />
      )}
      {view === 'home' && (
      <div className="landing-page">
        <main className="hero">
          <section className="hero-left">
            <h1>
              <span className="muted">Your Gateway to</span><br />
              <span className="emph">Expert Mentorship</span>
            </h1>
            <p>
              Career and business mentorship with verified experts, structured sessions, and real outcomes.
            </p>
            <div className="cta-row">
              <button className="cta-primary" onClick={openLogin}>Get Started</button>
              <button className="cta-secondary-landing" onClick={openRegister}>Create Account</button>
              <div className="badge">Trusted by learners and mentors</div>
            </div>
            <div className="hero-mini-stats">
              <div><strong>24x7</strong><span>Platform Access</span></div>
              <div><strong>1:1</strong><span>Personal Sessions</span></div>
              <div><strong>Secure</strong><span>Role Based Access</span></div>
            </div>
          </section>
          <aside className="hero-right">
            <div className="hero-visual">
              <img
                className="hero-visual-image"
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80"
                alt="Professional mentorship discussion"
              />
              <div className="hero-visual-badge top-left">Verified Mentors</div>
              <div className="hero-visual-badge bottom-right">Live Sessions + Video Calls</div>
              <div className="hero-visual-overlay">
                <h3>1:1 Career Mentorship</h3>
                <p>Book, chat, and grow with trusted professionals.</p>
              </div>
            </div>
          </aside>
        </main>

        <section id="features" className="landing-section">
          <div className="landing-headline">
            <h2>Why Clarity Call Works</h2>
            <p>Everything needed for reliable mentor-mentee sessions in one platform.</p>
          </div>
          <div className="feature-grid">
            {platformHighlights.map((item, index) => (
              <article key={index} className="feature-card">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="feature-image"
                  onError={(e) => {
                    e.currentTarget.src = 'https://picsum.photos/seed/clarity-feature/700/400';
                  }}
                />
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="mentors" className="landing-section role-section">
          <div className="landing-headline">
            <h2>Built For Every Role</h2>
            <p>From first booking to completed session tracking.</p>
          </div>
          <div className="role-grid">
            {roleTracks.map((track, index) => (
              <article key={index} className="role-card">
                <img src={track.imageUrl} alt={track.role} className="role-image" />
                <h3>{track.role}</h3>
                <ul>
                  {track.points.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section id="pricing" className="landing-section pricing-section">
          <div className="landing-headline">
            <h2>Simple Usage Model</h2>
            <p>Start free, pay per value delivered.</p>
          </div>
          <div className="pricing-grid">
            <article className="pricing-card">
              <img src="https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=700&q=80" alt="Learner plan" className="pricing-image" />
              <h3>Learner Plan</h3>
              <p className="price-tag">Free to Join</p>
              <p>Book sessions with approved mentors based on your goals.</p>
            </article>
            <article className="pricing-card featured">
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=700&q=80" alt="Mentor plan" className="pricing-image" />
              <h3>Mentor Plan</h3>
              <p className="price-tag">Set Your Price</p>
              <p>Create paid slots, manage clients, and run sessions with chat + video calls.</p>
            </article>
            <article className="pricing-card">
              <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=700&q=80" alt="Growth mode" className="pricing-image" />
              <h3>Growth Mode</h3>
              <p className="price-tag">Scale Confidently</p>
              <p>Build long-term mentor-mentee relationships through repeat sessions and clear outcomes.</p>
            </article>
          </div>
        </section>

        <section className="landing-final-cta">
          <h2>Ready to start your mentorship journey?</h2>
          <p>Join as a seeker or mentor and begin with verified, structured sessions.</p>
          <div className="cta-row">
            <button className="cta-primary" onClick={openLogin}>Sign In</button>
            <button className="cta-secondary-landing" onClick={openRegister}>Register Now</button>
          </div>
        </section>
      </div>
      )}
    </div>
  )
}

export default App


