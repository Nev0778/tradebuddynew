import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { AutoReplyConfig } from '../lib/types';

export function AutoReplyPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [config, setConfig] = useState<AutoReplyConfig>({ ...state.settings.autoReply });
  const [saved, setSaved] = useState(false);

  function handleSave() {
    dispatch({ type: 'UPDATE_SETTINGS', settings: { autoReply: config } });
    setSaved(true);
    setTimeout(() => { setSaved(false); navigate('/settings'); }, 1000);
  }

  function update(patch: Partial<AutoReplyConfig>) {
    setConfig(prev => ({ ...prev, ...patch }));
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
        background: 'var(--navy-light)', borderBottom: '1px solid var(--border)',
      }}>
        <button onClick={() => navigate('/settings')} style={{ color: 'var(--amber)', fontSize: 22, lineHeight: 1 }}>‹</button>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--white)', flex: 1 }}>Auto-Reply</h2>
      </div>

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Enable toggle */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', borderRadius: 14,
          background: 'var(--surface)', border: '1px solid var(--border)',
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--white)' }}>Enable Auto-Reply</div>
            <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 2 }}>
              Automatically reply to incoming messages
            </div>
          </div>
          <button
            onClick={() => update({ enabled: !config.enabled })}
            style={{
              width: 50, height: 28, borderRadius: 14,
              background: config.enabled ? 'var(--amber)' : 'var(--surface-2)',
              border: `2px solid ${config.enabled ? 'var(--amber)' : 'var(--border)'}`,
              position: 'relative', transition: 'all 0.2s', flexShrink: 0,
            }}
          >
            <div style={{
              width: 20, height: 20, borderRadius: '50%', background: '#fff',
              position: 'absolute', top: 2,
              left: config.enabled ? 26 : 2,
              transition: 'left 0.2s',
            }} />
          </button>
        </div>

        {config.enabled && (
          <>
            {/* Outside hours only */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', borderRadius: 14,
              background: 'var(--surface)', border: '1px solid var(--border)',
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--white)' }}>Outside Working Hours Only</div>
                <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 2 }}>
                  Only auto-reply when outside your set hours
                </div>
              </div>
              <button
                onClick={() => update({ outsideHoursOnly: !config.outsideHoursOnly })}
                style={{
                  width: 50, height: 28, borderRadius: 14,
                  background: config.outsideHoursOnly ? 'var(--amber)' : 'var(--surface-2)',
                  border: `2px solid ${config.outsideHoursOnly ? 'var(--amber)' : 'var(--border)'}`,
                  position: 'relative', transition: 'all 0.2s', flexShrink: 0,
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: 2,
                  left: config.outsideHoursOnly ? 26 : 2,
                  transition: 'left 0.2s',
                }} />
              </button>
            </div>

            {/* Working hours */}
            {config.outsideHoursOnly && (
              <div style={{ padding: '14px 16px', borderRadius: 14, background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--slate)', marginBottom: 12, letterSpacing: 0.5 }}>
                  WORKING HOURS
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: 'var(--slate)', display: 'block', marginBottom: 4 }}>FROM</label>
                    <input
                      type="time"
                      value={config.workingHoursStart}
                      onChange={e => update({ workingHoursStart: e.target.value })}
                      style={{
                        width: '100%', padding: '10px 12px', borderRadius: 10,
                        background: 'var(--surface-2)', border: '1px solid var(--border)',
                        color: 'var(--white)', fontSize: 15,
                      }}
                    />
                  </div>
                  <span style={{ color: 'var(--slate)', marginTop: 18 }}>—</span>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: 'var(--slate)', display: 'block', marginBottom: 4 }}>TO</label>
                    <input
                      type="time"
                      value={config.workingHoursEnd}
                      onChange={e => update({ workingHoursEnd: e.target.value })}
                      style={{
                        width: '100%', padding: '10px 12px', borderRadius: 10,
                        background: 'var(--surface-2)', border: '1px solid var(--border)',
                        color: 'var(--white)', fontSize: 15,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Message */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate)', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>
                AUTO-REPLY MESSAGE
              </label>
              <textarea
                value={config.message}
                onChange={e => update({ message: e.target.value })}
                rows={5}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 12,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  color: 'var(--white)', fontSize: 14, resize: 'none', lineHeight: 1.5,
                }}
              />
              <p style={{ fontSize: 12, color: 'var(--slate)', marginTop: 6 }}>
                This message will be sent automatically. It will appear as a normal message from you — the customer will not know it is automated.
              </p>
            </div>
          </>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          style={{
            width: '100%', padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 700, marginTop: 4,
            background: saved ? '#22C55E' : 'var(--amber)',
            color: saved ? '#fff' : 'var(--navy)',
            transition: 'background 0.2s',
          }}
        >
          {saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
