import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiBaseUrl } from '../../config';
import './UsersPanel.css';

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
};

const UsersPanel = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${apiBaseUrl}/api/admin/users`,
        { withCredentials: true }
      );
      const data = response?.data;
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Update user status (block/unblock)
  const updateUserStatus = async (id, isBlocked) => {
    try {
      await axios.put(
        `${apiBaseUrl}/api/admin/users/${id}/status`,
        { isBlocked },
        { withCredentials: true }
      );

      // Update UI
      setUsers(prev => 
        prev.map(user => 
          user._id === id ? { ...user, isBlocked } : user
        )
      );
    } catch (err) {
      console.error("Error updating user status:", err);
      alert("Failed to update user status.");
    }
  };

  // Delete user
  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      await axios.delete(
        `${apiBaseUrl}/api/admin/users/${id}`,
        { withCredentials: true }
      );

      // Update UI
      setUsers(prev => prev.filter(user => user._id !== id));
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user.");
    }
  };

  const openUserDetails = async (id) => {
    try {
      setDetailsLoading(true);
      const response = await axios.get(
        `${apiBaseUrl}/api/admin/users/${id}/details`,
        { withCredentials: true }
      );
      setSelectedUserDetails(response.data || null);
    } catch (err) {
      console.error("Error fetching user details:", err);
      alert("Failed to load user details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  // Filter users based on search term, role, and status
  useEffect(() => {
    let filtered = Array.isArray(users) ? users : [];

    // Search filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(user => 
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(user => !user.isBlocked);
      } else if (statusFilter === 'blocked') {
        filtered = filtered.filter(user => user.isBlocked);
      }
    }

    setFilteredUsers(Array.isArray(filtered) ? filtered : []);
  }, [searchTerm, roleFilter, statusFilter, users]);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Search input handler
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  if (loading) {
    return (
      <div className="users-loading">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-error">
        <p>Error: {error.message}</p>
        <button onClick={fetchUsers}>Retry</button>
      </div>
    );
  }

  return (
    <div className="users-panel">
      <div className="users-header">
        <h2 className="users-title">User Management</h2>
        <div className="users-search">
          <input
            type="text"
            placeholder="Search by name, email, or title..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="users-search-input"
          />
          <svg className="users-search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="#64748b"/>
          </svg>
        </div>
      </div>

      {/* Filters */}
      <div className="users-filters">
        <div className="filter-group">
          <label>Role:</label>
          <select value={roleFilter} onChange={handleRoleFilterChange} className="filter-select">
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="mentor">Mentor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Status:</label>
          <select value={statusFilter} onChange={handleStatusFilterChange} className="filter-select">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
        <div className="users-count">
          Total: {filteredUsers.length} users
        </div>
      </div>

      {(!Array.isArray(filteredUsers) || filteredUsers.length === 0) ? (
        <p className="users-no-results">
          {searchTerm ? 'No matching users found.' : 'No users found.'}
        </p>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(filteredUsers) && filteredUsers.map(user => (
                <tr key={user._id} className={user.isBlocked ? 'blocked-user' : ''}>
                  <td>
                    <div className="user-name-cell">
                      <div className="user-avatar-small">
                        {user.firstName?.charAt(0) || 'U'}
                      </div>
                      <span>{user.firstName} {user.lastName}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  
                  <td>
                    <span className={`status-badge ${user.isBlocked ? 'blocked' : 'active'}`}>
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="user-actions">
                      <button
                        className="action-btn details"
                        onClick={() => openUserDetails(user._id)}
                        disabled={detailsLoading}
                      >
                        Details
                      </button>
                      {user.isBlocked ? (
                        <button
                          className="action-btn unblock"
                          onClick={() => updateUserStatus(user._id, false)}
                        >
                          Unblock
                        </button>
                      ) : (
                        <button
                          className="action-btn block"
                          onClick={() => updateUserStatus(user._id, true)}
                        >
                          Block
                        </button>
                      )}
                      <button
                        className="action-btn delete"
                        onClick={() => deleteUser(user._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedUserDetails && (
        <div className="user-details-backdrop" onClick={() => setSelectedUserDetails(null)}>
          <div className="user-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="user-details-header">
              <div>
                <h3>User Details</h3>
                <p>{selectedUserDetails.user?.firstName} {selectedUserDetails.user?.lastName}</p>
              </div>
              <button className="user-details-close" onClick={() => setSelectedUserDetails(null)}>×</button>
            </div>

            <div className="user-details-grid">
              <div className="user-details-card">
                <h4>Profile</h4>
                <div className="user-details-list">
                  <div><strong>Name:</strong> {selectedUserDetails.user?.firstName} {selectedUserDetails.user?.lastName}</div>
                  <div><strong>Email:</strong> {selectedUserDetails.user?.email || '—'}</div>
                  <div><strong>Role:</strong> {selectedUserDetails.user?.role || '—'}</div>
                  <div><strong>Field:</strong> {selectedUserDetails.user?.field || '—'}</div>
                  <div><strong>Title:</strong> {selectedUserDetails.user?.title || '—'}</div>
                  <div><strong>Status:</strong> {selectedUserDetails.user?.isBlocked ? 'Blocked' : 'Active'}</div>
                  <div><strong>Created:</strong> {formatDateTime(selectedUserDetails.user?.createdAt)}</div>
                  <div><strong>Updated:</strong> {formatDateTime(selectedUserDetails.user?.updatedAt)}</div>
                  <div><strong>Last Active:</strong> {formatDateTime(selectedUserDetails.user?.lastActiveAt)}</div>
                </div>
              </div>

              <div className="user-details-card">
                <h4>Stats</h4>
                <div className="user-stats-grid">
                  <div className="user-stat-box">
                    <span className="label">Mentee Bookings</span>
                    <strong>{selectedUserDetails.stats?.bookingsAsMentee ?? 0}</strong>
                  </div>
                  <div className="user-stat-box">
                    <span className="label">Mentor Bookings</span>
                    <strong>{selectedUserDetails.stats?.bookingsAsMentor ?? 0}</strong>
                  </div>
                  <div className="user-stat-box">
                    <span className="label">Conversations</span>
                    <strong>{selectedUserDetails.stats?.conversationCount ?? 0}</strong>
                  </div>
                </div>
              </div>

              <div className="user-details-card full">
                <h4>Bio</h4>
                <p>{selectedUserDetails.user?.bio || 'No bio added.'}</p>
              </div>

              <div className="user-details-card full">
                <h4>Expertise</h4>
                <div className="user-expertise-tags">
                  {Array.isArray(selectedUserDetails.user?.expertise) && selectedUserDetails.user.expertise.length > 0 ? (
                    selectedUserDetails.user.expertise.map((item, index) => (
                      <span key={index} className="user-expertise-tag">{item}</span>
                    ))
                  ) : (
                    <span className="user-empty-text">No expertise listed.</span>
                  )}
                </div>
              </div>

              <div className="user-details-card full">
                <h4>Mentor Application</h4>
                {selectedUserDetails.mentorApplication ? (
                  <div className="user-details-list">
                    <div><strong>Status:</strong> {selectedUserDetails.mentorApplication.status || '—'}</div>
                    <div><strong>Phone:</strong> {selectedUserDetails.mentorApplication.phoneNumber || '—'}</div>
                    <div><strong>Domain:</strong> {selectedUserDetails.mentorApplication.domain || '—'}</div>
                    <div><strong>Applied On:</strong> {formatDateTime(selectedUserDetails.mentorApplication.applicationDate)}</div>
                    <div>
                      <strong>LinkedIn:</strong>{' '}
                      {selectedUserDetails.mentorApplication.linkedin ? (
                        <a href={selectedUserDetails.mentorApplication.linkedin} target="_blank" rel="noreferrer">View LinkedIn</a>
                      ) : '—'}
                    </div>
                    <div>
                      <strong>Portfolio:</strong>{' '}
                      {selectedUserDetails.mentorApplication.portfolio ? (
                        <a href={selectedUserDetails.mentorApplication.portfolio} target="_blank" rel="noreferrer">View Portfolio</a>
                      ) : '—'}
                    </div>
                    <div>
                      <strong>Certificate:</strong>{' '}
                      {selectedUserDetails.mentorApplication.domainCertificateUrl ? (
                        <a href={`${apiBaseUrl}${selectedUserDetails.mentorApplication.domainCertificateUrl}`} target="_blank" rel="noreferrer">
                          {selectedUserDetails.mentorApplication.domainCertificateName || 'View Certificate'}
                        </a>
                      ) : '—'}
                    </div>
                    <div><strong>Application Bio:</strong> {selectedUserDetails.mentorApplication.bio || '—'}</div>
                  </div>
                ) : (
                  <p className="user-empty-text">No mentor application found for this user.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPanel;
