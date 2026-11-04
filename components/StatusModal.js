// components/StatusModal.js
'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info, 
  X, 
  ShieldCheck, 
  Clock, 
  FileText, 
  User, 
  Check, 
  CreditCard,
  MessageSquare
} from 'lucide-react';

export function triggerStatusPopup(detail) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('rta_status_popup', { detail }));
  }
}

export default function StatusModal() {
  const [popupData, setPopupData] = useState(null);
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    const handlePopup = (e) => {
      if (e.detail) {
        setPopupData({
          type: e.detail.type || 'success',
          title: e.detail.title || 'ดำเนินการสำเร็จ',
          message: e.detail.message || 'ระบบได้บันทึกการอัปเดตข้อมูลเรียบร้อยแล้ว',
          trackingCode: e.detail.trackingCode,
          casualtyName: e.detail.casualtyName,
          action: e.detail.action,
          by: e.detail.by,
          timestamp: e.detail.timestamp || new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          amount: e.detail.amount,
          ref: e.detail.ref,
          comment: e.detail.comment
        });
        setCountdown(8);
      }
    };

    window.addEventListener('rta_status_popup', handlePopup);
    return () => window.removeEventListener('rta_status_popup', handlePopup);
  }, []);

  // Countdown timer to auto-dismiss
  useEffect(() => {
    if (!popupData) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setPopupData(null);
          return 8;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [popupData]);

  if (!popupData) return null;

  const isSuccess = popupData.type === 'success';
  const isWarning = popupData.type === 'warning';
  const isError = popupData.type === 'error';

  const themeColor = isSuccess 
    ? 'var(--emerald-success)' 
    : isWarning 
    ? 'var(--amber-warning)' 
    : isError 
    ? 'var(--ruby-danger)' 
    : 'var(--cyan-accent)';

  const bgColor = isSuccess 
    ? 'rgba(16, 185, 129, 0.15)' 
    : isWarning 
    ? 'rgba(245, 158, 11, 0.15)' 
    : isError 
    ? 'rgba(239, 68, 68, 0.15)' 
    : 'rgba(20, 184, 166, 0.15)';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(2, 8, 12, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: '20px',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '540px',
        background: 'rgba(4, 20, 23, 0.98)',
        border: `2px solid ${themeColor}`,
        boxShadow: `0 25px 60px rgba(0, 0, 0, 0.85), 0 0 25px ${bgColor}`,
        borderRadius: '16px',
        overflow: 'hidden',
        position: 'relative',
        animation: 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Top Header bar */}
        <div style={{
          height: '4px',
          background: themeColor,
          width: '100%'
        }} />

        {/* Close Button */}
        <button 
          onClick={() => setPopupData(null)}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          title="ปิดการแจ้งเตือน"
        >
          <X size={18} />
        </button>

        <div style={{ padding: '28px 26px 22px' }}>
          
          {/* Status Icon */}
          <div style={{ textAlign: 'center', marginBottom: '18px' }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: bgColor,
              border: `2px solid ${themeColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              color: themeColor,
              boxShadow: `0 0 24px ${bgColor}`
            }}>
              {isSuccess && <CheckCircle2 size={36} strokeWidth={2.4} />}
              {isWarning && <AlertTriangle size={36} strokeWidth={2.4} />}
              {isError && <XCircle size={36} strokeWidth={2.4} />}
              {!isSuccess && !isWarning && !isError && <Info size={36} strokeWidth={2.4} />}
            </div>

            <span className="badge" style={{
              background: bgColor,
              color: themeColor,
              border: `1px solid ${themeColor}`,
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '12px'
            }}>
              🔔 แจ้งเตือนสถานะการกระทำ (Action Status Notification)
            </span>

            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', marginTop: '10px', lineHeight: 1.3 }}>
              {popupData.title}
            </h2>

            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.6 }}>
              {popupData.message}
            </p>
          </div>

          {/* Action Metadata Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '10px',
            border: '1px solid var(--border-glass)',
            padding: '14px 16px',
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '13px'
          }}>
            {popupData.action && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} color="var(--cyan-accent)" /> รายการที่ดำเนินการ:
                </span>
                <strong style={{ color: '#fff' }}>{popupData.action}</strong>
              </div>
            )}

            {popupData.trackingCode && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={14} color="var(--gold-primary)" /> เลขที่คำร้องอ้างอิง:
                </span>
                <span style={{ color: 'var(--gold-primary)', fontWeight: 700 }}>{popupData.trackingCode}</span>
              </div>
            )}

            {popupData.casualtyName && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} /> กำลังพลผู้สูญเสีย:
                </span>
                <span style={{ color: '#fff' }}>{popupData.casualtyName}</span>
              </div>
            )}

            {popupData.amount && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CreditCard size={14} color="var(--emerald-success)" /> ยอดเงินสินไหม:
                </span>
                <strong style={{ color: 'var(--emerald-success)', fontSize: '14px' }}>{popupData.amount}</strong>
              </div>
            )}

            {popupData.ref && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-dim)' }}>เลขอ้างอิงธุรกรรม:</span>
                <span style={{ fontFamily: 'monospace', color: 'var(--cyan-accent)' }}>{popupData.ref}</span>
              </div>
            )}

            {popupData.by && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-dim)' }}>ผู้บันทึกคำสั่ง:</span>
                <span style={{ color: 'var(--gold-light)' }}>{popupData.by}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} /> เวลาที่ระบบบันทึก:
              </span>
              <span style={{ color: 'var(--text-muted)' }}>{popupData.timestamp} น.</span>
            </div>

            {popupData.comment && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px', marginTop: '2px' }}>
                <span style={{ color: 'var(--text-dim)', fontSize: '11.5px', display: 'block' }}>ข้อคิดเห็น/หมายเหตุ:</span>
                <span style={{ color: '#e2e8f0', fontSize: '12.5px', marginTop: '2px', display: 'block' }}>&quot;{popupData.comment}&quot;</span>
              </div>
            )}
          </div>

          {/* Action Acknowledge Button */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => setPopupData(null)}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '15px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderRadius: '10px'
              }}
            >
              <Check size={18} strokeWidth={2.5} />
              <span>รับทราบ (Acknowledge)</span>
            </button>

            <div style={{ textAlign: 'center', fontSize: '11.5px', color: 'var(--text-dim)' }}>
              หน้าต่างจะปิดอัตโนมัติใน {countdown} วินาที หรือกดปุ่มรับทราบทันที
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
