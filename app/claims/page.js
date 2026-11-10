// app/claims/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Search, 
  Filter, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight,
  Shield,
  Building,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { formatThaiDate } from '@/lib/thai-utils';
import { CLAIM_STATUS } from '@/lib/constants';

export default function ClaimsListPage() {
  const [claims, setClaims] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [slaFilter, setSlaFilter] = useState('ALL');

  useEffect(() => {
    const handleAuth = () => {
      const saved = localStorage.getItem('rta_user');
      let user = null;
      if (saved) {
        try {
          user = JSON.parse(saved);
          setCurrentUser(user);
        } catch (e) {}
      } else {
        setCurrentUser(null);
      }
      loadClaims(user);
    };

    handleAuth();
    window.addEventListener('rta_auth_change', handleAuth);
    return () => window.removeEventListener('rta_auth_change', handleAuth);
  }, []);

  const loadClaims = async (user) => {
    setLoading(true);
    try {
      const url = user?.id ? `/api/claims?userId=${user.id}` : '/api/claims';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setClaims(data.claims);
        setFilteredClaims(data.claims);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...claims];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.trackingCode.toLowerCase().includes(q) ||
          c.casualtyFirstName.toLowerCase().includes(q) ||
          c.casualtyLastName.toLowerCase().includes(q) ||
          c.casualtyCitizenId.includes(q) ||
          c.unitName.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter((c) => c.status === statusFilter);
    }

    // SLA filter
    if (slaFilter !== 'ALL') {
      const now = new Date();
      result = result.filter((c) => {
        const created = new Date(c.createdAt);
        const days = Math.floor((now - created) / (1000 * 60 * 60 * 24));
        const remaining = 30 - days;

        if (slaFilter === 'OVERDUE') return remaining <= 0 && c.status !== 'SK_NOTIFIED' && c.status !== 'PAID';
        if (slaFilter === 'WARNING') return remaining > 0 && remaining <= 7 && c.status !== 'SK_NOTIFIED' && c.status !== 'PAID';
        if (slaFilter === 'NORMAL') return remaining > 7 || c.status === 'PAID' || c.status === 'SK_NOTIFIED';
        return true;
      });
    }

    setFilteredClaims(result);
  }, [searchQuery, statusFilter, slaFilter, claims]);

  return (
    <div className="container" style={{ paddingTop: '28px' }}>
      
      {/* Header & Scoping Notice */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>รายการคำร้องเสนอขอรับสิทธิเงินค่าสินไหมทดแทน</span>
            {currentUser?.role === 'UNIT_OFFICER' ? (
              <span className="badge badge-amber" style={{ fontSize: '12px' }}>
                เฉพาะโครงสร้างสังกัด: {currentUser.unitName}
              </span>
            ) : (
              <span className="badge badge-blue" style={{ fontSize: '12px' }}>
                มุมมองส่วนกลาง (ทุกหน่วยทั่วประเทศ)
              </span>
            )}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            {currentUser?.role === 'UNIT_OFFICER'
              ? `ระบบจำกัดสิทธิ์ (RBAC) ให้มองเห็นเฉพาะรายงานภายในโครงสร้างสายการบังคับบัญชาของ ${currentUser.unitName || 'สังกัดตนเอง'} เท่านั้น ไม่สามารถดูรายงานของหน่วยอื่นได้`
              : 'ตรวจสอบและกำกับดูแลภาพรวม ติดตามสถานะ Workflows 5 ขั้นตอน และกรอบเวลา SLA 30 วัน'}
          </p>
        </div>

        <Link href="/submit" className="btn btn-primary">
          <span>+ ยื่นเสนอเรื่องใหม่</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '18px 24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Search Box */}
          <div style={{ flex: '1 1 280px', position: 'relative' }}>
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', top: '14px', left: '12px' }} />
            <input 
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px' }}
              placeholder="ค้นหา: เลขที่เรื่อง, ชื่อผู้สูญเสีย, เลข ปชช., หน่วย..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Workflow Status Filter */}
          <div style={{ minWidth: '220px' }}>
            <select 
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">สถานะทั้งหมด</option>
              <option value="SUBMITTED">1. เสนอเรื่องใหม่</option>
              <option value="UNDER_REVIEW">2. กสพ. กำลังตรวจเอกสาร</option>
              <option value="REJECTED_BY_KSP">ตีกลับให้หน่วยแก้ไข</option>
              <option value="PENDING_APPROVAL">3. รอ จก.กพ.ทบ. อนุมัติ</option>
              <option value="APPROVED">อนุมัติแล้ว</option>
              <option value="INSURANCE_PROCESSING">4. บ.ประกันภัย กำลังตรวจ</option>
              <option value="PAID">โอนเงินสินไหมแล้ว</option>
              <option value="SK_NOTIFIED">5. สก.ทบ. รับทราบยอด (ปิดเรื่อง)</option>
            </select>
          </div>

          {/* SLA Filter */}
          <div style={{ minWidth: '180px' }}>
            <select 
              className="form-select"
              value={slaFilter}
              onChange={(e) => setSlaFilter(e.target.value)}
            >
              <option value="ALL">กรอบเวลา SLA ทั้งหมด</option>
              <option value="OVERDUE">⚠️ เกิน 30 วัน (Overdue)</option>
              <option value="WARNING">⏳ ใกล้ครบกำหนด (เหลือ &lt; 7 วัน)</option>
              <option value="NORMAL">✓ ปกติ / เสร็จสิ้น</option>
            </select>
          </div>

        </div>
      </div>

      {/* Claims List Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>กำลังโหลดรายการคำร้อง...</div>
        ) : filteredClaims.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)' }}>
            <FileText size={42} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <div>ไม่พบข้อมูลคำร้องตามเงื่อนไขที่ค้นหา</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 14px' }}>เลขที่คำร้อง</th>
                  <th style={{ padding: '12px 14px' }}>วันที่เสนอ</th>
                  <th style={{ padding: '12px 14px' }}>หน่วยสังกัด</th>
                  <th style={{ padding: '12px 14px' }}>ผู้สูญเสีย</th>
                  <th style={{ padding: '12px 14px' }}>ประเภทสินไหม</th>
                  <th style={{ padding: '12px 14px' }}>ขั้นตอน Workflow</th>
                  <th style={{ padding: '12px 14px' }}>กรอบเวลา SLA</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>ดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.map((claim) => {
                  const daysDiff = Math.floor((new Date() - new Date(claim.createdAt)) / (1000 * 60 * 60 * 24));
                  const remaining = 30 - daysDiff;
                  const isOverdue = remaining <= 0;
                  const isWarning = remaining > 0 && remaining <= 7;

                  return (
                    <tr key={claim.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                      <td style={{ padding: '14px', fontWeight: 600, color: 'var(--gold-primary)' }}>
                        {claim.trackingCode}
                      </td>
                      <td style={{ padding: '14px', color: 'var(--text-muted)', fontSize: '13px' }}>
                        {formatThaiDate(claim.createdAt, true)}
                      </td>
                      <td style={{ padding: '14px', color: 'var(--text-main)' }}>
                        <div style={{ fontWeight: 500 }}>{claim.unitName}</div>
                        {claim.unitPath && claim.unitPath !== claim.unitName && (
                          <div style={{ fontSize: '11px', color: 'var(--gold-light)', marginTop: '2px' }}>
                            {claim.unitPath}
                          </div>
                        )}
                        <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>ผู้เสนอ: {claim.reporterName}</div>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: 600 }}>{claim.casualtyRank} {claim.casualtyFirstName} {claim.casualtyLastName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                          ปชช. {claim.casualtyCitizenId} • {claim.lossType === 'DECEASED' ? 'เสียชีวิต' : 'พิการทุพพลภาพ'}
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
                        {claim.status === 'REJECTED_BY_KSP' && (
                          <div style={{ fontSize: '11px', color: 'var(--ruby-danger)', marginTop: '4px' }}>
                            * กสพ. แจ้งให้แก้ไขเอกสาร
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px' }}>
                        {claim.status === 'PAID' || claim.status === 'SK_NOTIFIED' ? (
                          <span className="sla-pill sla-normal">
                            <CheckCircle2 size={12} /> เสร็จสิ้น
                          </span>
                        ) : isOverdue ? (
                          <div>
                            <span className="sla-pill sla-overdue">
                              <AlertTriangle size={12} /> เกิน SLA {Math.abs(remaining)} วัน
                            </span>
                            {claim.delayReason ? (
                              <div style={{ fontSize: '11px', color: 'var(--emerald-success)', marginTop: '3px' }}>
                                ✓ ชี้แจงเหตุผลแล้ว
                              </div>
                            ) : (
                              <div style={{ fontSize: '11px', color: 'var(--ruby-danger)', marginTop: '3px' }}>
                                ⚠️ รอแนบเหตุผลล่าช้า
                              </div>
                            )}
                          </div>
                        ) : isWarning ? (
                          <span className="sla-pill sla-warning">
                            <Clock size={12} /> เหลือ {remaining} วัน (ใกล้ครบ)
                          </span>
                        ) : (
                          <span className="sla-pill sla-normal">
                            <Clock size={12} /> เหลือ {remaining} วัน
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <Link 
                          href={`/claims/${claim.id}`} 
                          className={`btn btn-sm ${
                            (currentUser?.role === 'INSURANCE_REP' && claim.status !== 'PAID' && claim.status !== 'SK_NOTIFIED') ||
                            (currentUser?.role === 'KSP_OFFICER' && (claim.status === 'SUBMITTED' || claim.status === 'UNDER_REVIEW'))
                              ? 'btn-primary' 
                              : 'btn-secondary'
                          }`}
                        >
                          {currentUser?.role === 'INSURANCE_REP' 
                            ? (claim.status === 'PAID' || claim.status === 'SK_NOTIFIED' ? 'ดูหลักฐานโอน' : '🔍 ตรวจเอกสาร/โอนเงิน') 
                            : currentUser?.role === 'KSP_OFFICER'
                            ? (claim.status === 'SUBMITTED' || claim.status === 'UNDER_REVIEW' ? '🔍 พรีวิว & ตรวจเอกสาร' : 'ตรวจสอบคำร้อง')
                            : 'จัดการเรื่อง'}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
