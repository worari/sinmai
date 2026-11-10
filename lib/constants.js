// lib/constants.js
// ค่าคงที่สถานะ Workflow สำหรับใช้งานได้ทั้ง Server และ Client Components

export const CLAIM_STATUS = {
  SUBMITTED: { key: 'SUBMITTED', label: '1. เสนอเรื่องใหม่ (รอ กพ.ทบ. รับเรื่อง)', step: 1, badge: 'blue' },
  UNDER_REVIEW: { key: 'UNDER_REVIEW', label: '2. กพ.ทบ.(กสพ.ฯ) กำลังตรวจเอกสาร', step: 2, badge: 'amber' },
  REJECTED_BY_KSP: { key: 'REJECTED_BY_KSP', label: 'กสพ.ฯ ตีกลับเอกสารให้หน่วยแก้ไข', step: 2, badge: 'red' },
  PENDING_APPROVAL: { key: 'PENDING_APPROVAL', label: '3. รอผู้บังคับบัญชา (จก.กพ.ทบ.) อนุมัติ', step: 3, badge: 'purple' },
  APPROVED: { key: 'APPROVED', label: 'อนุมัติแล้ว (ส่งต่อ บ.ประกันภัย)', step: 3, badge: 'emerald' },
  INSURANCE_PROCESSING: { key: 'INSURANCE_PROCESSING', label: '4. บ.ประกันภัย ตรวจสอบและเตรียมโอนเงิน', step: 4, badge: 'cyan' },
  DOC_REQUESTED: { key: 'DOC_REQUESTED', label: 'บ.ประกันภัย ขอเอกสารเพิ่ม', step: 4, badge: 'orange' },
  PAID: { key: 'PAID', label: 'โอนเงินสินไหมแล้ว', step: 4, badge: 'green' },
  SK_NOTIFIED: { key: 'SK_NOTIFIED', label: '5. สก.ทบ. รับทราบยอดจ่ายเงิน (เสร็จสมบูรณ์)', step: 5, badge: 'dark' }
};

// ============================================================
// บทบาทและสิทธิ์ผู้ใช้งาน (Role-Based Access Control - RBAC)
// ============================================================
export const USER_ROLES = {
  ADMIN: {
    key: 'ADMIN',
    label: 'ผู้ดูแลระบบสูงสุด (Admin)',
    shortLabel: 'Admin',
    badge: 'red',
    step: 0,
    desc: 'จัดการสิทธิ์ผู้ใช้, โครงสร้างหน่วย, อนุมัติผู้ใช้, ตรวจสอบ Audit Log'
  },
  KSP_OFFICER: {
    key: 'KSP_OFFICER',
    label: '2. กพ.ทบ. (กสพ.ฯ ตรวจเอกสาร)',
    shortLabel: 'กสพ.กพ.ทบ.',
    badge: 'amber',
    step: 2,
    desc: 'ตรวจความสมบูรณ์ 10 เอกสาร, ตรวจสอบความถูกต้อง, เสนอ จก.กพ.ทบ.'
  },
  COMMANDER: {
    key: 'COMMANDER',
    label: '3. ผู้บังคับบัญชา (จก.กพ.ทบ. อนุมัติ)',
    shortLabel: 'จก.กพ.ทบ.',
    badge: 'purple',
    step: 3,
    desc: 'พิจารณาลงนามอนุมัติสั่งจ่ายเงินค่าสินไหมทดแทน'
  },
  INSURANCE_REP: {
    key: 'INSURANCE_REP',
    label: '4. บริษัทประกันภัย (โอนเงินสินไหม)',
    shortLabel: 'บ.ประกันภัย',
    badge: 'cyan',
    step: 4,
    desc: 'ตรวจสอบความถูกต้องและโอนเงินสินไหมทดแทนเข้าบัญชีทายาท'
  },
  SK_OFFICER: {
    key: 'SK_OFFICER',
    label: '5. สก.ทบ. (รับทราบยอดจ่าย)',
    shortLabel: 'สก.ทบ.',
    badge: 'emerald',
    step: 5,
    desc: 'รับทราบยอดการจ่ายเงินสินไหม และสรุปผลประโยชน์สวัสดิการ'
  },
  UNIT_OFFICER: {
    key: 'UNIT_OFFICER',
    label: '1. เจ้าหน้าที่หน่วย (ผู้เสนอเรื่อง)',
    shortLabel: 'จนท.หน่วย',
    badge: 'blue',
    step: 1,
    desc: 'บันทึกรายงาน กพ.4, ปักหมุดที่เกิดเหตุ, แนบเอกสารหลักฐาน 10 รายการ'
  }
};

