import React, { useEffect, useMemo, useState } from 'react';
import { apiBaseUrl } from '../config';

const ChatPage = ({ user }) => {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
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

  const sendAttachment = async () => {
    if (!conversationId || !file) return;
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append('conversationId', conversationId);
      fd.append('file', file);
      // optional caption could be input text
      if (input.trim()) fd.append('text', input.trim());
      const res = await fetch(`${apiBaseUrl}/api/chat/messages/attachment`, {
        method: 'POST',
        credentials: 'include',
        body: fd
      });
      if (!res.ok) throw new Error('Failed to send attachment');
      setInput('');
      setFile(null);
      fetchMessages(conversationId);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      alert('Could not send attachment');
    } finally {
      setLoading(false);
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
                  {Array.isArray(m.attachments) && m.attachments.length > 0 && (
                    <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom: m.text ? 8 : 0 }}>
                      {m.attachments.map((att, idx) => {
                        const url = att.url?.startsWith('http') ? att.url : `${apiBaseUrl}${att.url || ''}`;
                        const mime = att.mime || '';
                        if (mime.startsWith('image/')) {
                          return (
                            <a key={idx} href={url} target="_blank" rel="noreferrer" style={{ display:'inline-block' }}>
                              <img src={url} alt={att.name || 'image'} style={{ maxWidth:'260px', borderRadius:8 }} />
                            </a>
                          );
                        }
                        if (mime.startsWith('video/')) {
                          return (
                            <video key={idx} controls style={{ maxWidth:'260px', borderRadius:8 }}>
                              <source src={url} type={mime} />
                            </video>
                          );
                        }
                        if (mime === 'application/pdf') {
                          return (
                            <a key={idx} href={url} target="_blank" rel="noreferrer" style={{ color:'#2563eb', textDecoration:'underline' }}>
                              {att.name || 'Open PDF'}
                            </a>
                          );
                        }
                        return (
                          <a key={idx} href={url} target="_blank" rel="noreferrer" style={{ color:'#2563eb', textDecoration:'underline' }}>
                            {att.name || 'Download file'}
                          </a>
                        );
                      })}
                    </div>
                  )}
                  {m.text}
                  <div style={{ fontSize: 11, color:'#6b7280', marginTop:4 }}>{new Date(m.createdAt).toLocaleString()}</div>
                </div>
              </div>
            ))
          )}
        </div>
        <div style={{ padding:12, borderTop:'1px solid #e5e7eb', display:'flex', gap:8, alignItems:'center' }}>
          <label style={{ display:'inline-flex', alignItems:'center', gap:8, cursor:'pointer' }}>
            <span style={{ padding:'8px 10px', border:'1px solid #e5e7eb', borderRadius:8 }}>📎 Attach</span>
            <input type="file" style={{ display:'none' }} onChange={(e)=> setFile(e.target.files?.[0] || null)} />
          </label>
          {file && (
            <span style={{ fontSize:12, color:'#374151' }}>{file.name}</span>
          )}
          <input value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Type a message" style={{ flex:1, padding:'10px 12px', border:'1px solid #e5e7eb', borderRadius:8 }} />
          <button onClick={sendMessage} disabled={loading || !conversationId} className="cta-primary" style={{ padding:'10px 16px' }}>Send</button>
          <button onClick={sendAttachment} disabled={loading || !conversationId || !file} className="cta-secondary" style={{ padding:'10px 16px' }}>Send File</button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
