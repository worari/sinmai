// app/knowledge/exam/page.js
// หน้าเข้าทำแบบทดสอบความรู้ (Exam Taker)
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, AlertCircle, CheckCircle2, ShieldCheck, ChevronLeft, Lock, RotateCw } from 'lucide-react';

const EXAM_ID = 'exm-claims-basic';

export default function ExamPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [windowStatus, setWindowStatus] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('rta_user');
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch (e) {}
    }
    initExam();
  }, []);

  const initExam = async () => {
    try {
      const uid = user?.id;
      if (!uid) throw new Error('ยังไม่ได้เข้าสู่ระบบ');
      const [wRes, examsRes] = await Promise.all([
        fetch(`/api/knowledge/can-access?userId=${encodeURIComponent(uid)}`),
        fetch('/api/knowledge/exams')
      ]);
      const w = await wRes.json();
      const examsData = await examsRes.json();
      const examConfig = examsData.success && Array.isArray(examsData.exams)
        ? examsData.exams.find((e) => e.id === EXAM_ID)
        : null;
      setExam(examConfig || null);
      setWindowStatus(w.success ? w.windowOpen : null);

      const questionCount = examConfig?.questionCount || 10;

      // ดึงข้อสอบแบบสุ่มจากฐานคำถาม และสุ่มตำแหน่งตัวเลือกในแต่ละข้อ
      const qRes = await fetch(
        `/api/knowledge/questions?examId=${encodeURIComponent(EXAM_ID)}&random=true&limit=${questionCount}&shuffleOptions=true&hideAnswers=true`
      );
      const q = await qRes.json();
      if (q.success && Array.isArray(q.questions)) {
        setQuestions(q.questions.map((q) => ({
          id: q.id, questionText: q.questionText,
          options: q.options.map((o) => ({ id: o.id, text: o.text })),
          points: q.points, orderIndex: q.orderIndex
        })));
      }
      const startKey = `rta_exam_start_${EXAM_ID}`;
      const existing = localStorage.getItem(startKey);
      const timeLimit = ((examConfig && examConfig.timeLimitMinutes) ? examConfig.timeLimitMinutes : 30) * 60;
      if (!existing) {
        localStorage.setItem(startKey, Date.now().toString());
        setTimeLeft(timeLimit);
        startTimer(timeLimit);
      } else {
        const elapsed = Math.floor((Date.now() - Number(existing)) / 1000);
        const remaining = Math.max(0, timeLimit - elapsed);
        setTimeLeft(remaining);
        if (remaining > 0) startTimer(remaining);
      }
    } catch (e) {
      setError(e.message || 'โหลดแบบทดสอบไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  let timerId = null;
  const startTimer = (seconds) => {
    if (timerId) clearInterval(timerId);
    setTimeLeft(seconds);
    timerId = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerId); onSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const totalScore = () => questions.reduce((sum, q) => sum + (q.points || 10), 0);

  const onSelect = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const onSubmit = async (e) => {
    if (e) e.preventDefault();
    if (submitting) return;
    if (timerId) { clearInterval(timerId); timerId = null; }
    const uid = user?.id;
    if (!uid) return;
    setSubmitting(true);
    try {
      const answered = questions.map((q) => ({ questionId: q.id, selectedOptionId: answers[q.id] || null }));
      const res = await fetch('/api/knowledge/attempts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid, examId: EXAM_ID, answers: answered })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'ส่งคำตอบไม่สำเร็จ');
      const attempt = data.attempt;
      setResult({
        score: attempt.score, percentage: attempt.percentage, passed: attempt.passed,
        correctAnswers: attempt.correctAnswers, totalQuestions: attempt.totalQuestions, detail: attempt.answers
      });
      localStorage.removeItem(`rta_exam_start_${EXAM_ID}`);
    } catch (err) {
      setError(err.message || 'ส่งคำตอบไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  const fmtTime = (s) => { const m = Math.floor(s / 60); const sec = s % 60; return `${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`; };

  if (loading) {
    return (<div className="container" style={{ paddingTop: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}><div className="glass-panel" style={{ padding: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}><Clock size={20} style={{ color: 'var(--gold-primary)', animation: 'spin 1s linear infinite' }} /><span>กำลังโหลดแบบทดสอบ...</span></div></div>);
  }

  if (error) {
    return (<div className="container" style={{ paddingTop: '70px', maxWidth: '600px', textAlign: 'center' }}><div className="glass-panel" style={{ padding: '40px 32px', borderRadius: '12px' }}><AlertCircle size={40} style={{ color: 'var(--ruby-danger)', marginBottom: '16px' }} /><h1 style={{ fontSize: '20px', marginBottom: '8px' }}>{error}</h1><Link href="/knowledge" className="btn btn-secondary">กลับสู่คลังความรู้</Link></div></div>);
  }

  const canTake = windowStatus?.open === true;
  if (!canTake) {
    return (<div className="container" style={{ paddingTop: '70px', maxWidth: '600px', textAlign: 'center' }}><div className="glass-panel" style={{ padding: '40px 32px', borderRadius: '12px' }}><Lock size={40} style={{ color: 'var(--ruby-danger)', marginBottom: '16px' }} /><h1 style={{ fontSize: '20px', marginBottom: '8px' }}>ยังไม่สามารถทำแบบทดสอบได้ในขณะนี้</h1><p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>{windowStatus?.message || 'ช่วงเวลาเปิดสอบยังไม่ถึงหรือปิดแล้ว'}</p><Link href="/knowledge" className="btn btn-secondary">กลับสู่คลังความรู้</Link></div></div>);
  }

  if (result) {
    const level = result.passed ? { label: 'ผ่าน (ดีเยี่ยม)', color: 'var(--emerald-success)' } : result.percentage >= 60 ? { label: 'ผ่าน (พอใช้)', color: 'var(--amber-warning)' } : { label: 'ไม่ผ่าน (ต้องปรับปรุง)', color: 'var(--ruby-danger)' };
    return (
      <div className="container" style={{ paddingTop: '20px', maxWidth: '760px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
          <Link href="/knowledge" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ChevronLeft size={16} /> กลับคลังความรู้</Link>
          <h1 style={{ margin: 0, fontSize: '20px' }}>ผลการทดสอบความรู้</h1>
        </div>
        <div className="glass-panel" style={{ padding: '26px', borderRadius: '12px', marginBottom: '22px', textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: result.passed ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${result.passed ? 'var(--emerald-success)' : 'var(--ruby-danger)'}` }}>
            <span style={{ fontSize: '30px', fontWeight: 800, color: result.passed ? 'var(--emerald-success)' : 'var(--ruby-danger)' }}>{result.score}</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, marginBottom: '6px', color: level.color }}>{result.percentage}%</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: level.color, marginBottom: '10px' }}>{level.label}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ตอบถูก {result.correctAnswers} จาก {result.totalQuestions} ข้อ &#8226; คะแนนเต็ม {totalScore()}</div>
          {result.passed ? (<div style={{ marginTop: '14px', color: 'var(--emerald-success)', fontWeight: 700, fontSize: '14px' }}>&#10003; ท่านผ่านเกณฑ์แล้ว สามารถใช้งานระบบได้เต็มรูปแบบ</div>) : (<div style={{ marginTop: '14px', color: 'var(--ruby-danger)', fontWeight: 700, fontSize: '14px' }}>&#10007; ยังไม่ผ่านเกณฑ์ (ต้องได้คะแนนไม่ต่ำกว่า 80 คะแนน) กรุณาศึกษาคลังความรู้แล้วสอบใหม่</div>)}
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '22px' }}>
          <Link href="/knowledge" className="btn btn-primary" style={{ padding: '10px 24px' }}>กลับหน้าคลังความรู้</Link>
          {!result.passed && (<button onClick={() => { localStorage.removeItem(`rta_exam_start_${EXAM_ID}`); setResult(null); setAnswers({}); setCurrentIndex(0); initExam(); }} className="btn btn-secondary" style={{ padding: '10px 24px' }}>สอบใหม่</button>)}
        </div>
        <div style={{ background: 'rgba(7,13,30,0.3)', borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontWeight: 700, marginBottom: '10px', fontSize: '14px' }}>ทบทวนคำตอบ</div>
          {result.detail.map((d) => (
            <div key={d.id} style={{ borderBottom: '1px solid var(--border-glass)', padding: '10px 0', fontSize: '13px', display: 'flex', alignItems: 'start', gap: '10px' }}>
              <div style={{ flexShrink: 0, width: '24px', color: d.isCorrect ? 'var(--emerald-success)' : 'var(--ruby-danger)', fontWeight: 700 }}>{d.isCorrect ? '&#10003;' : '&#10007;'}</div>
              <div style={{ flex: 1 }}>{questions.find((q) => q.id === d.questionId)?.questionText || ''}</div>
              <div style={{ fontSize: '12px', color: d.isCorrect ? 'var(--emerald-success)' : 'var(--ruby-danger)' }}>{d.isCorrect ? 'ตอบถูก' : `ตอบผิด (เฉลย: ตัวเลือก ${d.correctOptionId})`}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];
  const answered = Object.keys(answers).length;
  const timeExpired = timeLeft <= 0;

  return (
    <div className="container" style={{ paddingTop: '16px', maxWidth: '820px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Link href="/knowledge" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ChevronLeft size={16} /> กลับ</Link>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{exam?.title || 'แบบทดสอบความรู้'}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: timeExpired ? 'var(--ruby-danger)' : 'var(--cyan-accent)' }}><Clock size={16} /> {fmtTime(timeLeft)}</div>
      </div>
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>{exam?.instructions || 'อ่านคำถามแล้วเลือกคำตอบที่ถูกต้องที่สุดเพียงข้อเดียว'}</div>
        <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>คำถามที่ {currentIndex + 1} จาก {questions.length}</div>
        <div style={{ fontSize: '15px', marginBottom: '18px', lineHeight: 1.6 }}>{q?.questionText || 'กำลังโหลดคำถาม...'}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px' }}>
          {q?.options.map((o) => (
            <label key={o.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', border: `1px solid ${answers[q.id] === o.id ? 'var(--cyan-accent)' : 'var(--border-glass)'}`, borderRadius: '10px', cursor: 'pointer', background: answers[q.id] === o.id ? 'rgba(20,184,166,0.12)' : 'transparent' }}>
              <input type="radio" name={`q-${q.id}`} checked={answers[q.id] === o.id} onChange={() => onSelect(q.id, o.id)} style={{ accentColor: 'var(--cyan-accent)' }} />
              <span style={{ fontSize: '14px' }}>{o.id.toUpperCase()}. {o.text}</span>
            </label>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ตอบแล้ว {answered} จาก {questions.length} ข้อ {timeExpired ? '&#8226; หมดเวลาแล้ว' : ''}</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {currentIndex > 0 && (<button onClick={() => setCurrentIndex(currentIndex - 1)} className="btn btn-secondary btn-sm" disabled={submitting}>ก่อนหน้า</button>)}
          <button onClick={onSubmit} className="btn btn-primary" disabled={submitting || timeExpired}>{submitting ? 'กำลังส่ง...' : timeExpired ? 'ส่งคำตอบ (หมดเวลา)' : 'ส่งคำตอบ'}</button>
        </div>
      </div>
      {timeExpired && (<div style={{ marginTop: '10px', color: 'var(--ruby-danger)', fontSize: '13px', textAlign: 'center', fontWeight: 600 }}>หมดเวลาทำแบบทดสอบ ระบบจะส่งคำตอบที่ทำไว้โดยอัตโนมัติ</div>)}
    </div>
  );
}
