// app/knowledge/admin/page.js
// จัดการแบบทดสอบความรู้และชุดข้อสอบ (สำหรับผู้ดูแลระบบ ADMIN)
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, ShieldAlert, PlusCircle, Edit3, Trash2, Clock, Save, CheckCircle2, ChevronRight, List, Layout } from 'lucide-react';

const ADMIN_ROLES = ['ADMIN', 'KSP_OFFICER', 'UNIT_OFFICER'];  // ปรับให้หลายบทบาทสามารถจัดการข้อมูลข้อสอบได้

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
  // ---------- Excel Import state ----------

      {/* ถอดรหัสพารามิเตอร์ query string (ถ้ามี) */}
      const queryParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
      const activeTab = queryParams.get('tab') || 'exams';

      const tabs = [
        { id: 'exams', label: 'จัดการแบบทดสอบ', icon: Layout },
        { id: 'bank', label: 'ธนาคารคำถามกลาง', icon: BookOpen },
        { id: 'import', label: 'นำเข้าจาก Excel', icon: PlusCircle }
      ];

      const switchTab = (tabId) => {
        window.location.href = `/knowledge/admin?tab=${tabId}`;
      };
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [importExamId, setImportExamId] = useState(selectedExamId || '');
  const [importSaving, setImportSaving] = useState(false);

  // ---------- ธนาคารคำถามกลาง (Question Bank) state ----------
  const [bankLoading, setBankLoading] = useState(false);
  const [bankQuestions, setBankQuestions] = useState([]);
  const [bankQuestionError, setBankQuestionError] = useState('');
  const [bankSelectedId, setBankSelectedId] = useState('');
  const [bankSearch, setBankSearch] = useState('');
  const [bankCategory, setBankCategory] = useState('');
  const [bankDifficulty, setBankDifficulty] = useState('');
  const [bankTags, setBankTags] = useState('');
  const [bankCategoryError, setBankCategoryError] = useState('');
  const [creatingQuestion, setCreatingQuestion] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('rta_user');
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch (e) {}
    }
    loadExams();
    loadBankQuestions();
  }, []);
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

  // ---------- Excel Import ----------

  const handleImportFileChange = (e) => {
    setImportFile(e.target.files[0]);
    setImportPreview(null);
  };

  // ---------- ธนาคารคำถามกลาง (Question Bank) ----------
  const loadBankQuestions = async (filter = null) => {
    setBankQuestionError('');
    setBankLoading(true);
    try {
      const params = [];
      if (filter?.examId) params.push(`examId=${encodeURIComponent(filter.examId)}`);
      if (bankSearch) params.push(`search=${encodeURIComponent(bankSearch)}`);
      if (bankCategory) params.push(`category=${encodeURIComponent(bankCategory)}`);
      if (bankDifficulty) params.push(`difficulty=${encodeURIComponent(bankDifficulty)}`);
      if (bankTags) params.push(`tags=${encodeURIComponent(bankTags)}`);
      const query = params.length > 0 ? '?' + params.join('&') : '';
      const res = await fetch(`/api/knowledge/bank${query}`);
      const data = await res.json();
      if (data.success) setBankQuestions(data.questions);
    } catch (e) {
      setBankQuestionError('โหลดธนาคารคำถามไม่สำเร็จ');
    } finally {
      setBankLoading(false);
    }
  };

  const createBankQuestion = async (e) => {
    e.preventDefault();
    setBankCategoryError('');
    if (!bankSelectedId) {
      setBankCategoryError('กรุณาเลือกคำถามต้นแบบจากธนาคาร');
      return;
    }
    setCreatingQuestion(true);
    try {
      const question = db.getQuestionBankById(bankSelectedId);
      if (!question) {
        setBankCategoryError('ไม่พบรายการที่เลือก');
        return;
      }
      const newQuestion = {
        questionText: question.questionText,
        options: question.options,
        points: question.points,
        category: question.category,
        difficulty: question.difficulty,
        tags: question.tags,
        source: 'admin'
      };
      await fetch('/api/knowledge/bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion)
      });
      loadBankQuestions();
      setBankSelectedId('');
      setBankCategory('');
      setBankDifficulty('');
      setBankTags('');
    } catch (e) {
      setBankCategoryError('สร้างคำถามใหม่ในธนาคารไม่สำเร็จ');
    } finally {
      setCreatingQuestion(false);
    }
  };

  const deleteBankQuestion = async (id) => {
    if (!confirm('ยืนยันลบคำถามนี้ออกจากธนาคารหรือไม่?')) return;
    setBankQuestionError('');
    try {
      await fetch(`/api/knowledge/bank/${id}`, { method: 'DELETE' });
      loadBankQuestions();
    } catch (e) {
      setBankQuestionError('ลบคำถามออกจากธนาคารไม่สำเร็จ');
    }
  };

  const copyQuestionToForm = (q) => {
    setBankSelectedId(q.id);
    setBankCategory(q.category || '');
    setBankDifficulty(q.difficulty || '');
    setBankTags(q.tags?.join(', ') || '');
  };

  const handleImportPreview = async (e) => {
    e.preventDefault();
    if (!importFile) return;
    setImportLoading(true);
    setImportPreview(null);
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      if (importExamId) formData.append('examId', importExamId);
      const res = await fetch('/api/knowledge/questions/import', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setImportPreview({ questions: data.questions, errors: [], count: data.count });
      } else {
        setImportPreview({ questions: [], errors: data.errors || [], message: data.message });
      }
    } catch (err) {
      setImportPreview({ questions: [], errors: [{ row: 0, message: err.message }], message: err.message });
    } finally {
      setImportLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!importPreview || !importPreview.questions || importPreview.questions.length === 0) return;
    setImportSaving(true);
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      if (importExamId) formData.append('examId', importExamId);
      const res = await fetch('/api/knowledge/questions/import', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setImportFile(null);
        setImportPreview(null);
        setImportExamId(selectedExamId || '');
        loadQuestions(selectedExamId);
      } else {
        setQuestionError(data.message || 'นำเข้าข้อสอบไม่สำเร็จ');
      }
    } catch (err) {
      setQuestionError(err.message || 'นำเข้าข้อสอบไม่สำเร็จ');
    } finally {
      setImportSaving(false);
    }
  };

  const handleCancelImport = () => {
    setImportFile(null);
    setImportPreview(null);
    setImportExamId(selectedExamId || '');
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



      {/* ========== แท็บ: สร้างแบบทดสอบจากธนาคารคำถามกลาง ========== */}
      {activeTab === 'exams' && (
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
          <button type="button" className="btn btn-outline btn-sm" style={{ padding: '6px 14px', fontSize: '12px', marginBottom: '12px' }} onClick={() => switchTab('bank')}>
            &larr; กลับไปธนาคารคำถามกลาง
          </button>
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <PlusCircle size={18} style={{ color: 'var(--cyan-accent)' }} />
                <h2 style={{ fontSize: '18px', margin: 0 }}>เพิ่มคำถามจากธนาคารเข้าแบบทดสอบ</h2>
              </div>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              เลือกคำถามจากธนาคารคำถามกลางแล้วเพิ่มเข้าแบบทดสอบที่เลือก
            </p>
            </div>
          </div>
        )}

      {activeTab === 'bank' && (
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BookOpen size={18} style={{ color: 'var(--gold-primary)' }} />
              <h2 style={{ fontSize: '18px', margin: 0 }}>ธนาคารคำถามกลาง</h2>
            </div>
            <Link href="/knowledge/admin?tab=exams" className="btn btn-outline btn-sm" style={{ padding: '6px 14px', fontSize: '12px' }}>
              &larr; กลับจัดการแบบทดสอบ
            </Link>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            คำถามในธนาคารนี้ไม่ผูกกับแบบทดสอบใดๆ สามารถถูกนำไปสร้างเป็นแบบทดสอบได้หลายชุดในภายหลัง
          </p>

          {/* ✅ ตรวจสอบสิทธิ์ก่อนแสดง */}
          {isAdmin ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '14px', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>เลือกคำถามต้นแบบมาวาง</label>
                  <select className="form-input" value={bankSelectedId} onChange={(e) => setBankSelectedId(e.target.value)}>
                    <option value="">-- เลือกคำถามจากธนาคาร --</option>
                    {bankQuestions.map((q) => (
                      <option key={q.id} value={q.id}>{q.questionText} ({q.category || 'ไม่ระบุ'})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>หมวดหมู่</label>
                  <input className="form-input" value={bankCategory} onChange={(e) => setBankCategory(e.target.value)} placeholder="เช่น เอกสารยื่น" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>ความยาก</label>
                  <select className="form-input" value={bankDifficulty} onChange={(e) => setBankDifficulty(e.target.value)}>
                    <option value="">เลือกความยาก (optional)</option>
                    <option value="easy">ง่าย</option>
                    <option value="medium">ปานกลาง</option>
                    <option value="hard">ยาก</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>แท็ก (comma separated)</label>
                  <input className="form-input" value={bankTags} onChange={(e) => setBankTags(e.target.value)} placeholder="เช่น เอกสาร,พื้นฐาน" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <button type="button" onClick={createBankQuestion} className="btn btn-primary" disabled={creatingQuestion || !bankSelectedId} style={{ padding: '10px 24px' }}>
                    {creatingQuestion ? 'บันทึก...' : 'สร้างคำถามใหม่ในธนาคาร'}
                  </button>
                </div>
              </div>
              {bankCategoryError && <div style={{ color: 'var(--ruby-danger)', fontSize: '13px', marginTop: '10px' }}>{bankCategoryError}</div>}
            </>
          ) : (
            <div style={{ color: 'var(--ruby-danger)', fontSize: '13px', padding: '12px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)' }}>
              ⚠️ เฉพาะผู้ดูแลระบบ (ADMIN) เท่านั้นที่สามารถจัดการข้อมูลข้อสอบและธนาคารคำถามกลางได้
            </div>
          )}
        </div>
      )}

      {/* ========== แท็บ: จัดการแบบทดสอบ (Exam) ========== */}
      {activeTab === 'exams' && (
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>

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

      {/* ===== ส่วนที่ 3: นำเข้าข้อสอบจาก Excel ===== */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PlusCircle size={18} style={{ color: 'var(--gold-primary)' }} /> นำเข้าข้อสอบจากไฟล์ Excel
        </div>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          อัปโหลดไฟล์ .xlsx ที่มีคอลัมน์: คำถาม, ตัวเลือก A-D, เฉลย (a/b/c/d), [คะแนน], [รหัสแบบทดสอบ]
        </p>

        {!importPreview ? (
          <form onSubmit={handleImportPreview} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '14px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>เลือกไฟล์ Excel *</label>
              <input type="file" accept=".xlsx" onChange={handleImportFileChange} className="form-input" required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>รหัสแบบทดสอบ</label>
              <input className="form-input" value={importExamId} onChange={(e) => setImportExamId(e.target.value)} placeholder="เช่น exm-claims-basic" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <button type="submit" className="btn btn-primary" disabled={importLoading} style={{ padding: '10px 24px' }}>
                {importLoading ? <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>กำลังอ่านไฟล์...</span> : 'อ่านตัวอย่างจากไฟล์'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ fontWeight: 600 }}>{importPreview.message || `พบคำถาม ${importPreview.questions.length} ข้อในไฟล์`}</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleCancelImport} className="btn btn-outline btn-sm">ยกเลิก</button>
                <button onClick={handleConfirmImport} className="btn btn-primary" disabled={importSaving} style={{ padding: '8px 18px' }}>
                  {importSaving ? 'กำลังนำเข้า...' : 'ยืนยันนำเข้าทั้งหมด'}
                </button>
              </div>
            </div>

            {importPreview.errors && importPreview.errors.length > 0 && (
              <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '12px', color: 'var(--ruby-danger)', fontSize: '13px', marginBottom: '12px' }}>
                {importPreview.errors.map((err, i) => (
                  <div key={i} style={{ marginBottom: '4px' }}>⚠️ แถวที่ {err.row}: {err.message}</div>
                ))}
              </div>
            )}

            {importPreview.questions && importPreview.questions.length > 0 && (
              <div style={{ overflowX: 'auto', maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border-glass)', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-glass)', textAlign: 'left', background: 'rgba(20,184,166,0.05)' }}>
                      <th style={{ padding: '8px 6px', color: 'var(--text-muted)', fontWeight: 600, width: '40px' }}>#</th>
                      <th style={{ padding: '8px 6px', color: 'var(--text-muted)', fontWeight: 600 }}>คำถาม</th>
                      <th style={{ padding: '8px 6px', color: 'var(--text-muted)', fontWeight: 600, width: '70px' }}>เฉลย</th>
                      <th style={{ padding: '8px 6px', color: 'var(--text-muted)', fontWeight: 600, width: '70px' }}>คะแนน</th>
                      <th style={{ padding: '8px 6px', color: 'var(--text-muted)', fontWeight: 600, width: '130px' }}>รหัสแบบทดสอบ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importPreview.questions.map((q, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 600, color: 'var(--gold-primary)' }}>{i + 1}</td>
                        <td style={{ padding: '8px 6px' }}>{q.questionText}</td>
                        <td style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 700, color: 'var(--emerald-success)' }}>{q.options?.find((o) => o.isCorrect)?.id?.toUpperCase() || '-'}</td>
                        <td style={{ padding: '8px 6px', textAlign: 'center' }}>{q.points}</td>
                        <td style={{ padding: '8px 6px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>{q.examId || importExamId || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
          </div>
      </div>
        )}
    </div>
  );
}
