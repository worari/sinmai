// app/knowledge/page.js
// ศูนย์รวมคลังความรู้และแบบทดสอบความรู้ของผู้ใช้งานระบบ
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle2, Clock, AlertCircle, ShieldCheck, Play, FileText, Video, Lock, BarChart3, PlusCircle } from 'lucide-react';

export default function KnowledgePage() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(null);
  const [manuals, setManuals] = useState([]);
  const [videos, setVideos] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async (uid) => {
    try {
      const t = Date.now();
      const promises = [];
      if (uid) promises.push(fetch(`/api/knowledge/status?userId=${encodeURIComponent(uid)}&_t=${t}`, { cache: 'no-store' }));
      promises.push(fetch('/api/content/manuals', { cache: 'no-store' }));
      promises.push(fetch('/api/content/videos', { cache: 'no-store' }));
      promises.push(fetch('/api/knowledge/exams', { cache: 'no-store' }));
      const results = await Promise.all(promises.map((p) => p.catch(() => null)));
      let idx = 0;
      if (uid) {
        const sRes = results[idx++];
        if (sRes) {
          const s = await sRes.json();
          if (s.success) setStatus(s);
        }
      }
      const mRes = results[idx++];
      if (mRes) {
        const m = await mRes.json();
        if (m.success) setManuals(m.manuals || []);
      }
      const vRes = results[idx++];
      if (vRes) {
        const v = await vRes.json();
        if (v.success) setVideos(v.videos || []);
      }
      const exRes = results[idx++];
      if (exRes) {
        const ex = await exRes.json();
        if (ex.success) setExams(ex.exams || []);
      }
    } catch (e) {
      console.error('load knowledge data error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let parsedUser = null;
    const saved = localStorage.getItem('rta_user');
    if (saved) {
      try {
        parsedUser = JSON.parse(saved);
        setUser(parsedUser);
      } catch (e) {
        setUser(null);
      }
    }
    loadData(parsedUser?.id || null);

    const handleKnowledgeRefresh = () => {
      const latestRaw = localStorage.getItem('rta_user');
      let uid = parsedUser?.id || null;
      if (latestRaw) {
        try {
          const u = JSON.parse(latestRaw);
          uid = u?.id || uid;
          setUser(u);
        } catch (e) {}
      }
      loadData(uid);
    };

    window.addEventListener('rta_knowledge_change', handleKnowledgeRefresh);
    return () => {
      window.removeEventListener('rta_knowledge_change', handleKnowledgeRefresh);
    };
  }, []);

  const isAdmin = user?.role === 'ADMIN';
  const passed = isAdmin || status?.passed === true || status?.canUseSystem === true || user?.knowledgePassed === true;
  const canTake = status?.windowOpen?.open === true;
  const attemptCount = status?.attemptCount || 0;
  const latestScore = isAdmin ? 100 : status?.score;
  const requiredPassingScore = status?.passingScore || exams.find((e) => e.isActive !== false)?.passingScore || 80;

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '70px', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ padding: '32px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Clock size={20} style={{ color: 'var(--gold-primary)', animation: 'spin 1s linear infinite' }} />
          <span style={{ color: 'var(--text-muted)' }}>กำลังโหลดข้อมูลความรู้...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container" style={{ paddingTop: '70px', maxWidth: '600px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '40px 32px', borderRadius: '12px' }}>
          <ShieldCheck size={40} style={{ color: 'var(--gold-primary)', marginBottom: '16px' }} />
          <h1 style={{ fontSize: '22px', marginBottom: '8px' }}>กรุณาเข้าสู่ระบบก่อน</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>ต้องเข้าสู่ระบบเพื่อเข้าถึงคลังความรู้และทำแบบทดสอบ</p>
          <Link href="/login" className="btn btn-primary" style={{ padding: '10px 24px' }}>เข้าสู่ระบบ</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '20px', maxWidth: '1040px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', marginBottom: '4px' }}>คลังความรู้และแบบทดสอบผู้ใช้งาน</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px' }}>ศึกษาคู่มือและวิดีโอ แล้วทำแบบทดสอบเพื่อรับสิทธิใช้งานระบบ</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {(user?.role === 'ADMIN' || user?.role === 'KSP_OFFICER') && (
            <Link href="/knowledge/admin" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} /> จัดการแบบทดสอบ (ADMIN)
            </Link>
          )}
          <Link href="/manuals" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BookOpen size={16} /> ดูคู่มือทั้งหมด
          </Link>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '22px', borderRadius: '12px', marginBottom: '24px', borderLeft: `6px solid ${passed ? 'var(--emerald-success)' : 'var(--ruby-danger)'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {passed ? (
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--emerald-success)' }}>
                <CheckCircle2 size={20} />
              </div>
            ) : (
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ruby-danger)' }}>
                <AlertCircle size={20} />
              </div>
            )}
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>
                {isAdmin 
                  ? 'สิทธิ์ผู้ดูแลระบบ (Admin) ได้รับยกเว้นไม่ต้องสอบ' 
                  : (status?.isExamPeriodActive === false 
                    ? 'ช่วงเวลาปกติ (ไม่ได้เปิดห้วงบังคับสอบ) — ใช้งานระบบได้ตามปกติ' 
                    : (passed 
                      ? 'ผ่านการทดสอบความรู้แล้ว — ระบบปลดล็อกพร้อมใช้งาน' 
                      : 'ยังไม่ผ่านการทดสอบความรู้ (อยู่ในห้วงบังคับสอบ)'))}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {isAdmin ? 'ผู้ดูแลระบบสูงสุดได้รับสิทธิ์เข้าใช้งานระบบทุกฟังก์ชันโดยอัตโนมัติ' : (status?.message || '-')}
              </div>
            </div>
          </div>

          {passed && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Link href="/dashboard" className="btn btn-success btn-sm" style={{ padding: '8px 16px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <BarChart3 size={16} /> เข้าสู่หน้า Dashboard ใช้งานทันที
              </Link>
              {(user?.role === 'UNIT_OFFICER' || user?.role === 'ADMIN') && (
                <Link href="/submit" className="btn btn-primary btn-sm" style={{ padding: '8px 14px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <PlusCircle size={15} /> ยื่นเสนอขอรับสินไหม
                </Link>
              )}
            </div>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '12px', marginTop: '10px', paddingTop: '14px', borderTop: '1px solid var(--border-glass)' }}>
          <div style={{ background: passed ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${passed ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`, borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>สถานะใช้งานระบบ</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: passed ? 'var(--emerald-success)' : 'var(--ruby-danger)' }}>
              {isAdmin ? 'ใช้งานได้ทุกฟังก์ชัน' : (passed ? 'ใช้งานได้ทันที' : 'ยังไม่ผ่านเกณฑ์')}
            </div>
          </div>
          <div style={{ background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.2)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>เกณฑ์ประเมิน</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--cyan-accent)' }}>
              {isAdmin ? 'ยกเว้นการสอบ' : (latestScore !== null ? `${latestScore} คะแนน (เกณฑ์ ${requiredPassingScore}%)` : `ยังไม่สอบ (เกณฑ์ ${requiredPassingScore}%)`)}
            </div>
          </div>
          <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>จำนวนครั้งที่ทดสอบ</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--gold-primary)' }}>
              {isAdmin ? 'ผู้ดูแลระบบ (Admin)' : `${attemptCount} ครั้ง`}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '22px', borderRadius: '12px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <Play size={22} style={{ color: 'var(--gold-primary)' }} />
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>ชุดแบบทดสอบความรู้</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ทำแบบทดสอบเพื่อวัดความรู้และปลดล็อกการใช้งานระบบ (เกณฑ์ผ่าน {requiredPassingScore}% • มีระบบสุ่มข้อสอบและตัวเลือก)</div>
          </div>
        </div>

        {exams.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {exams.filter((e) => e.isActive !== false).map((ex) => (
              <div key={ex.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', background: 'rgba(20,184,166,0.15)', color: 'var(--cyan-accent)', padding: '2px 8px', borderRadius: '4px' }}>
                      {ex.category || 'ทั่วไป'}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {ex.timeLimitMinutes || 30} นาที • {ex.questionCount || 10} ข้อ
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '14.5px', marginBottom: '6px' }}>{ex.title}</div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>
                    {ex.description || 'แบบทดสอบวัดความรู้เพื่อขอสิทธิใช้งานระบบ'}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-glass)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--gold-primary)', fontWeight: 600 }}>
                    เกณฑ์ผ่าน: {ex.passingScore || 80}%
                  </span>
                  <Link href={`/knowledge/exam?examId=${encodeURIComponent(ex.id)}`} className="btn btn-primary btn-sm" style={{ padding: '6px 14px', fontSize: '12.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Play size={14} /> ทำแบบทดสอบ
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link href="/knowledge/exam" className="btn btn-primary" style={{ padding: '10px 22px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Play size={18} /> เข้าทำแบบทดสอบ
            </Link>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <FileText size={24} style={{ color: 'var(--gold-primary)' }} />
            <div style={{ fontSize: '16px', fontWeight: 700 }}>คู่มือการใช้งาน</div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>เอกสารคู่มือการยื่นเสนอสินไหม การแนบเอกสาร และขั้นตอนการใช้งานระบบ มีทั้งหมด {manuals.length} รายการ</p>
          <Link href="/manuals" className="btn btn-secondary" style={{ padding: '8px 18px', fontSize: '13px' }}>เปิดดูคู่มือ</Link>
        </div>
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Video size={24} style={{ color: 'var(--cyan-accent)' }} />
            <div style={{ fontSize: '16px', fontWeight: 700 }}>วิดีโอสอนการใช้งาน</div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>คลิปวิดีโอแนะนำขั้นตอนการใช้งานระบบทีละขั้นตอน มีทั้งหมด {videos.length} คลิป</p>
          <Link href="/manuals" className="btn btn-secondary" style={{ padding: '8px 18px', fontSize: '13px' }}>เปิดดูวิดีโอ</Link>
        </div>
      </div>

      {!passed && (
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', marginTop: '20px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
            <AlertCircle size={20} style={{ color: 'var(--ruby-danger)', marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--ruby-danger)', marginBottom: '6px' }}>ข้อสำคัญ: หากยังไม่ผ่านแบบทดสอบความรู้</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6 }}>
                ท่านจะยังไม่สามารถใช้งานฟังก์ชันหลักของระบบ (ยื่นเสนอเรื่อง, ดูคำร้อง, Dashboard ฯลฯ) ได้ กรุณาศึกษาคลังความรู้แล้วเข้าทำแบบทดสอบให้ผ่านเกณฑ์ที่กำหนด (คะแนนไม่น้อยกว่า {requiredPassingScore}%) ระบบจะปลดล็อกให้ใช้งานได้ทันทีครับ
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
