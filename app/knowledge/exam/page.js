// app/knowledge/exam/page.js
// หน้าเข้าทำแบบทดสอบความรู้ (Exam Taker) - รองรับการสุ่มข้อสอบ สุ่มตัวเลือก และตรวจผลสอบพร้อมเฉลย
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  Lock, 
  RotateCw, 
  HelpCircle, 
  Award, 
  Check, 
  X,
  FileQuestion,
  ListOrdered,
  Shuffle
} from 'lucide-react';

const THAI_OPTION_LABELS = ['ก.', 'ข.', 'ค.', 'ง.', 'จ.'];

export default function ExamPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [examId, setExamId] = useState('exm-claims-basic');
  const [availableExams, setAvailableExams] = useState([]);
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
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('rta_user');
    let currentUser = null;
    if (saved) {
      try {
        currentUser = JSON.parse(saved);
        setUser(currentUser);
      } catch (e) {}
    }

    const searchParams = new URLSearchParams(window.location.search);
    const targetExamId = searchParams.get('examId') || 'exm-claims-basic';
    setExamId(targetExamId);

    initExam(targetExamId, currentUser);
  }, []);

  const initExam = async (targetExamId, currentUser = user) => {
    setLoading(true);
    setError('');
    setResult(null);
    setAnswers({});
    setCurrentIndex(0);

    try {
      const uid = currentUser?.id;
      if (!uid) {
        throw new Error('กรุณาเข้าสู่ระบบก่อนเข้าทำแบบทดสอบ');
      }

      // ดึงรายการแบบทดสอบทั้งหมด
      const examsRes = await fetch('/api/knowledge/exams');
      const examsData = await examsRes.json();
      if (examsData.success && Array.isArray(examsData.exams)) {
        setAvailableExams(examsData.exams);
        const currentExam = examsData.exams.find((e) => e.id === targetExamId) || examsData.exams[0];
        setExam(currentExam);
      }

      // ตรวจสอบสถานะการเปิดสอบ
      const canAccessRes = await fetch(`/api/knowledge/can-access?userId=${encodeURIComponent(uid)}`);
      const canAccessData = await canAccessRes.json();
      setWindowStatus(canAccessData.success ? canAccessData.windowOpen : null);

      // ดึงข้อสอบแบบสุ่ม พร้อมสลับตัวเลือกคำตอบ และซ่อนเฉลย
      const qRes = await fetch(
        `/api/knowledge/questions?examId=${encodeURIComponent(targetExamId)}&hideAnswers=true`
      );
      const qData = await qRes.json();
      if (!qRes.ok || !qData.success) {
        throw new Error(qData.message || 'โหลดชุดข้อสอบไม่สำเร็จ');
      }

      if (!qData.questions || qData.questions.length === 0) {
        throw new Error('ยังไม่มีข้อสอบในชุดแบบทดสอบนี้ กรุณาติดต่อผู้ดูแลระบบ');
      }

      setQuestions(qData.questions);

      // เริ่มต้นตัวจับเวลานับถอยหลัง
      const timeLimitMinutes = exam?.timeLimitMinutes || 30;
      const totalSeconds = timeLimitMinutes * 60;
      startTimer(totalSeconds);

    } catch (e) {
      setError(e.message || 'เกิดข้อผิดพลาดในการโหลดแบบทดสอบ');
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
        if (t <= 1) {
          clearInterval(timerId);
          handleAutoSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const handleAutoSubmit = () => {
    onSubmit();
  };

  const onSelectOption = (questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const onSubmit = async () => {
    if (submitting) return;
    if (timerId) clearInterval(timerId);

    const uid = user?.id;
    if (!uid) return;

    setSubmitting(true);
    setShowConfirmSubmit(false);

    try {
      const answeredList = questions.map((q) => ({
        questionId: q.id,
        selectedOptionId: answers[q.id] || null
      }));

      const res = await fetch('/api/knowledge/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: uid,
          examId: exam?.id || examId,
          answers: answeredList
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'ส่งผลสอบไม่สำเร็จ');
      }

      setResult(data.attempt);
    } catch (err) {
      setError(err.message || 'ส่งผลสอบไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  const fmtTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div className="glass-panel" style={{ padding: '36px', display: 'flex', alignItems: 'center', gap: '14px', borderRadius: '16px' }}>
          <Clock size={24} style={{ color: 'var(--cyan-accent)', animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: '15px' }}>กำลังสุ่มจัดเตรียมข้อสอบและตัวเลือก...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ paddingTop: '70px', maxWidth: '600px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '40px 32px', borderRadius: '16px' }}>
          <AlertCircle size={44} style={{ color: 'var(--ruby-danger)', margin: '0 auto 16px' }} />
          <h1 style={{ fontSize: '20px', marginBottom: '8px' }}>ไม่สามารถเริ่มทำแบบทดสอบได้</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>{error}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button onClick={() => initExam(examId)} className="btn btn-primary" style={{ padding: '10px 20px' }}>
              <RotateCw size={15} />
              <span>ลองใหม่อีกครั้ง</span>
            </button>
            <Link href="/knowledge" className="btn btn-secondary" style={{ padding: '10px 20px' }}>
              กลับสู่คลังความรู้
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // แสดงผลลัพธ์การสอบและเฉลยคำตอบ (Result & Answer Review)
  if (result) {
    const isPassed = result.passed;
    const scoreColor = isPassed ? 'var(--emerald-success)' : 'var(--ruby-danger)';

    return (
      <div className="container" style={{ paddingTop: '28px', maxWidth: '840px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
          <Link href="/knowledge" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ChevronLeft size={16} />
            <span>กลับคลังความรู้</span>
          </Link>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>ผลการทดสอบความรู้</h1>
          <span className={`badge ${isPassed ? 'badge-emerald' : 'badge-red'}`}>
            {isPassed ? '✓ ผ่านเกณฑ์' : '✗ ไม่ผ่านเกณฑ์'}
          </span>
        </div>

        {/* Score Summary Card */}
        <div className="glass-panel" style={{ padding: '32px 24px', textAlign: 'center', marginBottom: '24px', borderTop: `5px solid ${scoreColor}` }}>
          
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: isPassed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `2px solid ${scoreColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: scoreColor,
            fontSize: '32px',
            fontWeight: 800
          }}>
            {result.score}
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '6px 0', color: scoreColor }}>
            {isPassed ? 'ผ่านเกณฑ์การทดสอบ (ดีเยี่ยม)' : 'ยังไม่ผ่านเกณฑ์การทดสอบ'}
          </h2>

          <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '520px', margin: '8px auto 20px', lineHeight: 1.6 }}>
            {isPassed 
              ? 'ยินดีด้วย! ท่านทำแบบทดสอบผ่านเกณฑ์เรียบร้อยแล้ว ได้รับสิทธิ์ใช้งานระบบเสนอขอรับสิทธิเงินค่าสินไหมทดแทนได้เต็มรูปแบบ'
              : `เกณฑ์คะแนนผ่านคือ ${exam?.passingScore || 80}% ท่านได้ ${result.score}% กรุณาศึกษาคู่มือและวิดีโอเพิ่มเติม แล้วทดสอบใหม่อีกครั้ง`}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', fontSize: '13.5px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px', maxWidth: '460px', margin: '0 auto' }}>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>ตอบถูก: </span>
              <strong style={{ color: 'var(--emerald-success)' }}>{result.correctAnswers}</strong> / {result.totalQuestions} ข้อ
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>คะแนนรวม: </span>
              <strong style={{ color: 'var(--gold-primary)' }}>{result.score}</strong> / 100
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>เวลาที่ใช้: </span>
              <strong>{Math.floor((result.timeSpentSeconds || 0) / 60)} นาที</strong>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
            <Link href="/knowledge" className="btn btn-primary" style={{ padding: '10px 24px' }}>
              <ShieldCheck size={16} />
              <span>กลับหน้าหลักคลังความรู้</span>
            </Link>

            <button 
              type="button"
              onClick={() => initExam(exam?.id || examId)}
              className="btn btn-secondary" 
              style={{ padding: '10px 20px' }}
            >
              <RotateCw size={15} />
              <span>สอบใหม่ (สุ่มชุดข้อสอบใหม่)</span>
            </button>
          </div>

        </div>

        {/* Detailed Question Review */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ListOrdered size={18} color="var(--cyan-accent)" />
            <span>ทบทวนและเฉลยคำตอบอย่างละเอียด (Answer Review)</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {result.answers && result.answers.map((ans, idx) => {
              const isCorrect = ans.isCorrect;

              return (
                <div 
                  key={ans.questionId || idx}
                  style={{
                    padding: '16px 18px',
                    borderRadius: '10px',
                    background: isCorrect ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                    border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: isCorrect ? 'var(--emerald-success)' : 'var(--ruby-danger)',
                      color: '#070d1e',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '13px',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      {isCorrect ? '✓' : '✕'}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14.5px', fontWeight: 600, color: '#fff' }}>
                        ข้อที่ {idx + 1}. {ans.questionText}
                      </div>

                      <div style={{ display: 'flex', gap: '20px', marginTop: '10px', fontSize: '13px', flexWrap: 'wrap' }}>
                        <div>
                          <span style={{ color: 'var(--text-dim)' }}>คำตอบของท่าน: </span>
                          <span style={{ fontWeight: 600, color: isCorrect ? 'var(--emerald-success)' : 'var(--ruby-danger)' }}>
                            {ans.selectedOptionText || 'ไม่ได้เลือกคำตอบ'}
                          </span>
                        </div>

                        {!isCorrect && (
                          <div>
                            <span style={{ color: 'var(--text-dim)' }}>คำตอบที่ถูกต้อง: </span>
                            <span style={{ fontWeight: 600, color: 'var(--emerald-success)' }}>
                              {ans.correctOptionText}
                            </span>
                          </div>
                        )}
                      </div>

                      {ans.explanation && (
                        <div style={{ marginTop: '8px', fontSize: '12.5px', color: 'var(--cyan-accent)', background: 'rgba(20, 184, 166, 0.1)', padding: '6px 10px', borderRadius: '6px' }}>
                          💡 <strong>คำอธิบาย:</strong> {ans.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    );
  }

  // หน้าจอขณะกำลังทำแบบทดสอบ (Active Exam UI)
  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const totalCount = questions.length;
  const progressPercent = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;
  const isTimeExpired = timeLeft <= 0;

  return (
    <div className="container" style={{ paddingTop: '20px', maxWidth: '860px' }}>
      
      {/* Top Bar with Timer and Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <Link href="/knowledge" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ChevronLeft size={16} />
          <span>ออกจากการสอบ</span>
        </Link>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{exam?.title || 'แบบทดสอบความรู้'}</div>
          <div style={{ fontSize: '11px', color: 'var(--gold-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Shuffle size={12} />
            <span>สุ่มข้อสอบและตัวเลือกอัตโนมัติ</span>
          </div>
        </div>

        {/* Countdown Timer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '20px',
          background: timeLeft < 300 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(20, 184, 166, 0.15)',
          border: `1px solid ${timeLeft < 300 ? 'var(--ruby-danger)' : 'var(--cyan-accent)'}`,
          color: timeLeft < 300 ? 'var(--ruby-danger)' : 'var(--cyan-accent)',
          fontWeight: 700,
          fontSize: '14px'
        }}>
          <Clock size={16} />
          <span>{fmtTime(timeLeft)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', marginBottom: '18px', overflow: 'hidden' }}>
        <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, var(--cyan-accent), var(--emerald-success))', transition: 'width 0.25s ease' }} />
      </div>

      {/* Question Number Pills Navigation */}
      <div className="glass-panel" style={{ padding: '12px 16px', marginBottom: '18px' }}>
        <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
          <span>นำทางข้อสอบ (คลิกเพื่อข้ามข้อได้ทันที):</span>
          <span>ตอบแล้ว {answeredCount} จาก {totalCount} ข้อ</span>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {questions.map((q, idx) => {
            const isAnswered = Boolean(answers[q.id]);
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={q.id || idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  border: isCurrent ? '2px solid var(--cyan-accent)' : '1px solid var(--border-subtle)',
                  background: isCurrent 
                    ? 'rgba(20, 184, 166, 0.3)' 
                    : isAnswered 
                      ? 'rgba(16, 185, 129, 0.2)' 
                      : 'rgba(255, 255, 255, 0.04)',
                  color: isCurrent ? '#fff' : isAnswered ? '#6ee7b7' : 'var(--text-dim)',
                  fontWeight: isCurrent || isAnswered ? 700 : 400,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Card */}
      {currentQ && (
        <div className="glass-panel" style={{ padding: '28px 24px', marginBottom: '20px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--cyan-accent)' }}>
              ข้อที่ {currentIndex + 1} จาก {totalCount}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
              คะแนนข้อนี้: {currentQ.points || 10} คะแนน
            </span>
          </div>

          <h2 style={{ fontSize: '16.5px', fontWeight: 600, color: '#fff', lineHeight: 1.6, marginBottom: '22px' }}>
            {currentQ.questionText}
          </h2>

          {/* Options (ตัวเลือกคำตอบ สุ่มลำดับมาแล้ว) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {currentQ.options && currentQ.options.map((option, optIdx) => {
              const isSelected = answers[currentQ.id] === option.id;
              const label = THAI_OPTION_LABELS[optIdx] || `${optIdx + 1}.`;

              return (
                <label
                  key={option.id || optIdx}
                  onClick={() => onSelectOption(currentQ.id, option.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    background: isSelected ? 'rgba(20, 184, 166, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? '1.5px solid var(--cyan-accent)' : '1px solid var(--border-glass)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: isSelected ? '2px solid var(--cyan-accent)' : '1px solid var(--text-dim)',
                    background: isSelected ? 'var(--cyan-accent)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#070d1e',
                    fontSize: '11px',
                    fontWeight: 800,
                    flexShrink: 0
                  }}>
                    {isSelected && '✓'}
                  </div>

                  <span style={{ fontSize: '14px', fontWeight: 600, color: isSelected ? 'var(--cyan-accent)' : 'var(--text-dim)', width: '22px' }}>
                    {label}
                  </span>

                  <span style={{ fontSize: '14px', color: '#fff', flex: 1, lineHeight: 1.5 }}>
                    {option.text}
                  </span>
                </label>
              );
            })}
          </div>

        </div>
      )}

      {/* Bottom Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <button
          type="button"
          onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
          disabled={currentIndex === 0}
          className="btn btn-secondary"
          style={{ opacity: currentIndex === 0 ? 0.4 : 1 }}
        >
          <ChevronLeft size={16} />
          <span>ข้อก่อนหน้า</span>
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          {currentIndex < totalCount - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIndex((idx) => Math.min(totalCount - 1, idx + 1))}
              className="btn btn-primary"
            >
              <span>ข้อถัดไป</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (answeredCount < totalCount) {
                  setShowConfirmSubmit(true);
                } else {
                  onSubmit();
                }
              }}
              className="btn btn-success"
              style={{ padding: '10px 24px', fontSize: '14px', fontWeight: 700 }}
              disabled={submitting}
            >
              <CheckCircle2 size={16} />
              <span>{submitting ? 'กำลังส่งคำตอบ...' : 'ส่งคำตอบและตรวจผลสอบ'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal before Submit */}
      {showConfirmSubmit && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(5px)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '28px', background: 'rgba(5, 22, 26, 0.98)', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.2)', color: 'var(--amber-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <AlertCircle size={26} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
              ยังมีข้อสอบที่ไม่ได้ตอบ
            </h3>

            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.6 }}>
              ท่านตอบข้อสอบไปแล้ว <strong>{answeredCount}</strong> จากทั้งหมด <strong>{totalCount}</strong> ข้อ<br />
              (เหลืออีก <span style={{ color: 'var(--amber-warning)', fontWeight: 700 }}>{totalCount - answeredCount}</span> ข้อที่ยังไม่ได้เลือกคำตอบ)
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => setShowConfirmSubmit(false)} 
                className="btn btn-secondary"
              >
                กลับไปทำต่อ
              </button>
              <button 
                type="button" 
                onClick={onSubmit} 
                disabled={submitting} 
                className="btn btn-primary"
              >
                {submitting ? 'กำลังส่ง...' : 'ยืนยันส่งคำตอบ'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
