import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { ChannelCredentials } from '../lib/types';

// ─── Shared helpers ───────────────────────────────────────────────────────────

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
            color: 'var(--white)', fontSize: 13,
            fontFamily: value.trim() && secret && !show ? 'monospace' : 'inherit',
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

// ─── Generic step-by-step guide component ────────────────────────────────────

interface Step {
  num: number;
  title: string;
  detail: string;
  link?: string | null;
  linkLabel?: string | null;
}

interface SetupGuideProps {
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  label: string;
  notice?: React.ReactNode;
  steps: Step[];
  footer?: React.ReactNode;
}

function SetupGuide({ accentColor, accentBg, accentBorder, label, notice, steps, footer }: SetupGuideProps) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      marginBottom: 18, borderRadius: 12,
      border: `1px solid ${accentBorder}`,
      background: accentBg,
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '11px 14px', textAlign: 'left', gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>📋</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: accentColor }}>{label}</span>
        </div>
        <span style={{ color: 'var(--slate)', fontSize: 13, flexShrink: 0 }}>
          {open ? 'Hide ▲' : 'Show ▼'}
        </span>
      </button>

      {open && (
        <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${accentBorder}` }}>
          {notice && <div style={{ marginTop: 12, marginBottom: 14 }}>{notice}</div>}

          {steps.map(step => (
            <div key={step.num} style={{
              display: 'flex', gap: 12, marginBottom: 14,
              paddingBottom: 14,
              borderBottom: step.num < steps.length ? '1px solid rgba(255,255,255,0.05)' : 'none',
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                background: `${accentColor}22`,
                border: `1px solid ${accentColor}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: accentColor, marginTop: 1,
              }}>{step.num}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--white)', marginBottom: 4 }}>
                  {step.title}
                </p>
                <p style={{ fontSize: 12, color: 'var(--slate)', lineHeight: 1.6 }}>
                  {step.detail}
                </p>
                {step.link && (
                  <a
                    href={step.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontSize: 12, color: accentColor, marginTop: 5, textDecoration: 'none',
                    }}
                  >
                    🔗 {step.linkLabel} ↗
                  </a>
                )}
              </div>
            </div>
          ))}

          {footer}
        </div>
      )}
    </div>
  );
}

// ─── Facebook setup guide ─────────────────────────────────────────────────────

const FB_STEPS: Step[] = [
  {
    num: 1,
    title: 'Create a Facebook Developer account',
    detail: 'Go to developers.facebook.com and log in with your personal Facebook account. Click "Get Started" to register as a developer if you haven\'t already. This is free.',
    link: 'https://developers.facebook.com',
    linkLabel: 'developers.facebook.com',
  },
  {
    num: 2,
    title: 'Create a Meta App',
    detail: 'Click "My Apps" → "Create App". Choose "Business" as the use case. Give it a name (e.g. "SocialsUnited") and link it to your Facebook Business account.',
    link: 'https://developers.facebook.com/apps/create/',
    linkLabel: 'Create a Meta App',
  },
  {
    num: 3,
    title: 'Add the Messenger product',
    detail: 'Inside your new app, click "Add Product" and select "Messenger". This enables the Messenger API for your app.',
    link: 'https://developers.facebook.com/docs/messenger-platform/getting-started/app-setup',
    linkLabel: 'Messenger Platform: App Setup',
  },
  {
    num: 4,
    title: 'Connect your Facebook Page',
    detail: 'In the Messenger settings, under "Access Tokens", click "Add or Remove Pages" and select the Facebook Page you use for your business. This links your Page to the app.',
    link: null,
  },
  {
    num: 5,
    title: 'Generate a Page Access Token',
    detail: 'Once your Page is linked, click "Generate Token" next to it. Copy this token — it is your Page Access Token. For production use, you should exchange this for a long-lived token via the Graph API Explorer.',
    link: 'https://developers.facebook.com/tools/explorer/',
    linkLabel: 'Graph API Explorer',
  },
  {
    num: 6,
    title: 'Find your App ID, App Secret, and Page ID',
    detail: 'App ID and App Secret are in App Settings → Basic. Your Page ID is found in your Facebook Page Settings → About, or by visiting your Page and looking at the URL (the number in the URL is your Page ID).',
    link: null,
  },
  {
    num: 7,
    title: 'Set up a webhook for incoming messages',
    detail: 'In Messenger → Settings → Webhooks, enter SocialsUnited\'s webhook URL (provided once the backend is deployed) and subscribe to the "messages" and "messaging_postbacks" fields. Page Comments use the "feed" subscription.',
    link: 'https://developers.facebook.com/docs/messenger-platform/webhooks',
    linkLabel: 'Messenger Webhooks Docs',
  },
  {
    num: 8,
    title: 'Submit your app for review (for live use)',
    detail: 'While in Development Mode, only you and app admins can send messages. To receive messages from any customer, submit your app for Meta App Review and request the "pages_messaging" permission. This is a one-time process.',
    link: 'https://developers.facebook.com/docs/app-review',
    linkLabel: 'Meta App Review',
  },
];

