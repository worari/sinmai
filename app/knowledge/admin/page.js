// app/knowledge/admin/page.js
// จัดการแบบทดสอบความรู้และชุดข้อสอบครบวงจร (สำหรับผู้ดูแลระบบ ADMIN)
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  ShieldAlert,
  ShieldCheck,
  Power,
  PlusCircle,
  Edit3,
  Trash2,
  Clock,
  Save,
  CheckCircle2,
  List,
  Layout,
  Shuffle,
  HelpCircle,
  FileText,
  UserCheck,
  RefreshCw,
  Eye,
  Check,
  X,
  Search,
  ArrowRight,
  Award
} from 'lucide-react';
import { triggerStatusPopup } from '@/components/StatusModal';

const ADMIN_ROLES = ['ADMIN'];

export default function KnowledgeAdminPage() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('exams'); // 'exams' | 'bank' | 'import' | 'attempts'

  // Data states
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [bankQuestions, setBankQuestions] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [examSettings, setExamSettings] = useState({
    isExamPeriodActive: false,
    updatedAt: '',
    updatedBy: ''
  });
  const [loading, setLoading] = useState(true);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [bankLoading, setBankLoading] = useState(false);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);

  // Error & Status states
  const [examError, setExamError] = useState('');
  const [questionError, setQuestionError] = useState('');
  const [bankError, setBankError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Exam Form
  const [editingExamId, setEditingExamId] = useState(null);
  const [examForm, setExamForm] = useState({
    title: '',
    description: '',
    category: 'ทั่วไป',
    passingScore: 80,
    timeLimitMinutes: 30,
    questionCount: 10,
    randomizeQuestions: true,
    randomizeOptions: true,
    questionSource: 'combined',
    isActive: true,
    openAt: '',
    closeAt: '',
    instructions: ''
  });
  const [examSaving, setExamSaving] = useState(false);

  // Selected Exam for Questions
  const [selectedExamId, setSelectedExamId] = useState(null);

  // Question Form
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [qForm, setQForm] = useState({
    examId: '',
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'a',
    points: 10,
    orderIndex: 1,
    explanation: ''
  });
  const [qSaving, setQSaving] = useState(false);

  // Bank Form & Search
  const [bankSearch, setBankSearch] = useState('');
  const [bankCategory, setBankCategory] = useState('');
  const [bankDifficulty, setBankDifficulty] = useState('');
  const [bankForm, setBankForm] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'a',
    points: 10,
    category: 'สินไหมทั่วไป',
    difficulty: 'medium',
    tags: '',
    explanation: ''
  });
  const [editingBankId, setEditingBankId] = useState(null);
  const [bankSaving, setBankSaving] = useState(false);

  // Copy from Bank Modal / State
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [selectedBankIdsToCopy, setSelectedBankIdsToCopy] = useState([]);
  const [copyingToExam, setCopyingToExam] = useState(false);

  // Excel Import
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [importExamId, setImportExamId] = useState('');
  const [importSaving, setImportSaving] = useState(false);

  // Attempt detail modal
  const [viewingAttempt, setViewingAttempt] = useState(null);

  // Notification helper
  const notifySuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // 1. Initial Load
  useEffect(() => {
    const saved = localStorage.getItem('rta_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }

    // Check query params for tab
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const tabParam = p.get('tab');
      if (tabParam && ['exams', 'bank', 'import', 'attempts'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
      const examParam = p.get('examId');
      if (examParam) {
        setSelectedExamId(examParam);
      }
    }

    loadExams();
    loadBankQuestions();
    loadAttempts();
    loadExamSettings();
  }, []);

  // When selected exam changes, load questions for that exam
  useEffect(() => {
    if (selectedExamId) {
      loadQuestions(selectedExamId);
      setImportExamId(selectedExamId);
    } else {
      setQuestions([]);
    }
  }, [selectedExamId]);

  // Loaders
  const loadExams = async () => {
    setLoading(true);
    setExamError('');
    try {
      const res = await fetch('/api/knowledge/exams');
      const data = await res.json();
      if (data.success) {
        setExams(data.exams || []);
      } else {
        setExamError(data.message || 'โหลดรายการแบบทดสอบไม่สำเร็จ');
      }
    } catch (e) {
      setExamError('โหลดรายการแบบทดสอบไม่สำเร็จ: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async (examId) => {
    if (!examId) return;
    setQuestionLoading(true);
    setQuestionError('');
    try {
      // NOTE: pass adminView=true to see real answers and raw questions
      const res = await fetch(`/api/knowledge/questions?examId=${encodeURIComponent(examId)}&adminView=true`);
      const data = await res.json();
      if (data.success) {
        setQuestions(data.questions || []);
      } else {
        setQuestionError(data.message || 'โหลดข้อสอบในชุดไม่สำเร็จ');
      }
    } catch (e) {
      setQuestionError('โหลดข้อสอบในชุดไม่สำเร็จ: ' + e.message);
    } finally {
      setQuestionLoading(false);
    }
  };

  const loadBankQuestions = async () => {
    setBankLoading(true);
    setBankError('');
    try {
      const params = [];
      if (bankSearch) params.push(`search=${encodeURIComponent(bankSearch)}`);
      if (bankCategory) params.push(`category=${encodeURIComponent(bankCategory)}`);
      if (bankDifficulty) params.push(`difficulty=${encodeURIComponent(bankDifficulty)}`);
      const q = params.length > 0 ? `?${params.join('&')}` : '';
      const res = await fetch(`/api/knowledge/bank${q}`);
      const data = await res.json();
      if (data.success) {
        setBankQuestions(data.questions || []);
      } else {
        setBankError(data.message || 'โหลดธนาคารคำถามไม่สำเร็จ');
      }
    } catch (e) {
      setBankError('โหลดธนาคารคำถามไม่สำเร็จ: ' + e.message);
    } finally {
      setBankLoading(false);
    }
  };

  const loadAttempts = async () => {
    setAttemptsLoading(true);
    try {
      const res = await fetch('/api/knowledge/attempts?all=true');
      const data = await res.json();
      if (data.success) {
        setAttempts(data.attempts || []);
      }
    } catch (e) {
      console.error('Load attempts failed', e);
    } finally {
      setAttemptsLoading(false);
    }
  };

  const loadExamSettings = async () => {
    setSettingsLoading(true);
    try {
      const res = await fetch('/api/knowledge/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        setExamSettings(data.settings);
      }
    } catch (e) {
      console.error('Load exam settings error', e);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleToggleExamPeriod = async () => {
    const nextState = !examSettings.isExamPeriodActive;
    setToggleLoading(true);
    try {
      const res = await fetch('/api/knowledge/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isExamPeriodActive: nextState,
          userId: user?.id
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะห้วงการทดสอบ');
      }

      setExamSettings(data.settings);
      notifySuccess(data.message);

      // Trigger status popup modal
      triggerStatusPopup({
        type: nextState ? 'warning' : 'success',
        title: nextState ? 'เปิดห้วงการทดสอบความรู้' : 'ปิดห้วงการทดสอบความรู้',
        message: nextState
          ? 'ระบบเปิดห้วงการทดสอบความรู้: กำหนดให้ผู้ใช้งานทุกคน (ยกเว้น Admin) ต้องผ่านแบบทดสอบก่อนจึงจะเข้าใช้งานระบบได้'
          : 'ระบบปิดห้วงการทดสอบความรู้: อนุญาตให้ผู้ใช้งานทุกคนเข้าใช้งานระบบ เสนอเรื่อง ตรวจสอบ และติดตามงานได้ตามปกติทันทีโดยไม่ต้องผ่านแบบทดสอบ',
        action: nextState ? 'เปิดห้วงบังคับทำแบบทดสอบ' : 'ปิดห้วงการทดสอบ (เข้าใช้งานได้ปกติ)',
        by: user?.name ? `${user.name} (${user.role})` : 'ผู้ดูแลระบบ',
        ref: nextState ? 'EXAM-PERIOD-ACTIVE' : 'EXAM-PERIOD-DISABLED'
      });

      // Broadcast knowledge change event to local app
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('rta_knowledge_change', {
          detail: {
            isExamPeriodActive: nextState,
            canAccess: !nextState
          }
        }));
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setToggleLoading(false);
    }
  };

  // Auth Guard
  const isAdmin = user && ADMIN_ROLES.includes(user.role);
  if (!user) return null;
  if (!isAdmin) {
    return (
      <div className="container" style={{ paddingTop: '70px', maxWidth: '600px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '40px 32px', borderRadius: '12px' }}>
          <ShieldAlert size={44} style={{ color: 'var(--ruby-danger)', marginBottom: '16px' }} />
          <h1 style={{ fontSize: '20px', marginBottom: '8px' }}>ไม่มีสิทธิเข้าถึงเมนูนี้</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>เฉพาะผู้ดูแลระบบ (ADMIN) และเจ้าหน้าที่ที่ได้รับมอบหมายเท่านั้นที่สามารถจัดการแบบทดสอบได้</p>
          <Link href="/knowledge" className="btn btn-secondary">กลับคลังความรู้</Link>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Exam Handlers (CRUD)
  // -------------------------------------------------------------
  const handleSaveExam = async (e) => {
    e.preventDefault();
    setExamError('');
    setExamSaving(true);
    try {
      const payload = {
        title: examForm.title.trim(),
        description: examForm.description.trim(),
        category: examForm.category.trim() || 'ทั่วไป',
        passingScore: Number(examForm.passingScore) || 80,
        timeLimitMinutes: Number(examForm.timeLimitMinutes) || 30,
        questionCount: Number(examForm.questionCount) || 10,
        randomizeQuestions: Boolean(examForm.randomizeQuestions),
        randomizeOptions: Boolean(examForm.randomizeOptions),
        questionSource: examForm.questionSource || 'combined',
        isActive: Boolean(examForm.isActive),
        openAt: examForm.openAt ? new Date(examForm.openAt).toISOString() : null,
        closeAt: examForm.closeAt ? new Date(examForm.closeAt).toISOString() : null,
        instructions: examForm.instructions.trim()
      };

      let res;
      if (editingExamId) {
        res = await fetch('/api/knowledge/exams', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingExamId, ...payload })
        });
      } else {
        res = await fetch('/api/knowledge/exams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'บันทึกแบบทดสอบไม่สำเร็จ');
      }

      notifySuccess(editingExamId ? 'แก้ไขแบบทดสอบสำเร็จ' : 'สร้างแบบทดสอบใหม่สำเร็จ');
      setEditingExamId(null);
      setExamForm({
        title: '',
        description: '',
        category: 'ทั่วไป',
        passingScore: 80,
        timeLimitMinutes: 30,
        questionCount: 10,
        randomizeQuestions: true,
        randomizeOptions: true,
        questionSource: 'combined',
        isActive: true,
        openAt: '',
        closeAt: '',
        instructions: ''
      });
      loadExams();
    } catch (err) {
      setExamError(err.message || 'เกิดข้อผิดพลาดในการบันทึกแบบทดสอบ');
    } finally {
      setExamSaving(false);
    }
  };

  const handleEditExamClick = (ex) => {
    setEditingExamId(ex.id);
    setExamForm({
      title: ex.title || '',
      description: ex.description || '',
      category: ex.category || 'ทั่วไป',
      passingScore: ex.passingScore !== undefined ? ex.passingScore : 80,
      timeLimitMinutes: ex.timeLimitMinutes !== undefined ? ex.timeLimitMinutes : 30,
      questionCount: ex.questionCount !== undefined ? ex.questionCount : 10,
      randomizeQuestions: ex.randomizeQuestions !== false,
      randomizeOptions: ex.randomizeOptions !== false,
      questionSource: ex.questionSource || 'combined',
      isActive: ex.isActive !== false,
      openAt: ex.openAt ? new Date(ex.openAt).toISOString().slice(0, 16) : '',
      closeAt: ex.closeAt ? new Date(ex.closeAt).toISOString().slice(0, 16) : '',
      instructions: ex.instructions || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditExam = () => {
    setEditingExamId(null);
    setExamForm({
      title: '',
      description: '',
      category: 'ทั่วไป',
      passingScore: 80,
      timeLimitMinutes: 30,
      questionCount: 10,
      randomizeQuestions: true,
      randomizeOptions: true,
      questionSource: 'combined',
      isActive: true,
      openAt: '',
      closeAt: '',
      instructions: ''
    });
  };

  const handleToggleExamActive = async (id, currentVal) => {
    try {
      const res = await fetch('/api/knowledge/exams', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentVal })
      });
      const data = await res.json();
      if (data.success) {
        notifySuccess(`เปลี่ยนสถานะเป็น ${!currentVal ? 'เปิดใช้งาน' : 'ปิดใช้งาน'} แล้ว`);
        loadExams();
      }
    } catch (e) {
      setExamError('เปลี่ยนสถานะไม่สำเร็จ: ' + e.message);
    }
  };

  const handleDeleteExam = async (id, title) => {
    if (!confirm(`ยืนยันการลบแบบทดสอบ "${title}" หรือไม่?\n(ข้อสอบในชุดและประวัติการสอบที่เกี่ยวข้องจะได้รับผลกระทบ)`)) return;
    try {
      const res = await fetch(`/api/knowledge/exams?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        notifySuccess('ลบแบบทดสอบสำเร็จ');
        if (selectedExamId === id) setSelectedExamId(null);
        loadExams();
      } else {
        setExamError(data.message || 'ลบแบบทดสอบไม่สำเร็จ');
      }
    } catch (e) {
      setExamError('ลบแบบทดสอบไม่สำเร็จ: ' + e.message);
    }
  };

  // -------------------------------------------------------------
  // Question Handlers within Exam (CRUD)
  // -------------------------------------------------------------
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!selectedExamId) {
      setQuestionError('กรุณาเลือกแบบทดสอบก่อน');
      return;
    }
    setQuestionError('');
    setQSaving(true);
    try {
      const options = [
        { id: 'a', text: qForm.optionA.trim(), isCorrect: qForm.correctOption === 'a' },
        { id: 'b', text: qForm.optionB.trim(), isCorrect: qForm.correctOption === 'b' },
        { id: 'c', text: qForm.optionC.trim(), isCorrect: qForm.correctOption === 'c' },
        { id: 'd', text: qForm.optionD.trim(), isCorrect: qForm.correctOption === 'd' }
      ];

      const payload = {
        examId: selectedExamId,
        questionText: qForm.questionText.trim(),
        options,
        points: Number(qForm.points) || 10,
        orderIndex: Number(qForm.orderIndex) || (questions.length + 1),
        explanation: qForm.explanation.trim()
      };

      let res;
      if (editingQuestionId) {
        res = await fetch('/api/knowledge/questions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingQuestionId, ...payload })
        });
      } else {
        res = await fetch('/api/knowledge/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'บันทึกข้อสอบไม่สำเร็จ');

      notifySuccess(editingQuestionId ? 'แก้ไขคำถามเรียบร้อย' : 'เพิ่มคำถามใหม่เรียบร้อย');
      setEditingQuestionId(null);
      setQForm({
        examId: selectedExamId,
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctOption: 'a',
        points: 10,
        orderIndex: questions.length + 2,
        explanation: ''
      });
      loadQuestions(selectedExamId);
      loadExams(); // to refresh question count
    } catch (err) {
      setQuestionError(err.message || 'บันทึกคำถามไม่สำเร็จ');
    } finally {
      setQSaving(false);
    }
  };

  const handleEditQuestionClick = (q) => {
    setEditingQuestionId(q.id);
    const optA = q.options?.find((o) => o.id === 'a')?.text || '';
    const optB = q.options?.find((o) => o.id === 'b')?.text || '';
    const optC = q.options?.find((o) => o.id === 'c')?.text || '';
    const optD = q.options?.find((o) => o.id === 'd')?.text || '';
    const correctOpt = q.options?.find((o) => o.isCorrect)?.id || 'a';

    setQForm({
      examId: q.examId || selectedExamId,
      questionText: q.questionText || '',
      optionA: optA,
      optionB: optB,
      optionC: optC,
      optionD: optD,
      correctOption: correctOpt,
      points: q.points || 10,
      orderIndex: q.orderIndex || 1,
      explanation: q.explanation || ''
    });
  };

  const handleCancelEditQuestion = () => {
    setEditingQuestionId(null);
    setQForm({
      examId: selectedExamId || '',
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 'a',
      points: 10,
      orderIndex: questions.length + 1,
      explanation: ''
    });
  };

  const handleDeleteQuestion = async (id) => {
    if (!confirm('ยืนยันลบคำถามข้อนี้ออกจากชุดแบบทดสอบหรือไม่?')) return;
    try {
      const res = await fetch(`/api/knowledge/questions?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        notifySuccess('ลบคำถามสำเร็จ');
        loadQuestions(selectedExamId);
        loadExams();
      } else {
        setQuestionError(data.message || 'ลบคำถามไม่สำเร็จ');
      }
    } catch (e) {
      setQuestionError('ลบคำถามไม่สำเร็จ: ' + e.message);
    }
  };

  // -------------------------------------------------------------
  // Question Bank Handlers
  // -------------------------------------------------------------
  const handleSaveBankQuestion = async (e) => {
    e.preventDefault();
    setBankError('');
    setBankSaving(true);
    try {
      const options = [
        { id: 'a', text: bankForm.optionA.trim(), isCorrect: bankForm.correctOption === 'a' },
        { id: 'b', text: bankForm.optionB.trim(), isCorrect: bankForm.correctOption === 'b' },
        { id: 'c', text: bankForm.optionC.trim(), isCorrect: bankForm.correctOption === 'c' },
        { id: 'd', text: bankForm.optionD.trim(), isCorrect: bankForm.correctOption === 'd' }
      ];

      const payload = {
        questionText: bankForm.questionText.trim(),
        options,
        points: Number(bankForm.points) || 10,
        category: bankForm.category.trim() || 'ทั่วไป',
        difficulty: bankForm.difficulty || 'medium',
        tags: bankForm.tags ? bankForm.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        explanation: bankForm.explanation.trim()
      };

      let res;
      if (editingBankId) {
        res = await fetch(`/api/knowledge/bank/${editingBankId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/knowledge/bank', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'บันทึกคำถามในธนาคารไม่สำเร็จ');

      notifySuccess(editingBankId ? 'แก้ไขคำถามในธนาคารเรียบร้อย' : 'เพิ่มคำถามใหม่ในธนาคารเรียบร้อย');
      setEditingBankId(null);
      setBankForm({
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctOption: 'a',
        points: 10,
        category: 'สินไหมทั่วไป',
        difficulty: 'medium',
        tags: '',
        explanation: ''
      });
      loadBankQuestions();
    } catch (err) {
      setBankError(err.message || 'บันทึกคำถามในธนาคารไม่สำเร็จ');
    } finally {
      setBankSaving(false);
    }
  };

  const handleEditBankClick = (bq) => {
    setEditingBankId(bq.id);
    const optA = bq.options?.find((o) => o.id === 'a')?.text || '';
    const optB = bq.options?.find((o) => o.id === 'b')?.text || '';
    const optC = bq.options?.find((o) => o.id === 'c')?.text || '';
    const optD = bq.options?.find((o) => o.id === 'd')?.text || '';
    const correctOpt = bq.options?.find((o) => o.isCorrect)?.id || 'a';

    setBankForm({
      questionText: bq.questionText || '',
      optionA: optA,
      optionB: optB,
      optionC: optC,
      optionD: optD,
      correctOption: correctOpt,
      points: bq.points || 10,
      category: bq.category || 'สินไหมทั่วไป',
      difficulty: bq.difficulty || 'medium',
      tags: Array.isArray(bq.tags) ? bq.tags.join(', ') : '',
      explanation: bq.explanation || ''
    });
  };

  const handleDeleteBankQuestion = async (id) => {
    if (!confirm('ยืนยันลบคำถามนี้ออกจากธนาคารคำถามกลางหรือไม่?')) return;
    try {
      const res = await fetch(`/api/knowledge/bank/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        notifySuccess('ลบคำถามออกจากธนาคารเรียบร้อย');
        loadBankQuestions();
      } else {
        setBankError(data.message || 'ลบคำถามไม่สำเร็จ');
      }
    } catch (e) {
      setBankError('ลบคำถามไม่สำเร็จ: ' + e.message);
    }
  };

  // Copy selected questions from bank to active exam
  const handleCopyBankQuestionsToExam = async () => {
    if (!selectedExamId) {
      alert('กรุณาเลือกแบบทดสอบเป้าหมายก่อน');
      return;
    }
    if (selectedBankIdsToCopy.length === 0) {
      alert('กรุณาเลือกคำถามจากธนาคารอย่างน้อย 1 ข้อ');
      return;
    }
    setCopyingToExam(true);
    try {
      let added = 0;
      for (const bankId of selectedBankIdsToCopy) {
        const bq = bankQuestions.find((q) => q.id === bankId);
        if (!bq) continue;
        await fetch('/api/knowledge/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            examId: selectedExamId,
            questionText: bq.questionText,
            options: bq.options,
            points: bq.points || 10,
            orderIndex: questions.length + added + 1,
            explanation: bq.explanation || ''
          })
        });
        added++;
      }
      notifySuccess(`นำเข้าคำถามจากธนาคารเข้าชุดข้อสอบสำเร็จ ${added} ข้อ`);
      setSelectedBankIdsToCopy([]);
      setCopyModalOpen(false);
      loadQuestions(selectedExamId);
      loadExams();
    } catch (e) {
      alert('เกิดข้อผิดพลาดในการดึงคำถาม: ' + e.message);
    } finally {
      setCopyingToExam(false);
    }
  };

  // -------------------------------------------------------------
  // Excel Import Handlers
  // -------------------------------------------------------------
  const handleImportFileChange = (e) => {
    setImportFile(e.target.files[0] || null);
    setImportPreview(null);
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
        setImportPreview({ questions: data.questions || [], errors: [], count: data.count });
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
        notifySuccess(`นำเข้าข้อสอบสำเร็จ ${data.count || importPreview.questions.length} ข้อ`);
        setImportFile(null);
        setImportPreview(null);
        if (selectedExamId) loadQuestions(selectedExamId);
        loadExams();
        loadBankQuestions();
      } else {
        alert(data.message || 'นำเข้าข้อสอบไม่สำเร็จ');
      }
    } catch (err) {
      alert(err.message || 'นำเข้าข้อสอบไม่สำเร็จ');
    } finally {
      setImportSaving(false);
    }
  };

  const fmtDateTime = (v) => {
    if (!v) return '-';
    return new Date(v).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });
  };

  const selectedExam = exams.find((e) => e.id === selectedExamId) || null;

  return (
    <div className="container" style={{ paddingTop: '20px', paddingBottom: '60px', maxWidth: '1240px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--gold-primary), var(--cyan-accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#041017' }}>
              <Layout size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0, letterSpacing: '-0.3px' }}>
                จัดการแบบทดสอบและธนาคารข้อสอบ
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
                สร้างและแก้ไขแบบทดสอบ กำหนดการสุ่มข้อสอบ สุ่มตัวเลือก เกณฑ์คะแนน และตรวจสอบผลการสอบ
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/knowledge" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BookOpen size={16} /> กลับคลังความรู้
          </Link>
          <Link href="/knowledge/exam" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={16} /> ทดลองทำข้อสอบ (มุมมองผู้สอบ)
          </Link>
        </div>
      </div>

      {/* Alert Banners */}
      {successMessage && (
        <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '12px 16px', color: 'var(--emerald-success)', fontSize: '13.5px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} /> {successMessage}
        </div>
      )}
      {examError && (
        <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', color: 'var(--ruby-danger)', fontSize: '13.5px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={18} /> {examError}
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px', overflowX: 'auto' }}>
        <button
          type="button"
          onClick={() => setActiveTab('exams')}
          className="btn"
          style={{
            padding: '8px 18px',
            fontSize: '13.5px',
            borderRadius: '8px',
            background: activeTab === 'exams' ? 'rgba(20,184,166,0.18)' : 'transparent',
            border: activeTab === 'exams' ? '1px solid var(--cyan-accent)' : '1px solid transparent',
            color: activeTab === 'exams' ? 'var(--cyan-accent)' : 'var(--text-muted)',
            fontWeight: activeTab === 'exams' ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Layout size={16} /> จัดการชุดแบบทดสอบ ({exams.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bank')}
          className="btn"
          style={{
            padding: '8px 18px',
            fontSize: '13.5px',
            borderRadius: '8px',
            background: activeTab === 'bank' ? 'rgba(234,179,8,0.18)' : 'transparent',
            border: activeTab === 'bank' ? '1px solid var(--gold-primary)' : '1px solid transparent',
            color: activeTab === 'bank' ? 'var(--gold-primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'bank' ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <BookOpen size={16} /> ธนาคารคำถามกลาง ({bankQuestions.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('attempts')}
          className="btn"
          style={{
            padding: '8px 18px',
            fontSize: '13.5px',
            borderRadius: '8px',
            background: activeTab === 'attempts' ? 'rgba(16,185,129,0.18)' : 'transparent',
            border: activeTab === 'attempts' ? '1px solid var(--emerald-success)' : '1px solid transparent',
            color: activeTab === 'attempts' ? 'var(--emerald-success)' : 'var(--text-muted)',
            fontWeight: activeTab === 'attempts' ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <UserCheck size={16} /> 
          <span>ประวัติและผลคะแนนสอบ ({attempts.length})</span>
          <span style={{
            fontSize: '11px',
            padding: '1px 7px',
            borderRadius: '10px',
            background: examSettings.isExamPeriodActive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
            color: examSettings.isExamPeriodActive ? '#fca5a5' : '#86efac',
            fontWeight: 700
          }}>
            {examSettings.isExamPeriodActive ? '● ห้วงบังคับสอบ' : '○ ไม่บังคับสอบ'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('import')}
          className="btn"
          style={{
            padding: '8px 18px',
            fontSize: '13.5px',
            borderRadius: '8px',
            background: activeTab === 'import' ? 'rgba(168,85,247,0.18)' : 'transparent',
            border: activeTab === 'import' ? '1px solid #a855f7' : '1px solid transparent',
            color: activeTab === 'import' ? '#c084fc' : 'var(--text-muted)',
            fontWeight: activeTab === 'import' ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <PlusCircle size={16} /> นำเข้าจาก Excel
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: จัดการชุดแบบทดสอบ (Exams & Questions)                              */}
      {/* ========================================================================= */}
      {activeTab === 'exams' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* ฟอร์มสร้าง / แก้ไขชุดแบบทดสอบ */}
          <div className="glass-panel" style={{ padding: '22px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: editingExamId ? 'var(--gold-primary)' : 'var(--cyan-accent)' }}>
                {editingExamId ? <Edit3 size={18} /> : <PlusCircle size={18} />}
                {editingExamId ? 'แก้ไขชุดแบบทดสอบ' : 'สร้างชุดแบบทดสอบใหม่'}
              </div>
              {editingExamId && (
                <button type="button" onClick={handleCancelEditExam} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '12px' }}>
                  ยกเลิกการแก้ไข
                </button>
              )}
            </div>

            <form onSubmit={handleSaveExam} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', alignItems: 'start' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>ชื่อชุดแบบทดสอบ *</label>
                <input
                  className="form-input"
                  required
                  value={examForm.title}
                  onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                  placeholder="เช่น แบบทดสอบวัดความรู้พื้นฐานงานสินไหมทดแทน"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>หมวดหมู่</label>
                <input
                  className="form-input"
                  value={examForm.category}
                  onChange={(e) => setExamForm({ ...examForm, category: e.target.value })}
                  placeholder="เช่น สิทธิประโยชน์ / ระเบียบ"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>เกณฑ์คะแนนผ่าน (% จากคะแนนเต็ม) *</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={examForm.passingScore}
                  onChange={(e) => setExamForm({ ...examForm, passingScore: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>เวลาในการทำแบบทดสอบ (นาที)</label>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  required
                  value={examForm.timeLimitMinutes}
                  onChange={(e) => setExamForm({ ...examForm, timeLimitMinutes: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>จำนวนข้อสอบที่สุ่มมาให้ทำต่อครั้ง</label>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  required
                  value={examForm.questionCount}
                  onChange={(e) => setExamForm({ ...examForm, questionCount: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>แหล่งดึงคำถาม</label>
                <select
                  className="form-input"
                  value={examForm.questionSource}
                  onChange={(e) => setExamForm({ ...examForm, questionSource: e.target.value })}
                >
                  <option value="combined">ดึงผสม (ข้อสอบในชุด + ธนาคารคำถาม)</option>
                  <option value="exam_pool">เฉพาะข้อสอบในชุดนี้เท่านั้น</option>
                  <option value="bank">ดึงเฉพาะจากธนาคารคำถามกลาง</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>วัน-เวลาเริ่มเปิดให้สอบ (เว้นว่างได้)</label>
                <input
                  className="form-input"
                  type="datetime-local"
                  value={examForm.openAt}
                  onChange={(e) => setExamForm({ ...examForm, openAt: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>วัน-เวลาปิดรับการสอบ (เว้นว่างได้)</label>
                <input
                  className="form-input"
                  type="datetime-local"
                  value={examForm.closeAt}
                  onChange={(e) => setExamForm({ ...examForm, closeAt: e.target.value })}
                />
              </div>

              {/* การสุ่มข้อสอบและตัวเลือก (Feature Requirement) */}
              <div style={{ gridColumn: '1 / -1', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '10px', padding: '14px 18px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={examForm.randomizeQuestions}
                    onChange={(e) => setExamForm({ ...examForm, randomizeQuestions: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--cyan-accent)' }}
                  />
                  <span>
                    <strong style={{ color: 'var(--cyan-accent)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Shuffle size={14} /> สุ่มลำดับข้อสอบ (Random Questions)
                    </strong>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>สลับลำดับข้อสอบและสุ่มหยิบข้อสอบจากคลังมาให้ผู้สอบแต่ละคนไม่เหมือนกัน</div>
                  </span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={examForm.randomizeOptions}
                    onChange={(e) => setExamForm({ ...examForm, randomizeOptions: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--gold-primary)' }}
                  />
                  <span>
                    <strong style={{ color: 'var(--gold-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Shuffle size={14} /> สุ่มลำดับตัวเลือก (Random Answers)
                    </strong>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>สลับตำแหน่งตัวเลือก ก, ข, ค, ง แบบสุ่ม เพื่อป้องกันการจำตำแหน่งคำตอบ</div>
                  </span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={examForm.isActive}
                    onChange={(e) => setExamForm({ ...examForm, isActive: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--emerald-success)' }}
                  />
                  <span>
                    <strong style={{ color: examForm.isActive ? 'var(--emerald-success)' : 'var(--ruby-danger)' }}>
                      {examForm.isActive ? '✓ เปิดใช้งานแบบทดสอบ' : '✕ ปิดใช้งานชั่วคราว'}
                    </strong>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>ผู้สอบจะเห็นและทำแบบทดสอบได้เฉพาะชุดที่เปิดใช้งาน</div>
                  </span>
                </label>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>คำแนะนำและคำชี้แจงสำหรับผู้สอบ</label>
                <textarea
                  className="form-input"
                  rows="2"
                  value={examForm.instructions}
                  onChange={(e) => setExamForm({ ...examForm, instructions: e.target.value })}
                  placeholder="เช่น ข้อสอบมีทั้งหมด 10 ข้อ เกณฑ์ผ่าน 80% ให้เลือกคำตอบที่ถูกต้องที่สุดเพียงข้อเดียว"
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button type="submit" className="btn btn-primary" disabled={examSaving} style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Save size={16} /> {examSaving ? 'กำลังบันทึก...' : editingExamId ? 'บันทึกการแก้ไขชุดแบบทดสอบ' : 'สร้างชุดแบบทดสอบ'}
                </button>
                {editingExamId && (
                  <button type="button" onClick={handleCancelEditExam} className="btn btn-secondary" style={{ padding: '10px 20px' }}>
                    ยกเลิก
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* รายการชุดแบบทดสอบทั้งหมด */}
          <div className="glass-panel" style={{ padding: '22px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <List size={18} style={{ color: 'var(--gold-primary)' }} />
                รายการชุดแบบทดสอบในระบบ ({exams.length} ชุด)
              </div>
              <button onClick={loadExams} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                <RefreshCw size={14} /> รีเฟรช
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>กำลังโหลดรายการแบบทดสอบ...</div>
            ) : exams.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)', border: '1px dashed var(--border-glass)', borderRadius: '10px' }}>
                ยังไม่มีแบบทดสอบในระบบ กรุณากรอกแบบฟอร์มด้านบนเพื่อสร้างแบบทดสอบชุดแรก
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-glass)', textAlign: 'left' }}>
                      <th style={{ padding: '12px 10px', color: 'var(--text-muted)', fontWeight: 600 }}>ชื่อชุดแบบทดสอบ</th>
                      <th style={{ padding: '12px 10px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>หมวดหมู่</th>
                      <th style={{ padding: '12px 10px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>เกณฑ์ / เวลา</th>
                      <th style={{ padding: '12px 10px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>คุณสมบัติการสุ่ม</th>
                      <th style={{ padding: '12px 10px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>สถานะ</th>
                      <th style={{ padding: '12px 10px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center', width: '280px' }}>จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.map((ex) => {
                      const isSelected = selectedExamId === ex.id;
                      return (
                        <tr
                          key={ex.id}
                          style={{
                            borderBottom: '1px solid var(--border-subtle)',
                            background: isSelected ? 'rgba(20,184,166,0.12)' : 'transparent',
                            transition: 'background 0.2s'
                          }}
                        >
                          <td style={{ padding: '12px 10px' }}>
                            <div style={{ fontWeight: 600, color: isSelected ? 'var(--cyan-accent)' : 'inherit', fontSize: '14px' }}>
                              {ex.title}
                            </div>
                            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                              รหัส: <code style={{ color: 'var(--text-dim)' }}>{ex.id}</code>
                              {ex.openAt && ` | เปิด: ${fmtDateTime(ex.openAt)}`}
                              {ex.closeAt && ` | ปิด: ${fmtDateTime(ex.closeAt)}`}
                            </div>
                          </td>

                          <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                            <span style={{ fontSize: '11.5px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                              {ex.category || 'ทั่วไป'}
                            </span>
                          </td>

                          <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                            <div style={{ fontWeight: 700, color: 'var(--gold-primary)' }}>
                              {ex.passingScore || 80}%
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              {ex.timeLimitMinutes || 30} นาที ({ex.questionCount || 10} ข้อ)
                            </div>
                          </td>

                          <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: ex.randomizeQuestions !== false ? 'rgba(20,184,166,0.15)' : 'rgba(255,255,255,0.05)', color: ex.randomizeQuestions !== false ? 'var(--cyan-accent)' : 'var(--text-muted)' }}>
                                {ex.randomizeQuestions !== false ? '🔀 สุ่มข้อสอบ' : 'เรียงตามลำดับ'}
                              </span>
                              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: ex.randomizeOptions !== false ? 'rgba(234,179,8,0.15)' : 'rgba(255,255,255,0.05)', color: ex.randomizeOptions !== false ? 'var(--gold-primary)' : 'var(--text-muted)' }}>
                                {ex.randomizeOptions !== false ? '🎲 สุ่มตัวเลือก' : 'ตัวเลือกคงที่'}
                              </span>
                            </div>
                          </td>

                          <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleToggleExamActive(ex.id, ex.isActive)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0
                              }}
                              title="คลิกเพื่อสลับสถานะ"
                            >
                              {ex.isActive ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '6px', background: 'rgba(16,185,129,0.15)', color: 'var(--emerald-success)', fontSize: '11.5px', fontWeight: 600 }}>
                                  <Check size={12} /> เปิดใช้งาน
                                </span>
                              ) : (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '6px', background: 'rgba(239,68,68,0.15)', color: 'var(--ruby-danger)', fontSize: '11.5px', fontWeight: 600 }}>
                                  <X size={12} /> ปิดใช้งาน
                                </span>
                              )}
                            </button>
                          </td>

                          <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                              <button
                                onClick={() => setSelectedExamId(isSelected ? null : ex.id)}
                                className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ padding: '5px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <List size={13} /> {isSelected ? 'ซ่อนข้อสอบ' : 'จัดการข้อสอบในชุด'}
                              </button>
                              <button
                                onClick={() => handleEditExamClick(ex)}
                                className="btn btn-outline btn-sm"
                                style={{ padding: '5px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Edit3 size={13} /> แก้ไข
                              </button>
                              <button
                                onClick={() => handleDeleteExam(ex.id, ex.title)}
                                className="btn btn-danger btn-sm"
                                style={{ padding: '5px 10px', fontSize: '12px' }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ===================================================================== */}
          {/* ส่วนจัดการข้อสอบในชุดที่เลือก (Selected Exam Questions)                 */}
          {/* ===================================================================== */}
          {selectedExamId && (
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--cyan-accent)', boxShadow: '0 0 20px rgba(20,184,166,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--cyan-accent)' }} />
                    <span style={{ fontSize: '16px', fontWeight: 700 }}>
                      ข้อสอบในชุด: <span style={{ color: 'var(--gold-primary)' }}>{selectedExam?.title}</span>
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    มีข้อสอบในชุดนี้ {questions.length} ข้อ | สุ่มหยิบมาสอบครั้งละ {selectedExam?.questionCount || 10} ข้อ
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setCopyModalOpen(true);
                      setSelectedBankIdsToCopy([]);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px' }}
                  >
                    <BookOpen size={14} style={{ color: 'var(--gold-primary)' }} /> ดึงข้อสอบจากธนาคารคำถาม
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedExamId(null)}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '12px' }}
                  >
                    ปิดส่วนจัดการข้อสอบ
                  </button>
                </div>
              </div>

              {questionError && (
                <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 14px', color: 'var(--ruby-danger)', fontSize: '13px', marginBottom: '14px' }}>
                  {questionError}
                </div>
              )}

              {/* ฟอร์มเพิ่ม / แก้ไขข้อสอบ */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '10px', padding: '18px', marginBottom: '20px' }}>
                <div style={{ fontSize: '14.5px', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px', color: editingQuestionId ? 'var(--gold-primary)' : 'var(--cyan-accent)' }}>
                  {editingQuestionId ? <Edit3 size={16} /> : <PlusCircle size={16} />}
                  {editingQuestionId ? 'แก้ไขคำถาม' : 'เพิ่มคำถามใหม่ลงในชุดนี้'}
                </div>

                <form onSubmit={handleSaveQuestion} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', alignItems: 'end' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>ข้อความคำถาม *</label>
                    <textarea
                      className="form-input"
                      required
                      rows="2"
                      value={qForm.questionText}
                      onChange={(e) => setQForm({ ...qForm, questionText: e.target.value })}
                      placeholder="พิมพ์ข้อความคำถามที่ต้องการทดสอบ..."
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>ตัวเลือก ก *</label>
                    <input className="form-input" required value={qForm.optionA} onChange={(e) => setQForm({ ...qForm, optionA: e.target.value })} placeholder="คำตอบตัวเลือก ก" />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>ตัวเลือก ข *</label>
                    <input className="form-input" required value={qForm.optionB} onChange={(e) => setQForm({ ...qForm, optionB: e.target.value })} placeholder="คำตอบตัวเลือก ข" />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>ตัวเลือก ค *</label>
                    <input className="form-input" required value={qForm.optionC} onChange={(e) => setQForm({ ...qForm, optionC: e.target.value })} placeholder="คำตอบตัวเลือก ค" />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>ตัวเลือก ง *</label>
                    <input className="form-input" required value={qForm.optionD} onChange={(e) => setQForm({ ...qForm, optionD: e.target.value })} placeholder="คำตอบตัวเลือก ง" />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>เฉลยตัวเลือกที่ถูกต้อง *</label>
                    <select
                      className="form-input"
                      required
                      value={qForm.correctOption}
                      onChange={(e) => setQForm({ ...qForm, correctOption: e.target.value })}
                      style={{ fontWeight: 600, color: 'var(--emerald-success)' }}
                    >
                      <option value="a">ก. {qForm.optionA ? qForm.optionA.slice(0, 30) : '(ตัวเลือก ก)'}</option>
                      <option value="b">ข. {qForm.optionB ? qForm.optionB.slice(0, 30) : '(ตัวเลือก ข)'}</option>
                      <option value="c">ค. {qForm.optionC ? qForm.optionC.slice(0, 30) : '(ตัวเลือก ค)'}</option>
                      <option value="d">ง. {qForm.optionD ? qForm.optionD.slice(0, 30) : '(ตัวเลือก ง)'}</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>คะแนนข้อนี้</label>
                    <input className="form-input" type="number" min="1" value={qForm.points} onChange={(e) => setQForm({ ...qForm, points: e.target.value })} />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>ลำดับข้อ</label>
                    <input className="form-input" type="number" min="1" value={qForm.orderIndex} onChange={(e) => setQForm({ ...qForm, orderIndex: e.target.value })} />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>คำอธิบายเฉลย (แสดงให้ผู้สอบดูหลังส่งข้อสอบ)</label>
                    <input
                      className="form-input"
                      value={qForm.explanation}
                      onChange={(e) => setQForm({ ...qForm, explanation: e.target.value })}
                      placeholder="เช่น อ้างอิงตามระเบียบ กห. ว่าด้วยการช่วยเหลือผู้ประสบภัย พ.ศ. 2562 ข้อ 12"
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn btn-primary" disabled={qSaving} style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Save size={15} /> {qSaving ? 'กำลังบันทึก...' : editingQuestionId ? 'บันทึกการแก้ไขคำถาม' : 'เพิ่มคำถามลงในชุดนี้'}
                    </button>
                    {editingQuestionId && (
                      <button type="button" onClick={handleCancelEditQuestion} className="btn btn-secondary" style={{ padding: '8px 16px' }}>
                        ยกเลิก
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* รายการคำถามในชุด */}
              <div style={{ fontSize: '14.5px', fontWeight: 600, marginBottom: '12px' }}>
                รายการคำถามทั้งหมดในชุด ({questions.length} ข้อ)
              </div>

              {questionLoading ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>กำลังโหลดข้อสอบ...</div>
              ) : questions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', border: '1px dashed var(--border-glass)', borderRadius: '8px' }}>
                  ยังไม่มีคำถามในชุดนี้ สามารถเพิ่มคำถามใหม่ด้านบน หรือคลิก &quot;ดึงข้อสอบจากธนาคารคำถาม&quot; เพื่อนำเข้า
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {questions.map((q, idx) => {
                    const correctOpt = q.options?.find((o) => o.isCorrect);
                    return (
                      <div
                        key={q.id}
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid var(--border-glass)',
                          borderRadius: '8px',
                          padding: '14px 18px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: '16px'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <span style={{ fontWeight: 700, color: 'var(--gold-primary)', fontSize: '13px' }}>ข้อที่ {idx + 1}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '1px 6px', borderRadius: '4px' }}>
                              {q.points || 10} คะแนน
                            </span>
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '10px' }}>{q.questionText}</div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '6px', fontSize: '12.5px' }}>
                            {(q.options || []).map((opt) => (
                              <div
                                key={opt.id}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  background: opt.isCorrect ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.02)',
                                  border: opt.isCorrect ? '1px solid rgba(16,185,129,0.3)' : '1px solid transparent',
                                  color: opt.isCorrect ? 'var(--emerald-success)' : 'var(--text-muted)'
                                }}
                              >
                                <strong>{opt.id.toUpperCase()}.</strong> {opt.text} {opt.isCorrect && '✓'}
                              </div>
                            ))}
                          </div>

                          {q.explanation && (
                            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '8px', background: 'rgba(234,179,8,0.08)', padding: '6px 10px', borderRadius: '6px' }}>
                              <strong style={{ color: 'var(--gold-primary)' }}>คำอธิบายเฉลย:</strong> {q.explanation}
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleEditQuestionClick(q)} className="btn btn-outline btn-sm" style={{ padding: '6px 10px', fontSize: '12px' }}>
                            <Edit3 size={13} />
                          </button>
                          <button onClick={() => handleDeleteQuestion(q.id)} className="btn btn-danger btn-sm" style={{ padding: '6px 10px', fontSize: '12px' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ธนาคารคำถามกลาง (Question Bank)                                    */}
      {/* ========================================================================= */}
      {activeTab === 'bank' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* ฟอร์มเพิ่มคำถามในธนาคาร */}
          <div className="glass-panel" style={{ padding: '22px', borderRadius: '12px' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: editingBankId ? 'var(--gold-primary)' : 'var(--cyan-accent)' }}>
              {editingBankId ? <Edit3 size={18} /> : <PlusCircle size={18} />}
              {editingBankId ? 'แก้ไขคำถามในธนาคารกลาง' : 'เพิ่มคำถามใหม่เข้าสู่ธนาคารคำถามกลาง'}
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              คำถามในธนาคารนี้เป็นคลังข้อสอบกลาง สามารถนำไปใช้ร่วมกับแบบทดสอบได้หลายชุด หรือให้ระบบสุ่มหยิบไปใช้ทำข้อสอบได้อัตโนมัติ
            </p>

            {bankError && (
              <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 14px', color: 'var(--ruby-danger)', fontSize: '13px', marginBottom: '14px' }}>
                {bankError}
              </div>
            )}

            <form onSubmit={handleSaveBankQuestion} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', alignItems: 'end' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>ข้อความคำถาม *</label>
                <textarea
                  className="form-input"
                  required
                  rows="2"
                  value={bankForm.questionText}
                  onChange={(e) => setBankForm({ ...bankForm, questionText: e.target.value })}
                  placeholder="พิมพ์ข้อความคำถามในธนาคารกลาง..."
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>ตัวเลือก ก *</label>
                <input className="form-input" required value={bankForm.optionA} onChange={(e) => setBankForm({ ...bankForm, optionA: e.target.value })} placeholder="คำตอบ ก" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>ตัวเลือก ข *</label>
                <input className="form-input" required value={bankForm.optionB} onChange={(e) => setBankForm({ ...bankForm, optionB: e.target.value })} placeholder="คำตอบ ข" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>ตัวเลือก ค *</label>
                <input className="form-input" required value={bankForm.optionC} onChange={(e) => setBankForm({ ...bankForm, optionC: e.target.value })} placeholder="คำตอบ ค" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>ตัวเลือก ง *</label>
                <input className="form-input" required value={bankForm.optionD} onChange={(e) => setBankForm({ ...bankForm, optionD: e.target.value })} placeholder="คำตอบ ง" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>เฉลยที่ถูกต้อง *</label>
                <select
                  className="form-input"
                  required
                  value={bankForm.correctOption}
                  onChange={(e) => setBankForm({ ...bankForm, correctOption: e.target.value })}
                  style={{ fontWeight: 600, color: 'var(--emerald-success)' }}
                >
                  <option value="a">ก. {bankForm.optionA ? bankForm.optionA.slice(0, 30) : '(ตัวเลือก ก)'}</option>
                  <option value="b">ข. {bankForm.optionB ? bankForm.optionB.slice(0, 30) : '(ตัวเลือก ข)'}</option>
                  <option value="c">ค. {bankForm.optionC ? bankForm.optionC.slice(0, 30) : '(ตัวเลือก ค)'}</option>
                  <option value="d">ง. {bankForm.optionD ? bankForm.optionD.slice(0, 30) : '(ตัวเลือก ง)'}</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>หมวดหมู่</label>
                <input className="form-input" value={bankForm.category} onChange={(e) => setBankForm({ ...bankForm, category: e.target.value })} placeholder="เช่น เอกสารยื่น, ขั้นตอน" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>ระดับความยาก</label>
                <select className="form-input" value={bankForm.difficulty} onChange={(e) => setBankForm({ ...bankForm, difficulty: e.target.value })}>
                  <option value="easy">ง่าย (Easy)</option>
                  <option value="medium">ปานกลาง (Medium)</option>
                  <option value="hard">ยาก (Hard)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>แท็ก (คั่นด้วยจุลภาค)</label>
                <input className="form-input" value={bankForm.tags} onChange={(e) => setBankForm({ ...bankForm, tags: e.target.value })} placeholder="เช่น พื้นฐาน, ระเบียบ62" />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>คำอธิบายเฉลย</label>
                <input
                  className="form-input"
                  value={bankForm.explanation}
                  onChange={(e) => setBankForm({ ...bankForm, explanation: e.target.value })}
                  placeholder="คำอธิบายที่มาของคำตอบที่ถูกต้อง..."
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" disabled={bankSaving} style={{ padding: '8px 22px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Save size={15} /> {bankSaving ? 'กำลังบันทึก...' : editingBankId ? 'บันทึกการแก้ไข' : 'เพิ่มเข้าธนาคารคำถาม'}
                </button>
                {editingBankId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBankId(null);
                      setBankForm({
                        questionText: '',
                        optionA: '',
                        optionB: '',
                        optionC: '',
                        optionD: '',
                        correctOption: 'a',
                        points: 10,
                        category: 'สินไหมทั่วไป',
                        difficulty: 'medium',
                        tags: '',
                        explanation: ''
                      });
                    }}
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px' }}
                  >
                    ยกเลิก
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* ค้นหาและตารางคำถามในธนาคาร */}
          <div className="glass-panel" style={{ padding: '22px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={18} style={{ color: 'var(--gold-primary)' }} />
                คลังคำถามกลางทั้งหมด ({bankQuestions.length} ข้อ)
              </div>

              {/* Search & Filter */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="ค้นหาข้อความคำถาม..."
                  className="form-input"
                  style={{ width: '220px', fontSize: '12.5px', padding: '6px 12px' }}
                  value={bankSearch}
                  onChange={(e) => setBankSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadBankQuestions()}
                />
                <button onClick={loadBankQuestions} className="btn btn-secondary btn-sm" style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Search size={14} /> ค้นหา
                </button>
              </div>
            </div>

            {bankLoading ? (
              <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>กำลังโหลดธนาคารคำถาม...</div>
            ) : bankQuestions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                ไม่พบคำถามในธนาคารตามเงื่อนไขที่ค้นหา
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {bankQuestions.map((bq, idx) => (
                  <div
                    key={bq.id}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '8px',
                      padding: '14px 18px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '16px'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, color: 'var(--gold-primary)', fontSize: '13px' }}>#{idx + 1}</span>
                        <span style={{ fontSize: '11px', background: 'rgba(20,184,166,0.15)', color: 'var(--cyan-accent)', padding: '2px 8px', borderRadius: '4px' }}>
                          {bq.category || 'ทั่วไป'}
                        </span>
                        <span style={{ fontSize: '11px', background: 'rgba(234,179,8,0.15)', color: 'var(--gold-primary)', padding: '2px 8px', borderRadius: '4px' }}>
                          ระดับ: {bq.difficulty || 'medium'}
                        </span>
                        {Array.isArray(bq.tags) && bq.tags.map((t) => (
                          <span key={t} style={{ fontSize: '10.5px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', padding: '1px 6px', borderRadius: '4px' }}>
                            #{t}
                          </span>
                        ))}
                      </div>

                      <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>{bq.questionText}</div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '6px', fontSize: '12px' }}>
                        {(bq.options || []).map((opt) => (
                          <div
                            key={opt.id}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              background: opt.isCorrect ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.02)',
                              color: opt.isCorrect ? 'var(--emerald-success)' : 'var(--text-muted)'
                            }}
                          >
                            <strong>{opt.id.toUpperCase()}.</strong> {opt.text} {opt.isCorrect && '✓'}
                          </div>
                        ))}
                      </div>

                      {bq.explanation && (
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '8px' }}>
                          💡 <strong>เฉลย:</strong> {bq.explanation}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleEditBankClick(bq)} className="btn btn-outline btn-sm" style={{ padding: '6px 10px', fontSize: '12px' }}>
                        <Edit3 size={13} />
                      </button>
                      <button onClick={() => handleDeleteBankQuestion(bq.id)} className="btn btn-danger btn-sm" style={{ padding: '6px 10px', fontSize: '12px' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ประวัติและผลคะแนนสอบ (Attempts History)                            */}
      {/* ========================================================================= */}
      {activeTab === 'attempts' && (
        <div className="glass-panel" style={{ padding: '22px', borderRadius: '12px' }}>
          
          {/* ========================================================================= */}
          {/* แผงควบคุมเปิด/ปิดห้วงการทดสอบความรู้ (Exam Period On/Off Control)          */}
          {/* ========================================================================= */}
          <div style={{
            marginBottom: '22px',
            padding: '20px',
            borderRadius: '12px',
            background: examSettings.isExamPeriodActive
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(15, 23, 42, 0.75) 100%)'
              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.75) 100%)',
            border: examSettings.isExamPeriodActive
              ? '1.5px solid rgba(239, 68, 68, 0.35)'
              : '1.5px solid rgba(16, 185, 129, 0.35)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ flex: 1, minWidth: '300px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={20} color={examSettings.isExamPeriodActive ? 'var(--ruby-danger)' : 'var(--emerald-success)'} />
                    <span>การควบคุมห้วงเวลาการทดสอบความรู้</span>
                  </span>
                  <span className={`badge ${examSettings.isExamPeriodActive ? 'badge-red' : 'badge-emerald'}`} style={{ fontSize: '12px', padding: '4px 10px', fontWeight: 700 }}>
                    {examSettings.isExamPeriodActive ? '🔴 เปิดห้วงบังคับต้องผ่านแบบทดสอบ' : '🟢 ปิดห้วงการทดสอบ (ใช้งานได้ตามปกติ)'}
                  </span>
                </div>

                <p style={{ fontSize: '13.5px', color: '#e2e8f0', margin: 0, lineHeight: 1.6 }}>
                  {examSettings.isExamPeriodActive ? (
                    <span>
                      ⚠️ <strong>สถานะปัจจุบัน:</strong> อยู่ในห้วงการทดสอบความรู้ — <span style={{ color: '#fca5a5', fontWeight: 600 }}>ผู้ใช้งานทุกคนต้องผ่านแบบทดสอบความรู้ก่อน จึงจะสามารถเข้าใช้งานระบบได้</span> (หากยังไม่ผ่านจะไม่สามารถเข้าหน้างานหลักได้)
                    </span>
                  ) : (
                    <span>
                      ✓ <strong>สถานะปัจจุบัน:</strong> ปิดห้วงการทดสอบความรู้ — <span style={{ color: '#86efac', fontWeight: 600 }}>ผู้ใช้งานทุกคนสามารถเข้าใช้งานระบบ เสนอเรื่อง ตรวจสอบ และติดตามงานได้ตามปกติทันที</span> โดยไม่ต้องผ่านแบบทดสอบ
                    </span>
                  )}
                </p>

                {examSettings.updatedAt && (
                  <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '8px' }}>
                    อัปเดตสถานะล่าสุด: {fmtDateTime(examSettings.updatedAt)} {examSettings.updatedBy ? `โดย ${examSettings.updatedBy}` : ''}
                  </div>
                )}
              </div>

              {/* ปุ่มสวิตช์เปิด/ปิดห้วงการทดสอบ */}
              <div>
                <button
                  type="button"
                  onClick={handleToggleExamPeriod}
                  disabled={toggleLoading}
                  className="btn"
                  style={{
                    padding: '11px 24px',
                    fontSize: '14px',
                    fontWeight: 700,
                    gap: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: toggleLoading ? 'not-allowed' : 'pointer',
                    background: examSettings.isExamPeriodActive
                      ? 'rgba(239, 68, 68, 0.2)'
                      : 'var(--emerald-success)',
                    border: examSettings.isExamPeriodActive
                      ? '1px solid var(--ruby-danger)'
                      : '1px solid var(--emerald-success)',
                    color: examSettings.isExamPeriodActive ? '#fca5a5' : '#070d1e',
                    boxShadow: examSettings.isExamPeriodActive
                      ? '0 0 15px rgba(239, 68, 68, 0.2)'
                      : '0 0 15px rgba(16, 185, 129, 0.3)'
                  }}
                  title={examSettings.isExamPeriodActive ? 'กดเพื่อปิดห้วงการทดสอบ ให้ผู้ใช้ทุกคนใช้งานได้ตามปกติ' : 'กดเพื่อเปิดห้วงการทดสอบ บังคับให้ผู้ใช้ต้องสอบผ่านก่อน'}
                >
                  <Power size={17} />
                  <span>
                    {toggleLoading
                      ? 'กำลังบันทึก...'
                      : examSettings.isExamPeriodActive
                      ? 'ปิดห้วงการทดสอบ (อนุญาตใช้งานได้ปกติ)'
                      : 'เปิดห้วงบังคับต้องผ่านแบบทดสอบ'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={18} style={{ color: 'var(--emerald-success)' }} />
                ประวัติและสถิติการทำแบบทดสอบของผู้ใช้ทั้งหมด ({attempts.length} ครั้ง)
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                ตรวจสอบผลคะแนน เวลาที่ใช้ และคำตอบของกำลังพลที่เข้ารับการทดสอบความรู้
              </p>
            </div>
            <button onClick={loadAttempts} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
              <RefreshCw size={14} /> รีเฟรช
            </button>
          </div>

          {attemptsLoading ? (
            <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>กำลังโหลดประวัติการสอบ...</div>
          ) : attempts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)', border: '1px dashed var(--border-glass)', borderRadius: '10px' }}>
              ยังไม่มีประวัติการทำแบบทดสอบในระบบ
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-glass)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 10px', color: 'var(--text-muted)', fontWeight: 600 }}>วัน-เวลาที่สอบ</th>
                    <th style={{ padding: '12px 10px', color: 'var(--text-muted)', fontWeight: 600 }}>ผู้เข้าสอบ</th>
                    <th style={{ padding: '12px 10px', color: 'var(--text-muted)', fontWeight: 600 }}>แบบทดสอบ</th>
                    <th style={{ padding: '12px 10px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>คะแนนที่ได้</th>
                    <th style={{ padding: '12px 10px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>สถานะ</th>
                    <th style={{ padding: '12px 10px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>เวลาที่ใช้</th>
                    <th style={{ padding: '12px 10px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>ดูผลสอบ</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((att) => (
                    <tr key={att.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 10px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        {fmtDateTime(att.completedAt || att.startedAt)}
                      </td>

                      <td style={{ padding: '12px 10px' }}>
                        <div style={{ fontWeight: 600 }}>{att.userName || 'ผู้ใช้งาน'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{att.unitName || '-'}</div>
                      </td>

                      <td style={{ padding: '12px 10px' }}>
                        <div style={{ fontWeight: 500 }}>{att.examTitle || 'แบบทดสอบ'}</div>
                      </td>

                      <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: att.passed ? 'var(--emerald-success)' : 'var(--ruby-danger)' }}>
                          {att.score}%
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          ({att.correctAnswers}/{att.totalQuestions} ข้อ)
                        </div>
                      </td>

                      <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                        {att.passed ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(16,185,129,0.15)', color: 'var(--emerald-success)', fontSize: '11.5px', fontWeight: 600 }}>
                            <Check size={12} /> ผ่านเกณฑ์
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(239,68,68,0.15)', color: 'var(--ruby-danger)', fontSize: '11.5px', fontWeight: 600 }}>
                            <X size={12} /> ไม่ผ่าน
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '12px 10px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                        {att.timeSpentSeconds ? `${Math.floor(att.timeSpentSeconds / 60)} น. ${att.timeSpentSeconds % 60} วิ.` : '-'}
                      </td>

                      <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setViewingAttempt(att)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 10px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Eye size={13} /> ตรวจคำตอบ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: นำเข้าข้อสอบจาก Excel (Excel Import)                                */}
      {/* ========================================================================= */}
      {activeTab === 'import' && (
        <div className="glass-panel" style={{ padding: '22px', borderRadius: '12px' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlusCircle size={18} style={{ color: 'var(--gold-primary)' }} />
            นำเข้าข้อสอบจากไฟล์ Excel (.xlsx)
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
            อัปโหลดไฟล์ Excel เพื่อนำเข้าข้อสอบเข้าชุดแบบทดสอบที่ต้องการ หรือเข้าธนาคารคำถามกลาง โดยคอลัมน์ใน Excel ต้องประกอบด้วย: <code>คำถาม</code>, <code>ตัวเลือก ก</code>, <code>ตัวเลือก ข</code>, <code>ตัวเลือก ค</code>, <code>ตัวเลือก ง</code>, <code>เฉลย (a/b/c/d)</code>, <code>[คะแนน]</code>, <code>[คำอธิบายเฉลย]</code>
          </p>

          {!importPreview ? (
            <form onSubmit={handleImportPreview} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>เลือกไฟล์ Excel (.xlsx) *</label>
                <input type="file" accept=".xlsx" onChange={handleImportFileChange} className="form-input" required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>ระบุชุดแบบทดสอบเป้าหมาย (หากต้องการผูกเข้าชุด)</label>
                <select className="form-input" value={importExamId} onChange={(e) => setImportExamId(e.target.value)}>
                  <option value="">-- ไม่ระบุ (นำเข้าสู่ธนาคารคำถามกลาง) --</option>
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>{ex.title}</option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <button type="submit" className="btn btn-primary" disabled={importLoading || !importFile} style={{ padding: '10px 24px' }}>
                  {importLoading ? 'กำลังอ่านและตรวจสอบไฟล์...' : 'อ่านข้อมูลตัวอย่างจากไฟล์'}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ fontWeight: 600, color: 'var(--cyan-accent)' }}>
                  {importPreview.message || `พบข้อสอบที่ถูกต้องทั้งหมด ${importPreview.questions?.length || 0} ข้อ`}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setImportPreview(null)} className="btn btn-outline btn-sm">
                    เลือกไฟล์ใหม่
                  </button>
                  <button onClick={handleConfirmImport} className="btn btn-primary btn-sm" disabled={importSaving || !importPreview.questions || importPreview.questions.length === 0} style={{ padding: '6px 18px' }}>
                    {importSaving ? 'กำลังนำเข้า...' : 'ยืนยันนำเข้าข้อสอบทั้งหมด'}
                  </button>
                </div>
              </div>

              {importPreview.errors && importPreview.errors.length > 0 && (
                <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '12px', color: 'var(--ruby-danger)', fontSize: '13px', marginBottom: '14px' }}>
                  {importPreview.errors.map((err, i) => (
                    <div key={i} style={{ marginBottom: '4px' }}>⚠️ แถวที่ {err.row}: {err.message}</div>
                  ))}
                </div>
              )}

              {importPreview.questions && importPreview.questions.length > 0 && (
                <div style={{ maxHeight: '350px', overflowY: 'auto', border: '1px solid var(--border-glass)', borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-glass)', textAlign: 'left', background: 'rgba(255,255,255,0.03)' }}>
                        <th style={{ padding: '8px 10px', width: '40px' }}>#</th>
                        <th style={{ padding: '8px 10px' }}>คำถาม</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center', width: '80px' }}>เฉลย</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center', width: '80px' }}>คะแนน</th>
                        <th style={{ padding: '8px 10px', width: '140px' }}>เป้าหมาย</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.questions.map((q, i) => {
                        const correct = q.options?.find((o) => o.isCorrect)?.id?.toUpperCase() || '-';
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--gold-primary)', fontWeight: 600 }}>{i + 1}</td>
                            <td style={{ padding: '8px 10px' }}>{q.questionText}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700, color: 'var(--emerald-success)' }}>{correct}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'center' }}>{q.points || 10}</td>
                            <td style={{ padding: '8px 10px', fontSize: '11px', color: 'var(--text-muted)' }}>
                              {importExamId ? (exams.find((e) => e.id === importExamId)?.title || importExamId) : 'ธนาคารคำถามกลาง'}
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
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ดึงคำถามจากธนาคารเข้าชุดข้อสอบ (Copy Bank to Exam Modal)         */}
      {/* ========================================================================= */}
      {copyModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '780px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '17px', margin: 0, fontWeight: 700, color: 'var(--cyan-accent)' }}>
                  ดึงคำถามจากธนาคารคำถามเข้าสู่ &quot;{selectedExam?.title}&quot;
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  ทำเครื่องหมายถูกที่ข้อที่ต้องการ แล้วคลิกยืนยันเพื่อนำเข้าชุดข้อสอบนี้
                </p>
              </div>
              <button onClick={() => setCopyModalOpen(false)} className="btn btn-outline btn-sm">
                <X size={16} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '10px', marginBottom: '16px' }}>
              {bankQuestions.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  ยังไม่มีคำถามในธนาคารกลาง
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {bankQuestions.map((bq) => {
                    const isChecked = selectedBankIdsToCopy.includes(bq.id);
                    return (
                      <label
                        key={bq.id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: isChecked ? 'rgba(20,184,166,0.1)' : 'rgba(255,255,255,0.02)',
                          border: isChecked ? '1px solid var(--cyan-accent)' : '1px solid transparent',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBankIdsToCopy([...selectedBankIdsToCopy, bq.id]);
                            } else {
                              setSelectedBankIdsToCopy(selectedBankIdsToCopy.filter((id) => id !== bq.id));
                            }
                          }}
                          style={{ marginTop: '3px', width: '16px', height: '16px', accentColor: 'var(--cyan-accent)' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13.5px', fontWeight: 600 }}>{bq.questionText}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            หมวดหมู่: {bq.category || 'ทั่วไป'} | คะแนน: {bq.points || 10}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                เลือกแล้ว {selectedBankIdsToCopy.length} ข้อ
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setCopyModalOpen(false)} className="btn btn-secondary btn-sm">
                  ยกเลิก
                </button>
                <button
                  onClick={handleCopyBankQuestionsToExam}
                  className="btn btn-primary btn-sm"
                  disabled={copyingToExam || selectedBankIdsToCopy.length === 0}
                  style={{ padding: '6px 16px' }}
                >
                  {copyingToExam ? 'กำลังนำเข้า...' : `นำเข้าคำถามที่เลือก (${selectedBankIdsToCopy.length})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ตรวจคำตอบละเอียดของผู้เข้าสอบ (Attempt Answer Review Modal)       */}
      {/* ========================================================================= */}
      {viewingAttempt && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', borderRadius: '14px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '18px', margin: 0, fontWeight: 700 }}>
                  ผลการสอบของ: <span style={{ color: 'var(--gold-primary)' }}>{viewingAttempt.userName}</span>
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
                  {viewingAttempt.unitName} | {viewingAttempt.examTitle} | {fmtDateTime(viewingAttempt.completedAt)}
                </div>
              </div>
              <button onClick={() => setViewingAttempt(null)} className="btn btn-outline btn-sm">
                <X size={16} />
              </button>
            </div>

            {/* สรุปคะแนน */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px', textAlign: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>คะแนนที่ได้</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: viewingAttempt.passed ? 'var(--emerald-success)' : 'var(--ruby-danger)' }}>
                  {viewingAttempt.score}%
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>ตอบถูก</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--gold-primary)' }}>
                  {viewingAttempt.correctAnswers} / {viewingAttempt.totalQuestions} ข้อ
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>ผลการประเมิน</div>
                <div style={{ fontSize: '16px', fontWeight: 800, marginTop: '2px', color: viewingAttempt.passed ? 'var(--emerald-success)' : 'var(--ruby-danger)' }}>
                  {viewingAttempt.passed ? '✓ ผ่านเกณฑ์' : '✗ ไม่ผ่านเกณฑ์'}
                </div>
              </div>
            </div>

            {/* รายการคำถามและคำตอบที่เลือก */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
              {(viewingAttempt.answers || []).map((ans, idx) => (
                <div
                  key={idx}
                  style={{
                    background: ans.isCorrect ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
                    border: ans.isCorrect ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(239,68,68,0.25)',
                    borderRadius: '8px',
                    padding: '12px 14px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, fontSize: '12.5px' }}>ข้อที่ {idx + 1}</span>
                    {ans.isCorrect ? (
                      <span style={{ fontSize: '11px', color: 'var(--emerald-success)', fontWeight: 600 }}>✓ ตอบถูกต้อง</span>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--ruby-danger)', fontWeight: 600 }}>✗ ตอบผิด</span>
                    )}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>{ans.questionText}</div>

                  <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>คำตอบของผู้สอบ: </span>
                      <strong style={{ color: ans.isCorrect ? 'var(--emerald-success)' : 'var(--ruby-danger)' }}>
                        {ans.selectedOptionText}
                      </strong>
                    </div>
                    {!ans.isCorrect && (
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>เฉลยที่ถูกต้อง: </span>
                        <strong style={{ color: 'var(--emerald-success)' }}>
                          {ans.correctOptionText}
                        </strong>
                      </div>
                    )}
                    {ans.explanation && (
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '4px' }}>
                        💡 {ans.explanation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '14px', textAlign: 'right' }}>
              <button onClick={() => setViewingAttempt(null)} className="btn btn-secondary btn-sm" style={{ padding: '6px 18px' }}>
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
