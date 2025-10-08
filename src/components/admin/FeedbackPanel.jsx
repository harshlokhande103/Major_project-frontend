import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiBaseUrl } from '../../config';

const FeedbackPanel = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiBaseUrl}/admin/feedbacks`, { withCredentials: true });
      setItems(res.data || []);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const removeItem = async (id) => {
    try {
      await axios.delete(`${apiBaseUrl}/admin/feedbacks/${id}`, { withCredentials: true });
      load();
    } catch (err) {}
  };

  if (loading) return <div>Loading feedback...</div>;
  if (error) return <div>Error loading feedback</div>;

  return (
    <div className="feedback-panel">
      <h2>Feedback & Ratings</h2>
      {items.length === 0 ? <div>No feedback</div> : (
        <ul>
          {items.map((f, i) => (
            <li key={f.id || i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span>{f.userEmail || 'User'} → {f.mentorEmail || 'Mentor'} — {f.rating || '-'}★ — {f.comment || ''}</span>
              <button onClick={() => removeItem(f.id || i)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FeedbackPanel;


