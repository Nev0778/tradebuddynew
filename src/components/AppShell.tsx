import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function AppShell() {
  const { totalUnread, state } = useApp();
  const location = useLocation();
  const isSettings = location.pathname.startsWith('/settings');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--navy)' }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', background: 'var(--navy-light)',
        borderBottom: '1px solid var(--border)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: 'var(--amber)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700, color: 'var(--navy)',
          }}>T</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--white)', lineHeight: 1.2 }}>TradeBuddy</div>
            <div style={{ fontSize: 11, color: 'var(--slate)', lineHeight: 1.2 }}>{state.settings.businessName}</div>
          </div>
        </div>
        {totalUnread > 0 && (
          <div style={{
            background: 'var(--amber)', color: 'var(--navy)', borderRadius: 12,
            padding: '2px 8px', fontSize: 12, fontWeight: 700,
          }}>
            {totalUnread} unread
          </div>
        )}
      </header>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>

      {/* Tab bar */}
      <nav style={{
        display: 'flex', background: 'var(--navy-light)',
        borderTop: '1px solid var(--border)', flexShrink: 0,
      }}>
        <NavLink to="/inbox" style={({ isActive }) => tabStyle(isActive && !isSettings)}>
          <InboxIcon />
          <span style={{ fontSize: 11, marginTop: 2 }}>Inbox</span>
          {totalUnread > 0 && (
            <span style={{
              position: 'absolute', top: 6, right: '50%', transform: 'translateX(8px)',
              background: 'var(--amber)', color: 'var(--navy)',
              borderRadius: 8, fontSize: 9, fontWeight: 700, padding: '1px 4px', minWidth: 14, textAlign: 'center',
            }}>{totalUnread}</span>
          )}
        </NavLink>
        <NavLink to="/settings" style={({ isActive }) => tabStyle(isActive)}>
          <SettingsIcon />
          <span style={{ fontSize: 11, marginTop: 2 }}>Settings</span>
        </NavLink>
      </nav>
    </div>
  );
}

function tabStyle(isActive: boolean): React.CSSProperties {
  return {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '10px 0 12px',
    color: isActive ? 'var(--amber)' : 'var(--slate)',
    position: 'relative', transition: 'color 0.15s',
    textDecoration: 'none',
  };
}

function InboxIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}
