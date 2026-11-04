// app/track/page.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Building, 
  CreditCard, 
  Calendar,
  AlertCircle,
  ArrowRight,
  User
} from 'lucide-react';
import { formatThaiDate } from '@/lib/thai-utils';

export default function TrackClaimPage() {
  const [citizenId, setCitizenId] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const STEPS = [
    { step: 1, title: 'หน่วยเสนอเรื่อง', desc: 'หน่วยต้นสังกัดจัดทำรายงานและแนบเอกสาร 10 รายการ' },
    { step: 2, title: 'กพ.ทบ. (กสพ.ฯ) ตรวจเอกสาร', desc: 'ตรวจสอบความถูกต้องครบถ้วนของเอกสารหลักฐาน' },
    { step: 3, title: 'ผู้บังคับบัญชาอนุมัติ', desc: 'จก.กพ.ทบ. พิจารณาลงนามอนุมัติสิทธิเงินสินไหม' },
    { step: 4, title: 'บ.ประกันภัยโอนเงิน', desc: 'บริษัทประกันภัยตรวจสอบและโอนเงินเข้าบัญชีทายาท' },
    { step: 5, title: 'สก.ทบ. รับทราบยอด', desc: 'บันทึกประวัติเงินช่วยเหลือสงเคราะห์เสร็จสมบูรณ์' }
  ];

  const handleTrack = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setResult(null);

    const cleanId = citizenId.replace(/\D/g, '');
    if (cleanId.length !== 13) {
      setErrorMsg('กรุณากรอกเลขประจำตัวประชาชนให้ครบ 13 หลัก');
      return;
    }

    if (!birthDate) {
      setErrorMsg('กรุณาเลือกวัน/เดือน/ปีเกิด');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ citizenId: cleanId, birthDate })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'ไม่พบข้อมูลคำร้องที่ระบุ');
      }

      setResult(data.claim);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '32px', maxWidth: '900px' }}>
      
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #d4af37 0%, #aa8010 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
          boxShadow: '0 0 20px rgba(212, 175, 55, 0.35)'
        }}>
          <Search size={30} color="#070d1e" />
        </div>
        <h1 style={{ fontSize: '24px' }}>ระบบตรวจสอบและติดตามสถานะสิทธิเงินค่าสินไหมทดแทน</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>
          สำหรับกำลังพลและทายาทผู้มีสิทธิ ตรวจสอบขั้นตอนการดำเนินเรื่อง กรอบเวลา SLA และผลการโอนเงิน
        </p>
      </div>

      {/* Verification Search Box */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '30px', borderLeft: '4px solid var(--gold-primary)' }}>
        <form onSubmit={handleTrack}>
          <div className="grid-cols-2" style={{ gap: '20px' }}>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label required">1. เลขประจำตัวประชาชนผู้สูญเสีย (13 หลัก)</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="x-xxxx-xxxxx-xx-x"
                maxLength={17}
                value={citizenId}
                onChange={(e) => setCitizenId(e.target.value)}
                required
              />
              <span style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                เลข 13 หลักของผู้เสียชีวิตหรือพิการทุพพลภาพ
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label required">2. วัน/เดือน/ปีเกิด (ของผู้สูญเสีย)</label>
              <input 
                type="date" 
                className="form-input"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
              />
              <span style={{ fontSize: '11.5px', color: 'var(--gold-primary)', marginTop: '4px', display: 'block' }}>
                {birthDate ? `วันเกิด พ.ศ.: ${formatThaiDate(birthDate)}` : 'ระบุวันเกิดเพื่อยืนยันตัวตนความถูกต้อง'}
              </span>
            </div>

          </div>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ padding: '12px 36px', fontSize: '15px' }}
              disabled={loading}
            >
              <Search size={17} />
              <span>{loading ? 'กำลังตรวจสอบข้อมูล...' : 'ตรวจสอบสถานะการดำเนินเรื่อง'}</span>
            </button>
          </div>
        </form>

        {/* Demo Quick Fill Helper */}
        <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-glass)', textAlign: 'center', fontSize: '12.5px', color: 'var(--text-dim)' }}>
          ตัวอย่างทดสอบ: 
          <button 
            type="button"
            onClick={() => { setCitizenId('3100500112233'); setBirthDate('1995-04-12'); }}
            style={{ background: 'none', border: 'none', color: 'var(--gold-primary)', textDecoration: 'underline', cursor: 'pointer', marginLeft: '6px' }}
          >
            ส.อ. ประวิทย์ (3100500112233, 12 เม.ย. 2538)
          </button>
        </div>
      </div>

      {errorMsg && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--ruby-danger)', borderRadius: '8px', padding: '14px 18px', marginBottom: '24px', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={20} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Result Display Card */}
      {result && (
        <div className="glass-panel" style={{ padding: '30px', marginBottom: '40px', borderTop: '3px solid var(--emerald-success)' }}>
          
          {/* Header of Claim */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '24px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '18px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>เลขที่คำร้องอ้างอิง:</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--gold-primary)' }}>
                {result.trackingCode}
              </div>
              <div style={{ fontSize: '15px', color: '#fff', fontWeight: 600, marginTop: '4px' }}>
                {result.casualtyName}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                สังกัด: {result.unitName}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>ยอดเงินสิทธิสินไหมทดแทน:</div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#34d399' }}>
                {result.compensationAmount?.toLocaleString('th-TH')} บาท
              </div>
              <span className={`badge ${result.claimType === 'HIGH_RISK' ? 'badge-amber' : 'badge-blue'}`} style={{ marginTop: '4px' }}>
                {result.claimType === 'HIGH_RISK' ? 'หน้าที่สำคัญ/เสี่ยงภัย' : 'ยามปกติ'}
              </span>
            </div>
          </div>

          {/* Current Step Banner */}
          <div style={{
            background: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '16px 20px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--gold-primary)', fontWeight: 600 }}>สถานะปัจจุบันในระบบ:</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                ขั้นตอนที่ {result.currentStep} จาก 5: {result.statusLabel}
              </div>
            </div>

            <div>
              {result.slaStatus === 'OVERDUE' && !result.paidAt ? (
                <span className="sla-pill sla-overdue" style={{ fontSize: '13px', padding: '6px 12px' }}>
                  ⚠️ ดำเนินเรื่องมาแล้ว {result.daysElapsed} วัน (เกินกรอบเวลา 30 วัน)
                </span>
              ) : (
                <span className="sla-pill sla-normal" style={{ fontSize: '13px', padding: '6px 12px' }}>
                  <Clock size={14} /> ดำเนินเรื่องมาแล้ว {result.daysElapsed} วัน ({result.slaLabel})
                </span>
              )}
            </div>
          </div>

          {/* 5-Step Workflow Visualizer */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '18px', color: 'var(--gold-light)' }}>
              ขั้นตอนการดำเนินเรื่อง 5 ระดับ (Workflow Progress)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {STEPS.map((s) => {
                const isPassed = s.step < result.currentStep;
                const isCurrent = s.step === result.currentStep;

                return (
                  <div 
                    key={s.step}
                    style={{
                      padding: '12px 10px',
                      borderRadius: '8px',
                      background: isCurrent 
                        ? 'rgba(212, 175, 55, 0.2)' 
                        : isPassed 
                        ? 'rgba(16, 185, 129, 0.12)' 
                        : 'rgba(255, 255, 255, 0.03)',
                      border: isCurrent 
                        ? '1px solid var(--gold-primary)' 
                        : isPassed 
                        ? '1px solid rgba(16, 185, 129, 0.4)' 
                        : '1px solid var(--border-glass)',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: isCurrent ? 'var(--gold-primary)' : isPassed ? 'var(--emerald-success)' : 'rgba(255, 255, 255, 0.1)',
                      color: isCurrent || isPassed ? '#070d1e' : 'var(--text-dim)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '12px',
                      margin: '0 auto 8px'
                    }}>
                      {isPassed ? '✓' : s.step}
                    </div>

                    <div style={{ fontSize: '12px', fontWeight: 600, color: isCurrent ? '#fff' : isPassed ? '#34d399' : 'var(--text-muted)' }}>
                      {s.title}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline History */}
          <div>
            <h3 style={{ fontSize: '16px', marginBottom: '14px', color: '#fff' }}>ประวัติการบันทึกในระบบ</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {result.timeline?.map((t, idx) => (
                <div key={idx} style={{ padding: '10px 14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gold-primary)', fontWeight: 600 }}>
                    <span>{t.action}</span>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-dim)', fontWeight: 400 }}>
                      {new Date(t.timestamp).toLocaleString('th-TH')}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>{t.remark}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
