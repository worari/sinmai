// components/Sidebar.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Shield, 
  Home, 
  BarChart3, 
  PlusCircle, 
  FileText, 
  Search, 
  Users, 
  PieChart, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  UserCheck,
  GitFork,
  CheckCircle2
} from 'lucide-react';
import { triggerStatusPopup } from '@/components/StatusModal';

export default function Sidebar({ isOpen, setIsOpen, currentUser: propUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(propUser || null);

  useEffect(() => {
    if (propUser) {
      setCurrentUser(propUser);
    } else {
      const saved = localStorage.getItem('rta_user');
      if (saved) {
        try {
          setCurrentUser(JSON.parse(saved));
        } catch (e) {}
      }
    }
  }, [propUser]);

  const handleLogout = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const prevUser = currentUser;
    try {
      localStorage.removeItem('rta_user');
    } catch (err) {}

    setCurrentUser(null);
    window.dispatchEvent(new Event('rta_auth_change'));

    // แจ้งเตือน Popup Modal ยืนยันการออกจากระบบ
    triggerStatusPopup({
      type: 'info',
      title: 'ออกจากระบบสำเร็จ',
      message: 'ท่านได้ออกจากระบบเรียบร้อยแล้ว ระบบกำลังนำท่านกลับสู่หน้าหลักพอร์ทัลสาธารณะ',
      action: 'ออกจากระบบ (Logout)',
      by: prevUser?.name ? `${prevUser.name} (${prevUser.badge || prevUser.role || ''})` : 'เจ้าหน้าที่'
    });

    // นำทางกลับหน้าหลักพอร์ทัลทันทีอย่างสมบูรณ์
    setTimeout(() => {
      window.location.href = '/';
    }, 350);
  };

  const userRole = currentUser?.role || 'UNIT_OFFICER';

  // รายการเมนูพร้อมกำหนดสิทธิ์ Role-Based Access Control (RBAC)
  const navItems = [
    { 
      label: 'หน้าหลักพอร์ทัล', 
      href: '/', 
      icon: Home, 
      badge: 'Portal' 
    },
    { 
      label: 'Dashboard สด', 
      href: '/dashboard', 
      icon: BarChart3, 
      live: true 
    },
    { 
      label: 'ติดตามสถานะสิทธิ', 
      href: '/track', 
      icon: Search, 
      highlight: true 
    },
    { 
      label: 'ยื่นเสนอเรื่องใหม่', 
      href: '/submit', 
      icon: PlusCircle, 
      allowedRoles: ['UNIT_OFFICER', 'ADMIN'],
      desc: 'สำหรับหน่วยรายงานสูญเสีย'
    },
    { 
      label: 'รายการคำร้อง', 
      href: '/claims', 
      icon: FileText,
      badge: userRole === 'KSP_OFFICER' ? 'ตรวจเอกสาร' : userRole === 'COMMANDER' ? 'รออนุมัติ' : userRole === 'INSURANCE_REP' ? 'จ่ายเงิน' : null
    },
    { 
      label: 'จัดการผู้ใช้งาน', 
      href: '/users', 
      icon: Users, 
      allowedRoles: ['ADMIN', 'KSP_OFFICER'],
      badge: 'Admin'
    },
    { 
      label: 'จัดการโครงสร้างหน่วย', 
      href: '/units', 
      icon: GitFork, 
      allowedRoles: ['ADMIN', 'KSP_OFFICER', 'UNIT_OFFICER'] 
    },
    { 
      label: 'จัดการคู่มือและวิดีโอ', 
      href: '/manuals', 
      icon: BookOpen, 
      allowedRoles: ['ADMIN', 'KSP_OFFICER', 'UNIT_OFFICER'] 
    },
    { label: 'คลังความรู้', href: '/knowledge', icon: BookOpen, allowedRoles: ['ADMIN', 'KSP_OFFICER', 'UNIT_OFFICER', 'INSURANCE_REP', 'SK_OFFICER'], desc: 'คู่มือและวิดีโอสอนการใช้งาน' },
    { label: 'แบบทดสอบความรู้', href: '/knowledge/exam', icon: CheckCircle2, allowedRoles: ['ADMIN', 'KSP_OFFICER', 'UNIT_OFFICER', 'INSURANCE_REP', 'SK_OFFICER'], desc: 'ทดสอบก่อนใช้งานระบบ' },
    { label: 'จัดการแบบทดสอบ', href: '/knowledge/admin', icon: Settings, allowedRoles: ['ADMIN'], badge: 'Admin', desc: 'ตั้งค่าเกณฑ์และช่วงเวลาสอบ' },
    {
      label: 'สถิติ / รายงาน', 
      href: '/reports', 
      icon: PieChart, 
      allowedRoles: ['ADMIN', 'KSP_OFFICER', 'COMMANDER', 'SK_OFFICER', 'UNIT_OFFICER'] 
    },
    { 
      label: 'ตั้งค่า Telegram / SLA', 
      href: '/settings', 
      icon: Settings, 
      allowedRoles: ['ADMIN', 'KSP_OFFICER'],
      badge: 'Bot'
    },
  ];

  // กรองเมนูตามบทบาทสิทธิ์ (RBAC Filtering)
  const visibleNavItems = navItems.filter(
    (item) => !item.allowedRoles || item.allowedRoles.includes(userRole)
  );

  // คำอธิบายบทบาทสิทธิ์ภาษาไทย
  const getRoleBadge = (role) => {
    switch (role) {
      case 'UNIT_OFFICER': return { text: 'เจ้าหน้าที่หน่วย (ผู้เสนอเรื่อง)', color: 'var(--gold-primary)' };
      case 'KSP_OFFICER': return { text: 'กพ.ทบ. (กสพ.ฯ ตรวจเอกสาร)', color: 'var(--cyan-accent)' };
      case 'COMMANDER': return { text: 'ผู้บังคับบัญชา (ลงนามอนุมัติ)', color: 'var(--amber-warning)' };
      case 'INSURANCE_REP': return { text: 'บ.ประกันภัย (โอนเงินสินไหม)', color: 'var(--emerald-success)' };
      case 'SK_OFFICER': return { text: 'สก.ทบ. (รับทราบยอดจ่าย)', color: 'var(--purple-accent)' };
      case 'ADMIN': return { text: 'ผู้ดูแลระบบสูงสุด (Admin)', color: 'var(--ruby-danger)' };
      default: return { text: role, color: 'var(--gold-primary)' };
    }
  };

  const roleInfo = getRoleBadge(userRole);

  return (
    <aside style={{
      width: isOpen ? '260px' : '78px',
      transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      background: 'rgba(5, 22, 26, 0.96)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid var(--border-subtle)',
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      zIndex: 60,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '4px 0 24px rgba(0,0,0,0.45)'
    }}>
      {/* Top Header / Branding */}
      <div style={{
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        padding: isOpen ? '0 18px' : '0 14px',
        justifyContent: isOpen ? 'space-between' : 'center',
        borderBottom: '1px solid var(--border-glass)'
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', overflow: 'hidden' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--gold-light) 0%, var(--gold-primary) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px var(--gold-glow)',
            flexShrink: 0
          }}>
            <Shield size={22} color="#041417" strokeWidth={2.4} />
          </div>
          {isOpen && (
            <div style={{ whiteSpace: 'nowrap' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '15px', color: '#fff' }}>
                สินไหมทดแทน ทบ.
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--gold-primary)' }}>
                กพ.ทบ. • สก.ทบ.
              </div>
            </div>
          )}
        </Link>

        {isOpen && (
          <button 
            onClick={() => setIsOpen(false)}
            className="btn btn-secondary btn-sm"
            style={{ width: '28px', height: '28px', padding: 0, borderRadius: '50%' }}
            title="ย่อเมนู"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Expand Button When Collapsed */}
      {!isOpen && (
        <div style={{ padding: '8px 0', display: 'flex', justifyContent: 'center', borderBottom: '1px solid var(--border-glass)' }}>
          <button 
            onClick={() => setIsOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ width: '32px', height: '32px', padding: 0, borderRadius: '50%', margin: '0 auto' }}
            title="ขยายเมนู"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Nav Menu Items (Filtered by RBAC Role) */}
      <nav style={{ flex: 1, padding: '16px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: isOpen ? '10px 14px' : '10px 0',
                justifyContent: isOpen ? 'flex-start' : 'center',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '13.5px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#fff' : '#cbd5e1',
                background: isActive 
                  ? 'linear-gradient(90deg, rgba(20, 184, 166, 0.22) 0%, rgba(20, 184, 166, 0.08) 100%)' 
                  : item.highlight ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--gold-primary)' : '3px solid transparent',
                transition: 'all 0.15s ease'
              }}
              title={!isOpen ? item.label : undefined}
            >
              <Icon size={19} color={isActive ? 'var(--gold-primary)' : item.highlight ? 'var(--cyan-accent)' : '#94a3b8'} style={{ flexShrink: 0 }} />
              {isOpen && (
                <span style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'space-between' }}>
                  <span>{item.label}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {item.live && <span className="live-dot" style={{ width: '6px', height: '6px' }}></span>}
                    {item.badge && (
                      <span style={{ 
                        fontSize: '10px', 
                        padding: '1px 6px', 
                        borderRadius: '4px', 
                        background: 'rgba(20, 184, 166, 0.2)', 
                        color: 'var(--gold-primary)' 
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </span>
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Role Badge & Logout */}
      <div style={{
        padding: '14px',
        borderTop: '1px solid var(--border-glass)',
        background: 'rgba(3, 16, 19, 0.85)'
      }}>
        {currentUser ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: isOpen ? 'flex-start' : 'center' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(20, 184, 166, 0.2)',
                border: '1px solid rgba(20, 184, 166, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gold-primary)',
                flexShrink: 0
              }}>
                <UserCheck size={18} />
              </div>
              {isOpen && (
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {currentUser.name}
                  </div>
                  <div style={{ fontSize: '11px', color: roleInfo.color, fontWeight: 500, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {roleInfo.text}
                  </div>
                </div>
              )}
            </div>

            {isOpen ? (
              <div style={{ marginTop: '10px', display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#fca5a5',
                    borderColor: 'rgba(239, 68, 68, 0.35)',
                    background: 'rgba(239, 68, 68, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  title="ออกจากระบบ เพื่อกลับสู่หน้าพอร์ทัลสาธารณะ"
                >
                  <LogOut size={15} />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            ) : (
              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                  style={{
                    width: '36px',
                    height: '36px',
                    padding: 0,
                    borderRadius: '8px',
                    color: '#fca5a5',
                    borderColor: 'rgba(239, 68, 68, 0.35)',
                    background: 'rgba(239, 68, 68, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title="ออกจากระบบ เพื่อกลับสู่หน้าพอร์ทัลสาธารณะ"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="btn btn-primary btn-sm" style={{ width: '100%', fontSize: '12px' }}>
            {isOpen ? 'เข้าสู่ระบบ (เจ้าหน้าที่)' : 'Login'}
          </Link>
        )}
      </div>
    </aside>
  );
}