function FacebookSetupGuide() {
  return (
    <SetupGuide
      accentColor="#1877F2"
      accentBg="rgba(24,119,242,0.04)"
      accentBorder="rgba(24,119,242,0.2)"
      label="Step-by-step setup guide"
      notice={
        <div style={{
          padding: '10px 12px', borderRadius: 10,
          background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)',
        }}>
          <p style={{ fontSize: 12, color: 'var(--slate-light)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--amber)' }}>Note:</strong> The same Facebook App covers both Messenger and Page Comments.
            You only need one set of credentials for both channels.
          </p>
        </div>
      }
      steps={FB_STEPS}
      footer={
        <div style={{
          padding: '10px 12px', borderRadius: 10,
          background: 'rgba(24,119,242,0.06)', border: '1px solid rgba(24,119,242,0.15)',
        }}>
          <p style={{ fontSize: 12, color: 'var(--slate-light)', lineHeight: 1.6 }}>
            <strong style={{ color: '#1877F2' }}>Cost:</strong> The Facebook Messenger API is free to use.
            There are no per-message charges from Meta. You only pay for your hosting (SocialsUnited's backend server).
          </p>
        </div>
      }
    />
  );
}

// ─── WhatsApp setup guide ─────────────────────────────────────────────────────

const WA_STEPS: Step[] = [
  {
    num: 1,
    title: 'Create a Facebook Business Manager account',
    detail: 'Go to business.facebook.com and create a free Business Manager account if you don\'t already have one. This is required by Meta to access the WhatsApp Cloud API.',
    link: 'https://business.facebook.com',
    linkLabel: 'business.facebook.com',
  },
  {
    num: 2,
    title: 'Get a dedicated phone number',
    detail: 'You need a phone number that is NOT already registered to a personal WhatsApp or WhatsApp Business App account. A new SIM card or a VoIP number (e.g. from Vonage or Twilio) works well. You\'ll receive a verification code on this number.',
    link: null,
  },
  {
    num: 3,
    title: 'Create a Meta Developer App',
    detail: 'Go to developers.facebook.com, click "Create App", choose "Business" as the type, and add the WhatsApp product to your app.',
    link: 'https://developers.facebook.com/apps/create/',
    linkLabel: 'Create a Meta App',
  },
  {
    num: 4,
    title: 'Add a WhatsApp Business Account (WABA) and verify your number',
    detail: 'Inside your Meta App, go to WhatsApp → Getting Started. Follow the prompts to create or connect a WhatsApp Business Account and add your phone number. Meta will send a verification code to your number.',
    link: 'https://developers.facebook.com/docs/whatsapp/cloud-api/get-started',
    linkLabel: 'WhatsApp Cloud API: Get Started',
  },
  {
    num: 5,
    title: 'Generate a System User Access Token',
    detail: 'In Business Manager, go to Settings → System Users. Create a System User, assign it "Admin" access to your WhatsApp Business Account, then generate a token with the whatsapp_business_messaging and whatsapp_business_management permissions.',
    link: 'https://business.facebook.com/settings/system-users',
    linkLabel: 'Business Manager: System Users',
  },
  {
    num: 6,
    title: 'Set up a webhook',
    detail: 'SocialsUnited needs a public webhook URL to receive incoming WhatsApp messages. Once SocialsUnited\'s backend is deployed, paste its webhook URL into your Meta App under WhatsApp → Configuration. Choose a Webhook Verify Token (any secret string you invent) and enter it here too.',
    link: 'https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks',
    linkLabel: 'Setting up Webhooks',
  },
  {
    num: 7,
    title: 'Enter your credentials below and save',
    detail: 'Copy your Phone Number ID, Access Token, Webhook Verify Token, and Business Account ID from the Meta Developer dashboard and paste them into the fields below.',
    link: null,
  },
];

