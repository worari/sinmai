// components/PdpaConsentBanner.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Cookie,
  SlidersHorizontal,
  Check,
  X,
  Lock,
  BarChart3,
  FileText,
  Palette
} from 'lucide-react';

export default function PdpaConsentBanner() {
  const pathname = usePathname();
  const [loaded, setLoaded] = useState(false);
  const [hasConsented, setHasConsented] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState('settings'); // 'settings' | 'policy'
  const [saving, setSaving] = useState(false);
  const [consent, setConsent] = useState({
    necessary: true,
    securityLog: true,
    analytics: true,
    preferences: true
  });

  const lastTrackedRef = useRef({ path: '', time: 0 });

  useEffect(() => {
    loadConsentStatus();

    const handleOpenSettings = (e) => {
      setModalTab(e?.detail?.tab === 'policy' ? 'policy' : 'settings');
      setShowModal(true);
    };

    window.addEventListener('rta_open_pdpa_settings', handleOpenSettings);
    return () => window.removeEventListener('rta_open_pdpa_settings', handleOpenSettings);
  }, []);

  // เก็บสถิติการเยี่ยมชมเว็บไซต์อัตโนมัติเฉพาะเมื่อผู้ใช้งานให้ความยินยอมหมวด Analytics แล้วเท่านั้น
  useEffect(() => {
    if (!loaded || !hasConsented || !consent.analytics || !pathname) return;
    const now = Date.now();
    if (lastTrackedRef.current.path === pathname && now - lastTrackedRef.current.time < 10000) {
      return;
    }
    lastTrackedRef.current = { path: pathname, time: now };

    fetch('/api/pdpa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'TRACK_VISIT', path: pathname })
    }).catch(() => {});
  }, [pathname, loaded, hasConsented, consent.analytics]);

  const loadConsentStatus = async () => {
    try {
      const res = await fetch('/api/pdpa', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setHasConsented(Boolean(data.hasConsented));
        if (data.consent) {
          setConsent({
            necessary: true,
            securityLog: true,
            analytics: Boolean(data.consent.analytics),
            preferences: Boolean(data.consent.preferences)
          });
        }
      }
    } catch (e) {
      // ignore
    } finally {
      setLoaded(true);
    }
  };

  const saveConsentChoices = async ({ analytics, preferences }) => {
    setSaving(true);
    try {
      const res = await fetch('/api/pdpa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SAVE_CONSENT',
          analytics: Boolean(analytics),
          preferences: Boolean(preferences)
        })
      });
      const data = await res.json();
      if (data.success) {
        setConsent({
          necessary: true,
          securityLog: true,
          analytics: Boolean(analytics),
          preferences: Boolean(preferences)
        });
        setHasConsented(true);
        setShowModal(false);
        if (analytics && pathname) {
          fetch('/api/pdpa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'TRACK_VISIT', path: pathname })
          }).catch(() => {});
        }
      }
    } catch (e) {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return null;

  return (
    <>
      {/* แถบยินยอม PDPA & Cookie ด้านล่างจอ (แสดงเมื่อยังไม่ได้กดยินยอม) */}
      {!hasConsented && !showModal && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 170,
          padding: '14px 18px',
          background: 'rgba(4, 20, 23, 0.97)',
          backdropFilter: 'blur(16px)',
          borderTop: '2px solid var(--gold-primary)',
          boxShadow: '0 -12px 32px rgba(0, 0, 0, 0.7)'
        }}>
          <div className="container" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <div style={{ flex: '1 1 480px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(212, 175, 55, 0.16)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gold-primary)',
                flexShrink: 0
              }}>
                <Cookie size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>ประกาศนโยบายความเป็นส่วนตัว (PDPA) และการใช้คุกกี้ (Cookies)</span>
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.55 }}>
                  เว็บไซต์ใช้คุกกี้ที่จำเป็นต่อความปลอดภัยของระบบ (Signed HttpOnly Session) บันทึกประวัติการใช้งานตามมาตรฐานความมั่นคงปลอดภัยไซเบอร์ (Audit Log)
                  และขอความยินยอมเก็บสถิติการเยี่ยมชมเว็บไซต์ เพื่อพัฒนาบริการให้มีประสิทธิภาพตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => { setModalTab('settings'); setShowModal(true); }}
                className="btn btn-secondary btn-sm"
                disabled={saving}
              >
                <SlidersHorizontal size={14} />
                <span>ตั้งค่าคุกกี้ / นโยบาย PDPA</span>
              </button>
              <button
                type="button"
                onClick={() => saveConsentChoices({ analytics: false, preferences: false })}
                className="btn btn-secondary btn-sm"
                disabled={saving}
              >
                <span>ยอมรับเฉพาะที่จำเป็น</span>
              </button>
              <button
                type="button"
                onClick={() => saveConsentChoices({ analytics: true, preferences: true })}
                className="btn btn-primary btn-sm"
                disabled={saving}
              >
                <Check size={14} />
                <span>{saving ? 'กำลังบันทึก...' : 'ยอมรับทั้งหมด'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Modal ตั้งค่าคุกกี้ & อ่านนโยบาย PDPA */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 220,
          background: 'rgba(2, 8, 14, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '680px',
            maxHeight: '88vh',
            overflowY: 'auto',
            padding: '26px',
            background: 'rgba(4, 20, 23, 0.99)',
            border: '1px solid var(--gold-primary)',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="ปิดหน้าต่าง"
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <ShieldCheck size={24} color="var(--gold-primary)" />
              <div>
                <h2 style={{ fontSize: '18px', color: '#fff', margin: 0 }}>
                  ศูนย์จัดการความยินยอม PDPA &amp; คุกกี้ความปลอดภัยไซเบอร์
                </h2>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                  ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 และมาตรฐานความมั่นคงปลอดภัยไซเบอร์ (เวอร์ชัน 1.0)
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
              <button
                type="button"
                onClick={() => setModalTab('settings')}
                className={`btn btn-sm ${modalTab === 'settings' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <SlidersHorizontal size={14} />
                <span>ตั้งค่าคุกกี้ &amp; การเก็บประวัติ</span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab('policy')}
                className={`btn btn-sm ${modalTab === 'policy' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <FileText size={14} />
                <span>นโยบายคุ้มครองข้อมูล (PDPA Notice)</span>
              </button>
            </div>

            {modalTab === 'settings' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* หมวด 1 */}
                <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Lock size={15} color="var(--emerald-success)" />
                      <span>1. คุกกี้ที่จำเป็นต่อความปลอดภัยของระบบ (Strictly Necessary)</span>
                    </div>
                    <span className="badge badge-emerald">เปิดใช้งานตลอดเวลา</span>
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '5px', lineHeight: 1.5 }}>
                    ใช้จัดการ Signed HttpOnly Session Cookie (HMAC-SHA256) การป้องกันการโจมตี Brute-Force และตรวจสอบสิทธิ์การเข้าถึงข้อมูล (RBAC) ไม่สามารถปิดได้
                  </p>
                </div>

                {/* หมวด 2 */}
                <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(20, 184, 166, 0.08)', border: '1px solid rgba(20, 184, 166, 0.3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={15} color="var(--cyan-accent)" />
                      <span>2. การเก็บประวัติการใช้งานเพื่อความปลอดภัย (Cybersecurity Audit Logs)</span>
                    </div>
                    <span className="badge badge-cyan">ตามกฎหมาย/ภารกิจ</span>
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '5px', lineHeight: 1.5 }}>
                    บันทึกประวัติการเข้าสู่ระบบ, การอนุมัติคำร้อง, เวลาที่ทำรายการ และอุปกรณ์ที่ใช้งาน ตาม พ.ร.บ. ว่าด้วยการกระทำความผิดเกี่ยวกับคอมพิวเตอร์ เพื่อป้องกันการเข้าถึงโดยมิชอบ
                  </p>
                </div>

                {/* หมวด 3 */}
                <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-subtle)' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <BarChart3 size={15} color="var(--gold-primary)" />
                        <span>3. คุกกี้สถิติการเยี่ยมชมเว็บไซต์ (Visit Analytics)</span>
                      </div>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '5px', lineHeight: 1.5 }}>
                        เก็บรวบรวมข้อมูลหน้าที่เข้าชมและสถิติผู้เยี่ยมชมแบบปกปิดตัวตน (Masked IP) เพื่อปรับปรุงประสิทธิภาพระบบ หากปิดส่วนนี้จะไม่บันทึกประวัติการเข้าชมหน้าเว็บ
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={consent.analytics}
                      onChange={(e) => setConsent((prev) => ({ ...prev, analytics: e.target.checked }))}
                      style={{ width: '20px', height: '20px', accentColor: 'var(--cyan-accent)', flexShrink: 0 }}
                    />
                  </label>
                </div>

                {/* หมวด 4 */}
                <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-subtle)' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Palette size={15} color="var(--cyan-accent)" />
                        <span>4. คุกกี้จดจำการตั้งค่าผู้ใช้ (Preferences)</span>
                      </div>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '5px', lineHeight: 1.5 }}>
                        จดจำธีมสีการแสดงผลและสถานะเปิด/ปิดเสียงการแจ้งเตือนแบบ Real-time ตามความสะดวกของผู้ใช้งาน
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={consent.preferences}
                      onChange={(e) => setConsent((prev) => ({ ...prev, preferences: e.target.checked }))}
                      style={{ width: '20px', height: '20px', accentColor: 'var(--cyan-accent)', flexShrink: 0 }}
                    />
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => saveConsentChoices({ analytics: false, preferences: false })}
                    className="btn btn-secondary"
                    disabled={saving}
                  >
                    เฉพาะคุกกี้ที่จำเป็น
                  </button>
                  <button
                    type="button"
                    onClick={() => saveConsentChoices({ analytics: consent.analytics, preferences: consent.preferences })}
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    บันทึกการตั้งค่าที่เลือก
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <strong style={{ color: '#fff' }}>1. ผู้ควบคุมข้อมูลส่วนบุคคล:</strong> กองสิทธิกำลังพล กรมกำลังพลทหารบก (กสพ.กพ.ทบ.)
                </div>
                <div>
                  <strong style={{ color: '#fff' }}>2. ข้อมูลที่เก็บรวบรวม:</strong> ข้อมูลประจำตัวผู้ใช้งาน/กำลังพล, เอกสารหลักฐานประกอบคำร้อง, ข้อมูลจราจรทางคอมพิวเตอร์ (Audit Log) และสถิติการเยี่ยมชมเว็บไซต์ (เฉพาะเมื่อให้ความยินยอม)
                </div>
                <div>
                  <strong style={{ color: '#fff' }}>3. มาตรฐานความมั่นคงปลอดภัยไซเบอร์:</strong> รหัสผ่านถูกเข้ารหัสแบบ Salted Scrypt Hash, การพิสูจน์ตัวตนใช้ Signed HttpOnly Cookie ป้องกัน XSS/CSRF, จำกัดสิทธิ์เข้าถึงข้อมูลตามสายการบังคับบัญชา (RBAC + Unit Hierarchy), ตรวจสอบนามสกุลไฟล์แนบ และป้องกัน Brute-Force ด้วย Rate Limiting
                </div>
                <div>
                  <strong style={{ color: '#fff' }}>4. สิทธิของเจ้าของข้อมูลส่วนบุคคล:</strong> ท่านสามารถแก้ไขหรือถอนความยินยอมคุกกี้สถิติและการตั้งค่าได้ตลอดเวลาผ่านปุ่ม &quot;ตั้งค่าคุกกี้ &amp; นโยบาย PDPA&quot; ที่ส่วนท้ายของเว็บไซต์
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button type="button" onClick={() => setModalTab('settings')} className="btn btn-primary btn-sm">
                    กลับไปตั้งค่าความยินยอม
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

