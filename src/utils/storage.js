// frontend/src/utils/storage.js
// Typed wrappers around localStorage — centralises all keys

const KEYS = {
  TOKEN:        'cq_token',
  LAST_LESSON:  'cq_last_lesson',   // resume where you left off
  EDITOR_CODE:  'cq_editor_',       // per-session draft code prefix
  THEME:        'cq_theme',
};

export function getToken()         { return localStorage.getItem(KEYS.TOKEN); }
export function setToken(t)        { localStorage.setItem(KEYS.TOKEN, t); }
export function clearToken()       { localStorage.removeItem(KEYS.TOKEN); }

export function getLastLesson()    { return localStorage.getItem(KEYS.LAST_LESSON); }
export function setLastLesson(id)  { localStorage.setItem(KEYS.LAST_LESSON, id); }

/** Save editor draft so kids don't lose work on refresh.
 *  draft can be a string (legacy) or an object { html, css, js } (multi-tab). */
export function getEditorDraft(sessionId) {
  const raw = localStorage.getItem(KEYS.EDITOR_CODE + sessionId);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (_) { return raw; } // legacy string fallback
}
export function setEditorDraft(sessionId, draft) {
  localStorage.setItem(KEYS.EDITOR_CODE + sessionId, JSON.stringify(draft));
}
export function clearEditorDraft(sessionId) { localStorage.removeItem(KEYS.EDITOR_CODE + sessionId); }
