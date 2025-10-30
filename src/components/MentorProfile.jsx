import React, { useEffect, useState } from 'react';
import { apiBaseUrl } from '../config';

const MentorProfile = ({ mentorIdProp, onBack }) => {
  // If mentorIdProp not provided, derive from URL (/mentors/:id)
  const getIdFromPath = () => {
    const m = window.location.pathname.match(/^\/mentors\/([^/]+)/);
    return m ? m[1] : null;
  };
  const mentorId = mentorIdProp || getIdFromPath();

  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [publicSlots, setPublicSlots] = useState(null); // null = not loaded yet

  useEffect(() => {
    const load = async () => {
      if (!mentorId) {
        setError('Mentor id missing');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);

      const tryFetchById = async () => {
        try {
          const res = await fetch(`${apiBaseUrl}/api/mentors/${mentorId}`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          // if backend returns {ok:..., data:...} adjust accordingly
          return data;
        } catch (e) {
          // propagate to allow fallback
          console.info('GET /api/mentors/:id failed, will try list fallback', e);
          throw e;
        }
      };

      const tryFetchListAndFind = async () => {
        try {
          const res = await fetch(`${apiBaseUrl}/api/mentors`);
          if (!res.ok) throw new Error(`List fetch HTTP ${res.status}`);
          const list = await res.json();
          if (!Array.isArray(list)) return null;
          return list.find(m => {
            // support different id keys
            const idCandidates = [m._id, m.id, m._id?.toString(), m.id?.toString()].map(String);
            return idCandidates.includes(String(mentorId));
          }) || null;
        } catch (e) {
          console.error('Failed to fetch mentors list', e);
          return null;
        }
      };

      try {
        let result = null;
        try {
          result = await tryFetchById();
        } catch {
          // fallback: list
          result = await tryFetchListAndFind();
        }

        if (!result) {
          setError('Mentor not found.');
          setMentor(null);
        } else {
          // normalize mentor object shape
          const m = result;
          const normalized = {
            ...m,
            profileImage: typeof m.profileImage === 'string' ? m.profileImage : (m.profileImage?.url || m.profileImage?.secure_url || ''),
            expertise: Array.isArray(m.expertise) ? m.expertise : (typeof m.expertise === 'string' ? m.expertise.split(',').map(s => s.trim()) : (m.tags || [])),
            rating: m.rating ?? m.avgRating ?? m.ratingValue ?? null,
            reviews: m.reviews ?? m.reviewCount ?? 0,
            availableSlots: m.availableSlots ?? m.slots ?? m.services ?? []
          };
          setMentor(normalized);
        }
      } catch (e) {
        console.error('Unexpected error loading mentor', e);
        setError('Failed to load mentor');
        setMentor(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [mentorId]);

  useEffect(() => {
    // after mentor normalized & set, fetch public slots from backend endpoint
    const loadSlots = async () => {
      if (!mentorId) return;
      try {
        const res = await fetch(`${apiBaseUrl}/api/mentors/${mentorId}/slots`);
        if (!res.ok) {
          // treat as no public slots
          setPublicSlots([]);
          return;
        }
        const data = await res.json();
        setPublicSlots(Array.isArray(data) ? data : []);
      } catch (e) {
        console.warn('Could not load public slots', e);
        setPublicSlots([]);
      }
    };

    // only fetch when mentor is available (or always attempt)
    loadSlots();
  }, [mentorId]);

  if (loading) return <div style={{padding:20}}>Loading mentor profile...</div>;
  if (error) return <div style={{padding:20,color:'red'}}>{error}</div>;
  if (!mentor) return <div style={{padding:20}}>No mentor found.</div>;

  const {
    name,
    firstName,
    lastName,
    profileImage,
    bio,
    domain,
    expertise,
    rating,
    reviews,
    availableSlots // normalized above
  } = mentor;

  // derive a single source of truth for slots to render
  const slotsLoaded = publicSlots !== null; // null = not loaded yet
  const slotsFromPublic = Array.isArray(publicSlots) && publicSlots.length > 0;
  const slotsToRender = slotsFromPublic ? publicSlots : (Array.isArray(availableSlots) ? availableSlots : []);
  
  const displayName = name || `${firstName || ''} ${lastName || ''}`.trim() || 'Mentor';

  const resolveImage = (img) => {
    if (!img) return '';
    if (img.startsWith('http') || img.startsWith('//')) return img;
    // avoid double slashes
    const base = apiBaseUrl?.replace(/\/$/, '') || '';
    return `${base}${img.startsWith('/') ? img : '/' + img}`;
  };

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: '0 auto' }}>
      <button onClick={() => { if (onBack) onBack(); else window.history.back(); }} style={{ marginBottom: 16 }}>← Back</button>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', background:'#fff', padding:20, borderRadius:12, boxShadow:'0 6px 18px rgba(2,6,23,0.06)' }}>
        <div style={{ width:160, height:160, borderRadius:12, overflow:'hidden', flexShrink:0, background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center' }}>
          {profileImage ? (
            <img src={resolveImage(profileImage)} alt={displayName} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={(e)=>{ e.target.onerror=null; e.target.style.display='none'; }} />
          ) : (
            <div style={{ fontSize:28, fontWeight:700, color:'#0b5cab' }}>{(displayName || 'M').slice(0,2).toUpperCase()}</div>
          )}
        </div>

        <div style={{ flex:1 }}>
          <h1 style={{ margin:0 }}>{displayName}</h1>
          {domain && <p style={{ margin:'6px 0', color:'#6b7280' }}>{domain}</p>}
          <div style={{ display:'flex', gap:12, alignItems:'center', marginTop:8 }}>
            <div style={{ display:'flex', gap:6, alignItems:'center' }}>
              <span style={{ fontWeight:700, color:'#111827' }}>{rating ?? '—'}</span>
              <span style={{ color:'#6b7280' }}>⭐</span>
              <span style={{ color:'#6b7280' }}>({reviews ?? 0} reviews)</span>
            </div>
          </div>

          {bio && <div style={{ marginTop:12 }}><h3 style={{ margin:'8px 0' }}>About</h3><p style={{ margin:0, color:'#374151' }}>{bio}</p></div>}

          <div style={{ marginTop:12 }}>
            <h4 style={{ margin:'8px 0' }}>Expertise</h4>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {(Array.isArray(expertise) && expertise.length > 0) ? expertise.map((tag, i) => (
                <span key={i} style={{ background:'#eff6ff', color:'#0b5cab', padding:'6px 10px', borderRadius:20, fontWeight:600 }}>{tag}</span>
              )) : <span style={{ color:'#6b7280' }}>No expertise listed</span>}
            </div>
          </div>

          <div style={{ marginTop:16 }}>
            <h4 style={{ margin:'8px 0' }}>Available Slots</h4>

            { !slotsLoaded ? (
              <div style={{ color:'#6b7280' }}>Loading slots...</div>
            ) : slotsToRender.length > 0 ? (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:10 }}>
                {slotsToRender.map((slot, idx) => {
                  // support string or object shapes
                  if (typeof slot === 'string') {
                    return (
                      <div key={idx} style={{ padding:12, borderRadius:8, background:'#fff', border:'1px solid #e6eefb', boxShadow:'0 1px 4px rgba(2,6,23,0.04)' }}>
                        <div style={{ fontWeight:700 }}>{slot}</div>
                      </div>
                    );
                  }

                  // try common fields for object slot
                  const startValue = slot.start || slot.time || slot.startTime || slot.date || null;
                  const startDate = startValue ? new Date(startValue) : null;
                  const dateLabel = startDate ? startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : (slot.label || 'Slot');
                  const timeLabel = startDate ? startDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) : (slot.time || '');
                  const duration = slot.durationMinutes ?? (slot.end && startDate ? Math.round((new Date(slot.end) - startDate) / 60000) : null);
                  const priceLabel = slot.price ? `₹${slot.price}` : 'Free';

                  return (
                    <div key={idx} style={{ padding:12, borderRadius:10, background:'#fff', border:'1px solid #eef2ff', boxShadow:'0 6px 18px rgba(2,6,23,0.03)', display:'flex', flexDirection:'column', gap:8 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
                        <div>
                          <div style={{ fontSize:14, fontWeight:700, color:'#0b5cab' }}>{dateLabel}</div>
                          <div style={{ fontSize:13, color:'#374151', marginTop:4 }}>{timeLabel}</div>
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <div style={{ fontWeight:700 }}>{priceLabel}</div>
                          {duration && <div style={{ fontSize:12, color:'#6b7280' }}>{duration} min</div>}
                        </div>
                      </div>

                      {slot.label && <div style={{ color:'#374151', fontSize:13 }}>{slot.label}</div>}

                      <div style={{ display:'flex', gap:8, marginTop:6 }}>
                        <button style={{ padding:'8px 10px', background:'#0b5cab', color:'#fff', border:'none', borderRadius:8, cursor:'pointer' }} onClick={() => alert('Booking flow not implemented yet')}>Book</button>
                        <button style={{ padding:'8px 10px', background:'#f8fafc', border:'1px solid #e5e7eb', borderRadius:8, cursor:'pointer' }} onClick={() => navigator.clipboard?.writeText(`${dateLabel} ${timeLabel}`)} title="Copy slot time">Copy time</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ color:'#6b7280' }}>This mentor has not listed slots publicly.</div>
            )}

          </div>

          <div style={{ marginTop:20, display:'flex', gap:10 }}>
            <button style={{ padding:'10px 14px', background:'#0b5cab', color:'#fff', border:'none', borderRadius:8, cursor:'pointer' }}>Book Session</button>
            <button style={{ padding:'10px 14px', background:'#f8fafc', border:'1px solid #e5e7eb', borderRadius:8, cursor:'pointer' }}>Message</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorProfile;
