import React, { useEffect, useMemo, useState } from 'react';
import { apiBaseUrl } from '../config';

const ChatPage = ({ user }) => {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState(null);

  const query = useMemo(() => new URLSearchParams(window.location.search), []);

  useEffect(() => {
    const id = query.get('c');
    if (id) setConversationId(id);
  }, [query]);

  const fetchMeta = async (id) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/chat/conversations/${id}`, { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      setMeta(data);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  const fetchMessages = async (id) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/chat/conversations/${id}/messages`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load messages');
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  useEffect(() => {
    if (!conversationId) return;
    fetchMeta(conversationId);
    fetchMessages(conversationId);
    const t = setInterval(() => fetchMessages(conversationId), 4000);
    return () => clearInterval(t);
  }, [conversationId]);

  const sendMessage = async () => {
    if (!input.trim() || !conversationId) return;
    try {
      setLoading(true);
      const res = await fetch(`${apiBaseUrl}/api/chat/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, text: input.trim() })
      });
      if (!res.ok) throw new Error('Failed to send');
      setInput('');
      fetchMessages(conversationId);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      alert('Could not send message');
    } finally {
      setLoading(false);
    }
  };

  const counterpartName = meta?.counterpartName || '';
  const counterpartImage = meta?.counterpart?.profileImage ? `${apiBaseUrl}${meta.counterpart.profileImage}` : '';

  return (
    <div style={{ display:'flex', height:'100%', minHeight: '70vh' }}>
      <div style={{ flex:1, display:'flex', flexDirection:'column', background:'#fff', borderRadius:12, overflow:'hidden' }}>
        <div style={{ padding:12, borderBottom:'1px solid #e5e7eb', display:'flex', alignItems:'center', gap:12 }}>
          {counterpartImage ? (
            <img src={counterpartImage} alt={counterpartName} style={{ width:32, height:32, borderRadius:'50%', objectFit:'cover' }} />
          ) : (
            <div style={{ width:32, height:32, borderRadius:'50%', background:'#e5e7eb', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>
              {(counterpartName || 'U').slice(0,1).toUpperCase()}
            </div>
          )}
          <div style={{ fontWeight:700 }}>{counterpartName || 'Chat'}</div>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:12, background:'#f9fafb' }}>
          {messages.length === 0 ? (
            <div style={{ color:'#6b7280' }}>No messages yet</div>
          ) : (
            messages.map(m => (
              <div key={m._id} style={{ marginBottom:8, display:'flex', justifyContent: String(m.senderId) === String(user?.id || user?._id) ? 'flex-end' : 'flex-start' }}>
                <div style={{ background: '#e5e7eb', padding:'8px 12px', borderRadius: 12, maxWidth: '70%' }}>
                  {m.text}
                  <div style={{ fontSize: 11, color:'#6b7280', marginTop:4 }}>{new Date(m.createdAt).toLocaleString()}</div>
                </div>
              </div>
            ))
          )}
        </div>
        <div style={{ padding:12, borderTop:'1px solid #e5e7eb', display:'flex', gap:8 }}>
          <input value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Type a message" style={{ flex:1, padding:'10px 12px', border:'1px solid #e5e7eb', borderRadius:8 }} />
          <button onClick={sendMessage} disabled={loading || !conversationId} className="cta-primary" style={{ padding:'10px 16px' }}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
