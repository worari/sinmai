// lib/db.js
// ฐานข้อมูลและ Data Layer สำหรับระบบเสนอขอรับสิทธิเงินค่าสินไหมทดแทน ทบ.
// รองรับ Schema PostgreSQL พร้อม In-Memory State & JSON persistence เพื่อความสะดวกรวดเร็วในการรัน

import fs from 'fs';
import path from 'path';
import {
  REQUIRED_DOCUMENTS,
  FISCAL_YEAR_MONTHS,
  POLICY_YEAR_MONTHS,
  REPORT_PERSONNEL_CATEGORIES,
  getFiscalYear,
  getPolicyYear,
  normalizePersonnelCategory,
  getFiscalYearDateRange,
  formatThaiDate,
  calculateSlaStatus
} from './thai-utils.js';
import { INITIAL_MILITARY_UNITS } from './military-units.js';
import {
  sendTelegramNotification,
  bindTelegramPersistence,
  hydrateTelegramState,
  getTelegramStateForStorage
} from './telegram.js';
import { hashPassword, verifyPassword, isPasswordHashed } from './security.js';
import { CLAIM_STATUS } from './constants.js';
import {
  getPgPool,
  ensurePgSchema,
  seedPgIfEmpty,
  syncSnapshotToPg,
  loadAllFromPg,
  getPgDiagnostics
} from './pg-store.js';

export { CLAIM_STATUS };

const DB_FILE = path.join(process.cwd(), 'data-store.json');

// ฟังก์ชัน Fisher-Yates สุ่มสลับตำแหน่งอาร์เรย์ (สำหรับสุ่มข้อสอบและสุ่มตัวเลือกคำตอบ)
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Seed Users พร้อมบทบาทครบ 5 ขั้นตอน
const initialUsers = [
  {
    id: 'usr-unit-1',
    citizenId: '1100500123456',
    rank: 'ร.อ.',
    firstName: 'สมหมาย',
    lastName: 'กล้าหาญ',
    position: 'นายทหารธุรการและกำลังพล',
    unitId: '9th_INF_DIV',
    unitName: 'กองพลทหารราบที่ 9 (พล.ร.9)',
    phone: '081-234-5678',
    email: 'unit.officer@army.mil.th',
    password: 'password123',
    role: 'UNIT_OFFICER', // เจ้าหน้าที่หน่วยรายงานเสนอเรื่อง
    status: 'APPROVED',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-unit-2',
    citizenId: '1100500987654',
    rank: 'พ.ต.',
    firstName: 'ยุทธนา',
    lastName: 'มีชัย',
    position: 'นายทหารกำลังพล',
    unitId: 'RANGERS_REG_41',
    unitName: 'กรมทหารพรานที่ 41 (ทภ.4)',
    phone: '089-876-5432',
    email: 'ranger41@army.mil.th',
    password: 'password123',
    role: 'UNIT_OFFICER',
    status: 'APPROVED',
    isActive: true,
    createdAt: '2026-01-02T00:00:00.000Z'
  },
  {
    id: 'usr-ksp-1',
    citizenId: '1100500778899',
    rank: 'พ.ท.',
    firstName: 'อภิสิทธิ์',
    lastName: 'กสพการ',
    position: 'ประจำ กสพ.กพ.ทบ.',
    unitId: 'KSP_RTA',
    unitName: 'กรมกำลังพลทหารบก (กสพ.ฯ)',
    phone: '02-297-7000',
    email: 'ksp.rta@army.mil.th',
    password: 'password123',
    role: 'KSP_OFFICER', // กพ.ทบ. (กสพ.ฯ) ตรวจสอบเอกสาร
    status: 'APPROVED',
    isActive: true,
    createdAt: '2026-01-03T00:00:00.000Z'
  },
  {
    id: 'usr-cmd-1',
    citizenId: '1100500554433',
    rank: 'พล.ท.',
    firstName: 'พงศกร',
    lastName: 'จิราภรณ์',
    position: 'เจ้ากรมกำลังพลทหารบก (จก.กพ.ทบ.)',
    unitId: 'KSP_RTA',
    unitName: 'บก.ทบ. / กรมกำลังพลทหารบก',
    phone: '02-297-7111',
    email: 'commander@army.mil.th',
    password: 'password123',
    role: 'COMMANDER', // ผู้บังคับบัญชาอนุมัติ
    status: 'APPROVED',
    isActive: true,
    createdAt: '2026-01-04T00:00:00.000Z'
  },
  {
    id: 'usr-ins-1',
    citizenId: '1100500223344',
    rank: 'นาย',
    firstName: 'วิชัย',
    lastName: 'คุ้มครองภัย',
    position: 'ผู้จัดการฝ่ายสินไหมทดแทนภาครัฐ',
    unitId: 'INSURANCE_CO',
    unitName: 'บริษัท ทิพยประกันภัย จำกัด (มหาชน)',
    phone: '02-123-4567',
    email: 'insurance@insurance.co.th',
    password: 'password123',
    role: 'INSURANCE_REP', // บริษัทประกันภัย
    status: 'APPROVED',
    isActive: true,
    createdAt: '2026-01-05T00:00:00.000Z'
  },
  {
    id: 'usr-sk-1',
    citizenId: '1100500998877',
    rank: 'พ.อ.',
    firstName: 'ธนากร',
    lastName: 'สวัสดิ์ทบ',
    position: 'หัวหน้าแผนกสงเคราะห์ สก.ทบ.',
    unitId: 'SK_RTA',
    unitName: 'กรมสวัสดิการทหารบก (สก.ทบ.)',
    phone: '02-281-5555',
    email: 'sk.rta@army.mil.th',
    password: 'password123',
    role: 'SK_OFFICER', // สก.ทบ. รับทราบยอดจ่ายเงิน
    status: 'APPROVED',
    isActive: true,
    createdAt: '2026-01-06T00:00:00.000Z'
  },
  {
    id: 'usr-admin-1',
    citizenId: '1100500001122',
    rank: 'พ.อ.',
    firstName: 'ชนินทร์',
    lastName: 'ปฏิบัติการ',
    position: 'ผู้ดูแลระบบส่วนกลาง',
    unitId: 'KSP_RTA',
    unitName: 'ศูนย์เทคโนโลยีสารสนเทศ ทบ.',
    phone: '02-297-8000',
    email: 'admin@army.mil.th',
    password: 'password123',
    role: 'ADMIN', // ผู้ดูแลระบบสูงสุด จัดการความรู้และสิทธิ์ผู้ใช้
    status: 'APPROVED',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-pending-1',
    citizenId: '1100500889911',
    rank: 'ร.ท.',
    firstName: 'วีรชัย',
    lastName: 'ใจหาญ',
    position: 'นายทหารส่งกำลังบำรุง',
    unitId: 'MTB_11',
    unitName: 'มณฑลทหารบกที่ 11 (มทบ.11)',
    phone: '085-112-3344',
    email: 'veerachai@army.mil.th',
    password: 'password123',
    role: 'UNIT_OFFICER',
    requestedRole: 'UNIT_OFFICER',
    status: 'PENDING',
    isActive: false,
    createdAt: '2026-11-05T08:30:00.000Z'
  },
  {
    id: 'usr-pending-2',
    citizenId: '1100500667788',
    rank: 'พ.ต.',
    firstName: 'ณัฐพล',
    lastName: 'มั่นคง',
    position: 'ประจำแผนกกำลังพล',
    unitId: 'KSP_RTA',
    unitName: 'กรมกำลังพลทหารบก (กสพ.ฯ)',
    phone: '089-554-1122',
    email: 'nattapon.ksp@army.mil.th',
    password: 'password123',
    role: 'KSP_OFFICER',
    requestedRole: 'KSP_OFFICER',
    status: 'PENDING',
    isActive: false,
    createdAt: '2026-11-06T02:15:00.000Z'
  }
];

// Seed ประวัติกิจกรรมและ Audit Log เริ่มต้น
const initialActivityLogs = [
  {
    id: 'log-001',
    userId: 'usr-admin-1',
    userName: 'พ.อ. ชนินทร์ ปฏิบัติการ',
    userRole: 'ADMIN',
    action: 'SYSTEM_INIT',
    actionBadge: 'blue',
    actionLabel: 'เริ่มต้นระบบ',
    details: 'เริ่มต้นระบบและโหลดฐานข้อมูลผู้ใช้งานส่วนกลาง',
    ip: '10.200.2.168',
    device: 'Windows PC (Chrome)',
    createdAt: '2026-11-01T08:00:00.000Z'
  },
  {
    id: 'log-002',
    userId: 'usr-admin-1',
    userName: 'พ.อ. ชนินทร์ ปฏิบัติการ',
    userRole: 'ADMIN',
    action: 'APPROVE_USER',
    actionBadge: 'emerald',
    actionLabel: 'อนุมัติผู้ใช้งาน',
    details: 'อนุมัติการใช้งานบัญชี ร.อ. สมหมาย กล้าหาญ (พล.ร.9) กำหนดบทบาท เจ้าหน้าที่หน่วย',
    ip: '10.200.2.168',
    device: 'Windows PC (Edge)',
    createdAt: '2026-11-02T09:15:00.000Z'
  },
  {
    id: 'log-003',
    userId: 'usr-pending-1',
    userName: 'ร.ท. วีรชัย ใจหาญ',
    userRole: 'UNIT_OFFICER',
    action: 'REGISTER',
    actionBadge: 'amber',
    actionLabel: 'ลงทะเบียนใหม่',
    details: 'ลงทะเบียนขอเข้าใช้งานระบบใหม่ สังกัด มทบ.11 (สถานะ: รอการอนุมัติ)',
    ip: '103.146.204.84',
    device: 'สมาร์ตโฟน (Android)',
    createdAt: '2026-11-05T08:30:00.000Z'
  },
  {
    id: 'log-004',
    userId: 'usr-pending-2',
    userName: 'พ.ต. ณัฐพล มั่นคง',
    userRole: 'KSP_OFFICER',
    action: 'REGISTER',
    actionBadge: 'amber',
    actionLabel: 'ลงทะเบียนใหม่',
    details: 'ลงทะเบียนขอเข้าใช้งานระบบใหม่ สังกัด กสพ.กพ.ทบ. (สถานะ: รอการอนุมัติ)',
    ip: '172.16.20.55',
    device: 'MacBook / macOS (Safari)',
    createdAt: '2026-11-06T02:15:00.000Z'
  },
  {
    id: 'log-005',
    userId: 'usr-admin-1',
    userName: 'พ.อ. ชนินทร์ ปฏิบัติการ',
    userRole: 'ADMIN',
    action: 'LOGIN',
    actionBadge: 'cyan',
    actionLabel: 'เข้าสู่ระบบ',
    details: 'เข้าสู่ระบบสำเร็จผ่านการยืนยันตัวตนระดับผู้ดูแลระบบ',
    ip: '10.200.2.168',
    device: 'Windows PC (Chrome)',
    createdAt: '2026-11-06T08:00:00.000Z'
  }
];

// Seed คำร้องเสนอรับสินไหมเริ่มต้น
const initialClaims = [
  {
    id: 'CLM-2026-0001',
    trackingCode: 'ทบ-กพ-67/012',
    reporterId: 'usr-unit-1',
    reporterName: 'ร.อ. สมหมาย กล้าหาญ',
    unitId: '9th_INF_DIV',
    unitName: 'กองพลทหารราบที่ 9 (พล.ร.9)',
    reportDate: '2026-10-15',
    lossDate: '2026-10-10',
    casualtyRank: 'ส.อ.',
    casualtyFirstName: 'ประวิทย์',
    casualtyLastName: 'มั่นคง',
    casualtyCitizenId: '3100500112233',
    casualtyBirthDate: '1995-04-12',
    casualtyGender: 'ชาย',
    personnelType: 'นายทหารประทวน',
    lossType: 'DECEASED', // เสียชีวิต
    claimType: 'HIGH_RISK', // หน้าที่สำคัญหรือเสี่ยงภัย
    incidentType: 'COMBAT', // การรบ/ปะทะ
    isDriver: 'NO',
    alcoholTestResult: 'NOT_EXCEEDED',
    compensationAmount: 300000,
    deathCertificateCause: 'บาดแผลจากสะเก็ดระเบิดรุนแรงหลายแห่ง เสียเลือดมากในช่องอก',
    lossSpecificCause: 'บาดแผลจากสะเก็ดระเบิดรุนแรงหลายแห่ง เสียเลือดมากในช่องอก',
    causeOfLoss: 'ถูกซุ่มโจมตีด้วยระเบิดแสวงเครื่องขณะลาดตระเวนรักษาความปลอดภัยเส้นทาง',
    locationOfLoss: {
      locationName: 'ถนนสายชนบท บ.บาเจาะ',
      houseNumber: '',
      village: '3',
      soi: '',
      street: 'ทล.410',
      subdistrict: 'บาเจาะ',
      district: 'บันนังสตา',
      province: 'ยะลา',
      lat: 6.2625,
      lng: 101.2612,
      fullAddress: '[ถนนสายชนบท บ.บาเจาะ] หมู่ 3 ถนนทล.410 ต.บาเจาะ อ.บันนังสตา จ.ยะลา'
    },
    status: 'UNDER_REVIEW',
    slaTargetDays: 30,
    createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(), // 6 วันก่อน
    documents: REQUIRED_DOCUMENTS.map((doc) => ({
      index: doc.index,
      name: doc.name,
      uploaded: true,
      fileName: `doc_${doc.index}_attached.pdf`,
      fileUrl: `/uploads/sample_${doc.index}.pdf`,
      status: doc.index === 8 ? 'REJECTED' : 'VERIFIED',
      comment: doc.index === 8 ? 'ผลตรวจระดับแอลกอฮอล์ยังไม่ระบุตราประทับแพทย์ กรุณาส่งฉบับจริง' : 'เอกสารถูกต้องครบถ้วน'
    })),
    timeline: [
      {
        action: 'SUBMIT_CLAIM',
        by: 'ร.อ. สมหมาย กล้าหาญ (พล.ร.9)',
        timestamp: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
        remark: 'ยื่นเสนอขอรับเงินค่าสินไหมทดแทนกรณีเสี่ยงภัย 300,000 บาท'
      },
      {
        action: 'KSP_RECEIVED',
        by: 'พ.ท. อภิสิทธิ์ กสพการ (กพ.ทบ.)',
        timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        remark: 'รับเรื่องตรวจหลักฐาน พบเอกสารหมายเลข 8 ยังไม่สมบูรณ์'
      }
    ]
  },
  {
    id: 'CLM-2026-0002',
    trackingCode: 'ทบ-กพ-67/008',
    reporterId: 'usr-unit-2',
    reporterName: 'พ.ต. ยุทธนา มีชัย',
    unitId: 'RANGERS_REG_41',
    unitName: 'กรมทหารพรานที่ 41',
    reportDate: '2026-09-18',
    lossDate: '2026-09-12',
    casualtyRank: 'อส.ทพ.',
    casualtyFirstName: 'เดชา',
    casualtyLastName: 'แสงสุข',
    casualtyCitizenId: '1909800223344',
    casualtyGender: 'ชาย',
    personnelType: 'อส.ทพ. (อาสาสมัครทหารพราน)',
    lossType: 'DISABLED', // พิการทุพพลภาพ
    claimType: 'HIGH_RISK', // หน้าที่สำคัญหรือเสี่ยงภัย
    incidentType: 'COMBAT', // การรบ/ปะทะ
    isDriver: 'NO',
    alcoholTestResult: 'NOT_EXCEEDED',
    compensationAmount: 300000,
    disabledOrganDetail: 'สูญเสียขาทั้งสองข้างระดับเหนือเข่า',
    lossSpecificCause: 'สูญเสียขาทั้งสองข้างระดับเหนือเข่าเนื่องจากสะเก็ดระเบิดแสวงเครื่อง',
    causeOfLoss: 'เหยียบกับระเบิดขณะปฏิบัติการปิดล้อมตรวจค้น ทำให้สูญเสียขาทั้งสองข้างระดับเหนือเข่า',
    status: 'PAID',
    slaTargetDays: 30,
    createdAt: new Date(Date.now() - 33 * 24 * 3600 * 1000).toISOString(), // 33 วันก่อน (เคยเกิน SLA)
    delayReason: 'รอหนังสือคำสั่งปลดออกจากราชการเนื่องจากทุพพลภาพจากกรมกำลังพล และรอผลตรวจประเมินแพทย์ผู้เชี่ยวชาญ',
    delayAttachmentUrl: '/uploads/delay_justification.pdf',
    insurancePaymentSlip: '/uploads/transfer_slip_300k.pdf',
    paidAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    approvalDocument: {
      docNumber: 'กห ๐๔๐๑/อนุมัติ-๖๗/๐๐๘',
      approvedDate: '2026-10-02',
      approverName: 'พล.ท. พงศกร จิราภรณ์',
      approverTitle: 'เจ้ากรมกำลังพลทหารบก (จก.กพ.ทบ.)',
      fileName: 'คำสั่งอนุมัติสิทธิเงินสินไหม_ทบ_กพ_67_008.pdf',
      fileSize: '1.4 MB',
      notes: 'อนุมัติการขอรับสิทธิเงินสินไหมทดแทน และส่งเอกสารตัวเรื่องให้ บริษัท ทิพยประกันภัย จำกัด (มหาชน) ตรวจสอบรับทราบการได้รับอนุมัติให้จ่ายเงินจากผู้บังคับบัญชา เพื่อดำเนินการโอนเงินให้แก่ทายาทต่อไป',
      uploadedAt: '2026-10-02T11:00:00Z',
      uploadedBy: 'พล.ท. พงศกร จิราภรณ์ (COMMANDER)'
    },
    documents: REQUIRED_DOCUMENTS.map((doc) => ({
      index: doc.index,
      name: doc.name,
      uploaded: doc.index !== 2, // ข้อ 2 ใบมรณบัตร ยกเว้นไม่ต้องแนบสำหรับพิการทุพพลภาพ
      fileName: doc.index !== 2 ? `doc_${doc.index}_signed.pdf` : '',
      fileUrl: doc.index !== 2 ? `/uploads/sample_${doc.index}.pdf` : '',
      status: doc.index !== 2 ? 'VERIFIED' : 'PENDING',
      comment: doc.index === 2 ? 'ยกเว้นไม่ต้องแนบเนื่องจากเป็นกรณีทุพพลภาพ' : 'ผ่านการตรวจสอบ'
    })),
    timeline: [
      { action: 'SUBMIT_CLAIM', by: 'พ.ต. ยุทธนา มีชัย', timestamp: '2026-09-18T09:00:00Z', remark: 'ยื่นเรื่อง' },
      { action: 'KSP_VERIFIED', by: 'กสพ.กพ.ทบ.', timestamp: '2026-09-25T14:30:00Z', remark: 'เอกสารครบถ้วน เสนอ จก.กพ.ทบ.' },
      { action: 'COMMANDER_APPROVED', by: 'พล.ท. พงศกร (จก.กพ.ทบ.)', timestamp: '2026-10-02T11:00:00Z', remark: 'อนุมัติจ่ายเงินสินไหม 300,000 บาท' },
      { action: 'INSURANCE_TRANSFERRED', by: 'บ.ทิพยประกันภัย', timestamp: '2026-10-19T10:15:00Z', remark: 'โอนเงินเข้าบัญชีทายาทเรียบร้อย เลขที่อ้างอิง TX998124' }
    ]
  },
  {
    id: 'CLM-2026-0003',
    trackingCode: 'ทบ-กพ-67/015',
    reporterId: 'usr-unit-1',
    reporterName: 'ร.อ. สมหมาย กล้าหาญ',
    unitId: '9th_INF_DIV',
    unitName: 'กองพลทหารราบที่ 9 (พล.ร.9)',
    reportDate: '2026-10-18',
    lossDate: '2026-10-16',
    casualtyRank: 'พลทหาร',
    casualtyFirstName: 'ธนกฤต',
    casualtyLastName: 'แก้ววิเชียร',
    casualtyCitizenId: '1700100554422',
    casualtyGender: 'ชาย',
    personnelType: 'พลทหาร',
    lossType: 'DECEASED',
    claimType: 'NORMAL', // ยามปกติ 60,000 บาท
    incidentType: 'ILLNESS', // ป่วย (หัวใจวายขณะฝึก)
    isDriver: 'NO',
    alcoholTestResult: 'NOT_EXCEEDED',
    compensationAmount: 60000,
    deathCertificateCause: 'ภาวะกล้ามเนื้อหัวใจขาดเลือดเฉียบพลัน (Acute Myocardial Infarction)',
    lossSpecificCause: 'ภาวะกล้ามเนื้อหัวใจขาดเลือดเฉียบพลัน (Acute Myocardial Infarction)',
    causeOfLoss: 'หัวใจวายเฉียบพลันขณะประจำการฝึกภาคสนาม',
    status: 'SUBMITTED',
    slaTargetDays: 30,
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    documents: REQUIRED_DOCUMENTS.map((doc) => ({
      index: doc.index,
      name: doc.name,
      uploaded: [1, 2, 3, 4, 5, 6, 8].includes(doc.index),
      fileName: `doc_${doc.index}.pdf`,
      fileUrl: `/uploads/sample_${doc.index}.pdf`,
      status: 'PENDING',
      comment: ''
    })),
    timeline: [
      { action: 'SUBMIT_CLAIM', by: 'ร.อ. สมหมาย กล้าหาญ', timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), remark: 'ยื่นเสนอขอรับสินไหมยามปกติ 60,000 บาท' }
    ]
  },
  {
    id: 'CLM-2026-0004',
    trackingCode: 'ทบ-กพ-67/021',
    reporterId: 'usr-unit-1',
    reporterName: 'ร.อ. สมหมาย กล้าหาญ',
    unitId: '9th_INF_DIV',
    unitName: 'กองพลทหารราบที่ 9 (พล.ร.9)',
    reportDate: '2026-10-22',
    lossDate: '2026-10-20',
    casualtyRank: 'ร.ท.',
    casualtyFirstName: 'ณัฐพงษ์',
    casualtyLastName: 'แก้วมณี',
    casualtyCitizenId: '1100500998811',
    casualtyBirthDate: '1992-08-15',
    casualtyGender: 'ชาย',
    personnelType: 'นายทหารสัญญาบัตร',
    lossType: 'DECEASED',
    claimType: 'HIGH_RISK',
    incidentType: 'COMBAT',
    isDriver: 'NO',
    alcoholTestResult: 'NOT_EXCEEDED',
    compensationAmount: 300000,
    deathCertificateCause: 'บาดแผลจากกระสุนปืนทำลายอวัยวะสำคัญภายในช่องอก',
    lossSpecificCause: 'บาดแผลจากกระสุนปืนทำลายอวัยวะสำคัญภายในช่องอก',
    causeOfLoss: 'ถูกซุ่มยิงขณะนำกำลังเข้าปิดล้อมตรวจค้นพื้นที่เป้าหมายความมั่นคง',
    locationOfLoss: {
      locationName: 'ต.รือเสาะ อ.รือเสาะ จ.นราธิวาส',
      fullAddress: 'หมู่ 4 ต.รือเสาะ อ.รือเสาะ จ.นราธิวาส'
    },
    status: 'PENDING_APPROVAL', // ขั้นที่ 3: รอ จก.กพ.ทบ. อนุมัติ
    slaTargetDays: 30,
    createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    documents: REQUIRED_DOCUMENTS.map((doc) => ({
      index: doc.index,
      name: doc.name,
      uploaded: true,
      fileName: `doc_${doc.index}_verified.pdf`,
      fileUrl: `/uploads/sample_${doc.index}.pdf`,
      status: 'VERIFIED',
      comment: 'กสพ.กพ.ทบ. ตรวจสอบเอกสารความถูกต้องครบถ้วนสมบูรณ์แล้ว'
    })),
    timeline: [
      { action: 'SUBMIT_CLAIM', by: 'ร.อ. สมหมาย กล้าหาญ', timestamp: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(), remark: 'ยื่นเสนอขอรับเงินสินไหมเสี่ยงภัย 300,000 บาท' },
      { action: 'UNDER_REVIEW', by: 'พ.ท. อภิสิทธิ์ กสพการ (กพ.ทบ.)', timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), remark: 'รับเรื่องและตรวจเอกสารครบ 10 รายการ' },
      { action: 'PENDING_APPROVAL', by: 'พ.ท. อภิสิทธิ์ กสพการ (กพ.ทบ.)', timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), remark: 'เอกสารถูกต้องครบถ้วน เสนอผู้บังคับบัญชา (จก.กพ.ทบ.) พิจารณาอนุมัติ' }
    ]
  },
  {
    id: 'CLM-2026-0005',
    trackingCode: 'ทบ-กพ-67/025',
    reporterId: 'usr-unit-2',
    reporterName: 'พ.ต. ยุทธนา มีชัย',
    unitId: 'RANGERS_REG_41',
    unitName: 'กรมทหารพรานที่ 41',
    reportDate: '2026-10-25',
    lossDate: '2026-10-22',
    casualtyRank: 'อส.ทพ.',
    casualtyFirstName: 'สมพงษ์',
    casualtyLastName: 'คงเจริญ',
    casualtyCitizenId: '1909800334455',
    casualtyBirthDate: '1998-11-20',
    casualtyGender: 'ชาย',
    personnelType: 'อส.ทพ. (อาสาสมัครทหารพราน)',
    lossType: 'DECEASED',
    claimType: 'HIGH_RISK',
    incidentType: 'COMBAT',
    isDriver: 'NO',
    alcoholTestResult: 'NOT_EXCEEDED',
    compensationAmount: 300000,
    deathCertificateCause: 'ช็อกจากการเสียเลือดและแผลสะเก็ดระเบิดรุนแรง',
    lossSpecificCause: 'ช็อกจากการเสียเลือดและแผลสะเก็ดระเบิดรุนแรง',
    causeOfLoss: 'ถูกลอบวางระเบิดขณะลาดตระเวนรักษาความปลอดภัยครูและโรงเรียน',
    locationOfLoss: {
      locationName: 'ต.กายูบอเกาะ อ.รามัน จ.ยะลา',
      fullAddress: 'หมู่ 2 ต.กายูบอเกาะ อ.รามัน จ.ยะลา'
    },
    status: 'APPROVED', // ขั้นที่ 4: จก.กพ.ทบ. อนุมัติแล้ว พร้อมแนบตัวเรื่องส่ง บ.ประกันภัย
    slaTargetDays: 30,
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    approvalDocument: {
      docNumber: 'กห ๐๔๐๑/อนุมัติ-๖๗/๐๒๕',
      approvedDate: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString().split('T')[0],
      approverName: 'พล.ท. พงศกร จิราภรณ์',
      approverTitle: 'เจ้ากรมกำลังพลทหารบก (จก.กพ.ทบ.)',
      fileName: 'คำสั่งอนุมัติสิทธิเงินสินไหม_ทบ_กพ_67_025.pdf',
      fileSize: '1.4 MB',
      notes: 'อนุมัติการขอรับสิทธิเงินสินไหมทดแทน และส่งเอกสารตัวเรื่องให้ บริษัท ทิพยประกันภัย จำกัด (มหาชน) ตรวจสอบรับทราบการได้รับอนุมัติให้จ่ายเงินจากผู้บังคับบัญชา เพื่อดำเนินการโอนเงินให้แก่ทายาทต่อไป',
      uploadedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      uploadedBy: 'พล.ท. พงศกร จิราภรณ์ (COMMANDER)'
    },
    documents: REQUIRED_DOCUMENTS.map((doc) => ({
      index: doc.index,
      name: doc.name,
      uploaded: true,
      fileName: `doc_${doc.index}_verified.pdf`,
      fileUrl: `/uploads/sample_${doc.index}.pdf`,
      status: 'VERIFIED',
      comment: 'ผ่านการตรวจสอบ'
    })),
    timeline: [
      { action: 'SUBMIT_CLAIM', by: 'พ.ต. ยุทธนา มีชัย', timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(), remark: 'ยื่นเรื่องขอรับสินไหม 300,000 บาท' },
      { action: 'PENDING_APPROVAL', by: 'พ.ท. อภิสิทธิ์ กสพการ (กพ.ทบ.)', timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), remark: 'ตรวจเอกสารครบถ้วน เสนอ จก.กพ.ทบ. อนุมัติ' },
      { action: 'APPROVED', by: 'พล.ท. พงศกร จิราภรณ์ (จก.กพ.ทบ.)', timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), remark: 'จก.กพ.ทบ. อนุมัติการจ่ายเงินสินไหมทดแทน (คำสั่งเลขที่ กห ๐๔๐๑/อนุมัติ-๖๗/๐๒๕) พร้อมแนบตัวเรื่องส่ง บ.ประกันภัย' }
    ]
  },
  // --- Historical Claims for Multi-Year & Monthly Fiscal Comparisons ---
  // ปีงบประมาณ 2567 (1 ต.ค. 2566 - 30 ก.ย. 2567)
  {
    id: 'CLM-2567-0001',
    trackingCode: 'ทบ-กพ-66/089',
    unitName: 'กองพลทหารราบที่ 9 (พล.ร.9)',
    reportDate: '2023-10-18',
    lossDate: '2023-10-15',
    casualtyRank: 'ส.ต.',
    casualtyFirstName: 'วิชาญ',
    casualtyLastName: 'คงกระพัน',
    casualtyCitizenId: '3100500112201',
    personnelType: 'นายทหารประทวน',
    lossType: 'DECEASED',
    claimType: 'HIGH_RISK',
    compensationAmount: 300000,
    causeOfLoss: 'ถูกซุ่มยิงขณะลาดตระเวนชายแดน',
    status: 'PAID',
    createdAt: '2023-10-18T08:30:00Z'
  },
  {
    id: 'CLM-2567-0002',
    trackingCode: 'ทบ-กพ-66/102',
    unitName: 'กรมทหารพรานที่ 41',
    reportDate: '2023-12-08',
    lossDate: '2023-12-04',
    casualtyRank: 'อส.ทพ.',
    casualtyFirstName: 'สมศักดิ์',
    casualtyLastName: 'ศรีสวัสดิ์',
    casualtyCitizenId: '1909800223302',
    personnelType: 'อส.ทพ. (อาสาสมัครทหารพราน)',
    lossType: 'DISABLED',
    claimType: 'HIGH_RISK',
    compensationAmount: 300000,
    causeOfLoss: 'สะเก็ดระเบิดสูญเสียขาทั้ง 2 ข้าง',
    status: 'PAID',
    createdAt: '2023-12-08T09:00:00Z'
  },
  {
    id: 'CLM-2567-0003',
    trackingCode: 'ทบ-กพ-67/018',
    unitName: 'กองพลทหารราบที่ 15',
    reportDate: '2024-02-14',
    lossDate: '2024-02-10',
    casualtyRank: 'พลทหาร',
    casualtyFirstName: 'มานพ',
    casualtyLastName: 'แสงทอง',
    casualtyCitizenId: '1700100554403',
    personnelType: 'พลทหาร',
    lossType: 'DECEASED',
    claimType: 'NORMAL',
    compensationAmount: 60000,
    causeOfLoss: 'ไข้ป่ามาลาเรียขึ้นสมองระหว่างเข้าค่ายประจำการ',
    status: 'PAID',
    createdAt: '2024-02-14T10:00:00Z'
  },
  {
    id: 'CLM-2567-0004',
    trackingCode: 'ทบ-กพ-67/045',
    unitName: 'กองพลทหารราบที่ 4',
    reportDate: '2024-05-22',
    lossDate: '2024-05-18',
    casualtyRank: 'ร.ท.',
    casualtyFirstName: 'เกียรติศักดิ์',
    casualtyLastName: 'วัฒนา',
    casualtyCitizenId: '1100500123404',
    personnelType: 'นายทหารสัญญาบัตร',
    lossType: 'DECEASED',
    claimType: 'HIGH_RISK',
    compensationAmount: 300000,
    causeOfLoss: 'ปะทะขบวนการลักลอบตัดไม้พะยูงชายแดน',
    status: 'PAID',
    createdAt: '2024-05-22T11:00:00Z'
  },
  {
    id: 'CLM-2567-0005',
    trackingCode: 'ทบ-กพ-67/072',
    unitName: 'กองพลทหารราบที่ 2 รักษาพระองค์',
    reportDate: '2024-08-16',
    lossDate: '2024-08-12',
    casualtyRank: 'จ.ส.อ.',
    casualtyFirstName: 'บุญเลิศ',
    casualtyLastName: 'สุขใจ',
    casualtyCitizenId: '3100500112205',
    personnelType: 'นายทหารประทวน',
    lossType: 'DISABLED',
    claimType: 'NORMAL',
    compensationAmount: 60000,
    causeOfLoss: 'กระดูกสันหลังหักทุพพลภาพขณะฝึกทางยุทธวิธี',
    status: 'PAID',
    createdAt: '2024-08-16T14:00:00Z'
  },

  // ปีงบประมาณ 2568 (1 ต.ค. 2567 - 30 ก.ย. 2568)
  {
    id: 'CLM-2568-0001',
    trackingCode: 'ทบ-กพ-67/110',
    unitName: 'กองพลทหารราบที่ 9 (พล.ร.9)',
    reportDate: '2024-10-15',
    lossDate: '2024-10-11',
    casualtyRank: 'ส.อ.',
    casualtyFirstName: 'อดุลย์',
    casualtyLastName: 'คงมั่น',
    casualtyCitizenId: '3100500112211',
    personnelType: 'นายทหารประทวน',
    lossType: 'DECEASED',
    claimType: 'HIGH_RISK',
    compensationAmount: 300000,
    causeOfLoss: 'ลอบวางระเบิดรถยนต์สายตรวจ',
    status: 'PAID',
    createdAt: '2024-10-15T09:00:00Z'
  },
  {
    id: 'CLM-2568-0002',
    trackingCode: 'ทบ-กพ-67/125',
    unitName: 'กรมทหารพรานที่ 41',
    reportDate: '2024-11-20',
    lossDate: '2024-11-16',
    casualtyRank: 'อส.ทพ.',
    casualtyFirstName: 'ธนา',
    casualtyLastName: 'ภักดี',
    casualtyCitizenId: '1909800223312',
    personnelType: 'อส.ทพ. (อาสาสมัครทหารพราน)',
    lossType: 'DISABLED',
    claimType: 'HIGH_RISK',
    compensationAmount: 300000,
    causeOfLoss: 'เหยียบกับระเบิดขาขวาขาดระดับข้อเท้า',
    status: 'PAID',
    createdAt: '2024-11-20T10:30:00Z'
  },
  {
    id: 'CLM-2568-0003',
    trackingCode: 'ทบ-กพ-68/005',
    unitName: 'กองพลทหารราบที่ 3',
    reportDate: '2025-01-12',
    lossDate: '2025-01-08',
    casualtyRank: 'พลทหาร',
    casualtyFirstName: 'อนุสรณ์',
    casualtyLastName: 'คำดี',
    casualtyCitizenId: '1700100554413',
    personnelType: 'พลทหาร',
    lossType: 'DECEASED',
    claimType: 'NORMAL',
    compensationAmount: 60000,
    causeOfLoss: 'หัวใจวายเฉียบพลันระหว่างฝึกประจำการ',
    status: 'PAID',
    createdAt: '2025-01-12T11:00:00Z'
  },
  {
    id: 'CLM-2568-0004',
    trackingCode: 'ทบ-กพ-68/028',
    unitName: 'กองพลทหารราบที่ 15',
    reportDate: '2025-03-18',
    lossDate: '2025-03-14',
    casualtyRank: 'ร.อ.',
    casualtyFirstName: 'ปิยะ',
    casualtyLastName: 'หาญศึก',
    casualtyCitizenId: '1100500123414',
    personnelType: 'นายทหารสัญญาบัตร',
    lossType: 'DECEASED',
    claimType: 'HIGH_RISK',
    compensationAmount: 300000,
    causeOfLoss: 'ปะทะกลุ่มผู้ก่อความไม่สงบ',
    status: 'PAID',
    createdAt: '2025-03-18T13:00:00Z'
  },
  {
    id: 'CLM-2568-0005',
    trackingCode: 'ทบ-กพ-68/042',
    unitName: 'กองพลทหารราบที่ 4',
    reportDate: '2025-05-14',
    lossDate: '2025-05-10',
    casualtyRank: 'ส.ต.',
    casualtyFirstName: 'สุรเชษฐ์',
    casualtyLastName: 'บุญมี',
    casualtyCitizenId: '3100500112215',
    personnelType: 'นายทหารประทวน',
    lossType: 'DISABLED',
    claimType: 'HIGH_RISK',
    compensationAmount: 300000,
    causeOfLoss: 'สะเก็ดระเบิดสูญเสียการมองเห็นตาข้างขวา',
    status: 'PAID',
    createdAt: '2025-05-14T09:00:00Z'
  },
  {
    id: 'CLM-2568-0006',
    trackingCode: 'ทบ-กพ-68/065',
    unitName: 'กองพลทหารราบที่ 6',
    reportDate: '2025-07-22',
    lossDate: '2025-07-18',
    casualtyRank: 'พลทหาร',
    casualtyFirstName: 'ธีระพงษ์',
    casualtyLastName: 'จิตมั่น',
    casualtyCitizenId: '1700100554416',
    personnelType: 'พลทหาร',
    lossType: 'DECEASED',
    claimType: 'NORMAL',
    compensationAmount: 60000,
    causeOfLoss: 'ไข้เลือดออกรุนแรงขณะปฏิบัติการชายแดน',
    status: 'PAID',
    createdAt: '2025-07-22T14:30:00Z'
  },
  {
    id: 'CLM-2568-0007',
    trackingCode: 'ทบ-กพ-68/088',
    unitName: 'กรมทหารพรานที่ 45',
    reportDate: '2025-09-08',
    lossDate: '2025-09-04',
    casualtyRank: 'อส.ทพ.',
    casualtyFirstName: 'มนัส',
    casualtyLastName: 'แสงทอง',
    casualtyCitizenId: '1909800223317',
    personnelType: 'อส.ทพ. (อาสาสมัครทหารพราน)',
    lossType: 'DECEASED',
    claimType: 'HIGH_RISK',
    compensationAmount: 300000,
    causeOfLoss: 'ถูกซุ่มโจมตีขณะลาดตระเวนเดินเท้า',
    status: 'PAID',
    createdAt: '2025-09-08T10:00:00Z'
  },

  // ปีงบประมาณ 2569 (1 ต.ค. 2568 - 30 ก.ย. 2569)
  {
    id: 'CLM-2569-0001',
    trackingCode: 'ทบ-กพ-68/105',
    unitName: 'กองพลทหารราบที่ 9 (พล.ร.9)',
    reportDate: '2025-10-14',
    lossDate: '2025-10-10',
    casualtyRank: 'ส.อ.',
    casualtyFirstName: 'ประเสริฐ',
    casualtyLastName: 'แก้วงาม',
    casualtyCitizenId: '3100500112221',
    personnelType: 'นายทหารประทวน',
    lossType: 'DECEASED',
    claimType: 'HIGH_RISK',
    compensationAmount: 300000,
    causeOfLoss: 'ลอบวางระเบิดชุด รปภ.ครู',
    status: 'PAID',
    createdAt: '2025-10-14T09:15:00Z'
  },
  {
    id: 'CLM-2569-0002',
    trackingCode: 'ทบ-กพ-68/118',
    unitName: 'กรมทหารพรานที่ 41',
    reportDate: '2025-11-18',
    lossDate: '2025-11-14',
    casualtyRank: 'อส.ทพ.',
    casualtyFirstName: 'กิตติพงษ์',
    casualtyLastName: 'วรสาร',
    casualtyCitizenId: '1909800223322',
    personnelType: 'อส.ทพ. (อาสาสมัครทหารพราน)',
    lossType: 'DISABLED',
    claimType: 'HIGH_RISK',
    compensationAmount: 300000,
    causeOfLoss: 'กับระเบิดขาซ้ายขาดใต้เข่า',
    status: 'PAID',
    createdAt: '2025-11-18T10:00:00Z'
  },
  {
    id: 'CLM-2569-0003',
    trackingCode: 'ทบ-กพ-68/132',
    unitName: 'กองพลทหารราบที่ 15',
    reportDate: '2025-12-22',
    lossDate: '2025-12-19',
    casualtyRank: 'พลทหาร',
    casualtyFirstName: 'ชัยวัฒน์',
    casualtyLastName: 'ศรีบุญ',
    casualtyCitizenId: '1700100554423',
    personnelType: 'พลทหาร',
    lossType: 'DECEASED',
    claimType: 'NORMAL',
    compensationAmount: 60000,
    causeOfLoss: 'ลมแดดเฉียบพลันขณะฝึกทางยุทธวิธี',
    status: 'PAID',
    createdAt: '2025-12-22T14:00:00Z'
  },
  {
    id: 'CLM-2569-0004',
    trackingCode: 'ทบ-กพ-69/012',
    unitName: 'กองพลทหารราบที่ 4',
    reportDate: '2026-01-16',
    lossDate: '2026-01-12',
    casualtyRank: 'ร.ต.',
    casualtyFirstName: 'วรภัทร',
    casualtyLastName: 'เด่นดวง',
    casualtyCitizenId: '1100500123424',
    personnelType: 'นายทหารสัญญาบัตร',
    lossType: 'DECEASED',
    claimType: 'HIGH_RISK',
    compensationAmount: 300000,
    causeOfLoss: 'ปะทะขบวนการค้ายาเสพติดชายแดนภาคเหนือ',
    status: 'PAID',
    createdAt: '2026-01-16T11:00:00Z'
  },
  {
    id: 'CLM-2569-0005',
    trackingCode: 'ทบ-กพ-69/035',
    unitName: 'กองพลทหารราบที่ 5',
    reportDate: '2026-03-12',
    lossDate: '2026-03-08',
    casualtyRank: 'ส.ต.',
    casualtyFirstName: 'วีรยุทธ',
    casualtyLastName: 'ใจกล้า',
    casualtyCitizenId: '3100500112225',
    personnelType: 'นายทหารประทวน',
    lossType: 'DISABLED',
    claimType: 'HIGH_RISK',
    compensationAmount: 300000,
    causeOfLoss: 'สะเก็ดระเบิดสูญเสียการได้ยินถาวรและตาขวา',
    status: 'PAID',
    createdAt: '2026-03-12T13:30:00Z'
  },
  {
    id: 'CLM-2569-0006',
    trackingCode: 'ทบ-กพ-69/052',
    unitName: 'กรมทหารพรานที่ 45',
    reportDate: '2026-04-20',
    lossDate: '2026-04-16',
    casualtyRank: 'อส.ทพ.',
    casualtyFirstName: 'พงษ์ศักดิ์',
    casualtyLastName: 'นาวา',
    casualtyCitizenId: '1909800223326',
    personnelType: 'อส.ทพ. (อาสาสมัครทหารพราน)',
    lossType: 'DECEASED',
    claimType: 'HIGH_RISK',
    compensationAmount: 300000,
    causeOfLoss: 'ปะทะขณะปิดล้อมตรวจค้นเป้าหมาย',
    status: 'PAID',
    createdAt: '2026-04-20T10:00:00Z'
  },
  {
    id: 'CLM-2569-0007',
    trackingCode: 'ทบ-กพ-69/068',
    unitName: 'กองพลทหารราบที่ 7',
    reportDate: '2026-06-15',
    lossDate: '2026-06-11',
    casualtyRank: 'พลทหาร',
    casualtyFirstName: 'ธนากร',
    casualtyLastName: 'คงเจริญ',
    casualtyCitizenId: '1700100554427',
    personnelType: 'พลทหาร',
    lossType: 'DECEASED',
    claimType: 'NORMAL',
    compensationAmount: 60000,
    causeOfLoss: 'อุบัติเหตุยานยนต์ลำเลียงพลระหว่างสับเปลี่ยนกำลัง',
    status: 'PAID',
    createdAt: '2026-06-15T09:30:00Z'
  },
  {
    id: 'CLM-2569-0008',
    trackingCode: 'ทบ-กพ-69/085',
    unitName: 'กองพลทหารราบที่ 2 รักษาพระองค์',
    reportDate: '2026-07-28',
    lossDate: '2026-07-24',
    casualtyRank: 'จ.ส.ท.',
    casualtyFirstName: 'สมปอง',
    casualtyLastName: 'ยอดเยี่ยม',
    casualtyCitizenId: '3100500112228',
    personnelType: 'นายทหารประทวน',
    lossType: 'DISABLED',
    claimType: 'NORMAL',
    compensationAmount: 60000,
    causeOfLoss: 'แขนหักและเอ็นฉีกขาดถาวรจากการซ้อมรบทางอากาศ',
    status: 'PAID',
    createdAt: '2026-07-28T15:00:00Z'
  }
];

// Seed คู่มือการใช้งานและเอกสารประกอบดาวน์โหลด
const initialManuals = [
  {
    id: 'man-1',
    title: 'แบบรายงาน กพ.4 (แบบรายงานการสูญเสียกำลังพล)',
    format: 'PDF',
    size: '1.2 MB',
    desc: 'แบบฟอร์มมาตรฐานสำหรับผู้บังคับหน่วยรายงานการสูญเสียกำลังพล',
    fileUrl: '/downloads/form_kp4.pdf',
    category: 'แบบฟอร์มรายงาน',
    updatedAt: '2026-10-20'
  },
  {
    id: 'man-2',
    title: 'หนังสือแสดงเจตนาทายาทผู้มีสิทธิรับเงินสินไหมทดแทน',
    format: 'PDF',
    size: '850 KB',
    desc: 'หนังสือมอบอำนาจและการแสดงเจตนายินยอมรับเงินของทายาทตามกฎหมาย',
    fileUrl: '/downloads/heir_authorization.pdf',
    category: 'เอกสารทายาท',
    updatedAt: '2026-10-20'
  },
  {
    id: 'man-3',
    title: 'คู่มือระเบียบ กห. และ ทบ. ว่าด้วยการประกันชีวิตกำลังพล',
    format: 'PDF',
    size: '3.4 MB',
    desc: 'ระเบียบหลักเกณฑ์การจ่ายเงินสินไหมทดแทน 60,000 บาท และ 300,000 บาท',
    fileUrl: '/downloads/rta_life_insurance_rule.pdf',
    category: 'ระเบียบข้อบังคับ',
    updatedAt: '2026-10-15'
  },
  {
    id: 'man-4',
    title: 'แบบตรวจสอบเอกสารหลักฐานประกอบ 10 รายการ (Checklist)',
    format: 'PDF',
    size: '620 KB',
    desc: 'รายการตรวจสอบความครบถ้วนก่อนส่งเรื่องมายัง กสพ.กพ.ทบ.',
    fileUrl: '/downloads/doc_checklist_10.pdf',
    category: 'คู่มือตรวจสอบ',
    updatedAt: '2026-10-18'
  },
  {
    id: 'man-5',
    title: 'ตัวอย่างบันทึกการสอบสวนข้อเท็จจริงของหน่วยประกอบการขอรับสิทธิ',
    format: 'DOCX',
    size: '450 KB',
    desc: 'แนวทางการจัดทำสำนวนการสอบสวนกรณีเสียชีวิตหรือทุพพลภาพขณะปฏิบัติหน้าที่',
    fileUrl: '/downloads/sample_investigation_report.docx',
    category: 'ตัวอย่างเอกสาร',
    updatedAt: '2026-10-19'
  }
];

// Seed คลิปวิดีโอแนะนำและสอนการใช้งานระบบ
const initialVideos = [
  {
    id: 'vid-1',
    title: 'ขั้นตอนที่ 1: การลงทะเบียนและยื่นเสนอเรื่องผู้สูญเสียพร้อมแนบ 10 เอกสาร',
    role: 'สำหรับเจ้าหน้าที่หน่วยต้นสังกัด (ผู้เสนอเรื่อง)',
    duration: '4:20 นาที',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    description: 'คู่มือการกรอกข้อมูลผู้สูญเสีย ปักหมุดสถานที่ตามใบมรณบัตร และการแนบเอกสาร กพ.4',
    steps: [
      'เข้าสู่ระบบด้วยบัญชีเจ้าหน้าที่หน่วย',
      'กรอกข้อมูลผู้สูญเสีย ตรวจสอบเลข ปชช. ไม่ให้ซ้ำซ้อน',
      'ปักหมุดพิกัดสถานที่เกิดเหตุตามใบมรณบัตร',
      'อัปโหลดเอกสารประกอบ 10 รายการ'
    ],
    updatedAt: '2026-10-21'
  },
  {
    id: 'vid-2',
    title: 'ขั้นตอนที่ 2: การตรวจเอกสารหลักฐาน และการตีกลับพร้อมคอมเมนต์',
    role: 'สำหรับ กสพ.กพ.ทบ. (เจ้าหน้าที่ตรวจสอบ)',
    duration: '3:45 นาที',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    description: 'การตรวจสอบเอกสาร 10 รายการ การบันทึกผลผ่าน/ตีกลับให้แก้ไข และการเสนอ จก.กพ.ทบ.',
    steps: [
      'เปิดรายการคำร้องที่หน่วยเสนอเรื่อง',
      'ตรวจความสมบูรณ์ของเอกสารแต่ละรายการ',
      'บันทึกข้อคิดเห็นกรณีให้แก้ไข',
      'ส่งต่อเรื่องให้ผู้บังคับบัญชาอนุมัติ'
    ],
    updatedAt: '2026-10-21'
  },
  {
    id: 'vid-3',
    title: 'ขั้นตอนที่ 3 & 4: การอนุมัติของผู้บังคับบัญชา และการโอนเงินของบริษัทประกันภัย',
    role: 'สำหรับ จก.กพ.ทบ. และ บริษัทประกันภัย',
    duration: '3:10 นาที',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    description: 'การลงนามอนุมัติในระบบ และการตรวจสอบจ่ายเงินสินไหม 60,000 หรือ 300,000 บาท',
    steps: [
      'จก.กพ.ทบ. พิจารณาลงนามอนุมัติ',
      'ส่งเรื่องอัตโนมัติไปยัง บ.ประกันภัย',
      'บ.ประกันภัย โอนเงินเข้าบัญชีทายาทพร้อมแนบสลิป',
      'แจ้งเตือนสถานะทันทีบน Telegram'
    ],
    updatedAt: '2026-10-21'
  },
  {
    id: 'vid-4',
    title: 'ขั้นตอนที่ 5: การติดตาม SLA 30 วัน และการรายงานชี้แจงความล่าช้า',
    role: 'สำหรับทุกหน่วยงาน และ สก.ทบ. รับทราบยอด',
    duration: '2:50 นาที',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    description: 'การควบคุมกรอบเวลา SLA 30 วัน เตือนล่วงหน้า 7 วัน และการแนบหนังสือชี้แจงเหตุผล',
    steps: [
      'ระบบตรวจนับจำนวนวันอัตโนมัติ',
      'แจ้งเตือนสีส้มเมื่อเหลือ 7 วัน',
      'ล็อคเตือนสีแดงเมื่อเกิน 30 วัน บังคับให้หน่วยชี้แจง',
      'สก.ทบ. รับทราบยอดปิดเคส'
    ],
    updatedAt: '2026-10-21'
  }
];

// ============================================================
// Seed แบบทดสอบความรู้และข้อสอบ (ระบบจัดการความรู้ของผู้ใช้งาน)
// ============================================================

const initialKnowledgeExams = [
  {
    id: 'exm-claims-basic',
    title: 'แบบทดสอบความรู้การใช้งานระบบเสนอขอรับสิทธิเงินค่าสินไหมทดแทน',
    description: 'ทดสอบความเข้าใจเกี่ยวกับกระบวนการยื่นเสนอเรื่อง การจัดทำเอกสาร และการใช้งานระบบสำหรับเจ้าหน้าที่กำลังพล',
    passingScore: 80,
    timeLimitMinutes: 30,
    questionCount: 10,
    isActive: true,
    openAt: null,
    closeAt: null,
    instructions: 'อ่านคู่มือและวิดีโอในคลังความรู้ก่อนเข้าทำแบบทดสอบ คะแนนเต็ม 100 ต้องได้คะแนนไม่ต่ำกว่า 80 คะแนนจึงผ่านและสามารถใช้งานระบบได้',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const initialKnowledgeQuestions = [
  {
    id: 'q-1',
    examId: 'exm-claims-basic',
    questionText: 'เอกสารใดเป็นเอกสารหลักที่ต้องแนบในการยื่นเสนอเรื่องขอรับเงินสินไหมทดแทน?',
    options: [
      { id: 'a', text: 'สำเนาบัตรประชาชนผู้สูญเสีย', isCorrect: false },
      { id: 'b', text: 'รายงาน กพ.4 (แบบรายงานการสูญเสียกำลังพล)', isCorrect: true },
      { id: 'c', text: 'ใบเสร็จรับเงิน', isCorrect: false },
      { id: 'd', text: 'หนังสือเดินทาง', isCorrect: false }
    ],
    points: 10,
    orderIndex: 1
  },
  {
    id: 'q-2',
    examId: 'exm-claims-basic',
    questionText: 'ระยะเวลาระบุคำร้องสินไหมตามมาตรฐาน SLA คือกี่วัน?',
    options: [
      { id: 'a', text: '15 วัน', isCorrect: false },
      { id: 'b', text: '30 วัน', isCorrect: true },
      { id: 'c', text: '45 วัน', isCorrect: false },
      { id: 'd', text: '60 วัน', isCorrect: false }
    ],
    points: 10,
    orderIndex: 2
  },
  {
    id: 'q-3',
    examId: 'exm-claims-basic',
    questionText: 'หากพบว่าเลขประจำตัวประชาชนผู้สูญเสียเคยมีการยื่นเรื่องในระบบแล้ว จะทำอย่างไร?',
    options: [
      { id: 'a', text: 'ยื่นเรื่องซ้ำได้เลย', isCorrect: false },
      { id: 'b', text: 'ระบบจะป้องกันการยื่นซ้ำและแจ้งเลขอ้างอิงเดิม', isCorrect: true },
      { id: 'c', text: 'ลบข้อมูลเดิมแล้วค่อยยื่นใหม่', isCorrect: false },
      { id: 'd', text: 'ติดต่อบริษัทประกันภัยโดยตรง', isCorrect: false }
    ],
    points: 10,
    orderIndex: 3
  },
  {
    id: 'q-4',
    examId: 'exm-claims-basic',
    questionText: 'ใครเป็นผู้มีอำนาจอนุมัติคำร้องเสนอขอรับเงินสินไหมทดแทน?',
    options: [
      { id: 'a', text: 'เจ้าหน้าที่หน่วย (UNIT_OFFICER)', isCorrect: false },
      { id: 'b', text: 'เจ้ากรมกำลังพลทหารบก (จก.กพ.ทบ.)', isCorrect: true },
      { id: 'c', text: 'บริษัทประกันภัย', isCorrect: false },
      { id: 'd', text: 'สก.ทบ.', isCorrect: false }
    ],
    points: 10,
    orderIndex: 4
  },
  {
    id: 'q-5',
    examId: 'exm-claims-basic',
    questionText: 'คำร้องสถานะใดหมายถึงการโอนเงินสินไหมแล้ว?',
    options: [
      { id: 'a', text: 'SUBMITTED', isCorrect: false },
      { id: 'b', text: 'APPROVED', isCorrect: false },
      { id: 'c', text: 'PAID', isCorrect: true },
      { id: 'd', text: 'REJECTED_BY_KSP', isCorrect: false }
    ],
    points: 10,
    orderIndex: 5
  },
  {
    id: 'q-6',
    examId: 'exm-claims-basic',
    questionText: 'ผู้ใช้งานจะได้รับสิทธิใช้งานระบบเมื่อใด?',
    options: [
      { id: 'a', text: 'ทันทีหลังสมัครสมาชิก', isCorrect: false },
      { id: 'b', text: 'เมื่อผ่านการทดสอบความรู้ในคลังความรู้', isCorrect: true },
      { id: 'c', text: 'หลังจากรอ 7 วันทำการ', isCorrect: false },
      { id: 'd', text: 'เมื่อผู้บังคับบัญชาอนุมัติเป็นรายบุคคล', isCorrect: false }
    ],
    points: 10,
    orderIndex: 6
  },
  {
    id: 'q-7',
    examId: 'exm-claims-basic',
    questionText: 'คะแนนขั้นต่ำที่ต้องได้เพื่อผ่านแบบทดสอบความรู้คือเท่าใด?',
    options: [
      { id: 'a', text: '50 คะแนน', isCorrect: false },
      { id: 'b', text: '60 คะแนน', isCorrect: false },
      { id: 'c', text: '80 คะแนน', isCorrect: true },
      { id: 'd', text: '90 คะแนน', isCorrect: false }
    ],
    points: 10,
    orderIndex: 7
  },
  {
    id: 'q-8',
    examId: 'exm-claims-basic',
    questionText: 'หากยังไม่ผ่านการทดสอบความรู้ จะสามารถใช้งานฟังก์ชันหลักของระบบได้หรือไม่?',
    options: [
      { id: 'a', text: 'ใช้งานได้ตามปกติ', isCorrect: false },
      { id: 'b', text: 'ใช้งานไม่ได้ จนกว่าจะผ่านการทดสอบ', isCorrect: true },
      { id: 'c', text: 'ใช้งานได้เฉพาะดูรายงาน', isCorrect: false },
      { id: 'd', text: 'ใช้งานได้เฉพาะในช่วงเวลาที่เปิดสอบ', isCorrect: false }
    ],
    points: 10,
    orderIndex: 8
  },
  {
    id: 'q-9',
    examId: 'exm-claims-basic',
    questionText: 'แบบทดสอบความรู้มีช่วงเวลาเปิดปิดหรือไม่?',
    options: [
      { id: 'a', text: 'ไม่มี เปิดสอบตลอดเวลา', isCorrect: false },
      { id: 'b', text: 'มี ผู้ดูแลระบบกำหนดช่วงเปิด-ปิดให้ทำแบบทดสอบ', isCorrect: true },
      { id: 'c', text: 'เปิดเฉพาะวันหยุดราชการ', isCorrect: false },
      { id: 'd', text: 'เปิดเฉพาะเช้าวันจันทร์', isCorrect: false }
    ],
    points: 10,
    orderIndex: 9
  },
  {
    id: 'q-10',
    examId: 'exm-claims-basic',
    questionText: 'เมื่อผ่านแบบทดสอบแล้ว ผู้ใช้งานสามารถเข้าถึงเมนูใดเป็นอันดับแรก?',
    options: [
      { id: 'a', text: 'จัดการคู่มือและวิดีโอ', isCorrect: false },
      { id: 'b', text: 'ยื่นเสนอเรื่องใหม่ / รายการคำร้อง / Dashboard ตามสิทธิบทบาท', isCorrect: true },
      { id: 'c', text: 'รีเซ็ตรหัสผ่านเท่านั้น', isCorrect: false },
      { id: 'd', text: 'ไม่สามารถเข้าถึงเมนูใดได้', isCorrect: false }
    ],
    points: 10,
    orderIndex: 10
  },
];

// ---------- ธนาคารคำถามกลาง (Question Bank) ----------
// คำถามที่ไม่ผูกกับแบบทดสอบใดๆ สามารถถูกนำไปสร้างเป็นแบบทดสอบได้ต่างกันหลายชุด
const initialQuestionBank = [
  {
    id: 'qb-1',
    questionText: 'เอกสารหลักที่ต้องแนบในการยื่นเสนอเรื่องขอรับเงินสินไหมทดแทนคืออะไร?',
    options: [
      { id: 'a', text: 'สำเนาบัตรประชาชนผู้สูญเสีย', isCorrect: false },
      { id: 'b', text: 'รายงาน กพ.4 (แบบรายงานการสูญเสียกำลังพล)', isCorrect: true },
      { id: 'c', text: 'ใบเสร็จรับเงิน', isCorrect: false },
      { id: 'd', text: 'หนังสือเดินทาง', isCorrect: false }
    ],
    points: 10,
    category: 'เอกสารยื่นเรื่อง',
    difficulty: 'easy',
    tags: ['เอกสาร', 'พื้นฐาน'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'qb-2',
    questionText: 'ระยะเวลาระบุคำร้องสินไหมตามมาตรฐาน SLA คือกี่วัน?',
    options: [
      { id: 'a', text: '15 วัน', isCorrect: false },
      { id: 'b', text: '30 วัน', isCorrect: true },
      { id: 'c', text: '45 วัน', isCorrect: false },
      { id: 'd', text: '60 วัน', isCorrect: false }
    ],
    points: 10,
    category: 'ระยะเวลา SLA',
    difficulty: 'easy',
    tags: ['SLA', 'เวลา'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'qb-3',
    questionText: 'หากพบว่าเลขประจำตัวประชาชนผู้สูญเสียเคยมีการยื่นเรื่องในระบบแล้ว จะทำอย่างไร?',
    options: [
      { id: 'a', text: 'ยื่นเรื่องซ้ำได้เลย', isCorrect: false },
      { id: 'b', text: 'ระบบจะป้องกันการยื่นซ้ำและแจ้งเลขอ้างอิงเดิม', isCorrect: true },
      { id: 'c', text: 'ลบข้อมูลเดิมแล้วค่อยยื่นใหม่', isCorrect: false },
      { id: 'd', text: 'ติดต่อบริษัทประกันภัยโดยตรง', isCorrect: false }
    ],
    points: 10,
    category: 'การยื่นเรื่อง',
    difficulty: 'easy',
    tags: ['การยื่น', 'ข้อมูลซ้ำ'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const initialExamAttempts = [];

const initialExamSettings = {
  isExamPeriodActive: false, // สถานะห้วงการทดสอบความรู้: false = ปิดห้วง (เข้าใช้งานได้ปกติ), true = เปิดห้วง (ต้องผ่านแบบทดสอบก่อนใช้งาน)
  updatedAt: new Date().toISOString(),
  updatedBy: 'ระบบส่วนกลาง'
};

class Database {
  constructor() {
    this.users = [...initialUsers];
    this.claims = [...initialClaims];
    this.manuals = [...initialManuals];
    this.videos = [...initialVideos];
    this.units = [...INITIAL_MILITARY_UNITS];
    this.knowledgeExams = [...initialKnowledgeExams];
    this.knowledgeQuestions = [...initialKnowledgeQuestions];
    this.questionBank = [...initialQuestionBank];
    this.examAttempts = [...initialExamAttempts];
    this.activityLogs = [...initialActivityLogs];
    this.examSettings = { ...initialExamSettings };
    this.pdpaConsents = [];
    this.visitLogs = [];
    this.lastLoadedMtime = 0;
    this.pgReady = false;
    this.pgError = null;
    this.pgInitPromise = null;
    this.pgRefreshPromise = null;
    this.pgWriteQueue = Promise.resolve();
    this.pgMutationSeq = 0;
    this.pgLastSyncedAt = 0;
    this.loadFromFile();
    if (this.migrateUserPasswords()) {
      this.saveToFile();
    }
    bindTelegramPersistence({ onPersist: () => this.saveToFile(['notifications', 'telegramConfig']) });
  }

  migrateUserPasswords() {
    let migrated = false;
    if (Array.isArray(this.users)) {
      this.users.forEach((u) => {
        if (u.password && !isPasswordHashed(u.password)) {
          u.password = hashPassword(u.password);
          migrated = true;
        }
      });
    }
    return migrated;
  }

  getSerializableData() {
    const telegramState = getTelegramStateForStorage();
    return {
      users: this.users,
      claims: this.claims,
      manuals: this.manuals,
      videos: this.videos,
      units: this.units,
      knowledgeExams: this.knowledgeExams,
      knowledgeQuestions: this.knowledgeQuestions,
      questionBank: this.questionBank,
      examAttempts: this.examAttempts,
      activityLogs: this.activityLogs,
      examSettings: this.examSettings,
      pdpaConsents: this.pdpaConsents,
      visitLogs: this.visitLogs,
      telegramConfig: telegramState.telegramConfig,
      notifications: telegramState.notifications
    };
  }

  applyPostgresSnapshot(pgData) {
    if (!pgData || typeof pgData !== 'object') return;
    if (Array.isArray(pgData.units)) this.units = pgData.units;
    if (Array.isArray(pgData.users)) {
      this.users = pgData.users.map((u) => {
        const status = u.status || (u.isActive === false ? 'SUSPENDED' : 'APPROVED');
        const isActive = u.isActive === undefined ? status === 'APPROVED' : u.isActive;
        return { ...u, status, isActive };
      });
    }
    if (Array.isArray(pgData.claims)) this.claims = pgData.claims;
    if (Array.isArray(pgData.manuals)) this.manuals = pgData.manuals;
    if (Array.isArray(pgData.videos)) this.videos = pgData.videos;
    if (Array.isArray(pgData.knowledgeExams)) this.knowledgeExams = pgData.knowledgeExams;
    if (Array.isArray(pgData.knowledgeQuestions)) this.knowledgeQuestions = pgData.knowledgeQuestions;
    if (Array.isArray(pgData.questionBank)) this.questionBank = pgData.questionBank;
    if (Array.isArray(pgData.examAttempts)) this.examAttempts = pgData.examAttempts;
    if (Array.isArray(pgData.activityLogs)) this.activityLogs = pgData.activityLogs;
    if (Array.isArray(pgData.pdpaConsents)) this.pdpaConsents = pgData.pdpaConsents;
    if (Array.isArray(pgData.visitLogs)) this.visitLogs = pgData.visitLogs;
    if (pgData.examSettings) this.examSettings = pgData.examSettings;
    if (pgData.telegramConfig || Array.isArray(pgData.notifications)) {
      hydrateTelegramState({
        config: pgData.telegramConfig,
        history: pgData.notifications
      });
    }
    this.pgLastSyncedAt = Date.now();
  }

  async reloadFromPostgres() {
    if (this.pgRefreshPromise) {
      return this.pgRefreshPromise;
    }
    this.pgRefreshPromise = (async () => {
      await this.pgWriteQueue.catch(() => {});
      const seqBeforeLoad = this.pgMutationSeq;
      const pgData = await loadAllFromPg();
      if (this.pgMutationSeq !== seqBeforeLoad) {
        await this.pgWriteQueue.catch(() => {});
        const retrySeq = this.pgMutationSeq;
        const freshData = await loadAllFromPg();
        if (this.pgMutationSeq === retrySeq) {
          this.applyPostgresSnapshot(freshData);
        }
        return;
      }
      this.applyPostgresSnapshot(pgData);
    })().finally(() => {
      this.pgRefreshPromise = null;
    });
    return this.pgRefreshPromise;
  }

  async ensureReady({ forceRefresh = true } = {}) {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return false;
    }

    if (!this.pgReady) {
      if (!this.pgInitPromise) {
        this.pgInitPromise = (async () => {
          try {
            const pool = getPgPool();
            await ensurePgSchema(pool);
            await seedPgIfEmpty(this.getSerializableData());
            await this.reloadFromPostgres();
            this.pgReady = true;
            this.pgError = null;
            if (this.migrateUserPasswords()) {
              this.saveToFile(['users']);
              await this.flush();
            }
          } catch (err) {
            this.pgError = err.message;
            console.error('PostgreSQL initialization error:', err.message);
            throw err;
          }
        })().finally(() => {
          this.pgInitPromise = null;
        });
      }
      await this.pgInitPromise;
      return true;
    }

    await this.pgWriteQueue.catch(() => {});
    if (forceRefresh) {
      await this.reloadFromPostgres();
    }
    return true;
  }

  queuePgSync(dirtyKeys = null) {
    if (process.env.NEXT_PHASE === 'phase-production-build') return;
    if (!this.pgReady) return;
    this.pgMutationSeq += 1;
    const rawSnapshot = this.getSerializableData();
    const keysCopy = Array.isArray(dirtyKeys) && dirtyKeys.length > 0 ? [...dirtyKeys] : null;
    const snapshot = {};
    const keysToSnapshot = keysCopy
      ? Array.from(new Set([...keysCopy, 'examSettings', 'telegramConfig']))
      : Object.keys(rawSnapshot);
    for (const k of keysToSnapshot) {
      if (rawSnapshot[k] !== undefined) {
        snapshot[k] = structuredClone(rawSnapshot[k]);
      }
    }
    this.pgWriteQueue = this.pgWriteQueue
      .catch(() => {})
      .then(async () => {
        await syncSnapshotToPg(snapshot, keysCopy);
        this.pgLastSyncedAt = Date.now();
        this.pgError = null;
      })
      .catch((err) => {
        this.pgError = err.message;
        console.error('PostgreSQL sync error:', err.message);
      });
  }

  async flush() {
    if (this.pgInitPromise) {
      await this.pgInitPromise.catch(() => {});
    }
    await this.pgWriteQueue.catch(() => {});
  }

  async getStorageDiagnostics() {
    await this.ensureReady({ forceRefresh: false }).catch(() => {});
    await this.flush();
    const diag = await getPgDiagnostics();
    return {
      engine: 'postgresql',
      pgReady: this.pgReady,
      pgError: this.pgError,
      lastSyncedAt: this.pgLastSyncedAt ? new Date(this.pgLastSyncedAt).toISOString() : null,
      ...diag
    };
  }

  syncIfFileChanged() {
    if (this.pgReady) return;
    try {
      if (fs.existsSync(DB_FILE)) {
        const stat = fs.statSync(DB_FILE);
        if (stat.mtimeMs > (this.lastLoadedMtime || 0)) {
          this.loadFromFile();
        }
      }
    } catch (e) {
      // ignore stat errors
    }
  }

  loadFromFile() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const stat = fs.statSync(DB_FILE);
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const data = JSON.parse(raw);
        if (data.users && data.claims) {
          const existingUserIds = new Set(data.users.map((u) => u.id));
          const missingUsers = initialUsers.filter((u) => !existingUserIds.has(u.id));
          this.users = [...data.users, ...missingUsers];
          const existingIds = new Set(data.claims.map((c) => c.id));
          const toAdd = initialClaims.filter((c) => !existingIds.has(c.id));
          this.claims = [...data.claims, ...toAdd];
        }
        if (data.manuals && Array.isArray(data.manuals)) {
          this.manuals = data.manuals;
        }
        if (data.videos && Array.isArray(data.videos)) {
          this.videos = data.videos;
        }
        if (data.units && Array.isArray(data.units)) {
          const existingUnitIds = new Set(data.units.map((u) => u.id));
          const missingUnits = INITIAL_MILITARY_UNITS.filter((u) => !existingUnitIds.has(u.id));
          this.units = [...data.units, ...missingUnits];
        }
        if (data.knowledgeExams && Array.isArray(data.knowledgeExams)) {
          this.knowledgeExams = data.knowledgeExams;
        }
        if (data.knowledgeQuestions && Array.isArray(data.knowledgeQuestions)) {
          this.knowledgeQuestions = data.knowledgeQuestions;
        }
        if (data.questionBank && Array.isArray(data.questionBank)) {
          this.questionBank = data.questionBank;
        }
        if (data.examAttempts && Array.isArray(data.examAttempts)) {
          this.examAttempts = data.examAttempts;
        }
        if (data.activityLogs && Array.isArray(data.activityLogs)) {
          this.activityLogs = data.activityLogs;
        } else if (!this.activityLogs || this.activityLogs.length === 0) {
          this.activityLogs = [...initialActivityLogs];
        }
        if (data.examSettings) {
          this.examSettings = data.examSettings;
        }
        if (Array.isArray(data.pdpaConsents)) {
          this.pdpaConsents = data.pdpaConsents;
        }
        if (Array.isArray(data.visitLogs)) {
          this.visitLogs = data.visitLogs;
        }
        if (data.telegramConfig || Array.isArray(data.notifications)) {
          hydrateTelegramState({
            config: data.telegramConfig,
            history: data.notifications
          });
        }
        // Normalize status & isActive on users & hash legacy passwords if needed
        let migratedOnLoad = false;
        if (Array.isArray(this.users)) {
          this.users.forEach((u) => {
            if (!u.status) {
              u.status = u.isActive === false ? 'SUSPENDED' : 'APPROVED';
            }
            if (u.isActive === undefined) {
              u.isActive = u.status === 'APPROVED';
            }
          });
          migratedOnLoad = this.migrateUserPasswords();
        }
        this.lastLoadedMtime = stat.mtimeMs;
        if (migratedOnLoad) {
          this.saveToFile();
        }
      }
    } catch (e) {
      console.log('Using in-memory seed DB');
    }
  }

  saveToFile(dirtyKeys = null) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.getSerializableData(), null, 2), 'utf8');
      try {
        this.lastLoadedMtime = fs.statSync(DB_FILE).mtimeMs;
      } catch (e) {}
    } catch (e) {
      console.error('Failed to save DB to file', e);
    }
    this.queuePgSync(dirtyKeys);
  }
/// 添加文件锁机制防止竞态条件
  saveToFileWithLock(dirtyKeys = null) {
    // 使用文件锁防止 race condition
    const lockFile = DB_FILE + '.lock';
    let lockAcquired = false;
    
    try {
      // 尝试创建锁文件 (non-blocking)
      if (fs.existsSync(lockFile)) {
        // 有进程正在写入 - 等待最多 5 秒
        const startTime = Date.now();
        while (Date.now() - startTime < 5000) {
          if (!fs.existsSync(lockFile)) break;
        }
      }
      
      // 创建锁文件
      fs.writeFileSync(lockFile, '', 'utf8');
      lockAcquired = true;
      
      // 写入数据
      fs.writeFileSync(DB_FILE, JSON.stringify(this.getSerializableData(), null, 2), 'utf8');
      try {
        this.lastLoadedMtime = fs.statSync(DB_FILE).mtimeMs;
      } catch (e) {}
      
    } catch (e) {
      console.error('Failed to save DB to file', e);
    } finally {
      // 删除锁文件
      try {
        if (lockAcquired && fs.existsSync(lockFile)) {
          fs.unlinkSync(lockFile);
        }
      } catch (e) {
        // 如果删除锁文件失败，忽略错误
      }
    }
    this.queuePgSync(dirtyKeys);
  }

  checkDuplicateCasualty(citizenId) {
    if (!citizenId) return null;
    const clean = citizenId.replace(/\D/g, '');
    const found = this.claims.find((c) => (c.casualtyCitizenId || '').replace(/\D/g, '') === clean);
    if (found) {
      return {
        isDuplicate: true,
        trackingCode: found.trackingCode,
        casualtyName: `${found.casualtyRank} ${found.casualtyFirstName} ${found.casualtyLastName}`,
        unitName: found.unitName,
        createdAt: found.createdAt
      };
    }
    return { isDuplicate: false };
  }

  // ติดตามสถานะสิทธิด้วย เลข ปชช. (13 หลัก) + วันเกิด (ต้องตรงกันทั้งสองอย่าง)
  trackClaimByCitizenIdAndBirthDate(citizenId, birthDate) {
    if (!citizenId || !birthDate) return null;
    const cleanId = citizenId.replace(/\D/g, '');
    const cleanBirth = birthDate.trim();
    if (cleanId.length !== 13 || !cleanBirth) return null;

    const claim = this.claims.find((c) => {
      const matchId = (c.casualtyCitizenId || '').replace(/\D/g, '') === cleanId;
      const matchBirth = Boolean(c.casualtyBirthDate) && String(c.casualtyBirthDate).trim() === cleanBirth;
      return matchId && matchBirth;
    });

    return claim || null;
  }

  authenticateUser(identifier, plainPassword) {
    this.syncIfFileChanged();
    if (!identifier || !plainPassword) return { user: null, foundUser: null };
    const found =
      this.findUserByEmail(identifier) ||
      this.findUserByCitizenId(identifier);
    if (!found) return { user: null, foundUser: null };
    const matched = verifyPassword(plainPassword, found.password);
    if (!matched) return { user: null, foundUser: found };

    if (!isPasswordHashed(found.password)) {
      found.password = hashPassword(plainPassword);
      this.saveToFile();
    }
    return { user: found, foundUser: found };
  }

  recordPdpaConsent(entry = {}) {
    if (!Array.isArray(this.pdpaConsents)) this.pdpaConsents = [];
    const record = {
      id: 'pdpa-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      visitorId: entry.visitorId || 'anon',
      userId: entry.userId || null,
      necessary: true,
      securityLog: true,
      analytics: Boolean(entry.analytics),
      preferences: Boolean(entry.preferences),
      version: entry.version || '1.0',
      maskedIp: entry.maskedIp || 'unknown',
      device: entry.device || 'Web Browser',
      consentedAt: new Date().toISOString()
    };
    this.pdpaConsents.unshift(record);
    if (this.pdpaConsents.length > 2000) {
      this.pdpaConsents = this.pdpaConsents.slice(0, 2000);
    }
    this.saveToFile();
    return record;
  }

  recordVisitLog(entry = {}) {
    if (!Array.isArray(this.visitLogs)) this.visitLogs = [];
    const record = {
      id: 'visit-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      visitorId: entry.visitorId || 'anon',
      userRole: entry.userRole || 'GUEST',
      path: String(entry.path || '/').slice(0, 120),
      maskedIp: entry.maskedIp || 'unknown',
      device: entry.device || 'Web Browser',
      timestamp: new Date().toISOString()
    };
    this.visitLogs.unshift(record);
    if (this.visitLogs.length > 5000) {
      this.visitLogs = this.visitLogs.slice(0, 5000);
    }
    this.saveToFile();
    return record;
  }

  getPdpaAndVisitSummary() {
    this.syncIfFileChanged();
    const consents = Array.isArray(this.pdpaConsents) ? this.pdpaConsents : [];
    const visits = Array.isArray(this.visitLogs) ? this.visitLogs : [];
    const todayPrefix = new Date().toISOString().slice(0, 10);

    const pathCounts = new Map();
    const uniqueVisitors = new Set();
    let todayVisits = 0;

    for (const v of visits) {
      if (v.timestamp && v.timestamp.startsWith(todayPrefix)) todayVisits++;
      if (v.visitorId) uniqueVisitors.add(v.visitorId);
      const p = v.path || '/';
      pathCounts.set(p, (pathCounts.get(p) || 0) + 1);
    }

    const topPaths = Array.from(pathCounts.entries())
      .map(([pathName, count]) => ({ path: pathName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const analyticsOptIn = consents.filter((c) => c.analytics).length;
    const preferencesOptIn = consents.filter((c) => c.preferences).length;

    return {
      totalConsents: consents.length,
      analyticsOptInCount: analyticsOptIn,
      preferencesOptInCount: preferencesOptIn,
      analyticsOptInRate: consents.length > 0 ? Math.round((analyticsOptIn / consents.length) * 100) : 0,
      totalVisits: visits.length,
      todayVisits,
      uniqueVisitors: uniqueVisitors.size,
      topPaths,
      recentConsents: consents.slice(0, 15),
      recentVisits: visits.slice(0, 15)
    };
  }

  // --- Users & Auth (Role-Based Access Control) ---
  getAllUsers() {
    return this.users.map(({ password, ...u }) => ({
      ...u,
      status: u.status || (u.isActive === false ? 'SUSPENDED' : 'APPROVED'),
      isActive: u.isActive !== undefined ? u.isActive : (u.status !== 'SUSPENDED' && u.status !== 'REJECTED' && u.status !== 'PENDING')
    }));
  }

  getUserSummary() {
    const all = this.getAllUsers();
    return {
      total: all.length,
      approved: all.filter((u) => u.status === 'APPROVED').length,
      pending: all.filter((u) => u.status === 'PENDING').length,
      suspended: all.filter((u) => u.status === 'SUSPENDED' || u.isActive === false).length,
      rejected: all.filter((u) => u.status === 'REJECTED').length
    };
  }

  findUserByEmail(email) {
    if (!email) return null;
    return this.users.find((u) => (u.email || '').toLowerCase() === email.toLowerCase());
  }

  findUserByCitizenId(citizenId) {
    if (!citizenId) return null;
    const clean = citizenId.replace(/\D/g, '');
    return this.users.find((u) => (u.citizenId || '').replace(/\D/g, '') === clean);
  }

  findUserById(id) {
    this.syncIfFileChanged();
    return this.users.find((u) => u.id === id);
  }

  emitRealtimeEvent(event, payload, { withStats = false, scopeClaim = null, room = 'authenticated' } = {}) {
    const io = global.io || globalThis.io;
    if (!io) return;

    if (event) {
      if (scopeClaim) {
        const rooms = new Set(['role_ADMIN', 'role_KSP_OFFICER', 'role_COMMANDER', 'role_INSURANCE_REP', 'role_SK_OFFICER']);
        const unitIds = this.getUnitHierarchyAncestorIds(scopeClaim.unitId);
        unitIds.forEach((uid) => rooms.add(`unit_${uid}`));
        if (scopeClaim.unitLevel1Id) rooms.add(`unit_${scopeClaim.unitLevel1Id}`);
        if (scopeClaim.unitLevel2Id) rooms.add(`unit_${scopeClaim.unitLevel2Id}`);
        io.to(Array.from(rooms)).emit(event, payload);
      } else {
        io.to(room || 'authenticated').emit(event, payload);
      }
    }

    if (withStats) {
      io.to('authenticated').emit('stats_updated', this.getStatistics());
    }
  }

  getUnitHierarchyAncestorIds(unitId) {
    if (!unitId) return [];
    const result = [unitId];
    const visited = new Set([unitId]);
    let current = (this.units || []).find((u) => u.id === unitId);
    while (current && current.parentId && !visited.has(current.parentId)) {
      visited.add(current.parentId);
      result.push(current.parentId);
      current = (this.units || []).find((u) => u.id === current.parentId);
    }
    return result;
  }

  notifyClaimEvent({ claim, title, message, type = 'INFO', user = null, sendTelegram = true }) {
    if (!claim) return null;
    const byName = user
      ? `${user.rank || ''} ${user.firstName || ''} ${user.lastName || ''}`.trim()
      : claim.reporterName || null;
    return sendTelegramNotification({
      title,
      message,
      claimId: claim.id,
      trackingCode: claim.trackingCode,
      type,
      unitId: claim.unitId || user?.unitId || null,
      allowedUnitIds: this.getUnitHierarchyAncestorIds(claim.unitId || user?.unitId),
      targetRoles: ['ADMIN', 'KSP_OFFICER', 'COMMANDER', 'INSURANCE_REP', 'SK_OFFICER', 'UNIT_OFFICER'],
      by: byName,
      sendTelegram
    });
  }

  scanAndNotifySla({ dryRun = false, triggeredBy = 'ระบบตรวจสอบ SLA อัตโนมัติ' } = {}) {
    this.syncIfFileChanged();
    const activeClaims = this.claims.filter(
      (c) => c.status !== 'DRAFT' && c.status !== 'PAID' && c.status !== 'SK_NOTIFIED'
    );

    const warningList = [];
    const overdueList = [];

    for (const c of activeClaims) {
      const sla = calculateSlaStatus(c.reportDate || c.createdAt, c.slaTargetDays || 30);
      const item = {
        id: c.id,
        trackingCode: c.trackingCode,
        unitName: c.unitName || '-',
        casualtyName: `${c.casualtyRank || ''} ${c.casualtyFirstName || ''} ${c.casualtyLastName || ''}`.trim(),
        daysElapsed: sla.daysElapsed,
        daysRemaining: sla.daysRemaining,
        status: sla.status
      };
      if (sla.status === 'OVERDUE') overdueList.push(item);
      else if (sla.status === 'WARNING') warningList.push(item);
    }

    let notification = null;
    if (!dryRun) {
      const topOverdue = overdueList
        .slice(0, 5)
        .map((c) => `• ${c.trackingCode} (${c.unitName}) เกิน ${Math.abs(c.daysRemaining)} วัน`)
        .join('\n');
      const topWarning = warningList
        .slice(0, 5)
        .map((c) => `• ${c.trackingCode} (${c.unitName}) เหลือ ${c.daysRemaining} วัน`)
        .join('\n');

      const summaryParts = [
        `สรุปสถานะคำร้องค้างดำเนินการ ${activeClaims.length} เรื่อง`,
        `🔴 เกินกำหนด (> 30 วัน): ${overdueList.length} เรื่อง`,
        `🟠 ใกล้ครบกำหนด (≤ 7 วัน): ${warningList.length} เรื่อง`
      ];
      if (topOverdue) summaryParts.push(`รายการเกินกำหนดล่าสุด:\n${topOverdue}`);
      if (topWarning) summaryParts.push(`รายการใกล้ครบกำหนด:\n${topWarning}`);

      notification = sendTelegramNotification({
        title: `สรุปแจ้งเตือนกรอบเวลา SLA 30 วัน (เกินกำหนด ${overdueList.length} / เฝ้าระวัง ${warningList.length})`,
        message: summaryParts.join('\n'),
        trackingCode: `SLA-${new Date().toISOString().slice(0, 10)}`,
        type: overdueList.length > 0 ? 'DELAY_REPORT' : 'SLA_ALERT',
        targetRoles: ['ADMIN', 'KSP_OFFICER', 'COMMANDER', 'UNIT_OFFICER'],
        by: triggeredBy,
        link: '/claims',
        sendTelegram: overdueList.length > 0 || warningList.length > 0
      });
    }

    return {
      totalActive: activeClaims.length,
      overdueCount: overdueList.length,
      warningCount: warningList.length,
      overdueList: overdueList.slice(0, 20),
      warningList: warningList.slice(0, 20),
      notification
    };
  }

  createUser(userData, creator = null) {
    const cleanCitizenId = userData.citizenId ? userData.citizenId.replace(/\D/g, '') : '';
    
    // ตรวจสอบการสมัครซ้ำด้วยเลข ปชช.
    if (cleanCitizenId) {
      const existing = this.findUserByCitizenId(cleanCitizenId);
      if (existing) {
        throw new Error(`เลขประจำตัวประชาชน ${userData.citizenId} นี้เคยลงทะเบียนในระบบแล้ว`);
      }
    }

    // ตรวจสอบการสมัครซ้ำด้วย Email
    if (userData.email) {
      const existingEmail = this.findUserByEmail(userData.email);
      if (existingEmail) {
        throw new Error(`อีเมล ${userData.email} นี้เคยลงทะเบียนไว้ในระบบแล้ว`);
      }
    }

    const isDirectAdmin = creator && creator.role === 'ADMIN';
    const status = userData.status || (isDirectAdmin ? 'APPROVED' : 'PENDING');
    const isActive = status === 'APPROVED';

    const newUser = {
      id: 'usr-' + Date.now(),
      ...userData,
      password: hashPassword(userData.password),
      citizenId: cleanCitizenId,
      status,
      isActive,
      requestedRole: userData.requestedRole || userData.role || 'UNIT_OFFICER',
      role: userData.role || userData.requestedRole || 'UNIT_OFFICER',
      createdAt: new Date().toISOString()
    };

    if (status === 'APPROVED' && isDirectAdmin) {
      newUser.approvedAt = new Date().toISOString();
      newUser.approvedBy = creator.name || 'ผู้ดูแลระบบ';
    }

    this.users.push(newUser);

    // บันทึก Activity Log
    this.addActivityLog({
      userId: isDirectAdmin ? creator.id : newUser.id,
      userName: isDirectAdmin ? (creator.name || 'Admin') : `${newUser.rank || ''} ${newUser.firstName} ${newUser.lastName}`.trim(),
      userRole: isDirectAdmin ? creator.role : (newUser.requestedRole || newUser.role),
      action: isDirectAdmin ? 'CREATE_USER' : 'REGISTER',
      actionBadge: isDirectAdmin ? 'emerald' : 'amber',
      actionLabel: isDirectAdmin ? 'เพิ่มผู้ใช้งาน' : 'ลงทะเบียนใหม่',
      details: isDirectAdmin
        ? `ผู้ดูแลระบบเพิ่มผู้ใช้ ${newUser.rank || ''} ${newUser.firstName} ${newUser.lastName} สังกัด ${newUser.unitName} (บทบาท: ${newUser.role})`
        : `ลงทะเบียนขอใช้งานระบบใหม่ สังกัด ${newUser.unitName} (สถานะ: รอการอนุมัติ)`,
      ip: creator?.ip || userData?.ip || '127.0.0.1',
      device: creator?.device || userData?.device || 'คอมพิวเตอร์ (Web Browser)',
      targetId: newUser.id,
      targetName: `${newUser.rank || ''} ${newUser.firstName} ${newUser.lastName}`.trim()
    });

    this.saveToFile(['users', 'activityLogs']);
    this.emitRealtimeEvent('users_updated', { action: 'CREATE', userId: newUser.id }, { room: 'role_ADMIN' });

    if (status === 'PENDING') {
      const fullName = `${newUser.rank || ''} ${newUser.firstName} ${newUser.lastName}`.trim();
      sendTelegramNotification({
        title: 'คำขอลงทะเบียนผู้ใช้งานใหม่ รออนุมัติสิทธิ์',
        message: `${fullName} สังกัด ${newUser.unitName || '-'} ขอสิทธิ์บทบาท ${newUser.requestedRole || newUser.role}`,
        trackingCode: `USER-REG`,
        type: 'USER_REGISTER_PENDING',
        targetRoles: ['ADMIN'],
        by: fullName,
        link: '/users',
        sendTelegram: true
      });
    }

    return newUser;
  }

  updateUser(userId, updateData, adminUser = null) {
    const user = this.findUserById(userId);
    if (!user) throw new Error('ไม่พบข้อมูลผู้ใช้งาน');

    if (updateData.citizenId) {
      const clean = updateData.citizenId.replace(/\D/g, '');
      const duplicate = this.users.find((u) => u.id !== userId && (u.citizenId || '').replace(/\D/g, '') === clean);
      if (duplicate) throw new Error(`เลขประจำตัวประชาชน ${updateData.citizenId} นี้ซ้ำกับผู้ใช้งานอื่น`);
      user.citizenId = clean;
    }
    if (updateData.email) {
      const duplicateEmail = this.users.find((u) => u.id !== userId && (u.email || '').toLowerCase() === updateData.email.toLowerCase());
      if (duplicateEmail) throw new Error(`อีเมล ${updateData.email} นี้ซ้ำกับผู้ใช้งานอื่น`);
      user.email = updateData.email;
    }

    if (updateData.rank) user.rank = updateData.rank;
    if (updateData.firstName) user.firstName = updateData.firstName;
    if (updateData.lastName) user.lastName = updateData.lastName;
    if (updateData.position) user.position = updateData.position;
    if (updateData.unitId) user.unitId = updateData.unitId;
    if (updateData.unitName) user.unitName = updateData.unitName;
    if (updateData.phone) user.phone = updateData.phone;
    if (updateData.role) user.role = updateData.role;
    if (updateData.password) user.password = hashPassword(updateData.password);
    if (updateData.status) {
      user.status = updateData.status;
      user.isActive = updateData.status === 'APPROVED';
    }
    user.updatedAt = new Date().toISOString();

    this.addActivityLog({
      userId: adminUser?.id || 'admin',
      userName: adminUser?.name || 'ผู้ดูแลระบบ',
      userRole: adminUser?.role || 'ADMIN',
      action: 'UPDATE_USER',
      actionBadge: 'blue',
      actionLabel: 'แก้ไขข้อมูลผู้ใช้',
      details: `แก้ไขข้อมูลผู้ใช้ ${user.rank || ''} ${user.firstName} ${user.lastName} (สังกัด: ${user.unitName}, บทบาท: ${user.role})`,
      ip: adminUser?.ip || '127.0.0.1',
      device: adminUser?.device || 'คอมพิวเตอร์ (Admin)',
      targetId: user.id,
      targetName: `${user.rank || ''} ${user.firstName} ${user.lastName}`.trim()
    });

    this.saveToFile();
    return user;
  }

  updateUserRole(userId, newRole, adminUser = null) {
    const user = this.findUserById(userId);
    if (!user) throw new Error('ไม่พบผู้ใช้งาน');
    const oldRole = user.role;
    user.role = newRole;
    user.updatedAt = new Date().toISOString();

    this.addActivityLog({
      userId: adminUser?.id || 'admin',
      userName: adminUser?.name || 'ผู้ดูแลระบบ',
      userRole: adminUser?.role || 'ADMIN',
      action: 'UPDATE_ROLE',
      actionBadge: 'purple',
      actionLabel: 'เปลี่ยนบทบาท/สิทธิ์',
      details: `เปลี่ยนบทบาทผู้ใช้ ${user.rank || ''} ${user.firstName} ${user.lastName} จาก ${oldRole} เป็น ${newRole}`,
      ip: adminUser?.ip || '127.0.0.1',
      device: adminUser?.device || 'คอมพิวเตอร์ (Admin)',
      targetId: user.id,
      targetName: `${user.rank || ''} ${user.firstName} ${user.lastName}`.trim()
    });

    this.saveToFile();
    return user;
  }

  approveUser(userId, { role, adminUser } = {}) {
    const user = this.findUserById(userId);
    if (!user) throw new Error('ไม่พบผู้ใช้งาน');

    user.status = 'APPROVED';
    user.isActive = true;
    if (role) {
      user.role = role;
    } else if (user.requestedRole) {
      user.role = user.requestedRole;
    }
    user.approvedAt = new Date().toISOString();
    user.approvedBy = adminUser?.name || 'ผู้ดูแลระบบ';
    user.updatedAt = new Date().toISOString();

    this.addActivityLog({
      userId: adminUser?.id || 'admin',
      userName: adminUser?.name || 'ผู้ดูแลระบบ',
      userRole: adminUser?.role || 'ADMIN',
      action: 'APPROVE_USER',
      actionBadge: 'emerald',
      actionLabel: 'อนุมัติผู้ใช้งาน',
      details: `อนุมัติการใช้งานบัญชี ${user.rank || ''} ${user.firstName} ${user.lastName} สังกัด ${user.unitName} บทบาท: ${user.role}`,
      ip: adminUser?.ip || '127.0.0.1',
      device: adminUser?.device || 'คอมพิวเตอร์ (Admin)',
      targetId: user.id,
      targetName: `${user.rank || ''} ${user.firstName} ${user.lastName}`.trim()
    });

    this.saveToFile();
    this.emitRealtimeEvent('users_updated', { action: 'APPROVE', userId: user.id }, { room: 'role_ADMIN' });
    sendTelegramNotification({
      title: 'อนุมัติสิทธิ์ผู้ใช้งานใหม่แล้ว',
      message: `${user.rank || ''} ${user.firstName} ${user.lastName} (${user.unitName || '-'}) ได้รับอนุมัติใช้งานบทบาท ${user.role}`,
      trackingCode: 'USER-APPROVED',
      type: 'USER_STATUS',
      targetRoles: ['ADMIN'],
      by: adminUser?.name || 'ผู้ดูแลระบบ',
      link: '/users',
      sendTelegram: false
    });
    return user;
  }

  rejectUser(userId, { reason, adminUser } = {}) {
    const user = this.findUserById(userId);
    if (!user) throw new Error('ไม่พบผู้ใช้งาน');

    user.status = 'REJECTED';
    user.isActive = false;
    user.rejectedReason = reason || 'ข้อมูลไม่ถูกต้องหรือไม่เป็นไปตามหลักเกณฑ์';
    user.rejectedAt = new Date().toISOString();
    user.rejectedBy = adminUser?.name || 'ผู้ดูแลระบบ';
    user.updatedAt = new Date().toISOString();

    this.addActivityLog({
      userId: adminUser?.id || 'admin',
      userName: adminUser?.name || 'ผู้ดูแลระบบ',
      userRole: adminUser?.role || 'ADMIN',
      action: 'REJECT_USER',
      actionBadge: 'slate',
      actionLabel: 'ไม่อนุมัติ/ปฏิเสธ',
      details: `ปฏิเสธคำขอลงทะเบียนของ ${user.rank || ''} ${user.firstName} ${user.lastName} เหตุผล: ${user.rejectedReason}`,
      ip: adminUser?.ip || '127.0.0.1',
      device: adminUser?.device || 'คอมพิวเตอร์ (Admin)',
      targetId: user.id,
      targetName: `${user.rank || ''} ${user.firstName} ${user.lastName}`.trim()
    });

    this.saveToFile();
    this.emitRealtimeEvent('users_updated', { action: 'REJECT', userId: user.id }, { room: 'role_ADMIN' });
    return user;
  }

  toggleUserActive(userId, adminUser = null) {
    const user = this.findUserById(userId);
    if (!user) throw new Error('ไม่พบผู้ใช้งาน');
    if (user.id === 'usr-admin-1') throw new Error('ไม่สามารถระงับบัญชีผู้ดูแลระบบหลักได้');

    const nextActive = user.isActive === undefined ? false : !user.isActive;
    user.isActive = nextActive;
    user.status = nextActive ? 'APPROVED' : 'SUSPENDED';
    user.updatedAt = new Date().toISOString();

    const action = nextActive ? 'ACTIVATE_USER' : 'SUSPEND_USER';
    const actionLabel = nextActive ? 'ปลดระงับผู้ใช้' : 'ระงับการใช้งาน';
    const actionBadge = nextActive ? 'emerald' : 'red';

    this.addActivityLog({
      userId: adminUser?.id || 'admin',
      userName: adminUser?.name || 'ผู้ดูแลระบบ',
      userRole: adminUser?.role || 'ADMIN',
      action,
      actionBadge,
      actionLabel,
      details: `${actionLabel} บัญชี ${user.rank || ''} ${user.firstName} ${user.lastName} (${user.unitName})`,
      ip: adminUser?.ip || '127.0.0.1',
      device: adminUser?.device || 'คอมพิวเตอร์ (Admin)',
      targetId: user.id,
      targetName: `${user.rank || ''} ${user.firstName} ${user.lastName}`.trim()
    });

    this.saveToFile();
    this.emitRealtimeEvent('users_updated', { action, userId: user.id }, { room: 'role_ADMIN' });
    return user;
  }

  deleteUser(userId, adminUser = null) {
    const user = this.findUserById(userId);
    if (!user) throw new Error('ไม่พบผู้ใช้งาน');
    if (user.id === 'usr-admin-1') throw new Error('ไม่สามารถลบบัญชีผู้ดูแลระบบหลักได้');

    const userName = `${user.rank || ''} ${user.firstName} ${user.lastName}`.trim();
    this.users = this.users.filter((u) => u.id !== userId);

    this.addActivityLog({
      userId: adminUser?.id || 'admin',
      userName: adminUser?.name || 'ผู้ดูแลระบบ',
      userRole: adminUser?.role || 'ADMIN',
      action: 'DELETE_USER',
      actionBadge: 'red',
      actionLabel: 'ลบผู้ใช้งาน',
      details: `ลบบัญชีผู้ใช้ ${userName} ออกจากระบบถาวร`,
      ip: adminUser?.ip || '127.0.0.1',
      device: adminUser?.device || 'คอมพิวเตอร์ (Admin)',
      targetId: userId,
      targetName: userName
    });

    this.saveToFile(['users', 'activityLogs']);
    return { success: true, deletedId: userId };
  }

  // --- Audit & Activity Logs ---
  addActivityLog(logData) {
    const newLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      userId: logData.userId || 'system',
      userName: logData.userName || 'ระบบ',
      userRole: logData.userRole || 'SYSTEM',
      action: logData.action || 'GENERAL',
      actionBadge: logData.actionBadge || 'blue',
      actionLabel: logData.actionLabel || logData.action,
      details: logData.details || '',
      ip: logData.ip || '127.0.0.1',
      device: logData.device || 'คอมพิวเตอร์ (Web Browser)',
      targetId: logData.targetId || null,
      targetName: logData.targetName || null,
      createdAt: new Date().toISOString()
    };

    if (!Array.isArray(this.activityLogs)) {
      this.activityLogs = [];
    }
    this.activityLogs.unshift(newLog);

    if (this.activityLogs.length > 2000) {
      this.activityLogs = this.activityLogs.slice(0, 2000);
    }

    return newLog;
  }

  getActivityLogs({ searchQuery = '', action = 'ALL', limit = 10, page = 1 } = {}) {
    let result = Array.isArray(this.activityLogs) ? [...this.activityLogs] : [];

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          (l.userName && l.userName.toLowerCase().includes(q)) ||
          (l.details && l.details.toLowerCase().includes(q)) ||
          (l.action && l.action.toLowerCase().includes(q)) ||
          (l.actionLabel && l.actionLabel.toLowerCase().includes(q)) ||
          (l.targetName && l.targetName.toLowerCase().includes(q)) ||
          (l.ip && l.ip.includes(q)) ||
          (l.device && l.device.toLowerCase().includes(q))
      );
    }

    if (action && action !== 'ALL') {
      result = result.filter((l) => l.action === action);
    }

    const total = result.length;
    const numLimit = Math.max(1, parseInt(limit, 10) || 10);
    const numPage = Math.max(1, parseInt(page, 10) || 1);
    const totalPages = Math.max(1, Math.ceil(total / numLimit));
    const validPage = Math.min(numPage, totalPages);
    const startIndex = (validPage - 1) * numLimit;
    const paginated = result.slice(startIndex, startIndex + numLimit);

    return {
      logs: paginated,
      total,
      page: validPage,
      limit: numLimit,
      totalPages
    };
  }

  clearActivityLogs(adminUser = null) {
    this.activityLogs = [];
    if (adminUser) {
      const logEntry = {
        id: 'log-' + Date.now(),
        userId: adminUser.id || 'admin',
        userName: adminUser.name || 'ผู้ดูแลระบบ',
        userRole: adminUser.role || 'ADMIN',
        action: 'CLEAR_LOGS',
        actionBadge: 'red',
        actionLabel: 'ลบล้างประวัติ',
        details: 'ผู้ดูแลระบบได้ทำการลบล้างประวัติการใช้งานและ Audit Logs ทั้งหมด',
        ip: adminUser.ip || '127.0.0.1',
        device: adminUser.device || 'คอมพิวเตอร์ (Admin)',
        targetId: null,
        targetName: null,
        createdAt: new Date().toISOString()
      };
      this.activityLogs.push(logEntry);
    }
    this.saveToFile();
    return true;
  }

  resetPassword(citizenId, newPassword, { email, phone, isAdminOverride = false, clientInfo = null } = {}) {
    const cleanId = String(citizenId || '').replace(/\D/g, '');
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPhone = String(phone || '').replace(/\D/g, '');

    if (!isAdminOverride && (!cleanId || cleanId.length !== 13 || !cleanEmail || cleanPhone.length < 9)) {
      throw new Error('กรุณายืนยันตัวตนด้วยเลขประจำตัวประชาชน 13 หลัก อีเมล และเบอร์โทรศัพท์ที่ลงทะเบียนไว้ให้ครบถ้วน');
    }

    const user = isAdminOverride
      ? this.users.find(
          (u) => u.email.toLowerCase() === String(citizenId || '').toLowerCase() || u.citizenId === cleanId
        )
      : this.users.find((u) => {
          const idMatch = (u.citizenId || '').replace(/\D/g, '') === cleanId;
          const emailMatch = (u.email || '').trim().toLowerCase() === cleanEmail;
          const phoneMatch = (u.phone || '').replace(/\D/g, '') === cleanPhone;
          return idMatch && emailMatch && phoneMatch;
        });

    if (!user) {
      throw new Error('ข้อมูลยืนยันตัวตนไม่ตรงกับบัญชีในระบบ (กรุณาติดต่อผู้ดูแลระบบส่วนกลาง)');
    }

    if (!isAdminOverride && (user.role === 'ADMIN' || user.role === 'COMMANDER')) {
      throw new Error('บัญชีระดับผู้ดูแลระบบและผู้บังคับบัญชาไม่สามารถรีเซ็ตผ่านหน้าเว็บทั่วไปได้ กรุณาติดต่อผู้ดูแลระบบส่วนกลาง');
    }

    user.password = hashPassword(newPassword);
    user.updatedAt = new Date().toISOString();

    this.addActivityLog({
      userId: user.id,
      userName: `${user.rank || ''} ${user.firstName} ${user.lastName}`.trim(),
      userRole: user.role,
      action: 'PASSWORD_RESET',
      actionBadge: 'amber',
      actionLabel: 'รีเซ็ตรหัสผ่าน',
      details: `เปลี่ยนรหัสผ่านบัญชี ${user.email || user.citizenId} (${isAdminOverride ? 'โดย Admin' : 'ยืนยัน 3 ปัจจัยสำเร็จ'})`,
      ip: clientInfo?.ip || '127.0.0.1',
      device: clientInfo?.device || 'Web Browser'
    });

    this.saveToFile();
    return true;
  }

  // --- Claims Management with Role-Based Scoping & Unit Hierarchy ---
  // คำนวณรหัสหน่วยงานทั้งหมดภายใต้สายการบังคับบัญชา (รวมหน่วยตัวเอง และหน่วยรองทั้งหมดในโครงสร้าง)
  getUnitHierarchyIds(unitId) {
    if (!unitId) return new Set();
    const result = new Set([unitId]);
    const queue = [unitId];

    // ค้นหาหน่วยลูก/หน่วยรองทั้งหมดตามลำดับชั้น (Descendants)
    while (queue.length > 0) {
      const currentId = queue.shift();
      const children = (this.units || []).filter((u) => u.parentId === currentId && u.status !== 'INACTIVE');
      for (const child of children) {
        if (!result.has(child.id)) {
          result.add(child.id);
          queue.push(child.id);
        }
      }
    }
    return result;
  }

  // ตรวจสอบว่าคำร้องอยู่ในโครงสร้างสังกัดของหน่วยหรือไม่ (Hierarchical Unit Scoping)
  isClaimInUnitHierarchy(claim, userUnitId) {
    if (!userUnitId || !claim) return false;

    // 1. ตรวจสอบตรงกับ unitId
    if (claim.unitId === userUnitId) return true;

    // 2. ตรวจสอบกับสายการบังคับบัญชาภายใต้หน่วยนี้ (Hierarchy descendant match)
    const allowedUnitIds = this.getUnitHierarchyIds(userUnitId);
    if (allowedUnitIds.has(claim.unitId)) return true;
    if (claim.unitLevel1Id && allowedUnitIds.has(claim.unitLevel1Id)) return true;
    if (claim.unitLevel2Id && allowedUnitIds.has(claim.unitLevel2Id)) return true;
    if (claim.unitLevel3Id && allowedUnitIds.has(claim.unitLevel3Id)) return true;

    // 3. ตรวจสอบกรณีคำร้องระบุหน่วยระดับล่าง และ userUnitId เป็นหน่วยแม่/ต้นสังกัดเหนือขึ้นไป (Ancestors of claim's unit)
    let current = (this.units || []).find((u) => u.id === claim.unitId);
    while (current && current.parentId) {
      if (current.parentId === userUnitId) return true;
      current = (this.units || []).find((u) => u.id === current.parentId);
    }

    // 4. ตรวจสอบกรณีชื่อหน่วยตรงกับชื่อทางการหรือชื่อย่อ
    const userUnit = (this.units || []).find((u) => u.id === userUnitId);
    if (userUnit) {
      if (claim.unitName && (claim.unitName === userUnit.name || claim.unitName === userUnit.shortName)) return true;
      if (claim.unitPath && (claim.unitPath.includes(userUnit.name) || (userUnit.shortName && claim.unitPath.includes(userUnit.shortName)))) return true;
    }

    return false;
  }

  getClaims(user) {
    let result = [...this.claims];

    // Data Scoping:
    // 1. เจ้าหน้าที่หน่วย (UNIT_OFFICER) ให้เห็นเฉพาะรายงานภายในโครงสร้างของสังกัดตัวเอง (รวมถึงแบบร่างของสังกัด)
    if (user && user.role === 'UNIT_OFFICER') {
      result = result.filter((c) => this.isClaimInUnitHierarchy(c, user.unitId));
    } 
    // 2. เจ้าหน้าที่สายงาน Workflow อื่นๆ (กสพ., จก.กพ.ทบ., ประกันภัย, สก.ทบ.)
    // จะไม่เห็นแบบร่างที่ยังไม่ได้ส่งเรื่องเสนอเข้าระบบ (สถานะ DRAFT)
    else if (user && user.role !== 'ADMIN') {
      result = result.filter((c) => c.status !== 'DRAFT');
    }

    // เรียงลำดับจากล่าสุด
    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getClaimById(id, user) {
    const claim = this.claims.find((c) => c.id === id);
    if (!claim) return null;

    // ตรวจสอบสิทธิกรณี UNIT_OFFICER: ต้องอยู่ภายในโครงสร้างสังกัดตัวเองเท่านั้น
    if (user && user.role === 'UNIT_OFFICER' && !this.isClaimInUnitHierarchy(claim, user.unitId)) {
      throw new Error('ท่านไม่มีสิทธิเข้าถึงข้อมูลคำร้องของหน่วยอื่น (อยู่นอกโครงสร้างสายการบังคับบัญชาของสังกัดท่าน)');
    }
    return claim;
  }

  createClaim(claimData, user, isDraft = false) {
    const cleanCasualtyId = (claimData.casualtyCitizenId || '').replace(/\D/g, '');

    // ระบบตรวจสอบห้ามเลขบัตร ปชช. ซ้ำซ้อน ป้องกันการยื่นเรื่องซ้ำ (เฉพาะเมื่อไม่ใช่บันทึกร่าง หรือไม่ซ้ำกับเรื่องที่ส่งแล้ว)
    if (cleanCasualtyId && !isDraft) {
      const existingClaim = this.claims.find(
        (c) => c.status !== 'DRAFT' && (c.casualtyCitizenId || '').replace(/\D/g, '') === cleanCasualtyId
      );
      if (existingClaim) {
        throw new Error(
          `ไม่สามารถยื่นเรื่องซ้ำได้: เลขประจำตัวประชาชนผู้สูญเสีย ${claimData.casualtyCitizenId} เคยมีการยื่นเสนอเรื่องในระบบแล้ว (เลขที่อ้างอิง: ${existingClaim.trackingCode} หน่วย: ${existingClaim.unitName})`
        );
      }
    }

    const trackingYear = (new Date().getFullYear() + 543).toString().slice(-2);
    const trackingCode = isDraft
      ? `ร่าง-ทบ-${trackingYear}/${String(this.claims.length + 1).padStart(3, '0')}`
      : `ทบ-กพ-${trackingYear}/${String(this.claims.length + 1).padStart(3, '0')}`;

    const newClaim = {
      id: 'CLM-' + Date.now(),
      trackingCode,
      reporterId: user.id,
      reporterName: `${user.rank} ${user.firstName} ${user.lastName}`,
      unitId: user.unitId,
      unitName: user.unitName,
      status: isDraft ? 'DRAFT' : 'SUBMITTED',
      slaTargetDays: 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...claimData,
      casualtyCitizenId: cleanCasualtyId || claimData.casualtyCitizenId,
      timeline: [
        {
          action: isDraft ? 'SAVE_DRAFT' : 'SUBMIT_CLAIM',
          by: `${user.rank} ${user.firstName} ${user.lastName} (${user.unitName})`,
          timestamp: new Date().toISOString(),
          remark: isDraft 
            ? 'บันทึกแบบร่างคำร้อง (รอแนบเอกสารเพิ่มเติม)'
            : `ยื่นเสนอเรื่องขอรับเงินสินไหม (${claimData.claimType === 'HIGH_RISK' ? 'หน้าที่สำคัญ/เสี่ยงภัย 300,000 บ.' : 'ยามปกติ 60,000 บ.'})`
        }
      ]
    };

    this.claims.unshift(newClaim);
    this.saveToFile();

    // แจ้งเตือน Socket.IO & Telegram เฉพาะเมื่อส่งเรื่องจริง
    if (!isDraft) {
      const claimTypeLabel = newClaim.claimType === 'HIGH_RISK'
        ? 'ปฏิบัติหน้าที่สำคัญ/เสี่ยงภัย (300,000 บ.)'
        : 'ยามปกติ (60,000 บ.)';
      const lossLabel = newClaim.lossType === 'DISABLED' ? 'พิการทุพพลภาพ' : 'เสียชีวิต';
      this.notifyClaimEvent({
        claim: newClaim,
        title: 'ยื่นเสนอขอรับเงินสินไหมทดแทนเรื่องใหม่',
        message: `หน่วย ${newClaim.unitName || user.unitName} เสนอเรื่อง ${newClaim.casualtyRank} ${newClaim.casualtyFirstName} ${newClaim.casualtyLastName} (${lossLabel} | ${claimTypeLabel})`,
        type: 'NEW_CLAIM',
        user
      });
    }

    this.emitRealtimeEvent('claim_created', newClaim, { withStats: !isDraft, scopeClaim: newClaim });

    return newClaim;
  }

  updateDraftClaim(id, claimData, user, submitNow = false) {
    const claim = this.claims.find((c) => c.id === id);
    if (!claim) throw new Error('ไม่พบคำร้องที่ระบุ');

    // ตรวจสอบสิทธิ์: ต้องเป็นหน่วยเดียวกันหรือเป็น ADMIN
    if (user.role !== 'ADMIN' && user.role === 'UNIT_OFFICER' && !this.isClaimInUnitHierarchy(claim, user.unitId)) {
      throw new Error('ท่านไม่มีสิทธิแก้ไขแบบร่างของหน่วยอื่น');
    }

    const cleanCasualtyId = (claimData.casualtyCitizenId || '').replace(/\D/g, '');

    if (submitNow) {
      // ตรวจสอบเลขบัตร ปชช. ห้ามซ้ำกับเรื่องอื่นที่ส่งแล้ว
      if (cleanCasualtyId) {
        const existingClaim = this.claims.find(
          (c) => c.id !== id && c.status !== 'DRAFT' && (c.casualtyCitizenId || '').replace(/\D/g, '') === cleanCasualtyId
        );
        if (existingClaim) {
          throw new Error(
            `ไม่สามารถยื่นเรื่องซ้ำได้: เลขประจำตัวประชาชนผู้สูญเสีย ${claimData.casualtyCitizenId} เคยมีการยื่นเสนอเรื่องในระบบแล้ว (เลขที่อ้างอิง: ${existingClaim.trackingCode} หน่วย: ${existingClaim.unitName})`
          );
        }
      }

      // เปลี่ยน trackingCode เป็นเลขทางการ หากยังเป็นรหัสร่าง
      const trackingYear = (new Date().getFullYear() + 543).toString().slice(-2);
      if (claim.trackingCode.startsWith('ร่าง-') || claim.status === 'DRAFT') {
        const officialCount = this.claims.filter((c) => !c.trackingCode.startsWith('ร่าง-')).length + 1;
        claim.trackingCode = `ทบ-กพ-${trackingYear}/${String(officialCount).padStart(3, '0')}`;
      }

      claim.status = 'SUBMITTED';
      claim.submittedAt = new Date().toISOString();
      if (!Array.isArray(claim.timeline)) claim.timeline = [];
      claim.timeline.push({
        action: 'SUBMIT_CLAIM',
        by: `${user.rank || ''} ${user.firstName} ${user.lastName} (${user.unitName || user.role})`.trim(),
        timestamp: new Date().toISOString(),
        remark: `ยื่นเสนอเรื่องขอรับสิทธิเงินสินไหม (${claimData.claimType === 'HIGH_RISK' ? 'หน้าที่สำคัญ/เสี่ยงภัย 300,000 บ.' : 'ยามปกติ 60,000 บ.'})`
      });
    } else {
      // บันทึกแก้ไขร่าง
      if (!Array.isArray(claim.timeline)) claim.timeline = [];
      claim.timeline.push({
        action: 'UPDATE_DRAFT',
        by: `${user.rank || ''} ${user.firstName} ${user.lastName} (${user.unitName || user.role})`.trim(),
        timestamp: new Date().toISOString(),
        remark: 'บันทึกแก้ไขข้อมูลแบบร่างและปรับปรุงเอกสารแนบเพิ่มเติม'
      });
    }

    // รวมข้อมูลอัปเดต
    Object.assign(claim, claimData, {
      updatedAt: new Date().toISOString(),
      casualtyCitizenId: cleanCasualtyId || claimData.casualtyCitizenId || claim.casualtyCitizenId
    });

    this.saveToFile();

    if (submitNow) {
      const claimTypeLabel = claim.claimType === 'HIGH_RISK'
        ? 'ปฏิบัติหน้าที่สำคัญ/เสี่ยงภัย (300,000 บ.)'
        : 'ยามปกติ (60,000 บ.)';
      const lossLabel = claim.lossType === 'DISABLED' ? 'พิการทุพพลภาพ' : 'เสียชีวิต';
      this.notifyClaimEvent({
        claim,
        title: 'ยื่นเสนอขอรับเงินสินไหมทดแทนเรื่องใหม่ (ส่งจากแบบร่าง)',
        message: `หน่วย ${claim.unitName || user.unitName} ส่งเรื่อง ${claim.casualtyRank} ${claim.casualtyFirstName} ${claim.casualtyLastName} (${lossLabel} | ${claimTypeLabel})`,
        type: 'NEW_CLAIM',
        user
      });
    }

    this.emitRealtimeEvent('claim_updated', { id, status: claim.status, claim }, { withStats: submitNow, scopeClaim: claim });

    return claim;
  }

  updateClaimStatus(id, newStatus, user, remark, extraData = {}) {
    const claim = this.claims.find((c) => c.id === id);
    if (!claim) throw new Error('ไม่พบคำร้องที่ระบุ');

    claim.status = newStatus;
    claim.updatedAt = new Date().toISOString();
    Object.assign(claim, extraData);

    const logEntry = {
      action: newStatus,
      by: `${user.rank || ''} ${user.firstName} ${user.lastName} (${user.role})`,
      timestamp: new Date().toISOString(),
      remark: remark || `เปลี่ยนสถานะเป็น ${CLAIM_STATUS[newStatus]?.label || newStatus}`,
      approvalDocument: extraData.approvalDocument ? {
        docNumber: extraData.approvalDocument.docNumber,
        fileName: extraData.approvalDocument.fileName,
        approvedDate: extraData.approvalDocument.approvedDate
      } : undefined
    };

    claim.timeline.push(logEntry);
    this.saveToFile();

    const claimTypeLabel = claim.claimType === 'HIGH_RISK' ? 'เสี่ยงภัย 300,000 บ.' : 'ยามปกติ 60,000 บ.';
    const messageLines = [
      `เรื่อง ${claim.trackingCode} (${claim.casualtyRank} ${claim.casualtyFirstName} ${claim.casualtyLastName} | ${claim.unitName || '-'} | ${claimTypeLabel})`,
      `ผู้ดำเนินการ: ${logEntry.by}`,
      `หมายเหตุ: ${remark || '-'}`
    ];

    if (newStatus === 'APPROVED' && claim.approvalDocument) {
      messageLines.push(`📑 คำสั่งอนุมัติเลขที่: ${claim.approvalDocument.docNumber}`);
      messageLines.push('📎 ส่งเอกสารตัวเรื่องให้ บ.ประกันภัย ตรวจสอบรับทราบแล้ว');
    }

    if (newStatus === 'PAID' && claim.transferDetails) {
      const td = claim.transferDetails;
      messageLines.push(`💰 ยอดโอน: ${Number(td.amount || claim.compensationAmount || 0).toLocaleString()} บาท (${td.bank || '-'} | อ้างอิง ${td.referenceNo || '-'})`);
    }

    const notifType =
      newStatus === 'REJECTED_BY_KSP' || newStatus === 'DOC_REQUESTED'
        ? 'DOC_REJECTED'
        : newStatus === 'PAID' || newStatus === 'SK_NOTIFIED'
          ? 'PAYMENT_PAID'
          : newStatus === 'APPROVED'
            ? 'APPROVED'
            : 'STATUS_CHANGE';

    this.notifyClaimEvent({
      claim,
      title: `อัปเดตสถานะ: ${CLAIM_STATUS[newStatus]?.label || newStatus}`,
      message: messageLines.join('\n'),
      type: notifType,
      user
    });

    this.emitRealtimeEvent('claim_updated', { id, status: newStatus, claim }, { withStats: true, scopeClaim: claim });

    return claim;
  }

  updateDocumentStatus(claimId, docIndex, status, comment, user) {
    const claim = this.claims.find((c) => c.id === claimId);
    if (!claim) throw new Error('ไม่พบคำร้อง');

    const doc = claim.documents.find((d) => d.index === docIndex);
    if (!doc) throw new Error('ไม่พบเอกสารลำดับที่ ' + docIndex);

    doc.status = status;
    doc.comment = comment;
    if (user) {
      doc.verifiedBy = `${user.rank || ''} ${user.firstName} ${user.lastName}`.trim();
      doc.verifiedRole = user.role;
      doc.verifiedAt = new Date().toISOString();

      const reviewerLabel = user.role === 'INSURANCE_REP' 
        ? 'บริษัทประกันภัย' 
        : user.role === 'KSP_OFFICER' 
        ? 'กพ.ทบ.(กสพ.ฯ)' 
        : 'ผู้ดูแลระบบ';

      claim.timeline = claim.timeline || [];
      claim.timeline.push({
        action: `DOC_INSPECTION_${docIndex}`,
        by: `${user.rank || ''} ${user.firstName} ${user.lastName} (${reviewerLabel})`.trim(),
        timestamp: new Date().toISOString(),
        remark: `${reviewerLabel} ตรวจสอบเอกสารข้อ ${docIndex} (${doc.name}): ${status === 'VERIFIED' ? '✓ ผ่านการตรวจ' : '✗ ให้แก้ไข/ขอเพิ่มเติม'} ${comment ? `[${comment}]` : ''}`
      });
    }

    this.saveToFile();

    if (status === 'REJECTED') {
      this.notifyClaimEvent({
        claim,
        title: `ขอแก้ไขเอกสารข้อที่ ${docIndex}: ${doc.name}`,
        message: `เรื่อง ${claim.trackingCode} (${claim.unitName || '-'})\nเหตุผล: ${comment || 'เอกสารไม่สมบูรณ์ กรุณาอัปโหลดใหม่'}`,
        type: 'DOC_REJECTED',
        user,
        sendTelegram: true
      });
    } else if (status === 'VERIFIED') {
      this.notifyClaimEvent({
        claim,
        title: `ตรวจสอบเอกสารข้อที่ ${docIndex} ผ่านแล้ว`,
        message: `เรื่อง ${claim.trackingCode} (${doc.name})`,
        type: 'DOC_VERIFIED',
        user,
        sendTelegram: false
      });
    }

    this.emitRealtimeEvent('claim_updated', { id: claimId, claim }, { scopeClaim: claim });
    return claim;
  }

  deleteClaim(id, user) {
    const idx = this.claims.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('ไม่พบคำร้องที่ต้องการลบ');

    const claim = this.claims[idx];

    // ตรวจสอบสิทธิ์การลบ:
    // 1. ADMIN สามารถลบได้ทุกคำร้อง
    // 2. UNIT_OFFICER สามารถลบคำร้องของสังกัดตนเองได้ (เฉพาะร่างคำร้อง หรือเรื่องที่ยังไม่ได้รับการอนุมัติ)
    if (user.role !== 'ADMIN') {
      if (user.role === 'UNIT_OFFICER') {
        if (!this.isClaimInUnitHierarchy(claim, user.unitId)) {
          throw new Error('ท่านไม่มีสิทธิลบคำร้องของหน่วยอื่น');
        }
        if (claim.status === 'PAID' || claim.status === 'SK_NOTIFIED' || claim.status === 'APPROVED') {
          throw new Error('ไม่สามารถลบคำร้องที่ผู้บังคับบัญชาอนุมัติหรือโอนเงินแล้วได้');
        }
      } else {
        throw new Error('ท่านไม่มีสิทธิลบคำร้องในระบบ');
      }
    }

    const deleted = this.claims.splice(idx, 1)[0];

    // บันทึก Audit Log
    this.addActivityLog({
      action: 'DELETE_CLAIM',
      actionBadge: 'red',
      actionLabel: 'ลบคำร้อง',
      userId: user.id,
      userName: `${user.rank || ''} ${user.firstName} ${user.lastName}`.trim(),
      userRole: user.role,
      unitName: user.unitName || '',
      targetId: claim.id,
      targetName: claim.trackingCode,
      details: `ลบคำร้อง ${claim.trackingCode} (${claim.casualtyRank} ${claim.casualtyFirstName} ${claim.casualtyLastName}) หน่วย ${claim.unitName}`
    });
    this.saveToFile();

    if (deleted.status !== 'DRAFT') {
      this.notifyClaimEvent({
        claim: deleted,
        title: `ลบคำร้อง ${deleted.trackingCode} ออกจากระบบ`,
        message: `${deleted.casualtyRank} ${deleted.casualtyFirstName} ${deleted.casualtyLastName} (${deleted.unitName || '-'})`,
        type: 'CLAIM_DELETED',
        user,
        sendTelegram: true
      });
    }

    this.emitRealtimeEvent('claim_deleted', { id }, { withStats: true, scopeClaim: deleted });

    return { success: true, deletedClaim: deleted };
  }

  attachClaimDocument(claimId, docIndex, fileData, user) {
    const claim = this.claims.find((c) => c.id === claimId);
    if (!claim) throw new Error('ไม่พบคำร้อง');

    if (user.role !== 'ADMIN' && user.role === 'UNIT_OFFICER' && !this.isClaimInUnitHierarchy(claim, user.unitId)) {
      throw new Error('ท่านไม่มีสิทธิจัดการเอกสารของหน่วยอื่น');
    }

    if (!Array.isArray(claim.documents)) {
      claim.documents = [];
    }

    let doc = claim.documents.find((d) => d.index === docIndex);
    if (!doc) {
      doc = { index: docIndex, name: `เอกสารลำดับที่ ${docIndex}`, uploaded: true };
      claim.documents.push(doc);
    }

    doc.uploaded = true;
    doc.fileName = fileData.fileName || doc.fileName;
    doc.fileUrl = fileData.fileUrl || `/uploads/${fileData.fileName}`;
    doc.fileData = fileData.fileData || doc.fileData;
    doc.fileSize = fileData.fileSize || doc.fileSize || 0;
    doc.status = 'PENDING';
    doc.updatedAt = new Date().toISOString();

    claim.timeline = claim.timeline || [];
    claim.timeline.push({
      action: `UPLOAD_DOC_${docIndex}`,
      by: `${user.rank || ''} ${user.firstName} ${user.lastName} (${user.unitName || user.role})`.trim(),
      timestamp: new Date().toISOString(),
      remark: `แนบ/อัปเดตไฟล์เอกสารข้อ ${docIndex} (${doc.name}): ${doc.fileName}`
    });

    this.saveToFile();

    const isFollowUpUpload = claim.status === 'DOC_REQUESTED' || claim.status === 'REJECTED_BY_KSP';
    if (isFollowUpUpload) {
      this.notifyClaimEvent({
        claim,
        title: `หน่วยส่งเอกสารเพิ่มเติม/แก้ไข ข้อที่ ${docIndex}`,
        message: `เรื่อง ${claim.trackingCode} (${claim.unitName || '-'}) แนบไฟล์: ${doc.fileName}`,
        type: 'DOC_UPLOADED',
        user,
        sendTelegram: true
      });
    }

    this.emitRealtimeEvent('claim_updated', { id: claimId, claim }, { scopeClaim: claim });

    return claim;
  }

  removeClaimDocument(claimId, docIndex, user) {
    const claim = this.claims.find((c) => c.id === claimId);
    if (!claim) throw new Error('ไม่พบคำร้อง');

    if (user.role !== 'ADMIN' && user.role === 'UNIT_OFFICER' && !this.isClaimInUnitHierarchy(claim, user.unitId)) {
      throw new Error('ท่านไม่มีสิทธิจัดการเอกสารของหน่วยอื่น');
    }

    const doc = (claim.documents || []).find((d) => d.index === docIndex);
    if (!doc) throw new Error('ไม่พบเอกสารข้อที่ ' + docIndex);

    const oldFileName = doc.fileName;
    doc.uploaded = false;
    doc.fileName = '';
    doc.fileUrl = '';
    doc.fileData = null;
    doc.fileSize = 0;
    doc.status = 'PENDING';

    claim.timeline = claim.timeline || [];
    claim.timeline.push({
      action: `REMOVE_DOC_${docIndex}`,
      by: `${user.rank || ''} ${user.firstName} ${user.lastName} (${user.unitName || user.role})`.trim(),
      timestamp: new Date().toISOString(),
      remark: `ลบไฟล์แนบเอกสารข้อ ${docIndex} (${doc.name}) [เดิมคือ: ${oldFileName}]`
    });

    this.saveToFile();
    this.emitRealtimeEvent('claim_updated', { id: claimId, claim }, { scopeClaim: claim });

    return claim;
  }

  updateClaimInfo(claimId, updateData, user) {
    const claim = this.claims.find((c) => c.id === claimId);
    if (!claim) throw new Error('ไม่พบคำร้อง');

    if (user.role !== 'ADMIN' && user.role === 'UNIT_OFFICER' && !this.isClaimInUnitHierarchy(claim, user.unitId)) {
      throw new Error('ท่านไม่มีสิทธิแก้ไขข้อมูลคำร้องของหน่วยอื่น');
    }

    Object.assign(claim, updateData, {
      updatedAt: new Date().toISOString()
    });

    claim.timeline = claim.timeline || [];
    claim.timeline.push({
      action: 'EDIT_CLAIM_INFO',
      by: `${user.rank || ''} ${user.firstName} ${user.lastName} (${user.unitName || user.role})`.trim(),
      timestamp: new Date().toISOString(),
      remark: 'แก้ไขปรับปรุงข้อมูลคำร้อง'
    });

    this.saveToFile();
    this.emitRealtimeEvent('claim_updated', { id: claimId, claim }, { withStats: true, scopeClaim: claim });

    return claim;
  }

  uploadDelayReason(claimId, reason, fileUrl, user) {
    const claim = this.getClaimById(claimId, user);
    if (!claim) throw new Error('ไม่พบคำร้อง');

    claim.delayReason = reason;
    claim.delayAttachmentUrl = fileUrl || claim.delayAttachmentUrl;
    claim.timeline.push({
      action: 'DELAY_JUSTIFICATION_SUBMITTED',
      by: `${user.rank || ''} ${user.firstName} ${user.lastName} (${user.unitName || user.role})`,
      timestamp: new Date().toISOString(),
      remark: `ชี้แจงเหตุผลความล่าช้า: ${reason}`
    });

    this.saveToFile();

    this.notifyClaimEvent({
      claim,
      title: 'รายงานผลการดำเนินงานล่าช้า (เกิน 30 วัน)',
      message: `เรื่อง ${claim.trackingCode} โดย ${claim.unitName || '-'}\nเหตุผล: ${reason}`,
      type: 'DELAY_REPORT',
      user
    });

    this.emitRealtimeEvent('claim_updated', { id: claimId, claim }, { withStats: true, scopeClaim: claim });
    return claim;
  }

  // --- Real-time Live & Fiscal/Policy Year Statistics Aggregator ---
  getStatistics(targetFiscalYear = null, compareFiscalYear = null, options = {}) {
    this.syncIfFileChanged();
    const periodType = options?.periodType === 'policy' ? 'policy' : 'fiscal';
    const monthDefs = periodType === 'policy' ? POLICY_YEAR_MONTHS : FISCAL_YEAR_MONTHS;
    const getYearFn = periodType === 'policy' ? getPolicyYear : getFiscalYear;
    const getDateRangeText = (yr) =>
      periodType === 'policy'
        ? `1 เม.ย. ${yr - 1} - 31 มี.ค. ${yr}`
        : `1 ต.ค. ${yr - 1} - 30 ก.ย. ${yr}`;
    const isPrevCalendarYearMonth = (m) => (periodType === 'policy' ? Boolean(m.isPrevYear) : m.index >= 9);

    // ไม่นับคำร้องสถานะ DRAFT เข้าสถิติทางการ
    const submittedClaims = this.claims.filter((c) => c.status !== 'DRAFT');

    // 1. หาปีทั้งหมดที่มีในระบบ (ให้มั่นใจว่ามีอย่างน้อย 4 ปีต่อเนื่องเพื่อเทียบย้อนหลังได้ 3 ปี)
    const fySet = new Set();
    submittedClaims.forEach((c) => {
      const fy = getYearFn(c.reportDate || c.createdAt);
      if (fy) fySet.add(fy);
    });

    const latestFoundYear = fySet.size > 0 ? Math.max(...fySet) : 2570;
    if (periodType === 'policy') {
      for (let offset = 0; offset <= 3; offset++) {
        fySet.add(latestFoundYear - offset);
      }
    }

    const availableFiscalYears = Array.from(fySet).sort((a, b) => b - a);
    if (availableFiscalYears.length === 0) availableFiscalYears.push(2569);

    const isAllYears = targetFiscalYear === 'ALL';
    const activeFiscalYear = isAllYears ? 'ALL' : (Number(targetFiscalYear) || availableFiscalYears[0]);
    const numActiveFiscalYear = typeof activeFiscalYear === 'number' ? activeFiscalYear : availableFiscalYears[0];

    let compareYearsList;
    if (Array.isArray(options?.compareYears) && options.compareYears.length > 0) {
      compareYearsList = options.compareYears
        .map((y) => Number(y))
        .filter((y) => !isNaN(y) && y !== numActiveFiscalYear)
        .slice(0, 3);
    } else if (periodType === 'policy') {
      compareYearsList = [numActiveFiscalYear - 1, numActiveFiscalYear - 2, numActiveFiscalYear - 3];
    } else {
      const fallbackPrev =
        Number(compareFiscalYear) ||
        availableFiscalYears.find((y) => y < numActiveFiscalYear) ||
        numActiveFiscalYear - 1;
      compareYearsList = [fallbackPrev];
    }
    if (compareYearsList.length === 0) {
      compareYearsList = [numActiveFiscalYear - 1];
    }
    const prevFiscalYear = Number(compareFiscalYear) || compareYearsList[0];

    // Helper: ดึงคำร้องตามรอบปี (หรือทั้งหมดเมื่อ isAllYears)
    const getClaimsForYear = (yr) =>
      submittedClaims.filter((c) => getYearFn(c.reportDate || c.createdAt) === yr);

    // 2. คำนวณยอดรวมของข้อมูลตามตัวเลือกปี
    const activeClaims = isAllYears ? submittedClaims : getClaimsForYear(activeFiscalYear);
    const compareClaims = getClaimsForYear(prevFiscalYear);
    const activeBaseClaims = getClaimsForYear(numActiveFiscalYear);
    const compareClaimsByYear = {};
    compareYearsList.forEach((yr) => {
      compareClaimsByYear[yr] = getClaimsForYear(yr);
    });

    // สถิติผู้สูญเสียจำแนกอย่างละเอียด
    let deceasedCount = 0;
    let deceasedIllnessCount = 0;      // เสียชีวิตจากการป่วย
    let deceasedAccidentCount = 0;     // เสียชีวิตจากอุบัติเหตุ
    let deceasedCombatCount = 0;       // เสียชีวิตจากการรบ/ปะทะ/ปฏิบัติหน้าที่สนาม
    let deceasedOtherCount = 0;        // อื่นๆ

    let disabledCount = 0;
    let disabledIllnessCount = 0;      // พิการจากการป่วย
    let disabledAccidentCount = 0;     // พิการจากอุบัติเหตุ
    let disabledCombatCount = 0;       // พิการจากการรบ/ปะทะ
    let disabledOtherCount = 0;

    // สถิติสถานะขั้นตอน Workflow
    let submittedCount = 0;            // เสนอขอรับสินไหมใหม่ (SUBMITTED)
    let underReviewCount = 0;          // กสพ. กำลังตรวจเอกสาร (UNDER_REVIEW)
    let inProgressCount = 0;           // กำลังดำเนินการในระบบ
    let pendingApprovalCount = 0;      // รอ จก.กพ.ทบ. อนุมัติ (PENDING_APPROVAL)
    let commanderApprovedCount = 0;    // อนุมัติ จก.กพ.ทบ. แล้ว (APPROVED, INSURANCE_PROCESSING, PAID, SK_NOTIFIED)
    let insuranceProcessingCount = 0;  // บ.ประกันภัย กำลังตรวจ
    let paidClaimsCount = 0;           // จ่ายโอนเงินแล้ว (PAID, SK_NOTIFIED)
    let rejectedClaimsCount = 0;       // ไม่อนุมัติ / ส่งกลับแก้ไข (REJECTED_BY_KSP)
    let skNotifiedCount = 0;           // สก.ทบ. รับทราบยอด (ปิดเรื่อง)

    // สถิติจำนวนเรื่องและยอดเงินโอน แยกยามปกติ (60,000) และ เสี่ยงภัย (300,000)
    let normalClaimCount = 0;          // ยามปกติ ทั้งหมด (เรื่อง)
    let normalPaidCount = 0;           // ยามปกติ จ่ายโอนเงินแล้ว (เรื่อง)
    let normalPaidAmount = 0;          // ยอดเงินโอน ยามปกติ (บาท)
    let normalTotalAmount = 0;         // ยอดเงินตามสิทธิ ยามปกติ (บาท)

    let highRiskClaimCount = 0;        // เสี่ยงภัย ทั้งหมด (เรื่อง)
    let highRiskPaidCount = 0;         // เสี่ยงภัย จ่ายโอนเงินแล้ว (เรื่อง)
    let highRiskPaidAmount = 0;        // ยอดเงินโอน เสี่ยงภัย (บาท)
    let highRiskTotalAmount = 0;       // ยอดเงินตามสิทธิ เสี่ยงภัย (บาท)

    let totalPaidAmount = 0;
    let totalCompensationAmount = 0;
    let pendingCount = 0;
    let overdueCount = 0;

    const causeStats = {};
    const personnelStats = {};
    const now = new Date();

    activeClaims.forEach((c) => {
      const isPaid = c.status === 'PAID' || c.status === 'SK_NOTIFIED';
      const isApproved = c.status === 'APPROVED' || c.status === 'INSURANCE_PROCESSING' || isPaid;
      const amount = Number(c.compensationAmount || (c.claimType === 'HIGH_RISK' ? 300000 : 60000));
      totalCompensationAmount += amount;

      // วิเคราะห์ลักษณะการเกิดเหตุ (ป่วย vs อุบัติเหตุ vs การรบ)
      const incType = (c.incidentType || '').toUpperCase();
      const causeText = `${c.causeOfLoss || ''} ${c.lossSpecificCause || ''} ${c.deathCertificateCause || ''} ${c.disabledOrganDetail || ''}`.toLowerCase();
      
      const isIllness = incType === 'ILLNESS' || 
        causeText.includes('ป่วย') || causeText.includes('โรค') || causeText.includes('หัวใจวาย') || 
        causeText.includes('ไข้') || causeText.includes('มาลาเรีย') || causeText.includes('ลมแดด') || causeText.includes('ติดเชื้อ');
        
      const isAccident = incType === 'ACCIDENT' || 
        causeText.includes('อุบัติเหตุ') || causeText.includes('จราจร') || causeText.includes('ยานยนต์') || 
        causeText.includes('ยานพาหนะ') || causeText.includes('รถยนต์') || causeText.includes('รถจักรยานยนต์') || 
        causeText.includes('พลัดตก') || causeText.includes('จมน้ำ') || causeText.includes('ขณะฝึก');

      const isCombat = incType === 'COMBAT' || 
        causeText.includes('รบ') || causeText.includes('ปะทะ') || causeText.includes('ระเบิด') || 
        causeText.includes('กับระเบิด') || causeText.includes('ซุ่มโจมตี') || causeText.includes('ซุ่มยิง') || 
        causeText.includes('กระสุน') || causeText.includes('ผู้ก่อความไม่สงบ');

      // 1. จำแนกผู้สูญเสีย (ผู้เสียชีวิต vs พิการทุพพลภาพ)
      if (c.lossType === 'DECEASED') {
        deceasedCount++;
        if (isIllness) {
          deceasedIllnessCount++;
        } else if (isAccident) {
          deceasedAccidentCount++;
        } else if (isCombat) {
          deceasedCombatCount++;
        } else {
          deceasedOtherCount++;
        }
      } else if (c.lossType === 'DISABLED') {
        disabledCount++;
        if (isIllness) {
          disabledIllnessCount++;
        } else if (isAccident) {
          disabledAccidentCount++;
        } else if (isCombat) {
          disabledCombatCount++;
        } else {
          disabledOtherCount++;
        }
      }

      // 2. จำแนกสถานะขั้นตอน Workflow
      if (c.status === 'SUBMITTED') submittedCount++;
      if (c.status === 'UNDER_REVIEW') underReviewCount++;
      if (c.status === 'PENDING_APPROVAL') pendingApprovalCount++;
      if (c.status === 'INSURANCE_PROCESSING' || c.status === 'DOC_REQUESTED') insuranceProcessingCount++;
      if (c.status === 'SK_NOTIFIED') skNotifiedCount++;
      if (c.status === 'REJECTED_BY_KSP') rejectedClaimsCount++;

      // กำลังดำเนินการ
      if (c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW' || c.status === 'PENDING_APPROVAL' || c.status === 'APPROVED' || c.status === 'INSURANCE_PROCESSING' || c.status === 'DOC_REQUESTED') {
        inProgressCount++;
      }

      // อนุมัติ จก.กพ.ทบ. แล้ว (เรื่องที่ผ่านขั้นตอนอนุมัติ)
      if (isApproved) {
        commanderApprovedCount++;
      }

      // จ่ายโอนเงินแล้ว
      if (isPaid) {
        paidClaimsCount++;
        totalPaidAmount += amount;
      } else {
        pendingCount++;
      }

      // 3. จำแนกประเภทสินไหม ยามปกติ (60,000) vs เสี่ยงภัย (300,000)
      if (c.claimType === 'NORMAL') {
        normalClaimCount++;
        normalTotalAmount += amount;
        if (isPaid) {
          normalPaidCount++;
          normalPaidAmount += amount;
        }
      } else {
        highRiskClaimCount++;
        highRiskTotalAmount += amount;
        if (isPaid) {
          highRiskPaidCount++;
          highRiskPaidAmount += amount;
        }
      }

      // SLA Tracking
      const created = new Date(c.createdAt);
      const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
      if (diffDays > 30 && c.status !== 'SK_NOTIFIED' && c.status !== 'PAID') {
        overdueCount++;
      }

      const cause = c.causeOfLoss ? (c.causeOfLoss.length > 25 ? c.causeOfLoss.slice(0, 25) + '...' : c.causeOfLoss) : 'อื่นๆ';
      causeStats[cause] = (causeStats[cause] || 0) + 1;

      const pType = c.personnelType || 'อื่นๆ';
      personnelStats[pType] = (personnelStats[pType] || 0) + 1;
    });

    // Helper สรุปตัวเลขจากรายการคำร้องชุดใดๆ ในรอบเดียว (ใช้ร่วมกันทั้งรายเดือน รายปี ประเภทกำลังพล และหน่วย)
    const summarizeBucket = (list) => {
      let total = 0;
      let deceased = 0;
      let disabled = 0;
      let normal = 0;
      let highRisk = 0;
      let normalAmount = 0;
      let highRiskAmount = 0;
      let paidAmount = 0;
      let totalAmount = 0;
      for (const c of list) {
        total++;
        if (c.lossType === 'DECEASED') deceased++;
        else if (c.lossType === 'DISABLED') disabled++;
        const isNormal = c.claimType === 'NORMAL';
        const amt = Number(c.compensationAmount || (isNormal ? 60000 : 300000));
        if (isNormal) {
          normal++;
          normalAmount += amt;
        } else {
          highRisk++;
          highRiskAmount += amt;
        }
        totalAmount += amt;
        if (c.status === 'PAID' || c.status === 'SK_NOTIFIED') {
          paidAmount += amt;
        }
      }
      return {
        total,
        deceased,
        disabled,
        normal,
        highRisk,
        normalAmount,
        highRiskAmount,
        paidAmount,
        totalAmount
      };
    };

    // 3. เรียงลำดับ 12 เดือนตามรอบปี (ปีกรมธรรม์ 1 เม.ย.-31 มี.ค. หรือ ปีงบประมาณ 1 ต.ค.-30 ก.ย.)
    const fiscalMonthlyStats = monthDefs.map((m) => {
      const calYearBE = isPrevCalendarYearMonth(m) ? numActiveFiscalYear - 1 : numActiveFiscalYear;
      const compCalYearBE = isPrevCalendarYearMonth(m) ? prevFiscalYear - 1 : prevFiscalYear;

      const monthClaims = activeClaims.filter((c) => new Date(c.reportDate || c.createdAt).getMonth() === m.index);
      const primarySummary = summarizeBucket(monthClaims);

      const compMonthClaims = compareClaims.filter((c) => new Date(c.reportDate || c.createdAt).getMonth() === m.index);
      const primaryCompSummary = summarizeBucket(compMonthClaims);

      // สถิติรายเดือนสำหรับปีเทียบย้อนหลังสูงสุด 3 ปี
      const compareByYear = {};
      compareYearsList.forEach((yr) => {
        const yrClaims = (compareClaimsByYear[yr] || []).filter(
          (c) => new Date(c.reportDate || c.createdAt).getMonth() === m.index
        );
        const yrSum = summarizeBucket(yrClaims);
        const yrDiff = primarySummary.total - yrSum.total;
        const yrPct = yrSum.total > 0 ? Math.round((yrDiff / yrSum.total) * 100) : (primarySummary.total > 0 ? 100 : 0);
        compareByYear[yr] = {
          ...yrSum,
          calYearBE: isPrevCalendarYearMonth(m) ? yr - 1 : yr,
          diff: yrDiff,
          percentChange: yrPct
        };
      });

      const diff = primarySummary.total - primaryCompSummary.total;
      const percentChange = primaryCompSummary.total > 0
        ? Math.round((diff / primaryCompSummary.total) * 100)
        : (primarySummary.total > 0 ? 100 : 0);

      return {
        key: m.key,
        monthIndex: m.index,
        monthName: m.shortName,
        fullName: m.fullName,
        fiscalOrder: m.fiscalOrder,
        calYearBE,
        compCalYearBE,
        label: `${m.shortName}`,
        fullLabel: `${m.shortName} ${String(calYearBE).slice(-2)}`,
        compareLabel: `${m.shortName} ${String(compCalYearBE).slice(-2)}`,
        ...primarySummary,
        compareTotal: primaryCompSummary.total,
        compareDeceased: primaryCompSummary.deceased,
        compareDisabled: primaryCompSummary.disabled,
        compareNormal: primaryCompSummary.normal,
        compareHighRisk: primaryCompSummary.highRisk,
        compareNormalAmount: primaryCompSummary.normalAmount,
        compareHighRiskAmount: primaryCompSummary.highRiskAmount,
        comparePaidAmount: primaryCompSummary.paidAmount,
        compareTotalAmount: primaryCompSummary.totalAmount,
        compareByYear,
        diff,
        percentChange
      };
    });

    // 4. สถิติเปรียบเทียบรายปี (Yearly Multi-Year Comparison)
    const sortedYearsAsc = [...availableFiscalYears].sort((a, b) => a - b);
    const yearlyFiscalStats = sortedYearsAsc.map((fy, idx) => {
      const yearClaims = getClaimsForYear(fy);
      const yrSum = summarizeBucket(yearClaims);

      const prevYearClaims = idx > 0 ? getClaimsForYear(sortedYearsAsc[idx - 1]) : [];
      const growthRate = prevYearClaims.length > 0
        ? Math.round(((yrSum.total - prevYearClaims.length) / prevYearClaims.length) * 100)
        : 0;

      return {
        fiscalYear: fy,
        fiscalYearText: periodType === 'policy' ? `รอบปี ${fy}` : `ปีงบฯ ${fy}`,
        fullFiscalYearText: periodType === 'policy' ? `รอบปี ${fy - 1}/${fy}` : `ปีงบประมาณ ${fy}`,
        dateRangeText: getDateRangeText(fy),
        totalClaims: yrSum.total,
        deceasedCount: yrSum.deceased,
        disabledCount: yrSum.disabled,
        normalClaimCount: yrSum.normal,
        highRiskClaimCount: yrSum.highRisk,
        totalPaidAmount: yrSum.paidAmount,
        totalCompensationAmount: yrSum.totalAmount,
        growthRate
      };
    });

    // 5. รายงานการสูญเสียจำแนกตามประเภทกำลังพล (ครอบคลุมทุกกลุ่มกำลังพล + เทียบย้อนหลัง 3 ปี)
    const allPersonnelCats = new Set(REPORT_PERSONNEL_CATEGORIES);
    submittedClaims.forEach((c) => {
      allPersonnelCats.add(normalizePersonnelCategory(c.personnelType));
    });

    const personnelReport = Array.from(allPersonnelCats).map((category) => {
      const activeCatClaims = activeClaims.filter(
        (c) => normalizePersonnelCategory(c.personnelType) === category
      );
      const activeSum = summarizeBucket(activeCatClaims);
      const compareByYear = {};
      [numActiveFiscalYear, ...compareYearsList].forEach((yr) => {
        const yrCatClaims = getClaimsForYear(yr).filter(
          (c) => normalizePersonnelCategory(c.personnelType) === category
        );
        compareByYear[yr] = summarizeBucket(yrCatClaims);
      });
      return {
        category,
        ...activeSum,
        compareByYear
      };
    });

    // 6. รายการเทียบหน่วย/สังกัดที่มีการสูญเสียมากที่สุด 10 อันดับ (Top 10 Units)
    const buildTopUnits = (baseClaims) => {
      const unitMap = new Map();
      baseClaims.forEach((c) => {
        const uName = (c.unitName || '').trim() || c.unitId || 'ไม่ระบุหน่วย';
        if (!unitMap.has(uName)) {
          unitMap.set(uName, { unitId: c.unitId || '', unitName: uName, claims: [] });
        }
        unitMap.get(uName).claims.push(c);
      });

      const rows = Array.from(unitMap.values()).map((entry) => {
        const activeSum = summarizeBucket(entry.claims);
        const compareByYear = {};
        [numActiveFiscalYear, ...compareYearsList].forEach((yr) => {
          const yrUnitClaims = getClaimsForYear(yr).filter(
            (c) => ((c.unitName || '').trim() || c.unitId || 'ไม่ระบุหน่วย') === entry.unitName
          );
          compareByYear[yr] = summarizeBucket(yrUnitClaims);
        });
        return {
          unitId: entry.unitId,
          unitName: entry.unitName,
          ...activeSum,
          compareByYear
        };
      });

      rows.sort((a, b) => (b.total - a.total) || (b.deceased - a.deceased) || (b.totalAmount - a.totalAmount));
      return rows.slice(0, 10).map((r, i) => ({ rank: i + 1, ...r }));
    };

    const topUnits = buildTopUnits(activeClaims);
    const combinedYearSet = new Set([numActiveFiscalYear, ...compareYearsList]);
    const combinedWindowClaims = submittedClaims.filter((c) => combinedYearSet.has(getYearFn(c.reportDate || c.createdAt)));
    const topUnitsCombined = buildTopUnits(combinedWindowClaims);

    // เปรียบเทียบภาพรวม Active Year กับ Previous Year
    const activeTotal = activeClaims.length;
    const compareTotal = compareClaims.length;
    const yearGrowthRate = compareTotal > 0 
      ? Math.round(((activeTotal - compareTotal) / compareTotal) * 100) 
      : 0;

    return {
      periodType,
      activeFiscalYear,
      compareFiscalYear: prevFiscalYear,
      compareYears: compareYearsList,
      availableFiscalYears,
      isAllYears,
      activeDateRange: isAllYears ? 'ข้อมูลสะสมทุกปี' : getDateRangeText(numActiveFiscalYear),
      compareDateRange: getDateRangeText(prevFiscalYear),
      totalClaims: activeTotal,
      
      // 1. รายละเอียดผู้เสียชีวิต (จากการป่วย และ อุบัติเหตุ)
      deceasedCount,
      deceasedIllnessCount,
      deceasedAccidentCount,
      deceasedCombatCount,
      deceasedOtherCount,

      // รายละเอียดพิการทุพพลภาพ
      disabledCount,
      disabledIllnessCount,
      disabledAccidentCount,
      disabledCombatCount,
      disabledOtherCount,

      // 2. สถิติสถานะขั้นตอนคำร้องตามที่ระบุ
      submittedCount,
      underReviewCount,
      inProgressCount,
      pendingApprovalCount,
      commanderApprovedCount,
      paidClaimsCount,
      rejectedClaimsCount,
      insuranceProcessingCount,
      skNotifiedCount,

      // 3. ยอดเงินโอนและจำนวนเรื่อง แยกยามปกติ (60,000) และ เสี่ยงภัย (300,000)
      normalClaimCount,
      normalPaidCount,
      normalPaidAmount,
      normalTotalAmount,

      highRiskClaimCount,
      highRiskPaidCount,
      highRiskPaidAmount,
      highRiskTotalAmount,

      totalPaidAmount,
      totalCompensationAmount,
      pendingCount,
      overdueCount,
      causeStats,
      personnelStats,
      personnelReport,
      topUnits,
      topUnitsCombined,
      fiscalMonthlyStats,
      yearlyFiscalStats,
      comparisonSummary: {
        activeTotal,
        compareTotal,
        diff: activeTotal - compareTotal,
        growthRate: yearGrowthRate,
        activePaid: totalPaidAmount,
        comparePaid: compareClaims
          .filter((c) => c.status === 'PAID' || c.status === 'SK_NOTIFIED')
          .reduce((sum, c) => sum + Number(c.compensationAmount || 0), 0)
      }
    };
  }

  // --- Manuals Management ---
  getManuals() {
    return [...this.manuals];
  }

  createManual(manualData) {
    const newManual = {
      id: manualData.id || ('man-' + Date.now()),
      title: manualData.title,
      format: manualData.format || 'PDF',
      size: manualData.size || '1.0 MB',
      desc: manualData.desc || '',
      fileUrl: manualData.fileUrl || '/downloads/sample_manual.pdf',
      fileName: manualData.fileName || '',
      fileData: manualData.fileData || null,
      hasAttachment: !!(manualData.fileName || manualData.fileData),
      category: manualData.category || 'คู่มือการใช้งาน',
      updatedAt: new Date().toISOString().split('T')[0]
    };
    this.manuals.unshift(newManual);
    this.saveToFile();
    return newManual;
  }

  updateManual(id, updateData) {
    const index = this.manuals.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('ไม่พบคู่มือที่ต้องการแก้ไข');
    const prev = this.manuals[index];
    this.manuals[index] = {
      ...prev,
      ...updateData,
      fileName: updateData.fileName !== undefined ? updateData.fileName : prev.fileName,
      fileData: updateData.fileData !== undefined ? updateData.fileData : prev.fileData,
      hasAttachment: !!(updateData.fileName || updateData.fileData || prev.fileName || prev.fileData),
      updatedAt: new Date().toISOString().split('T')[0]
    };
    this.saveToFile();
    return this.manuals[index];
  }

  deleteManual(id) {
    const prevLen = this.manuals.length;
    this.manuals = this.manuals.filter((m) => m.id !== id);
    if (this.manuals.length === prevLen) throw new Error('ไม่พบคู่มือที่ต้องการลบ');
    this.saveToFile();
    return true;
  }

  // --- Videos Management ---
  getVideos() {
    return [...this.videos];
  }

  createVideo(videoData) {
    const newVideo = {
      id: 'vid-' + Date.now(),
      title: videoData.title,
      role: videoData.role || 'สำหรับเจ้าหน้าที่ ทบ.',
      duration: videoData.duration || '3:00 นาที',
      videoUrl: videoData.videoUrl || 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      description: videoData.description || '',
      steps: Array.isArray(videoData.steps) ? videoData.steps : (videoData.steps || '').split('\n').filter(Boolean),
      updatedAt: new Date().toISOString().split('T')[0]
    };
    this.videos.push(newVideo);
    this.saveToFile();
    return newVideo;
  }

  updateVideo(id, updateData) {
    const index = this.videos.findIndex((v) => v.id === id);
    if (index === -1) throw new Error('ไม่พบวิดีโอที่ต้องการแก้ไข');
    const steps = Array.isArray(updateData.steps)
      ? updateData.steps
      : updateData.steps !== undefined
      ? (updateData.steps || '').split('\n').filter(Boolean)
      : this.videos[index].steps;

    this.videos[index] = {
      ...this.videos[index],
      ...updateData,
      steps,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    this.saveToFile();
    return this.videos[index];
  }

  deleteVideo(id) {
    const prevLen = this.videos.length;
    this.videos = this.videos.filter((v) => v.id !== id);
    if (this.videos.length === prevLen) throw new Error('ไม่พบวิดีโอที่ต้องการลบ');
    this.saveToFile();
    return true;
  }

  // --- Military Units Management (ระบบจัดการโครงสร้างหน่วย ทบ.) ---
  getAllUnits(query = {}) {
    let result = [...this.units];

    if (query.level) {
      const lvl = parseInt(query.level, 10);
      result = result.filter((u) => u.level === lvl);
    }

    if (query.parentId !== undefined && query.parentId !== null) {
      result = result.filter((u) => u.parentId === query.parentId);
    }

    if (query.status) {
      result = result.filter((u) => u.status === query.status);
    }

    if (query.search) {
      const q = query.search.toLowerCase().trim();
      result = result.filter(
        (u) =>
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.shortName && u.shortName.toLowerCase().includes(q)) ||
          (u.code && u.code.toLowerCase().includes(q)) ||
          (u.province && u.province.toLowerCase().includes(q))
      );
    }

    return result;
  }

  getUnitHierarchy() {
    const level1 = this.units.filter((u) => u.level === 1);
    const level2 = this.units.filter((u) => u.level === 2);
    const level3 = this.units.filter((u) => u.level === 3);

    return {
      level1,
      level2,
      level3,
      tree: level1.map((l1) => ({
        ...l1,
        children: level2
          .filter((l2) => l2.parentId === l1.id)
          .map((l2) => ({
            ...l2,
            children: level3.filter((l3) => l3.parentId === l2.id)
          }))
      }))
    };
  }

  addUnit(unitData) {
    if (!unitData.name || !unitData.level) {
      throw new Error('กรุณาระบุชื่อหน่วยและระดับโครงสร้าง');
    }

    const level = parseInt(unitData.level, 10);
    const id = unitData.id || `UNIT_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const newUnit = {
      id,
      level,
      levelName: level === 1 ? 'ระดับ ทบ.' : level === 2 ? 'ระดับ กองพล' : 'ระดับ กรม/กองพัน',
      code: unitData.code || unitData.shortName || unitData.name,
      name: unitData.name,
      shortName: unitData.shortName || unitData.code || unitData.name,
      parentId: unitData.parentId || null,
      province: unitData.province || 'ไม่ระบุ',
      locationName: unitData.locationName || '',
      lat: unitData.lat ? parseFloat(unitData.lat) : null,
      lng: unitData.lng ? parseFloat(unitData.lng) : null,
      address: unitData.address || '',
      rtaPhone: unitData.rtaPhone ? String(unitData.rtaPhone).replace(/\D/g, '').slice(0, 5) : '',
      phone: unitData.phone || '',
      type: unitData.type || 'REGULAR',
      status: unitData.status || 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    this.units.push(newUnit);
    this.saveToFile(['units']);
    return newUnit;
  }

  updateUnit(id, updateData) {
    const idx = this.units.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('ไม่พบหน่วยที่ต้องการแก้ไข');

    const updated = {
      ...this.units[idx],
      ...updateData,
      level: updateData.level ? parseInt(updateData.level, 10) : this.units[idx].level,
      rtaPhone: updateData.rtaPhone !== undefined ? String(updateData.rtaPhone).replace(/\D/g, '').slice(0, 5) : this.units[idx].rtaPhone,
      lat: updateData.lat !== undefined ? (updateData.lat ? parseFloat(updateData.lat) : null) : this.units[idx].lat,
      lng: updateData.lng !== undefined ? (updateData.lng ? parseFloat(updateData.lng) : null) : this.units[idx].lng,
      updatedAt: new Date().toISOString()
    };

    if (updated.level === 1) updated.levelName = 'ระดับ ทบ.';
    else if (updated.level === 2) updated.levelName = 'ระดับ กองพล';
    else updated.levelName = 'ระดับ กรม/กองพัน';

    this.units[idx] = updated;
    this.saveToFile(['units']);
    return updated;
  }

  deleteUnit(id) {
    const idx = this.units.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('ไม่พบหน่วยที่ต้องการลบ');

    // ตรวจสอบว่ามีหน่วยลูกสังกัดอยู่หรือไม่
    const hasChildren = this.units.some((u) => u.parentId === id);
    if (hasChildren) {
      throw new Error('ไม่สามารถลบหน่วยนี้ได้เนื่องจากมีหน่วยระดับรองสังกัดอยู่ กรุณาย้ายหรือลบหน่วยย่อยก่อน');
    }

    // ป้องกันการลบหน่วยที่ยังมีผู้ใช้งานหรือคำร้องอ้างอิงอยู่ (รักษา FK ใน PostgreSQL และสิทธิ์ RBAC)
    const hasUsers = (this.users || []).some((u) => u.unitId === id);
    if (hasUsers) {
      throw new Error('ไม่สามารถลบหน่วยนี้ได้เนื่องจากยังมีผู้ใช้งานสังกัดหน่วยนี้อยู่ กรุณาย้ายสังกัดผู้ใช้หรือเปลี่ยนสถานะหน่วยเป็นระงับการใช้งาน (INACTIVE)');
    }

    const hasClaims = (this.claims || []).some(
      (c) => c.unitId === id || c.unitLevel1Id === id || c.unitLevel2Id === id || c.unitLevel3Id === id
    );
    if (hasClaims) {
      throw new Error('ไม่สามารถลบหน่วยนี้ได้เนื่องจากยังมีรายการคำร้องสินไหมอ้างอิงถึงหน่วยนี้อยู่ กรุณาเปลี่ยนสถานะหน่วยเป็นระงับการใช้งาน (INACTIVE)');
    }

    const deleted = this.units.splice(idx, 1)[0];
    this.saveToFile(['units']);
    return deleted;
  }

  resetUnits() {
    this.units = [...INITIAL_MILITARY_UNITS];
    this.saveToFile(['units']);
    return this.units;
  }

  // ============================================================
  // ระบบจัดการความรู้และแบบทดสอบผู้ใช้งาน (Knowledge Management)
  // ============================================================

  // --- แบบทดสอบ (Exams) ---
  getKnowledgeExams() {
    this.syncIfFileChanged();
    return this.knowledgeExams.map((e) => {
      const questions = this.knowledgeQuestions.filter((q) => q.examId === e.id);
      return {
        ...e,
        totalQuestionsInPool: questions.length,
        randomizeQuestions: e.randomizeQuestions !== false,
        randomizeOptions: e.randomizeOptions !== false,
        questionSource: e.questionSource || 'combined'
      };
    });
  }

  getKnowledgeExamById(id) {
    this.syncIfFileChanged();
    const exam = this.knowledgeExams.find((e) => e.id === id);
    if (!exam) return null;
    const questions = this.knowledgeQuestions.filter((q) => q.examId === exam.id);
    return {
      ...exam,
      totalQuestionsInPool: questions.length,
      randomizeQuestions: exam.randomizeQuestions !== false,
      randomizeOptions: exam.randomizeOptions !== false,
      questionSource: exam.questionSource || 'combined'
    };
  }

  createKnowledgeExam(data) {
    const newExam = {
      id: data.id || ('exm-' + Date.now()),
      title: data.title,
      description: data.description || '',
      passingScore: Number(data.passingScore) || 80,
      timeLimitMinutes: Number(data.timeLimitMinutes) || 30,
      questionCount: Number(data.questionCount) || 10,
      randomizeQuestions: data.randomizeQuestions !== false, // สุ่มข้อสอบ
      randomizeOptions: data.randomizeOptions !== false, // สุ่มตัวเลือกคำตอบ
      questionSource: data.questionSource || 'combined', // 'exam_pool' | 'bank' | 'combined'
      category: data.category || 'ระเบียบและวิธีปฏิบัติงานสินไหม',
      isActive: data.isActive !== false,
      openAt: data.openAt || null,
      closeAt: data.closeAt || null,
      instructions: data.instructions || '',
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.knowledgeExams.push(newExam);
    this.saveToFile();
    return newExam;
  }

  updateKnowledgeExam(id, updateData) {
    const index = this.knowledgeExams.findIndex((e) => e.id === id);
    if (index === -1) throw new Error('ไม่พบแบบทดสอบที่ต้องการแก้ไข');
    const prev = this.knowledgeExams[index];
    this.knowledgeExams[index] = {
      ...prev,
      ...updateData,
      updatedAt: new Date().toISOString(),
      passingScore: updateData.passingScore !== undefined ? Number(updateData.passingScore) : prev.passingScore,
      timeLimitMinutes: updateData.timeLimitMinutes !== undefined ? Number(updateData.timeLimitMinutes) : prev.timeLimitMinutes,
      questionCount: updateData.questionCount !== undefined ? Number(updateData.questionCount) : prev.questionCount,
      randomizeQuestions: updateData.randomizeQuestions !== undefined ? Boolean(updateData.randomizeQuestions) : (prev.randomizeQuestions !== false),
      randomizeOptions: updateData.randomizeOptions !== undefined ? Boolean(updateData.randomizeOptions) : (prev.randomizeOptions !== false),
      questionSource: updateData.questionSource || prev.questionSource || 'combined',
      category: updateData.category !== undefined ? updateData.category : prev.category
    };
    this.saveToFile();
    return this.knowledgeExams[index];
  }

  deleteKnowledgeExam(id) {
    const prevLen = this.knowledgeExams.length;
    this.knowledgeExams = this.knowledgeExams.filter((e) => e.id !== id);
    if (this.knowledgeExams.length === prevLen) throw new Error('ไม่พบแบบทดสอบที่ต้องการลบ');
    this.knowledgeQuestions = this.knowledgeQuestions.filter((q) => q.examId !== id);
    this.examAttempts = this.examAttempts.filter((a) => a.examId !== id);
    this.saveToFile();
    return true;
  }

  // ดึงข้อสอบสำหรับนำไปใช้ทำแบบทดสอบ พร้อมกลไกสุ่มข้อสอบและสุ่มตัวเลือกคำตอบ
  getQuestionsForExam(examId, { random = null, shuffleOptions = null, limit = null, hideAnswers = false } = {}) {
    const exam = this.getKnowledgeExamById(examId);
    let questions = [];

    // ดึงคำถามจากชุดข้อสอบ
    const examQuestions = this.knowledgeQuestions.filter((q) => q.examId === examId);
    // คำถามจากธนาคารคำถามกลาง
    const bankQuestions = this.questionBank.map((q) => ({
      id: q.id,
      examId,
      questionText: q.questionText,
      options: q.options || [],
      points: Number(q.points) || 10,
      orderIndex: 0,
      explanation: q.explanation || ''
    }));

    const source = exam?.questionSource || 'combined';
    if (source === 'exam_pool') {
      questions = [...examQuestions];
      if (questions.length === 0) questions = [...bankQuestions];
    } else if (source === 'bank') {
      questions = [...bankQuestions];
    } else {
      // combined: รวมข้อสอบในชุดและธนาคาร โดยตัดข้อที่ซ้ำกัน
      const existingTexts = new Set(examQuestions.map((q) => (q.questionText || '').trim().toLowerCase()));
      const filteredBank = bankQuestions.filter((q) => !existingTexts.has((q.questionText || '').trim().toLowerCase()));
      questions = [...examQuestions, ...filteredBank];
    }

    const shouldRandomQuestions = random !== null ? random : (exam ? exam.randomizeQuestions !== false : true);
    const shouldShuffleOptions = shuffleOptions !== null ? shuffleOptions : (exam ? exam.randomizeOptions !== false : true);
    const targetLimit = limit || (exam ? exam.questionCount : 10);

    // 1. สุ่มเลือกและสุ่มลำดับข้อสอบ
    if (shouldRandomQuestions) {
      questions = shuffleArray(questions);
    } else {
      questions.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    }

    // จำกัดจำนวนข้อสอบตามที่กำหนด
    if (targetLimit > 0 && questions.length > targetLimit) {
      questions = questions.slice(0, targetLimit);
    }

    // 2. สุ่มลำดับตัวเลือกคำตอบในแต่ละข้อ (คง option id ไว้เพื่อตรวจคำตอบได้ถูกต้อง)
    if (shouldShuffleOptions) {
      questions = questions.map((q) => ({
        ...q,
        options: shuffleArray(q.options || [])
      }));
    }

    // 3. ซ่อนเฉลยคำตอบในกรณีที่ส่งให้นักเรียน/ผู้เข้าสอบ
    if (hideAnswers) {
      questions = questions.map((q) => ({
        ...q,
        options: (q.options || []).map((o) => ({ id: o.id, text: o.text }))
      }));
    }

    return questions;
  }


  // --- ข้อสอบ (Questions) ---
  getKnowledgeQuestions(examId) {
    return [...this.knowledgeQuestions]
      .filter((q) => q.examId === examId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  getKnowledgeQuestionById(id) {
    return this.knowledgeQuestions.find((q) => q.id === id) || null;
  }

  createKnowledgeQuestion(data) {
    const newQuestion = {
      id: data.id || ('q-' + Date.now()),
      examId: data.examId,
      questionText: data.questionText,
      options: Array.isArray(data.options) ? data.options : [],
      points: Number(data.points) || 10,
      orderIndex: Number(data.orderIndex) || 0,
      explanation: data.explanation || ''
    };
    this.knowledgeQuestions.push(newQuestion);
    this.saveToFile();
    return newQuestion;
  }

  // ---------- ธนาคารคำถามกลาง (Question Bank) ----------
  getQuestionBank() {
    return [...this.questionBank];
  }

  getQuestionBankById(id) {
    return this.questionBank.find((q) => q.id === id) || null;
  }

  getQuestionBankByExamId(examId) {
    return this.questionBank.filter((q) => q.examId === examId);
  }

  getKnowledgeExamById(id) {
    return this.knowledgeExams.find((e) => e.id === id) || null;
  }

  createQuestionBankQuestion(data) {
    const newQuestion = {
      id: data.id || ('qb-' + Date.now()),
      questionText: data.questionText,
      options: Array.isArray(data.options) ? data.options : [],
      points: Number(data.points) || 10,
      category: data.category || null,
      difficulty: data.difficulty || null,
      tags: Array.isArray(data.tags) ? data.tags : [],
      examId: data.examId || null,
      source: data.source || 'manual',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.questionBank.push(newQuestion);
    this.saveToFile();
    return newQuestion;
  }

  updateQuestionBankQuestion(id, updateData) {
    const index = this.questionBank.findIndex((q) => q.id === id);
    if (index === -1) throw new Error('ไม่พบคำถามในธนาคารที่ต้องการแก้ไข');
    const prev = this.questionBank[index];
    this.questionBank[index] = {
      ...prev,
      ...updateData,
      options: updateData.options !== undefined ? updateData.options : prev.options,
      points: updateData.points !== undefined ? Number(updateData.points) : prev.points,
      category: updateData.category !== undefined ? updateData.category : prev.category,
      difficulty: updateData.difficulty !== undefined ? updateData.difficulty : prev.difficulty,
      tags: updateData.tags !== undefined ? updateData.tags : prev.tags,
      examId: updateData.examId !== undefined ? updateData.examId : prev.examId,
      updatedAt: new Date().toISOString()
    };
    this.saveToFile();
    return this.questionBank[index];
  }

  deleteQuestionBankQuestion(id) {
    const prevLen = this.questionBank.length;
    this.questionBank = this.questionBank.filter((q) => q.id !== id);
    if (this.questionBank.length === prevLen) throw new Error('ไม่พบคำถามในธนาคารที่ต้องการลบ');
    this.saveToFile();
    return true;
  }

  importQuestionsToBank(questions) {
    const created = [];
    for (const q of questions) {
      const newQuestion = {
        id: q.id || ('qb-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6)),
        questionText: q.questionText,
        options: q.options || [],
        points: Number(q.points) || 10,
        category: q.category || null,
        difficulty: q.difficulty || null,
        tags: q.tags || [],
        examId: q.examId || null,
        source: q.source || 'excel',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.questionBank.push(newQuestion);
      created.push(newQuestion);
    }
    this.saveToFile();
    return created;
  }

  // ---------- การจัดการแบบทดสอบ (Exam) ----------
  // ตรวจสอบว่าคำถามที่อ้างอิงในแบบทดสอบมีอยู่ใน bank หรือไม่
  updateKnowledgeQuestion(id, updateData) {
    const index = this.knowledgeQuestions.findIndex((q) => q.id === id);
    if (index === -1) throw new Error('ไม่พบข้อสอบที่ต้องการแก้ไข');
    const prev = this.knowledgeQuestions[index];
    this.knowledgeQuestions[index] = {
      ...prev,
      ...updateData,
      options: updateData.options !== undefined ? updateData.options : prev.options,
      points: updateData.points !== undefined ? Number(updateData.points) : prev.points,
      orderIndex: updateData.orderIndex !== undefined ? Number(updateData.orderIndex) : prev.orderIndex,
      explanation: updateData.explanation !== undefined ? updateData.explanation : prev.explanation
    };
    this.saveToFile();
    return this.knowledgeQuestions[index];
  }

  deleteKnowledgeQuestion(id) {
    const prevLen = this.knowledgeQuestions.length;
    this.knowledgeQuestions = this.knowledgeQuestions.filter((q) => q.id !== id);
    if (this.knowledgeQuestions.length === prevLen) throw new Error('ไม่พบข้อสอบที่ต้องการลบ');
    this.saveToFile();
    return true;
  }


  // --- การทำข้อสอบ (Attempts) ---
  getAllExamAttempts(examId = null) {
    this.syncIfFileChanged();
    let list = [...this.examAttempts];
    if (examId) {
      list = list.filter((a) => a.examId === examId);
    }
    return list.sort((a, b) => new Date(b.completedAt || b.startedAt) - new Date(a.completedAt || a.startedAt));
  }

  getExamAttempts(userId) {
    this.syncIfFileChanged();
    return [...this.examAttempts]
      .filter((a) => a.userId === userId)
      .sort((a, b) => new Date(b.completedAt || b.startedAt) - new Date(a.completedAt || a.startedAt));
  }

  getExamAttemptById(id) {
    this.syncIfFileChanged();
    return this.examAttempts.find((a) => a.id === id) || null;
  }

  createExamAttempt(data) {
    this.syncIfFileChanged();
    const exam = this.getKnowledgeExamById(data.examId);
    if (!exam) throw new Error('ไม่พบแบบทดสอบที่ระบุ');
    const windowStatus = this.isExamWindowOpen(exam.id);
    if (!windowStatus.open && !data.force) {
      throw new Error(windowStatus.message || 'แบบทดสอบปิดให้บริการในขณะนี้');
    }

    // รวมข้อสอบทั้งหมดที่เป็นไปได้จากทั้งในชุดและในธนาคาร
    const allPool = [
      ...this.knowledgeQuestions,
      ...this.questionBank.map((q) => ({
        id: q.id,
        examId: exam.id,
        questionText: q.questionText,
        options: q.options || [],
        points: Number(q.points) || 10,
        explanation: q.explanation || ''
      }))
    ];

    const answers = Array.isArray(data.answers) ? data.answers : [];
    let correct = 0;

    const detail = answers.map((ans) => {
      const q = allPool.find((item) => item.id === ans.questionId);
      if (!q) {
        return {
          questionId: ans.questionId,
          questionText: 'คำถามในแบบทดสอบ',
          selectedOptionId: ans.selectedOptionId,
          selectedOptionText: '-',
          correctOptionId: null,
          correctOptionText: '-',
          isCorrect: false,
          explanation: ''
        };
      }

      const correctOption = (q.options || []).find((o) => o.isCorrect);
      const selectedOption = (q.options || []).find((o) => o.id === ans.selectedOptionId);
      const isCorrect = ans.selectedOptionId && correctOption ? ans.selectedOptionId === correctOption.id : false;

      if (isCorrect) correct++;

      return {
        questionId: q.id,
        questionText: q.questionText,
        selectedOptionId: ans.selectedOptionId,
        selectedOptionText: selectedOption ? selectedOption.text : 'ไม่ได้ตอบ',
        correctOptionId: correctOption ? correctOption.id : null,
        correctOptionText: correctOption ? correctOption.text : '-',
        isCorrect,
        explanation: q.explanation || ''
      };
    });

    const total = answers.length > 0 ? answers.length : (exam.questionCount || 10);
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    const percentage = score;
    const passingScore = exam.passingScore !== undefined ? Number(exam.passingScore) : 80;
    const passed = score >= passingScore;

    const user = this.findUserById(data.userId);
    const userName = user ? `${user.rank || ''} ${user.firstName} ${user.lastName}`.trim() : (data.userName || 'ผู้ใช้งาน');

    const attempt = {
      id: 'att-' + Date.now(),
      userId: data.userId,
      userName,
      userRole: user?.role || 'USER',
      unitName: user?.unitName || '-',
      examId: exam.id,
      examTitle: exam.title,
      score,
      percentage,
      passingScore,
      passed,
      totalQuestions: total,
      correctAnswers: correct,
      answers: detail,
      startedAt: data.startedAt || new Date().toISOString(),
      completedAt: new Date().toISOString(),
      timeSpentSeconds: data.timeSpentSeconds || 0
    };
    this.examAttempts.push(attempt);

    // เมื่อทำแบบทดสอบผ่านเกณฑ์ ปลดล็อกสิทธิ์บนบัญชีผู้ใช้ทันที
    if (passed && user) {
      user.knowledgePassed = true;
      user.knowledgePassedAt = attempt.completedAt;
      user.knowledgeScore = score;
    }

    // บันทึก Log กิจกรรม
    this.addActivityLog({
      userId: data.userId,
      userName,
      userRole: user?.role || 'USER',
      action: 'EXAM_ATTEMPT',
      actionBadge: passed ? 'emerald' : 'amber',
      actionLabel: passed ? 'สอบผ่าน' : 'สอบไม่ผ่าน',
      details: `${userName} ทำแบบทดสอบ "${exam.title}" ได้ ${score}% (${correct}/${total} ข้อ) - ${passed ? '✓ ผ่านเกณฑ์ ปลดล็อกใช้งานระบบทันที' : '✗ ไม่ผ่านเกณฑ์'}`,
      targetId: exam.id,
      targetName: exam.title
    });

    this.saveToFile();

    if (global.io) {
      global.io.emit('knowledge_updated', { userId: data.userId, passed, score });
    }

    return attempt;
  }

  // --- การตั้งค่าห้วงการทดสอบความรู้ (Exam Period Settings) ---
  getExamSettings() {
    this.syncIfFileChanged();
    if (!this.examSettings) {
      this.examSettings = { ...initialExamSettings };
    }
    return this.examSettings;
  }

  updateExamSettings(settings, adminUser = null) {
    this.syncIfFileChanged();
    const prevActive = this.examSettings?.isExamPeriodActive;
    this.examSettings = {
      ...(this.examSettings || initialExamSettings),
      ...settings,
      updatedAt: new Date().toISOString(),
      updatedBy: adminUser ? `${adminUser.rank || ''} ${adminUser.firstName || ''} ${adminUser.lastName || ''} (${adminUser.role || ''})`.trim() : 'ผู้ดูแลระบบ'
    };

    if (settings.isExamPeriodActive !== undefined && settings.isExamPeriodActive !== prevActive) {
      this.addActivityLog({
        userId: adminUser?.id || 'admin',
        userName: adminUser ? `${adminUser.rank || ''} ${adminUser.firstName || ''} ${adminUser.lastName || ''}`.trim() : 'ผู้ดูแลระบบ',
        userRole: adminUser?.role || 'ADMIN',
        action: settings.isExamPeriodActive ? 'OPEN_EXAM_PERIOD' : 'CLOSE_EXAM_PERIOD',
        actionBadge: settings.isExamPeriodActive ? 'amber' : 'emerald',
        actionLabel: settings.isExamPeriodActive ? 'เปิดห้วงการทดสอบ' : 'ปิดห้วงการทดสอบ',
        details: settings.isExamPeriodActive
          ? 'เปิดห้วงการทดสอบความรู้: ผู้ใช้งานทุกคนต้องผ่านการทำแบบทดสอบก่อนจึงจะเข้าใช้งานระบบได้'
          : 'ปิดห้วงการทดสอบความรู้: ผู้ใช้งานทุกคนสามารถเข้าใช้งานระบบได้ตามปกติทันทีโดยไม่ต้องผ่านแบบทดสอบ'
      });
    }

    this.saveToFile();
    return this.examSettings;
  }

  // --- สถานะความรู้ของผู้ใช้ (User Knowledge Status) ---
  getUserKnowledgeStatus(userId) {
    this.syncIfFileChanged();
    const user = this.findUserById(userId);
    if (!user) throw new Error('ไม่พบผู้ใช้งาน');

    const examSettings = this.getExamSettings();
    const isExamPeriodActive = examSettings?.isExamPeriodActive === true;

    // ผู้ดูแลระบบ (ADMIN) ได้รับยกเว้นไม่ต้องทำแบบทดสอบความรู้ มีสิทธิ์ใช้งานระบบได้ทุกฟังก์ชัน
    if (user.role === 'ADMIN') {
      return {
        userId,
        role: user.role,
        passed: true,
        isExempt: true,
        isExamPeriodActive,
        examMandatory: isExamPeriodActive,
        score: 100,
        percentage: 100,
        passingScore: 0,
        passedAt: user.createdAt || new Date().toISOString(),
        attemptCount: 0,
        latestAttempt: null,
        bestPassed: null,
        canUseSystem: true,
        exam: null,
        windowOpen: { open: true, message: 'สิทธิ์ผู้ดูแลระบบสูงสุด (Admin) ได้รับยกเว้นไม่ต้องทำแบบทดสอบ' },
        message: 'ท่านมีสิทธิ์ผู้ดูแลระบบสูงสุด (Admin) ได้รับยกเว้นไม่ต้องทำแบบทดสอบความรู้ สามารถเข้าใช้งานระบบได้ทุกฟังก์ชัน'
      };
    }

    const activeExams = this.knowledgeExams.filter((e) => e.isActive !== false);
    const primaryExam = this.getKnowledgeExamById('exm-claims-basic') || activeExams[0] || this.knowledgeExams[0] || null;
    const passingScore = primaryExam?.passingScore !== undefined ? Number(primaryExam.passingScore) : 80;

    // ตรวจสอบผลสอบทั้งหมดของผู้ใช้นี้ (รองรับทุกแบบทดสอบที่เปิดใช้งานอยู่)
    const userAttempts = this.examAttempts
      .filter((a) => a.userId === userId)
      .sort((a, b) => new Date(a.completedAt || a.startedAt) - new Date(b.completedAt || a.startedAt));

    const passedAttempts = userAttempts.filter((a) => {
      if (a.passed === true) return true;
      const targetExam = this.getKnowledgeExamById(a.examId);
      if (!targetExam) return false;
      const requiredScore = targetExam.passingScore !== undefined ? Number(targetExam.passingScore) : 80;
      return Number(a.score) >= requiredScore;
    });

    const latest = userAttempts.length > 0 ? userAttempts[userAttempts.length - 1] : null;
    const bestPassed = passedAttempts.length > 0
      ? passedAttempts.reduce((best, a) => (a.score > best.score ? a : best), passedAttempts[0])
      : null;

    const passed = passedAttempts.length > 0 || user.knowledgePassed === true;
    const finalScore = bestPassed ? bestPassed.score : (user.knowledgeScore ?? (latest ? latest.score : null));

    // ตรวจสอบช่วงเวลาเปิดสอบของแบบทดสอบที่เปิดอยู่
    let windowOpen = primaryExam ? this.isExamWindowOpen(primaryExam.id) : { open: false, message: 'ไม่พบแบบทดสอบ' };
    if (!windowOpen.open && activeExams.length > 0) {
      const anyOpenExam = activeExams.find((ex) => this.isExamWindowOpen(ex.id).open);
      if (anyOpenExam) {
        windowOpen = this.isExamWindowOpen(anyOpenExam.id);
      }
    }

    // กรณีไม่ได้เปิดห้วงการทดสอบความรู้ (isExamPeriodActive === false)
    // ถ้าไม่เปิดให้ต้องทำข้อสอบ -> ผู้ใช้งานสามารถใช้งานระบบได้ปกติทันที!
    if (!isExamPeriodActive) {
      return {
        userId,
        role: user.role,
        passed,
        score: finalScore,
        percentage: finalScore,
        passingScore,
        passedAt: bestPassed ? bestPassed.completedAt : (user.knowledgePassedAt || null),
        attemptCount: userAttempts.length,
        latestAttempt: latest,
        bestPassed,
        canUseSystem: true, // ใช้งานระบบได้ตามปกติ
        isExamPeriodActive: false,
        examMandatory: false,
        exam: primaryExam,
        windowOpen,
        message: 'ช่วงเวลาปกติ (ไม่ได้เปิดห้วงบังคับทำแบบทดสอบ): ผู้ใช้งานทุกคนสามารถเข้าใช้งานระบบได้ตามปกติ'
      };
    }

    // กรณีเปิดห้วงต้องผ่านแบบทดสอบ (isExamPeriodActive === true)
    // ผู้ใช้งานต้องผ่านการทำแบบทดสอบก่อนใช้งานระบบได้
    const canUseSystem = passed;

    return {
      userId,
      role: user.role,
      passed,
      score: finalScore,
      percentage: finalScore,
      passingScore,
      passedAt: bestPassed ? bestPassed.completedAt : (user.knowledgePassedAt || null),
      attemptCount: userAttempts.length,
      latestAttempt: latest,
      bestPassed,
      canUseSystem,
      isExamPeriodActive: true,
      examMandatory: true,
      exam: primaryExam,
      windowOpen,
      message: passed
        ? `ท่านผ่านการทดสอบความรู้แล้ว (ได้คะแนน ${finalScore ?? 100}%) สามารถใช้งานระบบได้เต็มรูปแบบทันที`
        : userAttempts.length === 0
          ? `อยู่ในห้วงเปิดทดสอบความรู้: กรุณาเข้าทำแบบทดสอบให้ได้คะแนนไม่น้อยกว่า ${passingScore}% ก่อนเข้าใช้งานระบบ`
          : `อยู่ในห้วงเปิดทดสอบความรู้: ท่านยังไม่ผ่านการทดสอบ (คะแนนล่าสุด ${latest ? latest.score : 0}% จากเกณฑ์ ${passingScore}%) กรุณาสอบใหม่ให้ผ่านเกณฑ์ก่อนเข้าใช้งานระบบ`
    };
  }

  isExamWindowOpen(examId) {
    const exam = this.getKnowledgeExamById(examId);
    if (!exam) return { open: false, message: 'ไม่พบแบบทดสอบที่ระบุ' };
    if (!exam.isActive) return { open: false, message: 'แบบทดสอบนี้ถูกปิดใช้งานอยู่ในขณะนี้' };
    const now = new Date();
    const openAt = exam.openAt ? new Date(exam.openAt) : null;
    const closeAt = exam.closeAt ? new Date(exam.closeAt) : null;
    if (openAt && now < openAt) return { open: false, message: `ยังไม่ถึงวันเปิดทำแบบทดสอบ (เปิด ${formatThaiDate(openAt)})` };
    if (closeAt && now > closeAt) return { open: false, message: `ปิดทำแบบทดสอบแล้ว (ปิด ${formatThaiDate(closeAt)})` };
    return { open: true, message: 'แบบทดสอบเปิดให้ทำอยู่ในขณะนี้' };
  }
}


const globalForDb = globalThis;
export const db = globalForDb.__rtaSinmaiDb || (globalForDb.__rtaSinmaiDb = new Database());
