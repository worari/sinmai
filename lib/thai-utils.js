// lib/thai-utils.js
// ระบบตัวช่วยภาษาไทย ปฏิทิน พ.ศ. การตรวจสอบเลขบัตรประชาชน และข้อมูลเฉพาะกองทัพ

export const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

/**
 * แปลงวันที่ Date หรือ String YYYY-MM-DD เป็น วัน เดือน พ.ศ.
 */
export function formatThaiDate(dateInput, isShort = false) {
  if (!dateInput) return '-';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '-';
  const day = d.getDate();
  const month = isShort ? THAI_MONTHS_SHORT[d.getMonth()] : THAI_MONTHS[d.getMonth()];
  const yearBE = d.getFullYear() + 543;
  return `${day} ${month} ${yearBE}`;
}

/**
 * ตรวจสอบความถูกต้องของเลขประจำตัวประชาชนไทย 13 หลัก ด้วย Mod 11 Algorithm
 */
export function validateCitizenId(id) {
  if (!id || typeof id !== 'string') return false;
  const cleanId = id.replace(/\D/g, '');
  if (cleanId.length !== 13) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(cleanId.charAt(i), 10);
    if (isNaN(digit)) return false;
    sum += digit * (13 - i);
  }
  const checkDigit = (11 - (sum % 11)) % 10;
  return checkDigit === parseInt(cleanId.charAt(12), 10);
}

/**
 * รูปแบบแสดงเลขบัตรประชาชน x-xxxx-xxxxx-xx-x
 */
export function formatCitizenId(id) {
  if (!id) return '';
  const clean = id.replace(/\D/g, '').slice(0, 13);
  if (clean.length !== 13) return clean;
  return `${clean.substring(0, 1)}-${clean.substring(1, 5)}-${clean.substring(5, 10)}-${clean.substring(10, 12)}-${clean.substring(12, 13)}`;
}

/**
 * รายการยศทหารและคำนำหน้านามสำหรับ Auto-complete
 */
export const MILITARY_RANKS = [
  // คำนำหน้านามพลเรือน / ลูกจ้าง / พนักงานราชการ
  'นาย', 'นาง', 'น.ส.',
  // นายทหารชั้นนายพล (ชาย & หญิง)
  'พล.อ.', 'พล.อ.หญิง', 'พล.ท.', 'พล.ท.หญิง', 'พล.ต.', 'พล.ต.หญิง',
  // นายทหารสัญญาบัตร (ชาย & หญิง)
  'พ.อ.', 'พ.อ.หญิง', 'พ.อ.(พิเศษ)', 'พ.อ.(พิเศษ)หญิง',
  'พ.ท.', 'พ.ท.หญิง', 'พ.ต.', 'พ.ต.หญิง',
  'ร.อ.', 'ร.อ.หญิง', 'ร.ท.', 'ร.ท.หญิง', 'ร.ต.', 'ร.ต.หญิง',
  // นายทหารประทวน (ชาย & หญิง)
  'จ.ส.อ.', 'จ.ส.อ.หญิง', 'จ.ส.อ.(พิเศษ)', 'จ.ส.อ.(พิเศษ)หญิง',
  'จ.ส.ท.', 'จ.ส.ท.หญิง', 'จ.ส.ต.', 'จ.ส.ต.หญิง',
  'ส.อ.', 'ส.อ.หญิง', 'ส.ท.', 'ส.ท.หญิง', 'ส.ต.', 'ส.ต.หญิง',
  // กำลังพลอื่นๆ
  'พลทหาร', 'อส.ทพ.', 'อส.ทพ.หญิง', 'พลอาสา', 'ทหารอาสา',
  'นร.นายร้อย', 'นร.นายสิบ', 'พนักงานราชการ', 'ลูกจ้างประจำ', 'ลูกจ้างชั่วคราว', 'พลเรือน กห.'
];

/**
 * ประเภทกำลังพล
 */
