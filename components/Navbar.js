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
  LogIn, 
  UserPlus, 
  ShieldAlert, 
  FileText,
  Home
} from 'lucide-react';

export default function Navbar({ currentUser: propUser, theme: propTheme, setTheme: propSetTheme, isLoggedIn: propIsLoggedIn }) {
  const pathname = usePathname();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(propUser || null);
  const [currentTheme, setCurrentTheme] = useState(propTheme || 'teal');
  const [notifications, setNotifications] = useState([]);
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

  useEffect(() => {
    // ซิงค์ User จาก localStorage (ถ้ามี)
    const syncUser = () => {
      const savedUser = localStorage.getItem('rta_user');
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch (e) {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    };

    // ซิงค์ Theme จาก localStorage (ถ้าไม่มีให้ใช้ teal)
    const syncTheme = () => {
      const savedTheme = localStorage.getItem('rta_theme') || 'teal';
      setCurrentTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    };

    syncUser();
    syncTheme();

    const handleAuthChange = () => syncUser();
    const handleThemeChange = (e) => {
      const t = e.detail || localStorage.getItem('rta_theme') || 'teal';
      setCurrentTheme(t);
    };

    window.addEventListener('rta_auth_change', handleAuthChange);
    window.addEventListener('rta_theme_change', handleThemeChange);
    window.addEventListener('storage', handleAuthChange);

    // ดึง Notifications ล่าสุด
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 12000);

    return () => {
      window.removeEventListener('rta_auth_change', handleAuthChange);
      window.removeEventListener('rta_theme_change', handleThemeChange);
      window.removeEventListener('storage', handleAuthChange);
      clearInterval(interval);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/telegram');
      const data = await res.json();
      if (data.history) {
        setNotifications(data.history);
      }
    } catch (e) {
      // ignore
    }
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

  // ออกจากระบบ (Logout)
  const handleLogout = () => {
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
                  title="การแจ้งเตือน Real-time"
                >
                  <Bell size={18} />
                  {notifications.length > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-3px',
                      right: '-3px',
                      background: 'var(--ruby-danger)',
                      color: '#fff',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700
                    }}>
                      {notifications.length}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifMenu && (
                  <div className="glass-panel" style={{
                    position: 'absolute',
                    top: '46px',
                    right: 0,
                    width: '360px',
                    maxHeight: '420px',
                    overflowY: 'auto',
                    padding: '16px',
                    zIndex: 100,
                    background: 'rgba(4, 20, 23, 0.98)',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.6)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
                      <span style={{ fontWeight: 600, color: '#fff' }}>🔔 การแจ้งเตือนล่าสุด (Socket & Bot)</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{notifications.length} รายการ</span>
                    </div>

                    {notifications.length === 0 ? (
                      <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px 0' }}>ยังไม่มีการแจ้งเตือน</div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} style={{
                          padding: '10px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          borderRadius: '8px',
                          marginBottom: '8px',
                          borderLeft: n.type === 'DELAY_REPORT' ? '3px solid var(--ruby-danger)' : '3px solid var(--cyan-accent)'
                        }}>
                          <div style={{ fontWeight: 600, fontSize: '13px', color: '#fff' }}>{n.title}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0' }}>{n.message}</div>
                          <div style={{ fontSize: '11px', color: 'var(--cyan-accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} />
                            <span>{new Date(n.timestamp).toLocaleTimeString('th-TH')}</span>
                            {n.trackingCode && <span>• {n.trackingCode}</span>}
                          </div>
                        </div>
                      ))
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