function WhatsAppSetupGuide() {
  return (
    <SetupGuide
      accentColor="#25D366"
      accentBg="rgba(37,211,102,0.04)"
      accentBorder="rgba(37,211,102,0.2)"
      label="Step-by-step setup guide"
      notice={
        <div style={{
          padding: '10px 12px', borderRadius: 10,
          background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)',
        }}>
          <p style={{ fontSize: 12, color: 'var(--slate-light)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--amber)' }}>Important:</strong> Standard (personal) WhatsApp cannot be connected via an API — Meta only allows the WhatsApp Cloud API for business use.
            The first 1,000 customer-initiated conversations per month are <strong style={{ color: 'var(--white)' }}>free</strong>.
          </p>
        </div>
      }
      steps={WA_STEPS}
      footer={
        <div style={{
          padding: '10px 12px', borderRadius: 10,
          background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.15)',
        }}>
          <p style={{ fontSize: 12, color: 'var(--slate-light)', lineHeight: 1.6 }}>
            <strong style={{ color: '#25D366' }}>Pricing:</strong> Meta charges per conversation (24-hour window), not per message.
            Business-initiated conversations cost approx. £0.04–£0.07 each.
            Customer-initiated conversations are free for the first 1,000/month, then approx. £0.02–£0.04 each.
            For most sole-trader tradespeople, the monthly cost is under £5.
          </p>
        </div>
      }
    />
  );
}

// ─── Twilio SMS setup guide ───────────────────────────────────────────────────

const TWILIO_STEPS: Step[] = [
  {
    num: 1,
    title: 'Create a Twilio account',
    detail: 'Go to twilio.com and sign up for a free account. You\'ll get a trial credit to test with. No credit card is required for the trial.',
    link: 'https://www.twilio.com/try-twilio',
    linkLabel: 'Sign up for Twilio',
  },
  {
    num: 2,
    title: 'Verify your personal phone number',
    detail: 'During sign-up, Twilio asks you to verify a personal phone number. This is just for account security — it is not the number your customers will text.',
    link: null,
  },
  {
    num: 3,
    title: 'Get a Twilio phone number',
    detail: 'In the Twilio Console, go to Phone Numbers → Manage → Buy a Number. Search for a UK number (+44) with SMS capability. Numbers cost approximately £1/month. This is the number your customers will text.',
    link: 'https://console.twilio.com/us1/develop/phone-numbers/manage/search',
    linkLabel: 'Buy a Twilio Number',
  },
  {
    num: 4,
    title: 'Find your Account SID and Auth Token',
    detail: 'On the Twilio Console homepage, you\'ll see your Account SID and Auth Token. Click the eye icon to reveal the Auth Token. These are your credentials — keep the Auth Token private.',
    link: 'https://console.twilio.com',
    linkLabel: 'Twilio Console',
  },
  {
    num: 5,
    title: 'Configure your webhook for incoming SMS',
    detail: 'In Phone Numbers → Manage → Active Numbers, click your number. Under "Messaging Configuration", set the "A message comes in" webhook URL to SocialsUnited\'s SMS webhook endpoint (provided once the backend is deployed). Set the method to HTTP POST.',
    link: 'https://www.twilio.com/docs/sms/tutorials/how-to-receive-and-reply',
    linkLabel: 'Twilio: Receive and Reply to SMS',
  },
  {
    num: 6,
    title: 'Upgrade from trial (for live use)',
    detail: 'Twilio trial accounts can only send SMS to verified numbers. To send to any customer, you need to upgrade to a paid account (add a credit card and top up your balance). Twilio charges per SMS sent — approximately £0.04 per outbound message in the UK.',
    link: 'https://support.twilio.com/hc/en-us/articles/223136107-How-does-Twilio-s-Free-Trial-work-',
    linkLabel: 'Twilio Trial vs Paid',
  },
  {
    num: 7,
    title: 'Enter your credentials below and save',
    detail: 'Paste your Account SID, Auth Token, and Twilio phone number (in +44 format) into the fields below.',
    link: null,
  },
];

