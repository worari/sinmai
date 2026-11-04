// app/login/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, LogIn, CheckCircle2, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('unit.officer@army.mil.th');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const DEMO_ACCOUNTS = [
    { label: 'เจ้าหน้าที่หน่วย (พล.ร.9)', email: 'unit.officer@army.mil.th', pass: 'password123', role: 'UNIT_OFFICER' },
    { label: 'กพ.ทบ. (กสพ.ฯ ตรวจเอกสาร)', email: 'ksp.rta@army.mil.th', pass: 'password123', role: 'KSP_OFFICER' },
    { label: 'ผู้บังคับบัญชา (จก.กพ.ทบ.)', email: 'commander@army.mil.th', pass: 'password123', role: 'COMMANDER' },
    { label: 'บ.ประกันภัย (โอนเงิน)', email: 'insurance@insurance.co.th', pass: 'password123', role: 'INSURANCE_REP' },
    { label: 'สก.ทบ. (รับทราบยอด)', email: 'sk.rta@army.mil.th', pass: 'password123', role: 'SK_OFFICER' }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'เข้าสู่ระบบไม่สำเร็จ');
      }

      localStorage.setItem('rta_user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('rta_auth_change'));
      
      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get('redirect') || '/dashboard';
      router.push(redirectUrl);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectDemoAccount = (acc) => {
    setIdentifier(acc.email);
    setPassword(acc.pass);
  };

  return (
    <div className="container" style={{ paddingTop: '50px', maxWidth: '520px' }}>
      
      <div className="glass-panel" style={{ padding: '36px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '26px' }}>
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
            <Shield size={30} color="#070d1e" />
          </div>
          <h1 style={{ fontSize: '22px' }}>เข้าสู่ระบบสำหรับเจ้าหน้าที่ ทบ.</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '4px' }}>
            กรุณาเข้าสู่ระบบเพื่อยื่นเสนอเรื่อง ตรวจสอบเอกสาร และจัดการกระบวนการ
          </p>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--ruby-danger)', borderRadius: '8px', padding: '12px 14px', marginBottom: '18px', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          
          <div className="form-group">
            <label className="form-label required">อีเมล หรือ เลขประจำตัวประชาชน 13 หลัก</label>
            <input 
              type="text" 
              className="form-input"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="1100500123456 หรือ user@army.mil.th"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label required">รหัสผ่าน</label>
            <input 
              type="password" 
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="กรอกรหัสผ่าน"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '8px' }}
            disabled={loading}
          >
            <LogIn size={16} />
            <span>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</span>
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '13px' }}>
            <Link href="/register" style={{ color: 'var(--gold-primary)' }}>+ ลงทะเบียนขอใช้งานใหม่</Link>
            <Link href="/reset-password" style={{ color: 'var(--text-dim)' }}>ลืมรหัสผ่าน?</Link>
          </div>

          {/* Quick Demo Accounts Helper */}
          <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border-glass)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '10px' }}>
              คลิกเพื่อเลือกบัญชีทดสอบตามบทบาท (Demo Login):
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {DEMO_ACCOUNTS.map((acc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectDemoAccount(acc)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: identifier === acc.email ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    border: identifier === acc.email ? '1px solid var(--gold-primary)' : '1px solid transparent',
                    color: '#fff',
                    textAlign: 'left',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{acc.label}</span>
                  <span style={{ color: 'var(--gold-primary)' }}>{acc.email}</span>
                </button>
              ))}
            </div>
          </div>

        </form>

      </div>

    </div>
  );
}