export const PERSONNEL_TYPES = [
  'นายทหารสัญญาบัตร',
  'นายทหารประทวน',
  'ลูกจ้างประจำ',
  'พลอาสา',
  'อส.ทพ. (อาสาสมัครทหารพราน)',
  'ลูกจ้างชั่วคราว',
  'พนักงานราชการ',
  'พลทหาร',
  'นักเรียนทหาร',
  'พลเรือน กห.'
];

/**
 * ประเภทกำลังพลมาตรฐานสำหรับตารางรายงานสถิติ
 */
export const REPORT_PERSONNEL_CATEGORIES = [
  'นายทหารสัญญาบัตร',
  'นายทหารประทวน',
  'ลูกจ้างประจำ',
  'พลอาสา',
  'อส.ทพ. (อาสาสมัครทหารพราน)',
  'ลูกจ้างชั่วคราว',
  'พนักงานราชการ',
  'พลทหาร',
  'นักเรียนทหาร',
  'พลเรือน กห.'
];

/**
 * จัดกลุ่มประเภทกำลังพลให้ตรงตามหมวดหมู่มาตรฐานรายงาน (รองรับข้อมูลเดิมในระบบ)
 */
export function normalizePersonnelCategory(rawType) {
  const val = (rawType || '').trim();
  if (!val) return 'อื่นๆ';
  if (val.includes('สัญญาบัตร')) return 'นายทหารสัญญาบัตร';
  if (val.includes('ประทวน')) return 'นายทหารประทวน';
  if (val.includes('ลูกจ้างชั่วคราว') || val.includes('ชั่วคราว')) return 'ลูกจ้างชั่วคราว';
  if (val.includes('ลูกจ้าง')) return 'ลูกจ้างประจำ';
  if (val.includes('พลอาสา') || val.includes('ทหารอาสา')) return 'พลอาสา';
  if (val.includes('อส.ทพ') || val.includes('ทหารพราน')) return 'อส.ทพ. (อาสาสมัครทหารพราน)';
  if (val.includes('พนักงานราชการ') || val.includes('พนก.')) return 'พนักงานราชการ';
  if (val.includes('พลทหาร')) return 'พลทหาร';
  if (val.includes('นักเรียน')) return 'นักเรียนทหาร';
  if (val.includes('พลเรือน')) return 'พลเรือน กห.';
  return val;
}

/**
 * ฟังก์ชันเทียบยศทหารเพื่อกำหนดประเภทกำลังพลอัตโนมัติ
 * เช่น ร.ต. -> นายทหารสัญญาบัตร, ส.ต. -> นายทหารประทวน
 */
export function getPersonnelTypeFromRank(rank) {
  if (!rank || typeof rank !== 'string') return 'นายทหารประทวน';
  const cleanRank = rank.trim();
  
  // คำนำหน้านามพลเรือน
  if (['นาย', 'นาง', 'น.ส.', 'นางสาว'].includes(cleanRank)) {
    return 'พลเรือน กห.';
  }
  
  // นายทหารสัญญาบัตร (พล.อ., พล.ท., พล.ต., พ.อ., พ.ท., พ.ต., ร.อ., ร.ท., ร.ต. ทั้งชายและหญิง)
  const commissionedPrefixes = ['พล.อ', 'พล.ท', 'พล.ต', 'พ.อ', 'พ.ท', 'พ.ต', 'ร.อ', 'ร.ท', 'ร.ต'];
  if (commissionedPrefixes.some(p => cleanRank.startsWith(p))) {
    return 'นายทหารสัญญาบัตร';
  }
  
  // นายทหารประทวน (จ.ส.อ., จ.ส.ท., จ.ส.ต., ส.อ., ส.ท., ส.ต. ทั้งชายและหญิง)
  const nonCommissionedPrefixes = ['จ.ส.อ', 'จ.ส.ท', 'จ.ส.ต', 'ส.อ', 'ส.ท', 'ส.ต'];
  if (nonCommissionedPrefixes.some(p => cleanRank.startsWith(p))) {
    return 'นายทหารประทวน';
  }
  
  // พลทหาร
  if (cleanRank.includes('พลทหาร') || cleanRank === 'พลฯ') {
    return 'พลทหาร';
  }
  
  // อส.ทพ.
  if (cleanRank.includes('อส.ทพ')) {
    return 'อส.ทพ. (อาสาสมัครทหารพราน)';
  }
  
  // พลอาสา / ทหารอาสา
  if (cleanRank.includes('พลอาสา') || cleanRank.includes('ทหารอาสา')) {
    return 'พลอาสา';
  }
  
  // นักเรียนทหาร
  if (cleanRank.includes('นร.') || cleanRank.includes('นักเรียน')) {
    return 'นักเรียนทหาร';
  }
  
  // พนักงานราชการ
  if (cleanRank.includes('พนักงานราชการ') || cleanRank.includes('พนก.')) {
    return 'พนักงานราชการ';
  }

  // ลูกจ้างชั่วคราว
  if (cleanRank.includes('ลูกจ้างชั่วคราว') || cleanRank.includes('ชั่วคราว')) {
    return 'ลูกจ้างชั่วคราว';
  }
  
  // ลูกจ้างประจำ / ลูกจ้างทั่วไป
  if (cleanRank.includes('ลูกจ้าง')) {
    return 'ลูกจ้างประจำ';
  }
  
  // พลเรือน
  if (cleanRank.includes('พลเรือน')) {
    return 'พลเรือน กห.';
  }
  
  return 'นายทหารประทวน';
}

