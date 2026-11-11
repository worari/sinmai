// lib/bot-commands.js
// ตัวจัดการคำสั่ง Telegram Bot สำหรับตอบคำถามสถิติและสถานะ SLA แบบอัตโนมัติ

import { db } from './db.js';
import { CLAIM_STATUS } from './constants.js';
import { calculateSlaStatus } from './thai-utils.js';
import { escapeTelegramHtml } from './telegram.js';

export function buildTelegramBotReply(rawText = '') {
  const input = String(rawText || '').trim();
  const [rawCmd, ...rest] = input.split(/\s+/);
  const cmd = (rawCmd || '').split('@')[0].toLowerCase();
  const arg = rest.join(' ').trim();

  if (cmd === '/start' || cmd === '/help') {
    return [
      '🎖️ <b>ระบบแจ้งเตือน Telegram Bot — สินไหมทดแทน ทบ.</b>',
      '',
      'คำสั่งที่รองรับ:',
      '• /stats — สรุปสถิติคำร้องสินไหมปีปัจจุบัน',
      '• /sla — ตรวจสอบรายการใกล้ครบกำหนด / เกิน SLA 30 วัน',
      '• /pending — แสดงรายการคำร้องที่อยู่ระหว่างดำเนินการ',
      '• /track <i>&lt;เลขที่เรื่องหรือชื่อ&gt;</i> — ค้นหาสถานะคำร้อง',
      '• /help — แสดงรายการคำสั่งทั้งหมด'
    ].join('\n');
  }

  if (cmd === '/stats') {
    const st = db.getStatistics();
    return [
      `📊 <b>สรุปสถิติสินไหมทดแทน ทบ. (ปีงบฯ ${escapeTelegramHtml(st.activeFiscalYear)})</b>`,
      `ช่วงข้อมูล: ${escapeTelegramHtml(st.activeDateRange)}`,
      '',
      `• คำร้องทั้งหมด: <b>${st.totalClaims}</b> เรื่อง`,
      `• เสียชีวิต: <b>${st.deceasedCount}</b> นาย | พิการ: <b>${st.disabledCount}</b> นาย`,
      `• ยามปกติ (60,000 บ.): <b>${st.normalClaimCount}</b> เรื่อง (${(st.normalTotalAmount || 0).toLocaleString()} บ.)`,
      `• สำคัญ/เสี่ยงภัย (300,000 บ.): <b>${st.highRiskClaimCount}</b> เรื่อง (${(st.highRiskTotalAmount || 0).toLocaleString()} บ.)`,
      `• โอนจ่ายแล้ว: <b>${st.paidClaimsCount}</b> เรื่อง (${(st.totalPaidAmount || 0).toLocaleString()} บ.)`,
      `• ค้างดำเนินการ: <b>${st.pendingCount}</b> เรื่อง | เกิน SLA: <b>${st.overdueCount}</b> เรื่อง`
    ].join('\n');
  }

  if (cmd === '/sla') {
    const sla = db.scanAndNotifySla({ dryRun: true });
    const lines = [
      '⏱️ <b>รายงานกรอบเวลา SLA 30 วัน (Real-time)</b>',
      `คำร้องค้างดำเนินการ: <b>${sla.totalActive}</b> เรื่อง`,
      `🔴 เกินกำหนด (> 30 วัน): <b>${sla.overdueCount}</b> เรื่อง`,
      `🟠 ใกล้ครบกำหนด (≤ 7 วัน): <b>${sla.warningCount}</b> เรื่อง`
    ];
    if (sla.overdueList.length > 0) {
      lines.push('', '<b>รายการเกินกำหนดล่าสุด:</b>');
      sla.overdueList.slice(0, 5).forEach((item) => {
        lines.push(`• <code>${escapeTelegramHtml(item.trackingCode)}</code> (${escapeTelegramHtml(item.unitName)}) เกิน ${Math.abs(item.daysRemaining)} วัน`);
      });
    }
    if (sla.warningList.length > 0) {
      lines.push('', '<b>รายการเฝ้าระวังใกล้ครบกำหนด:</b>');
      sla.warningList.slice(0, 5).forEach((item) => {
        lines.push(`• <code>${escapeTelegramHtml(item.trackingCode)}</code> (${escapeTelegramHtml(item.unitName)}) เหลือ ${item.daysRemaining} วัน`);
      });
    }
    return lines.join('\n');
  }

  if (cmd === '/pending') {
    const active = db.getClaims(null).filter(
      (c) => c.status !== 'DRAFT' && c.status !== 'PAID' && c.status !== 'SK_NOTIFIED'
    );
    if (active.length === 0) {
      return '✅ ไม่มีคำร้องค้างดำเนินการในขณะนี้';
    }
    const lines = [`📋 <b>รายการคำร้องระหว่างดำเนินการ (${active.length} เรื่อง)</b>`, ''];
    active.slice(0, 8).forEach((c, idx) => {
      const statusLabel = CLAIM_STATUS[c.status]?.label || c.status;
      lines.push(
        `${idx + 1}. <code>${escapeTelegramHtml(c.trackingCode)}</code> — ${escapeTelegramHtml(c.casualtyRank)} ${escapeTelegramHtml(c.casualtyFirstName)} ${escapeTelegramHtml(c.casualtyLastName)}\n   หน่วย: ${escapeTelegramHtml(c.unitName || '-')}\n   สถานะ: <b>${escapeTelegramHtml(statusLabel)}</b>`
      );
    });
    return lines.join('\n');
  }

  if (cmd === '/track') {
    if (!arg) {
      return 'กรุณาระบุเลขที่เรื่องหรือชื่อกำลังพล เช่น <code>/track ทบ-กพ-69/001</code>';
    }
    const q = arg.toLowerCase();
    const matches = db
      .getClaims(null)
      .filter(
        (c) =>
          (c.trackingCode || '').toLowerCase().includes(q) ||
          `${c.casualtyRank || ''} ${c.casualtyFirstName || ''} ${c.casualtyLastName || ''}`.toLowerCase().includes(q)
      )
      .slice(0, 5);

    if (matches.length === 0) {
      return `ไม่พบคำร้องที่ตรงกับ "<code>${escapeTelegramHtml(arg)}</code>"`;
    }

    const lines = [`🔎 <b>ผลการค้นหาคำร้อง (${matches.length} รายการ)</b>`, ''];
    matches.forEach((c) => {
      const sla = calculateSlaStatus(c.reportDate || c.createdAt, c.slaTargetDays || 30);
      lines.push(
        `• <code>${escapeTelegramHtml(c.trackingCode)}</code> — ${escapeTelegramHtml(c.casualtyRank)} ${escapeTelegramHtml(c.casualtyFirstName)} ${escapeTelegramHtml(c.casualtyLastName)}\n  หน่วย: ${escapeTelegramHtml(c.unitName || '-')}\n  สถานะ: <b>${escapeTelegramHtml(CLAIM_STATUS[c.status]?.label || c.status)}</b> (${escapeTelegramHtml(sla.label)})`
      );
    });
    return lines.join('\n');
  }

  return null;
}

