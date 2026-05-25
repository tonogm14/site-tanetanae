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

// Mismas reglas que el servidor
const SPAM_RE = /https?|www\.|@|\.(com|net|org|io|ve|info|co|app|xyz)\b/i;

function validate(name, text) {
  if (!name.trim()) return 'Por favor escribe tu nombre.';
  if (SPAM_RE.test(name)) return 'El nombre no puede contener enlaces ni @.';
  if (!text.trim()) return 'El comentario no puede estar vacío.';
  if (text.trim().length < 5) return 'El comentario es muy corto.';
  if (text.length > 1000) return 'El comentario no puede tener más de 1000 caracteres.';
  if (SPAM_RE.test(text)) return 'El comentario no puede contener enlaces, correos ni @.';
  return null;
}

export default function CommentsSection({ postId, enabled }) {
  const [comments, setComments]     = useState([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [name, setName]             = useState('');
  const [text, setText]             = useState('');
  const [sending, setSending]       = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    if (!enabled || !postId) return;
    fetchComments(postId, 1).then(({ comments = [], total = 0 }) => {
      setComments(comments);
      setTotal(total);
      setPage(1);
    });
  }, [postId, enabled]);

  if (!enabled) return null;

  const hasMore = comments.length < total;

  async function loadMore() {
    setLoadingMore(true);
    const nextPage = page + 1;
    const { comments: more = [] } = await fetchComments(postId, nextPage);
    setComments(prev => [...prev, ...more]);
    setPage(nextPage);
    setLoadingMore(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const err = validate(name, text);
    if (err) return setError(err);

    setSending(true);
    try {
      const newComment = await submitComment(postId, { author_name: name.trim(), content: text.trim() });
      setComments(prev => [...prev, newComment]);
      setTotal(prev => prev + 1);
      setSuccess(true);
      setName('');
      setText('');
    } catch (err) {
      setError(err?.response?.data?.error || 'No se pudo enviar el comentario. Intenta de nuevo.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ marginTop: 56, paddingTop: 32, borderTop: '1px solid var(--tt-line)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <span style={{ fontFamily: 'var(--tt-font-display)', fontStyle: 'italic', fontSize: 28, fontWeight: 400, color: 'var(--tt-ink)' }}>
          Comentarios
        </span>
        {total > 0 && (
          <span style={{ background: 'var(--tt-green)', color: 'white', fontFamily: 'var(--tt-font-sans)', fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 999 }}>
            {total}
          </span>
        )}
      </div>

      {/* Comment list */}
      {comments.length === 0 ? (
        <p style={{ fontFamily: 'var(--tt-font-sans)', fontSize: 13, color: 'var(--tt-ink-muted)', marginBottom: 32 }}>
          Sé el primero en comentar esta nota.
        </p>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: hasMore ? 0 : 40 }}>
            {comments.map((c, i) => (
              <div key={c.id} style={{
                display: 'flex', gap: 14, paddingBlock: 20,
                borderBottom: i < comments.length - 1 ? '1px solid var(--tt-line)' : 'none',
              }}>
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
                  <p style={{ fontFamily: 'var(--tt-font-serif)', fontSize: 15, lineHeight: 1.55, color: 'var(--tt-ink)', margin: 0, whiteSpace: 'pre-wrap' }}>
                    {c.content}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              style={{
                display: 'block', width: '100%', marginBottom: 40,
                padding: '11px 0', borderRadius: 'var(--tt-r-pill)',
                border: '1px solid var(--tt-line-strong)',
                background: 'transparent', color: 'var(--tt-ink)',
                fontFamily: 'var(--tt-font-sans)', fontSize: 13, fontWeight: 500,
                cursor: loadingMore ? 'default' : 'pointer',
                opacity: loadingMore ? 0.6 : 1,
              }}
            >
              {loadingMore ? 'Cargando…' : `Ver más comentarios (${total - comments.length} restantes)`}
            </button>
          )}
          {!hasMore && <div style={{ marginBottom: 40 }} />}
        </>
      )}

      {/* Form */}
      <div style={{ background: 'var(--tt-paper-2)', border: '1px solid var(--tt-line)', borderRadius: 'var(--tt-r-lg)', padding: '24px 28px' }}>
        <div style={{ fontFamily: 'var(--tt-font-sans)', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--tt-ink-muted)', marginBottom: 16 }}>
          Deja tu comentario
        </div>

        {success ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--tt-green-soft)', border: '1px solid var(--tt-green-line)', borderRadius: 'var(--tt-r-md)', padding: '14px 18px' }}>
            <span style={{ color: 'var(--tt-green)', fontSize: 18 }}>✓</span>
            <div>
              <div style={{ fontFamily: 'var(--tt-font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--tt-ink)', marginBottom: 2 }}>
                Comentario publicado
              </div>
              <div style={{ fontFamily: 'var(--tt-font-sans)', fontSize: 12, color: 'var(--tt-ink-muted)' }}>
                Tu comentario ya aparece en esta nota.
              </div>
            </div>
            <button onClick={() => setSuccess(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--tt-ink-muted)', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>
              ×
            </button>
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
              placeholder="Escribe tu comentario… (sin links ni @)"
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
              <div style={{ fontFamily: 'var(--tt-font-sans)', fontSize: 12, color: '#b32d2e', padding: '8px 12px', background: '#fef2f2', borderRadius: 'var(--tt-r-md)', border: '1px solid #fecaca' }}>
                {error}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--tt-font-sans)', fontSize: 11, color: 'var(--tt-ink-faint)' }}>
                {text.length}/1000 · Solo texto, sin links ni @
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