/**
 * ฟังก์ชันเทียบยศ/คำนำหน้าเพื่อกำหนดเพศอัตโนมัติ (ชาย / หญิง)
 */
export function getGenderFromRank(rank) {
  if (!rank || typeof rank !== 'string') return null;
  const cleanRank = rank.trim();
  if (cleanRank.includes('หญิง') || cleanRank === 'นาง' || cleanRank === 'น.ส.' || cleanRank.startsWith('นางสาว')) {
    return 'หญิง';
  }
  if (cleanRank === 'นาย' || cleanRank.startsWith('พลทหาร')) {
    return 'ชาย';
  }
  return null;
}

/**
 * ลักษณะการเกิดเหตุ (กรณี ป่วย / อุบัติเหตุ / การรบ)
 */
export const INCIDENT_TYPES = [
  { id: 'ILLNESS', label: 'ป่วย (โรคประจำตัว / เจ็บป่วยระหว่างปฏิบัติหน้าที่ / หัวใจวาย)' },
  { id: 'ACCIDENT', label: 'อุบัติเหตุ (อุบัติเหตุจราจร / ยานพาหนะ / การฝึก / อาวุธ)' },
  { id: 'COMBAT', label: 'การปฏิบัติการรบ / ปะทะ / ลอบโจมตี / เสี่ยงภัยความมั่นคง' },
  { id: 'OTHER', label: 'อื่นๆ' }
];

/**
 * สถานะการขับขี่ (กรณีอุบัติเหตุ)
 */
export const DRIVER_STATUSES = [
  { id: 'YES', label: 'เป็นผู้ขับขี่' },
  { id: 'NO', label: 'ไม่ใช่ผู้ขับขี่ (ผู้โดยสาร / เดินเท้า / ผู้ประสบเหตุ)' }
];

/**
 * ผลการตรวจวัดระดับแอลกอฮอล์ในเลือด
 */
export const ALCOHOL_TEST_RESULTS = [
  { id: 'NOT_EXCEEDED', label: 'ไม่เกินที่กฎหมายกำหนด (ไม่พบหรือ ≤ 50 mg%)' },
  { id: 'EXCEEDED', label: 'เกินที่กฎหมายกำหนด (> 50 mg%)' },
  { id: 'PENDING', label: 'อยู่ระหว่างรอผลตรวจจากนิติเวช / รพ.' },
  { id: 'NOT_TESTED', label: 'ไม่ได้ตรวจ / ไม่สามารถตรวจได้' }
];

export { 
  ARMY_LEVELS, 
  INITIAL_MILITARY_UNITS, 
  getLevel1Units, 
  getLevel2Units, 
  getLevel3Units, 
  findUnitById, 
  getUnitBreadcrumb 
} from './military-units.js';

