// app/dashboard/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSocketClient } from '@/lib/socket-client';
import { 
  Users, 
  HeartCrack, 
  Accessibility, 
  Coins, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  ArrowUpRight, 
  ShieldAlert,
  Flame,
  Activity,
  Send,
  Stethoscope,
  Car,
  ShieldCheck,
  XCircle,
  CreditCard,
  Filter,
  Layers,
  Sparkles,
  TrendingUp,
  Inbox,
  Shield,
  FileCheck,
  X,
  Search
} from 'lucide-react';
import { formatThaiDate } from '@/lib/thai-utils';
import PaginationBar from '@/components/PaginationBar';

const DASHBOARD_CARD_STYLE = {
  padding: '24px',
  minHeight: '385px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between'
};

const CLAIMS_PER_PAGE = 5;
const STATS_PREVIEW_LIMIT = 5;

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentClaims, setRecentClaims] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState('ALL');
  const [claimsPage, setClaimsPage] = useState(1);
  const [statModalType, setStatModalType] = useState(null); // null | 'cause' | 'personnel'
  const [statModalSearch, setStatModalSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setStatModalType(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    let user = null;
    const saved = localStorage.getItem('rta_user');
    if (saved) {
      try { 
        user = JSON.parse(saved);
        setCurrentUser(user); 
      } catch (e) {}
    }

    loadDashboardData(user, selectedFiscalYear);

    const handleAuth = () => {
      let u = null;
      const s = localStorage.getItem('rta_user');
      if (s) {
        try { u = JSON.parse(s); } catch (e) {}
      }
      setCurrentUser(u);
      loadDashboardData(u, selectedFiscalYear);
    };
    window.addEventListener('rta_auth_change', handleAuth);

    // เชื่อมต่อ Socket.io (Singleton) สำหรับ Live Dashboard
    const socket = getSocketClient();

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);
    const onStatsUpdated = (newStats) => {
      setStats(newStats);
      setLastEvent('อัปเดตสถิติสดล่าสุด ' + new Date().toLocaleTimeString('th-TH'));
    };
    const onClaimCreated = (claim) => {
      setRecentClaims((prev) => [claim, ...prev.filter((c) => c.id !== claim.id)]);
      setClaimsPage(1);
      setLastEvent(`มีเรื่องเสนอใหม่: ${claim.trackingCode}`);
    };
    const onClaimUpdated = ({ id, claim }) => {
      setRecentClaims((prev) => prev.map((c) => (c.id === id ? claim : c)));
      setLastEvent(`อัปเดตสถานะคำร้อง ${claim.trackingCode}`);
    };
    const onClaimDeleted = ({ id }) => {
      setRecentClaims((prev) => prev.filter((c) => c.id !== id));
      setLastEvent('อัปเดตรายการคำร้องล่าสุด');
    };

    if (socket) {
      setSocketConnected(Boolean(socket.connected));
      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      socket.on('stats_updated', onStatsUpdated);
      socket.on('claim_created', onClaimCreated);
      socket.on('claim_updated', onClaimUpdated);
      socket.on('claim_deleted', onClaimDeleted);
    }

    return () => {
      window.removeEventListener('rta_auth_change', handleAuth);
      if (socket) {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
        socket.off('stats_updated', onStatsUpdated);
        socket.off('claim_created', onClaimCreated);
        socket.off('claim_updated', onClaimUpdated);
        socket.off('claim_deleted', onClaimDeleted);
      }
    };
  }, []);

  const loadDashboardData = async (user = currentUser, fy = selectedFiscalYear) => {
    try {
      const claimsUrl = user?.id ? `/api/claims?userId=${user.id}` : '/api/claims';
      const statsUrl = fy ? `/api/stats?fiscalYear=${fy}` : '/api/stats?fiscalYear=ALL';
      const [resStats, resClaims] = await Promise.all([
        fetch(statsUrl, { cache: 'no-store' }).then((r) => r.json()),
        fetch(claimsUrl, { cache: 'no-store' }).then((r) => r.json())
      ]);

      if (resStats.success) setStats(resStats.stats);
      if (resClaims.success) {
        setRecentClaims(resClaims.claims || []);
        setClaimsPage(1);
      }
    } catch (e) {
      console.error('Error fetching dashboard', e);
    }
  };

  const handleFiscalYearChange = (fy) => {
    setSelectedFiscalYear(fy);
    loadDashboardData(currentUser, fy);
  };

  const availableYears = stats?.availableFiscalYears || [2570, 2569, 2568, 2567];

  // เตรียมข้อมูลสถิติแบบเรียงลำดับจากมากไปน้อย สำหรับการ์ดความสูงเท่ากันและ Popup Modal
  const causeEntries = Object.entries(stats?.causeStats || {}).sort((a, b) => b[1] - a[1]);
  const personnelEntries = Object.entries(stats?.personnelStats || {}).sort((a, b) => b[1] - a[1]);
  const totalStatsDenominator = stats?.totalClaims || 1;

  // คำนวณ Pagination สำหรับตารางคำร้องเสนอล่าสุด & SLA 30 วัน (แสดงหน้าละ 5 แถว)
  const totalClaimsCount = recentClaims.length;
  const totalClaimsPages = Math.max(1, Math.ceil(totalClaimsCount / CLAIMS_PER_PAGE));
  const safeClaimsPage = Math.min(Math.max(1, claimsPage), totalClaimsPages);
  const paginatedClaims = recentClaims.slice(
    (safeClaimsPage - 1) * CLAIMS_PER_PAGE,
    safeClaimsPage * CLAIMS_PER_PAGE
  );

  // เตรียมข้อมูลสำหรับ Popup Modal
  const modalEntries = statModalType === 'cause' ? causeEntries : statModalType === 'personnel' ? personnelEntries : [];
  const filteredModalEntries = statModalSearch.trim()
    ? modalEntries.filter(([label]) => label.toLowerCase().includes(statModalSearch.trim().toLowerCase()))
    : modalEntries;

  // ฟังก์ชันช่วยแสดงผล Card สถิติที่มีความสูงเท่ากับการ์ดสิทธิสินไหม พร้อมปุ่ม "อ่านต่อ" เปิด Popup Modal
  const renderBreakdownCard = ({ type, title, subtitle, icon, entries, emptyText, countColor, barGradient }) => {
    const previewEntries = entries.slice(0, STATS_PREVIEW_LIMIT);
    const remainingCount = Math.max(0, entries.length - STATS_PREVIEW_LIMIT);

    return (
      <div className="glass-panel" style={DASHBOARD_CARD_STYLE}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <h2 style={{ fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              {icon}
              <span>{title}</span>
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>{subtitle}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: previewEntries.length > 0 ? 'flex-start' : 'center' }}>
            {previewEntries.length > 0 ? (
              previewEntries.map(([label, count]) => {
                const percent = Math.round((count / totalStatsDenominator) * 100);
                return (
                  <div key={label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', fontSize: '13.5px', marginBottom: '5px' }}>
                      <span
                        title={label}
                        style={{
                          color: 'var(--text-main)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '70%'
                        }}
                      >
                        {label}
                      </span>
                      <span style={{ fontWeight: 600, color: countColor, whiteSpace: 'nowrap' }}>
                        {count} เรื่อง ({percent}%)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, height: '100%', background: barGradient, borderRadius: '4px' }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px 0' }}>{emptyText}</p>
            )}
          </div>
        </div>

        {/* Footer พร้อมลิงก์ "อ่านต่อ" เพื่อเปิด Popup Modal ดูรายละเอียดทั้งหมด */}
        <div style={{
          marginTop: '14px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '12.5px'
        }}>
          <span style={{ color: 'var(--text-dim)' }}>
            {remainingCount > 0
              ? `แสดง ${STATS_PREVIEW_LIMIT} อันดับแรก (มีเพิ่มเติมอีก ${remainingCount} รายการ)`
              : `แสดงครบทั้ง ${entries.length} รายการ`}
          </span>
          {entries.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setStatModalSearch('');
                setStatModalType(type);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--gold-primary)',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: 0,
                textDecoration: 'underline'
              }}
            >
              <span>{remainingCount > 0 ? `อ่านต่อ (+${remainingCount} รายการที่เหลือ)` : 'อ่านต่อ / ดูรายละเอียดทั้งหมด'}</span>
              <ArrowUpRight size={14} />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container" style={{ paddingTop: '28px', paddingBottom: '40px' }}>
      
      {/* Top Banner & Real-time Status */}
      <div className="glass-panel" style={{
        padding: '24px 28px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        borderLeft: '4px solid var(--gold-primary)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '23px', margin: 0, fontWeight: 700 }}>
              ศูนย์บริหารจัดการสิทธิเงินค่าสินไหมทดแทนกำลังพล ทบ.
            </h1>
            <span className="badge badge-emerald" style={{ fontSize: '11px' }}>
              <span className="live-dot"></span>
              {socketConnected ? 'Live Socket.io เชื่อมต่อแล้ว' : 'กำลังเชื่อมต่อ Live...'}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '6px', margin: '6px 0 0' }}>
            ระบบประมวลผลสถิติแบบเรียลไทม์ • จำแนกการเสียชีวิต (ป่วย/อุบัติเหตุ) • สถิติขั้นตอน Workflow • สถิติยอดเงินโอนยามปกติและเสี่ยงภัย
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href="/submit" className="btn btn-primary">
            <ArrowUpRight size={16} />
            <span>ยื่นเสนอเรื่องผู้สูญเสีย</span>
          </Link>
          <Link href="/claims" className="btn btn-secondary">
            <FileText size={16} />
            <span>จัดการ Workflow</span>
          </Link>
        </div>
      </div>

      {/* Control Bar: ตัวกรองห้วงปีงบประมาณ & เหตุการณ์เรียลไทม์ */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px',
        marginBottom: '24px',
        padding: '14px 18px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '10px',
        border: '1px solid var(--border-glass)'
      }}>
        {/* Fiscal Year Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gold-light)', fontSize: '13.5px', fontWeight: 600 }}>
            <Filter size={16} color="var(--gold-primary)" />
            <span>ห้วงเวลาแสดงข้อมูล:</span>
          </div>

          <select 
            className="form-select"
            value={selectedFiscalYear}
            onChange={(e) => handleFiscalYearChange(e.target.value)}
            style={{ minWidth: '220px', padding: '6px 14px', fontSize: '13px', background: 'rgba(4, 20, 23, 0.95)', borderColor: 'var(--border-subtle)', color: '#fff' }}
          >
            <option value="ALL">🌐 ทุกปีงบประมาณ (ข้อมูลสะสมทั้งหมด)</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                ปีงบประมาณ {yr} (1 ต.ค. {yr - 1} - 30 ก.ย. {yr})
              </option>
            ))}
          </select>

          <span className="badge badge-amber" style={{ fontSize: '11px' }}>
            {selectedFiscalYear === 'ALL' ? 'สะสมทุกปีงบประมาณ' : `ปีงบประมาณ ${selectedFiscalYear}`}
          </span>
        </div>

        {/* Live Notification Event */}
        {lastEvent ? (
          <div style={{
            fontSize: '12.5px',
            color: 'var(--emerald-success)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Activity size={14} />
            <span>{lastEvent}</span>
          </div>
        ) : (
          <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
            ข้อมูลอัปเดตอัตโนมัติตามเวลาจริง (Real-time Live Sync)
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: 4 SUMMARY METRIC CARDS (เน้นจำแนกผู้เสียชีวิต ป่วย/อุบัติเหตุ) */}
      {/* ========================================================================= */}
      <div className="grid-cols-4" style={{ marginBottom: '24px' }}>
        
        {/* Card 1: ผู้เสียชีวิต (กำลังพล) พร้อมแจกแจง ป่วย และ อุบัติเหตุ */}
        <div className="glass-panel" style={{ padding: '20px', borderTop: '3.5px solid var(--ruby-danger)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>ผู้เสียชีวิต (กำลังพล)</div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                  {stats?.deceasedCount ?? 0} <span style={{ fontSize: '15px', color: 'var(--text-dim)', fontWeight: 400 }}>นาย</span>
                </div>
              </div>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HeartCrack size={22} color="#f87171" />
              </div>
            </div>

            {/* รายละเอียดเพิ่มเติมจากการป่วย และ อุบัติเหตุ ตามที่ระบุ */}
            <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Stethoscope size={13} /> จากการป่วย:
                </span>
                <strong style={{ color: '#fff' }}>{stats?.deceasedIllnessCount ?? 0} นาย</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#fcd34d', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Car size={13} /> จากอุบัติเหตุ:
                </span>
                <strong style={{ color: '#fff' }}>{stats?.deceasedAccidentCount ?? 0} นาย</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Shield size={13} /> ปฏิบัติหน้าที่สนาม/ปะทะ:
                </span>
                <strong style={{ color: '#fff' }}>{stats?.deceasedCombatCount ?? 0} นาย</strong>
              </div>
            </div>
          </div>
          
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '10px' }}>
            จำแนกจากผลชันสูตรและการรายงานของหน่วย
          </div>
        </div>

        {/* Card 2: พิการทุพพลภาพ */}
        <div className="glass-panel" style={{ padding: '20px', borderTop: '3.5px solid var(--amber-warning)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>พิการทุพพลภาพ</div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                  {stats?.disabledCount ?? 0} <span style={{ fontSize: '15px', color: 'var(--text-dim)', fontWeight: 400 }}>นาย</span>
                </div>
              </div>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Accessibility size={22} color="#fbbf24" />
              </div>
            </div>

            <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#93c5fd' }}>🩺 จากการป่วย:</span>
                <strong style={{ color: '#fff' }}>{stats?.disabledIllnessCount ?? 0} นาย</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#fcd34d' }}>🚗 จากอุบัติเหตุ:</span>
                <strong style={{ color: '#fff' }}>{stats?.disabledAccidentCount ?? 0} นาย</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#fbbf24' }}>🛡️ หน้าที่สนาม/ปะทะ:</span>
                <strong style={{ color: '#fff' }}>{stats?.disabledCombatCount ?? 0} นาย</strong>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '10px' }}>
            มีคำสั่งปลด/ประเมินสูญเสียอวัยวะ
          </div>
        </div>

        {/* Card 3: ยอดเงินสินไหมที่จ่ายโอนแล้ว */}
        <div className="glass-panel" style={{ padding: '20px', borderTop: '3.5px solid var(--emerald-success)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>ยอดเงินสินไหมจ่ายโอนแล้ว</div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
                  {stats ? stats.totalPaidAmount?.toLocaleString('th-TH') : 0} <span style={{ fontSize: '15px', color: 'var(--text-dim)', fontWeight: 400 }}>บาท</span>
                </div>
              </div>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Coins size={22} color="#34d399" />
              </div>
            </div>

            <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#6ee7b7' }}>✓ โอนสำเร็จแล้ว:</span>
                <strong style={{ color: '#fff' }}>{stats?.paidClaimsCount ?? 0} เรื่อง</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-dim)' }}>ยอดรวมที่ยื่นทั้งหมด:</span>
                <span style={{ color: 'var(--gold-light)' }}>{stats ? stats.totalCompensationAmount?.toLocaleString('th-TH') : 0} บ.</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-dim)' }}>อัตราจ่ายเงินสำเร็จ:</span>
                <span style={{ color: '#34d399', fontWeight: 700 }}>
                  {stats?.totalClaims > 0 ? Math.round(((stats.paidClaimsCount || 0) / stats.totalClaims) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '10px' }}>
            โอนเข้าบัญชีทายาทโดย บ.ประกันภัย
          </div>
        </div>

        {/* Card 4: เรื่องค้างดำเนินการ & SLA */}
        <div className="glass-panel" style={{ padding: '20px', borderTop: '3.5px solid var(--cyan-accent)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>กำลังดำเนินการ / เกิน SLA</div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                  {stats?.inProgressCount ?? 0} <span style={{ fontSize: '14px', color: (stats?.overdueCount || 0) > 0 ? '#f87171' : 'var(--text-dim)', fontWeight: 600 }}>
                    ({stats?.overdueCount ?? 0} เกิน 30 วัน)
                  </span>
                </div>
              </div>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={22} color="#38bdf8" />
              </div>
            </div>

            <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#38bdf8' }}>ตรวจเอกสาร (กสพ.):</span>
                <strong style={{ color: '#fff' }}>{stats?.underReviewCount ?? 0} เรื่อง</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#d8b4fe' }}>รอ จก.กพ.ทบ. อนุมัติ:</span>
                <strong style={{ color: '#fff' }}>{stats?.pendingApprovalCount ?? 0} เรื่อง</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#fca5a5' }}>ตีกลับให้หน่วยแก้ไข:</span>
                <strong style={{ color: '#f87171' }}>{stats?.rejectedClaimsCount ?? 0} เรื่อง</strong>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '10px' }}>
            ควบคุมกรอบเวลาดำเนินเรื่อง SLA 30 วัน
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SECTION 2 (NEW!): แผงรายงานสถานะคำร้องตาม Workflow 5 ขั้นตอนสำคัญ */}
      {/* เสนอขอรับกี่เรื่อง / กำลังดำเนินการกี่เรื่อง / อนุมัติ จก.กพ.ทบ. / โอนแล้ว / ไม่อนุมัติ */}
      {/* ========================================================================= */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '28px', borderTop: '3px solid var(--gold-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '18px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontWeight: 700 }}>
              <Activity size={20} color="var(--gold-primary)" />
              <span>สรุปสถานะกระบวนการคำร้องตาม Workflow (Workflow Lifecycle Statuses)</span>
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '3px', margin: '3px 0 0' }}>
              รายงานยอดสถิติคำร้องในแต่ละขั้นตอนการพิจารณา ({selectedFiscalYear === 'ALL' ? 'ข้อมูลสะสมทุกปีงบประมาณ' : `ปีงบประมาณ ${selectedFiscalYear}`})
            </p>
          </div>

          <span className="badge badge-amber" style={{ fontSize: '12px' }}>
            รวมคำร้องทั้งหมด: {stats?.totalClaims ?? 0} เรื่อง
          </span>
        </div>

        {/* 5 Status Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
          
          {/* 1. เสนอขอรับสินไหม */}
          <div style={{
            padding: '18px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(30, 58, 138, 0.08) 100%)',
            border: '1.5px solid rgba(59, 130, 246, 0.35)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#93c5fd', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Inbox size={16} /> เสนอขอรับสินไหม
              </span>
              <span className="badge badge-blue" style={{ fontSize: '10.5px' }}>ขั้นตอนที่ 1</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>
              {stats?.totalClaims ?? 0} <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-dim)' }}>เรื่อง</span>
            </div>
            <div style={{ fontSize: '12px', color: '#bfdbfe', marginTop: '6px' }}>
              • เรื่องใหม่รอ กสพ. รับเรื่อง: <strong>{stats?.submittedCount ?? 0} เรื่อง</strong>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '3px' }}>
              ยื่นเสนอโดยหน่วยต้นสังกัดทั่วประเทศ
            </div>
          </div>

          {/* 2. กำลังดำเนินการ */}
          <div style={{
            padding: '18px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(180, 83, 9, 0.08) 100%)',
            border: '1.5px solid rgba(245, 158, 11, 0.35)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#fcd34d', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} /> กำลังดำเนินการ
              </span>
              <span className="badge badge-amber" style={{ fontSize: '10.5px' }}>ขั้นตอนที่ 2-4</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>
              {stats?.inProgressCount ?? 0} <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-dim)' }}>เรื่อง</span>
            </div>
            <div style={{ fontSize: '12px', color: '#fde68a', marginTop: '6px' }}>
              • กสพ. กำลังตรวจเอกสาร: <strong>{stats?.underReviewCount ?? 0} เรื่อง</strong>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '3px' }}>
              อยู่ระหว่างตรวจหลักฐาน 10 รายการ
            </div>
          </div>

          {/* 3. อนุมัติ จก.กพ.ทบ. */}
          <div style={{
            padding: '18px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(107, 33, 168, 0.08) 100%)',
            border: '1.5px solid rgba(168, 85, 247, 0.35)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#d8b4fe', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} /> อนุมัติ จก.กพ.ทบ.
              </span>
              <span className="badge" style={{ fontSize: '10.5px', background: 'rgba(168, 85, 247, 0.25)', color: '#d8b4fe' }}>ขั้นตอนที่ 3</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>
              {stats?.commanderApprovedCount ?? 0} <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-dim)' }}>เรื่อง</span>
            </div>
            <div style={{ fontSize: '12px', color: '#e9d5ff', marginTop: '6px' }}>
              • ผ่านการลงนามอนุมัติ: <strong>{stats?.commanderApprovedCount ?? 0} เรื่อง</strong>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '3px' }}>
              แนบเอกสารตัวเรื่องส่งให้ บ.ประกันภัย แล้ว
            </div>
          </div>

          {/* 4. จ่ายโอนเงินแล้ว */}
          <div style={{
            padding: '18px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(4, 120, 87, 0.08) 100%)',
            border: '1.5px solid rgba(16, 185, 129, 0.35)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#6ee7b7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CreditCard size={16} /> จ่ายโอนเงินแล้ว
              </span>
              <span className="badge badge-emerald" style={{ fontSize: '10.5px' }}>ขั้นตอนที่ 4-5</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#34d399' }}>
              {stats?.paidClaimsCount ?? 0} <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-dim)' }}>เรื่อง</span>
            </div>
            <div style={{ fontSize: '12px', color: '#a7f3d0', marginTop: '6px' }}>
              • ยอดเงินโอนรวม: <strong>{stats ? stats.totalPaidAmount?.toLocaleString('th-TH') : 0} บ.</strong>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '3px' }}>
              โอนเข้าบัญชีทายาทพร้อมหลักฐาน e-Slip
            </div>
          </div>

          {/* 5. ไม่อนุมัติ / ตีกลับแก้ไข */}
          <div style={{
            padding: '18px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(185, 28, 28, 0.08) 100%)',
            border: '1.5px solid rgba(239, 68, 68, 0.35)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#fca5a5', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <XCircle size={16} /> ไม่อนุมัติ / ส่งกลับแก้ไข
              </span>
              <span className="badge badge-red" style={{ fontSize: '10.5px' }}>ตีกลับ</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#f87171' }}>
              {stats?.rejectedClaimsCount ?? 0} <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-dim)' }}>เรื่อง</span>
            </div>
            <div style={{ fontSize: '12px', color: '#fecaca', marginTop: '6px' }}>
              • ตีกลับเอกสารให้หน่วยแก้ไข: <strong>{stats?.rejectedClaimsCount ?? 0} เรื่อง</strong>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '3px' }}>
              รอหน่วยต้นสังกัดปรับปรุงเอกสารส่งใหม่
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3 (NEW!): แผงรายงานยอดเงินโอนและจำนวนเรื่อง แยก ยามปกติ (60,000) & เสี่ยงภัย (300,000) */}
      {/* ========================================================================= */}
      <div className="grid-cols-2" style={{ marginBottom: '28px' }}>
        
        {/* คอลัมน์ที่ 1: กรณียามปกติ (60,000 บาท) */}
        <div className="glass-panel" style={{
          ...DASHBOARD_CARD_STYLE,
          borderTop: '4px solid var(--cyan-accent)',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(4, 20, 23, 0.95) 100%)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-blue" style={{ fontSize: '12px', padding: '4px 10px' }}>
                  วงเงิน 60,000 บาท
                </span>
                <h3 style={{ fontSize: '18px', color: '#fff', margin: 0, fontWeight: 700 }}>
                  สิทธิสินไหม: กรณียามปกติ
                </h3>
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-dim)', marginTop: '4px', margin: '4px 0 0' }}>
                การเสียชีวิตหรือทุพพลภาพจากการปฏิบัติหน้าที่ยามปกติ / เจ็บป่วย / โรคประจำตัว / อุบัติเหตุทั่วไป
              </p>
            </div>

            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'rgba(6, 182, 212, 0.15)',
              color: 'var(--cyan-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Coins size={22} />
            </div>
          </div>

          {/* ยอดเงินโอนจริง & จำนวนเรื่องที่โอนแล้ว */}
          <div style={{
            padding: '16px',
            borderRadius: '10px',
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid var(--border-glass)',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ยอดเงินโอนเข้าบัญชีทายาทแล้ว (ยามปกติ):</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--cyan-accent)', marginTop: '4px' }}>
              {stats ? stats.normalPaidAmount?.toLocaleString('th-TH') : 0} <span style={{ fontSize: '16px', color: '#fff', fontWeight: 400 }}>บาท</span>
            </div>
            <div style={{ fontSize: '13px', color: '#e2e8f0', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={15} color="var(--cyan-accent)" />
              <span>โอนเงินแล้ว: <strong style={{ color: '#fff' }}>{stats?.normalPaidCount ?? 0}</strong> เรื่อง (จากที่ยื่นทั้งหมด {stats?.normalClaimCount ?? 0} เรื่อง)</span>
            </div>
          </div>

          {/* Progress Bar & Details */}
          <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)' }}>
              <span>อัตราการโอนเงินสำเร็จ:</span>
              <span style={{ color: 'var(--cyan-accent)', fontWeight: 700 }}>
                {stats?.normalClaimCount > 0 ? Math.round(((stats.normalPaidCount || 0) / stats.normalClaimCount) * 100) : 0}%
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${stats?.normalClaimCount > 0 ? Math.round(((stats.normalPaidCount || 0) / stats.normalClaimCount) * 100) : 0}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #0284c7, #06b6d4)',
                borderRadius: '4px',
                transition: 'width 0.5s ease'
              }}></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px', fontSize: '12px' }}>
              <div style={{ padding: '8px 12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-dim)', display: 'block' }}>ยื่นเสนอทั้งหมด:</span>
                <strong style={{ color: '#fff', fontSize: '14px' }}>{stats?.normalClaimCount ?? 0} เรื่อง</strong>
              </div>
              <div style={{ padding: '8px 12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-dim)', display: 'block' }}>วงเงินสิทธิเสนอทั้งหมด:</span>
                <strong style={{ color: 'var(--gold-light)', fontSize: '14px' }}>
                  {stats ? stats.normalTotalAmount?.toLocaleString('th-TH') : 0} บ.
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* คอลัมน์ที่ 2: กรณีหน้าที่สำคัญ / เสี่ยงภัย (300,000 บาท) */}
        <div className="glass-panel" style={{
          ...DASHBOARD_CARD_STYLE,
          borderTop: '4px solid var(--gold-primary)',
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(4, 20, 23, 0.95) 100%)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-amber" style={{ fontSize: '12px', padding: '4px 10px' }}>
                  วงเงิน 300,000 บาท
                </span>
                <h3 style={{ fontSize: '18px', color: '#fff', margin: 0, fontWeight: 700 }}>
                  สิทธิสินไหม: ปฏิบัติหน้าที่สำคัญ / เสี่ยงภัย
                </h3>
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-dim)', marginTop: '4px', margin: '4px 0 0' }}>
                การสูญเสียจากการปฏิบัติการรบ / ปะทะ / ลาดตระเวนชายแดน / รักษาความสงบพื้นที่จังหวัดชายแดนใต้
              </p>
            </div>

            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'rgba(212, 175, 55, 0.15)',
              color: 'var(--gold-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldAlert size={22} />
            </div>
          </div>

          {/* ยอดเงินโอนจริง & จำนวนเรื่องที่โอนแล้ว */}
          <div style={{
            padding: '16px',
            borderRadius: '10px',
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid var(--border-glass)',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ยอดเงินโอนเข้าบัญชีทายาทแล้ว (เสี่ยงภัย):</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--gold-primary)', marginTop: '4px' }}>
              {stats ? stats.highRiskPaidAmount?.toLocaleString('th-TH') : 0} <span style={{ fontSize: '16px', color: '#fff', fontWeight: 400 }}>บาท</span>
            </div>
            <div style={{ fontSize: '13px', color: '#e2e8f0', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={15} color="var(--gold-primary)" />
              <span>โอนเงินแล้ว: <strong style={{ color: '#fff' }}>{stats?.highRiskPaidCount ?? 0}</strong> เรื่อง (จากที่ยื่นทั้งหมด {stats?.highRiskClaimCount ?? 0} เรื่อง)</span>
            </div>
          </div>

          {/* Progress Bar & Details */}
          <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)' }}>
              <span>อัตราการโอนเงินสำเร็จ:</span>
              <span style={{ color: 'var(--gold-primary)', fontWeight: 700 }}>
                {stats?.highRiskClaimCount > 0 ? Math.round(((stats.highRiskPaidCount || 0) / stats.highRiskClaimCount) * 100) : 0}%
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${stats?.highRiskClaimCount > 0 ? Math.round(((stats.highRiskPaidCount || 0) / stats.highRiskClaimCount) * 100) : 0}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #d4af37, #10b981)',
                borderRadius: '4px',
                transition: 'width 0.5s ease'
              }}></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px', fontSize: '12px' }}>
              <div style={{ padding: '8px 12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-dim)', display: 'block' }}>ยื่นเสนอทั้งหมด:</span>
                <strong style={{ color: '#fff', fontSize: '14px' }}>{stats?.highRiskClaimCount ?? 0} เรื่อง</strong>
              </div>
              <div style={{ padding: '8px 12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-dim)', display: 'block' }}>วงเงินสิทธิเสนอทั้งหมด:</span>
                <strong style={{ color: 'var(--gold-light)', fontSize: '14px' }}>
                  {stats ? stats.highRiskTotalAmount?.toLocaleString('th-TH') : 0} บ.
                </strong>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: MAIN BREAKDOWN GRIDS: สาเหตุการสูญเสีย & ประเภทกำลังพล */}
      {/* (ความสูงเท่ากับ Card สิทธิสินไหม พร้อมปุ่ม "อ่านต่อ" แสดงเป็น Popup Modal) */}
      {/* ========================================================================= */}
      <div className="grid-cols-2" style={{ marginBottom: '28px' }}>
        {renderBreakdownCard({
          type: 'cause',
          title: 'สถิติตามสาเหตุการสูญเสีย',
          subtitle: 'อัปเดตอัตโนมัติ',
          icon: <Flame size={18} color="var(--amber-warning)" />,
          entries: causeEntries,
          emptyText: 'ยังไม่มีข้อมูลสาเหตุ',
          countColor: 'var(--gold-primary)',
          barGradient: 'linear-gradient(90deg, #d4af37, #ef4444)'
        })}

        {renderBreakdownCard({
          type: 'personnel',
          title: 'สถิติตามประเภทกำลังพล',
          subtitle: 'สัญญาบัตร / ประทวน / อส.ทพ. / พลทหาร',
          icon: <Users size={18} color="var(--gold-primary)" />,
          entries: personnelEntries,
          emptyText: 'ยังไม่มีข้อมูลกำลังพล',
          countColor: '#38bdf8',
          barGradient: 'linear-gradient(90deg, #06b6d4, #10b981)'
        })}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 5: RECENT CLAIMS TABLE & SLA INDICATOR (5 แถวต่อหน้า + Pagination) */}
      {/* ========================================================================= */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '18px', margin: 0, fontWeight: 700 }}>
              รายการคำร้องเสนอล่าสุด & สถานะกรอบเวลา (SLA 30 วัน)
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '4px', margin: '4px 0 0' }}>
              ติดตามสถานะความคืบหน้ารายเรื่องตามขั้นตอน Workflows 5 ระดับ • แสดงหน้าละ {CLAIMS_PER_PAGE} แถว
            </p>
          </div>
          <Link href="/claims" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>ดูรายการทั้งหมดในระบบ</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 14px' }}>เลขที่คำร้อง</th>
                <th style={{ padding: '12px 14px' }}>หน่วยเสนอเรื่อง</th>
                <th style={{ padding: '12px 14px' }}>กำลังพลผู้สูญเสีย</th>
                <th style={{ padding: '12px 14px' }}>ประเภทสินไหม</th>
                <th style={{ padding: '12px 14px' }}>สถานะ Workflow</th>
                <th style={{ padding: '12px 14px' }}>กรอบเวลา SLA 30 วัน</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>ดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {paginatedClaims.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dim)' }}>
                    ยังไม่มีรายการคำร้อง
                  </td>
                </tr>
              ) : (
                paginatedClaims.map((claim) => {
                  const daysDiff = Math.floor((new Date() - new Date(claim.createdAt)) / (1000 * 60 * 60 * 24));
                  const remaining = 30 - daysDiff;
                  const isOverdue = remaining <= 0;
                  const isWarning = remaining > 0 && remaining <= 7;

                  return (
                    <tr key={claim.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                      <td style={{ padding: '14px', fontWeight: 600, color: 'var(--gold-primary)' }}>
                        {claim.trackingCode}
                      </td>
                      <td style={{ padding: '14px', color: 'var(--text-main)' }}>
                        {claim.unitName}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: 600 }}>{claim.casualtyRank} {claim.casualtyFirstName} {claim.casualtyLastName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                          {claim.lossType === 'DECEASED' ? 'เสียชีวิต' : 'พิการทุพพลภาพ'} • {claim.personnelType}
                        </div>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span className={`badge ${claim.claimType === 'HIGH_RISK' ? 'badge-amber' : 'badge-blue'}`}>
                          {claim.claimType === 'HIGH_RISK' ? 'เสี่ยงภัย 300,000 บ.' : 'ยามปกติ 60,000 บ.'}
                        </span>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span className="badge badge-emerald">
                          {claim.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px' }}>
                        {claim.status === 'PAID' || claim.status === 'SK_NOTIFIED' ? (
                          <span className="sla-pill sla-normal">
                            <CheckCircle2 size={12} /> เสร็จสิ้นในกรอบเวลา
                          </span>
                        ) : isOverdue ? (
                          <span className="sla-pill sla-overdue">
                            <AlertTriangle size={12} /> เกินกำหนด {Math.abs(remaining)} วัน (มีเหตุผลชี้แจง)
                          </span>
                        ) : isWarning ? (
                          <span className="sla-pill sla-warning">
                            <Clock size={12} /> ใกล้ครบกำหนด (เหลือ {remaining} วัน)
                          </span>
                        ) : (
                          <span className="sla-pill sla-normal">
                            <Clock size={12} /> ปกติ (เหลือ {remaining} วัน)
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <Link href={`/claims/${claim.id}`} className="btn btn-secondary btn-sm">
                          เปิดดู / ตรวจเรื่อง
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls (แสดงหน้าละ 5 แถว พร้อมปุ่ม หน้าแรก / ก่อนหน้า / เลขหน้า / หน้าถัดไป / หน้าสุดท้าย) */}
        <PaginationBar
          currentPage={safeClaimsPage}
          totalItems={totalClaimsCount}
          itemsPerPage={CLAIMS_PER_PAGE}
          onPageChange={setClaimsPage}
          nextLabel="หน้าต่อไป"
        />
      </div>

      {/* ========================================================================= */}
      {/* POPUP MODAL: อ่านต่อเพื่อดูรายละเอียดทั้งหมด (สาเหตุการสูญเสีย / ประเภทกำลังพล) */}
      {/* ========================================================================= */}
      {statModalType && (
        <div
          onClick={() => setStatModalType(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(2, 8, 12, 0.86)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 120,
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '720px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(4, 20, 23, 0.98)',
              border: `1px solid ${statModalType === 'cause' ? 'var(--amber-warning)' : 'var(--cyan-accent)'}`,
              boxShadow: '0 24px 60px rgba(0,0,0,0.85)',
              borderRadius: '16px',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              background: statModalType === 'cause' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(6, 182, 212, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: statModalType === 'cause' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(6, 182, 212, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {statModalType === 'cause' ? <Flame size={20} color="var(--amber-warning)" /> : <Users size={20} color="var(--gold-primary)" />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#fff' }}>
                    {statModalType === 'cause' ? 'รายละเอียดสถิติตามสาเหตุการสูญเสียทั้งหมด' : 'รายละเอียดสถิติตามประเภทกำลังพลทั้งหมด'}
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                    {selectedFiscalYear === 'ALL' ? 'ข้อมูลสะสมทุกปีงบประมาณ' : `ปีงบประมาณ ${selectedFiscalYear}`} • ทั้งหมด {modalEntries.length} รายการ (จาก {stats?.totalClaims ?? 0} เรื่อง)
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStatModalType(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                title="ปิดหน้าต่าง"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Search Box */}
            <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border-glass)' }}>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder={statModalType === 'cause' ? 'ค้นหาตามสาเหตุการสูญเสีย...' : 'ค้นหาตามประเภทกำลังพล...'}
                  value={statModalSearch}
                  onChange={(e) => setStatModalSearch(e.target.value)}
                  style={{ paddingLeft: '36px', fontSize: '13.5px' }}
                />
              </div>
            </div>

            {/* Modal Body (Scrollable List of All Items) */}
            <div style={{ padding: '18px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredModalEntries.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '30px 0' }}>
                  ไม่พบรายการที่ตรงกับคำค้นหา "{statModalSearch}"
                </p>
              ) : (
                filteredModalEntries.map(([label, count], idx) => {
                  const percent = Math.round((count / totalStatsDenominator) * 100);
                  const isRemainingSection = idx === STATS_PREVIEW_LIMIT && !statModalSearch.trim();
                  const countColor = statModalType === 'cause' ? 'var(--gold-primary)' : '#38bdf8';
                  const barGradient = statModalType === 'cause'
                    ? 'linear-gradient(90deg, #d4af37, #ef4444)'
                    : 'linear-gradient(90deg, #06b6d4, #10b981)';

                  return (
                    <div key={label}>
                      {isRemainingSection && (
                        <div style={{
                          fontSize: '11.5px',
                          color: 'var(--gold-light)',
                          padding: '6px 0 10px',
                          marginBottom: '6px',
                          borderTop: '1px dashed rgba(212, 175, 55, 0.35)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span>📌 รายการเพิ่มเติมที่เหลือ (อันดับที่ {STATS_PREVIEW_LIMIT + 1} เป็นต้นไป)</span>
                        </div>
                      )}
                      <div style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: idx < STATS_PREVIEW_LIMIT && !statModalSearch.trim() ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.015)',
                        border: '1px solid var(--border-glass)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', fontSize: '13.5px', marginBottom: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                            <span style={{
                              minWidth: '28px',
                              height: '22px',
                              padding: '0 6px',
                              borderRadius: '6px',
                              background: idx < 3 ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                              color: idx < 3 ? 'var(--gold-primary)' : 'var(--text-dim)',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              #{idx + 1}
                            </span>
                            <span style={{ color: '#fff', fontWeight: 500, wordBreak: 'break-word' }}>{label}</span>
                          </div>
                          <span style={{ fontWeight: 700, color: countColor, whiteSpace: 'nowrap', flexShrink: 0 }}>
                            {count} เรื่อง ({percent}%)
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${percent}%`, height: '100%', background: barGradient, borderRadius: '4px' }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '14px 24px',
              borderTop: '1px solid var(--border-glass)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(3, 16, 19, 0.95)',
              fontSize: '12.5px',
              color: 'var(--text-dim)'
            }}>
              <span>แสดง {filteredModalEntries.length} จากทั้งหมด {modalEntries.length} รายการ</span>
              <button
                type="button"
                onClick={() => setStatModalType(null)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '6px 18px' }}
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
