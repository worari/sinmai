// lib/db.js
// ฐานข้อมูลและ Data Layer สำหรับระบบเสนอขอรับสิทธิเงินค่าสินไหมทดแทน ทบ.
// รองรับ Schema PostgreSQL พร้อม In-Memory State & JSON persistence เพื่อความสะดวกรวดเร็วในการรัน

import fs from 'fs';
import path from 'path';
import { REQUIRED_DOCUMENTS, FISCAL_YEAR_MONTHS, getFiscalYear, getFiscalYearDateRange, formatThaiDate } from './thai-utils.js';
import { INITIAL_MILITARY_UNITS } from './military-units.js';
import { sendTelegramNotification } from './telegram.js';
import { CLAIM_STATUS } from './constants.js';

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
    ip: '127.0.0.1',
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
    ip: '127.0.0.1',
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
    ip: '192.168.1.145',
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
    ip: '192.168.1.188',
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
    ip: '127.0.0.1',
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
    this.lastLoadedMtime = 0;
    this.loadFromFile();
  }

  syncIfFileChanged() {
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
        // Normalize status & isActive on users
        if (Array.isArray(this.users)) {
          this.users.forEach((u) => {
            if (!u.status) {
              u.status = u.isActive === false ? 'SUSPENDED' : 'APPROVED';
            }
            if (u.isActive === undefined) {
              u.isActive = u.status === 'APPROVED';
            }
          });
        }
        this.lastLoadedMtime = stat.mtimeMs;
      }
    } catch (e) {
      console.log('Using in-memory seed DB');
    }
  }

  saveToFile() {
    try {
      fs.writeFileSync(
        DB_FILE, 
        JSON.stringify({ 
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
          examSettings: this.examSettings
        }, null, 2), 
        'utf8'
      );
      try {
        this.lastLoadedMtime = fs.statSync(DB_FILE).mtimeMs;
      } catch (e) {}
    } catch (e) {
      console.error('Failed to save DB to file', e);
    }
  }