import { INITIAL_MILITARY_UNITS } from './military-units.js';

/**
 * โครงสร้างหน่วยงานกองทัพบก (Hierarchical Unit Structure)
 */
export const MILITARY_UNITS = INITIAL_MILITARY_UNITS;

/**
 * รายการเอกสารหลักฐานประกอบ 10 รายการ
 */
export const REQUIRED_DOCUMENTS = [
  { index: 1, name: 'รายงาน กพ.4 (แบบรายงานการสูญเสียกำลังพล)', mandatory: true, description: 'หนังสือรายงานการสูญเสียกำลังพลจากผู้บังคับบัญชาต้นสังกัด' },
  { index: 2, name: 'ใบมรณบัตร', mandatory: false, note: 'บังคับเฉพาะกรณีผู้เสียชีวิต / กรณีพิการทุพพลภาพไม่ต้องแนบ', description: 'สำเนาใบมรณบัตรออกโดยนายทะเบียนท้องถิ่น (กรณีพิการทุพพลภาพได้รับการยกเว้นไม่ต้องแนบ)' },
  { index: 3, name: 'รายงานการสอบสวนข้อเท็จจริงของหน่วย', mandatory: true, description: 'บันทึกคณะกรรมการสอบสวนข้อเท็จจริงเกี่ยวกับการปฏิบัติหน้าที่ราชการ' },
  { index: 4, name: 'หนังสือแสดงเจตนาทายาทรับเงินสินไหมทดแทน', mandatory: true, description: 'หนังสือมอบอำนาจหรือยินยอมของทายาทผู้มีสิทธิตามกฎหมาย' },
  { index: 5, name: 'สำเนาบัตร ปชช. และทะเบียนบ้านผู้รับเงิน', mandatory: true, description: 'หลักฐานประจำตัวทายาทผู้รับมอบอำนาจรับเงินค่าสินไหม' },
  { index: 6, name: 'ใบรับรองแพทย์', mandatory: true, description: 'ใบรับรองแพทย์ระบุสาเหตุการเสียชีวิต หรือระบุการสูญเสียสมรรถภาพ/ทุพพลภาพ' },
  { index: 7, name: 'คำสั่งปลดพ้นหรือปลดออกจากราชการ', mandatory: false, note: 'บังคับเฉพาะกรณีทุพพลภาพ / กรณีผู้เสียชีวิตไม่ต้องแนบ', description: 'สำเนาคำสั่งปลดเนื่องจากพิการทุพพลภาพจากการปฏิบัติหน้าที่' },
  { index: 8, name: 'หลักฐานพิสูจน์ระดับสารเสพติดหรือแอลกอฮอล์ในเลือด', mandatory: true, description: 'ผลตรวจทางนิติเวชศาสตร์/โรงพยาบาล' },
  { index: 9, name: 'ผลการสอบสวนของเจ้าหน้าที่ตำรวจ (กรณีตายผิดธรรมชาติ)', mandatory: false, note: 'กรณีตายผิดธรรมชาติหรืออุบัติเหตุทางถนน', description: 'สำเนาบันทึกประจำวันหรือสำนวนการสอบสวนของสถานีตำรวจ' },
  { index: 10, name: 'รูปถ่ายขนาด 4x6 นิ้ว', mandatory: false, note: 'บังคับเฉพาะกรณีปฏิบัติหน้าที่สำคัญ (รับเงิน 300,000 บาท) / กรณีรับเงิน 60,000 บาท ไม่ต้องแนบ', description: 'รูปถ่ายเครื่องแบบหรือสภาพความพิการตามหลักเกณฑ์ (จำเป็นสำหรับกรณีหน้าที่สำคัญ รับเงิน 300,000 บาท)' }
];

/**
 * คำนวณสถานะ SLA และจำนวนวันที่เหลือ/เกิน
 */
