import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

interface SettingsRowProps {
  icon: string;
  label: string;
  subtitle?: string;
  onClick: () => void;
  value?: string;
}

function SettingsRow({ icon, label, subtitle, onClick, value }: SettingsRowProps) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 20px', borderBottom: '1px solid var(--border)',
        background: 'transparent', textAlign: 'left', transition: 'background 0.1s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--white)' }}>{label}</div>
        {subtitle && <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 2 }}>{subtitle}</div>}
      </div>
      {value && <span style={{ fontSize: 13, color: 'var(--amber)', marginRight: 4 }}>{value}</span>}
      <span style={{ color: 'var(--slate)', fontSize: 18 }}>›</span>
    </button>
  );
}

export function SettingsPage() {
  const { state } = useApp();
  const navigate = useNavigate();

  const creds = state.settings.credentials;
  const connectedCount = [
    Object.values(creds.facebook).every(v => v.trim()),
    Object.values(creds.whatsapp).every(v => v.trim()),
    Object.values(creds.twilio).every(v => v.trim()),
  ].filter(Boolean).length;
  const credentialStatus = connectedCount === 0 ? 'Not set' : `${connectedCount}/3 connected`;

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      {/* Business card */}
      <div style={{
        margin: 16, padding: 16, borderRadius: 14,
        background: 'linear-gradient(135deg, var(--navy-mid) 0%, var(--navy-light) 100%)',
        border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, background: 'var(--amber)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 700, color: 'var(--navy)', flexShrink: 0,
        }}>
          {state.settings.businessName.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--white)' }}>{state.settings.businessName}</div>
          <div style={{ fontSize: 13, color: 'var(--slate)', marginTop: 2, textTransform: 'capitalize' }}>
            {state.settings.tradeType}
          </div>
        </div>
      </div>

      {/* Settings sections */}
      <div style={{ margin: '0 16px 8px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate)', letterSpacing: 1, padding: '8px 4px 6px' }}>
          PROFILE
        </p>
        <div style={{ background: 'var(--surface)', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)' }}>
          <SettingsRow
            icon="🏢"
            label="Business Profile"
            subtitle="Name, trade type, contact details"
            value={state.settings.businessName}
            onClick={() => navigate('/settings/business-profile')}
          />
        </div>
      </div>

      <div style={{ margin: '0 16px 8px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate)', letterSpacing: 1, padding: '8px 4px 6px' }}>
          MESSAGING
        </p>
        <div style={{ background: 'var(--surface)', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)' }}>
          <SettingsRow
            icon="⚡"
            label="Quick Reply Templates"
            subtitle="Manage your saved reply templates"
            value={`${state.settings.quickReplies.length} templates`}
            onClick={() => navigate('/settings/quick-replies')}
          />
          <SettingsRow
            icon="🤖"
            label="Auto-Reply"
            subtitle="Automatic responses when you're busy"
            value={state.settings.autoReply.enabled ? 'On' : 'Off'}
            onClick={() => navigate('/settings/auto-reply')}
          />
        </div>
      </div>

      <div style={{ margin: '0 16px 8px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate)', letterSpacing: 1, padding: '8px 4px 6px' }}>
          CHANNELS
        </p>
        <div style={{ background: 'var(--surface)', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)' }}>
          <SettingsRow
            icon="🔑"
            label="API Credentials"
            subtitle="Facebook, WhatsApp & SMS keys"
            value={credentialStatus}
            onClick={() => navigate('/settings/credentials')}
          />
        </div>
      </div>

      {/* About */}
      <div style={{ margin: '8px 16px 32px', padding: '16px 20px', borderRadius: 14, background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--white)', marginBottom: 4 }}>TradeBuddy</div>
        <div style={{ fontSize: 12, color: 'var(--slate)', lineHeight: 1.6 }}>
          Version 1.0.0 (Demo)<br />
          Unified messaging for tradespeople<br />
          Built by Procimate UK Ltd
        </div>
      </div>
    </div>
  );
}
