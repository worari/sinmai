// app/knowledge/admin/page.js
// จัดการแบบทดสอบความรู้และชุดข้อสอบ (สำหรับผู้ดูแลระบบ ADMIN)
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, ShieldAlert, PlusCircle, Edit3, Trash2, Clock, Save, CheckCircle2, ChevronRight, List, Layout } from 'lucide-react';

const ADMIN_ROLES = ['ADMIN'];

export default function KnowledgeAdminPage() {
  const [user, setUser] = useState(null);
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [error, setError] = useState('');
  const [examError, setExamError] = useState('');
  const [questionError, setQuestionError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', passingScore: 80, timeLimitMinutes: 30, questionCount: 10, isActive: true, openAt: '', closeAt: '', instructions: '' });
  const [qForm, setQForm] = useState({ examId: '', questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'a', points: 10, orderIndex: 1 });
  const [saving, setSaving] = useState(false);
  const [qSaving, setQSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('rta_user');
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch (e) {}
    }
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      const res = await fetch('/api/knowledge/exams');
      const data = await res.json();
      if (data.success) setExams(data.exams);
    } catch (e) {
      setExamError('โหลดรายการแบบทดสอบไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async (examId) => {
    setSelectedExamId(examId);
    setEditingQuestionId(null);
    setQForm({ examId, questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'a', points: 10, orderIndex: 1 });
    setQuestionError('');
    try {
      setQuestionLoading(true);
      const res = await fetch(`/api/knowledge/questions?examId=${encodeURIComponent(examId)}`);
      const data = await res.json();
      if (data.success) setQuestions(data.questions);
    } catch (e) {
      setQuestionError('โหลดข้อสอบไม่สำเร็จ');
    } finally {
      setQuestionLoading(false);
    }
  };

  const isAdmin = user && ADMIN_ROLES.includes(user.role);
  if (!user) return null;
  if (!isAdmin) {
    return (
      <div className="container" style={{ paddingTop: '70px', maxWidth: '600px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '40px 32px', borderRadius: '12px' }}>
          <ShieldAlert size={40} style={{ color: 'var(--ruby-danger)', marginBottom: '16px' }} />
          <h1 style={{ fontSize: '20px', marginBottom: '8px' }}>ไม่มีสิทธิเข้าถึงเมนูนี้</h1>
          <p style={{ color: 'var(--text-muted)' }}>เฉพาะผู้ดูแลระบบ (ADMIN) เท่านั้นที่จัดการแบบทดสอบความรู้ได้</p>
          <Link href="/knowledge" className="btn btn-secondary">กลับคลังความรู้</Link>
        </div>
      </div>
    );
  }

  // ---------- Exam (แบบทดสอบ) ----------
  const handleSaveExam = async (e) => {
    e.preventDefault();
    setExamError('');
    setSaving(true);
    try {
      const body = { ...form, passingScore: Number(form.passingScore) || 80, timeLimitMinutes: Number(form.timeLimitMinutes) || 30, questionCount: Number(form.questionCount) || 10, openAt: form.openAt || null, closeAt: form.closeAt || null };
      if (editingId) {
        await fetch('/api/knowledge/exams', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingId, ...body }) });
      } else {
        await fetch('/api/knowledge/exams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      }
      setEditingId(null);
      setForm({ title: '', description: '', passingScore: 80, timeLimitMinutes: 30, questionCount: 10, isActive: true, openAt: '', closeAt: '', instructions: '' });
      loadExams();
    } catch (e) {
      setExamError('บันทึกแบบทดสอบไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id, current) => {
    setExamError('');
    try {
      await fetch('/api/knowledge/exams', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, isActive: !current }) });
      loadExams();
    } catch (e) {
      setExamError('เปลี่ยนสถานะไม่สำเร็จ');
    }
  };

  const removeExam = async (id) => {
    if (!confirm('ยืนยันลบแบบทดสอบนี้หรือไม่? (ข้อสอบและประวัติการสอบที่เกี่ยวข้องจะถูกลบด้วย)')) return;
    setExamError('');
    try {
      await fetch(`/api/knowledge/exams?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (selectedExamId === id) setSelectedExamId(null);
      loadExams();
    } catch (e) {
      setExamError('ลบแบบทดสอบไม่สำเร็จ');
    }
  };

  const selectExamForQuestions = (exam) => {
    setEditingId(null);
    setForm({ title: '', description: '', passingScore: 80, timeLimitMinutes: 30, questionCount: 10, isActive: true, openAt: '', closeAt: '', instructions: '' });
    loadQuestions(exam.id);
  };

  // ---------- Question (ข้อสอบ) ----------
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    setQuestionError('');
    setQSaving(true);
    try {
      const body = {
        ...qForm,
        examId: selectedExamId,
        points: Number(qForm.points) || 10,
        orderIndex: Number(qForm.orderIndex) || 1
      };
      if (editingQuestionId) {
        await fetch('/api/knowledge/questions', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingQuestionId, ...body }) });
      } else {
        await fetch('/api/knowledge/questions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      }
      setEditingQuestionId(null);
      setQForm({ examId: selectedExamId || '', questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'a', points: 10, orderIndex: 1 });
      loadQuestions(selectedExamId);
    } catch (e) {
      setQuestionError('บันทึกข้อสอบไม่สำเร็จ');
    } finally {
      setQSaving(false);
    }
  };

  const removeQuestion = async (id) => {
    if (!confirm('ยืนยันลบข้อสอบข้อนี้หรือไม่?')) return;
    setQuestionError('');
    try {
      await fetch(`/api/knowledge/questions?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      loadQuestions(selectedExamId);
    } catch (e) {
      setQuestionError('ลบข้อสอบไม่สำเร็จ');
    }
  };

  const editQuestion = (q) => {
    setEditingQuestionId(q.id);
    setQForm({
      examId: q.examId,
      questionText: q.questionText || '',
      optionA: (q.options && q.options.find((o) => o.id === 'a')?.text) || '',
      optionB: (q.options && q.options.find((o) => o.id === 'b')?.text) || '',
      optionC: (q.options && q.options.find((o) => o.id === 'c')?.text) || '',
      optionD: (q.options && q.options.find((o) => o.id === 'd')?.text) || '',
      correctOption: (q.options && q.options.find((o) => o.isCorrect))?.id || 'a',
      points: q.points || 10,
      orderIndex: q.orderIndex || 1
    });
  };

  const fmtDateTime = (v) => { if (!v) return '-'; return new Date(v).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }); };
  const selectedExam = exams.find((e) => e.id === selectedExamId) || null;

  return (
    <div className="container" style={{ paddingTop: '20px', maxWidth: '1180px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', marginBottom: '4px' }}>จัดการแบบทดสอบและชุดข้อสอบ</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px' }}>สร้างแบบทดสอบ กำหนดเกณฑ์คะแนน ช่วงเวลาเปิด-ปิด และจัดการชุดข้อสอบในแต่ละแบบทดสอบ</p>
        </div>
        <Link href="/knowledge" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><BookOpen size={16} /> กลับคลังความรู้</Link>
      </div>

      {examError && (<div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '12px', color: 'var(--ruby-danger)', fontSize: '13px', marginBottom: '16px' }}>{examError}</div>)}

      {/* ===== ส่วนที่ 1: จัดการแบบทดสอบ (Exam) ===== */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layout size={18} style={{ color: 'var(--gold-primary)' }} /> {editingId ? ' แก้ไขแบบทดสอบ' : ' สร้างแบบทดสอบใหม่'}
        </div>
        <form onSubmit={handleSaveExam} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '14px', alignItems: 'end' }}>
          <div><label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>ชื่อแบบทดสอบ *</label><input className="form-input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>คะแนนผ่าน (0-100) *</label><input className="form-input" type="number" min="0" max="100" required value={form.passingScore || ''} onChange={(e) => setForm({ ...form, passingScore: e.target.value })} /></div>
          <div><label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>เวลาสอบ (นาที)</label><input className="form-input" type="number" min="1" value={form.timeLimitMinutes || ''} onChange={(e) => setForm({ ...form, timeLimitMinutes: e.target.value })} /></div>
          <div><label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>จำนวนข้อสอบ</label><input className="form-input" type="number" min="1" value={form.questionCount || ''} onChange={(e) => setForm({ ...form, questionCount: e.target.value })} /></div>
          <div><label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>เปิดสอบตั้งแต่ (วัน-เวลา)</label><input className="form-input" type="datetime-local" value={form.openAt} onChange={(e) => setForm({ ...form, openAt: e.target.value })} /></div>
          <div><label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>ปิดสอบ (วัน-เวลา)</label><input className="form-input" type="datetime-local" value={form.closeAt} onChange={(e) => setForm({ ...form, closeAt: e.target.value })} /></div>
          <div style={{ gridColumn: '1 / -1' }}><label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>คำแนะนำสำหรับผู้สอบ</label><textarea className="form-input" rows="2" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} /></div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '10px' }}><label style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>{form.isActive ? <span style={{ color: 'var(--emerald-success)', fontWeight: 700 }}>&#10004;</span> : <span style={{ color: 'var(--text-dim)' }}>&#10006;</span>} เปิดใช้งานแบบทดสอบ</label><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} style={{ display: 'none' }} /></div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '10px 24px' }}>{saving ? <Save size={16} /> : ''} {editingId ? 'บันทึกการแก้ไข' : 'สร้างแบบทดสอบ'}</button>
            {editingId && (<button type="button" onClick={() => { setEditingId(null); setForm({ title: '', description: '', passingScore: 80, timeLimitMinutes: 30, questionCount: 10, isActive: true, openAt: '', closeAt: '', instructions: '' }); }} className="btn btn-secondary" style={{ padding: '10px 24px' }}>ยกเลิก</button>)}
          </div>
        </form>
      </div>

      {/* ===== ส่วนที่ 2: รายการแบบทดสอบ + จัดการข้อสอบ ===== */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>รายการแบบทดสอบในระบบ</div>
        {loading ? (<div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>กำลังโหลด...</div>) : exams.length === 0 ? (<div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>ยังไม่มีแบบทดสอบในระบบ กรุณาสร้างแบบทดสอบใหม่ด้านบน</div>) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead><tr style={{ borderBottom: '2px solid var(--border-glass)', textAlign: 'left' }}><th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>ชื่อแบบทดสอบ</th><th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>คะแนนผ่าน</th><th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>สถานะ</th><th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>ช่วงเวลาเปิด-ปิด</th><th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>จัดการข้อสอบ</th><th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>จัดการแบบทดสอบ</th></tr></thead>
              <tbody>
                {exams.map((ex) => {
                  const isSelected = selectedExamId === ex.id;
                  return (
                    <tr key={ex.id} style={{ borderBottom: '1px solid var(--border-subtle)', background: isSelected ? 'rgba(20,184,166,0.08)' : 'transparent' }}>
                      <td style={{ padding: '10px 8px', fontWeight: 600 }}>{ex.title}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700, color: 'var(--gold-primary)' }}>{ex.passingScore} คะแนน</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>{ex.isActive ? (<span style={{ color: 'var(--emerald-success)', fontSize: '12px', fontWeight: 600 }}>เปิดใช้งาน</span>) : (<span style={{ color: 'var(--ruby-danger)', fontSize: '12px', fontWeight: 600 }}>ปิดใช้งาน</span>)}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>เปิด {fmtDateTime(ex.openAt)}<br />ปิด {fmtDateTime(ex.closeAt)}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        <button onClick={() => selectExamForQuestions(ex)} className="btn btn-secondary btn-sm" style={{ padding: '6px 12px', fontSize: '12px', width: '100%' }}>{isSelected ? 'กำลังจัดการข้อสอบ' : 'จัดการข้อสอบ'}</button>
                        <div style={{ marginTop: '6px' }}><button onClick={() => toggleActive(ex.id, ex.isActive)} className="btn btn-outline btn-sm" style={{ padding: '4px 10px', fontSize: '11px', width: '100%' }}>{ex.isActive ? 'ปิดการใช้งาน' : 'เปิดการใช้งาน'}</button></div>
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        <button onClick={() => { setEditingId(ex.id); setForm({ title: ex.title, description: ex.description || '', passingScore: ex.passingScore, timeLimitMinutes: ex.timeLimitMinutes, questionCount: ex.questionCount, isActive: ex.isActive, openAt: ex.openAt ? new Date(ex.openAt).toISOString().slice(0,16) : '', closeAt: ex.closeAt ? new Date(ex.closeAt).toISOString().slice(0,16) : '', instructions: ex.instructions || '' }); }} className="btn btn-outline btn-sm" style={{ padding: '6px 12px', fontSize: '12px', width: '100%', marginBottom: '4px' }}>แก้ไข</button>
                        <button onClick={() => removeExam(ex.id)} className="btn btn-danger btn-sm" style={{ padding: '6px 12px', fontSize: '12px', width: '100%' }}>ลบ</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ===== ส่วนที่ 3: จัดการชุดข้อสอบของแบบทดสอบที่เลือก ===== */}
        {selectedExamId && (
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '2px solid var(--border-glass)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <List size={18} style={{ color: 'var(--cyan-accent)' }} />
                <span style={{ fontSize: '15px', fontWeight: 700 }}>ชุดข้อสอบของ: <span style={{ color: 'var(--gold-primary)' }}>{selectedExam?.title || ''}</span></span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => setSelectedExamId(null)} className="btn btn-secondary btn-sm" style={{ padding: '6px 12px', fontSize: '12px' }}>ยกเลิกการเลือก</button>
              </div>
            </div>

            {questionError && (<div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px', color: 'var(--ruby-danger)', fontSize: '13px', marginBottom: '12px' }}>{questionError}</div>)}

            {/* ฟอร์มสร้าง/แก้ไขคำถาม */}
            <div className="glass-panel" style={{ padding: '18px', borderRadius: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {editingQuestionId ? <Edit3 size={18} style={{ color: 'var(--gold-primary)' }} /> : <PlusCircle size={18} style={{ color: 'var(--cyan-accent)' }} />}
                {editingQuestionId ? ' แก้ไขคำถาม' : ' เพิ่มคำถามใหม่ในชุดข้อสอบ'}
              </div>
              <form onSubmit={handleSaveQuestion} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '12px', alignItems: 'end' }}>
                <div style={{ gridColumn: '1 / -1' }}><label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>ข้อความคำถาม *</label><input className="form-input" required value={qForm.questionText} onChange={(e) => setQForm({ ...qForm, questionText: e.target.value })} /></div>
                <div><label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>ตัวเลือก ก</label><input className="form-input" required value={qForm.optionA} onChange={(e) => setQForm({ ...qForm, optionA: e.target.value })} /></div>
                <div><label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>ตัวเลือก ข</label><input className="form-input" required value={qForm.optionB} onChange={(e) => setQForm({ ...qForm, optionB: e.target.value })} /></div>
                <div><label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>ตัวเลือก ค</label><input className="form-input" required value={qForm.optionC} onChange={(e) => setQForm({ ...qForm, optionC: e.target.value })} /></div>
                <div><label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>ตัวเลือก ง</label><input className="form-input" required value={qForm.optionD} onChange={(e) => setQForm({ ...qForm, optionD: e.target.value })} /></div>
                <div><label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>ตัวเลือกที่ถูกต้อง *</label><select className="form-input" required value={qForm.correctOption} onChange={(e) => setQForm({ ...qForm, correctOption: e.target.value })}>
                  <option value="a">ก. {qForm.optionA}</option>
                  <option value="b">ข. {qForm.optionB}</option>
                  <option value="c">ค. {qForm.optionC}</option>
                  <option value="d">ง. {qForm.optionD}</option>
                </select></div>
                <div><label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>คะแนน</label><input className="form-input" type="number" min="1" value={qForm.points || ''} onChange={(e) => setQForm({ ...qForm, points: e.target.value })} /></div>
                <div><label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>ลำดับข้อ</label><input className="form-input" type="number" min="1" value={qForm.orderIndex || ''} onChange={(e) => setQForm({ ...qForm, orderIndex: e.target.value })} /></div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn btn-primary" disabled={qSaving} style={{ padding: '10px 24px' }}>{qSaving ? <Save size={16} /> : ''} {editingQuestionId ? 'บันทึกคำถาม' : 'เพิ่มคำถาม'}</button>
                  {editingQuestionId && (<button type="button" onClick={() => { setEditingQuestionId(null); setQForm({ examId: selectedExamId || '', questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'a', points: 10, orderIndex: 1 }); }} className="btn btn-secondary" style={{ padding: '10px 24px' }}>ยกเลิก</button>)}
                </div>
              </form>
            </div>

            {/* ตารางคำถาม */}
            <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>รายการคำถามในชุดนี้ ({questions.length} ข้อ)</div>
            {questionLoading ? (<div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>กำลังโหลดข้อสอบ...</div>) : questions.length === 0 ? (<div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>ยังไม่มีคำถามในชุดข้อสอบนี้ กรุณาเพิ่มคำถามใหม่ด้านบน</div>) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead><tr style={{ borderBottom: '2px solid var(--border-glass)', textAlign: 'left' }}><th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontWeight: 600, width: '40px' }}>ลำดับ</th><th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>คำถาม</th><th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center', width: '120px' }}>เฉลย</th><th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center', width: '80px' }}>คะแนน</th><th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center', width: '130px' }}>จัดการ</th></tr></thead>
                  <tbody>
                    {questions.map((q) => {
                      const correctOpt = q.options?.find((o) => o.isCorrect)?.id || '-';
                      return (
                        <tr key={q.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 600, color: 'var(--gold-primary)' }}>{q.orderIndex}</td>
                          <td style={{ padding: '10px 8px' }}>{q.questionText}</td>
                          <td style={{ padding: '10px 8px', textAlign: 'center' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--emerald-success)' }}><CheckCircle2 size={14} /> {correctOpt.toUpperCase()}</span></td>
                          <td style={{ padding: '10px 8px', textAlign: 'center' }}>{q.points} คะแนน</td>
                          <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                            <button onClick={() => editQuestion(q)} className="btn btn-outline btn-sm" style={{ padding: '5px 10px', fontSize: '11px', marginBottom: '4px', width: '100%', border: '1px solid var(--border-glass)' }}>แก้ไข</button>
                            <button onClick={() => removeQuestion(q.id)} className="btn btn-danger btn-sm" style={{ padding: '5px 10px', fontSize: '11px', width: '100%' }}>ลบ</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
