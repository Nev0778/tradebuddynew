import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { QuickReplyTemplate, QuickReplyCategory } from '../lib/types';
import { generateId } from '../lib/utils';

const CATEGORIES: QuickReplyCategory[] = ['Qualifying', 'Booking', 'Follow-up', 'Holding', 'General'];

const CATEGORY_COLORS: Record<QuickReplyCategory, { bg: string; text: string }> = {
  Qualifying: { bg: '#7C3AED', text: '#fff' },
  Booking:    { bg: '#0284C7', text: '#fff' },
  'Follow-up':{ bg: '#059669', text: '#fff' },
  Holding:    { bg: '#D97706', text: '#fff' },
  General:    { bg: '#6B7280', text: '#fff' },
};

interface EditModalProps {
  template: Partial<QuickReplyTemplate> | null;
  onSave: (t: QuickReplyTemplate) => void;
  onClose: () => void;
}

function EditModal({ template, onSave, onClose }: EditModalProps) {
  const [text, setText] = useState(template?.text ?? '');
  const [label, setLabel] = useState(template?.label ?? '');
  const [category, setCategory] = useState<QuickReplyCategory>(template?.category ?? 'General');

  function handleSave() {
    if (!text.trim()) return;
    onSave({ id: template?.id ?? generateId(), text: text.trim(), label: label.trim() || undefined, category });
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'flex-end', zIndex: 300,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--navy-light)', borderRadius: '20px 20px 0 0',
        padding: 24, width: '100%', maxHeight: '80vh', overflowY: 'auto',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 16px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--white)' }}>
            {template?.id ? 'Edit Template' : 'New Template'}
          </h3>
          <button onClick={onClose} style={{ color: 'var(--slate)', fontSize: 20 }}>✕</button>
        </div>

        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate)', display: 'block', marginBottom: 6 }}>CATEGORY</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {CATEGORIES.map(cat => {
            const cc = CATEGORY_COLORS[cat];
            const isActive = category === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: '5px 12px', borderRadius: 14, fontSize: 12, fontWeight: 600,
                  background: isActive ? cc.bg : 'var(--surface-2)',
                  color: isActive ? cc.text : 'var(--slate)',
                  border: `1px solid ${isActive ? cc.bg : 'var(--border)'}`,
                }}
              >{cat}</button>
            );
          })}
        </div>

        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate)', display: 'block', marginBottom: 6 }}>
          SHORT LABEL (optional)
        </label>
        <input
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="e.g. Request CU photo"
          style={{
            width: '100%', padding: '10px 12px', borderRadius: 10,
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            color: 'var(--white)', fontSize: 14, marginBottom: 16,
          }}
        />

        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate)', display: 'block', marginBottom: 6 }}>
          MESSAGE TEXT
        </label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type the full reply message..."
          rows={5}
          style={{
            width: '100%', padding: '10px 12px', borderRadius: 10,
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            color: 'var(--white)', fontSize: 14, resize: 'none', marginBottom: 20,
          }}
        />

        <button
          onClick={handleSave}
          disabled={!text.trim()}
          style={{
            width: '100%', padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 700,
            background: text.trim() ? 'var(--amber)' : 'var(--surface-2)',
            color: text.trim() ? 'var(--navy)' : 'var(--slate)',
          }}
        >Save Template</button>
      </div>
    </div>
  );
}

export function QuickRepliesPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [editTarget, setEditTarget] = useState<Partial<QuickReplyTemplate> | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<QuickReplyCategory | 'All'>('All');

  const filtered = state.settings.quickReplies.filter(
    qr => filterCat === 'All' || qr.category === filterCat
  );

  function handleSave(t: QuickReplyTemplate) {
    if (editTarget?.id) {
      dispatch({ type: 'UPDATE_QUICK_REPLY', template: t });
    } else {
      dispatch({ type: 'ADD_QUICK_REPLY', template: t });
    }
    setShowModal(false);
    setEditTarget(null);
  }

  function handleDelete(id: string) {
    dispatch({ type: 'DELETE_QUICK_REPLY', id });
    setDeleteConfirm(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
        background: 'var(--navy-light)', borderBottom: '1px solid var(--border)', flexShrink: 0,
      }}>
        <button onClick={() => navigate('/settings')} style={{ color: 'var(--amber)', fontSize: 22, lineHeight: 1 }}>‹</button>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--white)', flex: 1 }}>Quick Reply Templates</h2>
        <button
          onClick={() => { setEditTarget({}); setShowModal(true); }}
          style={{
            background: 'var(--amber)', color: 'var(--navy)', borderRadius: 8,
            padding: '6px 14px', fontSize: 13, fontWeight: 700,
          }}
        >+ Add</button>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 6, padding: '10px 12px', overflowX: 'auto', scrollbarWidth: 'none', flexShrink: 0 }}>
        {(['All', ...CATEGORIES] as (QuickReplyCategory | 'All')[]).map(cat => {
          const isActive = filterCat === cat;
          const cc = cat !== 'All' ? CATEGORY_COLORS[cat] : null;
          return (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              style={{
                padding: '5px 12px', borderRadius: 14, fontSize: 12, fontWeight: 600,
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
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--slate)' }}>
            <p style={{ fontSize: 15 }}>No templates in this category</p>
            <button
              onClick={() => { setEditTarget({}); setShowModal(true); }}
              style={{ color: 'var(--amber)', fontSize: 14, marginTop: 10 }}
            >Add your first template</button>
          </div>
        ) : filtered.map(qr => {
          const cc = CATEGORY_COLORS[qr.category];
          return (
            <div key={qr.id} style={{
              padding: '14px 20px', borderBottom: '1px solid var(--border)',
              display: 'flex', gap: 12, alignItems: 'flex-start',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                    background: cc.bg, color: cc.text,
                  }}>{qr.category}</span>
                  {qr.label && <span style={{ fontSize: 12, color: 'var(--slate)', fontStyle: 'italic' }}>{qr.label}</span>}
                </div>
                <p style={{ fontSize: 14, color: 'var(--white)', lineHeight: 1.5 }}>{qr.text}</p>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginTop: 2 }}>
                <button
                  onClick={() => { setEditTarget(qr); setShowModal(true); }}
                  style={{
                    padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--slate)',
                  }}
                >Edit</button>
                <button
                  onClick={() => setDeleteConfirm(qr.id)}
                  style={{
                    padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444',
                  }}
                >Delete</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit/Add modal */}
      {showModal && (
        <EditModal
          template={editTarget}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditTarget(null); }}
        />
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 24,
        }}>
          <div style={{
            background: 'var(--navy-light)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 320,
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--white)', marginBottom: 8 }}>Delete Template?</h3>
            <p style={{ fontSize: 14, color: 'var(--slate)', marginBottom: 20 }}>This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  flex: 1, padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 600,
                  background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--slate)',
                }}
              >Cancel</button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                style={{
                  flex: 1, padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 700,
                  background: '#EF4444', color: '#fff',
                }}
              >Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
