import React, { useState, useEffect } from 'react';
import { fetchComments, submitComment } from '../api/wordpress.js';

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function fmtDate(str) {
  const d = new Date(str);
  if (isNaN(d)) return str;
  return `${d.getDate()} ${MONTHS_ES[d.getMonth()]}, ${d.getFullYear()}`;
}

function initials(name) {
  return (name || 'A').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

const URL_RE = /(https?:\/\/|www\.)/i;

export default function CommentsSection({ postId, enabled }) {
  const [comments, setComments]   = useState([]);
  const [name, setName]           = useState('');
  const [text, setText]           = useState('');
  const [sending, setSending]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState('');
  const [loadErr, setLoadErr]     = useState(false);

  useEffect(() => {
    if (!enabled || !postId) return;
    fetchComments(postId)
      .then(setComments)
      .catch(() => setLoadErr(true));
  }, [postId, enabled]);

  if (!enabled) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Por favor escribe tu nombre.');
    if (!text.trim()) return setError('El comentario no puede estar vacio.');
    if (URL_RE.test(text)) return setError('Los comentarios no pueden contener enlaces.');
    if (text.trim().length < 5) return setError('El comentario es muy corto.');
    if (text.length > 1000) return setError('El comentario no puede tener mas de 1000 caracteres.');

    setSending(true);
    try {
      await submitComment(postId, { author_name: name.trim(), content: text.trim() });
      setSuccess(true);
      setName('');
      setText('');
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo enviar el comentario. Intenta de nuevo.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ marginTop: 56, paddingTop: 32, borderTop: '1px solid var(--tt-line)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <span style={{
          fontFamily: 'var(--tt-font-display)', fontStyle: 'italic',
          fontSize: 28, fontWeight: 400, color: 'var(--tt-ink)',
        }}>
          Comentarios
        </span>
        {comments.length > 0 && (
          <span style={{
            background: 'var(--tt-green)', color: 'white',
            fontFamily: 'var(--tt-font-sans)', fontSize: 11, fontWeight: 700,
            padding: '2px 9px', borderRadius: 999,
          }}>
            {comments.length}
          </span>
        )}
      </div>

      {/* Comment list */}
      {loadErr ? null : comments.length === 0 ? (
        <p style={{ fontFamily: 'var(--tt-font-sans)', fontSize: 13, color: 'var(--tt-ink-muted)', marginBottom: 32 }}>
          Se el primero en comentar esta nota.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 40 }}>
          {comments.map((c, i) => (
            <div key={c.id} style={{
              display: 'flex', gap: 14, paddingBlock: 20,
              borderBottom: i < comments.length - 1 ? '1px solid var(--tt-line)' : 'none',
            }}>
              {/* Avatar */}
              <div style={{
                flexShrink: 0, width: 38, height: 38, borderRadius: '50%',
                background: 'var(--tt-green-soft)', border: '1px solid var(--tt-green-line)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--tt-font-display)', fontStyle: 'italic',
                fontSize: 14, color: 'var(--tt-green)',
              }}>
                {initials(c.author)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--tt-font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--tt-ink)' }}>
                    {c.author}
                  </span>
                  <span style={{ fontFamily: 'var(--tt-font-sans)', fontSize: 11, color: 'var(--tt-ink-faint)' }}>
                    {fmtDate(c.date)}
                  </span>
                </div>
                <p style={{
                  fontFamily: 'var(--tt-font-serif)', fontSize: 15, lineHeight: 1.55,
                  color: 'var(--tt-ink)', margin: 0, whiteSpace: 'pre-wrap',
                }}>
                  {c.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      <div style={{
        background: 'var(--tt-paper-2)', border: '1px solid var(--tt-line)',
        borderRadius: 'var(--tt-r-lg)', padding: '24px 28px',
      }}>
        <div style={{ fontFamily: 'var(--tt-font-sans)', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--tt-ink-muted)', marginBottom: 16 }}>
          Deja tu comentario
        </div>

        {success ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--tt-green-soft)', border: '1px solid var(--tt-green-line)',
            borderRadius: 'var(--tt-r-md)', padding: '14px 18px',
          }}>
            <span style={{ color: 'var(--tt-green)', fontSize: 18 }}>✓</span>
            <div>
              <div style={{ fontFamily: 'var(--tt-font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--tt-ink)', marginBottom: 2 }}>
                Comentario recibido
              </div>
              <div style={{ fontFamily: 'var(--tt-font-sans)', fontSize: 12, color: 'var(--tt-ink-muted)' }}>
                Tu comentario esta pendiente de aprobacion y aparecera pronto.
              </div>
            </div>
            <button onClick={() => setSuccess(false)} style={{
              marginLeft: 'auto', background: 'none', border: 'none',
              color: 'var(--tt-ink-muted)', cursor: 'pointer', fontSize: 18, lineHeight: 1,
            }}>+</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="text"
              placeholder="Tu nombre *"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={80}
              style={{
                padding: '9px 12px', borderRadius: 'var(--tt-r-md)',
                border: '1px solid var(--tt-line-strong)', background: 'var(--tt-paper)',
                fontFamily: 'var(--tt-font-sans)', fontSize: 13, color: 'var(--tt-ink)',
                outline: 'none', width: '100%', boxSizing: 'border-box',
              }}
            />
            <textarea
              placeholder="Escribe tu comentario… (sin links)"
              value={text}
              onChange={e => setText(e.target.value)}
              maxLength={1000}
              rows={4}
              style={{
                padding: '9px 12px', borderRadius: 'var(--tt-r-md)',
                border: '1px solid var(--tt-line-strong)', background: 'var(--tt-paper)',
                fontFamily: 'var(--tt-font-serif)', fontSize: 15, color: 'var(--tt-ink)',
                lineHeight: 1.5, resize: 'vertical', outline: 'none',
                width: '100%', boxSizing: 'border-box',
              }}
            />
            {error && (
              <div style={{ fontFamily: 'var(--tt-font-sans)', fontSize: 12, color: '#b32d2e' }}>
                {error}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--tt-font-sans)', fontSize: 11, color: 'var(--tt-ink-faint)' }}>
                {text.length}/1000 · Solo texto, sin links
              </span>
              <button
                type="submit"
                disabled={sending}
                style={{
                  padding: '9px 22px', borderRadius: 'var(--tt-r-pill)',
                  background: sending ? 'var(--tt-ink-faint)' : 'var(--tt-green)',
                  color: 'white', border: 'none', cursor: sending ? 'default' : 'pointer',
                  fontFamily: 'var(--tt-font-sans)', fontSize: 13, fontWeight: 600,
                  transition: 'background 0.2s',
                }}
              >
                {sending ? 'Enviando…' : 'Publicar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
