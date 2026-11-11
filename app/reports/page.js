// app/reports/page.js - ระบบรายงานสถิติเปรียบเทียบรายเดือน (1 เม.ย. - 31 มี.ค.) เทียบย้อนหลัง 3 ปี ประเภทกำลังพล และ 10 อันดับหน่วยสูญเสีย
'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  Printer,
  Download,
  HeartCrack,
  Accessibility,
  Coins,
  TrendingUp,
  TrendingDown,
  Flame,
  Users,
  Award,
  Building2,
  Info,
  RotateCcw
} from 'lucide-react';
import { getPolicyYear } from '@/lib/thai-utils';

const YEAR_COLORS = [
  { gradient: 'linear-gradient(180deg, #fef08a 0%, #d4af37 100%)', solid: '#d4af37', text: 'var(--gold-primary)' },
  { gradient: 'linear-gradient(180deg, #67e8f9 0%, #0284c7 100%)', solid: '#06b6d4', text: 'var(--cyan-accent)' },
  { gradient: 'linear-gradient(180deg, #d8b4fe 0%, #7e22ce 100%)', solid: '#a855f7', text: '#d8b4fe' },
  { gradient: 'linear-gradient(180deg, #6ee7b7 0%, #059669 100%)', solid: '#10b981', text: '#34d399' }
];

const getDefaultCompareYears = (baseYear) => [baseYear - 1, baseYear - 2, baseYear - 3];

const sumCompareYearMetrics = (rows, yr) =>
  rows.reduce(
    (acc, m) => {
      const c = m.compareByYear?.[yr];
      if (!c) return acc;
      acc.total += c.total || 0;
      acc.normal += c.normal || 0;
      acc.highRisk += c.highRisk || 0;
      acc.normalAmount += c.normalAmount || 0;
      acc.highRiskAmount += c.highRiskAmount || 0;
      acc.totalAmount += c.totalAmount || 0;
      return acc;
    },
    { total: 0, normal: 0, highRisk: 0, normalAmount: 0, highRiskAmount: 0, totalAmount: 0 }
  );

function ClaimTypeCell({ count = 0, amount = 0, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.3 }}>
      <strong style={{ color: count > 0 ? color : 'var(--text-dim)' }}>{count} ราย</strong>
      <span style={{ fontSize: '11px', color: amount > 0 ? 'var(--text-muted)' : 'var(--text-dim)', fontWeight: 400 }}>
        {amount > 0 ? `${amount.toLocaleString()} บ.` : '-'}
      </span>
    </div>
  );
}

function CompareClaimTypeSplit({ normal = 0, highRisk = 0, normalAmount = 0, highRiskAmount = 0, showZero = false }) {
  if (!showZero && normal === 0 && highRisk === 0) {
    return null;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', marginTop: '4px', fontSize: '10.5px', lineHeight: 1.35, fontWeight: 400 }}>
      <span
        title={`ยามปกติ 60,000 บาท: ${normal} ราย (${normalAmount.toLocaleString()} บาท)`}
        style={{ color: normal > 0 ? '#22d3ee' : 'var(--text-dim)', whiteSpace: 'nowrap' }}
      >
        ปกติ 60,000: <strong style={{ fontWeight: 600 }}>{normal}</strong>
      </span>
      <span
        title={`ปฏิบัติหน้าที่สำคัญ / หน้าที่เสี่ยงภัย 300,000 บาท: ${highRisk} ราย (${highRiskAmount.toLocaleString()} บาท)`}
        style={{ color: highRisk > 0 ? 'var(--gold-primary)' : 'var(--text-dim)', whiteSpace: 'nowrap' }}
      >
        สำคัญ/เสี่ยงภัย 300,000: <strong style={{ fontWeight: 600 }}>{highRisk}</strong>
      </span>
    </div>
  );
}

