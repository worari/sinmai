// app/reset-password/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { KeyRound, CheckCircle2, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [citizenId, setCitizenId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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

    if (newPassword.length < 8 || !/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setErrorMsg('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร และประกอบด้วยตัวอักษรภาษาอังกฤษและตัวเลข');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ citizenId, email, phone, newPassword })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'รีเซ็ตรหัสผ่านไม่สำเร็จ');
      }

      setSuccessMsg(data.message);
      setTimeout(() => {
        router.push('/login');
      }, 1600);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '50px', maxWidth: '540px' }}>
      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
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
          <h1 style={{ fontSize: '20px' }}>รีเซ็ตรหัสผ่านผู้ใช้งาน (Multi-Factor Verification)</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            เพื่อป้องกันการสวมสิทธิ์ กรุณายืนยันข้อมูลทั้ง 3 รายการให้ตรงกับบัญชีที่ลงทะเบียนไว้
          </p>
        </div>

        <div style={{
          padding: '10px 12px',
          borderRadius: '8px',
          background: 'rgba(20, 184, 166, 0.1)',
          border: '1px solid rgba(20, 184, 166, 0.3)',
          color: 'var(--text-muted)',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          marginBottom: '18px'
        }}>
          <ShieldCheck size={16} color="var(--cyan-accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>บัญชีระดับผู้ดูแลระบบ (Admin) และผู้บังคับบัญชาไม่อนุญาตให้รีเซ็ตผ่านหน้าสาธารณะ กรุณาติดต่อผู้ดูแลระบบส่วนกลาง</span>
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
            <label className="form-label required">1. เลขประจำตัวประชาชน (13 หลัก)</label>
            <input
              type="text"
              className="form-input"
              placeholder="1100500xxxxxx"
              value={citizenId}
              onChange={(e) => setCitizenId(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label required">2. อีเมลที่ลงทะเบียนไว้</label>
            <input
              type="email"
              className="form-input"
              placeholder="officer@army.mil.th"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label required">3. เบอร์โทรศัพท์ที่ลงทะเบียนไว้</label>
            <input
              type="text"
              className="form-input"
              placeholder="08x-xxx-xxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label required">รหัสผ่านใหม่</label>
            <input
              type="password"
              className="form-input"
              placeholder="อย่างน้อย 8 ตัวอักษร (ตัวอักษรภาษาอังกฤษ + ตัวเลข)"
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
            {loading ? 'กำลังดำเนินการ...' : 'ยืนยันตัวตนและบันทึกรหัสผ่านใหม่'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link href="/login" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
              <ArrowLeft size={14} /> กลับหน้าเข้าสู่ระบบ
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
