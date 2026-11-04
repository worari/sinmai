// app/knowledge/page.js
// ศูนย์รวมคลังความรู้และแบบทดสอบความรู้ของผู้ใช้งานระบบ
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle2, Clock, AlertCircle, ShieldCheck, Play, FileText, Video, Lock } from 'lucide-react';

export default function KnowledgePage() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(null);
  const [manuals, setManuals] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('rta_user');
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch (e) { setUser(null); }
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const uid = user ? user.id : null;
      const promises = [];
      if (uid) promises.push(fetch(`/api/knowledge/status?userId=${encodeURIComponent(uid)}`));
      promises.push(fetch('/api/content/manuals'));
      promises.push(fetch('/api/content/videos'));
      const results = await Promise.all(promises.map((p) => p.catch((e) => ({ success: false }))));
      let idx = 0;
      if (uid) {
        const s = await results[idx++].json();
        if (s.success) setStatus(s);
      }
      const m = await results[idx++].json();
      if (m.success) setManuals(m.manuals || []);
      const v = await results[idx++].json();
      if (v.success) setVideos(v.videos || []);
    } catch (e) {
      console.error('load knowledge data error', e);
    } finally {
      setLoading(false);
    }
  };

  const passed = status?.passed === true;
  const canTake = status?.windowOpen?.open === true;
  const attemptCount = status?.attemptCount || 0;
  const latestScore = status?.score;

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
        <Link href="/manuals" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BookOpen size={16} /> ดูคู่มือทั้งหมด
        </Link>
      </div>

      <div className="glass-panel" style={{ padding: '22px', borderRadius: '12px', marginBottom: '24px', borderLeft: `6px solid ${passed ? 'var(--emerald-success)' : 'var(--ruby-danger)'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
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
            <div style={{ fontSize: '16px', fontWeight: 700 }}>{passed ? 'ผ่านการทดสอบความรู้แล้ว' : 'ยังไม่ผ่านการทดสอบความรู้'}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{status?.message || '-'}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '12px', marginTop: '10px', paddingTop: '14px', borderTop: '1px solid var(--border-glass)' }}>
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>สถานะใช้งานระบบ</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: passed ? 'var(--emerald-success)' : 'var(--ruby-danger)' }}>{passed ? 'ใช้งานได้' : 'ใช้งานไม่ได้'}</div>
          </div>
          <div style={{ background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.2)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>คะแนนสูงสุด</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--cyan-accent)' }}>{latestScore !== null ? latestScore + ' คะแนน' : 'ยังไม่สอบ'}</div>
          </div>
          <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>จำนวนครั้งที่สอบ</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--gold-primary)' }}>{attemptCount} ครั้ง</div>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '22px', borderRadius: '12px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
          <Play size={22} style={{ color: 'var(--gold-primary)' }} />
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>เข้าทำแบบทดสอบความรู้</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>คะแนนเต็ม 100 • เกณฑ์ผ่าน 80 คะแนน • เวลา 30 นาที</div>
          </div>
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>{status?.windowOpen?.message || 'ข้อมูลช่วงเวลาเปิดสอบ'}</div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {!passed && canTake ? (
            <Link href="/knowledge/exam" className="btn btn-primary" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Play size={18} /> เริ่มทำแบบทดสอบ
            </Link>
          ) : passed ? (
            <span className="btn btn-secondary" style={{ padding: '12px 24px', color: 'var(--emerald-success)', border: '1px solid var(--emerald-success)', background: 'rgba(16,185,129,0.1)' }}>คุณผ่านแบบทดสอบแล้ว</span>
          ) : (
            <span className="btn btn-secondary" style={{ padding: '12px 24px', opacity: 0.6, cursor: 'not-allowed' }}>
              <Lock size={18} /> ยังไม่ถึงช่วงเปิดสอบ
            </span>
          )}
          {attemptCount > 0 && (
            <Link href="/knowledge/exam" className="btn btn-outline" style={{ padding: '12px 24px', border: '1px solid var(--border-glass)' }}>สอบใหม่ / ดูรายละเอียด</Link>
          )}
        </div>
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
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
            <AlertCircle size={20} style={{ color: 'var(--ruby-danger)', marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--ruby-danger)', marginBottom: '6px' }}>ข้อสำคัญ: หากยังไม่ผ่านแบบทดสอบความรู้</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6 }}>
                ท่านจะยังไม่สามารถใช้งานฟังก์ชันหลักของระบบ (ยื่นเสนอเรื่อง, ดูคำร้อง, Dashboard ฯลฯ) ได้ กรุณาศึกษาคลังความรู้แล้วเข้าทำแบบทดสอบให้ผ่านเกณฑ์ (คะแนนไม่น้อยกว่า 80 คะแนน) ก่อนจึงจะใช้งานระบบได้เต็มรูปแบบ
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
