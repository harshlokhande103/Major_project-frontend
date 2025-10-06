import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MentorApplicationsPanel = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const updateApplicationStatus = async (id, status) => {
    try {
      await axios.put(`/admin/mentor-applications/${id}/status`, { status });
      setApplications(prevApps =>
        prevApps.map(app => (app._id === id ? { ...app, status } : app))
      );
    } catch (err) {
      console.error('Error updating application status:', err);
      alert('Failed to update application status.');
    }
  };

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get('/admin/mentor-applications');
        setApplications(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  if (loading) {
    return <div>Loading mentor applications...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="mentor-applications-panel">
      <h2>Mentor Applications</h2>
      {applications.length === 0 ? (
        <p>No mentor applications found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>User ID</th>
              <th>Bio</th>
              <th>Experience</th>
              <th>Expertise</th>
              <th>LinkedIn</th>
              <th>GitHub</th>
              <th>Website</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map(app => (
              <tr key={app._id}>
                <td>{app._id}</td>
                <td>{app.userId}</td>
                <td>{app.bio}</td>
                <td>{app.experience}</td>
                <td>{app.expertise.join(', ')}</td>
                <td><a href={app.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></td>
                <td><a href={app.github} target="_blank" rel="noopener noreferrer">GitHub</a></td>
                <td><a href={app.website} target="_blank" rel="noopener noreferrer">Website</a></td>
                <td>{app.status}</td>
                <td>
                  {app.status === 'pending' && (
                    <>
                      <button onClick={() => updateApplicationStatus(app._id, 'approved')}>Approve</button>
                      <button onClick={() => updateApplicationStatus(app._id, 'rejected')}>Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MentorApplicationsPanel;