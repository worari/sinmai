// components/AppShell.js
'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import StatusModal from '@/components/StatusModal';
import Link from 'next/link';
import { Shield, Lock, LogIn, ArrowLeft, UserCheck } from 'lucide-react';

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [theme, setTheme] = useState('teal');
  const [knowledgeStatus, setKnowledgeStatus] = useState(null);
  const [knowledgeLoading, setKnowledgeLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // โหลดธีมเริ่มต้น (เขียวคราม เป็น default)
    const savedTheme = localStorage.getItem('rta_theme') || 'teal';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // ตรวจสอบสถานะการ Login
    const checkAuth = () => {
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
      setIsLoaded(true);
    };

    checkAuth();

    // ฟัง Event เมื่อมีการเปลี่ยน User หรือเปลี่ยน Theme
    const handleAuthChange = () => {
      checkAuth();
      const savedUser = localStorage.getItem('rta_user');
      if (!savedUser) {
        const publicRoutes = ['/', '/login', '/register', '/track'];
        if (!publicRoutes.includes(pathname)) {
          window.location.href = '/';
        }
      }
    };
    const handleThemeChange = (e) => {
      const newTheme = e.detail || localStorage.getItem('rta_theme') || 'teal';
      setTheme(newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    };

    window.addEventListener('rta_auth_change', handleAuthChange);
    window.addEventListener('rta_theme_change', handleThemeChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('rta_auth_change', handleAuthChange);
      window.removeEventListener('rta_theme_change', handleThemeChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // ตรวจสอบสิทธิการใช้งานระบบจากสถานะแบบทดสอบความรู้ (ผ่าน=ใช้งานได้, ไม่ผ่าน=ใช้งานไม่ได้)
  useEffect(() => {
    const fetchKnowledge = async () => {
      if (!currentUser) {
        setKnowledgeStatus(null);
        setKnowledgeLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `/api/knowledge/can-access?userId=${encodeURIComponent(currentUser.id)}&_t=${Date.now()}`,
          { cache: 'no-store' }
        );
        const data = await res.json();
        if (data.success) {
          setKnowledgeStatus(data);
        }
      } catch (e) {
        // คงค่าเดิมไว้หากเครือข่ายขัดข้องชั่วคราว
      } finally {
        setKnowledgeLoading(false);
      }
    };

    fetchKnowledge();

    const handleKnowledgeChange = (e) => {
      if (e?.detail?.canAccess) {
        setKnowledgeStatus((prev) => ({
          ...(prev || {}),
          success: true,
          canAccess: true,
          passed: true,
          score: e.detail.score ?? prev?.score
        }));
      }
      fetchKnowledge();
    };

    window.addEventListener('rta_knowledge_change', handleKnowledgeChange);
    return () => {
      window.removeEventListener('rta_knowledge_change', handleKnowledgeChange);
    };
  }, [currentUser, pathname]);

  // หน้าสาธารณะที่ไม่ต้อง Login ก็สามารถเข้าดูได้
  const isPublicRoute = 
    pathname === '/' || 
    pathname === '/login' || 
    pathname === '/register' || 
    pathname === '/reset-password' ||
    pathname === '/track';

  const isLoggedIn = Boolean(currentUser);
  const isAdmin = currentUser?.role === 'ADMIN';

  // เส้นทางที่อนุญาตให้เข้าถึงได้แม้ยังไม่ผ่านแบบทดสอบความรู้ (รวมหน้าคลังความรู้และคู่มือเพื่อศึกษาเตรียมสอบ)
  const knowledgeAllowedRoutes = ['/', '/login', '/register', '/reset-password', '/track', '/knowledge', '/knowledge/exam', '/knowledge/admin', '/manuals'];
  // ผู้ดูแลระบบ (ADMIN) ยกเว้นไม่ต้องทำแบบทดสอบความรู้ และผู้ใช้ที่สอบผ่านแล้วสามารถเข้าใช้งานระบบได้ทันที
  const hasPassedKnowledge = Boolean(knowledgeStatus?.canAccess || knowledgeStatus?.passed || currentUser?.knowledgePassed);
  const knowledgeBlocked = isLoaded && isLoggedIn && !isAdmin && knowledgeStatus && !hasPassedKnowledge && !knowledgeAllowedRoutes.includes(pathname);

  // กรณีผู้ใช้ยังไม่ได้ Login และพยายามเข้าหน้าภายในที่ต้องใช้สิทธิเจ้าหน้าที่
  const shouldBlockAccess = isLoaded && !isLoggedIn && !isPublicRoute;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      
      {/* แสดง Sidebar เฉพาะเมื่อผู้ใช้งานเข้าสู่ระบบ (Login) แล้วเท่านั้น */}
      {isLoggedIn && (
        <Sidebar 
          isOpen={sidebarOpen} 
          setIsOpen={setSidebarOpen} 
          currentUser={currentUser}
        />
      )}

      {/* Main Content Area: ถ้ายังไม่ได้ Login ให้ขยายเต็ม 100% ไม่มี Sidebar ด้านข้าง */}
      <div style={{
        flex: 1,
        marginLeft: isLoggedIn ? (sidebarOpen ? '260px' : '78px') : '0px',
        transition: 'margin-left 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Top Navbar */}
        <Navbar 
          currentUser={currentUser} 
          theme={theme} 
          setTheme={setTheme}
          isLoggedIn={isLoggedIn}
        />

        {/* Page Content */}
        <main style={{ flex: 1, paddingBottom: '60px' }}>
          {shouldBlockAccess ? (
            /* กรณีไม่ได้ Login แต่พยายามเข้า URL ภายใน */
            <div className="container" style={{ paddingTop: '70px', maxWidth: '580px', textAlign: 'center' }}>
              <div className="glass-panel" style={{ padding: '40px 32px', borderTop: '4px solid var(--ruby-danger)' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: 'var(--ruby-danger)'
                }}>
                  <Lock size={32} />
                </div>

                <h1 style={{ fontSize: '22px', marginBottom: '8px' }}>
                  ต้องเข้าสู่ระบบก่อนใช้งาน
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
                  หน้านี้สงวนไว้สำหรับเจ้าหน้าที่และผู้บังคับบัญชาตามสายงานของกองทัพบก กรุณาเข้าสู่ระบบเพื่อใช้งานเมนูหลักและกำหนดสิทธิการเข้าถึงข้อมูลตามบทบาท (Role-based Access)
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <Link href={`/login?redirect=${encodeURIComponent(pathname)}`} className="btn btn-primary" style={{ padding: '10px 24px' }}>
                    <LogIn size={16} />
                    <span>เข้าสู่ระบบ (Login)</span>
                  </Link>

                  <Link href="/" className="btn btn-secondary">
                    <ArrowLeft size={16} />
                    <span>กลับหน้าหลักพอร์ทัล</span>
                  </Link>
                </div>

                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '12px', color: 'var(--text-dim)' }}>
                  กำลังพลและทายาทสามารถ <Link href="/track" style={{ color: 'var(--gold-primary)', textDecoration: 'underline' }}>ตรวจสอบสิทธิด้วยเลข ปชช.</Link> ได้โดยไม่ต้องเข้าสู่ระบบ
                </div>
              </div>
            </div>
          ) : knowledgeBlocked ? (
            <div className="container" style={{ paddingTop: '70px', maxWidth: '600px', textAlign: 'center' }}>
              <div className="glass-panel" style={{ padding: '40px 32px', borderRadius: '12px', borderTop: '4px solid var(--ruby-danger)' }}>
                <Lock size={32} style={{ color: 'var(--ruby-danger)', marginBottom: '16px' }} />
                <h1 style={{ fontSize: '22px', marginBottom: '8px' }}>ยังไม่ผ่านการทดสอบความรู้</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>{knowledgeStatus?.message || 'ท่านยังไม่มีสิทธิใช้งานระบบ กรุณาเข้าทำแบบทดสอบความรู้ก่อน'}</p>
                {knowledgeStatus?.windowOpen?.open ? (
                  <Link href="/knowledge/exam" className="btn btn-primary" style={{ padding: '10px 24px', marginRight: '10px' }}>เข้าทำแบบทดสอบ</Link>
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px', marginRight: '12px' }}>ช่วงเปิดสอบ: {knowledgeStatus?.windowOpen?.message || '-'}</span>
                )}
                <Link href="/knowledge" className="btn btn-secondary" style={{ padding: '10px 24px' }}>กลับคลังความรู้</Link>
              </div>
            </div>
          ) : (
            children
          )}
        </main>

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(7, 13, 30, 0.95)',
          padding: '22px 0',
          fontSize: '12.5px',
          color: 'var(--text-dim)',
          textAlign: 'center'
        }}>
          <div className="container">
            <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>
              กองสิทธิกำลังพล กรมกำลังพลทหารบก (กสพ.กพ.ทบ.) ร่วมกับ กรมสวัสดิการทหารบก (สก.ทบ.)
            </p>
            <p>
              ระบบเสนอขอรับสิทธิเงินค่าสินไหมทดแทนกำลังพล • รองรับการติดตาม Timeline SLA 30 วัน • ป้องกันสิทธิ์แบบ Role Base (RBAC)
            </p>
          </div>
        </footer>
      </div>

      {/* Global Action Status Modal */}
      <StatusModal />
    </div>
  );
}
