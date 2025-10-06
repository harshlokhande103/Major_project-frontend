import React, { useState } from 'react';
import MentorApplications from './MentorApplications';
import UsersPanel from './UsersPanel';
import SessionsPanel from './SessionsPanel';
import PaymentsPanel from './PaymentsPanel';
import FeedbackPanel from './FeedbackPanel';
import AnalyticsPanel from './AnalyticsPanel';
import LogsPanel from './LogsPanel';

const AdminDashboard = () => {
  const [tab, setTab] = useState('mentor');
  return (
    <div className="admin-dashboard-container">
      <h1>Admin Dashboard</h1>
      <div className="admin-tabs">
        <button 
          className={tab === 'mentor' ? 'active' : ''} 
          onClick={() => setTab('mentor')}
        >
          📋 Mentor Applications
        </button>
        <button 
          className={tab === 'users' ? 'active' : ''} 
          onClick={() => setTab('users')}
        >
          👥 Users
        </button>
        <button 
          className={tab === 'sessions' ? 'active' : ''} 
          onClick={() => setTab('sessions')}
        >
          📅 Sessions
        </button>
        <button 
          className={tab === 'payments' ? 'active' : ''} 
          onClick={() => setTab('payments')}
        >
          💳 Payments
        </button>
        <button 
          className={tab === 'feedback' ? 'active' : ''} 
          onClick={() => setTab('feedback')}
        >
          ⭐ Feedback
        </button>
        <button 
          className={tab === 'analytics' ? 'active' : ''} 
          onClick={() => setTab('analytics')}
        >
          📊 Analytics
        </button>
        <button 
          className={tab === 'logs' ? 'active' : ''} 
          onClick={() => setTab('logs')}
        >
          📝 Logs
        </button>
      </div>
      {tab === 'mentor' && <MentorApplications />}
      {tab === 'users' && <UsersPanel />}
      {tab === 'sessions' && <SessionsPanel />}
      {tab === 'payments' && <PaymentsPanel />}
      {tab === 'feedback' && <FeedbackPanel />}
      {tab === 'analytics' && <AnalyticsPanel />}
      {tab === 'logs' && <LogsPanel />}
    </div>
  );
};

export default AdminDashboard;