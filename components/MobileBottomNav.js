// components/MobileBottomNav.js
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  BarChart3, 
  FileText, 
  PlusCircle, 
  Search, 
  Menu, 
  LogIn, 
  BookOpen,
  Layers
} from 'lucide-react';

export default function MobileBottomNav({ currentUser, onToggleMenu }) {
  const pathname = usePathname();
  const isLoggedIn = !!currentUser;

  return (
    <nav 
      className="mobile-bottom-nav" 
      aria-label="เมนูหลักสำหรับมือถือ"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '62px',
        background: 'rgba(4, 18, 22, 0.94)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 55,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.4)'
      }}
    >
      {isLoggedIn ? (
        <>
          {/* 1. แดชบอร์ด */}
          <Link
            href="/dashboard"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              textDecoration: 'none',
              color: pathname === '/dashboard' ? 'var(--gold-primary)' : 'var(--text-dim)',
              fontSize: '11px',
              fontWeight: pathname === '/dashboard' ? 600 : 400,
              padding: '6px 0',
              transition: 'all 0.15s ease'
            }}
          >
            <BarChart3 size={20} strokeWidth={pathname === '/dashboard' ? 2.4 : 1.8} />
            <span>แดชบอร์ด</span>
          </Link>

          {/* 2. รายการคำร้อง */}
          <Link
            href="/claims"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              textDecoration: 'none',
              color: pathname === '/claims' || pathname.startsWith('/claims/') ? 'var(--gold-primary)' : 'var(--text-dim)',
              fontSize: '11px',
              fontWeight: pathname === '/claims' ? 600 : 400,
              padding: '6px 0',
              transition: 'all 0.15s ease'
            }}
          >
            <FileText size={20} strokeWidth={pathname.startsWith('/claims') ? 2.4 : 1.8} />
            <span>คำร้อง</span>
          </Link>

          {/* 3. ยื่นเรื่องใหม่ (Highlighted Center Button) */}
          <Link
            href="/submit"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              position: 'relative',
              top: '-8px'
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 50%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(20, 184, 166, 0.45)',
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <PlusCircle size={26} strokeWidth={2.4} />
            </div>
            <span 
              style={{ 
                fontSize: '10.5px', 
                fontWeight: 600, 
                color: pathname === '/submit' ? 'var(--gold-primary)' : 'var(--text-muted)',
                marginTop: '2px'
              }}
            >
              ยื่นเรื่อง
            </span>
          </Link>

          {/* 4. ติดตามสิทธิ */}
          <Link
            href="/track"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              textDecoration: 'none',
              color: pathname === '/track' ? 'var(--gold-primary)' : 'var(--text-dim)',
              fontSize: '11px',
              fontWeight: pathname === '/track' ? 600 : 400,
              padding: '6px 0',
              transition: 'all 0.15s ease'
            }}
          >
            <Search size={20} strokeWidth={pathname === '/track' ? 2.4 : 1.8} />
            <span>ติดตาม</span>
          </Link>

          {/* 5. เมนูทั้งหมด (Toggle Drawer) */}
          <button
            type="button"
            onClick={onToggleMenu}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              fontSize: '11px',
              cursor: 'pointer',
              padding: '6px 0'
            }}
          >
            <Menu size={20} strokeWidth={1.8} />
            <span>เมนู</span>
          </button>
        </>
      ) : (
        <>
          {/* Public Visitor Menu */}
          <Link
            href="/"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              textDecoration: 'none',
              color: pathname === '/' ? 'var(--gold-primary)' : 'var(--text-dim)',
              fontSize: '11px',
              fontWeight: pathname === '/' ? 600 : 400,
              padding: '6px 0'
            }}
          >
            <Home size={20} strokeWidth={pathname === '/' ? 2.4 : 1.8} />
            <span>หน้าหลัก</span>
          </Link>

          <Link
            href="/track"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              textDecoration: 'none',
              color: pathname === '/track' ? 'var(--gold-primary)' : 'var(--text-dim)',
              fontSize: '11px',
              fontWeight: pathname === '/track' ? 600 : 400,
              padding: '6px 0'
            }}
          >
            <Search size={20} strokeWidth={pathname === '/track' ? 2.4 : 1.8} />
            <span>ตรวจสิทธิ</span>
          </Link>

          <Link
            href="/manuals"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              textDecoration: 'none',
              color: pathname === '/manuals' ? 'var(--gold-primary)' : 'var(--text-dim)',
              fontSize: '11px',
              fontWeight: pathname === '/manuals' ? 600 : 400,
              padding: '6px 0'
            }}
          >
            <BookOpen size={20} strokeWidth={pathname === '/manuals' ? 2.4 : 1.8} />
            <span>คู่มือ ทบ.</span>
          </Link>

          <Link
            href="/login"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              textDecoration: 'none',
              color: pathname === '/login' ? 'var(--gold-primary)' : 'var(--text-dim)',
              fontSize: '11px',
              fontWeight: pathname === '/login' ? 600 : 400,
              padding: '6px 0'
            }}
          >
            <LogIn size={20} strokeWidth={pathname === '/login' ? 2.4 : 1.8} />
            <span>เข้าสู่ระบบ</span>
          </Link>
        </>
      )}
    </nav>
  );
}

