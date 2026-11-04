// app/register/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, UserPlus, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { MILITARY_RANKS, MILITARY_UNITS, validateCitizenId } from '@/lib/thai-utils';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    citizenId: '',
    rank: 'ร.อ.',
    firstName: '',
    lastName: '',
    position: 'นายทหารฝ่ายกำลังพล',
    unitId: '9th_INF_DIV',
    unitName: 'กองพลทหารราบที่ 9 (พล.ร.9)',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleUnitChange = (e) => {
    const unitId = e.target.value;
    const unit = MILITARY_UNITS.find((u) => u.id === unitId);
    setFormData((prev) => ({
      ...prev,
      unitId,
      unitName: unit ? unit.name : unitId
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Check citizen ID
    if (!validateCitizenId(formData.citizenId)) {
      setErrorMsg('เลขประจำตัวประชาชน 13 หลักไม่ถูกต้องตามหลักตรวจสอบทางการ (Mod 11 Checksum)');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'การลงทะเบียนไม่สำเร็จ');
      }

      setSuccessMsg(data.message);
      // Auto login
      localStorage.setItem('rta_user', JSON.stringify(data.user));
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
    <div className="container" style={{ paddingTop: '40px', maxWidth: '720px' }}>
      
      <div className="glass-panel" style={{ padding: '32px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #d4af37 0%, #aa8010 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 0 20px rgba(212, 175, 55, 0.35)'
          }}>
            <Shield size={32} color="#070d1e" />
          </div>
          <h1 style={{ fontSize: '22px' }}>ลงทะเบียนขอใช้งานระบบ (เจ้าหน้าที่หน่วย ทบ.)</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '4px' }}>
            ระบบมีกลไกป้องกันการสมัครซ้ำด้วยเลขประจำตัวประชาชน 13 หลัก และกำหนดสิทธิเฉพาะหน่วย
          </p>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--ruby-danger)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--emerald-success)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister}>
          
          {/* เลขประจำตัวประชาชน 13 หลัก */}
          <div className="form-group">
            <label className="form-label required">เลขประจำตัวประชาชน (13 หลัก) - ป้องกันสมัครซ้ำ</label>
            <input 
              type="text" 
              className="form-input"
              placeholder="เลขประจำตัวประชาชน 13 หลักของผู้เสนอเรื่อง"
              maxLength={13}
              value={formData.citizenId}
              onChange={(e) => setFormData({ ...formData, citizenId: e.target.value.replace(/\D/g, '') })}
              required
            />
            {formData.citizenId && (
              <span style={{ fontSize: '12px', marginTop: '4px', display: 'block', color: validateCitizenId(formData.citizenId) ? 'var(--emerald-success)' : 'var(--ruby-danger)' }}>
                {validateCitizenId(formData.citizenId) ? '✓ เลขบัตรประจำตัวประชาชนถูกต้อง' : '✗ เลขบัตร ปชช. ไม่ถูกต้องตามเกณฑ์ Mod 11'}
              </span>
            )}
          </div>

          <div className="grid-cols-3">
            <div className="form-group">
              <label className="form-label required">ยศ</label>
              <select 
                className="form-select"
                value={formData.rank}
                onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                required
              >
                {MILITARY_RANKS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label required">ชื่อ</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="ชื่อจริง"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">นามสกุล</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="นามสกุล"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label required">ตำแหน่ง</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="เช่น นายทหารกำลังพล, หน.ฝกร."
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">หน่วยสังกัด (สิทธิจะถูกผูกกับหน่วยนี้)</label>
              <select 
                className="form-select"
                value={formData.unitId}
                onChange={handleUnitChange}
                required
              >
                {MILITARY_UNITS.map((u) => (
                  <option key={u.id} value={u.id}>[{u.level}] {u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label required">เบอร์โทรศัพท์ติดต่อ</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="08x-xxx-xxxx หรือ เบอร์ภายใน ทบ."
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Email (อีเมลใช้งาน)</label>
              <input 
                type="email" 
                className="form-input"
                placeholder="officer@army.mil.th"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label required">รหัสผ่าน</label>
              <input 
                type="password" 
                className="form-input"
                placeholder="อย่างน้อย 6 ตัวอักษร"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">ยืนยันรหัสผ่าน</label>
              <input 
                type="password" 
                className="form-input"
                placeholder="กรอกรหัสผ่านซ้ำอีกครั้ง"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
            disabled={loading}
          >
            <UserPlus size={18} />
            <span>{loading ? 'กำลังลงทะเบียน...' : 'ยืนยันการลงทะเบียนขอใช้งานระบบ'}</span>
          </button>

          <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px', color: 'var(--text-dim)' }}>
            มีบัญชีผู้ใช้งานแล้ว? <Link href="/reset-password" style={{ color: 'var(--gold-primary)' }}>รีเซ็ตรหัสผ่าน</Link> หรือเลือกสลับสิทธิ์ได้ที่เมนูด้านบน
          </div>

        </form>

      </div>

    </div>
  );
}
