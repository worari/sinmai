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
 * รายการเอกสารหลักฐานประกอบ 12 รายการ (ตามระเบียบการเสนอขอรับสิทธิเงินค่าสินไหมทดแทน ทบ.)
 */
export const REQUIRED_DOCUMENTS = [
  { 
    index: 1, 
    name: '1. หนังสือราชการของหน่วย ขอรับเงินค่าสินไหมทดแทนในการประกันชีวิต', 
    shortName: 'หนังสือราชการของหน่วย',
    mandatory: true, 
    description: 'หนังสือราชการของหน่วยต้นสังกัดเสนอเรื่องขอรับเงินค่าสินไหมทดแทนในการประกันชีวิต' 
  },
  { 
    index: 2, 
    name: '2. รายงานการสูญเสีย (กพ.3 หรือ กพ.4)', 
    shortName: 'รายงานการสูญเสีย (กพ.3 หรือ กพ.4)',
    mandatory: true, 
    description: 'แบบรายงานการสูญเสียกำลังพลในการปฏิบัติหน้าที่ (รายงาน กพ.3 กรณีป่วยเจ็บ/ทุพพลภาพ หรือ กพ.4 กรณีเสียชีวิต)' 
  },
  { 
    index: 3, 
    name: '3. รายงานหรือบันทึกการสอบสวนเกี่ยวกับสาเหตุแห่งการเสียชีวิตของหน่วย (ยกเว้นกรณีเสียชีวิตจากการป่วยเจ็บ)', 
    shortName: 'รายงานหรือบันทึกการสอบสวนของหน่วย',
    mandatory: false, 
    note: 'ยกเว้นกรณีเสียชีวิตจากการป่วยเจ็บ', 
    description: 'รายงานหรือบันทึกการสอบสวนเกี่ยวกับสาเหตุแห่งการเสียชีวิตของหน่วย (ยกเว้นกรณีเสียชีวิตจากการป่วยเจ็บ)' 
  },
  { 
    index: 4, 
    name: '4. เอกสารผู้เสียชีวิต (4.1 สำเนาใบมรณบัตร และ 4.2 สำเนาทะเบียนบ้านประทับตรา "ตาย")', 
    shortName: 'เอกสารผู้เสียชีวิต (มรณบัตร + ทะเบียนบ้านประทับตรา "ตาย")',
    mandatory: false, 
    note: 'บังคับเฉพาะกรณีผู้เสียชีวิต / กรณีพิการทุพพลภาพไม่ต้องแนบ', 
    description: 'เอกสารผู้เสียชีวิต (4.1 สำเนาใบมรณบัตร และ 4.2 สำเนาทะเบียนบ้านประทับตรา "ตาย")' 
  },
  { 
    index: 5, 
    name: '5. หนังสือแสดงเจตนาระบุผู้รับประโยชน์ หรือคำสั่งกำหนดให้เป็นผู้รับประโยชน์ หรือผลสอบสวนทายาท ป.ค.14 (กรณีผู้เสียชีวิตมิได้ระบุใบแสดงเจตนา)', 
    shortName: 'หนังสือแสดงเจตนา / คำสั่งผู้รับประโยชน์ / ผลสอบสวนทายาท ป.ค.14',
    mandatory: true, 
    description: 'หนังสือแสดงเจตนาระบุผู้รับประโยชน์ หรือคำสั่งกำหนดให้เป็นผู้รับประโยชน์ หรือผลสอบสวนทายาท ป.ค.14 (กรณีผู้เสียชีวิตมิได้ระบุใบแสดงเจตนา)' 
  },
  { 
    index: 6, 
    name: '6. เอกสารผู้รับเงินสินไหม (6.1 สำเนาบัตร ปปช. ผู้รับเงินสินไหม 6.2 สำเนาทะเบียนบ้านผู้รับเงินสินไหม และ 6.3 หนังสือแสดงความยินยอมเปิดเผยข้อมูลส่วนบุคคล)', 
    shortName: 'เอกสารผู้รับเงินสินไหม (บัตร ปปช. + ทะเบียนบ้าน + หนังสือยินยอม PDPA)',
    mandatory: true, 
    description: 'เอกสารผู้รับเงินสินไหม (6.1 สำเนาบัตร ปปช. ผู้รับเงินสินไหม 6.2 สำเนาทะเบียนบ้านผู้รับเงินสินไหม และ 6.3 หนังสือแสดงความยินยอมเปิดเผยข้อมูลส่วนบุคคล)' 
  },
  { 
    index: 7, 
    name: '7. หนังสือเรียกร้องค่าสินไหมมรณกรรม ของบริษัทประกันชีวิต (ปช.11)', 
    shortName: 'หนังสือเรียกร้องค่าสินไหมมรณกรรม (ปช.11)',
    mandatory: true, 
    description: 'หนังสือเรียกร้องค่าสินไหมมรณกรรม ของบริษัทประกันชีวิต (ปช.11)' 
  },
  { 
    index: 8, 
    name: '8. หลักฐานพิสูจน์ระดับสารเสพติดและแอลกอฮอล์ในเลือด (กรณีอุบัติเหตุและเป็นผู้ขับขี่)', 
    shortName: 'หลักฐานตรวจสารเสพติดและแอลกอฮอล์ในเลือด',
    mandatory: false, 
    note: 'กรณีเกิดอุบัติเหตุและกำลังพลเป็นผู้ขับขี่', 
    description: 'หลักฐานพิสูจน์ระดับสารเสพติดและแอลกอฮอล์ในเลือด (กรณีอุบัติเหตุและเป็นผู้ขับขี่)' 
  },
  { 
    index: 9, 
    name: '9. เอกสารสอบสวนหรือบันทึกประจำวัน ตร. (กรณีเสียชีวิตจากอุบัติเหตุหรือผิดธรรมชาติ ซึ่งการตายไม่แน่ชัด)', 
    shortName: 'เอกสารสอบสวนหรือบันทึกประจำวัน ตร.',
    mandatory: false, 
    note: 'กรณีเสียชีวิตจากอุบัติเหตุหรือผิดธรรมชาติ ซึ่งการตายไม่แน่ชัด', 
    description: 'เอกสารสอบสวนหรือบันทึกประจำวัน ตร. (กรณีเสียชีวิตจากอุบัติเหตุหรือผิดธรรมชาติ ซึ่งการตายไม่แน่ชัด)' 
  },
  { 
    index: 10, 
    name: '10. รูปถ่ายขนาด 4x6 นิ้ว (กรณีรับเงินเกิน 100,000 บาท)', 
    shortName: 'รูปถ่ายขนาด 4x6 นิ้ว (กรณีรับเงินเกิน 100,000 บาท)',
    mandatory: false, 
    note: 'กรณีรับเงินเกิน 100,000 บาท (เช่น ปฏิบัติหน้าที่สำคัญ 300,000 บาท)', 
    description: 'รูปถ่ายขนาด 4x6 นิ้ว (กรณีรับเงินเกิน 100,000 บาท)' 
  },
  { 
    index: 11, 
    name: '11. สำเนาสมุดบัญชีเงินฝาก (ไม่ระบุธนาคาร) ของทายาท โดยใส่ข้อมูลเพิ่มเติม ได้แก่ ที่อยู่ปัจจุบัน เบอร์โทรติดต่อและอีเมล์', 
    shortName: 'สำเนาสมุดบัญชีเงินฝากทายาท (พร้อมที่อยู่ เบอร์โทร อีเมล์)',
    mandatory: true, 
    description: 'สำเนาสมุดบัญชีเงินฝาก (ไม่ระบุธนาคาร) ของทายาท โดยใส่ข้อมูลเพิ่มเติม ได้แก่ ที่อยู่ปัจจุบัน เบอร์โทรติดต่อและอีเมล์' 
  },
  { 
    index: 12, 
    name: '12. รายงานสาเหตุความล่าช้า (กรณีที่เสนอเรื่องถึง กพ.ทบ. เกินกว่า 30 วันหลังจากกำลังพลเสียชีวิต)', 
    shortName: 'รายงานสาเหตุความล่าช้า (กรณีเกินกว่า 30 วัน)',
    mandatory: false, 
    note: 'กรณีที่เสนอเรื่องถึง กพ.ทบ. เกินกว่า 30 วันหลังจากกำลังพลเสียชีวิต', 
    description: 'รายงานสาเหตุความล่าช้า (กรณีที่เสนอเรื่องถึง กพ.ทบ. เกินกว่า 30 วันหลังจากกำลังพลเสียชีวิต)' 
  }
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

/**
 * ตรวจสอบความถูกต้องของเบอร์โทรศัพท์ติดต่อ (ต้องเป็นตัวเลข 10 หลัก ขึ้นต้นด้วย 0 เช่น 08x, 09x, 06x)
 */
export function validatePhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const clean = phone.replace(/\D/g, '');
  return /^0\d{9}$/.test(clean);
}