export default function ReportsPage() {
  const initialPolicyYear = getPolicyYear(new Date()) || 2570;

  const [stats, setStats] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // รอบปีหลัก (1 เม.ย. ปีก่อน - 31 มี.ค. ปีถัดไป) และปีเทียบย้อนหลังได้สูงสุด 3 ปี
  const [selectedPolicyYear, setSelectedPolicyYear] = useState(initialPolicyYear);
  const [compareYears, setCompareYears] = useState(getDefaultCompareYears(initialPolicyYear));

  // View & Metric Modes
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly' | 'yearly'
  const [metricMode, setMetricMode] = useState('compare'); // 'compare' | 'lossType' | 'claimType' | 'amount'
  const [topUnitsScope, setTopUnitsScope] = useState('active'); // 'active' | 'combined'
  const [hoveredMonth, setHoveredMonth] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('rta_user');
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch (e) {}
    }

    const handleAuth = () => {
      let userObj = null;
      const s = localStorage.getItem('rta_user');
      if (s) {
        try {
          userObj = JSON.parse(s);
        } catch (e) {}
      }
      setCurrentUser(userObj);
    };
    window.addEventListener('rta_auth_change', handleAuth);
    return () => window.removeEventListener('rta_auth_change', handleAuth);
  }, []);

  useEffect(() => {
    loadReportsData(selectedPolicyYear, compareYears);
  }, [selectedPolicyYear, compareYears]);

  const loadReportsData = async (baseYear, compYears) => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      q.append('periodType', 'policy');
      if (baseYear) q.append('fiscalYear', String(baseYear));
      if (Array.isArray(compYears) && compYears.length > 0) {
        q.append('compareFiscalYear', String(compYears[0]));
        q.append('compareYears', compYears.join(','));
      }

      const resStats = await fetch(`/api/stats?${q.toString()}`, { cache: 'no-store' }).then((r) => r.json());
      if (resStats.success && resStats.stats) {
        setStats(resStats.stats);
      }
    } catch (e) {
      console.error('Error loading reports:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleBaseYearChange = (newBaseYear) => {
    const yr = Number(newBaseYear);
    setSelectedPolicyYear(yr);
    setCompareYears(getDefaultCompareYears(yr));
  };

  const toggleCompareYear = (yr) => {
    const numYr = Number(yr);
    if (numYr === selectedPolicyYear) return;
    setCompareYears((prev) => {
      if (prev.includes(numYr)) {
        // คงไว้อย่างน้อย 1 ปีเทียบ หรือยกเลิกได้
        const next = prev.filter((y) => y !== numYr);
        return next.length > 0 ? next : [selectedPolicyYear - 1];
      }
      // เลือกเทียบย้อนหลังได้สูงสุด 3 ปี
      const merged = [...prev, numYr].sort((a, b) => b - a).slice(0, 3);
      return merged;
    });
  };

  const handleReset3Years = () => {
    setCompareYears(getDefaultCompareYears(selectedPolicyYear));
  };

  const handlePrint = () => {
    window.print();
  };

  const activeCompareYears = (stats?.compareYears || compareYears).slice(0, 3);
  const allSeriesYears = [selectedPolicyYear, ...activeCompareYears];

  // รายชื่อปีทั้งหมดที่เลือกเทียบได้ (ปีที่มีข้อมูล + ย้อนหลัง 3 ปีจากปีที่เลือก)
  const rawAvailable = stats?.availableFiscalYears || [2570, 2569, 2568, 2567];
  const candidateYearsSet = new Set([
    ...rawAvailable,
    selectedPolicyYear,
    selectedPolicyYear - 1,
    selectedPolicyYear - 2,
    selectedPolicyYear - 3
  ]);
  const selectableBaseYears = Array.from(candidateYearsSet).sort((a, b) => b - a);
  const selectableCompareCandidates = selectableBaseYears.filter((y) => y !== selectedPolicyYear);

  const handleExportCSV = () => {
    if (!stats || !stats.fiscalMonthlyStats) return;

    const compHeaders = activeCompareYears.flatMap((yr) => [
      `รอบปี ${yr - 1}/${yr} รวม (เรื่อง)`,
      `รอบปี ${yr - 1}/${yr} ยามปกติ 60,000 (เรื่อง)`,
      `รอบปี ${yr - 1}/${yr} ยามปกติ 60,000 (บาท)`,
      `รอบปี ${yr - 1}/${yr} สำคัญ/เสี่ยงภัย 300,000 (เรื่อง)`,
      `รอบปี ${yr - 1}/${yr} สำคัญ/เสี่ยงภัย 300,000 (บาท)`,
      `รอบปี ${yr - 1}/${yr} วงเงินรวม (บาท)`
    ]);

    const headers = [
      'ลำดับเดือน',
      'เดือน',
      `รอบปีหลัก ${selectedPolicyYear - 1}/${selectedPolicyYear} (เรื่อง)`,
      'เสียชีวิต',
      'พิการทุพพลภาพ',
      'ยามปกติ 60,000 (เรื่อง)',
      'ยามปกติ 60,000 (บาท)',
      'ปฏิบัติหน้าที่สำคัญ/เสี่ยงภัย 300,000 (เรื่อง)',
      'ปฏิบัติหน้าที่สำคัญ/เสี่ยงภัย 300,000 (บาท)',
      'วงเงินรวมปีหลัก (บาท)',
      ...compHeaders
    ];

    const monthlyRows = stats.fiscalMonthlyStats.map((m) => {
      const compCols = activeCompareYears.flatMap((yr) => {
        const c = m.compareByYear?.[yr] || {
          total: 0,
          normal: 0,
          normalAmount: 0,
          highRisk: 0,
          highRiskAmount: 0,
          totalAmount: 0
        };
        return [c.total, c.normal || 0, c.normalAmount || 0, c.highRisk || 0, c.highRiskAmount || 0, c.totalAmount];
      });
      return [
        m.fiscalOrder,
        `${m.fullName} ${m.calYearBE}`,
        m.total,
        m.deceased,
        m.disabled,
        m.normal,
        m.normalAmount || 0,
        m.highRisk,
        m.highRiskAmount || 0,
        m.totalAmount,
        ...compCols
      ];
    });

    // เพิ่มตารางสรุปตามประเภทกำลังพลและ 10 อันดับหน่วยสูญเสียต่อท้าย CSV
    const personnelSection = [
      [],
      ['=== สรุปการสูญเสียจำแนกตามประเภทกำลังพล ทบ. ==='],
      ['ประเภทกำลังพล', `รวมปีหลัก (${selectedPolicyYear})`, 'เสียชีวิต', 'พิการทุพพลภาพ', 'ปกติ (60k)', 'เสี่ยงภัย (300k)', 'วงเงินรวม (บาท)', ...activeCompareYears.map((yr) => `รอบปี ${yr - 1}/${yr} (นาย)`)],
      ...(stats.personnelReport || []).map((p) => [
        p.category,
        p.total,
        p.deceased,
        p.disabled,
        p.normal,
        p.highRisk,
        p.totalAmount,
        ...activeCompareYears.map((yr) => p.compareByYear?.[yr]?.total || 0)
      ])
    ];

    const unitsList = topUnitsScope === 'combined' ? (stats.topUnitsCombined || []) : (stats.topUnits || []);
    const unitsSection = [
      [],
      [`=== 10 อันดับหน่วย/สังกัดที่สูญเสียมากสุด (${topUnitsScope === 'combined' ? 'รวมปีหลักและย้อนหลัง 3 ปี' : `รอบปี ${selectedPolicyYear - 1}/${selectedPolicyYear}`}) ===`],
      ['อันดับ', 'หน่วย / สังกัด', 'รวม (นาย/เรื่อง)', 'เสียชีวิต', 'พิการทุพพลภาพ', 'วงเงินรวม (บาท)', ...activeCompareYears.map((yr) => `รอบปี ${yr - 1}/${yr}`)],
      ...unitsList.map((u) => [
        u.rank,
        u.unitName,
        u.total,
        u.deceased,
        u.disabled,
        u.totalAmount,
        ...activeCompareYears.map((yr) => u.compareByYear?.[yr]?.total || 0)
      ])
    ];

    const allLines = [
      headers.join(','),
      ...monthlyRows.map((r) => r.join(',')),
      ...personnelSection.map((r) => r.join(',')),
      ...unitsSection.map((r) => r.join(','))
    ];

    const csvContent = '\uFEFF' + allLines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `สถิติสินไหม_1เมย-31มีค_รอบปี_${selectedPolicyYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const monthlyData = stats?.fiscalMonthlyStats || [];
  const personnelReport = stats?.personnelReport || [];
  const topUnitsList = topUnitsScope === 'combined' ? (stats?.topUnitsCombined || []) : (stats?.topUnits || []);
  const primaryCompareYear = activeCompareYears[0];

  return (
    <div className="container" style={{ paddingTop: '28px', paddingBottom: '60px' }}>

      {/* Header & Export Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 size={24} color="var(--gold-primary)" />
            <span>รายงานสถิติการเสนอขอรับสิทธิเงินค่าสินไหมทดแทน ทบ.</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            เรียงเดือนตามรอบปีกรมธรรม์ (1 เม.ย. ปีก่อน ถึง 31 มี.ค. ปีถัดไป) • เทียบย้อนหลังได้ 3 ปี • จำแนกประเภทกำลังพล • 10 อันดับหน่วยสูญเสีย
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleExportCSV} className="btn btn-secondary btn-sm" title="ส่งออกรายงานทั้งหมดเป็น CSV">
            <Download size={15} /> <span>ส่งออก CSV</span>
          </button>
          <button onClick={handlePrint} className="btn btn-primary btn-sm">
            <Printer size={15} /> <span>พิมพ์รายงานสรุป</span>
          </button>
        </div>
      </div>

      {/* Policy Year Filter & 3-Year Backward Comparison Selector */}
      <div className="glass-panel" style={{ padding: '18px 22px', marginBottom: '26px', borderLeft: '4px solid var(--gold-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '18px' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            {/* Row 1: Primary Policy Year */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={17} color="var(--gold-primary)" />
                <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#fff' }}>รอบปีหลัก (1 เม.ย. - 31 มี.ค.):</span>
                <select
                  className="form-select"
                  value={selectedPolicyYear}
                  onChange={(e) => handleBaseYearChange(e.target.value)}
                  style={{ width: '240px', padding: '6px 10px', fontSize: '13px' }}
                >
                  {selectableBaseYears.map((yr) => (
                    <option key={yr} value={yr}>
                      รอบปี {yr - 1}/{yr} (1 เม.ย. {yr - 1} - 31 มี.ค. {yr})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--gold-light)', background: 'rgba(212, 175, 55, 0.1)', padding: '5px 12px', borderRadius: '20px', border: '1px solid var(--border-subtle)' }}>
                ช่วงเวลาหลัก: <strong>1 เม.ย. {selectedPolicyYear - 1} - 31 มี.ค. {selectedPolicyYear}</strong>
              </div>
            </div>

            {/* Row 2: 3-Year Backward Comparison Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
                เลือกปีเทียบย้อนหลัง (สูงสุด 3 ปี):
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {selectableCompareCandidates.slice(0, 6).map((yr) => {
                  const isChecked = activeCompareYears.includes(yr);
                  const seriesIdx = activeCompareYears.indexOf(yr) + 1;
                  const colorInfo = seriesIdx > 0 ? YEAR_COLORS[seriesIdx] : null;
                  const diffYears = selectedPolicyYear - yr;

                  return (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => toggleCompareYear(yr)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '8px',
                        fontSize: '12.5px',
                        fontWeight: isChecked ? 700 : 500,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        border: isChecked ? `1.5px solid ${colorInfo?.solid || 'var(--cyan-accent)'}` : '1px solid var(--border-subtle)',
                        background: isChecked ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                        color: isChecked ? '#fff' : 'var(--text-dim)',
                        transition: 'all 0.15s ease'
                      }}
                      title={`คลิกเพื่อเลือก/ยกเลิกเทียบรอบปี ${yr - 1}/${yr}`}
                    >
                      <span style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '3px',
                        background: isChecked ? (colorInfo?.solid || 'var(--cyan-accent)') : 'rgba(255,255,255,0.18)'
                      }}></span>
                      <span>
                        1 เม.ย. {yr - 1} - 31 มี.ค. {yr}
                        {diffYears > 0 && diffYears <= 3 ? ` (ย้อนหลัง ${diffYears} ปี)` : ''}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleReset3Years}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '11.5px', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                title="เลือกเทียบย้อนหลัง 3 ปีอัตโนมัติ"
              >
                <RotateCcw size={12} />
                <span>เทียบย้อนหลัง 3 ปี</span>
              </button>
            </div>
          </div>

          {/* View Mode Toggle: รายเดือน vs รายปี */}
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            <button
              onClick={() => setViewMode('monthly')}
              className={`btn btn-sm ${viewMode === 'monthly' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '12.5px' }}
            >
              <span>📊 เทียบรายเดือน (เม.ย.-มี.ค.)</span>
            </button>
            <button
              onClick={() => setViewMode('yearly')}
              className={`btn btn-sm ${viewMode === 'yearly' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '12.5px' }}
            >
              <span>📈 ภาพรวมหลายรอบปี</span>
            </button>
          </div>

        </div>
      </div>

      {/* Top 4 KPI Summary Cards for Selected Policy Year */}
      <div className="grid-cols-4" style={{ marginBottom: '28px', gap: '16px' }}>

        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--cyan-accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                ยอดสูญเสียรอบปี {selectedPolicyYear - 1}/{selectedPolicyYear}
              </div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                {stats?.totalClaims ?? 0} <span style={{ fontSize: '14px', color: 'var(--text-dim)', fontWeight: 400 }}>เรื่อง</span>
              </div>
            </div>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={20} color="var(--cyan-accent)" />
            </div>
          </div>
          <div style={{ fontSize: '12px', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {stats?.comparisonSummary?.diff >= 0 ? (
              <span style={{ color: 'var(--ruby-danger)', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
                <TrendingUp size={13} /> +{stats.comparisonSummary.diff} เรื่อง (+{stats.comparisonSummary.growthRate}%)
              </span>
            ) : (
              <span style={{ color: 'var(--emerald-success)', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
                <TrendingDown size={13} /> {stats?.comparisonSummary?.diff} เรื่อง ({stats?.comparisonSummary?.growthRate}%)
              </span>
            )}
            <span style={{ color: 'var(--text-dim)' }}>เทียบ {primaryCompareYear - 1}/{primaryCompareYear}</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--ruby-danger)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>ผู้เสียชีวิตในหน้าที่</div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#f87171', marginTop: '4px' }}>
                {stats?.deceasedCount ?? 0} <span style={{ fontSize: '14px', color: 'var(--text-dim)', fontWeight: 400 }}>นาย</span>
              </div>
            </div>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HeartCrack size={20} color="#f87171" />
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '8px' }}>
            คิดเป็น {stats?.totalClaims > 0 ? Math.round(((stats?.deceasedCount || 0) / stats.totalClaims) * 100) : 0}% ของผู้สูญเสียรอบปีนี้
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--amber-warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>พิการทุพพลภาพ</div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#fbbf24', marginTop: '4px' }}>
                {stats?.disabledCount ?? 0} <span style={{ fontSize: '14px', color: 'var(--text-dim)', fontWeight: 400 }}>นาย</span>
              </div>
            </div>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Accessibility size={20} color="#fbbf24" />
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '8px' }}>
            คิดเป็น {stats?.totalClaims > 0 ? Math.round(((stats?.disabledCount || 0) / stats.totalClaims) * 100) : 0}% ของผู้สูญเสียรอบปีนี้
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--emerald-success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>วงเงินสินไหมรวมรอบปีนี้</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--emerald-success)', marginTop: '4px' }}>
                {stats ? (stats.totalCompensationAmount || 0).toLocaleString('th-TH') : 0} <span style={{ fontSize: '13px', color: '#fff', fontWeight: 400 }}>บาท</span>
              </div>
            </div>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Coins size={20} color="#34d399" />
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '8px' }}>
            ปกติ 60k: {stats?.normalClaimCount || 0} ราย • เสี่ยงภัย 300k: {stats?.highRiskClaimCount || 0} ราย
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: กราฟแท่งเปรียบเทียบรายเดือน เรียง 1 เม.ย. - 31 มี.ค. (เทียบย้อนหลัง 3 ปี) */}
      {/* ========================================================================= */}
      {viewMode === 'monthly' && (
        <div className="glass-panel" style={{ padding: '28px', marginBottom: '28px' }}>

          {/* Chart Header & Metric Switcher */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h2 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Calendar size={20} color="var(--gold-primary)" />
                <span>กราฟเปรียบเทียบยอดการสูญเสียรายเดือน (1 เม.ย. ปีก่อน - 31 มี.ค. ปีถัดไป)</span>
              </h2>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Info size={14} color="var(--cyan-accent)" />
                <span>เรียงเดือน: 1.เม.ย. → 2.พ.ค. → 3.มิ.ย. → 4.ก.ค. → 5.ส.ค. → 6.ก.ย. → 7.ต.ค. → 8.พ.ย. → 9.ธ.ค. → 10.ม.ค. → 11.ก.พ. → 12.มี.ค.</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px', background: 'rgba(255, 255, 255, 0.04)', padding: '4px', borderRadius: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setMetricMode('compare')}
                className={`btn btn-sm ${metricMode === 'compare' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '12px', padding: '5px 12px' }}
              >
                <span>เทียบย้อนหลัง {activeCompareYears.length} ปี</span>
              </button>
              <button
                onClick={() => setMetricMode('lossType')}
                className={`btn btn-sm ${metricMode === 'lossType' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '12px', padding: '5px 12px' }}
              >
                <span>เสียชีวิต vs พิการ</span>
              </button>
              <button
                onClick={() => setMetricMode('claimType')}
                className={`btn btn-sm ${metricMode === 'claimType' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '12px', padding: '5px 12px' }}
              >
                <span>สิทธิ 60k vs 300k</span>
              </button>
              <button
                onClick={() => setMetricMode('amount')}
                className={`btn btn-sm ${metricMode === 'amount' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '12px', padding: '5px 12px' }}
              >
                <span>วงเงินสินไหม (บาท)</span>
              </button>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '18px', marginBottom: '22px', fontSize: '12.5px', flexWrap: 'wrap' }}>
            {metricMode === 'compare' && allSeriesYears.map((yr, idx) => {
              const colorObj = YEAR_COLORS[idx] || YEAR_COLORS[3];
              return (
                <div key={yr} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '14px', height: '14px', borderRadius: '3px', background: colorObj.gradient }}></span>
                  <span style={{ fontWeight: idx === 0 ? 700 : 500, color: idx === 0 ? '#fff' : 'var(--text-muted)' }}>
                    {idx === 0 ? 'รอบปีหลัก' : `ย้อนหลัง ${selectedPolicyYear - yr > 0 ? `${selectedPolicyYear - yr} ปี` : `ปี ${yr}`}`} ({yr - 1}/{yr})
                  </span>
                </div>
              );
            })}
            {metricMode === 'lossType' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '14px', height: '14px', borderRadius: '3px', background: '#ef4444' }}></span>
                  <span style={{ color: '#fff' }}>ผู้เสียชีวิต (นาย)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '14px', height: '14px', borderRadius: '3px', background: '#f59e0b' }}></span>
                  <span style={{ color: '#fff' }}>พิการทุพพลภาพ (นาย)</span>
                </div>
              </>
            )}
            {metricMode === 'claimType' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '14px', height: '14px', borderRadius: '3px', background: '#06b6d4' }}></span>
                  <span style={{ color: '#fff' }}>ยามปกติ (60,000 บาท)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '14px', height: '14px', borderRadius: '3px', background: '#d4af37' }}></span>
                  <span style={{ color: '#fff' }}>หน้าที่สำคัญ/เสี่ยงภัย (300,000 บาท)</span>
                </div>
              </>
            )}
            {metricMode === 'amount' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '14px', height: '14px', borderRadius: '3px', background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}></span>
                <span style={{ color: '#fff' }}>วงเงินสินไหมทดแทนรวมประจำเดือน รอบปี {selectedPolicyYear - 1}/{selectedPolicyYear} (บาท)</span>
              </div>
            )}
          </div>

          {/* Bar Chart Canvas (12 Months: เม.ย. - มี.ค.) */}
          {(() => {
            let maxVal = 1;
            if (metricMode === 'compare') {
              maxVal = Math.max(
                ...monthlyData.map((m) =>
                  Math.max(m.total, ...activeCompareYears.map((yr) => m.compareByYear?.[yr]?.total || 0))
                ),
                1
              );
            } else if (metricMode === 'lossType') {
              maxVal = Math.max(...monthlyData.map((m) => Math.max(m.deceased, m.disabled)), 1);
            } else if (metricMode === 'claimType') {
              maxVal = Math.max(...monthlyData.map((m) => Math.max(m.normal, m.highRisk)), 1);
            } else if (metricMode === 'amount') {
              maxVal = Math.max(...monthlyData.map((m) => m.totalAmount), 100000);
            }

            const chartHeight = 240;

            return (
              <div style={{ position: 'relative', marginTop: '10px', marginBottom: '24px' }}>
                {/* Horizontal Gridlines */}
                <div style={{ position: 'absolute', top: 0, left: '40px', right: 0, height: `${chartHeight}px`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none', zIndex: 1 }}>
                  {[1, 0.75, 0.5, 0.25, 0].map((ratio, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-dim)', width: '36px', textAlign: 'right', paddingRight: '8px' }}>
                        {metricMode === 'amount' ? `${Math.round((maxVal * ratio) / 1000)}k` : Math.round(maxVal * ratio)}
                      </span>
                      <div style={{ flex: 1, borderTop: '1px dashed rgba(255, 255, 255, 0.08)' }}></div>
                    </div>
                  ))}
                </div>

                {/* 12 Month Bars */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(12, 1fr)',
                  gap: '6px',
                  height: `${chartHeight}px`,
                  marginLeft: '40px',
                  paddingTop: '20px',
                  alignItems: 'flex-end',
                  position: 'relative',
                  zIndex: 2
                }}>
                  {monthlyData.map((m) => {
                    const isHovered = hoveredMonth === m.key;

                    return (
                      <div
                        key={m.key}
                        onMouseEnter={() => setHoveredMonth(m.key)}
                        onMouseLeave={() => setHoveredMonth(null)}
                        style={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          position: 'relative',
                          cursor: 'pointer',
                          padding: '0 2px',
                          background: isHovered ? 'rgba(212, 175, 55, 0.08)' : 'transparent',
                          borderRadius: '6px',
                          transition: 'background 0.2s ease'
                        }}
                      >
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '3px' }}>
                          {metricMode === 'compare' && allSeriesYears.map((yr, idx) => {
                            const val = idx === 0 ? m.total : (m.compareByYear?.[yr]?.total || 0);
                            const colorObj = YEAR_COLORS[idx] || YEAR_COLORS[3];
                            return (
                              <div
                                key={yr}
                                style={{
                                  flex: 1,
                                  maxWidth: '18px',
                                  height: `${Math.max((val / maxVal) * 100, val > 0 ? 7 : 0)}%`,
                                  background: colorObj.gradient,
                                  borderRadius: '4px 4px 0 0',
                                  position: 'relative',
                                  opacity: idx === 0 ? 1 : 0.88,
                                  transition: 'height 0.3s ease'
                                }}
                              >
                                {val > 0 && (
                                  <span style={{
                                    position: 'absolute',
                                    top: '-16px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    color: colorObj.text
                                  }}>
                                    {val}
                                  </span>
                                )}
                              </div>
                            );
                          })}

                          {metricMode === 'lossType' && (
                            <>
                              <div style={{ width: '44%', height: `${Math.max((m.deceased / maxVal) * 100, m.deceased > 0 ? 7 : 0)}%`, background: '#ef4444', borderRadius: '4px 4px 0 0', position: 'relative' }}>
                                {m.deceased > 0 && <span style={{ position: 'absolute', top: '-17px', left: '50%', transform: 'translateX(-50%)', fontSize: '10.5px', fontWeight: 700, color: '#f87171' }}>{m.deceased}</span>}
                              </div>
                              <div style={{ width: '44%', height: `${Math.max((m.disabled / maxVal) * 100, m.disabled > 0 ? 7 : 0)}%`, background: '#f59e0b', borderRadius: '4px 4px 0 0', position: 'relative' }}>
                                {m.disabled > 0 && <span style={{ position: 'absolute', top: '-17px', left: '50%', transform: 'translateX(-50%)', fontSize: '10.5px', fontWeight: 700, color: '#fbbf24' }}>{m.disabled}</span>}
                              </div>
                            </>
                          )}

                          {metricMode === 'claimType' && (
                            <>
                              <div style={{ width: '44%', height: `${Math.max((m.normal / maxVal) * 100, m.normal > 0 ? 7 : 0)}%`, background: '#06b6d4', borderRadius: '4px 4px 0 0', position: 'relative' }}>
                                {m.normal > 0 && <span style={{ position: 'absolute', top: '-17px', left: '50%', transform: 'translateX(-50%)', fontSize: '10.5px', fontWeight: 700, color: 'var(--cyan-accent)' }}>{m.normal}</span>}
                              </div>
                              <div style={{ width: '44%', height: `${Math.max((m.highRisk / maxVal) * 100, m.highRisk > 0 ? 7 : 0)}%`, background: '#d4af37', borderRadius: '4px 4px 0 0', position: 'relative' }}>
                                {m.highRisk > 0 && <span style={{ position: 'absolute', top: '-17px', left: '50%', transform: 'translateX(-50%)', fontSize: '10.5px', fontWeight: 700, color: 'var(--gold-primary)' }}>{m.highRisk}</span>}
                              </div>
                            </>
                          )}

                          {metricMode === 'amount' && (
                            <div style={{ width: '68%', height: `${Math.max((m.totalAmount / maxVal) * 100, m.totalAmount > 0 ? 7 : 0)}%`, background: 'linear-gradient(180deg, #10b981 0%, #0d9488 100%)', borderRadius: '4px 4px 0 0', position: 'relative' }}>
                              {m.totalAmount > 0 && (
                                <span style={{ position: 'absolute', top: '-17px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', fontWeight: 600, color: '#6ee7b7', whiteSpace: 'nowrap' }}>
                                  {Math.round(m.totalAmount / 1000)}k
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Hover Tooltip Multi-Year */}
                        {isHovered && (
                          <div style={{
                            position: 'absolute',
                            bottom: `${chartHeight + 10}px`,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(9, 17, 38, 0.98)',
                            border: '1px solid var(--gold-primary)',
                            borderRadius: '10px',
                            padding: '12px 14px',
                            minWidth: '280px',
                            zIndex: 100,
                            boxShadow: '0 10px 28px rgba(0,0,0,0.7)',
                            pointerEvents: 'none'
                          }}>
                            <div style={{ fontWeight: 700, fontSize: '13px', color: '#fff', borderBottom: '1px solid var(--border-glass)', paddingBottom: '5px', marginBottom: '7px' }}>
                              เดือน {m.fullName} (ลำดับที่ {m.fiscalOrder}/12)
                            </div>
                            <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between', color: 'var(--gold-light)', marginBottom: '3px' }}>
                              <span>ปีหลัก ({m.calYearBE}):</span>
                              <strong>{m.total} เรื่อง ({m.totalAmount.toLocaleString()} บ.)</strong>
                            </div>
                            <div style={{ fontSize: '11px', color: '#fca5a5', marginBottom: '2px' }}>
                              • เสียชีวิต {m.deceased} นาย | พิการ {m.disabled} นาย
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                              • <span style={{ color: '#22d3ee' }}>ปกติ 60,000: {m.normal || 0}</span> | <span style={{ color: 'var(--gold-primary)' }}>สำคัญ/เสี่ยงภัย 300,000: {m.highRisk || 0}</span>
                            </div>
                            {activeCompareYears.map((yr, idx) => {
                              const comp = m.compareByYear?.[yr] || { total: 0, normal: 0, highRisk: 0, totalAmount: 0, calYearBE: yr };
                              const colorObj = YEAR_COLORS[idx + 1] || YEAR_COLORS[3];
                              return (
                                <div key={yr} style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed rgba(255,255,255,0.08)' }}>
                                  <div style={{ fontSize: '11.5px', display: 'flex', justifyContent: 'space-between', color: colorObj.text }}>
                                    <span>ปี {yr - 1}/{yr} ({comp.calYearBE}):</span>
                                    <strong>{comp.total} เรื่อง ({comp.totalAmount.toLocaleString()} บ.)</strong>
                                  </div>
                                  {comp.total > 0 && (
                                    <div style={{ fontSize: '10.5px', color: 'var(--text-dim)', marginTop: '1px' }}>
                                      ปกติ 60k: {comp.normal || 0} | สำคัญ/เสี่ยงภัย 300k: {comp.highRisk || 0}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* X-Axis Labels (เม.ย. -> มี.ค.) */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(12, 1fr)',
                  gap: '6px',
                  marginLeft: '40px',
                  marginTop: '10px',
                  borderTop: '2px solid var(--border-subtle)',
                  paddingTop: '8px'
                }}>
                  {monthlyData.map((m) => (
                    <div key={m.key} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: hoveredMonth === m.key ? 'var(--gold-primary)' : '#fff' }}>
                        {m.monthName}
                      </div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>
                        '{String(m.calYearBE).slice(-2)}
                      </div>
                      <div style={{ fontSize: '9.5px', color: 'var(--gold-light)', marginTop: '2px', background: 'rgba(212, 175, 55, 0.12)', borderRadius: '3px', padding: '1px 3px' }}>
                        ลำดับ {m.fiscalOrder}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Detailed Monthly Multi-Year Comparison Table */}
          <div style={{ marginTop: '28px', borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '15.5px', color: '#fff', margin: 0 }}>
                ตารางเปรียบเทียบยอดการสูญเสียรายเดือน (1 เม.ย. {selectedPolicyYear - 1} - 31 มี.ค. {selectedPolicyYear} เทียบย้อนหลัง {activeCompareYears.length} ปี)
              </h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '12px' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  background: 'rgba(6, 182, 212, 0.12)',
                  border: '1px solid rgba(6, 182, 212, 0.35)',
                  color: '#67e8f9'
                }}>
                  <span>ยามปกติ (60,000 บ.):</span>
                  <strong>{stats?.normalClaimCount ?? 0} ราย ({(stats?.normalTotalAmount || 0).toLocaleString()} บ.)</strong>
                </span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  background: 'rgba(212, 175, 55, 0.12)',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  color: 'var(--gold-light)'
                }}>
                  <span>ปฏิบัติหน้าที่สำคัญ / หน้าที่เสี่ยงภัย (300,000 บ.):</span>
                  <strong>{stats?.highRiskClaimCount ?? 0} ราย ({(stats?.highRiskTotalAmount || 0).toLocaleString()} บ.)</strong>
                </span>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)', fontSize: '12px' }}>
                    <th rowSpan={2} style={{ padding: '10px 8px', textAlign: 'center', verticalAlign: 'middle' }}>ลำดับ</th>
                    <th rowSpan={2} style={{ padding: '10px 10px', verticalAlign: 'middle' }}>เดือน / พ.ศ.</th>
                    <th
                      colSpan={6}
                      style={{
                        padding: '8px 10px',
                        textAlign: 'center',
                        color: 'var(--gold-primary)',
                        background: 'rgba(212, 175, 55, 0.08)',
                        borderBottom: '1px solid rgba(212, 175, 55, 0.25)'
                      }}
                    >
                      ปีหลัก {selectedPolicyYear - 1}/{selectedPolicyYear} (แยกตามประเภทสินไหม)
                    </th>
                    {activeCompareYears.length > 0 && (
                      <th
                        colSpan={activeCompareYears.length}
                        style={{
                          padding: '8px 10px',
                          textAlign: 'center',
                          color: 'var(--cyan-accent)',
                          background: 'rgba(6, 182, 212, 0.06)',
                          borderBottom: '1px solid rgba(6, 182, 212, 0.25)'
                        }}
                      >
                        เทียบย้อนหลัง {activeCompareYears.length} ปี (ปกติ 60,000 / สำคัญ-เสี่ยงภัย 300,000)
                      </th>
                    )}
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '12px' }}>
                    <th style={{ padding: '9px 8px', textAlign: 'center', color: 'var(--gold-primary)' }}>รวม (ราย)</th>
                    <th style={{ padding: '9px 8px', textAlign: 'center', color: '#f87171' }}>เสียชีวิต</th>
                    <th style={{ padding: '9px 8px', textAlign: 'center', color: '#fbbf24' }}>พิการ</th>
                    <th style={{ padding: '9px 8px', textAlign: 'center', color: '#22d3ee', whiteSpace: 'nowrap' }}>ยามปกติ (60,000)</th>
                    <th style={{ padding: '9px 8px', textAlign: 'center', color: 'var(--gold-primary)', whiteSpace: 'nowrap' }}>สำคัญ/เสี่ยงภัย (300,000)</th>
                    <th style={{ padding: '9px 10px', textAlign: 'right', color: 'var(--emerald-success)', whiteSpace: 'nowrap' }}>วงเงินปีหลัก</th>
                    {activeCompareYears.map((yr, idx) => {
                      const colorObj = YEAR_COLORS[idx + 1] || YEAR_COLORS[3];
                      return (
                        <th key={yr} style={{ padding: '9px 10px', textAlign: 'center', color: colorObj.text, whiteSpace: 'nowrap' }}>
                          <div>รอบปี {yr - 1}/{yr}</div>
                          <div style={{ fontSize: '10px', fontWeight: 400, color: 'var(--text-dim)', marginTop: '2px' }}>
                            60,000 | 300,000
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((m) => (
                    <tr
                      key={m.key}
                      style={{
                        borderBottom: '1px solid var(--border-glass)',
                        background: hoveredMonth === m.key ? 'rgba(212, 175, 55, 0.08)' : 'transparent'
                      }}
                      onMouseEnter={() => setHoveredMonth(m.key)}
                      onMouseLeave={() => setHoveredMonth(null)}
                    >
                      <td style={{ padding: '10px 8px', textAlign: 'center', color: 'var(--text-dim)', fontWeight: 600 }}>
                        {m.fiscalOrder}
                      </td>
                      <td style={{ padding: '10px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}>
                        {m.fullName} {m.calYearBE}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700, color: 'var(--gold-primary)' }}>
                        {m.total} ราย
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center', color: '#f87171' }}>{m.deceased}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center', color: '#fbbf24' }}>{m.disabled}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        <ClaimTypeCell count={m.normal} amount={m.normalAmount} color="#22d3ee" />
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        <ClaimTypeCell count={m.highRisk} amount={m.highRiskAmount} color="var(--gold-primary)" />
                      </td>
                      <td style={{ padding: '10px', textAlign: 'right', fontWeight: 600, color: 'var(--emerald-success)', whiteSpace: 'nowrap' }}>
                        {m.totalAmount.toLocaleString()} บ.
                      </td>
                      {activeCompareYears.map((yr, idx) => {
                        const c = m.compareByYear?.[yr] || { total: 0, normal: 0, highRisk: 0, normalAmount: 0, highRiskAmount: 0, totalAmount: 0 };
                        const colorObj = YEAR_COLORS[idx + 1] || YEAR_COLORS[3];
                        return (
                          <td key={yr} style={{ padding: '10px', textAlign: 'center', color: colorObj.text, whiteSpace: 'nowrap' }}>
                            <strong>{c.total} ราย</strong>
                            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                              {c.totalAmount > 0 ? `${c.totalAmount.toLocaleString()} บ.` : '-'}
                            </div>
                            <CompareClaimTypeSplit
                              normal={c.normal}
                              highRisk={c.highRisk}
                              normalAmount={c.normalAmount}
                              highRiskAmount={c.highRiskAmount}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* Summary Footer Row */}
                  {monthlyData.length > 0 && (
                    <tr style={{ background: 'rgba(212, 175, 55, 0.1)', borderTop: '2px solid var(--gold-primary)', fontWeight: 700 }}>
                      <td colSpan="2" style={{ padding: '12px 10px', color: 'var(--gold-light)' }}>
                        รวมตลอดทั้งรอบปี 12 เดือน (1 เม.ย. - 31 มี.ค.)
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--gold-primary)' }}>
                        {stats?.totalClaims ?? 0} ราย
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', color: '#f87171' }}>
                        {stats?.deceasedCount ?? 0}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', color: '#fbbf24' }}>
                        {stats?.disabledCount ?? 0}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <ClaimTypeCell count={stats?.normalClaimCount ?? 0} amount={stats?.normalTotalAmount || 0} color="#22d3ee" />
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <ClaimTypeCell count={stats?.highRiskClaimCount ?? 0} amount={stats?.highRiskTotalAmount || 0} color="var(--gold-primary)" />
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', color: 'var(--emerald-success)', whiteSpace: 'nowrap' }}>
                        {(stats?.totalCompensationAmount || 0).toLocaleString()} บ.
                      </td>
                      {activeCompareYears.map((yr, idx) => {
                        const yrTotals = sumCompareYearMetrics(monthlyData, yr);
                        const colorObj = YEAR_COLORS[idx + 1] || YEAR_COLORS[3];
                        return (
                          <td key={yr} style={{ padding: '12px 10px', textAlign: 'center', color: colorObj.text }}>
                            <div>{yrTotals.total} ราย</div>
                            <div style={{ fontSize: '11px', fontWeight: 400 }}>{yrTotals.totalAmount.toLocaleString()} บ.</div>
                            <CompareClaimTypeSplit
                              normal={yrTotals.normal}
                              highRisk={yrTotals.highRisk}
                              normalAmount={yrTotals.normalAmount}
                              highRiskAmount={yrTotals.highRiskAmount}
                              showZero
                            />
                          </td>
                        );
                      })}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: ภาพรวมหลายรอบปี (Multi-Year Comparison)                           */}
      {/* ========================================================================= */}
      {viewMode === 'yearly' && (
        <div className="glass-panel" style={{ padding: '28px', marginBottom: '28px' }}>
          <div style={{ marginBottom: '22px' }}>
            <h2 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} color="var(--emerald-success)" />
              <span>กราฟแท่งเปรียบเทียบสถิติรายรอบปี (1 เม.ย. - 31 มี.ค.)</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
              วิเคราะห์แนวโน้มและเปรียบเทียบยอดผู้สูญเสียและวงเงินสินไหมในแต่ละรอบปี 1 เม.ย. ปีก่อน ถึง 31 มี.ค. ปีถัดไป
            </p>
          </div>

          {(() => {
            const yearlyData = stats?.yearlyFiscalStats || [];
            const maxYearly = Math.max(...yearlyData.map((y) => y.totalClaims), 1);
            const chartHeight = 220;

            return (
              <div style={{ position: 'relative', marginTop: '10px', marginBottom: '28px' }}>
                <div style={{ position: 'absolute', top: 0, left: '40px', right: 0, height: `${chartHeight}px`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
                  {[1, 0.66, 0.33, 0].map((ratio, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)', width: '36px', textAlign: 'right', paddingRight: '8px' }}>
                        {Math.round(maxYearly * ratio)}
                      </span>
                      <div style={{ flex: 1, borderTop: '1px dashed rgba(255, 255, 255, 0.08)' }}></div>
                    </div>
                  ))}
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${Math.max(1, yearlyData.length)}, 1fr)`,
                  gap: '24px',
                  height: `${chartHeight}px`,
                  marginLeft: '40px',
                  paddingTop: '20px',
                  alignItems: 'flex-end',
                  position: 'relative',
                  zIndex: 2
                }}>
                  {yearlyData.map((yr) => {
                    const isSelected = yr.fiscalYear === selectedPolicyYear;
                    const heightPercent = Math.max((yr.totalClaims / maxYearly) * 100, yr.totalClaims > 0 ? 8 : 0);

                    return (
                      <div
                        key={yr.fiscalYear}
                        onClick={() => handleBaseYearChange(yr.fiscalYear)}
                        style={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          cursor: 'pointer',
                          padding: '0 12px'
                        }}
                      >
                        <div style={{ width: '100%', maxWidth: '120px', height: '100%', display: 'flex', alignItems: 'flex-end', gap: '8px', justifyContent: 'center' }}>
                          <div style={{
                            width: '45px',
                            height: `${heightPercent}%`,
                            background: isSelected ? YEAR_COLORS[0].gradient : 'linear-gradient(180deg, #94a3b8 0%, #475569 100%)',
                            borderRadius: '6px 6px 0 0',
                            position: 'relative',
                            boxShadow: isSelected ? '0 0 16px rgba(212, 175, 55, 0.5)' : 'none',
                            transition: 'all 0.3s ease'
                          }}>
                            <span style={{ position: 'absolute', top: '-22px', left: '50%', transform: 'translateX(-50%)', fontSize: '13px', fontWeight: 700, color: isSelected ? 'var(--gold-primary)' : '#fff' }}>
                              {yr.totalClaims}
                            </span>
                          </div>
                          <div style={{ width: '25px', height: `${Math.max((yr.deceasedCount / maxYearly) * 100, yr.deceasedCount > 0 ? 6 : 0)}%`, background: '#ef4444', borderRadius: '4px 4px 0 0', position: 'relative', opacity: 0.9 }}>
                            {yr.deceasedCount > 0 && <span style={{ position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: '#fca5a5' }}>{yr.deceasedCount}</span>}
                          </div>
                          <div style={{ width: '25px', height: `${Math.max((yr.disabledCount / maxYearly) * 100, yr.disabledCount > 0 ? 6 : 0)}%`, background: '#f59e0b', borderRadius: '4px 4px 0 0', position: 'relative', opacity: 0.9 }}>
                            {yr.disabledCount > 0 && <span style={{ position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: '#fde68a' }}>{yr.disabledCount}</span>}
                          </div>
                        </div>

                        <div style={{
                          marginTop: '12px',
                          textAlign: 'center',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: isSelected ? 'rgba(212, 175, 55, 0.18)' : 'transparent',
                          border: isSelected ? '1px solid var(--gold-primary)' : '1px solid transparent'
                        }}>
                          <div style={{ fontWeight: 700, fontSize: '13.5px', color: isSelected ? 'var(--gold-primary)' : '#fff' }}>
                            {yr.fullFiscalYearText}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                            {yr.dateRangeText}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: '14px' }}>
              ตารางสรุปเปรียบเทียบสถิติรายรอบปี (1 เม.ย. - 31 มี.ค.)
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px 14px' }}>รอบปี</th>
                    <th style={{ padding: '12px 14px' }}>ช่วงเวลาคำนวณ</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>รวมทั้งหมด</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', color: '#f87171' }}>เสียชีวิต</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', color: '#fbbf24' }}>พิการ</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>ปกติ (60k)</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', color: 'var(--gold-primary)' }}>เสี่ยงภัย (300k)</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>วงเงินสินไหมรวม</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats?.yearlyFiscalStats || []).map((yr) => (
                    <tr
                      key={yr.fiscalYear}
                      style={{
                        borderBottom: '1px solid var(--border-glass)',
                        background: yr.fiscalYear === selectedPolicyYear ? 'rgba(212, 175, 55, 0.08)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: yr.fiscalYear === selectedPolicyYear ? 'var(--gold-primary)' : '#fff' }}>
                        {yr.fullFiscalYearText}
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-dim)', fontSize: '12.5px' }}>{yr.dateRangeText}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700 }}>{yr.totalClaims} เรื่อง</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: '#f87171', fontWeight: 600 }}>{yr.deceasedCount}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: '#fbbf24', fontWeight: 600 }}>{yr.disabledCount}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>{yr.normalClaimCount}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: 'var(--gold-primary)', fontWeight: 600 }}>{yr.highRiskClaimCount}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--emerald-success)' }}>
                        {yr.totalCompensationAmount.toLocaleString()} บาท
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION: รายงานการสูญเสียตามประเภทกำลังพล (นายสัญญาบัตร - นักเรียนทหาร + เทียบย้อนหลัง 3 ปี) */}
      {/* ========================================================================= */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '28px', borderTop: '3.5px solid var(--cyan-accent)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '18px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontWeight: 700 }}>
              <Users size={20} color="var(--cyan-accent)" />
              <span>รายงานการสูญเสียจำแนกตามประเภทกำลังพล ทบ. (รอบปี {selectedPolicyYear - 1}/{selectedPolicyYear})</span>
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '4px', margin: '4px 0 0' }}>
              ครอบคลุมทุกกลุ่มกำลังพล: นายทหารสัญญาบัตร, นายทหารประทวน, ลูกจ้างประจำ, พลอาสา, อส.ทพ., ลูกจ้างชั่วคราว, พนักงานราชการ, พลทหาร, นักเรียนทหาร พร้อมเปรียบเทียบย้อนหลัง {activeCompareYears.length} ปี
            </p>
          </div>
          <span className="badge badge-blue" style={{ fontSize: '12px' }}>
            รวมทั้งสิ้น {stats?.totalClaims ?? 0} นาย
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 12px', textAlign: 'center', width: '50px' }}>ลำดับ</th>
                <th style={{ padding: '10px 12px' }}>ประเภทกำลังพล</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--gold-primary)' }}>
                  ปีหลัก ({selectedPolicyYear - 1}/{selectedPolicyYear})
                </th>
                <th style={{ padding: '10px 12px', textAlign: 'center', color: '#f87171' }}>เสียชีวิต</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', color: '#fbbf24' }}>พิการ</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>ปกติ 60k</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--gold-primary)' }}>เสี่ยงภัย 300k</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--emerald-success)' }}>วงเงินรวม (บาท)</th>
                {activeCompareYears.map((yr, idx) => {
                  const colorObj = YEAR_COLORS[idx + 1] || YEAR_COLORS[3];
                  return (
                    <th key={yr} style={{ padding: '10px 12px', textAlign: 'center', color: colorObj.text }}>
                      รอบปี {yr - 1}/{yr}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {personnelReport.map((row, idx) => {
                const maxTotal = Math.max(...personnelReport.map((r) => r.total), 1);
                const barWidth = Math.round((row.total / maxTotal) * 100);

                return (
                  <tr key={row.category} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text-dim)' }}>{idx + 1}</td>
                    <td style={{ padding: '10px 12px', minWidth: '210px' }}>
                      <div style={{ fontWeight: 600, color: row.total > 0 ? '#fff' : 'var(--text-dim)', marginBottom: '4px' }}>
                        {row.category}
                      </div>
                      <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${barWidth}%`, height: '100%', background: 'linear-gradient(90deg, #06b6d4, #10b981)', borderRadius: '3px' }}></div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: row.total > 0 ? 'var(--gold-primary)' : 'var(--text-dim)' }}>
                      {row.total} นาย
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: row.deceased > 0 ? '#f87171' : 'var(--text-dim)' }}>
                      {row.deceased}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: row.disabled > 0 ? '#fbbf24' : 'var(--text-dim)' }}>
                      {row.disabled}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: row.normal > 0 ? '#fff' : 'var(--text-dim)' }}>
                      {row.normal}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: row.highRisk > 0 ? 'var(--gold-light)' : 'var(--text-dim)' }}>
                      {row.highRisk}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: row.totalAmount > 0 ? 'var(--emerald-success)' : 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                      {row.totalAmount > 0 ? `${row.totalAmount.toLocaleString()} บ.` : '-'}
                    </td>
                    {activeCompareYears.map((yr, cIdx) => {
                      const prevTotal = row.compareByYear?.[yr]?.total || 0;
                      const colorObj = YEAR_COLORS[cIdx + 1] || YEAR_COLORS[3];
                      return (
                        <td key={yr} style={{ padding: '10px 12px', textAlign: 'center', color: prevTotal > 0 ? colorObj.text : 'var(--text-dim)', fontWeight: prevTotal > 0 ? 600 : 400 }}>
                          {prevTotal} นาย
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Summary Footer */}
              <tr style={{ background: 'rgba(6, 182, 212, 0.1)', borderTop: '2px solid var(--cyan-accent)', fontWeight: 700 }}>
                <td colSpan="2" style={{ padding: '12px', color: '#fff' }}>รวมทุกประเภทกำลังพล</td>
                <td style={{ padding: '12px', textAlign: 'center', color: 'var(--gold-primary)' }}>
                  {stats?.totalClaims ?? 0} นาย
                </td>
                <td style={{ padding: '12px', textAlign: 'center', color: '#f87171' }}>{stats?.deceasedCount ?? 0}</td>
                <td style={{ padding: '12px', textAlign: 'center', color: '#fbbf24' }}>{stats?.disabledCount ?? 0}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>{stats?.normalClaimCount ?? 0}</td>
                <td style={{ padding: '12px', textAlign: 'center', color: 'var(--gold-light)' }}>{stats?.highRiskClaimCount ?? 0}</td>
                <td style={{ padding: '12px', textAlign: 'right', color: 'var(--emerald-success)' }}>
                  {(stats?.totalCompensationAmount || 0).toLocaleString()} บ.
                </td>
                {activeCompareYears.map((yr, cIdx) => {
                  const yrTotal = personnelReport.reduce((sum, r) => sum + (r.compareByYear?.[yr]?.total || 0), 0);
                  const colorObj = YEAR_COLORS[cIdx + 1] || YEAR_COLORS[3];
                  return (
                    <td key={yr} style={{ padding: '12px', textAlign: 'center', color: colorObj.text }}>
                      {yrTotal} นาย
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION: 10 อันดับหน่วย / สังกัดที่มีการสูญเสียมากที่สุด + สาเหตุการสูญเสีย */}
      {/* ========================================================================= */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '28px', borderTop: '3.5px solid var(--ruby-danger)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '18px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontWeight: 700 }}>
              <Award size={20} color="var(--gold-primary)" />
              <span>เทียบหน่วย / สังกัดที่มีการสูญเสียมากที่สุด 10 อันดับแรก (Top 10 Units)</span>
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '4px', margin: '4px 0 0' }}>
              จัดอันดับหน่วยต้นสังกัดที่มีจำนวนกำลังพลสูญเสียสูงสุด 10 อันดับ พร้อมเปรียบเทียบสถิติย้อนหลัง {activeCompareYears.length} ปี
            </p>
          </div>

          <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '8px' }}>
            <button
              type="button"
              onClick={() => setTopUnitsScope('active')}
              className={`btn btn-sm ${topUnitsScope === 'active' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '12px', padding: '5px 12px' }}
            >
              เฉพาะรอบปี {selectedPolicyYear - 1}/{selectedPolicyYear}
            </button>
            <button
              type="button"
              onClick={() => setTopUnitsScope('combined')}
              className={`btn btn-sm ${topUnitsScope === 'combined' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '12px', padding: '5px 12px' }}
            >
              รวมสะสมทุกรอบปีที่เลือก ({allSeriesYears.length} ปี)
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 12px', textAlign: 'center', width: '70px' }}>อันดับ</th>
                <th style={{ padding: '10px 12px' }}>หน่วย / สังกัด</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--gold-primary)' }}>
                  ยอดสูญเสียรวม
                </th>
                <th style={{ padding: '10px 12px', textAlign: 'center', color: '#f87171' }}>เสียชีวิต</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', color: '#fbbf24' }}>พิการ</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--emerald-success)' }}>วงเงินรวม</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', color: YEAR_COLORS[0].text }}>
                  ปีหลัก {selectedPolicyYear - 1}/{selectedPolicyYear}
                </th>
                {activeCompareYears.map((yr, idx) => {
                  const colorObj = YEAR_COLORS[idx + 1] || YEAR_COLORS[3];
                  return (
                    <th key={yr} style={{ padding: '10px 12px', textAlign: 'center', color: colorObj.text }}>
                      รอบปี {yr - 1}/{yr}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {topUnitsList.length === 0 ? (
                <tr>
                  <td colSpan={7 + activeCompareYears.length} style={{ textAlign: 'center', padding: '26px', color: 'var(--text-dim)' }}>
                    ยังไม่มีข้อมูลหน่วยในรอบปีที่เลือก
                  </td>
                </tr>
              ) : (
                topUnitsList.map((u) => {
                  const maxUnitTotal = Math.max(...topUnitsList.map((x) => x.total), 1);
                  const barPct = Math.round((u.total / maxUnitTotal) * 100);
                  const rankMedal = u.rank === 1 ? '🥇' : u.rank === 2 ? '🥈' : u.rank === 3 ? '🥉' : `#${u.rank}`;

                  return (
                    <tr key={u.unitName} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: 800, fontSize: u.rank <= 3 ? '16px' : '13px', color: u.rank <= 3 ? 'var(--gold-primary)' : 'var(--text-dim)' }}>
                        {rankMedal}
                      </td>
                      <td style={{ padding: '12px', minWidth: '230px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                          <Building2 size={14} color={u.rank <= 3 ? 'var(--gold-primary)' : 'var(--text-dim)'} />
                          <span style={{ fontWeight: 600, color: '#fff' }}>{u.unitName}</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${barPct}%`,
                            height: '100%',
                            background: u.rank === 1 ? 'linear-gradient(90deg, #ef4444, #f59e0b)' : 'linear-gradient(90deg, #d4af37, #06b6d4)',
                            borderRadius: '3px'
                          }}></div>
                        </div>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700, color: '#fff' }}>
                        <span className={`badge ${u.rank <= 3 ? 'badge-red' : 'badge-amber'}`}>
                          {u.total} นาย
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#f87171', fontWeight: 600 }}>{u.deceased}</td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#fbbf24', fontWeight: 600 }}>{u.disabled}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: 'var(--emerald-success)', whiteSpace: 'nowrap' }}>
                        {u.totalAmount.toLocaleString()} บ.
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700, color: YEAR_COLORS[0].text }}>
                        {u.compareByYear?.[selectedPolicyYear]?.total ?? 0} นาย
                      </td>
                      {activeCompareYears.map((yr, idx) => {
                        const cVal = u.compareByYear?.[yr]?.total || 0;
                        const colorObj = YEAR_COLORS[idx + 1] || YEAR_COLORS[3];
                        return (
                          <td key={yr} style={{ padding: '12px', textAlign: 'center', color: cVal > 0 ? colorObj.text : 'var(--text-dim)', fontWeight: cVal > 0 ? 600 : 400 }}>
                            {cVal} นาย
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* สาเหตุการสูญเสียในรอบปีที่เลือก */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '17px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Flame size={18} color="var(--ruby-danger)" />
          <span>สรุปสาเหตุการสูญเสีย (รอบปี {selectedPolicyYear - 1}/{selectedPolicyYear})</span>
        </h2>

        <div className="grid-cols-2" style={{ gap: '12px' }}>
          {stats && Object.keys(stats.causeStats || {}).length > 0 ? (
            Object.entries(stats.causeStats)
              .sort((a, b) => b[1] - a[1])
              .map(([cause, count]) => (
                <div key={cause} style={{ padding: '12px 14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', borderLeft: '3px solid var(--ruby-danger)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '13px', color: '#fff' }}>{cause}</div>
                  <span className="badge badge-amber" style={{ fontWeight: 600 }}>{count} นาย</span>
                </div>
              ))
          ) : (
            <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px 0', gridColumn: 'span 2' }}>
              ยังไม่มีข้อมูลสาเหตุในรอบปีที่เลือก
            </p>
          )}
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12.5px', color: 'var(--text-dim)' }}>
          กำลังอัปเดตข้อมูลรายงานล่าสุด...
        </div>
      )}
    </div>
  );
}
