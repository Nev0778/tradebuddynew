import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ChannelBadge, channelTitle } from '../components/ChannelBadge';
import { formatMessageTime, rewordProfessional } from '../lib/utils';
import type { QuickReplyCategory } from '../lib/types';

const CATEGORY_COLORS: Record<QuickReplyCategory, { bg: string; text: string }> = {
  Qualifying: { bg: '#7C3AED', text: '#fff' },
  Booking:    { bg: '#0284C7', text: '#fff' },
  'Follow-up':{ bg: '#059669', text: '#fff' },
  Holding:    { bg: '#D97706', text: '#fff' },
  General:    { bg: '#6B7280', text: '#fff' },
};

const ALL_CATEGORIES: (QuickReplyCategory | 'All')[] = ['All', 'Qualifying', 'Booking', 'Follow-up', 'Holding', 'General'];

export function ThreadPage() {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const conv = state.conversations.find(c => c.id === id);

  const [replyText, setReplyText] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [qrCategory, setQrCategory] = useState<QuickReplyCategory | 'All'>('All');
  const [qrSearch, setQrSearch] = useState('');
  const [showVoice, setShowVoice] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [isReworded, setIsReworded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conv?.messages.length]);

  if (!conv) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--slate)' }}>
        <p>Conversation not found</p>
        <button onClick={() => navigate('/inbox')} style={{ color: 'var(--amber)', marginTop: 12, fontSize: 14 }}>
          Back to Inbox
        </button>
      </div>
    );
  }

  const filteredQR = state.settings.quickReplies.filter(qr => {
    const matchCat = qrCategory === 'All' || qr.category === qrCategory;
    const matchSearch = qrSearch.trim() === '' ||
      qr.text.toLowerCase().includes(qrSearch.toLowerCase()) ||
      (qr.label ?? '').toLowerCase().includes(qrSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  function handleSend() {
    const text = replyText.trim();
    if (!text) return;
    dispatch({ type: 'SEND_MESSAGE', conversationId: conv!.id, text });
    setReplyText('');
  }

  function handleVoiceSend() {
    const text = voiceText.trim();
    if (!text) return;
    dispatch({ type: 'SEND_MESSAGE', conversationId: conv!.id, text });
    setVoiceText('');
    setIsReworded(false);
    setShowVoice(false);
  }

  function handleReword() {
    setVoiceText(rewordProfessional(voiceText));
    setIsReworded(true);
  }

  function simulateVoice() {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      setVoiceText("yeah I can sort that no worries mate, gonna come round tuesday if that's alright");
    }, 2000);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Thread header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
        background: 'var(--navy-light)', borderBottom: '1px solid var(--border)', flexShrink: 0,
      }}>
        <button onClick={() => navigate('/inbox')} style={{ color: 'var(--amber)', fontSize: 22, lineHeight: 1, padding: '0 4px' }}>‹</button>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', background: conv.contactAvatarColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
        }}>{conv.contactInitials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--white)' }}>{conv.contactName}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
            <ChannelBadge channel={conv.channelType} size="sm" />
            <span style={{ fontSize: 11, color: 'var(--slate)' }}>{channelTitle(conv.channelType)}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {conv.messages.map(msg => {
          const isOut = msg.direction === 'outgoing';
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isOut ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '78%' }}>
                <div style={{
                  padding: '9px 13px', borderRadius: isOut ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: isOut ? 'var(--amber)' : 'var(--surface-2)',
                  color: isOut ? 'var(--navy)' : 'var(--white)',
                  fontSize: 14, lineHeight: 1.5,
                }}>
                  {msg.text}
                </div>
                <div style={{ fontSize: 10, color: 'var(--slate)', marginTop: 3, textAlign: isOut ? 'right' : 'left' }}>
                  {formatMessageTime(msg.timestamp)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Sending via indicator */}
      <div style={{
        padding: '4px 16px', background: 'var(--navy-light)',
        borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, color: 'var(--slate)' }}>Reply via</span>
        <ChannelBadge channel={conv.channelType} size="sm" />
        <span style={{ fontSize: 11, color: 'var(--slate)' }}>{channelTitle(conv.channelType)} · customer sees a normal message</span>
      </div>

      {/* Reply bar */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 8, padding: '10px 12px',
        background: 'var(--navy-light)', flexShrink: 0,
      }}>
        {/* Quick reply bolt */}
        <button
          onClick={() => setShowQR(true)}
          style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: 'var(--surface-2)', color: 'var(--amber)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}
          title="Quick Replies"
        >⚡</button>

        {/* Text input */}
        <textarea
          value={replyText}
          onChange={e => setReplyText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Type a reply..."
          rows={1}
          style={{
            flex: 1, padding: '9px 12px', borderRadius: 10,
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            color: 'var(--white)', fontSize: 14, resize: 'none', lineHeight: 1.4,
            maxHeight: 100, overflowY: 'auto',
          }}
        />

        {/* Voice button */}
        <button
          onClick={() => setShowVoice(true)}
          style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: 'var(--surface-2)', color: 'var(--slate)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
          }}
          title="Voice Reply"
        >🎤</button>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!replyText.trim()}
          style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: replyText.trim() ? 'var(--amber)' : 'var(--surface-2)',
            color: replyText.trim() ? 'var(--navy)' : 'var(--slate)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}
          title="Send"
        >➤</button>
      </div>

      {/* Quick Reply Sheet */}
      {showQR && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'flex-end', zIndex: 200,
        }} onClick={() => setShowQR(false)}>
          <div style={{
            background: 'var(--navy-light)', borderRadius: '20px 20px 0 0',
            width: '100%', maxHeight: '70vh', display: 'flex', flexDirection: 'column',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '10px auto 4px' }} />
            <div style={{ fontSize: 17, fontWeight: 700, padding: '8px 20px 12px', color: 'var(--white)' }}>Quick Replies</div>

            {/* Search */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              margin: '0 16px 8px', padding: '7px 10px',
              background: 'var(--surface-2)', borderRadius: 10, border: '1px solid var(--border)',
            }}>
              <span style={{ color: 'var(--slate)', fontSize: 14 }}>🔍</span>
              <input
                value={qrSearch}
                onChange={e => setQrSearch(e.target.value)}
                placeholder="Search templates..."
                style={{ flex: 1, fontSize: 14, color: 'var(--white)', background: 'transparent' }}
              />
            </div>

            {/* Category tabs */}
            <div style={{ display: 'flex', gap: 6, padding: '4px 16px 8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
              {ALL_CATEGORIES.map(cat => {
                const isActive = qrCategory === cat;
                const cc = cat !== 'All' ? CATEGORY_COLORS[cat] : null;
                return (
                  <button
                    key={cat}
                    onClick={() => setQrCategory(cat)}
                    style={{
                      padding: '4px 12px', borderRadius: 14, fontSize: 12, fontWeight: 600,
                      whiteSpace: 'nowrap', flexShrink: 0,
                      background: isActive ? (cc ? cc.bg : 'var(--amber)') : 'var(--surface-2)',
                      color: isActive ? (cc ? cc.text : 'var(--navy)') : 'var(--slate)',
                      border: `1px solid ${isActive ? (cc ? cc.bg : 'var(--amber)') : 'var(--border)'}`,
                    }}
                  >{cat}</button>
                );
              })}
            </div>

            {/* Template list */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {filteredQR.length === 0 ? (
                <p style={{ padding: 20, textAlign: 'center', color: 'var(--slate)', fontSize: 14 }}>No templates found</p>
              ) : filteredQR.map(qr => {
                const cc = CATEGORY_COLORS[qr.category];
                return (
                  <button
                    key={qr.id}
                    onClick={() => { setReplyText(qr.text); setShowQR(false); }}
                    style={{
                      width: '100%', textAlign: 'left', padding: '12px 20px',
                      borderBottom: '1px solid var(--border)', background: 'transparent',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{
                        padding: '2px 6px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                        background: cc.bg, color: cc.text,
                      }}>{qr.category}</span>
                      {qr.label && <span style={{ fontSize: 11, color: 'var(--slate)', fontStyle: 'italic' }}>{qr.label}</span>}
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--white)', lineHeight: 1.4 }}>{qr.text}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Voice Sheet */}
      {showVoice && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'flex-end', zIndex: 200,
        }} onClick={() => { setShowVoice(false); setVoiceText(''); setIsReworded(false); setIsListening(false); }}>
          <div style={{
            background: 'var(--navy-light)', borderRadius: '20px 20px 0 0',
            padding: 24, width: '100%',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--white)' }}>Voice Reply</h3>
              <button onClick={() => { setShowVoice(false); setVoiceText(''); setIsReworded(false); setIsListening(false); }}
                style={{ color: 'var(--slate)', fontSize: 20 }}>✕</button>
            </div>

            {!voiceText ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '16px 0' }}>
                <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--white)' }}>
                  {isListening ? 'Listening...' : 'Tap to speak'}
                </p>
                <button
                  onClick={simulateVoice}
                  style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: isListening ? '#EF4444' : 'var(--amber)',
                    color: isListening ? '#fff' : 'var(--navy)',
                    fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: isListening ? '0 0 0 12px rgba(239,68,68,0.2)' : '0 4px 16px rgba(245,166,35,0.4)',
                  }}
                >🎤</button>
                <p style={{ fontSize: 13, color: 'var(--slate)' }}>
                  {isListening ? 'Speak now...' : '(Demo: tap to simulate voice input)'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--slate)', marginBottom: 6 }}>
                    {isReworded ? '✨ REWORDED (PROFESSIONAL)' : 'TRANSCRIBED TEXT'}
                  </p>
                  <textarea
                    value={voiceText}
                    onChange={e => setVoiceText(e.target.value)}
                    rows={4}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 10,
                      background: 'var(--surface-2)', border: `1px solid ${isReworded ? 'var(--amber)' : 'var(--border)'}`,
                      color: 'var(--white)', fontSize: 14, resize: 'none',
                    }}
                  />
                </div>

                {!isReworded && (
                  <button
                    onClick={handleReword}
                    style={{
                      padding: '11px', borderRadius: 12, fontSize: 14, fontWeight: 600,
                      background: 'transparent', border: '1px solid var(--amber)', color: 'var(--amber)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}
                  >✨ Make it Professional</button>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button
                    onClick={() => { setVoiceText(''); setIsReworded(false); setIsListening(false); }}
                    style={{
                      flex: 1, padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 500,
                      background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--slate)',
                    }}
                  >Re-record</button>
                  <button
                    onClick={handleVoiceSend}
                    style={{
                      flex: 2, padding: '12px', borderRadius: 12, fontSize: 15, fontWeight: 700,
                      background: 'var(--amber)', color: 'var(--navy)',
                    }}
                  >Send ➤</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
