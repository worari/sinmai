// app/reports/page.js - ระบบรายงานสถิติเปรียบเทียบรายเดือน รายปี ตามรอบปีงบประมาณ (1 ต.ค. - 30 ก.ย.)
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
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Flame,
  Users,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle2,
  Info
} from 'lucide-react';
import { FISCAL_YEAR_MONTHS } from '@/lib/thai-utils';

export default function ReportsPage() {
  const [stats, setStats] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fiscal Year Filters
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(2569);
  const [compareFiscalYear, setCompareFiscalYear] = useState(2568);

  // View & Metric Modes
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly' | 'yearly'
  const [metricMode, setMetricMode] = useState('compare'); // 'compare' | 'lossType' | 'claimType' | 'amount'
  const [hoveredMonth, setHoveredMonth] = useState(null);

  useEffect(() => {
    loadReportsData(selectedFiscalYear, compareFiscalYear);
  }, [selectedFiscalYear, compareFiscalYear]);

  const loadReportsData = async (fy, compFy) => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (fy) q.append('fiscalYear', fy);
      if (compFy) q.append('compareFiscalYear', compFy);

      const [resStats, resClaims] = await Promise.all([
        fetch(`/api/stats?${q.toString()}`).then((r) => r.json()),
        fetch('/api/claims').then((r) => r.json())
      ]);

      if (resStats.success && resStats.stats) {
        setStats(resStats.stats);
        if (!selectedFiscalYear && resStats.stats.activeFiscalYear) {
          setSelectedFiscalYear(resStats.stats.activeFiscalYear);
        }
        if (!compareFiscalYear && resStats.stats.compareFiscalYear) {
          setCompareFiscalYear(resStats.stats.compareFiscalYear);
        }
      }
      if (resClaims.success && resClaims.claims) {
        setClaims(resClaims.claims);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!stats || !stats.fiscalMonthlyStats) return;
    const headers = ['ลำดับปีงบ', 'เดือน', 'ปี พ.ศ.', `ปีงบประมาณ ${stats.activeFiscalYear} (เรื่อง)`, 'เสียชีวิต', 'พิการ', 'ยอดเงิน (บาท)', `ปีงบประมาณ ${stats.compareFiscalYear} (เรื่อง)`, 'ผลต่าง', 'อัตราเปลี่ยนแปลง (%)'];
    const rows = stats.fiscalMonthlyStats.map((m) => [
      m.fiscalOrder,
      m.fullName,
      m.calYearBE,
      m.total,
      m.deceased,
      m.disabled,
      m.totalAmount,
      m.compareTotal,
      m.diff,
      `${m.percentChange}%`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `สถิติสินไหม_ปีงบ_${stats.activeFiscalYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const availableYears = stats?.availableFiscalYears || [2570, 2569, 2568, 2567];

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
            ระบบเปรียบเทียบสถิติรายเดือนและรายปี ตามรอบปีงบประมาณ (1 ต.ค. - 30 ก.ย. ของทุกปี) และเรียงเดือนตามปีงบประมาณ ทบ.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleExportCSV} className="btn btn-secondary btn-sm" title="ส่งออกข้อมูลเป็น CSV">
            <Download size={15} /> <span>ส่งออก CSV</span>
          </button>
          <button onClick={handlePrint} className="btn btn-primary btn-sm">
            <Printer size={15} /> <span>พิมพ์รายงานสรุป</span>
          </button>
        </div>
      </div>

      {/* Fiscal Year Filter & Mode Controls Bar */}
      <div className="glass-panel" style={{ padding: '18px 22px', marginBottom: '26px', borderLeft: '4px solid var(--gold-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '18px' }}>
          
          {/* Year Selectors */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={17} color="var(--gold-primary)" />
              <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#fff' }}>ปีงบประมาณหลัก:</span>
              <select 
                className="form-select"
                value={selectedFiscalYear}
                onChange={(e) => setSelectedFiscalYear(Number(e.target.value))}
                style={{ width: '160px', padding: '6px 10px', fontSize: '13px' }}
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>ปีงบประมาณ {yr}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>เทียบกับ:</span>
              <select 
                className="form-select"
                value={compareFiscalYear}
                onChange={(e) => setCompareFiscalYear(Number(e.target.value))}
                style={{ width: '160px', padding: '6px 10px', fontSize: '13px' }}
              >
                {availableYears.filter((yr) => yr !== selectedFiscalYear).map((yr) => (
                  <option key={yr} value={yr}>ปีงบประมาณ {yr}</option>
                ))}
              </select>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--gold-light)', background: 'rgba(212, 175, 55, 0.1)', padding: '5px 12px', borderRadius: '20px', border: '1px solid var(--border-subtle)' }}>
              รอบการคำนวณ: <strong>1 ต.ค. {selectedFiscalYear - 1} - 30 ก.ย. {selectedFiscalYear}</strong>
            </div>
          </div>

          {/* View Mode Toggle: รายเดือน vs รายปี */}
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            <button
              onClick={() => setViewMode('monthly')}
              className={`btn btn-sm ${viewMode === 'monthly' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '12.5px' }}
            >
              <span>📊 สถิติเปรียบเทียบรายเดือน</span>
            </button>
            <button
              onClick={() => setViewMode('yearly')}
              className={`btn btn-sm ${viewMode === 'yearly' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '12.5px' }}
            >
              <span>📈 สถิติเปรียบเทียบรายปีงบฯ</span>
            </button>
          </div>

        </div>
      </div>

      {/* Top 4 KPI Summary Cards for Selected Fiscal Year */}
      <div className="grid-cols-4" style={{ marginBottom: '28px', gap: '16px' }}>
        
        {/* Total Claims in Fiscal Year */}
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--cyan-accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                ยอดคำร้องปีงบฯ {selectedFiscalYear}
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
            <span style={{ color: 'var(--text-dim)' }}>เทียบปีงบ {compareFiscalYear}</span>
          </div>
        </div>

        {/* Deceased Casualties */}
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
            คิดเป็น {Math.round(((stats?.deceasedCount || 0) / (stats?.totalClaims || 1)) * 100)}% ของผู้สูญเสียปีงบฯ นี้
          </div>
        </div>

        {/* Disabled Casualties */}
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
            คิดเป็น {Math.round(((stats?.disabledCount || 0) / (stats?.totalClaims || 1)) * 100)}% ของผู้สูญเสียปีงบฯ นี้
          </div>
        </div>

        {/* Total Compensation Paid */}
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--emerald-success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>ยอดเงินจ่ายสินไหมปีงบฯ นี้</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--emerald-success)', marginTop: '4px' }}>
                {stats ? stats.totalPaidAmount.toLocaleString('th-TH') : 0} <span style={{ fontSize: '13px', color: '#fff', fontWeight: 400 }}>บาท</span>
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
      {/* VIEW 1: กราฟแท่งเปรียบเทียบรายเดือนตามปีงบประมาณ (ต.ค. - ก.ย.)             */}
      {/* ========================================================================= */}
      {viewMode === 'monthly' && (
        <div className="glass-panel" style={{ padding: '28px', marginBottom: '32px' }}>
          
          {/* Chart Header & Metric Switcher */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h2 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={20} color="var(--gold-primary)" />
                <span>กราฟแท่งสถิติรายเดือน เรียงตามปีงบประมาณไทย (ต.ค. - ก.ย.)</span>
              </h2>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Info size={14} color="var(--cyan-accent)" />
                <span>ลำดับเดือนปีงบประมาณ: 1.ต.ค. → 2.พ.ย. → 3.ธ.ค. → 4.ม.ค. → 5.ก.พ. → 6.มี.ค. → 7.เม.ย. → 8.พ.ค. → 9.มิ.ย. → 10.ก.ค. → 11.ส.ค. → 12.ก.ย.</span>
              </div>
            </div>

            {/* Metric Mode Selector */}
            <div style={{ display: 'flex', gap: '6px', background: 'rgba(255, 255, 255, 0.04)', padding: '4px', borderRadius: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setMetricMode('compare')}
                className={`btn btn-sm ${metricMode === 'compare' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '12px', padding: '5px 12px' }}
              >
                <span>เปรียบเทียบ 2 ปีงบฯ</span>
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
          <div style={{ display: 'flex', gap: '20px', marginBottom: '22px', fontSize: '12.5px', flexWrap: 'wrap' }}>
            {metricMode === 'compare' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '14px', height: '14px', borderRadius: '3px', background: 'linear-gradient(135deg, #d4af37, #f59e0b)' }}></span>
                  <span style={{ fontWeight: 600, color: '#fff' }}>ปีงบประมาณ {selectedFiscalYear} ({stats?.activeDateRange})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '14px', height: '14px', borderRadius: '3px', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}></span>
                  <span style={{ color: 'var(--text-muted)' }}>ปีงบประมาณ {compareFiscalYear} ({stats?.compareDateRange})</span>
                </div>
              </>
            )}
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
                <span style={{ color: '#fff' }}>วงเงินสินไหมทดแทนรวมประจำเดือน (บาท)</span>
              </div>
            )}
          </div>

          {/* Custom SVG/CSS Bar Chart Canvas */}
          {(() => {
            const monthlyData = stats?.fiscalMonthlyStats || [];
            
            // Calculate maximum value for Y-axis scaling
            let maxVal = 1;
            if (metricMode === 'compare') {
              maxVal = Math.max(...monthlyData.map((m) => Math.max(m.total, m.compareTotal)), 1);
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
                        {metricMode === 'amount' 
                          ? `${Math.round((maxVal * ratio) / 1000)}k` 
                          : Math.round(maxVal * ratio)}
                      </span>
                      <div style={{ flex: 1, borderTop: '1px dashed rgba(255, 255, 255, 0.08)' }}></div>
                    </div>
                  ))}
                </div>

                {/* Bars Area (12 Fiscal Months) */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(12, 1fr)',
                  gap: '8px',
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
                          padding: '0 4px',
                          background: isHovered ? 'rgba(212, 175, 55, 0.08)' : 'transparent',
                          borderRadius: '6px',
                          transition: 'background 0.2s ease'
                        }}
                      >
                        {/* Bars Container */}
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '4px' }}>
                          
                          {/* Mode: COMPARE_YEARS */}
                          {metricMode === 'compare' && (
                            <>
                              {/* Primary FY Bar */}
                              <div 
                                style={{
                                  width: '45%',
                                  height: `${Math.max((m.total / maxVal) * 100, m.total > 0 ? 6 : 0)}%`,
                                  background: 'linear-gradient(180deg, #fef08a 0%, #d4af37 100%)',
                                  borderRadius: '4px 4px 0 0',
                                  boxShadow: isHovered ? '0 0 12px rgba(212, 175, 55, 0.6)' : 'none',
                                  transition: 'height 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s',
                                  transform: isHovered ? 'scaleY(1.04)' : 'none',
                                  transformOrigin: 'bottom',
                                  position: 'relative'
                                }}
                              >
                                {m.total > 0 && (
                                  <span style={{ position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)', fontSize: '11px', fontWeight: 700, color: 'var(--gold-primary)' }}>
                                    {m.total}
                                  </span>
                                )}
                              </div>

                              {/* Compare FY Bar */}
                              <div 
                                style={{
                                  width: '45%',
                                  height: `${Math.max((m.compareTotal / maxVal) * 100, m.compareTotal > 0 ? 6 : 0)}%`,
                                  background: 'linear-gradient(180deg, #67e8f9 0%, #0284c7 100%)',
                                  borderRadius: '4px 4px 0 0',
                                  boxShadow: isHovered ? '0 0 12px rgba(6, 182, 212, 0.6)' : 'none',
                                  transition: 'height 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                  position: 'relative',
                                  opacity: 0.85
                                }}
                              >
                                {m.compareTotal > 0 && (
                                  <span style={{ position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)', fontSize: '10.5px', fontWeight: 600, color: 'var(--cyan-accent)' }}>
                                    {m.compareTotal}
                                  </span>
                                )}
                              </div>
                            </>
                          )}

                          {/* Mode: LOSS_TYPE */}
                          {metricMode === 'lossType' && (
                            <>
                              <div 
                                style={{
                                  width: '45%',
                                  height: `${Math.max((m.deceased / maxVal) * 100, m.deceased > 0 ? 6 : 0)}%`,
                                  background: '#ef4444',
                                  borderRadius: '4px 4px 0 0',
                                  position: 'relative'
                                }}
                              >
                                {m.deceased > 0 && (
                                  <span style={{ position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)', fontSize: '11px', fontWeight: 700, color: '#f87171' }}>
                                    {m.deceased}
                                  </span>
                                )}
                              </div>
                              <div 
                                style={{
                                  width: '45%',
                                  height: `${Math.max((m.disabled / maxVal) * 100, m.disabled > 0 ? 6 : 0)}%`,
                                  background: '#f59e0b',
                                  borderRadius: '4px 4px 0 0',
                                  position: 'relative'
                                }}
                              >
                                {m.disabled > 0 && (
                                  <span style={{ position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)', fontSize: '11px', fontWeight: 700, color: '#fbbf24' }}>
                                    {m.disabled}
                                  </span>
                                )}
                              </div>
                            </>
                          )}

                          {/* Mode: CLAIM_TYPE */}
                          {metricMode === 'claimType' && (
                            <>
                              <div 
                                style={{
                                  width: '45%',
                                  height: `${Math.max((m.normal / maxVal) * 100, m.normal > 0 ? 6 : 0)}%`,
                                  background: '#06b6d4',
                                  borderRadius: '4px 4px 0 0',
                                  position: 'relative'
                                }}
                              >
                                {m.normal > 0 && (
                                  <span style={{ position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)', fontSize: '11px', fontWeight: 700, color: 'var(--cyan-accent)' }}>
                                    {m.normal}
                                  </span>
                                )}
                              </div>
                              <div 
                                style={{
                                  width: '45%',
                                  height: `${Math.max((m.highRisk / maxVal) * 100, m.highRisk > 0 ? 6 : 0)}%`,
                                  background: '#d4af37',
                                  borderRadius: '4px 4px 0 0',
                                  position: 'relative'
                                }}
                              >
                                {m.highRisk > 0 && (
                                  <span style={{ position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)', fontSize: '11px', fontWeight: 700, color: 'var(--gold-primary)' }}>
                                    {m.highRisk}
                                  </span>
                                )}
                              </div>
                            </>
                          )}

                          {/* Mode: COMPENSATION AMOUNT */}
                          {metricMode === 'amount' && (
                            <div 
                              style={{
                                width: '70%',
                                height: `${Math.max((m.totalAmount / maxVal) * 100, m.totalAmount > 0 ? 6 : 0)}%`,
                                background: 'linear-gradient(180deg, #10b981 0%, #0d9488 100%)',
                                borderRadius: '4px 4px 0 0',
                                position: 'relative'
                              }}
                            >
                              {m.totalAmount > 0 && (
                                <span style={{ position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', fontWeight: 600, color: '#6ee7b7', whiteSpace: 'nowrap' }}>
                                  {Math.round(m.totalAmount / 1000)}k
                                </span>
                              )}
                            </div>
                          )}

                        </div>

                        {/* Hover Tooltip Popup */}
                        {isHovered && (
                          <div style={{
                            position: 'absolute',
                            bottom: `${chartHeight + 10}px`,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(9, 17, 38, 0.96)',
                            border: '1px solid var(--gold-primary)',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            minWidth: '200px',
                            zIndex: 100,
                            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                            pointerEvents: 'none'
                          }}>
                            <div style={{ fontWeight: 700, fontSize: '13px', color: '#fff', borderBottom: '1px solid var(--border-glass)', paddingBottom: '4px', marginBottom: '6px' }}>
                              เดือน {m.fullName} {m.calYearBE} (ลำดับที่ {m.fiscalOrder} ปีงบฯ)
                            </div>
                            <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between', color: 'var(--gold-light)' }}>
                              <span>ปีงบ {selectedFiscalYear}:</span>
                              <strong>{m.total} เรื่อง ({m.totalAmount.toLocaleString()} บ.)</strong>
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#fca5a5', marginTop: '2px' }}>
                              • เสียชีวิต: {m.deceased} นาย | พิการ: {m.disabled} นาย
                            </div>
                            <div style={{ fontSize: '11.5px', color: 'var(--cyan-accent)', marginTop: '2px' }}>
                              • ปกติ 60k: {m.normal} ราย | เสี่ยงภัย 300k: {m.highRisk} ราย
                            </div>
                            <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', marginTop: '6px', paddingTop: '4px', borderTop: '1px dashed var(--border-glass)' }}>
                              <span>เทียบปีงบ {compareFiscalYear}:</span>
                              <span>{m.compareTotal} เรื่อง</span>
                            </div>
                            <div style={{ fontSize: '11px', color: m.diff >= 0 ? '#f87171' : '#34d399', fontWeight: 600, marginTop: '2px' }}>
                              ผลต่าง: {m.diff >= 0 ? `+${m.diff}` : m.diff} เรื่อง ({m.percentChange > 0 ? `+${m.percentChange}` : m.percentChange}%)
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>

                {/* X-Axis Month Labels (Ordered by Thai Fiscal Year: Oct -> Sep) */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(12, 1fr)',
                  gap: '8px',
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

          {/* Detailed Monthly Data Table */}
          <div style={{ marginTop: '28px', borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: '12px' }}>
              ตารางแจกแจงสถิติรายเดือนตามปีงบประมาณ {selectedFiscalYear} (1 ต.ค. {selectedFiscalYear - 1} - 30 ก.ย. {selectedFiscalYear})
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>ลำดับปีงบ</th>
                    <th style={{ padding: '10px 12px' }}>เดือน / พ.ศ.</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>ปีงบฯ {selectedFiscalYear}</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', color: '#f87171' }}>เสียชีวิต</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', color: '#fbbf24' }}>พิการ</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>ปกติ (60k)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--gold-primary)' }}>เสี่ยงภัย (300k)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>วงเงินรวม (บาท)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--cyan-accent)' }}>ปีงบฯ {compareFiscalYear}</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>ผลต่าง / % เติบโต</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.fiscalMonthlyStats?.map((m) => (
                    <tr 
                      key={m.key} 
                      style={{ 
                        borderBottom: '1px solid var(--border-glass)',
                        background: hoveredMonth === m.key ? 'rgba(212, 175, 55, 0.08)' : 'transparent'
                      }}
                      onMouseEnter={() => setHoveredMonth(m.key)}
                      onMouseLeave={() => setHoveredMonth(null)}
                    >
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text-dim)', fontWeight: 600 }}>
                        {m.fiscalOrder}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#fff' }}>
                        {m.fullName} {m.calYearBE}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: 'var(--gold-primary)' }}>
                        {m.total}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: '#f87171' }}>
                        {m.deceased}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: '#fbbf24' }}>
                        {m.disabled}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        {m.normal}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--gold-primary)' }}>
                        {m.highRisk}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: 'var(--emerald-success)' }}>
                        {m.totalAmount.toLocaleString()} บ.
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--cyan-accent)' }}>
                        {m.compareTotal}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        {m.diff !== 0 ? (
                          <span style={{ color: m.diff > 0 ? '#f87171' : '#34d399', fontWeight: 600 }}>
                            {m.diff > 0 ? `+${m.diff}` : m.diff} ({m.percentChange > 0 ? `+${m.percentChange}` : m.percentChange}%)
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-dim)' }}>0 (0%)</span>
                        )}
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
      {/* VIEW 2: กราฟแท่งเปรียบเทียบรายปีงบประมาณ (2567 - 2570)                   */}
      {/* ========================================================================= */}
      {viewMode === 'yearly' && (
        <div className="glass-panel" style={{ padding: '28px', marginBottom: '32px' }}>
          
          <div style={{ marginBottom: '22px' }}>
            <h2 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} color="var(--emerald-success)" />
              <span>กราฟแท่งเปรียบเทียบสถิติรายปีงบประมาณ (Multi-Year Fiscal Comparison)</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
              วิเคราะห์แนวโน้มและเปรียบเทียบยอดผู้สูญเสีย เงินสินไหมทดแทน และอัตราการเปลี่ยนแปลงในแต่ละปีงบประมาณ (1 ต.ค. - 30 ก.ย.)
            </p>
          </div>

          {/* Yearly Bar Chart Visualizer */}
          {(() => {
            const yearlyData = stats?.yearlyFiscalStats || [];
            const maxYearly = Math.max(...yearlyData.map((y) => y.totalClaims), 1);
            const chartHeight = 220;

            return (
              <div style={{ position: 'relative', marginTop: '10px', marginBottom: '28px' }}>
                
                {/* Horizontal Guides */}
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

                {/* Yearly Columns */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${yearlyData.length}, 1fr)`,
                  gap: '24px',
                  height: `${chartHeight}px`,
                  marginLeft: '40px',
                  paddingTop: '20px',
                  alignItems: 'flex-end',
                  position: 'relative',
                  zIndex: 2
                }}>
                  {yearlyData.map((yr) => {
                    const isSelected = yr.fiscalYear === selectedFiscalYear;
                    const heightPercent = Math.max((yr.totalClaims / maxYearly) * 100, yr.totalClaims > 0 ? 8 : 0);

                    return (
                      <div 
                        key={yr.fiscalYear}
                        onClick={() => setSelectedFiscalYear(yr.fiscalYear)}
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
                        {/* Clustered Bars for Deceased & Disabled */}
                        <div style={{ width: '100%', maxWidth: '120px', height: '100%', display: 'flex', alignItems: 'flex-end', gap: '8px', justifyContent: 'center' }}>
                          
                          {/* Total Claims Bar */}
                          <div style={{
                            width: '45px',
                            height: `${heightPercent}%`,
                            background: isSelected 
                              ? 'linear-gradient(180deg, #fef08a 0%, #d4af37 100%)' 
                              : 'linear-gradient(180deg, #94a3b8 0%, #475569 100%)',
                            borderRadius: '6px 6px 0 0',
                            position: 'relative',
                            boxShadow: isSelected ? '0 0 16px rgba(212, 175, 55, 0.5)' : 'none',
                            transition: 'all 0.3s ease'
                          }}>
                            <span style={{ position: 'absolute', top: '-22px', left: '50%', transform: 'translateX(-50%)', fontSize: '13px', fontWeight: 700, color: isSelected ? 'var(--gold-primary)' : '#fff' }}>
                              {yr.totalClaims}
                            </span>
                          </div>

                          {/* Sub-bar: Deceased */}
                          <div style={{
                            width: '25px',
                            height: `${Math.max((yr.deceasedCount / maxYearly) * 100, yr.deceasedCount > 0 ? 6 : 0)}%`,
                            background: '#ef4444',
                            borderRadius: '4px 4px 0 0',
                            position: 'relative',
                            opacity: 0.9
                          }}>
                            {yr.deceasedCount > 0 && (
                              <span style={{ position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: '#fca5a5' }}>
                                {yr.deceasedCount}
                              </span>
                            )}
                          </div>

                          {/* Sub-bar: Disabled */}
                          <div style={{
                            width: '25px',
                            height: `${Math.max((yr.disabledCount / maxYearly) * 100, yr.disabledCount > 0 ? 6 : 0)}%`,
                            background: '#f59e0b',
                            borderRadius: '4px 4px 0 0',
                            position: 'relative',
                            opacity: 0.9
                          }}>
                            {yr.disabledCount > 0 && (
                              <span style={{ position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: '#fde68a' }}>
                                {yr.disabledCount}
                              </span>
                            )}
                          </div>

                        </div>

                        {/* Fiscal Year Label */}
                        <div style={{
                          marginTop: '12px',
                          textAlign: 'center',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: isSelected ? 'rgba(212, 175, 55, 0.18)' : 'transparent',
                          border: isSelected ? '1px solid var(--gold-primary)' : '1px solid transparent'
                        }}>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: isSelected ? 'var(--gold-primary)' : '#fff' }}>
                            {yr.fullFiscalYearText}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                            {yr.dateRangeText}
                          </div>
                          {yr.growthRate !== 0 && (
                            <div style={{ fontSize: '11px', fontWeight: 600, color: yr.growthRate > 0 ? '#f87171' : '#34d399', marginTop: '2px' }}>
                              {yr.growthRate > 0 ? `+${yr.growthRate}%` : `${yr.growthRate}%`}
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })()}

          {/* Multi-Year Fiscal Comparison Table */}
          <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: '14px' }}>
              ตารางสรุปเปรียบเทียบสถิติภาพรวมรายปีงบประมาณ
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px 14px' }}>ปีงบประมาณ</th>
                    <th style={{ padding: '12px 14px' }}>รอบเวลาการคำนวณ</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>จำนวนคำร้องรวม</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', color: '#f87171' }}>เสียชีวิต</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', color: '#fbbf24' }}>พิการทุพพลภาพ</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>สิทธิปกติ (60k)</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', color: 'var(--gold-primary)' }}>เสี่ยงภัย (300k)</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>วงเงินสินไหมรวม</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>อัตราการเปลี่ยนแปลง</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.yearlyFiscalStats?.map((yr) => (
                    <tr 
                      key={yr.fiscalYear} 
                      style={{ 
                        borderBottom: '1px solid var(--border-glass)',
                        background: yr.fiscalYear === selectedFiscalYear ? 'rgba(212, 175, 55, 0.08)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: yr.fiscalYear === selectedFiscalYear ? 'var(--gold-primary)' : '#fff' }}>
                        {yr.fullFiscalYearText}
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-dim)', fontSize: '12.5px' }}>
                        {yr.dateRangeText}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, fontSize: '14px' }}>
                        {yr.totalClaims} เรื่อง
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: '#f87171', fontWeight: 600 }}>
                        {yr.deceasedCount}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: '#fbbf24', fontWeight: 600 }}>
                        {yr.disabledCount}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        {yr.normalClaimCount}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: 'var(--gold-primary)', fontWeight: 600 }}>
                        {yr.highRiskClaimCount}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--emerald-success)' }}>
                        {yr.totalCompensationAmount.toLocaleString()} บาท
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        {yr.growthRate > 0 ? (
                          <span className="badge badge-amber" style={{ color: '#f87171' }}>+{yr.growthRate}%</span>
                        ) : yr.growthRate < 0 ? (
                          <span className="badge badge-blue" style={{ color: '#34d399' }}>{yr.growthRate}%</span>
                        ) : (
                          <span style={{ color: 'var(--text-dim)' }}>0%</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Grid: สถิติตามสาเหตุการสูญเสีย & จำแนกตามประเภทกำลังพล ทบ. */}
      <div className="grid-cols-2" style={{ marginBottom: '28px', gap: '20px' }}>
        
        {/* สาเหตุการสูญเสีย (พฤติการณ์) ในปีงบประมาณที่เลือก */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '17px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={18} color="var(--ruby-danger)" />
            <span>สถิติตามสาเหตุการสูญเสีย (ปีงบประมาณ {selectedFiscalYear})</span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats && Object.keys(stats.causeStats || {}).length > 0 ? (
              Object.entries(stats.causeStats).map(([cause, count]) => (
                <div key={cause} style={{ padding: '12px 14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', borderLeft: '3px solid var(--ruby-danger)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '13px', color: '#fff' }}>{cause}</div>
                  <span className="badge badge-amber" style={{ fontWeight: 600 }}>{count} นาย</span>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px 0' }}>ยังไม่มีข้อมูลสาเหตุในปีงบฯ นี้</p>
            )}
          </div>
        </div>

        {/* สรุปตามประเภทกำลังพล ทบ. */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '17px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} color="var(--gold-primary)" />
            <span>สถิติจำแนกตามประเภทกำลังพล ทบ. (ปีงบฯ {selectedFiscalYear})</span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats && Object.keys(stats.personnelStats || {}).length > 0 ? (
              Object.entries(stats.personnelStats).map(([pType, count]) => {
                const maxCount = Math.max(...Object.values(stats.personnelStats), 1);
                const percent = Math.round((count / maxCount) * 100);

                return (
                  <div key={pType}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                      <span style={{ color: '#fff', fontWeight: 500 }}>{pType}</span>
                      <strong style={{ color: 'var(--gold-primary)' }}>{count} นาย</strong>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, #d4af37, #06b6d4)', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px 0' }}>ยังไม่มีข้อมูลกำลังพลในปีงบฯ นี้</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
