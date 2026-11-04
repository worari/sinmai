// app/knowledge/admin/page.js
// จัดการแบบทดสอบความรู้ (สำหรับผู้ดูแลระบบ ADMIN)
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, ShieldAlert, PlusCircle, Edit3, Trash2, Clock, Save } from 'lucide-react';

const ADMIN_ROLES = ['ADMIN'];

export default function KnowledgeAdminPage() {
  const [user, setUser] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', passingScore: 80, timeLimitMinutes: 30, questionCount: 10, isActive: true, openAt: '', closeAt: '', instructions: '' });
  const [saving, setSaving] = useState(false);

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
      setError('โหลดรายการแบบทดสอบไม่สำเร็จ');
    } finally {
      setLoading(false);
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

  const handleSave = async (e) => {
    e.preventDefault();
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
      setError('บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id, current) => {
    try {
      await fetch('/api/knowledge/exams', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, isActive: !current }) });
      loadExams();
    } catch (e) {
      setError('เปลี่ยนสถานะไม่สำเร็จ');
    }
  };

  const removeExam = async (id) => {
    if (!confirm('ยืนยันลบแบบทดสอบนี้หรือไม่? (ข้อสอบและประวัติการสอบที่เกี่ยวข้องจะถูกลบด้วย)')) return;
    try {
      await fetch(`/api/knowledge/exams?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      loadExams();
    } catch (e) {
      setError('ลบไม่สำเร็จ');
    }
  };

  const fmtDateTime = (v) => { if (!v) return '-'; return new Date(v).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }); };

  return (
    <div className="container" style={{ paddingTop: '20px', maxWidth: '1080px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', marginBottom: '4px' }}>จัดการแบบทดสอบความรู้</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px' }}>ตั้งค่าเกณฑ์คะแนน ช่วงเวลาเปิด-ปิด และสถานะแบบทดสอบที่ใช้วัดสิทธิการใช้งานระบบ</p>
        </div>
        <Link href="/knowledge" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><BookOpen size={16} /> กลับคลังความรู้</Link>
      </div>
      {error && (<div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '12px', color: 'var(--ruby-danger)', fontSize: '13px', marginBottom: '16px' }}>{error}</div>)}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>{editingId ? <Edit3 size={18} style={{ color: 'var(--gold-primary)' }} /> : <PlusCircle size={18} style={{ color: 'var(--cyan-accent)' }} />}{editingId ? ' แก้ไขแบบทดสอบ' : ' สร้างแบบทดสอบใหม่'}</div>
        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '14px', alignItems: 'end' }}>
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
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>รายการแบบทดสอบในระบบ</div>
        {loading ? (<div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>กำลังโหลด...</div>) : exams.length === 0 ? (<div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>ยังไม่มีแบบทดสอบในระบบ</div>) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead><tr style={{ borderBottom: '2px solid var(--border-glass)', textAlign: 'left' }}><th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>ชื่อแบบทดสอบ</th><th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>คะแนนผ่าน</th><th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>สถานะ</th><th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>ช่วงเวลาเปิด-ปิด</th><th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>จัดการ</th></tr></thead>
              <tbody>
                {exams.map((ex) => (
                  <tr key={ex.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 8px' }}>{ex.title}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700, color: 'var(--gold-primary)' }}>{ex.passingScore} คะแนน</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>{ex.isActive ? (<span style={{ color: 'var(--emerald-success)', fontSize: '12px', fontWeight: 600 }}>เปิดใช้งาน</span>) : (<span style={{ color: 'var(--ruby-danger)', fontSize: '12px', fontWeight: 600 }}>ปิดใช้งาน</span>)}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>เปิด {fmtDateTime(ex.openAt)}<br />ปิด {fmtDateTime(ex.closeAt)}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      <button onClick={() => toggleActive(ex.id, ex.isActive)} className="btn btn-secondary btn-sm" style={{ padding: '6px 12px', fontSize: '12px' }}>{ex.isActive ? 'ปิดการใช้งาน' : 'เปิดการใช้งาน'}</button>
                      <button onClick={() => { setEditingId(ex.id); setForm({ title: ex.title, description: ex.description || '', passingScore: ex.passingScore, timeLimitMinutes: ex.timeLimitMinutes, questionCount: ex.questionCount, isActive: ex.isActive, openAt: ex.openAt ? new Date(ex.openAt).toISOString().slice(0,16) : '', closeAt: ex.closeAt ? new Date(ex.closeAt).toISOString().slice(0,16) : '', instructions: ex.instructions || '' }); }} className="btn btn-outline btn-sm" style={{ padding: '6px 12px', fontSize: '12px', border: '1px solid var(--border-glass)' }}>แก้ไข</button>
                      <button onClick={() => removeExam(ex.id)} className="btn btn-danger btn-sm" style={{ padding: '6px 12px', fontSize: '12px' }}>ลบ</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