export const USER_STATUS = {
  APPROVED: { key: 'APPROVED', label: 'อนุมัติแล้ว (ใช้งานได้)', badge: 'emerald' },
  PENDING: { key: 'PENDING', label: 'รอการอนุมัติ', badge: 'amber' },
  SUSPENDED: { key: 'SUSPENDED', label: 'ถูกระงับการใช้งาน', badge: 'red' },
  REJECTED: { key: 'REJECTED', label: 'ไม่อนุมัติ (ปฏิเสธ)', badge: 'slate' }
};

// ============================================================
// ค่าคงที่สำหรับระบบจัดการความรู้และแบบทดสอบผู้ใช้งาน
// ============================================================
export const KNOWLEDGE_CONFIG = {
  DEFAULT_PASSING_SCORE: 80,
  DEFAULT_QUESTION_COUNT: 10,
  DEFAULT_TIME_LIMIT_MINUTES: 30,
  EXAM_TITLE: 'แบบทดสอบความรู้การใช้งานระบบเสนอขอรับสิทธิเงินค่าสินไหมทดแทน'
};

export const KNOWLEDGE_SCORE_LEVELS = [
  { min: 80, max: 100, label: 'ผ่าน (ดีเยี่ยม)', badge: 'emerald', canUseSystem: true, desc: 'เข้าใจการใช้งานระบบดีเยี่ยม ใช้งานระบบได้เต็มรูปแบบ' },
  { min: 60, max: 79, label: 'ผ่าน (พอใช้)', badge: 'amber', canUseSystem: true, desc: 'ผ่านเกณฑ์ ใช้งานระบบได้ แนะนำทบทวนคู่มือเพิ่มเติม' },
  { min: 0, max: 59, label: 'ไม่ผ่าน (ต้องปรับปรุง)', badge: 'red', canUseSystem: false, desc: 'ยังไม่ผ่านเกณฑ์ ไม่สามารถใช้งานระบบได้ ศึกษาคลังความรู้แล้วสอบใหม่' }
];

export function getKnowledgeScoreLevel(score, passingScore = KNOWLEDGE_CONFIG.DEFAULT_PASSING_SCORE) {
  const numScore = Number(score) || 0;
  const threshold = Number(passingScore ?? KNOWLEDGE_CONFIG.DEFAULT_PASSING_SCORE);
  const passed = numScore >= threshold;
  if (passed && numScore >= 80) {
    return { min: 80, max: 100, label: 'ผ่านเกณฑ์ (ดีเยี่ยม)', badge: 'emerald', canUseSystem: true, desc: 'เข้าใจการใช้งานระบบดีเยี่ยม ใช้งานระบบได้เต็มรูปแบบทันที' };
  }
  if (passed) {
    return { min: threshold, max: 79, label: 'ผ่านเกณฑ์', badge: 'emerald', canUseSystem: true, desc: 'ทำแบบทดสอบผ่านเกณฑ์ที่กำหนดเรียบร้อยแล้ว สามารถใช้งานระบบได้ทันที' };
  }
  return { min: 0, max: Math.max(0, threshold - 1), label: 'ไม่ผ่านเกณฑ์ (ต้องปรับปรุง)', badge: 'red', canUseSystem: false, desc: `ยังไม่ผ่านเกณฑ์ที่กำหนด (${threshold}%) กรุณาศึกษาคลังความรู้แล้วสอบใหม่อีกครั้ง` };
}

export function isKnowledgePassed(score, passingScore = KNOWLEDGE_CONFIG.DEFAULT_PASSING_SCORE) {
  return score >= passingScore;
}
