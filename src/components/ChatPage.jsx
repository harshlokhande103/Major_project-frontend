import React, { useEffect, useRef, useState } from 'react';
import { apiBaseUrl } from '../config';

const formatFileSize = (size = 0) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const formatMessageTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

const formatMessageDay = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
};

const resolveAttachmentUrl = (url = '') => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${apiBaseUrl}${url.startsWith('/') ? url : `/${url}`}`;
};

const getFileKey = (file) => `${file.name}-${file.size}-${file.lastModified}`;
const getMessageKey = (message) => String(message?._id || message?.id || '');

const ImageAttachment = ({ src, previewSrc, alt, mine }) => {
  const [resolvedSrc, setResolvedSrc] = useState(previewSrc || src || '');
  const [failed, setFailed] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);

  useEffect(() => {
    let objectUrl = '';
    let active = true;

    const load = async () => {
      if (!src) {
        setResolvedSrc('');
        return;
      }
      if (previewSrc) {
        setResolvedSrc(previewSrc);
        return;
      }
      if (src.startsWith('blob:') || /^https?:\/\//i.test(src)) {
        setResolvedSrc(src);
        return;
      }

      try {
        if (active) {
          setLoadingImage(true);
          setResolvedSrc('');
        }
        const res = await fetch(src, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load image');
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        if (active) setResolvedSrc(objectUrl);
      } catch {
        if (active) {
          setFailed(true);
          setResolvedSrc('');
        }
      } finally {
        if (active) setLoadingImage(false);
      }
    };

    setFailed(false);
    setLoadingImage(false);
    setResolvedSrc(
      previewSrc
        ? previewSrc
        : src && (src.startsWith('blob:') || /^https?:\/\//i.test(src))
          ? src
          : ''
    );
    load();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src, previewSrc]);

  if (failed) {
    return (
      <div style={{
        width: 'min(320px, 100%)',
        minHeight: '120px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: mine ? 'rgba(255,255,255,0.14)' : '#f8fbff',
        border: mine ? '1px solid rgba(255,255,255,0.18)' : '1px solid #dbe6f4',
        color: mine ? '#dbeafe' : '#64748b',
        fontSize: '13px',
        fontWeight: 600
      }}>
        Image preview unavailable
      </div>
    );
  }

  if (!resolvedSrc || loadingImage) {
    return (
      <div style={{
        width: 'min(320px, 100%)',
        height: '220px',
        borderRadius: '16px',
        background: mine
          ? 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.08))'
          : 'linear-gradient(135deg, #e5eefb, #f8fbff)',
        border: mine ? '1px solid rgba(255,255,255,0.18)' : '1px solid #dbe6f4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: mine ? '#dbeafe' : '#64748b',
        fontSize: '13px',
        fontWeight: 600
      }}>
        Loading image...
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      onError={() => {
        setFailed(true);
        setResolvedSrc('');
      }}
      style={{
        display: 'block',
        maxWidth: '100%',
        width: 'min(320px, 100%)',
        maxHeight: '320px',
        objectFit: 'cover',
        background: '#e2e8f0',
        borderRadius: '16px',
        border: mine ? '1px solid rgba(255,255,255,0.25)' : '1px solid #dbe6f4'
      }}
    />
  );
};

const ChatPage = ({ user }) => {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [sendingAttachment, setSendingAttachment] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [files, setFiles] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loadError, setLoadError] = useState('');
  const messagesEndRef = useRef(null);
  const objectUrlRegistryRef = useRef(new Set());

  useEffect(() => {
    const syncConversationId = () => {
      const nextQuery = new URLSearchParams(window.location.search);
      const id = nextQuery.get('c');
      setConversationId(id || null);
    };

    syncConversationId();
    window.addEventListener('popstate', syncConversationId);
    return () => window.removeEventListener('popstate', syncConversationId);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  useEffect(() => {
    return () => {
      objectUrlRegistryRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      });
      objectUrlRegistryRef.current.clear();
    };
  }, []);

  const fetchMeta = async (id) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/chat/conversations/${id}`, { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      setMeta(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMessages = async (id, options = {}) => {
    const { silent = false } = options;
    try {
      if (!silent) setRefreshing(true);
      setLoadError('');
      const res = await fetch(`${apiBaseUrl}/api/chat/conversations/${id}/messages`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load messages');
      const data = await res.json();
      const nextMessages = Array.isArray(data) ? data : [];
      setMessages((prev) => {
        const optimistic = prev.filter((item) => String(item?._id || '').startsWith('temp-'));
        const merged = [...nextMessages];
        optimistic.forEach((item) => {
          const duplicate = merged.some((msg) =>
            String(msg.senderId) === String(item.senderId) &&
            String(msg.text || '') === String(item.text || '') &&
            Math.abs(new Date(msg.createdAt).getTime() - new Date(item.createdAt).getTime()) < 15000
          );
          if (!duplicate) merged.push(item);
        });
        return merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      });
    } catch (e) {
      console.error(e);
      setLoadError(e.message || 'Could not load chat');
    } finally {
      if (!silent) setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!conversationId) return;
    fetchMeta(conversationId);
    fetchMessages(conversationId);
    const timer = setInterval(() => fetchMessages(conversationId, { silent: true }), 2500);
    return () => clearInterval(timer);
  }, [conversationId]);

  const sendMessage = async () => {
    if (!input.trim() || !conversationId) return;
    const messageText = input.trim();
    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      conversationId,
      senderId: user?.id || user?._id,
      text: messageText,
      attachments: [],
      createdAt: new Date().toISOString()
    };
    try {
      setSendingMessage(true);
      setInput('');
      setMessages((prev) => [...prev, optimisticMessage]);
      const res = await fetch(`${apiBaseUrl}/api/chat/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, text: messageText })
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        throw new Error(errorBody?.message || 'Failed to send message');
      }
      const sentMessage = await res.json();
      setMessages((prev) => prev.map((item) => getMessageKey(item) === optimisticMessage._id ? sentMessage : item));
      fetchMessages(conversationId, { silent: true });
    } catch (e) {
      console.error(e);
      setInput(messageText);
      setMessages((prev) => prev.filter((item) => getMessageKey(item) !== optimisticMessage._id));
      alert(e.message || 'Could not send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const sendAttachment = async () => {
    if (!conversationId || files.length === 0) return;
    const caption = input.trim();
    const selectedFiles = [...files];
    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      conversationId,
      senderId: user?.id || user?._id,
      text: caption,
      attachments: selectedFiles.map((selectedFile) => ({
        url: (() => {
          const objectUrl = URL.createObjectURL(selectedFile);
          objectUrlRegistryRef.current.add(objectUrl);
          return objectUrl;
        })(),
        name: selectedFile.name,
        size: selectedFile.size,
        mime: selectedFile.type || ''
      })),
      createdAt: new Date().toISOString()
    };
    try {
      setSendingAttachment(true);
      const fd = new FormData();
      fd.append('conversationId', conversationId);
      selectedFiles.forEach((selectedFile) => fd.append('files', selectedFile));
      if (caption) fd.append('text', caption);
      setInput('');
      setFiles([]);
      setMessages((prev) => [...prev, optimisticMessage]);

      const res = await fetch(`${apiBaseUrl}/api/chat/messages/attachment`, {
        method: 'POST',
        credentials: 'include',
        body: fd
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        throw new Error(errorBody?.message || 'Failed to send attachment');
      }
      const sentMessage = await res.json();
      optimisticMessage.attachments.forEach((attachment) => {
        if (attachment.url?.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(attachment.url);
          } catch {}
          objectUrlRegistryRef.current.delete(attachment.url);
        }
      });
      setMessages((prev) => prev.map((item) => getMessageKey(item) === optimisticMessage._id ? sentMessage : item));
      fetchMessages(conversationId, { silent: true });
    } catch (e) {
      console.error(e);
      setInput(caption);
      setFiles(selectedFiles);
      setMessages((prev) => prev.filter((item) => getMessageKey(item) !== optimisticMessage._id));
      alert(e.message || 'Could not send attachment');
    } finally {
      setSendingAttachment(false);
    }
  };

  const handleFileSelection = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles((prev) => {
      const next = [...prev];
      selectedFiles.forEach((selectedFile) => {
        const key = getFileKey(selectedFile);
        if (!next.some((item) => getFileKey(item) === key)) next.push(selectedFile);
      });
      return next;
    });
    event.target.value = '';
  };

  const removeSelectedFile = (fileKey) => {
    setFiles((prev) => prev.filter((item) => getFileKey(item) !== fileKey));
  };

  const handleComposerKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (files.length > 0) sendAttachment();
      else sendMessage();
    }
  };

  const counterpartName = meta?.counterpartName || 'Conversation';
  const counterpartImage = meta?.counterpart?.profileImage ? `${apiBaseUrl}${meta.counterpart.profileImage}` : '';
  const sending = sendingMessage || sendingAttachment;
  const canSendMessage = Boolean(conversationId && input.trim() && !sending);
  const canSendFiles = Boolean(conversationId && files.length > 0 && !sending);

  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)',
      padding: '24px',
      background: 'linear-gradient(180deg, #eef4ff 0%, #f8fbff 52%, #ffffff 100%)'
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        height: 'calc(100vh - 168px)',
        minHeight: '640px',
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff',
        border: '1px solid #dbe6f4',
        borderRadius: '28px',
        overflow: 'hidden',
        boxShadow: '0 24px 70px rgba(15, 23, 42, 0.12)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          background: 'linear-gradient(135deg, #ffffff 0%, #f6f9ff 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
            {counterpartImage ? (
              <img
                src={counterpartImage}
                alt={counterpartName}
                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #dbeafe' }}
              />
            ) : (
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb, #60a5fa)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '18px'
              }}>
                {(counterpartName || 'U').slice(0, 1).toUpperCase()}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {counterpartName}
              </div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>
                Secure conversation
              </div>
            </div>
          </div>
          <div style={{
            padding: '8px 12px',
            borderRadius: '999px',
            background: '#eff6ff',
            color: '#1d4ed8',
            fontSize: '12px',
            fontWeight: 600,
            flexShrink: 0
          }}>
            {sending ? 'Sending...' : refreshing ? 'Loading...' : 'Live chat'}
          </div>
        </div>

        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          background: 'radial-gradient(circle at top, rgba(219, 234, 254, 0.45), transparent 36%), linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%)'
        }}>
          {!conversationId ? (
            <div style={{
              height: '100%',
              display: 'grid',
              placeItems: 'center',
              color: '#64748b',
              textAlign: 'center'
            }}>
              <div>
                <h3 style={{ marginBottom: '8px', color: '#0f172a' }}>Select a conversation</h3>
                <p style={{ margin: 0 }}>Open chat from a booking or dashboard card to start messaging.</p>
              </div>
            </div>
          ) : loadError ? (
            <div style={{
              maxWidth: '420px',
              margin: '40px auto',
              background: '#ffffff',
              border: '1px solid #fecaca',
              borderRadius: '18px',
              padding: '18px 20px',
              color: '#991b1b',
              textAlign: 'center'
            }}>
              {loadError}
            </div>
          ) : messages.length === 0 ? (
            <div style={{
              height: '100%',
              display: 'grid',
              placeItems: 'center'
            }}>
              <div style={{
                maxWidth: '420px',
                background: 'rgba(255,255,255,0.85)',
                border: '1px solid #dbe6f4',
                borderRadius: '22px',
                padding: '24px',
                textAlign: 'center',
                boxShadow: '0 18px 50px rgba(37, 99, 235, 0.08)'
              }}>
                <h3 style={{ margin: '0 0 8px', color: '#0f172a' }}>No messages yet</h3>
                <p style={{ margin: 0, color: '#64748b', lineHeight: 1.6 }}>
                  Send a message or share a file to start the conversation.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => {
              const mine = String(message.senderId) === String(user?.id || user?._id);
              const previous = messages[index - 1];
              const showDay =
                !previous || formatMessageDay(previous.createdAt) !== formatMessageDay(message.createdAt);

              return (
                <React.Fragment key={message._id}>
                  {showDay && (
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0 18px' }}>
                      <div style={{
                        padding: '8px 14px',
                        borderRadius: '999px',
                        background: 'rgba(255,255,255,0.92)',
                        border: '1px solid #dbe6f4',
                        color: '#475569',
                        fontSize: '12px',
                        fontWeight: 600,
                        boxShadow: '0 6px 18px rgba(15, 23, 42, 0.05)'
                      }}>
                        {formatMessageDay(message.createdAt)}
                      </div>
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    justifyContent: mine ? 'flex-end' : 'flex-start',
                    marginBottom: '14px'
                  }}>
                    <div style={{
                      maxWidth: 'min(72%, 620px)',
                      background: mine
                        ? 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 45%, #3b82f6 100%)'
                        : '#ffffff',
                      color: mine ? '#ffffff' : '#0f172a',
                      borderRadius: mine ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
                      border: mine ? 'none' : '1px solid #dbe6f4',
                      boxShadow: mine
                        ? '0 18px 42px rgba(37, 99, 235, 0.28)'
                        : '0 14px 36px rgba(15, 23, 42, 0.07)',
                      padding: '12px 14px'
                    }}>
                      {Array.isArray(message.attachments) && message.attachments.length > 0 && (
                        <div style={{
                          display: 'grid',
                          gap: '10px',
                          marginBottom: message.text ? '12px' : 0
                        }}>
                          {message.attachments.map((attachment, attachmentIndex) => {
                            const url = resolveAttachmentUrl(attachment.url);
                            const mime = attachment.mime || '';
                            const linkColor = mine ? '#dbeafe' : '#1d4ed8';

                            if (mime.startsWith('image/')) {
                              return (
                                <a key={attachmentIndex} href={url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                                  <ImageAttachment
                                    src={url}
                                    previewSrc={attachment.previewUrl}
                                    alt={attachment.name || 'attachment'}
                                    mine={mine}
                                  />
                                </a>
                              );
                            }

                            return (
                              <a
                                key={attachmentIndex}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                download={!mime.startsWith('video/') ? attachment.name || true : undefined}
                                style={{
                                  textDecoration: 'none',
                                  color: mine ? '#ffffff' : '#0f172a'
                                }}
                              >
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '12px',
                                  padding: '12px 14px',
                                  borderRadius: '16px',
                                  background: mine ? 'rgba(255,255,255,0.14)' : '#f8fbff',
                                  border: mine ? '1px solid rgba(255,255,255,0.18)' : '1px solid #dbe6f4'
                                }}>
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{
                                      fontWeight: 600,
                                      fontSize: '14px',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis'
                                    }}>
                                      {attachment.name || 'Attachment'}
                                    </div>
                                    <div style={{ marginTop: '4px', fontSize: '12px', color: mine ? '#dbeafe' : '#64748b' }}>
                                      {mime || 'File'} · {formatFileSize(attachment.size || 0)}
                                    </div>
                                  </div>
                                  <div style={{
                                    color: linkColor,
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    flexShrink: 0
                                  }}>
                                    {mime === 'application/pdf' ? 'Open' : 'Download'}
                                  </div>
                                </div>
                              </a>
                            );
                          })}
                        </div>
                      )}

                      {message.text ? (
                        <div style={{
                          fontSize: '14px',
                          lineHeight: 1.65,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word'
                        }}>
                          {message.text}
                        </div>
                      ) : null}

                      <div style={{
                        marginTop: '8px',
                        fontSize: '11px',
                        color: mine ? '#dbeafe' : '#64748b',
                        textAlign: 'right'
                      }}>
                        {formatMessageTime(message.createdAt)}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={{
          borderTop: '1px solid #e2e8f0',
          background: '#ffffff',
          padding: '18px 20px 20px'
        }}>
          {files.length > 0 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              marginBottom: '14px'
            }}>
              {files.map((selectedFile) => {
                const fileKey = getFileKey(selectedFile);
                return (
                  <div key={fileKey} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: '999px',
                    background: '#eef4ff',
                    border: '1px solid #c7dcff',
                    color: '#1e40af',
                    maxWidth: '100%'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '200px'
                    }}>
                      {selectedFile.name}
                    </span>
                    <span style={{ fontSize: '11px', color: '#475569' }}>{formatFileSize(selectedFile.size)}</span>
                    <button
                      type="button"
                      onClick={() => removeSelectedFile(fileKey)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: '#1e40af',
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: '14px',
                        fontWeight: 700
                      }}
                    >
                      x
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'auto minmax(0, 1fr) auto auto',
            gap: '12px',
            alignItems: 'end'
          }}>
            <label style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px 16px',
              borderRadius: '16px',
              border: '1px solid #dbe6f4',
              background: '#f8fbff',
              color: '#0f172a',
              fontWeight: 600,
              cursor: 'pointer',
              minHeight: '52px'
            }}>
              Attach
              <input
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileSelection}
              />
            </label>

            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleComposerKeyDown}
              placeholder="Write a message"
              rows={1}
              style={{
                minHeight: '52px',
                maxHeight: '140px',
                resize: 'vertical',
                padding: '14px 16px',
                borderRadius: '18px',
                border: '1px solid #dbe6f4',
                background: '#ffffff',
                fontSize: '14px',
                lineHeight: 1.55,
                color: '#0f172a',
                outline: 'none'
              }}
            />

            <button
              type="button"
              onClick={sendMessage}
              disabled={!canSendMessage}
              style={{
                minHeight: '52px',
                padding: '0 18px',
                borderRadius: '16px',
                border: 'none',
                background: !canSendMessage ? '#cbd5e1' : '#1d4ed8',
                color: '#ffffff',
                fontWeight: 700,
                cursor: !canSendMessage ? 'not-allowed' : 'pointer'
              }}
            >
              {sendingMessage ? 'Sending...' : 'Send'}
            </button>

            <button
              type="button"
              onClick={sendAttachment}
              disabled={!canSendFiles}
              style={{
                minHeight: '52px',
                padding: '0 18px',
                borderRadius: '16px',
                border: '1px solid #bfdbfe',
                background: !canSendFiles ? '#f1f5f9' : '#eff6ff',
                color: !canSendFiles ? '#94a3b8' : '#1d4ed8',
                fontWeight: 700,
                cursor: !canSendFiles ? 'not-allowed' : 'pointer'
              }}
            >
              {sendingAttachment ? 'Sending...' : files.length > 1 ? `Send Files (${files.length})` : 'Send File'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
