import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, API_BASE } from '../lib/api';

interface FacebookPage {
  id: string;
  name: string;
  token: string;
}

export function FacebookOAuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'select_page' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const success = params.get('success');
    const pageName = params.get('page_name');
    const pagesParam = params.get('pages');

    if (error) {
      let friendlyError = 'Connection failed. Please try again.';
      if (error === 'no_pages') {
        friendlyError = 'No Facebook Pages found on your account. You need a Facebook Page (not a personal profile) to connect.';
      } else if (error === 'invalid_session') {
        friendlyError = 'Your session expired. Please log in again.';
      } else if (error.includes('cancelled')) {
        friendlyError = 'You cancelled the Facebook login. Please try again.';
      }
      setStatus('error');
      setMessage(friendlyError);
      return;
    }

    if (pagesParam) {
      // Multiple pages — show picker
      try {
        const decoded = JSON.parse(atob(pagesParam.replace(/-/g, '+').replace(/_/g, '/'))) as FacebookPage[];
        setPages(decoded);
        setStatus('select_page');
      } catch {
        setStatus('error');
        setMessage('Failed to load your pages. Please try again.');
      }
      return;
    }

    if (success && pageName) {
      setStatus('success');
      setMessage(decodeURIComponent(pageName));
      setTimeout(() => navigate('/settings/credentials'), 2500);
      return;
    }

    setStatus('error');
    setMessage('Unexpected response from Facebook. Please try again.');
  }, [navigate]);

  async function handleSelectPage(page: FacebookPage) {
    const token = getToken();
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/oauth/facebook/select-page`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pageId: page.id,
          pageName: page.name,
          pageToken: page.token,
        }),
      });
      if (!res.ok) throw new Error('Failed to save page');
      setStatus('success');
      setMessage(page.name);
      setTimeout(() => navigate('/settings/credentials'), 2500);
    } catch {
      setStatus('error');
      setMessage('Failed to save your page selection. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--navy)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: 'var(--surface)',
        borderRadius: 20,
        padding: 32,
        maxWidth: 400,
        width: '100%',
        textAlign: 'center',
        border: '1px solid var(--border)',
      }}>
        {status === 'loading' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <h2 style={{ color: 'var(--white)', fontSize: 20, marginBottom: 8 }}>Connecting Facebook…</h2>
            <p style={{ color: 'var(--slate)', fontSize: 14 }}>Please wait while we set up your account.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 style={{ color: 'var(--white)', fontSize: 20, marginBottom: 8 }}>Facebook Connected!</h2>
            <p style={{ color: 'var(--slate)', fontSize: 14 }}>
              Your page <strong style={{ color: 'var(--amber)' }}>{message}</strong> is now connected.
              Redirecting you back…
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
            <h2 style={{ color: 'var(--white)', fontSize: 20, marginBottom: 8 }}>Connection Failed</h2>
            <p style={{ color: 'var(--slate)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>{message}</p>
            <button
              onClick={() => navigate('/settings/credentials')}
              style={{
                background: 'var(--amber)', color: 'var(--navy)',
                padding: '12px 24px', borderRadius: 10, fontWeight: 700, fontSize: 14,
              }}
            >
              Back to Settings
            </button>
          </>
        )}

        {status === 'select_page' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📘</div>
            <h2 style={{ color: 'var(--white)', fontSize: 20, marginBottom: 8 }}>Choose a Facebook Page</h2>
            <p style={{ color: 'var(--slate)', fontSize: 14, marginBottom: 20 }}>
              You have multiple Facebook Pages. Which one do you want to connect to SocialsUnited?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pages.map(page => (
                <button
                  key={page.id}
                  onClick={() => handleSelectPage(page)}
                  disabled={saving}
                  style={{
                    background: 'var(--navy-light)',
                    border: '1px solid rgba(24,119,242,0.4)',
                    borderRadius: 12,
                    padding: '14px 16px',
                    color: 'var(--white)',
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.6 : 1,
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 22 }}>📘</span>
                  <span>{page.name}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
