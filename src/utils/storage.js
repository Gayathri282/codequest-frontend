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

/** Save editor draft so kids don't lose work on refresh */
export function getEditorDraft(sessionId)        { return localStorage.getItem(KEYS.EDITOR_CODE + sessionId) || ''; }
export function setEditorDraft(sessionId, code)  { localStorage.setItem(KEYS.EDITOR_CODE + sessionId, code); }
export function clearEditorDraft(sessionId)      { localStorage.removeItem(KEYS.EDITOR_CODE + sessionId); }