function TwilioSetupGuide() {
  return (
    <SetupGuide
      accentColor="#F22F46"
      accentBg="rgba(242,47,70,0.04)"
      accentBorder="rgba(242,47,70,0.2)"
      label="Step-by-step setup guide"
      notice={
        <div style={{
          padding: '10px 12px', borderRadius: 10,
          background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)',
        }}>
          <p style={{ fontSize: 12, color: 'var(--slate-light)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--amber)' }}>Note:</strong> Twilio is the recommended SMS provider for SocialsUnited.
            It supports two-way SMS, has excellent UK coverage, and integrates cleanly via a simple REST API.
          </p>
        </div>
      }
      steps={TWILIO_STEPS}
      footer={
        <div style={{
          padding: '10px 12px', borderRadius: 10,
          background: 'rgba(242,47,70,0.06)', border: '1px solid rgba(242,47,70,0.15)',
        }}>
          <p style={{ fontSize: 12, color: 'var(--slate-light)', lineHeight: 1.6 }}>
            <strong style={{ color: '#F22F46' }}>Pricing:</strong> Twilio charges approximately £0.04 per outbound SMS and £0.01 per inbound SMS in the UK, plus £1/month for the phone number.
            For a tradesperson receiving and sending ~200 messages/month, the total cost is typically under £10/month.
          </p>
        </div>
      }
    />
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
            Enter your API credentials below to connect SocialsUnited to your live channels.
            Each section includes a step-by-step setup guide. All credentials are stored locally on your device.
          </p>
        </div>

        {/* ── Facebook ── */}
        <div style={{ marginBottom: 12, background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <button
            onClick={() => {}}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', textAlign: 'left', cursor: 'default' }}
          >
            <div style={{
              width: 38, height: 38, borderRadius: 10, background: 'var(--surface-2)',
              border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 20, flexShrink: 0,
            }}>📘</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--white)', marginBottom: 3 }}>Facebook</div>
              <div style={{ fontSize: 12, color: 'var(--slate)' }}>Messenger + Page Comments</div>
            </div>
            <StatusPill connected={isConnected(fb)} />
          </button>

          <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)' }}>
            <a
              href="https://developers.facebook.com/docs/messenger-platform/getting-started/app-setup"
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--amber)', margin: '12px 0 16px', textDecoration: 'none' }}
            >
              📖 Facebook Developer Docs ↗
            </a>

            <FacebookSetupGuide />

            <Field label="APP ID" hint="Found in your Facebook App dashboard under App Settings → Basic." value={fb.appId} onChange={v => setFb(p => ({ ...p, appId: v }))} placeholder="123456789012345" />
            <Field label="APP SECRET" hint="Found in App Settings → Basic. Keep this private." value={fb.appSecret} onChange={v => setFb(p => ({ ...p, appSecret: v }))} secret placeholder="abc123..." />
            <Field label="PAGE ACCESS TOKEN" hint="Generate a long-lived Page Access Token via the Graph API Explorer for your Facebook Page." value={fb.pageAccessToken} onChange={v => setFb(p => ({ ...p, pageAccessToken: v }))} secret placeholder="EAABsbCS..." />
            <Field label="PAGE ID" hint="Your Facebook Page's numeric ID. Found in Page Settings → About." value={fb.pageId} onChange={v => setFb(p => ({ ...p, pageId: v }))} placeholder="123456789" />
          </div>
        </div>

        {/* ── WhatsApp ── */}
        <div style={{ marginBottom: 12, background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <button
            onClick={() => {}}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', textAlign: 'left', cursor: 'default' }}
          >
            <div style={{
              width: 38, height: 38, borderRadius: 10, background: 'var(--surface-2)',
              border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 20, flexShrink: 0,
            }}>💬</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--white)', marginBottom: 3 }}>WhatsApp Business</div>
              <div style={{ fontSize: 12, color: 'var(--slate)' }}>WhatsApp Cloud API (Meta) — requires a dedicated number</div>
            </div>
            <StatusPill connected={isConnected(wa)} />
          </button>

          <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)' }}>
            <a
              href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--amber)', margin: '12px 0 16px', textDecoration: 'none' }}
            >
              📖 WhatsApp Cloud API Docs ↗
            </a>

            <WhatsAppSetupGuide />

            <Field label="PHONE NUMBER ID" hint="Found in Meta Developer App → WhatsApp → API Setup." value={wa.phoneNumberId} onChange={v => setWa(p => ({ ...p, phoneNumberId: v }))} placeholder="123456789012345" />
            <Field label="ACCESS TOKEN" hint="A System User access token with whatsapp_business_messaging permission." value={wa.accessToken} onChange={v => setWa(p => ({ ...p, accessToken: v }))} secret placeholder="EAABsbCS..." />
            <Field label="WEBHOOK VERIFY TOKEN" hint="A secret string you choose yourself — enter the same string in your Meta App webhook config." value={wa.webhookVerifyToken} onChange={v => setWa(p => ({ ...p, webhookVerifyToken: v }))} secret placeholder="my_secret_verify_token" />
            <Field label="BUSINESS ACCOUNT ID" hint="Your WABA ID. Found in Meta Business Suite → Business Settings → WhatsApp Accounts." value={wa.businessAccountId} onChange={v => setWa(p => ({ ...p, businessAccountId: v }))} placeholder="987654321098765" />
          </div>
        </div>

        {/* ── Twilio SMS ── */}
        <div style={{ marginBottom: 12, background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <button
            onClick={() => {}}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', textAlign: 'left', cursor: 'default' }}
          >
            <div style={{
              width: 38, height: 38, borderRadius: 10, background: 'var(--surface-2)',
              border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 20, flexShrink: 0,
            }}>📲</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--white)', marginBottom: 3 }}>SMS via Twilio</div>
              <div style={{ fontSize: 12, color: 'var(--slate)' }}>Two-way SMS messaging</div>
            </div>
            <StatusPill connected={isConnected(tw)} />
          </button>

          <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)' }}>
            <a
              href="https://www.twilio.com/docs/sms/quickstart"
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--amber)', margin: '12px 0 16px', textDecoration: 'none' }}
            >
              📖 Twilio SMS Quickstart ↗
            </a>

            <TwilioSetupGuide />

            <Field label="ACCOUNT SID" hint="Your Twilio Account SID. Found on the Twilio Console dashboard." value={tw.accountSid} onChange={v => setTw(p => ({ ...p, accountSid: v }))} placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
            <Field label="AUTH TOKEN" hint="Your Twilio Auth Token. Found on the Twilio Console dashboard. Keep this private." value={tw.authToken} onChange={v => setTw(p => ({ ...p, authToken: v }))} secret placeholder="your_auth_token" />
            <Field label="TWILIO PHONE NUMBER" hint="Your Twilio SMS-enabled phone number in E.164 format." value={tw.phoneNumber} onChange={v => setTw(p => ({ ...p, phoneNumber: v }))} placeholder="+441234567890" />
          </div>
        </div>

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
