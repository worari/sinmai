// components/Navbar.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Shield, 
  Search, 
  Bell, 
  UserCheck, 
  LogOut, 
  Clock, 
  ChevronDown, 
  Palette, 
  Sparkles, 
  Check, 
  CheckCheck,
  Volume2,
  VolumeX,
  Send,
  LogIn, 
  UserPlus, 
  ShieldAlert, 
  FileText,
  Home
} from 'lucide-react';
import {
  getSocketClient,
  registerSocketUser,
  canViewClientNotification,
  isNotificationSoundEnabled
} from '@/lib/socket-client';

export default function Navbar({ currentUser: propUser, theme: propTheme, setTheme: propSetTheme, isLoggedIn: propIsLoggedIn }) {
  const pathname = usePathname();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(propUser || null);
  const [currentTheme, setCurrentTheme] = useState(propTheme || 'teal');
  const [notifications, setNotifications] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  // ธีมที่มีให้เลือก (Default: เขียวคราม ไล่เฉด สะอาดตาอ่านง่าย)
  const THEMES = [
    {
      id: 'teal',
      name: 'เขียวคราม (ค่าเริ่มต้น)',
      desc: 'เฉดมรกต-คราม ไล่เฉด สะอาดตา อ่านง่าย สบายสายตา',
      icon: '🌿',
      preview: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #059669 100%)'
    },
    {
      id: 'navy-gold',
      name: 'กรมท่า-ทอง (ทบ.)',
      desc: 'สีกรมท่าเข้มตัดสีทอง ทรงเกียรติ สไตล์ทางการกองทัพบก',
      icon: '⚜️',
      preview: 'linear-gradient(135deg, #070d1e 0%, #1e3a8a 50%, #d4af37 100%)'
    },
    {
      id: 'light-teal',
      name: 'สว่าง สะอาดตา',
      desc: 'พื้นขาวคลีน ไฮคอนทราสต์ อักษรคมชัด อ่านสะดวกทุกสภาพแสง',
      icon: '☀️',
      preview: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #0d9488 100%)'
    }
  ];

  const getStoredUser = () => {
    const savedUser = localStorage.getItem('rta_user');
    if (!savedUser) return null;
    try {
      return JSON.parse(savedUser);
    } catch (e) {
      return null;
    }
  };

  const fetchNotifications = async (userObj = null) => {
    const targetUser = userObj !== undefined ? userObj : getStoredUser();
    if (!targetUser?.id) {
      setNotifications([]);
      return;
    }
    try {
      const res = await fetch(`/api/telegram?userId=${encodeURIComponent(targetUser.id)}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.history) {
        setNotifications(data.history);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    const syncUser = () => {
      const u = getStoredUser();
      setCurrentUser(u);
      registerSocketUser(u);
      fetchNotifications(u);
      return u;
    };

    const syncTheme = () => {
      const savedTheme = localStorage.getItem('rta_theme') || 'teal';
      setCurrentTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    };

    syncUser();
    syncTheme();
    setSoundEnabled(isNotificationSoundEnabled());

    const handleAuthChange = () => syncUser();
    const handleThemeChange = (e) => {
      const t = e.detail || localStorage.getItem('rta_theme') || 'teal';
      setCurrentTheme(t);
    };

    window.addEventListener('rta_auth_change', handleAuthChange);
    window.addEventListener('rta_theme_change', handleThemeChange);
    window.addEventListener('storage', handleAuthChange);

    // เชื่อมต่อ Real-time Socket.IO สำหรับกระดิ่งแจ้งเตือน (Singleton)
    const socket = getSocketClient();
    const onConnect = () => {
      setSocketConnected(true);
      registerSocketUser(getStoredUser());
    };
    const onDisconnect = () => setSocketConnected(false);
    const onNewNotif = (notif) => {
      const u = getStoredUser();
      if (!canViewClientNotification(notif, u)) return;
      setNotifications((prev) => [notif, ...prev.filter((item) => item.id !== notif.id)].slice(0, 100));
    };
    const onUpdatedNotif = (notif) => {
      setNotifications((prev) => prev.map((item) => (item.id === notif.id ? notif : item)));
    };
    const onNotifRead = ({ userId, notificationId, markAll }) => {
      const u = getStoredUser();
      if (!u?.id || u.id !== userId) return;
      setNotifications((prev) =>
        prev.map((item) => {
          if (!markAll && item.id !== notificationId) return item;
          const readBy = Array.isArray(item.readBy) ? item.readBy : [];
          return readBy.includes(userId) ? item : { ...item, readBy: [...readBy, userId] };
        })
      );
    };
    const onNotifCleared = () => setNotifications([]);

    if (socket) {
      setSocketConnected(Boolean(socket.connected));
      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      socket.on('new_notification', onNewNotif);
      socket.on('notification_updated', onUpdatedNotif);
      socket.on('notifications_read', onNotifRead);
      socket.on('notifications_cleared', onNotifCleared);
    }

    // Fallback sync ทุก 60 วินาทีเผื่อเครือข่ายสลับสถานะ
    const interval = setInterval(() => fetchNotifications(), 60000);

    return () => {
      window.removeEventListener('rta_auth_change', handleAuthChange);
      window.removeEventListener('rta_theme_change', handleThemeChange);
      window.removeEventListener('storage', handleAuthChange);
      if (socket) {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
        socket.off('new_notification', onNewNotif);
        socket.off('notification_updated', onUpdatedNotif);
        socket.off('notifications_read', onNotifRead);
        socket.off('notifications_cleared', onNotifCleared);
      }
      clearInterval(interval);
    };
  }, []);

  const unreadCount = currentUser?.id
    ? notifications.filter((n) => !Array.isArray(n.readBy) || !n.readBy.includes(currentUser.id)).length
    : 0;

  const handleMarkRead = async (notificationId = null, markAll = false) => {
    if (!currentUser?.id) return;
    setNotifications((prev) =>
      prev.map((item) => {
        if (!markAll && item.id !== notificationId) return item;
        const readBy = Array.isArray(item.readBy) ? item.readBy : [];
        return readBy.includes(currentUser.id) ? item : { ...item, readBy: [...readBy, currentUser.id] };
      })
    );
    try {
      await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'MARK_READ', notificationId, userId: currentUser.id, markAll })
      });
    } catch (e) {
      // ignore
    }
  };

  const handleNotificationClick = (notif) => {
    handleMarkRead(notif.id, false);
    if (notif.link) {
      setShowNotifMenu(false);
      router.push(notif.link);
    }
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('rta_notif_sound', next ? 'true' : 'false');
  };

  // เปลี่ยนธีม
  const handleSelectTheme = (themeId) => {
    localStorage.setItem('rta_theme', themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    setCurrentTheme(themeId);
    if (propSetTheme) propSetTheme(themeId);
    setShowThemeMenu(false);
    window.dispatchEvent(new CustomEvent('rta_theme_change', { detail: themeId }));
  };

  // ออกจากระบบ (Logout) พร้อมล้าง HttpOnly Session Cookie และบันทึก Audit Log
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('rta_user');
    setCurrentUser(null);
    setShowRoleSwitcher(false);
    window.dispatchEvent(new Event('rta_auth_change'));
    router.push('/');
  };

  const isLoggedIn = Boolean(currentUser);
  const activeThemeObj = THEMES.find((t) => t.id === currentTheme) || THEMES[0];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(4, 20, 23, 0.88)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      transition: 'background 0.3s ease, border-color 0.3s ease'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        
        {/* Brand Logo & Name */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 50%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(20, 184, 166, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Shield size={24} color="#ffffff" strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '17px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>ระบบเสนอขอรับสิทธิเงินค่าสินไหมทดแทน</span>
              {isLoggedIn && <span className="live-dot" title="ระบบรายงานสด Real-time กำลังทำงาน"></span>}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--gold-primary)', fontWeight: 500 }}>
              กองทัพบก • กรมกำลังพลทหารบก (กพ.ทบ.)
            </div>
          </div>
        </Link>

        {/* Navigation Middle: เมนูพอร์ทัลสาธารณะ (ถ้ายังไม่ได้ Login จะมีเฉพาะเมนูหน้าพอร์ทัลและตรวจสอบสิทธิ) */}
        {!isLoggedIn ? (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link 
              href="/" 
              className={`btn btn-sm ${pathname === '/' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '8px' }}
            >
              <Home size={15} />
              <span>หน้าหลักพอร์ทัล</span>
            </Link>

            <Link 
              href="/track" 
              className={`btn btn-sm ${pathname === '/track' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ 
                borderRadius: '8px', 
                background: pathname === '/track' ? undefined : 'rgba(20, 184, 166, 0.12)', 
                borderColor: 'rgba(20, 184, 166, 0.35)' 
              }}
            >
              <Search size={15} />
              <span>ตรวจสอบสิทธิ (เลข ปชช.)</span>
            </Link>
          </nav>
        ) : (
          /* กรณี Login แล้ว แสดง Badge ระบุบทบาทปัจจุบันที่กำลังปฏิบัติงาน */
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '20px',
              background: 'rgba(20, 184, 166, 0.12)',
              border: '1px solid rgba(20, 184, 166, 0.3)',
              fontSize: '12px',
              color: 'var(--cyan-accent)'
            }}>
              <span className="live-dot" style={{ width: '6px', height: '6px' }}></span>
              <span>กำลังปฏิบัติงาน: <strong>{currentUser.badge}</strong></span>
            </div>
          </div>
        )}

        {/* Right Tools: Theme Switcher, Notifications, User/Login Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
          
          {/* 🌿 Theme Selector Dropdown (เขียวคราม / กรมท่า-ทอง / สว่าง) */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setShowThemeMenu(!showThemeMenu);
                setShowRoleSwitcher(false);
                setShowNotifMenu(false);
              }}
              className="btn btn-secondary btn-sm"
              style={{
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'var(--border-subtle)'
              }}
              title="เปลี่ยนแนวสีธีมระบบ (เขียวคราม / กรมท่า-ทอง / สว่าง)"
            >
              <span style={{ fontSize: '15px' }}>{activeThemeObj.icon}</span>
              <span style={{ fontSize: '12.5px', fontWeight: 600 }}>{activeThemeObj.name.split(' ')[0]}</span>
              <ChevronDown size={14} color="var(--text-muted)" />
            </button>

            {/* Theme Dropdown Menu */}
            {showThemeMenu && (
              <div className="glass-panel" style={{
                position: 'absolute',
                top: '44px',
                right: 0,
                width: '280px',
                padding: '12px',
                zIndex: 100,
                background: 'rgba(4, 20, 23, 0.98)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid var(--border-glass)', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
                  <Palette size={14} color="var(--cyan-accent)" />
                  <span>เลือกธีมสีการแสดงผล (Theme)</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {THEMES.map((t) => {
                    const isSelected = t.id === currentTheme;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleSelectTheme(t.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background: isSelected ? 'rgba(20, 184, 166, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                          border: isSelected ? '1px solid var(--cyan-accent)' : '1px solid transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                          color: '#fff',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          background: t.preview,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px'
                        }}>
                          {t.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: isSelected ? 'var(--cyan-accent)' : 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>{t.name}</span>
                            {isSelected && <Check size={14} color="var(--cyan-accent)" />}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)', lineHeight: 1.3 }}>
                            {t.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ถ้ายังไม่ได้ Login: แสดงปุ่ม เข้าสู่ระบบ (Login) และ ลงทะเบียน */}
          {!isLoggedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link 
                href="/register" 
                className="btn btn-secondary btn-sm"
                style={{ borderRadius: '8px', padding: '7px 14px' }}
              >
                <UserPlus size={15} />
                <span>ลงทะเบียน</span>
              </Link>

              <Link 
                href="/login" 
                className="btn btn-primary btn-sm"
                style={{ borderRadius: '8px', padding: '7px 16px' }}
              >
                <LogIn size={15} />
                <span>เข้าสู่ระบบ (Login)</span>
              </Link>
            </div>
          ) : (
            /* ถ้าเข้าสู่ระบบแล้ว: แสดง Notification Bell + ข้อมูล User + สลับ Role + ปุ่ม ออกจากระบบ */
            <>
              {/* Notification Bell */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => {
                    setShowNotifMenu(!showNotifMenu);
                    setShowRoleSwitcher(false);
                    setShowThemeMenu(false);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ position: 'relative', width: '38px', height: '38px', padding: 0, borderRadius: '50%' }}
                  title={socketConnected ? 'การแจ้งเตือน Real-time (Socket.IO เชื่อมต่อแล้ว)' : 'การแจ้งเตือน Real-time'}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-3px',
                      right: '-3px',
                      background: 'var(--ruby-danger)',
                      color: '#fff',
                      borderRadius: '50%',
                      minWidth: '18px',
                      height: '18px',
                      padding: '0 4px',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700
                    }}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifMenu && (
                  <div className="glass-panel" style={{
                    position: 'absolute',
                    top: '46px',
                    right: 0,
                    width: '390px',
                    maxWidth: 'calc(100vw - 24px)',
                    maxHeight: '480px',
                    overflowY: 'auto',
                    padding: '16px',
                    zIndex: 100,
                    background: 'rgba(4, 20, 23, 0.98)',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.65)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '10px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>🔔 ศูนย์แจ้งเตือน (Socket &amp; Bot)</span>
                        </div>
                        <div style={{ fontSize: '11px', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px', color: socketConnected ? '#6ee7b7' : 'var(--text-dim)' }}>
                          <span style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            background: socketConnected ? '#10b981' : '#f59e0b',
                            display: 'inline-block'
                          }}></span>
                          <span>{socketConnected ? 'Socket.IO เชื่อมต่อสด' : 'กำลังเชื่อมต่อ Socket...'}</span>
                          <span>• ยังไม่อ่าน {unreadCount}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={toggleSound}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 7px', fontSize: '11px' }}
                          title={soundEnabled ? 'ปิดเสียงแจ้งเตือน' : 'เปิดเสียงแจ้งเตือน'}
                        >
                          {soundEnabled ? <Volume2 size={13} color="var(--cyan-accent)" /> : <VolumeX size={13} color="var(--text-dim)" />}
                        </button>
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={() => handleMarkRead(null, true)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '11px', color: '#6ee7b7' }}
                            title="ทำเครื่องหมายว่าอ่านแล้วทั้งหมด"
                          >
                            <CheckCheck size={13} />
                            <span>อ่านทั้งหมด</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {notifications.length === 0 ? (
                      <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '24px 0', fontSize: '13px' }}>
                        ยังไม่มีการแจ้งเตือน
                      </div>
                    ) : (
                      notifications.slice(0, 30).map((n) => {
                        const isUnread = currentUser?.id && (!Array.isArray(n.readBy) || !n.readBy.includes(currentUser.id));
                        const borderColor =
                          n.type === 'DELAY_REPORT' || n.type === 'DOC_REJECTED' || n.type === 'CLAIM_DELETED'
                            ? 'var(--ruby-danger)'
                            : n.type === 'SLA_ALERT'
                              ? 'var(--amber-warning)'
                              : n.type === 'APPROVED' || n.type === 'PAYMENT_PAID'
                                ? 'var(--emerald-success)'
                                : n.type === 'TELEGRAM_DIRECT' || n.type === 'TEST'
                                  ? 'var(--gold-primary)'
                                  : 'var(--cyan-accent)';

                        return (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            style={{
                              padding: '10px 12px',
                              background: isUnread ? 'rgba(20, 184, 166, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                              borderRadius: '8px',
                              marginBottom: '8px',
                              borderLeft: `3px solid ${borderColor}`,
                              cursor: n.link ? 'pointer' : 'default',
                              transition: 'background 0.2s ease'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                              <div style={{ fontWeight: isUnread ? 700 : 600, fontSize: '13px', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {isUnread && (
                                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--cyan-accent)', flexShrink: 0 }} />
                                )}
                                <span>{n.title}</span>
                              </div>
                            </div>

                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0', whiteSpace: 'pre-line', lineHeight: 1.45 }}>
                              {n.message}
                            </div>

                            <div style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--cyan-accent)' }}>
                                <Clock size={11} />
                                <span>{new Date(n.timestamp).toLocaleTimeString('th-TH')}</span>
                                {n.trackingCode && <span>• {n.trackingCode}</span>}
                              </div>
                              <span style={{
                                fontSize: '10px',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                background: n.status === 'SENT'
                                  ? 'rgba(16, 185, 129, 0.16)'
                                  : n.status === 'FAILED' || n.status === 'ERROR'
                                    ? 'rgba(239, 68, 68, 0.18)'
                                    : 'rgba(255, 255, 255, 0.07)',
                                color: n.status === 'SENT'
                                  ? '#6ee7b7'
                                  : n.status === 'FAILED' || n.status === 'ERROR'
                                    ? '#fca5a5'
                                    : 'var(--text-dim)'
                              }}>
                                {n.status === 'SENT' ? 'Telegram ✓' : n.status === 'FAILED' || n.status === 'ERROR' ? 'Telegram ล้มเหลว' : 'In-App'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}

                    {currentUser?.role === 'ADMIN' && (
                      <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '8px', marginTop: '4px', textAlign: 'center' }}>
                        <Link
                          href="/settings"
                          onClick={() => setShowNotifMenu(false)}
                          style={{ fontSize: '12px', color: 'var(--gold-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                        >
                          <Send size={12} />
                          <span>จัดการ Telegram Bot &amp; ดูประวัติทั้งหมด →</span>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Current User & Role Switcher */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => {
                    setShowRoleSwitcher(!showRoleSwitcher);
                    setShowNotifMenu(false);
                    setShowThemeMenu(false);
                  }}
                  style={{
                    background: 'rgba(20, 184, 166, 0.12)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    background: 'rgba(20, 184, 166, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--cyan-accent)',
                    fontWeight: 700
                  }}>
                    <UserCheck size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {currentUser?.name || `${currentUser?.rank || ''} ${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'เจ้าหน้าที่ ทบ.'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--gold-primary)' }}>
                      {currentUser?.badge || currentUser?.role || ''}
                    </div>
                  </div>
                  <ChevronDown size={14} color="var(--text-dim)" />
                </button>

                {/* Role Switcher & User Account Dropdown */}
                {showRoleSwitcher && (
                  <div className="glass-panel" style={{
                    position: 'absolute',
                    top: '50px',
                    right: 0,
                    width: '340px',
                    padding: '14px',
                    zIndex: 100,
                    background: 'rgba(4, 20, 23, 0.98)',
                    boxShadow: '0 12px 36px rgba(0,0,0,0.7)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    {/* ข้อมูลบัญชีปัจจุบัน */}
                    <div style={{ padding: '10px 12px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>เข้าสู่ระบบในนาม:</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                        {currentUser?.name || `${currentUser?.rank || ''} ${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim()}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--cyan-accent)', marginTop: '2px' }}>{currentUser?.unitName || '-'}</div>
                      {currentUser?.citizenId && (
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', fontFamily: 'monospace' }}>
                          เลข ปชช.: {currentUser.citizenId}
                        </div>
                      )}
                    </div>

                    {/* เมนูลัดสำหรับผู้ดูแลระบบ */}
                    {currentUser?.role === 'ADMIN' && (
                      <div style={{ marginBottom: '12px' }}>
                        <Link
                          href="/users"
                          onClick={() => setShowRoleSwitcher(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            background: 'rgba(20, 184, 166, 0.15)',
                            border: '1px solid var(--cyan-accent)',
                            color: '#fff',
                            fontSize: '12.5px',
                            fontWeight: 600,
                            textDecoration: 'none'
                          }}
                        >
                          <span>⚙️ จัดการผู้ใช้ & สิทธิ์ & Audit Logs</span>
                          <span style={{ fontSize: '11px', color: 'var(--cyan-accent)' }}>เปิดหน้า →</span>
                        </Link>
                      </div>
                    )}

                    {/* ปุ่มออกจากระบบ (Logout) */}
                    <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '10px' }}>
                      <button
                        onClick={handleLogout}
                        className="btn btn-secondary"
                        style={{
                          width: '100%',
                          justifyContent: 'center',
                          color: '#fca5a5',
                          borderColor: 'rgba(239, 68, 68, 0.4)',
                          background: 'rgba(239, 68, 68, 0.1)',
                          padding: '8px',
                          fontSize: '13px'
                        }}
                      >
                        <LogOut size={15} />
                        <span>ออกจากระบบ (Logout)</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            </>
          )}

        </div>

      </div>
    </header>
  );
}