/**
 * แปลงรูปแบบเบอร์โทรศัพท์ 10 หลักเป็น 08x-xxx-xxxx
 */
export function formatPhoneNumber(phone) {
  if (!phone) return '';
  const clean = String(phone).replace(/\D/g, '').slice(0, 10);
  if (clean.length <= 3) return clean;
  if (clean.length <= 6) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6, 10)}`;
}

/**
 * ตรวจสอบความถูกต้องของอีเมล (ต้องมี @, โดเมนที่ถูกต้อง, และไม่มีช่องว่าง)
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length < 5 || trimmed.length > 120) return false;
  // ต้องมีเครื่องหมาย @ และรูปแบบมาตรฐาน
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(trimmed);
}

/**
 * ตรวจสอบความถูกต้องของชื่อ-นามสกุล (ต้องมีอย่างน้อย 2 ตัวอักษร ไม่มีตัวเลขหรืออักขระพิเศษแปลกปลอม)
 */
export function validateName(name) {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 80) return false;
  // อนุญาตเฉพาะตัวอักษรไทย อังกฤษ ช่องว่าง จุด ขีด
  return /^[\u0E00-\u0E7Fa-zA-Z\s.'-]+$/.test(trimmed);
}

/**
 * ตรวจสอบว่าวันที่ไม่เกินวันปัจจุบัน (ไม่อยู่ในอนาคต)
 */
export function validateDateNotFuture(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return false;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return target <= today;
}

/**
 * รายชื่อธนาคารในประเทศไทยทุกธนาคาร (Commercial Banks, SFIs, Retail Banks)
 */
export const THAI_BANKS = [
  'ธนาคารทหารไทยธนชาต (ttb)',
  'ธนาคารกรุงไทย (KTB)',
  'ธนาคารกสิกรไทย (KBANK)',
  'ธนาคารไทยพาณิชย์ (SCB)',
  'ธนาคารกรุงเทพ (BBL)',
  'ธนาคารกรุงศรีอยุธยา (BAY)',
  'ธนาคารออมสิน (GSB)',
  'ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (ธ.ก.ส.)',
  'ธนาคารอาคารสงเคราะห์ (ธอส.)',
  'ธนาคารเกียรตินาคินภัทร (KKP)',
  'ธนาคารซีไอเอ็มบี ไทย (CIMBT)',
  'ธนาคารทิสโก้ (TISCO)',
  'ธนาคารยูโอบี (UOB)',
  'ธนาคารแลนด์ แอนด์ เฮ้าส์ (LH Bank)',
  'ธนาคารไทยเครดิต (Thai Credit)',
  'ธนาคารอิสลามแห่งประเทศไทย (iBank)',
  'ธนาคารพัฒนาวิสาหกิจขนาดกลางและขนาดย่อมแห่งประเทศไทย (SME D Bank)',
  'ธนาคารเพื่อการส่งออกและนำเข้าแห่งประเทศไทย (EXIM Bank)',
  'ธนาคารไอซีบีซี (ไทย) (ICBC Thai)',
  'ธนาคารแห่งประเทศจีน (ไทย) (BOC)',
  'ธนาคารสแตนดาร์ดชาร์เตอร์ด (ไทย) (SCBT)',
  'ธนาคารซิตี้แบงก์ (Citibank)',
  'ธนาคารฮ่องกงและเซี่ยงไฮ้แบงกิ้งคอร์ปอเรชั่น (HSBC)',
  'ธนาคารซูมิโตโม มิตซุย แบงกิ้ง คอร์ปอเรชั่น (SMBC)',
  'ธนาคารมิซูโฮ (Mizuho)',
  'ธนาคารบีเอ็นพี พาริบาส์ (BNP Paribas)',
  'ธนาคารดอยซ์แบงก์ (Deutsche Bank)',
  'ธนาคารแห่งโตเกียว-มิตซูบิชิ ยูเอฟเจ (MUFG)',
  'ธนาคารเจพีมอร์แกน เชส (JPMorgan Chase)',
  'ธนาคารแห่งอเมริกา (Bank of America)'
];

/**
 * ตรวจสอบความถูกต้องของเลขที่บัญชีธนาคาร (ตัวเลขเท่านั้น สูงสุดไม่เกิน 15 หลัก)
 */
export function validateBankAccount(account) {
  if (!account) return true;
  const clean = String(account).replace(/\D/g, '');
  return clean.length >= 8 && clean.length <= 15;
}




