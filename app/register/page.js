// app/register/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, UserPlus, CheckCircle2, AlertCircle, ArrowLeft, Clock, LogIn, UserCheck } from 'lucide-react';
import { MILITARY_RANKS, MILITARY_UNITS, validateCitizenId } from '@/lib/thai-utils';
import { USER_ROLES } from '@/lib/constants';

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
    requestedRole: 'UNIT_OFFICER',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

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

      setRegisteredUser(data.user);
      setIsSuccess(true);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="container" style={{ paddingTop: '60px', maxWidth: '640px' }}>
        <div className="glass-panel" style={{ padding: '40px 32px', textAlign: 'center' }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '20px',
            background: 'rgba(245, 158, 11, 0.18)',
            border: '2px solid var(--amber-warning)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px',
            color: 'var(--amber-warning)'
          }}>
            <Clock size={36} />
          </div>

          <span className="badge badge-amber" style={{ fontSize: '13px', padding: '6px 14px', marginBottom: '14px', display: 'inline-block' }}>
            สถานะ: รอการอนุมัติสิทธิ์ (Pending Approval)
          </span>

          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '8px 0' }}>
            ลงทะเบียนขอใช้งานระบบสำเร็จแล้ว
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', lineHeight: 1.7, margin: '14px 0 24px' }}>
            ข้อมูลคำขอลงทะเบียนของ <strong>{formData.rank} {formData.firstName} {formData.lastName}</strong> สังกัด <strong>{formData.unitName}</strong> ถูกบันทึกเข้าสู่ระบบเรียบร้อยแล้ว<br />
            ตามนโยบายความมั่นคงปลอดภัย (RBAC) บัญชีของท่านต้องได้รับการตรวจสอบและอนุมัติสิทธิ์จากผู้ดูแลระบบส่วนกลาง (Admin) ก่อนเข้าใช้งาน
          </p>

          <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '10px', padding: '16px', marginBottom: '26px', textAlign: 'left', fontSize: '13.5px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ color: 'var(--text-dim)', marginBottom: '8px', fontWeight: 600 }}>สรุปข้อมูลการลงทะเบียน:</div>
            <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>เลข ปชช.:</span>
              <span style={{ fontFamily: 'monospace', color: 'var(--gold-primary)' }}>{formData.citizenId}</span>
              <span style={{ color: 'var(--text-muted)' }}>อีเมลเข้าใช้งาน:</span>
              <span>{formData.email}</span>
              <span style={{ color: 'var(--text-muted)' }}>บทบาทที่ขอ:</span>
              <span style={{ color: 'var(--cyan-accent)' }}>{USER_ROLES[formData.requestedRole]?.label || formData.requestedRole}</span>
              <span style={{ color: 'var(--text-muted)' }}>หน่วยงาน:</span>
              <span>{formData.unitName}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/login" className="btn btn-primary" style={{ padding: '10px 24px' }}>
              <LogIn size={16} />
              <span>ไปยังหน้าเข้าสู่ระบบ (Login)</span>
            </Link>
            <Link href="/" className="btn btn-secondary" style={{ padding: '10px 20px' }}>
              <ArrowLeft size={16} />
              <span>กลับสู่หน้าหลัก</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '40px', maxWidth: '740px' }}>
      
      <div className="glass-panel" style={{ padding: '36px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 50%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 0 20px rgba(20, 184, 166, 0.35)'
          }}>
            <Shield size={32} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>ลงทะเบียนขอใช้งานระบบสินไหม ทบ.</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '4px' }}>
            ระบบมีกลไกตรวจสอบเลขประจำตัวประชาชน 13 หลัก และแอดมินเป็นผู้อนุมัติสิทธิ์ก่อนเริ่มใช้งาน
          </p>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--ruby-danger)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px' }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister}>
          
          {/* เลขประจำตัวประชาชน 13 หลัก */}
          <div className="form-group">
            <label className="form-label required">เลขประจำตัวประชาชน (13 หลัก) - ใช้เป็นกุญแจตรวจสอบสิทธิ์</label>
            <input 
              type="text" 
              className="form-input"
              placeholder="เลขประจำตัวประชาชน 13 หลักของผู้ขอใช้งาน"
              maxLength={13}
              value={formData.citizenId}
              onChange={(e) => setFormData({ ...formData, citizenId: e.target.value.replace(/\D/g, '') })}
              required
            />
            {formData.citizenId && (
              <span style={{ fontSize: '12px', marginTop: '4px', display: 'block', color: validateCitizenId(formData.citizenId) ? 'var(--emerald-success)' : 'var(--ruby-danger)' }}>
                {validateCitizenId(formData.citizenId) ? '✓ เลขบัตรประจำตัวประชาชนถูกต้องตามเกณฑ์ Mod 11' : '✗ เลขบัตร ปชช. ไม่ถูกต้องตามหลักตรวจสอบ'}
              </span>
            )}
          </div>

          <div className="grid-cols-3">
            <div className="form-group">
              <label className="form-label required">ยศ / คำนำหน้านาม</label>
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

          {/* บทบาทที่ขอใช้งาน (Role Request) */}
          <div className="form-group">
            <label className="form-label required">บทบาทหน้าที่ที่ขอใช้งานในระบบ (Role)</label>
            <select 
              className="form-select"
              value={formData.requestedRole}
              onChange={(e) => setFormData({ ...formData, requestedRole: e.target.value })}
              required
            >
              <option value="UNIT_OFFICER">1. เจ้าหน้าที่หน่วย (ผู้เสนอเรื่อง กพ.4 และเอกสาร)</option>
              <option value="KSP_OFFICER">2. กพ.ทบ. (กสพ.ฯ ตรวจเอกสาร 10 รายการ)</option>
              <option value="COMMANDER">3. ผู้บังคับบัญชา (จก.กพ.ทบ. ลงนามอนุมัติ)</option>
              <option value="INSURANCE_REP">4. บริษัทประกันภัย (โอนเงินสินไหม)</option>
              <option value="SK_OFFICER">5. สก.ทบ. (รับทราบยอดจ่าย/สวัสดิการ)</option>
            </select>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
              * ผู้ดูแลระบบ (Admin) จะพิจารณาอนุมัติและปรับบทบาทตามความเหมาะสมจริงก่อนเปิดใช้งาน
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
              <label className="form-label required">Email (ใช้อีเมลสำหรับเข้าสู่ระบบ)</label>
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
            <span>{loading ? 'กำลังส่งข้อมูลลงทะเบียน...' : 'ส่งคำขอลงทะเบียน (รอแอดมินอนุมัติ)'}</span>
          </button>

          <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px', color: 'var(--text-dim)' }}>
            มีบัญชีผู้ใช้งานที่ได้รับการอนุมัติแล้ว? <Link href="/login" style={{ color: 'var(--cyan-accent)' }}>เข้าสู่ระบบที่นี่</Link>
          </div>

        </form>

      </div>

    </div>
  );
}
