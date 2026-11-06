// app/login/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, LogIn, AlertCircle, Clock, Eye, EyeOff, UserPlus, HelpCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [errorStatus, setErrorStatus] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setErrorStatus('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.status) {
          setErrorStatus(data.status);
        }
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

  return (
    <div className="container" style={{ paddingTop: '50px', maxWidth: '480px' }}>
      
      <div className="glass-panel" style={{ padding: '36px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '26px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 50%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 0 24px rgba(20, 184, 166, 0.4)'
          }}>
            <Shield size={32} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>เข้าสู่ระบบสำหรับเจ้าหน้าที่ ทบ.</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '6px' }}>
            ระบบเสนอขอรับสิทธิเงินค่าสินไหมทดแทนกำลังพล กองทัพบก
          </p>
        </div>

        {errorMsg && (
          <div style={{ 
            background: errorStatus === 'PENDING' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
            border: errorStatus === 'PENDING' ? '1px solid var(--amber-warning)' : '1px solid var(--ruby-danger)', 
            borderRadius: '8px', 
            padding: '12px 14px', 
            marginBottom: '18px', 
            color: errorStatus === 'PENDING' ? '#fcd34d' : '#fca5a5', 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '10px', 
            fontSize: '13px',
            lineHeight: 1.5
          }}>
            {errorStatus === 'PENDING' ? <Clock size={18} style={{ flexShrink: 0, marginTop: '2px' }} /> : <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />}
            <div>
              <div style={{ fontWeight: 600 }}>{errorStatus === 'PENDING' ? 'บัญชีอยู่ระหว่างรอการอนุมัติ' : 'แจ้งเตือนการเข้าสู่ระบบ'}</div>
              <div>{errorMsg}</div>
            </div>
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
              placeholder="กรอกอีเมล ทบ. หรือ เลข ปชช. 13 หลัก"
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label required">รหัสผ่าน</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรอกรหัสผ่านของท่าน"
                style={{ paddingRight: '42px' }}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
            disabled={loading}
          >
            <LogIn size={16} />
            <span>{loading ? 'กำลังตรวจสอบสิทธิ์...' : 'เข้าสู่ระบบ'}</span>
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px', fontSize: '13px' }}>
            <Link href="/register" style={{ color: 'var(--cyan-accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <UserPlus size={14} />
              <span>ลงทะเบียนขอใช้งานใหม่</span>
            </Link>
            <Link href="/reset-password" style={{ color: 'var(--text-dim)' }}>
              ลืมรหัสผ่าน?
            </Link>
          </div>

          <div style={{ marginTop: '22px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)', fontSize: '12px', color: 'var(--text-dim)', textAlign: 'center', lineHeight: 1.6 }}>
            <div>ระบบความมั่นคงปลอดภัยแบบ Role-Based Access Control (RBAC)</div>
            <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>ผู้ใช้งานใหม่ต้องได้รับการอนุมัติจากผู้ดูแลระบบก่อนจึงจะสามารถเข้าใช้งานได้</div>
          </div>

        </form>

      </div>

    </div>
  );
}
