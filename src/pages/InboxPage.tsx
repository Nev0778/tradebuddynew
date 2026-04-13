import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ChannelBadge } from '../components/ChannelBadge';
import { formatRelativeTime } from '../lib/utils';
import { generateId } from '../lib/utils';
import type { InboxFilter, ChannelType, Conversation } from '../lib/types';

const FILTERS: { key: InboxFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'messenger', label: 'Messenger' },
  { key: 'page_comment', label: 'Page' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'sms', label: 'SMS' },
];

const CHANNEL_OPTIONS: { type: ChannelType; label: string }[] = [
  { type: 'messenger', label: 'Facebook Messenger' },
  { type: 'page_comment', label: 'Facebook Page Comments' },
  { type: 'whatsapp', label: 'WhatsApp' },
  { type: 'sms', label: 'SMS' },
];

const AVATAR_COLORS = ['#9C27B0','#FF5722','#009688','#3F51B5','#E91E63','#FF9800','#00BCD4','#795548','#607D8B','#F44336'];

export function InboxPage() {
  const { state, dispatch, filteredConversations } = useApp();
  const navigate = useNavigate();
  const [showNewModal, setShowNewModal] = useState(false);
  const [newChannel, setNewChannel] = useState<ChannelType>('messenger');
  const [newName, setNewName] = useState('');
  const [newMessage, setNewMessage] = useState('');

  function handleConversationClick(conv: Conversation) {
    dispatch({ type: 'MARK_READ', conversationId: conv.id });
    navigate(`/inbox/${conv.id}`);
  }

  function handleCreateConversation() {
    if (!newName.trim() || !newMessage.trim()) return;
    const id = generateId();
    const initials = newName.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    const msg = {
      id: generateId(),
      conversationId: id,
      direction: 'outgoing' as const,
      text: newMessage.trim(),
      timestamp: new Date(),
      channelType: newChannel,
      isRead: true,
    };
    const conv: Conversation = {
      id,
      channelType: newChannel,
      channelId: `ch-${newChannel}-1`,
      contactName: newName.trim(),
      contactInitials: initials,
      contactAvatarColor: color,
      pageName: state.settings.businessName,
      messages: [msg],
      lastMessage: msg,
      unreadCount: 0,
    };
    dispatch({ type: 'ADD_CONVERSATION', conversation: conv });
    setShowNewModal(false);
    setNewName('');
    setNewMessage('');
    navigate(`/inbox/${id}`);
  }

  const unreadByChannel = (channel: ChannelType) =>
    state.conversations.filter(c => c.channelType === channel && c.unreadCount > 0).length;

  const totalUnreadAll = state.conversations.filter(c => c.unreadCount > 0).length;
  const isUnreadOnly = state.readFilter === 'unread';
  const hasSearch = state.searchQuery.trim().length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Search bar */}
      <div style={{
        padding: '8px 12px 6px', flexShrink: 0,
        borderBottom: hasSearch ? '1px solid var(--border)' : 'none',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--surface-2)', borderRadius: 12,
          padding: '8px 12px', border: '1px solid var(--border)',
        }}>
          <span style={{ color: 'var(--slate)', fontSize: 15, flexShrink: 0 }}>🔍</span>
          <input
            value={state.searchQuery}
            onChange={e => dispatch({ type: 'SET_SEARCH', query: e.target.value })}
            placeholder="Search conversations…"
            style={{
              flex: 1, fontSize: 14, color: 'var(--white)',
              background: 'transparent', border: 'none', outline: 'none',
            }}
          />
          {hasSearch && (
            <button
              onClick={() => dispatch({ type: 'SET_SEARCH', query: '' })}
              style={{ color: 'var(--slate)', fontSize: 16, lineHeight: 1, flexShrink: 0 }}
            >✕</button>
          )}
        </div>
      </div>

      {/* Filter bar: channel tabs + unread toggle */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 12px 8px', overflowX: 'auto',
        flexShrink: 0, borderBottom: '1px solid var(--border)',
        scrollbarWidth: 'none',
      }}>
        {/* Channel filter pills */}
        {FILTERS.map(f => {
          const isActive = state.activeFilter === f.key;
          const count = f.key !== 'all' ? unreadByChannel(f.key as ChannelType) : totalUnreadAll;
          return (
            <button
              key={f.key}
              onClick={() => dispatch({ type: 'SET_FILTER', filter: f.key })}
              style={{
                padding: '5px 11px', borderRadius: 16, fontSize: 12, fontWeight: 600,
                whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.15s',
                background: isActive ? 'var(--amber)' : 'var(--surface-2)',
                color: isActive ? 'var(--navy)' : 'var(--slate)',
                border: isActive ? '1px solid var(--amber)' : '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              {f.label}
              {count > 0 && (
                <span style={{
                  background: isActive ? 'var(--navy)' : 'var(--amber)',
                  color: isActive ? 'var(--amber)' : 'var(--navy)',
                  borderRadius: 8, fontSize: 10, fontWeight: 700,
                  padding: '0 5px', minWidth: 16, textAlign: 'center',
                }}>{count}</span>
              )}
            </button>
          );
        })}

        {/* Divider */}
        <div style={{ width: 1, height: 18, background: 'var(--border)', flexShrink: 0, marginLeft: 2 }} />

        {/* Unread toggle */}
        <button
          onClick={() => dispatch({ type: 'SET_READ_FILTER', filter: isUnreadOnly ? 'all' : 'unread' })}
          style={{
            padding: '5px 11px', borderRadius: 16, fontSize: 12, fontWeight: 600,
            whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.15s',
            background: isUnreadOnly ? 'rgba(245,166,35,0.18)' : 'var(--surface-2)',
            color: isUnreadOnly ? 'var(--amber)' : 'var(--slate)',
            border: isUnreadOnly ? '1px solid rgba(245,166,35,0.5)' : '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 5,
          }}
        >
          <span style={{ fontSize: 9, lineHeight: 1 }}>●</span>
          Unread
          {totalUnreadAll > 0 && (
            <span style={{
              background: isUnreadOnly ? 'var(--amber)' : 'rgba(245,166,35,0.25)',
              color: isUnreadOnly ? 'var(--navy)' : 'var(--amber)',
              borderRadius: 8, fontSize: 10, fontWeight: 700,
              padding: '0 5px', minWidth: 16, textAlign: 'center',
            }}>{totalUnreadAll}</span>
          )}
        </button>
      </div>

      {/* Conversation list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filteredConversations.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--slate)' }}>
            {hasSearch ? (
              <>
                <p style={{ fontSize: 15 }}>No results for "{state.searchQuery}"</p>
                <p style={{ fontSize: 13, marginTop: 6 }}>Try a different name or message</p>
              </>
            ) : isUnreadOnly ? (
              <>
                <p style={{ fontSize: 15 }}>No unread messages</p>
                <p style={{ fontSize: 13, marginTop: 6 }}>You're all caught up!</p>
              </>
            ) : (
              <>
                <p style={{ fontSize: 15 }}>No conversations yet</p>
                <p style={{ fontSize: 13, marginTop: 6 }}>Tap + to start a new conversation</p>
              </>
            )}
          </div>
        ) : (
          filteredConversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => handleConversationClick(conv)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderBottom: '1px solid var(--border)',
                background: conv.unreadCount > 0 ? 'rgba(245,166,35,0.04)' : 'transparent',
                textAlign: 'left', transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface)')}
              onMouseLeave={e => (e.currentTarget.style.background = conv.unreadCount > 0 ? 'rgba(245,166,35,0.04)' : 'transparent')}
            >
              {/* Avatar */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: conv.contactAvatarColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 700, color: '#fff',
                }}>
                  {conv.contactInitials}
                </div>
                <div style={{ position: 'absolute', bottom: -2, right: -2 }}>
                  <ChannelBadge channel={conv.channelType} size="sm" />
                </div>
                {conv.unreadCount > 0 && (
                  <div style={{
                    position: 'absolute', top: -2, left: -2,
                    width: 10, height: 10, borderRadius: '50%',
                    background: 'var(--amber)', border: '2px solid var(--navy)',
                  }} />
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                  <span style={{
                    fontSize: 14, fontWeight: conv.unreadCount > 0 ? 700 : 500,
                    color: 'var(--white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{conv.contactName}</span>
                  <span style={{ fontSize: 11, color: 'var(--slate)', flexShrink: 0, marginLeft: 8 }}>
                    {formatRelativeTime(conv.lastMessage.timestamp)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: 13, color: conv.unreadCount > 0 ? 'var(--slate-light)' : 'var(--slate)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                  }}>
                    {conv.lastMessage.direction === 'outgoing' ? 'You: ' : ''}
                    {conv.lastMessage.text}
                  </span>
                  {conv.unreadCount > 0 && (
                    <span style={{
                      background: 'var(--amber)', color: 'var(--navy)',
                      borderRadius: 10, fontSize: 11, fontWeight: 700,
                      padding: '1px 6px', marginLeft: 8, flexShrink: 0,
                    }}>{conv.unreadCount}</span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: 'var(--slate)', marginTop: 2 }}>{conv.pageName}</div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowNewModal(true)}
        style={{
          position: 'fixed', bottom: 72, right: 20,
          width: 52, height: 52, borderRadius: '50%',
          background: 'var(--amber)', color: 'var(--navy)',
          fontSize: 26, fontWeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(245,166,35,0.4)',
          zIndex: 100,
        }}
      >+</button>

      {/* New Conversation Modal */}
      {showNewModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'flex-end', zIndex: 200,
        }} onClick={() => setShowNewModal(false)}>
          <div
            style={{
              background: 'var(--navy-light)', borderRadius: '20px 20px 0 0',
              padding: 24, width: '100%', maxHeight: '80vh', overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20, color: 'var(--white)' }}>New Conversation</h3>

            <label style={{ fontSize: 12, color: 'var(--slate)', fontWeight: 600, display: 'block', marginBottom: 6 }}>CHANNEL</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {CHANNEL_OPTIONS.map(opt => (
                <button
                  key={opt.type}
                  onClick={() => setNewChannel(opt.type)}
                  style={{
                    padding: '6px 12px', borderRadius: 16, fontSize: 12, fontWeight: 600,
                    background: newChannel === opt.type ? 'var(--amber)' : 'var(--surface-2)',
                    color: newChannel === opt.type ? 'var(--navy)' : 'var(--slate)',
                    border: `1px solid ${newChannel === opt.type ? 'var(--amber)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <ChannelBadge channel={opt.type} size="sm" />
                  {opt.label}
                </button>
              ))}
            </div>

            <label style={{ fontSize: 12, color: 'var(--slate)', fontWeight: 600, display: 'block', marginBottom: 6 }}>CONTACT NAME</label>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="e.g. John Smith"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 10,
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                color: 'var(--white)', fontSize: 14, marginBottom: 16,
              }}
            />

            <label style={{ fontSize: 12, color: 'var(--slate)', fontWeight: 600, display: 'block', marginBottom: 6 }}>OPENING MESSAGE</label>
            <textarea
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type your first message..."
              rows={3}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 10,
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                color: 'var(--white)', fontSize: 14, resize: 'none', marginBottom: 20,
              }}
            />

            <button
              onClick={handleCreateConversation}
              disabled={!newName.trim() || !newMessage.trim()}
              style={{
                width: '100%', padding: '14px', borderRadius: 12,
                background: newName.trim() && newMessage.trim() ? 'var(--amber)' : 'var(--surface-2)',
                color: newName.trim() && newMessage.trim() ? 'var(--navy)' : 'var(--slate)',
                fontSize: 15, fontWeight: 700,
              }}
            >Start Conversation</button>
          </div>
        </div>
      )}
    </div>
  );
}
