// app/dashboard/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { io } from 'socket.io-client';
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
  Send
} from 'lucide-react';
import { formatThaiDate } from '@/lib/thai-utils';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentClaims, setRecentClaims] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);

  useEffect(() => {
    let user = null;
    const saved = localStorage.getItem('rta_user');
    if (saved) {
      try { 
        user = JSON.parse(saved);
        setCurrentUser(user); 
      } catch (e) {}
    }

    loadDashboardData(user);

    const handleAuth = () => {
      let u = null;
      const s = localStorage.getItem('rta_user');
      if (s) {
        try { u = JSON.parse(s); } catch (e) {}
      }
      setCurrentUser(u);
      loadDashboardData(u);
    };
    window.addEventListener('rta_auth_change', handleAuth);

    // เชื่อมต่อ Socket.io สำหรับ Live Dashboard
    const socket = io();

    socket.on('connect', () => {
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    socket.on('stats_updated', (newStats) => {
      setStats(newStats);
      setLastEvent('อัปเดตสถิติสดล่าสุด ' + new Date().toLocaleTimeString('th-TH'));
    });

    socket.on('claim_created', (claim) => {
      setRecentClaims((prev) => [claim, ...prev.slice(0, 4)]);
      setLastEvent(`มีเรื่องเสนอใหม่: ${claim.trackingCode}`);
    });

    socket.on('claim_updated', ({ id, claim }) => {
      setRecentClaims((prev) => prev.map((c) => (c.id === id ? claim : c)));
      setLastEvent(`อัปเดตสถานะคำร้อง ${claim.trackingCode}`);
    });

    return () => {
      window.removeEventListener('rta_auth_change', handleAuth);
      socket.disconnect();
    };
  }, []);

  const loadDashboardData = async (user = currentUser) => {
    try {
      const claimsUrl = user?.id ? `/api/claims?userId=${user.id}` : '/api/claims';
      const [resStats, resClaims] = await Promise.all([
        fetch('/api/stats').then((r) => r.json()),
        fetch(claimsUrl).then((r) => r.json())
      ]);

      if (resStats.success) setStats(resStats.stats);
      if (resClaims.success) setRecentClaims(resClaims.claims.slice(0, 5));
    } catch (e) {
      console.error('Error fetching dashboard', e);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '28px' }}>
      
      {/* Top Banner & Real-time Status */}
      <div className="glass-panel" style={{
        padding: '24px 28px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        borderLeft: '4px solid var(--gold-primary)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px' }}>ศูนย์บริหารจัดการสิทธิเงินค่าสินไหมทดแทนกำลังพล ทบ.</h1>
            <span className="badge badge-emerald" style={{ fontSize: '11px' }}>
              <span className="live-dot"></span>
              {socketConnected ? 'Live Socket.io เชื่อมต่อแล้ว' : 'กำลังเชื่อมต่อ Live...'}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            ระบบประมวลผลสถิติแบบเรียลไทม์ • กรอบเวลาดำเนินเรื่องตาม SLA 30 วัน • บูรณาการ กพ.ทบ., สก.ทบ. และบริษัทประกันภัย
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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

      {lastEvent && (
        <div style={{
          background: 'rgba(212, 175, 55, 0.15)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '8px 16px',
          marginBottom: '24px',
          fontSize: '13px',
          color: 'var(--gold-light)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Activity size={16} color="var(--gold-primary)" />
          <span>⚡ การเปลี่ยนแปลงแบบสด: {lastEvent}</span>
        </div>
      )}

      {/* 4 Summary Metric Cards */}
      <div className="grid-cols-4" style={{ marginBottom: '28px' }}>
        
        {/* ผู้เสียชีวิต */}
        <div className="glass-panel" style={{ padding: '20px', borderTop: '3px solid var(--ruby-danger)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>ผู้เสียชีวิต (กำลังพล)</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#fff', marginTop: '6px' }}>
                {stats?.deceasedCount ?? 0} <span style={{ fontSize: '15px', color: 'var(--text-dim)', fontWeight: 400 }}>นาย</span>
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HeartCrack size={22} color="#f87171" />
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '10px' }}>
            ครอบคลุมทั้งยามปกติและปฏิบัติราชการสนาม
          </div>
        </div>

        {/* พิการทุพพลภาพ */}
        <div className="glass-panel" style={{ padding: '20px', borderTop: '3px solid var(--amber-warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>พิการทุพพลภาพ</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#fff', marginTop: '6px' }}>
                {stats?.disabledCount ?? 0} <span style={{ fontSize: '15px', color: 'var(--text-dim)', fontWeight: 400 }}>นาย</span>
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Accessibility size={22} color="#fbbf24" />
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '10px' }}>
            มีคำสั่งปลด/ประเมินสมรรถภาพทางการแพทย์
          </div>
        </div>

        {/* ยอดเงินสินไหมที่จ่ายแล้ว */}
        <div className="glass-panel" style={{ padding: '20px', borderTop: '3px solid var(--emerald-success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>ยอดเงินสินไหมจ่ายแล้ว</div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#34d399', marginTop: '6px' }}>
                {stats ? stats.totalPaidAmount.toLocaleString('th-TH') : 0} <span style={{ fontSize: '15px', color: 'var(--text-dim)', fontWeight: 400 }}>บาท</span>
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Coins size={22} color="#34d399" />
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '10px' }}>
            โอนเข้าบัญชีทายาทโดย บ.ประกันภัย
          </div>
        </div>

        {/* เรื่องค้างดำเนินการ & SLA Alert */}
        <div className="glass-panel" style={{ padding: '20px', borderTop: '3px solid var(--cyan-accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>กำลังดำเนินการ / เกิน SLA</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#fff', marginTop: '6px' }}>
                {stats?.pendingCount ?? 0} <span style={{ fontSize: '14px', color: stats?.overdueCount > 0 ? '#f87171' : 'var(--text-dim)', fontWeight: 500 }}>({stats?.overdueCount ?? 0} เกิน 30 วัน)</span>
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={22} color="#38bdf8" />
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '10px' }}>
            แจ้งเตือนล่วงหน้า 7 วัน และบันทึกเหตุผลล่าช้า
          </div>
        </div>

      </div>

      {/* Main Breakdown Grids: สาเหตุการสูญเสีย & ประเภทกำลังพล */}
      <div className="grid-cols-2" style={{ marginBottom: '28px' }}>
        
        {/* สาเหตุการสูญเสีย */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h2 style={{ fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={18} color="var(--amber-warning)" />
              <span>สถิติตามสาเหตุการสูญเสีย</span>
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>อัปเดตอัตโนมัติ</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats && Object.keys(stats.causeStats).length > 0 ? (
              Object.entries(stats.causeStats).map(([cause, count]) => {
                const percent = Math.round((count / (stats.totalClaims || 1)) * 100);
                return (
                  <div key={cause}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', marginBottom: '5px' }}>
                      <span style={{ color: 'var(--text-main)' }}>{cause}</span>
                      <span style={{ fontWeight: 600, color: 'var(--gold-primary)' }}>{count} เรื่อง ({percent}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, #d4af37, #ef4444)', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px 0' }}>ยังไม่มีข้อมูลสาเหตุ</p>
            )}
          </div>
        </div>

        {/* ประเภทกำลังพล */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h2 style={{ fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="var(--gold-primary)" />
              <span>สถิติตามประเภทกำลังพล</span>
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>สัญญาบัตร / ประทวน / อส.ทพ. / พลทหาร</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats && Object.keys(stats.personnelStats).length > 0 ? (
              Object.entries(stats.personnelStats).map(([pType, count]) => {
                const percent = Math.round((count / (stats.totalClaims || 1)) * 100);
                return (
                  <div key={pType}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', marginBottom: '5px' }}>
                      <span style={{ color: 'var(--text-main)' }}>{pType}</span>
                      <span style={{ fontWeight: 600, color: '#38bdf8' }}>{count} เรื่อง ({percent}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, #06b6d4, #10b981)', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px 0' }}>ยังไม่มีข้อมูลกำลังพล</p>
            )}
          </div>
        </div>

      </div>

      {/* Recent Claims Table & SLA Indicator */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '18px' }}>รายการคำร้องเสนอล่าสุด & สถานะกรอบเวลา (SLA)</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
              ติดตามสถานะความคืบหน้ารายเรื่องตามขั้นตอน Workflows 5 ระดับ
            </p>
          </div>
          <Link href="/claims" className="btn btn-secondary btn-sm">
            <span>ดูรายการทั้งหมด</span>
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
              {recentClaims.map((claim) => {
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
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
