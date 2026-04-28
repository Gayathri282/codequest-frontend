// frontend/src/components/admin/QuizBuilder.jsx
// Build and manage quiz questions for a given quiz session

import { useState, useEffect } from 'react';
import api from '../../utils/api';
import Btn from '../shared/Btn';

const C = {
  orange: '#FF6B35', cyan: '#00C8E8', lime: '#7ED957',
  red: '#FF4757', yellow: '#FFD700', muted: '#6B82A8', txt: '#1A2340',
};

const EMPTY_Q = {
  question: '', emoji: '🤔',
  optionA: '', optionB: '', optionC: '', optionD: '',
  correctAnswer: 'A', explanation: '', order: 0,
};

const inp = {
  width: '100%', padding: '9px 13px', borderRadius: 10,
  border: '3px solid #C8EEFF', fontSize: 13,
  fontFamily: "'Nunito', sans-serif", background: '#F0FAFF',
  outline: 'none', boxSizing: 'border-box', color: C.txt,
};
const lbl = { fontSize: 12, color: C.muted, fontWeight: 700, display: 'block', marginBottom: 4 };

export default function QuizBuilder({ sessionId, sessionTitle = 'Quiz' }) {
  const [questions, setQuestions] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [editId,    setEditId]    = useState(null);
  const [form,      setForm]      = useState(EMPTY_Q);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  // Fetch full session with quiz questions
  useEffect(() => { loadQuestions(); }, [sessionId]);

  async function loadQuestions() {
    setLoading(true);
    try {
      const res = await api.get(`/sessions/${sessionId}`);
      setQuestions((res.data.quizQuestions || []).sort((a, b) => a.order - b.order));
    } catch { setError('Failed to load questions'); }
    finally { setLoading(false); }
  }

  function startEdit(q) {
    setEditId(q.id);
    setForm({ question: q.question, emoji: q.emoji || '🤔',
      optionA: q.optionA, optionB: q.optionB, optionC: q.optionC, optionD: q.optionD,
      correctAnswer: q.correctAnswer, explanation: q.explanation || '', order: q.order });
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false); setEditId(null); setForm(EMPTY_Q); setError('');
  }

  async function saveQuestion() {
    if (!form.question.trim() || !form.optionA || !form.optionB || !form.optionC || !form.optionD) {
      setError('Fill in the question and all 4 options'); return;
    }
    setSaving(true); setError('');
    try {
      const payload = { ...form, sessionId, order: editId ? form.order : questions.length + 1 };
      if (editId) {
        const res = await api.patch(`/quiz/question/${editId}`, payload);
        setQuestions(qs => qs.map(q => q.id === editId ? res.data : q));
      } else {
        const res = await api.post('/quiz/question', payload);
        setQuestions(qs => [...qs, res.data]);
      }
      cancelForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed');
    } finally { setSaving(false); }
  }

  async function deleteQuestion(id) {
    if (!confirm('Delete this question?')) return;
    try {
      await api.delete(`/quiz/question/${id}`);
      setQuestions(qs => qs.filter(q => q.id !== id));
    } catch { setError('Delete failed'); }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: C.muted }}>⏳ Loading…</div>;

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontFamily: "'Boogaloo', cursive", fontSize: 22, color: C.orange }}>🎯 Quiz Builder</div>
          <div style={{ color: C.muted, fontSize: 13 }}>{sessionTitle} · {questions.length} questions</div>
        </div>
        <Btn onClick={() => { cancelForm(); setShowForm(v => !v); }} color={C.orange} sm>
          {showForm ? '✕ Cancel' : '+ Add Question'}
        </Btn>
      </div>

      {error && (
        <div style={{ background: '#FFEEEE', border: `2px solid ${C.red}`, borderRadius: 10,
          padding: '10px 14px', color: C.red, marginBottom: 16, fontSize: 13 }}>{error}</div>
      )}

      {/* Form */}
      {showForm && (
        <div style={{ background: '#fff', border: `3px solid ${C.orange}`, borderRadius: 20,
          padding: 24, marginBottom: 24, boxShadow: `0 6px 0 ${C.orange}44` }}>
          <div style={{ fontFamily: "'Boogaloo', cursive", fontSize: 18, color: C.orange, marginBottom: 16 }}>
            {editId ? '✏️ Edit Question' : '➕ New Question'}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={lbl}>Question Text *</label>
              <input style={inp} placeholder="e.g. Which tag makes the BIGGEST heading?"
                value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Emoji</label>
              <input style={{ ...inp, width: 70 }} placeholder="🤔"
                value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            {['A', 'B', 'C', 'D'].map(opt => (
              <div key={opt}>
                <label style={{ ...lbl, color: form.correctAnswer === opt ? C.lime : C.muted }}>
                  Option {opt} {form.correctAnswer === opt ? '✓ CORRECT' : ''}
                </label>
                <input style={{
                  ...inp,
                  borderColor: form.correctAnswer === opt ? C.lime : '#C8EEFF',
                  background: form.correctAnswer === opt ? '#EDFFF3' : '#F0FAFF',
                }}
                  placeholder={`Option ${opt}…`}
                  value={form[`option${opt}`]}
                  onChange={e => setForm(f => ({ ...f, [`option${opt}`]: e.target.value }))} />
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={lbl}>Correct Answer</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['A', 'B', 'C', 'D'].map(opt => (
                <button key={opt} onClick={() => setForm(f => ({ ...f, correctAnswer: opt }))} style={{
                  background: form.correctAnswer === opt ? C.lime : '#fff',
                  border: `3px solid ${form.correctAnswer === opt ? C.lime : '#C8EEFF'}`,
                  borderRadius: 10, padding: '8px 20px',
                  color: form.correctAnswer === opt ? '#fff' : C.muted,
                  cursor: 'pointer', fontFamily: "'Boogaloo', cursive", fontSize: 16,
                  boxShadow: form.correctAnswer === opt ? `0 4px 0 ${C.lime}88` : '0 2px 0 #D8EEF8',
                }}>{opt}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={lbl}>Explanation (shown after student answers)</label>
            <textarea style={{ ...inp, height: 70 }}
              placeholder="e.g. <h1> is the biggest! h1 → h6 goes from large to small!"
              value={form.explanation} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))} />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Btn onClick={cancelForm} color="#EEE" textColor={C.muted} sm>Cancel</Btn>
            <Btn onClick={saveQuestion} color={C.orange} sm disabled={saving}>
              {saving ? '⏳…' : editId ? '✓ Update' : '✓ Save Question'}
            </Btn>
          </div>
        </div>
      )}

      {/* Question list */}
      {questions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: C.muted }}>
          <div style={{ fontSize: 40 }}>🎯</div>
          <div style={{ marginTop: 10 }}>No questions yet. Click <strong>+ Add Question</strong> to start!</div>
        </div>
      ) : (
        questions.map((q, idx) => (
          <div key={q.id} style={{ background: '#fff', border: '3px solid #FFE0C8',
            borderRadius: 18, padding: '16px 20px', marginBottom: 12,
            boxShadow: '0 4px 0 #FFD0B0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: C.muted, fontSize: 12, marginBottom: 4 }}>
                  Q{idx + 1}  {q.emoji}
                </div>
                <div style={{ fontWeight: 700, color: C.txt, fontSize: 15, marginBottom: 10 }}>
                  {q.question}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['A', 'B', 'C', 'D'].map(opt => (
                    <span key={opt} style={{
                      background: opt === q.correctAnswer ? '#EDFFF3' : '#F0F8FF',
                      border: `2px solid ${opt === q.correctAnswer ? C.lime : '#C8EEFF'}`,
                      borderRadius: 8, padding: '4px 12px',
                      color: opt === q.correctAnswer ? '#1A7A30' : C.muted, fontSize: 12, fontWeight: 700,
                    }}>
                      {opt === q.correctAnswer ? '✓ ' : ''}{opt}. {q[`option${opt}`]}
                    </span>
                  ))}
                </div>
                {q.explanation && (
                  <div style={{ color: C.muted, fontSize: 12, marginTop: 8,
                    background: '#F0FAFF', borderRadius: 8, padding: '6px 10px',
                    border: '1px solid #C8EEFF' }}>
                    💡 {q.explanation}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <Btn onClick={() => startEdit(q)} color="#EEF4FF" textColor="#9B59B6" sm>✏️</Btn>
                <Btn onClick={() => deleteQuestion(q.id)} color="#FFEEEE" textColor={C.red} sm>🗑️</Btn>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
