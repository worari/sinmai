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
  const level = KNOWLEDGE_SCORE_LEVELS.find((l) => score >= l.min && score <= l.max);
  return level || KNOWLEDGE_SCORE_LEVELS[KNOWLEDGE_SCORE_LEVELS.length - 1];
}

export function isKnowledgePassed(score, passingScore = KNOWLEDGE_CONFIG.DEFAULT_PASSING_SCORE) {
  return score >= passingScore;
}
