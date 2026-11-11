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
  Check,
  Wifi,
  Bot,
  MessageSquare,
  Trash2,
  ShieldAlert,
  Database
} from 'lucide-react';
import { getSocketClient } from '@/lib/socket-client';

export default function SettingsPage() {
  const [config, setConfig] = useState({ botToken: '', chatId: '', enabled: true, hasBotToken: false });
  const [history, setHistory] = useState([]);
  const [botInfo, setBotInfo] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [socketClients, setSocketClients] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [checkingBot, setCheckingBot] = useState(false);
  const [sendingCustom, setSendingCustom] = useState(false);
  const [scanningSla, setScanningSla] = useState(false);
  const [runningBotCmd, setRunningBotCmd] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Custom Broadcast Alert & Bot Command states
  const [customTitle, setCustomTitle] = useState('ประกาศแจ้งเตือนจาก กพ.ทบ.');
  const [customMessage, setCustomMessage] = useState('');
  const [slaScanResult, setSlaScanResult] = useState(null);
  const [botCommandInput, setBotCommandInput] = useState('/stats');
  const [botCommandReply, setBotCommandReply] = useState('');
  const [pdpaSummary, setPdpaSummary] = useState(null);
  const [storageInfo, setStorageInfo] = useState(null);

  // SLA Policy settings
  const [slaDays, setSlaDays] = useState(30);
  const [warningDays, setWarningDays] = useState(7);
  const [currentTheme, setCurrentTheme] = useState('teal');

  const getCurrentUserId = () => {
    try {
      const saved = localStorage.getItem('rta_user');
      return saved ? JSON.parse(saved)?.id : null;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    loadSettings(true);
    runSlaScan(true);
    const savedTheme = localStorage.getItem('rta_theme') || 'teal';
    setCurrentTheme(savedTheme);

    const socket = getSocketClient();
    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);
    const onSocketReady = (info) => {
      setSocketConnected(true);
      if (typeof info?.onlineClients === 'number') setSocketClients(info.onlineClients);
    };
    const onNewNotif = (notif) => {
      setHistory((prev) => [notif, ...prev.filter((item) => item.id !== notif.id)].slice(0, 200));
    };
    const onUpdatedNotif = (notif) => {
      setHistory((prev) => prev.map((item) => (item.id === notif.id ? notif : item)));
    };
    const onCleared = () => setHistory([]);

    if (socket) {
      setSocketConnected(Boolean(socket.connected));
      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      socket.on('socket_ready', onSocketReady);
      socket.on('new_notification', onNewNotif);
      socket.on('notification_updated', onUpdatedNotif);
      socket.on('notifications_cleared', onCleared);
    }

    return () => {
      if (socket) {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
        socket.off('socket_ready', onSocketReady);
        socket.off('new_notification', onNewNotif);
        socket.off('notification_updated', onUpdatedNotif);
        socket.off('notifications_cleared', onCleared);
      }
    };
  }, []);

  const changeTheme = (newTheme) => {
    setCurrentTheme(newTheme);
    localStorage.setItem('rta_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    window.dispatchEvent(new CustomEvent('rta_theme_change', { detail: newTheme }));
    setMessage(`เปลี่ยนธีมสีการแสดงผลเป็น: ${newTheme === 'teal' ? 'เขียวคราม (Emerald & Deep Teal)' : newTheme === 'navy-gold' ? 'กรมท่า-ทอง (ทบ.)' : 'สว่าง สะอาดตา'} เรียบร้อยแล้ว`);
  };

  const loadSettings = async (withBotCheck = false) => {
    setLoading(true);
    try {
      const uid = getCurrentUserId();
      const params = new URLSearchParams();
      if (uid) params.set('userId', uid);
      if (withBotCheck) params.set('checkBot', 'true');

      const [res, pdpaRes] = await Promise.all([
        fetch(`/api/telegram?${params.toString()}`, { cache: 'no-store' }),
        fetch('/api/pdpa?admin=true', { cache: 'no-store' }).catch(() => null)
      ]);
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        setHistory(data.history || []);
        if (typeof data.socketClients === 'number') setSocketClients(data.socketClients);
        if (data.botInfo) setBotInfo(data.botInfo);
      }
      if (pdpaRes && pdpaRes.ok) {
        const pdpaData = await pdpaRes.json();
        if (pdpaData.success) {
          setPdpaSummary(pdpaData.summary);
          if (pdpaData.storage) setStorageInfo(pdpaData.storage);
        }
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckBot = async () => {
    setCheckingBot(true);
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CHECK_BOT' })
      });
      const data = await res.json();
      if (data.botInfo) setBotInfo(data.botInfo);
      if (!data.success) throw new Error(data.message || 'ตรวจสอบการเชื่อมต่อ Bot ไม่สำเร็จ');
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setCheckingBot(false);
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
          userId: getCurrentUserId(),
          botToken: config.botToken,
          chatId: config.chatId,
          enabled: config.enabled
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'บันทึกไม่สำเร็จ');

      setMessage(data.message || 'บันทึกการตั้งค่า Telegram Bot สำเร็จเรียบร้อย');
      loadSettings(true);
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
          userId: getCurrentUserId(),
          testMessage: 'ทดสอบส่งข้อความแจ้งเตือนจากระบบเสนอขอรับสิทธิเงินค่าสินไหมทดแทน กองทัพบก (Socket.IO & Telegram Bot)'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'ส่งทดสอบไม่สำเร็จ');

      if (data.telegramSent) {
        setMessage(data.message);
      } else {
        setError(data.message);
      }
      loadSettings();
    } catch (err) {
      setError(err.message);
    } finally {
      setTesting(false);
    }
  };

  const handleSendCustomBroadcast = async (e) => {
    e.preventDefault();
    if (!customMessage.trim()) {
      setError('กรุณากรอกข้อความที่ต้องการส่งแจ้งเตือน');
      return;
    }
    setSendingCustom(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SEND_TO_TELEGRAM',
          userId: getCurrentUserId(),
          title: customTitle.trim() || 'ประกาศแจ้งเตือนจากส่วนกลาง กพ.ทบ.',
          message: customMessage.trim()
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'ส่งข้อความไม่สำเร็จ');
      setCustomMessage('');
      if (data.telegramSent) {
        setMessage(data.message);
      } else {
        setError(data.message);
      }
      loadSettings();
    } catch (err) {
      setError(err.message);
    } finally {
      setSendingCustom(false);
    }
  };

  const runSlaScan = async (dryRun = false) => {
    setScanningSla(true);
    if (!dryRun) {
      setMessage('');
      setError('');
    }
    try {
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SCAN_SLA',
          dryRun,
          userId: getCurrentUserId()
        })
      });
      const data = await res.json();
      if (data.success) {
        setSlaScanResult(data);
        if (!dryRun) {
          setMessage(data.message);
          loadSettings();
        }
      }
    } catch (err) {
      if (!dryRun) setError(err.message);
    } finally {
      setScanningSla(false);
    }
  };

  const handleRunBotCommand = async (sendToTelegram = false) => {
    setRunningBotCmd(true);
    setError('');
    try {
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'BOT_COMMAND',
          command: botCommandInput,
          sendToTelegram,
          userId: getCurrentUserId()
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'คำสั่งไม่ถูกต้อง');
      setBotCommandReply(data.reply || '');
      if (sendToTelegram) {
        if (data.sent?.ok) {
          setMessage(`ส่งผลลัพธ์คำสั่ง ${botCommandInput} เข้า Telegram Bot สำเร็จแล้ว`);
        } else {
          setError(data.sent?.description || 'ไม่สามารถส่งผลคำสั่งเข้า Telegram ได้');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setRunningBotCmd(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CLEAR_HISTORY', userId: getCurrentUserId() })
      });
      const data = await res.json();
      if (data.success) {
        setHistory([]);
        setMessage(data.message);
      }
    } catch (err) {
      setError(err.message);
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <h2 style={{ fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send size={18} color="var(--cyan-accent)" />
              <span>ตั้งค่า Telegram Bot API &amp; Socket.IO</span>
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span className={`badge ${socketConnected ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Wifi size={11} />
                {socketConnected ? `Socket.IO Live (${socketClients} เครื่อง)` : 'Socket กำลังเชื่อมต่อ'}
              </span>
              <span className={`badge ${botInfo?.ok ? 'badge-emerald' : botInfo ? 'badge-red' : 'badge-slate'}`} style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Bot size={11} />
                {botInfo?.ok ? `@${botInfo.bot?.username || 'Bot'}` : botInfo ? 'Bot ขัดข้อง' : 'ยังไม่ตรวจ Bot'}
              </span>
            </div>
          </div>

          {botInfo && (
            <div style={{
              marginBottom: '14px',
              padding: '10px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              background: botInfo.ok ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
              border: `1px solid ${botInfo.ok ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              color: botInfo.ok ? '#a7f3d0' : '#fca5a5'
            }}>
              {botInfo.ok ? (
                <div>
                  <div><strong>✓ Bot พร้อมใช้งาน:</strong> {botInfo.bot?.firstName} (@{botInfo.bot?.username})</div>
                  <div style={{ marginTop: '2px', color: 'var(--text-muted)' }}>
                    กลุ่ม/ช่องทางเป้าหมาย: <strong>{botInfo.chat?.title || config.chatId || '-'}</strong>
                    {botInfo.chatError && <span style={{ color: '#fca5a5' }}> ({botInfo.chatError})</span>}
                  </div>
                </div>
              ) : (
                <div>⚠ {botInfo.description || 'ไม่สามารถเชื่อมต่อ Telegram API'}</div>
              )}
            </div>
          )}

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
                สร้าง Bot ได้จาก @BotFather (หากแสดง ... คือค่าที่บันทึกไว้ในระบบแล้ว เว้นไว้ได้หากไม่ต้องการเปลี่ยน)
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Telegram Chat ID / Group ID</label>
              <input
                type="text"
                className="form-input"
                placeholder="เช่น -100xxxxxxxxxx หรือ ID ผู้รับ"
                value={config.chatId}
                onChange={(e) => setConfig({ ...config, chatId: e.target.value })}
              />
              <span style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                ระบุ Chat ID บุคคล หรือ Group/Channel ID ที่ต้องการให้ข้อความแจ้งเตือนไปถึง
              </span>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                />
                <span style={{ fontSize: '14px', color: '#fff' }}>เปิดใช้งานระบบส่งข้อความแจ้งเตือนอัตโนมัติ (Telegram Bot)</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap' }}>
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

              <button
                type="button"
                onClick={handleCheckBot}
                className="btn btn-secondary"
                disabled={checkingBot}
              >
                <Bot size={14} />
                <span>{checkingBot ? 'กำลังตรวจ...' : 'ตรวจสถานะ Bot'}</span>
              </button>
            </div>

          </form>
        </div>

        {/* SLA Timeline Rules & SLA Bot Scanner */}
        <div className="glass-panel" style={{ padding: '24px', borderTop: '3px solid var(--emerald-success)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '17px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="var(--emerald-success)" />
              <span>กรอบเวลาการดำเนินเรื่อง (SLA Standard Policy)</span>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 14px', borderRadius: '8px', borderLeft: '3px solid var(--emerald-success)' }}>
                <div style={{ fontWeight: 600, color: '#fff', fontSize: '14px' }}>1. กรอบเวลามาตรฐาน (Total SLA)</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '3px' }}>
                  กำหนดระยะเวลาดำเนินเรื่องทั้งหมดให้แล้วเสร็จภายใน <strong>30 วัน</strong> นับจากวันที่เจ้าหน้าที่หน่วยเสนอเรื่อง
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 14px', borderRadius: '8px', borderLeft: '3px solid var(--amber-warning)' }}>
                <div style={{ fontWeight: 600, color: '#fff', fontSize: '14px' }}>2. การแจ้งเตือนล่วงหน้า (Warning Period)</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '3px' }}>
                  เมื่อเรื่องดำเนินมาถึง <strong>วันที่ 23 ขึ้นไป (เหลือก่อนถึง 7 วัน)</strong> ระบบจะแสดงแถบเตือนสีส้ม และแจ้งเตือนเร่งรัดไปยังหน่วยและ กสพ.
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 14px', borderRadius: '8px', borderLeft: '3px solid var(--ruby-danger)' }}>
                <div style={{ fontWeight: 600, color: '#fff', fontSize: '14px' }}>3. เกินกำหนดเวลา (&gt; 30 วัน) บังคับชี้แจงเหตุผล</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '3px' }}>
                  หากเกิน 30 วัน ระบบจะล็อคเตือนสีแดง และเปิดฟังก์ชัน <strong>&quot;รายงานผลการล่าช้า&quot;</strong> เพื่อชี้แจงเหตุผลและส่งแจ้งเตือนเข้า Bot ทันที
                </div>
              </div>

            </div>
          </div>

          {/* SLA Scanner Box */}
          <div style={{
            marginTop: '16px',
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gold-light)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldAlert size={15} color="var(--amber-warning)" />
                <span>ตรวจสอบและแจ้งเตือน SLA อัตโนมัติ (Bot Digest)</span>
              </div>
              {slaScanResult && (
                <div style={{ fontSize: '11.5px', display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#fca5a5' }}>เกินกำหนด: <strong>{slaScanResult.overdueCount}</strong></span>
                  <span style={{ color: '#fcd34d' }}>เฝ้าระวัง: <strong>{slaScanResult.warningCount}</strong></span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => runSlaScan(true)}
                className="btn btn-secondary btn-sm"
                disabled={scanningSla}
              >
                <RefreshCw size={13} />
                <span>สแกนตรวจ SLA ปัจจุบัน</span>
              </button>
              <button
                type="button"
                onClick={() => runSlaScan(false)}
                className="btn btn-primary btn-sm"
                disabled={scanningSla}
              >
                <Send size={13} />
                <span>{scanningSla ? 'กำลังส่ง...' : 'ส่งสรุป SLA เข้า Socket & Telegram'}</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Direct SendToTelegram & Interactive Bot Commands */}
      <div className="grid-cols-2" style={{ marginBottom: '28px' }}>
        <div className="glass-panel" style={{ padding: '24px', borderTop: '3px solid var(--cyan-accent)' }}>
          <h2 style={{ fontSize: '16.5px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={18} color="var(--cyan-accent)" />
            <span>ส่งข้อความประกาศแจ้งเตือนด่วน (Socket.IO &amp; SendToTelegram)</span>
          </h2>
          <form onSubmit={handleSendCustomBroadcast}>
            <div className="form-group">
              <label className="form-label">หัวข้อการแจ้งเตือน</label>
              <input
                type="text"
                className="form-input"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="เช่น ประกาศแจ้งเตือนจาก กพ.ทบ."
              />
            </div>
            <div className="form-group">
              <label className="form-label">ข้อความแจ้งเตือน (ส่งถึงทั้งผู้ใช้งานในระบบและ Telegram Bot)</label>
              <textarea
                className="form-input"
                rows={3}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="พิมพ์ข้อความแจ้งเตือน เช่น ขอให้หน่วยตรวจสอบเอกสารคำร้องประจำสัปดาห์ภายในวันศุกร์..."
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={sendingCustom}>
              <Send size={14} />
              <span>{sendingCustom ? 'กำลังส่งข้อความ...' : 'ส่งประกาศแจ้งเตือนทันที'}</span>
            </button>
          </form>
        </div>

        <div className="glass-panel" style={{ padding: '24px', borderTop: '3px solid var(--gold-primary)' }}>
          <h2 style={{ fontSize: '16.5px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bot size={18} color="var(--gold-primary)" />
            <span>ทดสอบคำสั่ง Telegram Bot (/stats, /sla, /pending, /track)</span>
          </h2>
          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            รองรับ Telegram Webhook ที่ <code>/api/telegram/webhook</code> และทดสอบคำสั่ง Bot ได้ทันทีจากที่นี่
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
            {['/stats', '/sla', '/pending', '/help'].map((cmd) => (
              <button
                key={cmd}
                type="button"
                onClick={() => setBotCommandInput(cmd)}
                className={`btn btn-sm ${botCommandInput === cmd ? 'btn-primary' : 'btn-secondary'}`}
              >
                {cmd}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <input
              type="text"
              className="form-input"
              value={botCommandInput}
              onChange={(e) => setBotCommandInput(e.target.value)}
              placeholder="พิมพ์คำสั่ง เช่น /track ทบ-กพ-69/001"
            />
            <button
              type="button"
              onClick={() => handleRunBotCommand(false)}
              className="btn btn-secondary"
              disabled={runningBotCmd}
              style={{ whiteSpace: 'nowrap' }}
            >
              ดูตัวอย่างผลลัพธ์
            </button>
            <button
              type="button"
              onClick={() => handleRunBotCommand(true)}
              className="btn btn-primary"
              disabled={runningBotCmd}
              style={{ whiteSpace: 'nowrap' }}
            >
              ยิงเข้า Telegram
            </button>
          </div>
          {botCommandReply && (
            <pre style={{
              margin: 0,
              padding: '10px 12px',
              borderRadius: '8px',
              background: 'rgba(0,0,0,0.35)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-main)',
              fontSize: '12px',
              whiteSpace: 'pre-wrap',
              maxHeight: '140px',
              overflowY: 'auto'
            }}>
              {botCommandReply.replace(/<[^>]+>/g, '')}
            </pre>
          )}
        </div>
      </div>

      {/* Notification Logs Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} color="var(--gold-primary)" />
            <span>ประวัติการส่งการแจ้งเตือน (Real-time Socket.IO &amp; Bot Logs)</span>
            <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 400 }}>({history.length} รายการ)</span>
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => loadSettings(false)} className="btn btn-secondary btn-sm">
              <RefreshCw size={14} /> รีเฟรช
            </button>
            {history.length > 0 && (
              <button onClick={handleClearHistory} className="btn btn-secondary btn-sm" style={{ color: '#fca5a5' }}>
                <Trash2 size={14} /> ล้าง Log
              </button>
            )}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 12px' }}>เวลาส่ง</th>
                <th style={{ padding: '10px 12px' }}>หัวข้อ / ประเภท</th>
                <th style={{ padding: '10px 12px' }}>รายละเอียดข้อความ</th>
                <th style={{ padding: '10px 12px' }}>เลขที่คำร้อง</th>
                <th style={{ padding: '10px 12px' }}>สถานะ Telegram &amp; Socket</th>
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
                      <div>{log.title}</div>
                      {log.by && <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 400 }}>โดย: {log.by}</div>}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)', whiteSpace: 'pre-line', maxWidth: '420px' }}>
                      {log.message}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--gold-primary)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {log.trackingCode || '-'}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span
                        title={log.error || ''}
                        className={`badge ${log.status === 'SENT'
                            ? 'badge-emerald'
                            : log.status === 'FAILED' || log.status === 'ERROR'
                              ? 'badge-red'
                              : log.status === 'SENDING'
                                ? 'badge-amber'
                                : 'badge-cyan'
                          }`}
                      >
                        {log.status === 'SENT'
                          ? 'SENT (Telegram + Socket)'
                          : log.status === 'LOCAL_ONLY'
                            ? 'Socket.IO Only'
                            : log.status}
                      </span>
                      {log.error && (
                        <div style={{ fontSize: '11px', color: '#fca5a5', marginTop: '3px' }}>
                          {log.error}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cybersecurity & PDPA / Website Visit Analytics Panel */}
      <div className="glass-panel" style={{ padding: '24px', marginTop: '28px', borderTop: '3px solid var(--emerald-success)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} color="var(--emerald-success)" />
            <span>มาตรฐานความปลอดภัยไซเบอร์ &amp; สถิติความยินยอม PDPA / การเยี่ยมชมเว็บไซต์</span>
          </h2>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('rta_open_pdpa_settings', { detail: { tab: 'settings' } }))}
            className="btn btn-secondary btn-sm"
          >
            ตั้งค่า PDPA &amp; คุกกี้
          </button>
        </div>

        <div className="grid-cols-2" style={{ gap: '18px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '16px', border: '1px solid var(--border-glass)' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff', marginBottom: '10px' }}>
              🔒 มาตรการป้องกันการโจรกรรมข้อมูลที่เปิดใช้งานอยู่
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              <li><strong style={{ color: '#6ee7b7' }}>Signed HttpOnly Session Cookie (HMAC-SHA256)</strong> ป้องกัน XSS อ่าน Token และ Impersonation API</li>
              <li><strong style={{ color: '#6ee7b7' }}>Salted Scrypt Password Hashing</strong> เข้ารหัสรหัสผ่านผู้ใช้ทุกบัญชีในฐานข้อมูล</li>
              <li><strong style={{ color: '#6ee7b7' }}>Strict RBAC + Hierarchical Unit Scoping</strong> API และ Socket.IO ห้องแยกตามสิทธิ์และสังกัด</li>
              <li><strong style={{ color: '#6ee7b7' }}>Brute-Force Rate Limiting &amp; 3-Factor Reset</strong> จำกัดความถี่ Login / Track / Reset Password</li>
              <li><strong style={{ color: '#6ee7b7' }}>Upload Allowlist &amp; CSP / Security Headers</strong> บล็อก .html / .svg / .exe และ X-Content-Type-Options: nosniff</li>
            </ul>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '16px', border: '1px solid var(--border-glass)' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff', marginBottom: '10px' }}>
              📊 สถิติการยินยอม PDPA &amp; การเยี่ยมชมเว็บไซต์ (Privacy-by-Design)
            </div>
            {pdpaSummary ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(20, 184, 166, 0.1)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>ผู้ยืนยัน PDPA / คุกกี้</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>{pdpaSummary.totalConsents} ครั้ง</div>
                    <div style={{ fontSize: '11px', color: '#6ee7b7' }}>ยินยอมสถิติ {pdpaSummary.analyticsOptInRate}%</div>
                  </div>
                  <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(212, 175, 55, 0.1)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>ยอดเข้าชม (เฉพาะผู้ยินยอม)</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gold-primary)' }}>{pdpaSummary.totalVisits} ครั้ง</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>วันนี้ {pdpaSummary.todayVisits} | ผู้เยี่ยมชม {pdpaSummary.uniqueVisitors}</div>
                  </div>
                </div>
                {Array.isArray(pdpaSummary.topPaths) && pdpaSummary.topPaths.length > 0 && (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    <strong style={{ color: '#fff' }}>หน้าที่เยี่ยมชมสูงสุด:</strong>{' '}
                    {pdpaSummary.topPaths.slice(0, 4).map((p) => `${p.path} (${p.count})`).join(' • ')}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ fontSize: '12.5px', color: 'var(--text-dim)' }}>กำลังโหลดสถิติ PDPA...</div>
            )}

            {storageInfo && (
              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Database size={14} color={storageInfo.connected ? '#6ee7b7' : '#f87171'} />
                    ฐานข้อมูล PostgreSQL: {storageInfo.database || 'rta_sinmai'}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: storageInfo.connected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: storageInfo.connected ? '#6ee7b7' : '#fca5a5'
                    }}
                  >
                    {storageInfo.connected ? 'เชื่อมต่อฐานข้อมูลจริงแล้ว' : 'ไม่สามารถเชื่อมต่อได้'}
                  </span>
                </div>
                {storageInfo.connected ? (
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    ผู้ใช้ {storageInfo.users_count} • คำร้อง {storageInfo.claims_count} • หน่วย {storageInfo.units_count} • Log {storageInfo.logs_count} • PDPA {storageInfo.pdpa_count} • Visit {storageInfo.visits_count}
                  </div>
                ) : (
                  <div style={{ fontSize: '11.5px', color: '#fca5a5' }}>{storageInfo.error}</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
