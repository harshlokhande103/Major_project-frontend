import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiBaseUrl } from '../../config';

const MentorApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/admin/mentor-requests`, { withCredentials: true });
      // Ensure we always have an array
      setApplications(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.post(`${apiBaseUrl}/admin/mentor-requests/${id}/approve`, {}, { withCredentials: true });
      fetchApplications(); // Refresh the list
    } catch (err) {
      console.error('Error approving application:', err);
    }
  };

  const handleReject = async (id, reason) => {
    try {
      await axios.post(`${apiBaseUrl}/admin/mentor-requests/${id}/reject`, { rejectionReason: reason }, { withCredentials: true });
      fetchApplications(); // Refresh the list
    } catch (err) {
      console.error('Error rejecting application:', err);
    }
  };

  if (loading) return <div>Loading mentor applications...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="mentor-applications-container">
      <h2>Mentor Applications</h2>
      {applications.length === 0 ? (
        <p>No pending mentor applications.</p>
      ) : (
        <div className="applications-list">
          {applications.map((app, index) => (
            <div key={app.id || app._id || index} className="application-card">
              <h3>{app.firstName || app.userId?.firstName || 'Unknown'} {app.lastName || app.userId?.lastName || 'User'}</h3>
              <p>Email: {app.email || app.userId?.email || 'No email'}</p>
              <p>Bio: {app.bio || 'No bio provided'}</p>
              <p>Title: {app.title || 'No title'}</p>
              <p>Expertise: {Array.isArray(app.expertise) ? app.expertise.join(', ') : 'No expertise listed'}</p>
              {app.verificationDocuments && app.verificationDocuments.length > 0 && (
                <div>
                  <h4>Verification Documents:</h4>
                  <ul>
                    {app.verificationDocuments.map((doc, index) => (
                      <li key={index}><a href={doc} target="_blank" rel="noopener noreferrer">Document {index + 1}</a></li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="actions">
                <button onClick={() => handleApprove(app.id || app._id)}>Approve</button>
                <button onClick={() => {
                  const reason = prompt('Enter rejection reason:');
                  if (reason) handleReject(app.id || app._id, reason);
                }}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentorApplications;