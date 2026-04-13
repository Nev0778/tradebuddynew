import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { TradeType } from '../lib/types';

const TRADE_OPTIONS: { value: TradeType; label: string; emoji: string }[] = [
  { value: 'electrician', label: 'Electrician', emoji: '⚡' },
  { value: 'plumber', label: 'Plumber', emoji: '🔧' },
  { value: 'builder', label: 'Builder', emoji: '🏗️' },
  { value: 'carpenter', label: 'Carpenter', emoji: '🪚' },
  { value: 'painter', label: 'Painter & Decorator', emoji: '🎨' },
  { value: 'other', label: 'Other Trade', emoji: '🛠️' },
];

export function BusinessProfilePage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState(state.settings.businessName);
  const [trade, setTrade] = useState<TradeType>(state.settings.tradeType);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    dispatch({ type: 'UPDATE_SETTINGS', settings: { businessName: name.trim(), tradeType: trade } });
    setSaved(true);
    setTimeout(() => { setSaved(false); navigate('/settings'); }, 1000);
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
        background: 'var(--navy-light)', borderBottom: '1px solid var(--border)', flexShrink: 0,
      }}>
        <button onClick={() => navigate('/settings')} style={{ color: 'var(--amber)', fontSize: 22, lineHeight: 1 }}>‹</button>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--white)', flex: 1 }}>Business Profile</h2>
      </div>

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Business name */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate)', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>
            BUSINESS NAME
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Dave's Electrical Services"
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 12,
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--white)', fontSize: 15,
            }}
          />
        </div>

        {/* Trade type */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate)', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>
            TRADE TYPE
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {TRADE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setTrade(opt.value)}
                style={{
                  padding: '12px 10px', borderRadius: 12, textAlign: 'left',
                  background: trade === opt.value ? 'rgba(245,166,35,0.15)' : 'var(--surface)',
                  border: `1.5px solid ${trade === opt.value ? 'var(--amber)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                <span style={{ fontSize: 20 }}>{opt.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: trade === opt.value ? 'var(--amber)' : 'var(--white)' }}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          style={{
            width: '100%', padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 700, marginTop: 8,
            background: saved ? '#22C55E' : (name.trim() ? 'var(--amber)' : 'var(--surface)'),
            color: saved ? '#fff' : (name.trim() ? 'var(--navy)' : 'var(--slate)'),
            transition: 'background 0.2s',
          }}
        >
          {saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
