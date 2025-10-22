import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiBaseUrl } from '../../config';
import './MentorApplicationsPanel.css';

const MentorApplicationsPanel = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });

  // ✅ Fetch applications by status
  const fetchApplications = async (status = null) => {
    try {
      const url = status 
        ? `${apiBaseUrl}/admin/mentor-applications?status=${status}`
        : `${apiBaseUrl}/admin/mentor-applications`;
      
      const response = await axios.get(url, { withCredentials: true });
      setApplications(response.data || []);
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch application counts
  const fetchCounts = async () => {
    try {
      const response = await axios.get(
        `${apiBaseUrl}/admin/mentor-applications/counts`,
        { withCredentials: true }
      );
      setCounts(response.data);
    } catch (err) {
      console.error("Error fetching counts:", err);
    }
  };

  // ✅ Update status
  const updateApplicationStatus = async (id, status) => {
    try {
      await axios.put(
        `${apiBaseUrl}/admin/mentor-applications/${id}/status`,
        { status },
        { withCredentials: true }
      );

      // Refresh applications and counts
      fetchApplications(activeTab);
      fetchCounts();
    } catch (err) {
      console.error("Error updating application status:", err);
      alert("Failed to update application status.");
    }
  };

  // Filter applications based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredApplications(applications);
    } else {
      const searchLower = searchTerm.toLowerCase();
      const filtered = applications.filter(app => {
        const user = app.userId || {};
        return (
          (app.name && app.name.toLowerCase().includes(searchLower)) ||
          (user.email && user.email.toLowerCase().includes(searchLower)) ||
          (app.domain && app.domain.toLowerCase().includes(searchLower))
        );
      });
      setFilteredApplications(filtered);
    }
  }, [searchTerm, applications]);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setLoading(true);
    fetchApplications(tab);
  };

  useEffect(() => {
    fetchApplications(activeTab);
    fetchCounts();
  }, []);

  useEffect(() => {
    fetchApplications(activeTab);
  }, [activeTab]);

  // Search input handler
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Use filteredApplications for rendering
  const displayApplications = searchTerm ? filteredApplications : applications;

  // ✅ Loading & Error UI
  if (loading) {
    return (
      <div className="text-center py-10 text-indigo-600 font-medium">
        Loading mentor applications...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mentor-app-header">
        <h2 className="mentor-app-title">Mentor Applications</h2>
        <div className="mentor-app-search">
          <input
            type="text"
            placeholder="Search by name, email, or domain..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="mentor-app-search-input"
          />
          <svg className="mentor-app-search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="#64748b"/>
          </svg>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="status-tabs">
        <button 
          className={`status-tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => handleTabChange('pending')}
        >
          <span className="tab-icon">⏳</span>
          <span className="tab-label">Pending</span>
          <span className="tab-count">{counts.pending}</span>
        </button>
        <button 
          className={`status-tab ${activeTab === 'approved' ? 'active' : ''}`}
          onClick={() => handleTabChange('approved')}
        >
          <span className="tab-icon">✅</span>
          <span className="tab-label">Approved</span>
          <span className="tab-count">{counts.approved}</span>
        </button>
        <button 
          className={`status-tab ${activeTab === 'rejected' ? 'active' : ''}`}
          onClick={() => handleTabChange('rejected')}
        >
          <span className="tab-icon">❌</span>
          <span className="tab-label">Rejected</span>
          <span className="tab-count">{counts.rejected}</span>
        </button>
      </div>

      {displayApplications.length === 0 ? (
        <p className="mentor-app-no-results">
          {searchTerm ? 'No matching applications found.' : 'No mentor applications found.'}
        </p>
      ) : (
        <div className="mentor-app-table-container">
          <table className="mentor-app-table">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th>Applicant</th>
                <th>Contact</th>
                <th>Domain</th>
                <th>LinkedIn</th>
                <th>Portfolio</th>
                <th>Bio</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {displayApplications.map((app, index) => {
                const user = app.userId || {}; // in case populated from backend

                return (
                  <tr
                    key={app._id}
                    className={`hover:bg-indigo-50 transition ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                  >
                    {/* Applicant */}
                    <td>
                      <div className="mentor-app-applicant">
                        <div className="mentor-app-applicant-name">
                          {app.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "—"}
                        </div>
                        <div className="mentor-app-applicant-email">
                          {user.email || "—"}
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-3">
                      {app.phoneNumber || "—"}
                    </td>

                    {/* Domain */}
                    <td className="px-5 py-3">{app.domain || "—"}</td>

                    {/* LinkedIn */}
                    <td className="px-5 py-3">
                      {app.linkedin ? (
                        <a
                          href={app.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline"
                        >
                          View
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* Portfolio */}
                    <td className="px-5 py-3">
                      {app.portfolio ? (
                        <a
                          href={app.portfolio}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline"
                        >
                          View
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* Bio */}
                    <td className="px-5 py-3 max-w-xs truncate">
                      {app.bio || "—"}
                    </td>

                    {/* Status */}
                    <td>
                      <span
                        className={`status ${app.status === "approved" ? "approved" : app.status === "rejected" ? "rejected" : "pending"}`}
                      >
                        {app.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      {app.status === "pending" ? (
                        <div className="mentor-app-actions">
                          <button
                            className="mentor-app-btn approve"
                            style={{ minWidth: '90px', marginRight: '8px' }}
                            onClick={() => updateApplicationStatus(app._id, "approved")}
                          >
                            Approve
                          </button>
                          <button
                            className="mentor-app-btn reject"
                            style={{ minWidth: '90px', marginLeft: '8px' }}
                            onClick={() => updateApplicationStatus(app._id, "rejected")}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="status-display">
                          <span className={`status-badge ${app.status}`}>
                            {app.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MentorApplicationsPanel;
