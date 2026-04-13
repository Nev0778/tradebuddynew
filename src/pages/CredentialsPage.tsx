import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { ChannelCredentials } from '../lib/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isConnected(vals: Record<string, string>): boolean {
  return Object.values(vals).every(v => v.trim().length > 0);
}

function StatusPill({ connected }: { connected: boolean }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 8,
      background: connected ? 'rgba(34,197,94,0.15)' : 'rgba(245,166,35,0.12)',
      color: connected ? '#22C55E' : 'var(--amber)',
      border: `1px solid ${connected ? 'rgba(34,197,94,0.3)' : 'rgba(245,166,35,0.3)'}`,
    }}>
      {connected ? '● Connected' : '○ Not set'}
    </span>
  );
}

interface FieldProps {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  secret?: boolean;
  placeholder?: string;
}

function Field({ label, hint, value, onChange, secret = false, placeholder }: FieldProps) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate)', letterSpacing: 0.5, display: 'block', marginBottom: 5 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={secret && !show ? 'password' : 'text'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder ?? `Enter ${label.toLowerCase()}`}
          autoComplete="off"
          spellCheck={false}
          style={{
            width: '100%', padding: secret ? '10px 40px 10px 12px' : '10px 12px',
            borderRadius: 10, background: 'var(--surface)',
            border: `1px solid ${value.trim() ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
            color: 'var(--white)', fontSize: 13, fontFamily: value.trim() && secret && !show ? 'monospace' : 'inherit',
          }}
        />
        {secret && (
          <button
            onClick={() => setShow(s => !s)}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate)', fontSize: 14 }}
          >
            {show ? '🙈' : '👁️'}
          </button>
        )}
      </div>
      <p style={{ fontSize: 11, color: 'var(--slate)', marginTop: 4, lineHeight: 1.5 }}>{hint}</p>
    </div>
  );
}

interface SectionProps {
  icon: string;
  title: string;
  subtitle: string;
  connected: boolean;
  children: React.ReactNode;
  docsUrl: string;
  docsLabel: string;
}

function Section({ icon, title, subtitle, connected, children, docsUrl, docsLabel }: SectionProps) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 12, background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px', textAlign: 'left',
        }}
      >
        <div style={{
          width: 38, height: 38, borderRadius: 10, background: 'var(--surface-2)',
          border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 20, flexShrink: 0,
        }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--white)', marginBottom: 3 }}>{title}</div>
          <div style={{ fontSize: 12, color: 'var(--slate)' }}>{subtitle}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
          <StatusPill connected={connected} />
          <span style={{ color: 'var(--slate)', fontSize: 14 }}>{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)' }}>
          <a
            href={docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 12, color: 'var(--amber)', marginTop: 12, marginBottom: 16,
              textDecoration: 'none',
            }}
          >
            📖 {docsLabel} ↗
          </a>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function CredentialsPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const creds = state.settings.credentials;

  const [fb, setFb] = useState({ ...creds.facebook });
  const [wa, setWa] = useState({ ...creds.whatsapp });
  const [tw, setTw] = useState({ ...creds.twilio });
  const [saved, setSaved] = useState(false);

  function handleSave() {
    const updated: ChannelCredentials = { facebook: fb, whatsapp: wa, twilio: tw };
    dispatch({ type: 'UPDATE_SETTINGS', settings: { credentials: updated } });
    setSaved(true);
    setTimeout(() => { setSaved(false); navigate('/settings'); }, 1200);
  }

  const anyChanged =
    JSON.stringify(fb) !== JSON.stringify(creds.facebook) ||
    JSON.stringify(wa) !== JSON.stringify(creds.whatsapp) ||
    JSON.stringify(tw) !== JSON.stringify(creds.twilio);

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
        background: 'var(--navy-light)', borderBottom: '1px solid var(--border)', flexShrink: 0,
      }}>
        <button onClick={() => navigate('/settings')} style={{ color: 'var(--amber)', fontSize: 22, lineHeight: 1 }}>‹</button>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--white)', flex: 1 }}>Channel Credentials</h2>
      </div>

      <div style={{ padding: 16 }}>
        {/* Info banner */}
        <div style={{
          padding: '12px 14px', borderRadius: 12, marginBottom: 16,
          background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)',
        }}>
          <p style={{ fontSize: 12, color: 'var(--slate-light)', lineHeight: 1.6 }}>
            Enter your API credentials below to connect TradeBuddy to your live channels.
            All credentials are stored locally on your device and never sent to any server.
          </p>
        </div>

        {/* Facebook / Messenger / Page Comments */}
        <Section
          icon="📘"
          title="Facebook"
          subtitle="Messenger + Page Comments"
          connected={isConnected(fb)}
          docsUrl="https://developers.facebook.com/docs/messenger-platform/getting-started/app-setup"
          docsLabel="Facebook Developer Docs"
        >
          <Field
            label="APP ID"
            hint="Found in your Facebook App dashboard under App Settings → Basic."
            value={fb.appId}
            onChange={v => setFb(p => ({ ...p, appId: v }))}
            placeholder="123456789012345"
          />
          <Field
            label="APP SECRET"
            hint="Found in App Settings → Basic. Keep this private — never share it."
            value={fb.appSecret}
            onChange={v => setFb(p => ({ ...p, appSecret: v }))}
            secret
            placeholder="abc123..."
          />
          <Field
            label="PAGE ACCESS TOKEN"
            hint="Generate a long-lived Page Access Token via the Graph API Explorer for your Facebook Page."
            value={fb.pageAccessToken}
            onChange={v => setFb(p => ({ ...p, pageAccessToken: v }))}
            secret
            placeholder="EAABsbCS..."
          />
          <Field
            label="PAGE ID"
            hint="Your Facebook Page's numeric ID. Found in Page Settings → About, or via the Graph API."
            value={fb.pageId}
            onChange={v => setFb(p => ({ ...p, pageId: v }))}
            placeholder="123456789"
          />
        </Section>

        {/* WhatsApp Business */}
        <Section
          icon="💬"
          title="WhatsApp Business"
          subtitle="WhatsApp Business API (Meta Cloud)"
          connected={isConnected(wa)}
          docsUrl="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
          docsLabel="WhatsApp Cloud API Docs"
        >
          <Field
            label="PHONE NUMBER ID"
            hint="The numeric ID of your WhatsApp Business phone number. Found in Meta Business Suite → WhatsApp → Phone Numbers."
            value={wa.phoneNumberId}
            onChange={v => setWa(p => ({ ...p, phoneNumberId: v }))}
            placeholder="123456789012345"
          />
          <Field
            label="ACCESS TOKEN"
            hint="A System User access token with whatsapp_business_messaging permission from Meta Business Manager."
            value={wa.accessToken}
            onChange={v => setWa(p => ({ ...p, accessToken: v }))}
            secret
            placeholder="EAABsbCS..."
          />
          <Field
            label="WEBHOOK VERIFY TOKEN"
            hint="A custom string you create. Used to verify webhook callbacks from Meta. Keep it secret."
            value={wa.webhookVerifyToken}
            onChange={v => setWa(p => ({ ...p, webhookVerifyToken: v }))}
            secret
            placeholder="my_verify_token_123"
          />
          <Field
            label="BUSINESS ACCOUNT ID"
            hint="Your WhatsApp Business Account (WABA) ID. Found in Meta Business Suite → Business Settings."
            value={wa.businessAccountId}
            onChange={v => setWa(p => ({ ...p, businessAccountId: v }))}
            placeholder="987654321098765"
          />
        </Section>

        {/* Twilio SMS */}
        <Section
          icon="📲"
          title="SMS via Twilio"
          subtitle="Two-way SMS messaging"
          connected={isConnected(tw)}
          docsUrl="https://www.twilio.com/docs/sms/quickstart"
          docsLabel="Twilio SMS Quickstart"
        >
          <Field
            label="ACCOUNT SID"
            hint="Your Twilio Account SID. Found on the Twilio Console dashboard."
            value={tw.accountSid}
            onChange={v => setTw(p => ({ ...p, accountSid: v }))}
            placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          />
          <Field
            label="AUTH TOKEN"
            hint="Your Twilio Auth Token. Found on the Twilio Console dashboard. Keep this private."
            value={tw.authToken}
            onChange={v => setTw(p => ({ ...p, authToken: v }))}
            secret
            placeholder="your_auth_token"
          />
          <Field
            label="TWILIO PHONE NUMBER"
            hint="Your Twilio SMS-enabled phone number in E.164 format."
            value={tw.phoneNumber}
            onChange={v => setTw(p => ({ ...p, phoneNumber: v }))}
            placeholder="+441234567890"
          />
        </Section>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!anyChanged && !saved}
          style={{
            width: '100%', padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 700,
            marginTop: 8, marginBottom: 32,
            background: saved ? '#22C55E' : (anyChanged ? 'var(--amber)' : 'var(--surface-2)'),
            color: saved ? '#fff' : (anyChanged ? 'var(--navy)' : 'var(--slate)'),
            transition: 'background 0.2s',
          }}
        >
          {saved ? '✓ Credentials Saved!' : 'Save Credentials'}
        </button>
      </div>
    </div>
  );
}