export function calculateSlaStatus(createdAtDate, slaDays = 30) {
  const start = new Date(createdAtDate);
  const now = new Date();
  // ใช้ UTC เพื่อความสอดคล้องกันทุกเขตเวลา
  const diffTime = now.getTime() - start.getTime();
  const daysElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const daysRemaining = slaDays - daysElapsed;

  let status = 'NORMAL'; // เขียว
  let label = `เหลือเวลา ${daysRemaining} วัน`;
  let color = '#10b981';

  if (daysRemaining <= 0) {
    status = 'OVERDUE'; // แดง
    label = `เกินกำหนด ${Math.abs(daysRemaining)} วัน (ต้องชี้แจงเหตุผลความล่าช้า)`;
    color = '#ef4444';
  } else if (daysRemaining <= 7) {
    status = 'WARNING'; // ส้ม
    label = `ใกล้ครบกำหนด (เหลือ ${daysRemaining} วัน)`;
    color = '#f59e0b';
  }

  return {
    daysElapsed,
    daysRemaining,
    totalSlaDays: slaDays,
    status,
    label,
    color
  };
}

/**
 * ลำดับเดือน 12 เดือนตามปีงบประมาณไทย (เริ่มต้น 1 ต.ค. สิ้นสุด 30 ก.ย.)
 */
export const FISCAL_YEAR_MONTHS = [
  { index: 9, key: '10', shortName: 'ต.ค.', fullName: 'ตุลาคม', fiscalOrder: 1 },
  { index: 10, key: '11', shortName: 'พ.ย.', fullName: 'พฤศจิกายน', fiscalOrder: 2 },
  { index: 11, key: '12', shortName: 'ธ.ค.', fullName: 'ธันวาคม', fiscalOrder: 3 },
  { index: 0, key: '01', shortName: 'ม.ค.', fullName: 'มกราคม', fiscalOrder: 4 },
  { index: 1, key: '02', shortName: 'ก.พ.', fullName: 'กุมภาพันธ์', fiscalOrder: 5 },
  { index: 2, key: '03', shortName: 'มี.ค.', fullName: 'มีนาคม', fiscalOrder: 6 },
  { index: 3, key: '04', shortName: 'เม.ย.', fullName: 'เมษายน', fiscalOrder: 7 },
  { index: 4, key: '05', shortName: 'พ.ค.', fullName: 'พฤษภาคม', fiscalOrder: 8 },
  { index: 5, key: '06', shortName: 'มิ.ย.', fullName: 'มิถุนายน', fiscalOrder: 9 },
  { index: 6, key: '07', shortName: 'ก.ค.', fullName: 'กรกฎาคม', fiscalOrder: 10 },
  { index: 7, key: '08', shortName: 'ส.ค.', fullName: 'สิงหาคม', fiscalOrder: 11 },
  { index: 8, key: '09', shortName: 'ก.ย.', fullName: 'กันยายน', fiscalOrder: 12 }
];

/**
 * คำนวณปีงบประมาณ พ.ศ. (Fiscal Year BE) จากวันที่
 * โดยปีงบประมาณไทยเริ่ม 1 ต.ค. (เดือน 10) ถึง 30 ก.ย. ของปีถัดไป
 * ตัวอย่าง: 15 ต.ค. 2568 -> ปีงบประมาณ 2569
 *         15 ก.พ. 2569 -> ปีงบประมาณ 2569
 *         15 ต.ค. 2569 -> ปีงบประมาณ 2570
 */
export function getFiscalYear(dateInput) {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  const month = d.getMonth(); // 0 = Jan, 9 = Oct
  const yearCE = d.getFullYear();
  const fiscalYearCE = month >= 9 ? yearCE + 1 : yearCE;
  return fiscalYearCE + 543;
}

/**
 * คืนค่าช่วงวันที่ของปีงบประมาณ (1 ต.ค. ปีเริ่มต้น - 30 ก.ย. ปีสิ้นสุด)
 */
export function getFiscalYearDateRange(fiscalYearBE) {
  const fyCE = fiscalYearBE - 543;
  const startDate = new Date(Date.UTC(fyCE - 1, 9, 1, 0, 0, 0));
  const endDate = new Date(Date.UTC(fyCE, 8, 30, 23, 59, 59, 999));
  return {
    startDate,
    endDate,
    label: `1 ต.ค. ${fiscalYearBE - 1} - 30 ก.ย. ${fiscalYearBE}`,
    fiscalYearBE
  };
}

