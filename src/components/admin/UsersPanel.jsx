import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UsersPanel = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);

  const loadUsers = async (q = '') => {
    try {
      setLoading(true);
      const res = await axios.get(`/admin/users${q ? `?q=${encodeURIComponent(q)}` : ''}`, { withCredentials: true });
      setUsers(res.data || []);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers('');
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    loadUsers(query.trim());
  };

  const toggleBlock = async (userId, nextBlocked) => {
    try {
      await axios.patch(`/admin/users/${userId}/block`, { block: nextBlocked }, { withCredentials: true });
      loadUsers(query.trim());
    } catch (err) {
      // noop
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error loading users</div>;

  return (
    <div className="users-panel">
      <h2>Users</h2>
      <form onSubmit={onSearch} style={{ marginBottom: 12 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email"
        />
        <button type="submit">Search</button>
      </form>
      {users.length === 0 ? (
        <div>No users found.</div>
      ) : (
        <div className="users-list">
          {users.map((u) => (
            <div key={u._id} className="user-row">
              <div>
                <div><strong>{u.firstName} {u.lastName}</strong></div>
                <div>{u.email}</div>
                {u.title ? <div>{u.title}</div> : null}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: u.isBlocked ? 'red' : 'green' }}>{u.isBlocked ? 'Blocked' : 'Active'}</span>
                <button onClick={() => toggleBlock(u._id, !u.isBlocked)}>
                  {u.isBlocked ? 'Unblock' : 'Block'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UsersPanel;


