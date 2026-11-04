// app/settings/page.js
'use client';

import { useState, useEffect } from 'react';
import { 
  Send, 
  Settings, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Bell, 
  Shield, 
  RefreshCw,
  Terminal,
  Building2,
  GitFork,
  ExternalLink,
  Palette,
  Check
} from 'lucide-react';

export default function SettingsPage() {
  const [config, setConfig] = useState({ botToken: '', chatId: '', enabled: true });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // SLA Policy settings
  const [slaDays, setSlaDays] = useState(30);
  const [warningDays, setWarningDays] = useState(7);
  const [currentTheme, setCurrentTheme] = useState('teal');

  useEffect(() => {
    loadSettings();
    const savedTheme = localStorage.getItem('rta_theme') || 'teal';
    setCurrentTheme(savedTheme);
  }, []);

  const changeTheme = (newTheme) => {
    setCurrentTheme(newTheme);
    localStorage.setItem('rta_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    window.dispatchEvent(new CustomEvent('rta_theme_change', { detail: newTheme }));
    setMessage(`เปลี่ยนธีมสีการแสดงผลเป็น: ${newTheme === 'teal' ? 'เขียวคราม (Emerald & Deep Teal)' : newTheme === 'navy-gold' ? 'กรมท่า-ทอง (ทบ.)' : 'สว่าง สะอาดตา'} เรียบร้อยแล้ว`);
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/telegram');
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        setHistory(data.history || []);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_CONFIG',
          botToken: config.botToken,
          chatId: config.chatId,
          enabled: config.enabled
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'บันทึกไม่สำเร็จ');

      setMessage('บันทึกการตั้งค่า Telegram Bot สำเร็จเรียบร้อย');
      loadSettings();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    setTesting(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SEND_TEST',
          testMessage: 'ทดสอบส่งข้อความแจ้งเตือนจากระบบเสนอขอรับสิทธิเงินค่าสินไหมทดแทน กองทัพบก (Real-time Integration)'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'ส่งทดสอบไม่สำเร็จ');

      setMessage('ส่งข้อความทดสอบสำเร็จ! บันทึกลง Notification History แล้ว');
      loadSettings();
    } catch (err) {
      setError(err.message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '28px' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings size={24} color="var(--gold-primary)" />
          <span>การตั้งค่าระบบแจ้งเตือน Telegram & กรอบเวลา SLA</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
          กำหนดค่าการเชื่อมต่อ Telegram Bot API เพื่อแจ้งเตือนอัตโนมัติเมื่อมีการเสนอเรื่อง, ตีกลับเอกสาร, อนุมัติ และเตือนล่าช้า
        </p>
      </div>

      {message && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--emerald-success)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--ruby-danger)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Military Unit Hierarchy Banner */}
      <div className="glass-panel" style={{
        padding: '20px 24px',
        marginBottom: '28px',
        borderLeft: '4px solid var(--gold-primary)',
        background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(9, 17, 38, 0.6) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: 'rgba(212, 175, 55, 0.15)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--gold-primary)'
          }}>
            <GitFork size={24} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>
              ระบบจัดการโครงสร้างหน่วย กองทัพบก (RTA Unit Organization Hierarchy)
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
              จัดการสายการบังคับบัญชา 3 ระดับ: 1. ระดับ ทบ. (ทภ.1-4, นสศ., นปอ., ยศ.ทบ.) ➔ 2. ระดับ กองพล/มทบ. ➔ 3. ระดับ กรม หรือ กองพัน
            </div>
          </div>
        </div>

        <a 
          href="/units" 
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
        >
          <span>เข้าสู่ระบบจัดการโครงสร้างหน่วย</span>
          <ExternalLink size={14} />
        </a>
      </div>

      {/* Theme Settings Card: ธีม แนวสี เขียวคราม ไล่เฉด สะอาดตาอ่านง่าย */}
      <div className="glass-panel" style={{
        padding: '24px',
        marginBottom: '28px',
        borderTop: '4px solid var(--cyan-accent)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
              <Palette size={20} color="var(--cyan-accent)" />
              <span>ปรับแต่งรูปแบบธีมสีการแสดงผล (Visual Theme Settings)</span>
            </h2>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              เลือกลักษณะสีพื้นหลังและคอนทราสต์ที่เหมาะกับการทำงาน โดยเฉพาะแนวสีเขียวครามไล่เฉด สบายตา อ่านง่าย
            </div>
          </div>
          <span className="badge badge-emerald">Real-time Apply</span>
        </div>

        <div className="grid-cols-3" style={{ gap: '16px' }}>
          
          {/* Theme 1: เขียวคราม */}
          <div 
            onClick={() => changeTheme('teal')}
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: currentTheme === 'teal' ? '2px solid var(--cyan-accent)' : '1px solid var(--border-subtle)',
              background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.15) 0%, rgba(4, 20, 23, 0.8) 100%)',
              cursor: 'pointer',
              position: 'relative',
              boxShadow: currentTheme === 'teal' ? '0 0 16px rgba(20, 184, 166, 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px'
              }}>
                🌿
              </div>
              {currentTheme === 'teal' && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--cyan-accent)', color: '#041417', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                  <Check size={12} /> ใช้งานอยู่
                </span>
              )}
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
              1. ธีมเขียวคราม (ค่าเริ่มต้น)
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              เฉดมรกต-ครามเข้ม ไล่เฉดนุ่มนวล สะอาดตา อ่านตัวหนังสือภาษาไทยได้ง่าย ลดความเมื่อยล้าสายตา
            </div>
          </div>

          {/* Theme 2: กรมท่า-ทอง ทบ. */}
          <div 
            onClick={() => changeTheme('navy-gold')}
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: currentTheme === 'navy-gold' ? '2px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
              background: 'linear-gradient(135deg, rgba(7, 13, 30, 0.85) 0%, rgba(30, 58, 138, 0.15) 100%)',
              cursor: 'pointer',
              position: 'relative',
              boxShadow: currentTheme === 'navy-gold' ? '0 0 16px rgba(212, 175, 55, 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #070d1e 0%, #1e3a8a 50%, #d4af37 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px'
              }}>
                ⚜️
              </div>
              {currentTheme === 'navy-gold' && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--gold-primary)', color: '#070d1e', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                  <Check size={12} /> ใช้งานอยู่
                </span>
              )}
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
              2. ธีมกรมท่า-ทอง (ทบ.)
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              สีกรมท่าลึกตัดขอบทองหรูหรา สง่างาม สมเกียรติยศกองทัพบก เหมาะกับงานราชการเป็นทางการ
            </div>
          </div>

          {/* Theme 3: สว่าง สะอาดตา */}
          <div 
            onClick={() => changeTheme('light-teal')}
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: currentTheme === 'light-teal' ? '2px solid var(--cyan-accent)' : '1px solid var(--border-subtle)',
              background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.1) 0%, rgba(224, 242, 254, 0.15) 100%)',
              cursor: 'pointer',
              position: 'relative',
              boxShadow: currentTheme === 'light-teal' ? '0 0 16px rgba(20, 184, 166, 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #0d9488 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px'
              }}>
                ☀️
              </div>
              {currentTheme === 'light-teal' && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--cyan-accent)', color: '#041417', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                  <Check size={12} /> ใช้งานอยู่
                </span>
              )}
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
              3. ธีมสว่าง สะอาดตา
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              พื้นหลังโทนสว่าง คอนทราสต์ตัวอักษรสูงเป็นพิเศษ เหมาะกับสภาพแวดล้อมห้องที่มีแสงสว่างมาก
            </div>
          </div>

        </div>
      </div>

      <div className="grid-cols-2" style={{ marginBottom: '28px' }}>
        
        {/* Telegram Configuration Form */}
        <div className="glass-panel" style={{ padding: '24px', borderTop: '3px solid var(--gold-primary)' }}>
          <h2 style={{ fontSize: '17px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={18} color="var(--cyan-accent)" />
            <span>ตั้งค่า Telegram Bot API</span>
          </h2>

          <form onSubmit={handleSaveConfig}>
            
            <div className="form-group">
              <label className="form-label">Telegram Bot Token</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="เช่น 7123456789:AAFxAbcDeFg..."
                value={config.botToken}
                onChange={(e) => setConfig({ ...config, botToken: e.target.value })}
              />
              <span style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                สร้าง Bot ได้จาก @BotFather บน Telegram
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Telegram Chat ID / Group ID</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="เช่น -100123456789 หรือ ID ผู้รับ"
                value={config.chatId}
                onChange={(e) => setConfig({ ...config, chatId: e.target.value })}
              />
              <span style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                ระบุ Chat ID บุคคล หรือ Channel ID กลุ่มที่ต้องการให้ข้อความแจ้งเตือนไปถึง
              </span>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={config.enabled}
                  onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                />
                <span style={{ fontSize: '14px', color: '#fff' }}>เปิดใช้งานระบบส่งข้อความแจ้งเตือนอัตโนมัติ</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า Telegram'}
              </button>

              <button 
                type="button" 
                onClick={handleSendTest} 
                className="btn btn-secondary"
                disabled={testing}
              >
                <Terminal size={14} />
                <span>{testing ? 'กำลังส่ง...' : 'ทดสอบยิง Alert'}</span>
              </button>
            </div>

          </form>
        </div>

        {/* SLA Timeline Rules */}
        <div className="glass-panel" style={{ padding: '24px', borderTop: '3px solid var(--emerald-success)' }}>
          <h2 style={{ fontSize: '17px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="var(--emerald-success)" />
            <span>กรอบเวลาการดำเนินเรื่อง (SLA Standard Policy)</span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '8px', borderLeft: '3px solid var(--emerald-success)' }}>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '14px' }}>1. กรอบเวลามาตรฐาน (Total SLA)</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                กำหนดระยะเวลาดำเนินเรื่องทั้งหมดให้แล้วเสร็จภายใน <strong>30 วัน</strong> นับจากวันที่เจ้าหน้าที่หน่วยเสนอเรื่อง
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '8px', borderLeft: '3px solid var(--amber-warning)' }}>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '14px' }}>2. การแจ้งเตือนล่วงหน้า (Warning Period)</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                เมื่อเรื่องดำเนินมาถึง <strong>วันที่ 23 ขึ้นไป (เหลือก่อนถึง 7 วัน)</strong> ระบบจะแสดงแถบเตือนสีส้ม และส่งการแจ้งเตือนเร่งรัดไปยังหน่วยและ กสพ.
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '8px', borderLeft: '3px solid var(--ruby-danger)' }}>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '14px' }}>3. เกินกำหนดเวลา (&gt; 30 วัน) บังคับชี้แจงเหตุผล</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                หากเกิน 30 วัน ระบบจะล็อคเตือนสีแดง และเปิดฟังก์ชัน <strong>&quot;รายงานผลการล่าช้า&quot;</strong> เพื่อให้หน่วยแนบหนังสือเหตุผลความล่าช้า/เอกสารไม่ครบถ้วน
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Notification Logs Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} color="var(--gold-primary)" />
            <span>ประวัติการส่งการแจ้งเตือน (Real-time & Bot Logs)</span>
          </h2>
          <button onClick={loadSettings} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} /> รีเฟรช
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 12px' }}>เวลาส่ง</th>
                <th style={{ padding: '10px 12px' }}>หัวข้อ</th>
                <th style={{ padding: '10px 12px' }}>รายละเอียดข้อความ</th>
                <th style={{ padding: '10px 12px' }}>เลขที่คำร้อง</th>
                <th style={{ padding: '10px 12px' }}>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)' }}>
                    ยังไม่มีประวัติการส่งการแจ้งเตือน
                  </td>
                </tr>
              ) : (
                history.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleString('th-TH')}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#fff' }}>
                      {log.title}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                      {log.message}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--gold-primary)', fontWeight: 500 }}>
                      {log.trackingCode || '-'}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className={`badge ${log.status === 'SENT' ? 'badge-emerald' : 'badge-amber'}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