/**
 * ลำดับเดือน 12 เดือนตามรอบปีกรมธรรม์ประกันภัย ทบ. (1 เม.ย. ปีก่อน ถึง 31 มี.ค. ปีถัดไป)
 */
export const POLICY_YEAR_MONTHS = [
  { index: 3, key: '04', shortName: 'เม.ย.', fullName: 'เมษายน', fiscalOrder: 1, isPrevYear: true },
  { index: 4, key: '05', shortName: 'พ.ค.', fullName: 'พฤษภาคม', fiscalOrder: 2, isPrevYear: true },
  { index: 5, key: '06', shortName: 'มิ.ย.', fullName: 'มิถุนายน', fiscalOrder: 3, isPrevYear: true },
  { index: 6, key: '07', shortName: 'ก.ค.', fullName: 'กรกฎาคม', fiscalOrder: 4, isPrevYear: true },
  { index: 7, key: '08', shortName: 'ส.ค.', fullName: 'สิงหาคม', fiscalOrder: 5, isPrevYear: true },
  { index: 8, key: '09', shortName: 'ก.ย.', fullName: 'กันยายน', fiscalOrder: 6, isPrevYear: true },
  { index: 9, key: '10', shortName: 'ต.ค.', fullName: 'ตุลาคม', fiscalOrder: 7, isPrevYear: true },
  { index: 10, key: '11', shortName: 'พ.ย.', fullName: 'พฤศจิกายน', fiscalOrder: 8, isPrevYear: true },
  { index: 11, key: '12', shortName: 'ธ.ค.', fullName: 'ธันวาคม', fiscalOrder: 9, isPrevYear: true },
  { index: 0, key: '01', shortName: 'ม.ค.', fullName: 'มกราคม', fiscalOrder: 10, isPrevYear: false },
  { index: 1, key: '02', shortName: 'ก.พ.', fullName: 'กุมภาพันธ์', fiscalOrder: 11, isPrevYear: false },
  { index: 2, key: '03', shortName: 'มี.ค.', fullName: 'มีนาคม', fiscalOrder: 12, isPrevYear: false }
];

/**
 * คำนวณรอบปี พ.ศ. (1 เม.ย. ปีก่อน ถึง 31 มี.ค. ปีถัดไป) จากวันที่
 * โดยคืนค่าเป็นปี พ.ศ. สิ้นสุดรอบ
 * ตัวอย่าง: 1 เม.ย. 2568 ถึง 31 มี.ค. 2569 -> คืนค่า 2569
 *         20 เม.ย. 2569 ถึง 31 มี.ค. 2570 -> คืนค่า 2570
 */
export function getPolicyYear(dateInput) {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  const month = d.getMonth(); // 0 = Jan, 3 = Apr
  const yearCE = d.getFullYear();
  const policyYearCE = month >= 3 ? yearCE + 1 : yearCE;
  return policyYearCE + 543;
}

/**
 * คืนค่าช่วงวันที่ของรอบปีกรมธรรม์ (1 เม.ย. ปีก่อน - 31 มี.ค. ปีถัดไป)
 */
export function getPolicyYearDateRange(policyYearBE) {
  const pyCE = policyYearBE - 543;
  const startDate = new Date(Date.UTC(pyCE - 1, 3, 1, 0, 0, 0));
  const endDate = new Date(Date.UTC(pyCE, 2, 31, 23, 59, 59, 999));
  return {
    startDate,
    endDate,
    label: `1 เม.ย. ${policyYearBE - 1} - 31 มี.ค. ${policyYearBE}`,
    policyYearBE
  };
}

export { 
  validateAttachmentFile, 
  MAX_FILE_SIZE_BYTES, 
  MAX_FILE_SIZE_MB, 
  DANGEROUS_EXTENSIONS, 
  ALLOWED_EXTENSIONS 
} from './file-validation.js';


