// app/reset-password/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { KeyRound, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('รหัสผ่านใหม่และการยืนยันไม่ตรงกัน');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, newPassword })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'รีเซ็ตรหัสผ่านไม่สำเร็จ');
      }

      setSuccessMsg(data.message);
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '50px', maxWidth: '520px' }}>
      
      <div className="glass-panel" style={{ padding: '32px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            background: 'rgba(212, 175, 55, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            color: 'var(--gold-primary)'
          }}>
            <KeyRound size={28} />
          </div>
          <h1 style={{ fontSize: '20px' }}>รีเซ็ตรหัสผ่านผู้ใช้งาน</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            กรอกเลขประจำตัวประชาชน (13 หลัก) หรือ Email เพื่อตั้งรหัสผ่านใหม่
          </p>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--ruby-danger)', borderRadius: '8px', padding: '10px 14px', marginBottom: '18px', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--emerald-success)', borderRadius: '8px', padding: '10px 14px', marginBottom: '18px', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleReset}>
          
          <div className="form-group">
            <label className="form-label required">เลข ปชช. 13 หลัก หรือ Email</label>
            <input 
              type="text" 
              className="form-input"
              placeholder="1100500123456 หรือ email@army.mil.th"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label required">รหัสผ่านใหม่</label>
            <input 
              type="password" 
              className="form-input"
              placeholder="อย่างน้อย 6 ตัวอักษร"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label required">ยืนยันรหัสผ่านใหม่</label>
            <input 
              type="password" 
              className="form-input"
              placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%', padding: '11px', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'กำลังดำเนินการ...' : 'บันทึกรหัสผ่านใหม่'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link href="/" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
              <ArrowLeft size={14} /> กลับหน้าหลัก
            </Link>
          </div>

        </form>

      </div>

    </div>
  );
}