/// 添加文件锁机制防止竞态条件
  saveToFileWithLock() {
    // 使用文件锁防止 race condition
    const lockFile = DB_FILE + '.lock';
    let lockAcquired = false;
    
    try {
      const fs = require('fs');
      
      // 尝试创建锁文件 (non-blocking)
      if (fs.existsSync(lockFile)) {
        // 有进程正在写入 - 等待最多 5 秒
        const startTime = Date.now();
        while (Date.now() - startTime < 5000) {
          if (!fs.existsSync(lockFile)) break;
          new Promise(r => setTimeout(r, 100)).then(() => {});
        }
      }
      
      // 创建锁文件
      fs.writeFileSync(lockFile, '', 'utf8');
      lockAcquired = true;
      
      // 写入数据
      fs.writeFileSync(DB_FILE, JSON.stringify({ 
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
        examSettings: this.examSettings
      }, null, 2), 'utf8');
      
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

  // ติดตามสถานะสิทธิด้วย เลข ปชช. (13 หลัก) + วันเกิด
  trackClaimByCitizenIdAndBirthDate(citizenId, birthDate) {
    if (!citizenId || !birthDate) return null;
    const cleanId = citizenId.replace(/\D/g, '');
    const cleanBirth = birthDate.trim();

    const claim = this.claims.find((c) => {
      const matchId = (c.casualtyCitizenId || '').replace(/\D/g, '') === cleanId;
      // รองรับทั้งเปรียบเทียบตรงตัว หรือถ้าในระบบบันทึกเป็น YYYY-MM-DD
      const matchBirth = !c.casualtyBirthDate || c.casualtyBirthDate === cleanBirth;
      return matchId && matchBirth;
    });

    return claim || null;
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
      targetId: newUser.id,
      targetName: `${newUser.rank || ''} ${newUser.firstName} ${newUser.lastName}`.trim()
    });

    this.saveToFile();
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
    if (updateData.password) user.password = updateData.password;
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
      targetId: user.id,
      targetName: `${user.rank || ''} ${user.firstName} ${user.lastName}`.trim()
    });

    this.saveToFile();
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
      targetId: user.id,
      targetName: `${user.rank || ''} ${user.firstName} ${user.lastName}`.trim()
    });

    this.saveToFile();
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
      targetId: user.id,
      targetName: `${user.rank || ''} ${user.firstName} ${user.lastName}`.trim()
    });

    this.saveToFile();
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
      targetId: userId,
      targetName: userName
    });

    this.saveToFile();
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
      targetId: logData.targetId || null,
      targetName: logData.targetName || null,
      createdAt: new Date().toISOString()
    };

    if (!Array.isArray(this.activityLogs)) {
      this.activityLogs = [];
    }
    this.activityLogs.unshift(newLog);

    if (this.activityLogs.length > 1000) {
      this.activityLogs = this.activityLogs.slice(0, 1000);
    }

    return newLog;
  }

  getActivityLogs({ searchQuery = '', action = 'ALL', limit = 100, page = 1 } = {}) {
    let result = Array.isArray(this.activityLogs) ? [...this.activityLogs] : [];

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          (l.userName && l.userName.toLowerCase().includes(q)) ||
          (l.details && l.details.toLowerCase().includes(q)) ||
          (l.action && l.action.toLowerCase().includes(q)) ||
          (l.actionLabel && l.actionLabel.toLowerCase().includes(q)) ||
          (l.targetName && l.targetName.toLowerCase().includes(q))
      );
    }

    if (action && action !== 'ALL') {
      result = result.filter((l) => l.action === action);
    }

    const total = result.length;
    const startIndex = (page - 1) * limit;
    const paginated = result.slice(startIndex, startIndex + limit);

    return {
      logs: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  resetPassword(citizenIdOrEmail, newPassword) {
    const user = this.users.find(
      (u) => u.email.toLowerCase() === citizenIdOrEmail.toLowerCase() || u.citizenId === citizenIdOrEmail.replace(/\D/g, '')
    );
    if (!user) throw new Error('ไม่พบข้อมูลผู้ใช้งานในระบบ');
    user.password = newPassword;
    this.saveToFile();
    return true;
  }

  // --- Claims Management with Role-Based Scoping ---
  getClaims(user) {
    let result = [...this.claims];

    // Data Scoping: หากเป็นเจ้าหน้าที่หน่วย (UNIT_OFFICER) ให้เห็นเฉพาะหน่วยตัวเอง
    if (user && user.role === 'UNIT_OFFICER') {
      result = result.filter((c) => c.unitId === user.unitId);
    }

    // เรียงลำดับจากล่าสุด
    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getClaimById(id, user) {
    const claim = this.claims.find((c) => c.id === id);
    if (!claim) return null;

    // ตรวจสอบสิทธิกรณี UNIT_OFFICER
    if (user && user.role === 'UNIT_OFFICER' && claim.unitId !== user.unitId) {
      throw new Error('ท่านไม่มีสิทธิเข้าถึงข้อมูลคำร้องของหน่วยอื่น');
    }
    return claim;
  }

  createClaim(claimData, user) {
    const cleanCasualtyId = (claimData.casualtyCitizenId || '').replace(/\D/g, '');

    // ระบบตรวจสอบห้ามเลขบัตร ปชช. ซ้ำซ้อน ป้องกันการยื่นเรื่องซ้ำ
    if (cleanCasualtyId) {
      const existingClaim = this.claims.find(
        (c) => (c.casualtyCitizenId || '').replace(/\D/g, '') === cleanCasualtyId
      );
      if (existingClaim) {
        throw new Error(
          `ไม่สามารถยื่นเรื่องซ้ำได้: เลขประจำตัวประชาชนผู้สูญเสีย ${claimData.casualtyCitizenId} เคยมีการยื่นเสนอเรื่องในระบบแล้ว (เลขที่อ้างอิง: ${existingClaim.trackingCode} หน่วย: ${existingClaim.unitName})`
        );
      }
    }

    const trackingYear = (new Date().getFullYear() + 543).toString().slice(-2);
    const trackingCode = `ทบ-กพ-${trackingYear}/${String(this.claims.length + 1).padStart(3, '0')}`;

    const newClaim = {
      id: 'CLM-' + Date.now(),
      trackingCode,
      reporterId: user.id,
      reporterName: `${user.rank} ${user.firstName} ${user.lastName}`,
      unitId: user.unitId,
      unitName: user.unitName,
      status: 'SUBMITTED',
      slaTargetDays: 30,
      createdAt: new Date().toISOString(),
      ...claimData,
      casualtyCitizenId: cleanCasualtyId || claimData.casualtyCitizenId,
      timeline: [
        {
          action: 'SUBMIT_CLAIM',
          by: `${user.rank} ${user.firstName} ${user.lastName} (${user.unitName})`,
          timestamp: new Date().toISOString(),
          remark: `ยื่นเสนอเรื่องขอรับเงินสินไหม (${claimData.claimType === 'HIGH_RISK' ? 'หน้าที่สำคัญ/เสี่ยงภัย 300,000 บ.' : 'ยามปกติ 60,000 บ.'})`
        }
      ]
    };

    this.claims.unshift(newClaim);
    this.saveToFile();

    // แจ้งเตือน Telegram
    sendTelegramNotification({
      title: 'ยื่นเสนอขอรับเงินสินไหมทดแทนเรื่องใหม่',
      message: `หน่วย ${newClaim.unitName || user.unitName} ได้เสนอเรื่อง ${newClaim.casualtyRank} ${newClaim.casualtyFirstName} ${newClaim.casualtyLastName} (${newClaim.claimType === 'HIGH_RISK' ? 'เสี่ยงภัย 300,000 บ.' : 'ปกติ 60,000 บ.'})`,
      claimId: newClaim.id,
      trackingCode: newClaim.trackingCode,
      type: 'NEW_CLAIM'
    });

    if (global.io) {
      global.io.emit('claim_created', newClaim);
      global.io.emit('stats_updated', this.getStatistics());
    }

    return newClaim;
  }

  updateClaimStatus(id, newStatus, user, remark, extraData = {}) {
    const claim = this.claims.find((c) => c.id === id);
    if (!claim) throw new Error('ไม่พบคำร้องที่ระบุ');

    const prevStatus = claim.status;
    claim.status = newStatus;
    Object.assign(claim, extraData);

    const logEntry = {
      action: newStatus,
      by: `${user.rank || ''} ${user.firstName} ${user.lastName} (${user.role})`,
      timestamp: new Date().toISOString(),
      remark: remark || `เปลี่ยนสถานะเป็น ${CLAIM_STATUS[newStatus]?.label || newStatus}`
    };

    claim.timeline.push(logEntry);
    this.saveToFile();

    // แจ้งเตือน Telegram เมื่อเปลี่ยนสถานะสำคัญ
    sendTelegramNotification({
      title: `อัปเดตสถานะ: ${CLAIM_STATUS[newStatus]?.label || newStatus}`,
      message: `เรื่องเลขที่ ${claim.trackingCode} (${claim.casualtyRank} ${claim.casualtyFirstName} ${claim.casualtyLastName}) โดย ${logEntry.by}\nหมายเหตุ: ${remark || '-'}`,
      claimId: claim.id,
      trackingCode: claim.trackingCode,
      type: 'STATUS_CHANGE'
    });

    if (global.io) {
      global.io.emit('claim_updated', { id, status: newStatus, claim });
      global.io.emit('stats_updated', this.getStatistics());
    }

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

    if (global.io) {
      global.io.emit('claim_updated', { id: claimId, claim });
    }
    return claim;
  }

  uploadDelayReason(claimId, reason, fileUrl, user) {
    const claim = this.claims.find((c) => c.id === claimId);
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

    sendTelegramNotification({
      title: `รายงานผลการดำเนินงานล่าช้า (เกิน 30 วัน)`,
      message: `เรื่อง ${claim.trackingCode} โดย ${claim.unitName}\nเหตุผล: ${reason}`,
      claimId: claim.id,
      trackingCode: claim.trackingCode,
      type: 'DELAY_REPORT'
    });

    if (global.io) {
      global.io.emit('claim_updated', { id: claimId, claim });
    }
    return claim;
  }

  // --- Real-time Live & Fiscal Year Statistics Aggregator ---
  getStatistics(targetFiscalYear = null, compareFiscalYear = null) {
    // 1. หาปีงบประมาณทั้งหมดที่มีในระบบ
    const fySet = new Set();
    this.claims.forEach((c) => {
      const fy = getFiscalYear(c.reportDate || c.createdAt);
      if (fy) fySet.add(fy);
    });

    const availableFiscalYears = Array.from(fySet).sort((a, b) => b - a);
    if (availableFiscalYears.length === 0) availableFiscalYears.push(2569);

    const activeFiscalYear = Number(targetFiscalYear) || availableFiscalYears[0];
    const prevFiscalYear = Number(compareFiscalYear) || (
      availableFiscalYears.find((y) => y < activeFiscalYear) || (activeFiscalYear - 1)
    );

    // 2. คำนวณยอดรวมของปีงบประมาณที่เลือก (Active Fiscal Year)
    const activeClaims = this.claims.filter(
      (c) => getFiscalYear(c.reportDate || c.createdAt) === activeFiscalYear
    );
    const compareClaims = this.claims.filter(
      (c) => getFiscalYear(c.reportDate || c.createdAt) === prevFiscalYear
    );

    let deceasedCount = 0;
    let disabledCount = 0;
    let normalClaimCount = 0;
    let highRiskClaimCount = 0;
    let totalPaidAmount = 0;
    let pendingCount = 0;
    let overdueCount = 0;

    const causeStats = {};
    const personnelStats = {};
    const now = new Date();

    activeClaims.forEach((c) => {
      if (c.lossType === 'DECEASED') deceasedCount++;
      if (c.lossType === 'DISABLED') disabledCount++;
      if (c.claimType === 'NORMAL') normalClaimCount++;
      if (c.claimType === 'HIGH_RISK') highRiskClaimCount++;

      if (c.status === 'PAID' || c.status === 'SK_NOTIFIED') {
        totalPaidAmount += Number(c.compensationAmount || 0);
      } else {
        pendingCount++;
      }

      const created = new Date(c.createdAt);
      const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
      if (diffDays > 30 && c.status !== 'SK_NOTIFIED') {
        overdueCount++;
      }

      const cause = c.causeOfLoss ? (c.causeOfLoss.length > 25 ? c.causeOfLoss.slice(0, 25) + '...' : c.causeOfLoss) : 'อื่นๆ';
      causeStats[cause] = (causeStats[cause] || 0) + 1;

      const pType = c.personnelType || 'อื่นๆ';
      personnelStats[pType] = (personnelStats[pType] || 0) + 1;
    });

    // 3. เรียงลำดับ 12 เดือนตามรูปแบบปีงบประมาณไทย (เริ่มต้น ต.ค. สิ้นสุด ก.ย.)
    // ต.ค. (เดือน 1 ของปีงบฯ) -> พ.ย. -> ธ.ค. -> ม.ค. -> ก.พ. -> มี.ค. -> เม.ย. -> พ.ค. -> มิ.ย. -> ก.ค. -> ส.ค. -> ก.ย.
    const fiscalMonthlyStats = FISCAL_YEAR_MONTHS.map((m) => {
      const calYearBE = m.index >= 9 ? activeFiscalYear - 1 : activeFiscalYear;
      const compCalYearBE = m.index >= 9 ? prevFiscalYear - 1 : prevFiscalYear;

      const monthClaims = activeClaims.filter((c) => {
        const d = new Date(c.reportDate || c.createdAt);
        return d.getMonth() === m.index;
      });

      const compMonthClaims = compareClaims.filter((c) => {
        const d = new Date(c.reportDate || c.createdAt);
        return d.getMonth() === m.index;
      });

      const deceased = monthClaims.filter((c) => c.lossType === 'DECEASED').length;
      const disabled = monthClaims.filter((c) => c.lossType === 'DISABLED').length;
      const normal = monthClaims.filter((c) => c.claimType === 'NORMAL').length;
      const highRisk = monthClaims.filter((c) => c.claimType === 'HIGH_RISK').length;
      const paidAmount = monthClaims
        .filter((c) => c.status === 'PAID' || c.status === 'SK_NOTIFIED')
        .reduce((sum, c) => sum + Number(c.compensationAmount || 0), 0);
      const totalAmount = monthClaims.reduce((sum, c) => sum + Number(c.compensationAmount || 0), 0);

      const compDeceased = compMonthClaims.filter((c) => c.lossType === 'DECEASED').length;
      const compDisabled = compMonthClaims.filter((c) => c.lossType === 'DISABLED').length;
      const compNormal = compMonthClaims.filter((c) => c.claimType === 'NORMAL').length;
      const compHighRisk = compMonthClaims.filter((c) => c.claimType === 'HIGH_RISK').length;
      const compPaidAmount = compMonthClaims
        .filter((c) => c.status === 'PAID' || c.status === 'SK_NOTIFIED')
        .reduce((sum, c) => sum + Number(c.compensationAmount || 0), 0);
      const compTotalAmount = compMonthClaims.reduce((sum, c) => sum + Number(c.compensationAmount || 0), 0);

      const diff = monthClaims.length - compMonthClaims.length;
      const percentChange = compMonthClaims.length > 0 
        ? Math.round((diff / compMonthClaims.length) * 100) 
        : (monthClaims.length > 0 ? 100 : 0);

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
        total: monthClaims.length,
        deceased,
        disabled,
        normal,
        highRisk,
        paidAmount,
        totalAmount,
        compareTotal: compMonthClaims.length,
        compareDeceased: compDeceased,
        compareDisabled: compDisabled,
        compareNormal: compNormal,
        compareHighRisk: compHighRisk,
        comparePaidAmount: compPaidAmount,
        compareTotalAmount: compTotalAmount,
        diff,
        percentChange
      };
    });

    // 4. สถิติเปรียบเทียบรายปีงบประมาณ (Yearly Fiscal Comparison)
    const sortedYearsAsc = [...availableFiscalYears].sort((a, b) => a - b);
    const yearlyFiscalStats = sortedYearsAsc.map((fy, idx) => {
      const yearClaims = this.claims.filter(
        (c) => getFiscalYear(c.reportDate || c.createdAt) === fy
      );
      const deceased = yearClaims.filter((c) => c.lossType === 'DECEASED').length;
      const disabled = yearClaims.filter((c) => c.lossType === 'DISABLED').length;
      const normal = yearClaims.filter((c) => c.claimType === 'NORMAL').length;
      const highRisk = yearClaims.filter((c) => c.claimType === 'HIGH_RISK').length;
      const paidAmount = yearClaims
        .filter((c) => c.status === 'PAID' || c.status === 'SK_NOTIFIED')
        .reduce((sum, c) => sum + Number(c.compensationAmount || 0), 0);
      const totalAmount = yearClaims.reduce((sum, c) => sum + Number(c.compensationAmount || 0), 0);

      const prevYearClaims = idx > 0 
        ? this.claims.filter((c) => getFiscalYear(c.reportDate || c.createdAt) === sortedYearsAsc[idx - 1])
        : [];
      const growthRate = prevYearClaims.length > 0
        ? Math.round(((yearClaims.length - prevYearClaims.length) / prevYearClaims.length) * 100)
        : 0;

      return {
        fiscalYear: fy,
        fiscalYearText: `ปีงบฯ ${fy}`,
        fullFiscalYearText: `ปีงบประมาณ ${fy}`,
        dateRangeText: `1 ต.ค. ${fy - 1} - 30 ก.ย. ${fy}`,
        totalClaims: yearClaims.length,
        deceasedCount: deceased,
        disabledCount: disabled,
        normalClaimCount: normal,
        highRiskClaimCount: highRisk,
        totalPaidAmount: paidAmount,
        totalCompensationAmount: totalAmount,
        growthRate
      };
    });

    // เปรียบเทียบภาพรวม Active FY กับ Previous FY
    const activeTotal = activeClaims.length;
    const compareTotal = compareClaims.length;
    const yearGrowthRate = compareTotal > 0 
      ? Math.round(((activeTotal - compareTotal) / compareTotal) * 100) 
      : 0;

    return {
      activeFiscalYear,
      compareFiscalYear: prevFiscalYear,
      availableFiscalYears,
      activeDateRange: `1 ต.ค. ${activeFiscalYear - 1} - 30 ก.ย. ${activeFiscalYear}`,
      compareDateRange: `1 ต.ค. ${prevFiscalYear - 1} - 30 ก.ย. ${prevFiscalYear}`,
      totalClaims: activeTotal,
      deceasedCount,
      disabledCount,
      normalClaimCount,
      highRiskClaimCount,
      totalPaidAmount,
      pendingCount,
      overdueCount,
      causeStats,
      personnelStats,
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
    this.saveToFile();
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
    this.saveToFile();
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

    const deleted = this.units.splice(idx, 1)[0];
    this.saveToFile();
    return deleted;
  }

  resetUnits() {
    this.units = [...INITIAL_MILITARY_UNITS];
    this.saveToFile();
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
