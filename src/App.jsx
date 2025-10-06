import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import MentorCard from './components/MentorCard'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import SeekerDashboard from './components/SeekerDashboard'
import AdminDashboard from './components/admin/AdminDashboard'
import MentorApplicationsPanel from './components/admin/MentorApplicationsPanel'
import './App.css'

function App() {
  const initialView = (() => {
    const path = window.location.pathname || '/'
    if (path.startsWith('/admin/mentor-applications')) return 'adminMentorApplications'
    if (path.startsWith('/admin')) return 'admin'
    if (path.startsWith('/dashboard')) return 'dashboard'
    return 'home'
  })()
  const [view, setView] = useState(initialView);
  const [user, setUser] = useState(null);
  const mentors = [
    {
      name: "Rahul Kumar",
      role: "Career Coach",
      company: "Google",
      imageUrl: "https://xsgames.co/randomusers/assets/avatars/male/1.jpg"
    },
    {
      name: "Priya Sharma",
      role: "Leadership Mentor",
      company: "Microsoft",
      imageUrl: "https://xsgames.co/randomusers/assets/avatars/female/1.jpg"
    },
    {
      name: "Amit Patel",
      role: "Tech Advisor",
      company: "Amazon",
      imageUrl: "https://xsgames.co/randomusers/assets/avatars/male/2.jpg"
    },
    {
      name: "Neha Verma",
      role: "Product Strategist",
      company: "Meta",
      imageUrl: "https://xsgames.co/randomusers/assets/avatars/female/2.jpg"
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
    setView('dashboard');
  };

  // Keep URL in sync with view (minimal routing)
  useEffect(() => {
    if (view === 'adminMentorApplications') {
      window.history.pushState({}, '', '/admin/mentor-applications');
    } else if (view === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else if (view === 'dashboard') {
      window.history.pushState({}, '', '/dashboard');
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
    setView('dashboard');
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
      {view === 'adminMentorApplications' && (
        <MentorApplicationsPanel />
      )}
      {view === 'home' && (
      <main className="hero">
        <section className="hero-left">
          <h1>
            <span className="muted">Your Gateway to</span><br />
            <span className="emph">Expert Mentorship</span>
          </h1>
          <p>
            & Professional Mentorship for your career and business.
          </p>
          <div className="cta-row">
            <button className="cta-primary" onClick={openLogin}>Get Started →</button>
            <div className="badge">100k+ <span className="stars">★★★★★</span> reviews</div>
            
          </div>
        </section>
        <aside className="hero-right">
          <div className="mentor-scroller">
            <div className="mentor-track">
              {mentors.map((mentor, index) => (
                <MentorCard
                  key={`a-${index}`}
                  name={mentor.name}
                  role={mentor.role}
                  company={mentor.company}
                  imageUrl={mentor.imageUrl}
                />
              ))}
              {mentors.map((mentor, index) => (
                <MentorCard
                  key={`b-${index}`}
                  name={mentor.name}
                  role={mentor.role}
                  company={mentor.company}
                  imageUrl={mentor.imageUrl}
                />
              ))}
            </div>
          </div>
          <div className="mentor-scroller">
            <div className="mentor-track reverse">
              {mentors.map((mentor, index) => (
                <MentorCard
                  key={`c-${index}`}
                  name={mentor.name}
                  role={mentor.role}
                  company={mentor.company}
                  imageUrl={mentor.imageUrl}
                />
              ))}
              {mentors.map((mentor, index) => (
                <MentorCard
                  key={`d-${index}`}
                  name={mentor.name}
                  role={mentor.role}
                  company={mentor.company}
                  imageUrl={mentor.imageUrl}
                />
              ))}
            </div>
          </div>
        </aside>
      </main>
      )}
    </div>
  )
}

export default App
