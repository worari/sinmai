// lib/excel.js
// Utility สำหรับอ่านไฟล์ Excel (.xlsx) และแปลงแถวข้อมูลเป็นข้อมูลคำถามแบบทดสอบ
// ใช้งานร่วมกับ library xlsx (https://cdn.sheetjs.com/)
import * as XLSX from 'xlsx';
import { getRtaSection, RTA_ORGANIZATION_SECTIONS, RTA_LEVEL_OPTIONS } from './military-units.js';
import { 
  formatThaiDate, 
  formatCitizenId, 
  validateCitizenId, 
  getPersonnelTypeFromRank, 
  getPolicyYear, 
  getFiscalYear,
  THAI_MONTHS, 
  THAI_MONTHS_SHORT 
} from './thai-utils.js';

// แผนที่ชื่อคอลัมน์ (ภาษาไทยและอังกฤษ) -> ฟิลด์ในระบบ
const COLUMN_ALIASES = {
  questionText: ['คำถาม', 'question', 'questiontext', 'หัวข้อคำถาม', 'เนื้อหาคำถาม', 'ข้อความคำถาม'],
  optionA: ['ตัวเลือก a', 'ตัวเลือก a.', 'option a', 'optiona', 'ข้อ a', 'ข้อ a.'],
  optionB: ['ตัวเลือก b', 'ตัวเลือก b.', 'option b', 'optionb', 'ข้อ b', 'ข้อ b.'],
  optionC: ['ตัวเลือก c', 'ตัวเลือก c.', 'option c', 'optionc', 'ข้อ c', 'ข้อ c.'],
  optionD: ['ตัวเลือก d', 'ตัวเลือก d.', 'option d', 'optiond', 'ข้อ d', 'ข้อ d.'],
  correctOption: ['เฉลย', 'คำตอบ', 'answer', 'correctoption', 'ตัวเลือกที่ถูกต้อง'],
  points: ['คะแนน', 'point', 'points', 'score'],
  examId: ['รหัสแบบทดสอบ', 'examid', 'exam', 'รหัสชุดข้อสอบ', 'รหัสแบบทดสอบ']
};

const OPTION_FIELDS = ['optionA', 'optionB', 'optionC', 'optionD'];
const REQUIRED_FIELDS = ['questionText', ...OPTION_FIELDS, 'correctOption'];

// ปรับข้อความหัวคอลัมน์ให้อยู่ในรูปแบบมาตรฐาน (lowercase, ตัดช่องว่าง)
function normalizeHeader(header) {
  if (header == null) return '';
  return String(header).trim().toLowerCase();
}

// แปลงชื่อคอลัมน์ดิบให้เป็นชื่อฟิลด์ในระบบ ถ้าไม่ตรงกับ alias ใดๆ คืนค่า null
function mapHeaderToField(header) {
  const norm = normalizeHeader(header);
  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    if (aliases.some((alias) => normalizeHeader(alias) === norm)) {
      return field;
    }
  }
  return null;
}

// ตรวจสอบและทำความสะอาดข้อความตัวเลือก
function cleanOption(value) {
  if (value == null) return '';
  return String(value).trim();
}

// แปลงค่าคะแนนให้เป็นตัวเลข ถ้าไม่ใช่ตัวเลขให้คืนค่าเริ่มต้น 10
function cleanPoints(value) {
  if (value == null || value === '') return 10;
  const num = Number(value);
  return Number.isFinite(num) ? num : 10;
}

// แปลงค่าตัวเลือกเฉลย (a/b/c/d) ให้อยู่ในรูปแบบมาตรฐาน
function cleanCorrectOption(value) {
  if (value == null) return '';
  return String(value).trim().toLowerCase();
}

/**
 * อ่านไฟล์ Excel (Buffer) และแปลงเป็นรายการคำถามพร้อมตัวเลือก
 *
 * รูปแบบคอลัมน์ที่รองรับ (แถวแรกต้องเป็นส่วนหัว):
 *   คำถาม | ตัวเลือก A | ตัวเลือก B | ตัวเลือก C | ตัวเลือก D | เฉลย (a/b/c/d) | [คะแนน] | [รหัสแบบทดสอบ]
 *
 * คืนค่า { success, questions[], errors[], message }
 */
export function parseQuestionsFromExcel(buffer) {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
      return { success: false, message: 'ไฟล์ Excel ไม่ถูกต้องหรือว่างเปล่า', questions: [], errors: [] };
    }

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });

    if (!rawRows || rawRows.length === 0) {
      return { success: false, message: 'ไม่พบข้อมูลในชีทแรกของไฟล์ Excel', questions: [], errors: [] };
    }

    // สร้างแผนที่ชื่อคอลัมน์ -> คีย์ในแถวข้อมูล (จากแถวแรกซึ่งเป็นส่วนหัว)
    const headerMap = {};
    const detectedFields = new Set();
    const firstRow = rawRows[0];

    for (const key of Object.keys(firstRow)) {
      const field = mapHeaderToField(key);
      if (field) {
        headerMap[field] = key;
        detectedFields.add(field);
      }
    }

    const missing = REQUIRED_FIELDS.filter((f) => !detectedFields.has(f));
    if (missing.length > 0) {
      return {
        success: false,
        message: `ไม่พบคอลัมน์ที่จำเป็นในไฟล์ Excel: ${missing.join(', ')}`,
        questions: [],
        errors: []
      };
    }

    const questions = [];
    const errors = [];

    rawRows.forEach((row, index) => {
      const rowNum = index + 1; // แถวที่ 1 คือส่วนหัว

      const questionText = cleanOption(row[headerMap.questionText]);
      if (!questionText) {
        errors.push({ row: rowNum, message: 'ข้อความคำถามห้ามว่าง' });
        return;
      }

      const options = OPTION_FIELDS.map((field) => {
        const text = cleanOption(row[headerMap[field]]);
        if (!text) {
          throw new Error(`แถวที่ ${rowNum}: ตัวเลือก ${field.toUpperCase()} ห้ามว่าง`);
        }
        return { id: field.charAt(field.length - 1).toLowerCase(), text }; // 'a','b','c','d'
      });

      const correctOption = cleanCorrectOption(row[headerMap.correctOption]);
      const validCorrect = ['a', 'b', 'c', 'd'];
      if (!validCorrect.includes(correctOption)) {
        errors.push({ row: rowNum, message: 'คอลัมน์เฉลยต้องเป็น a, b, c หรือ d' });
        return;
      }

      // กำหนดว่าตัวเลือกใดถูกต้อง
      options.forEach((opt) => {
        opt.isCorrect = opt.id === correctOption;
      });

      const points = cleanPoints(row[headerMap.points]);
      const examId = cleanOption(row[headerMap.examId]) || null;

      questions.push({
        questionText,
        options,
        points,
        examId,
        orderIndex: index + 1
      });
    });

    if (errors.length > 0) {
      return {
        success: false,
        message: `พบข้อผิดพลาด ${errors.length} รายการในไฟล์ Excel`,
        questions: [],
        errors
      };
    }

    return { success: true, questions, errors: [] };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการอ่านไฟล์ Excel',
      questions: [],
      errors: []
    };
  }
}

/**
 * สร้างตัวอย่างหัวตาราง Excel ที่รองรับ เพื่อให้ผู้ใช้อ้างอิง
 */
export function getExcelTemplateHeaders() {
  return [
    'คำถาม',
    'ตัวเลือก A',
    'ตัวเลือก B',
    'ตัวเลือก C',
    'ตัวเลือก D',
    'เฉลย (a/b/c/d)',
    'คะแนน',
    'รหัสแบบทดสอบ'
  ];
}

// =============================================================================
// ระบบนำเข้าและส่งออกโครงสร้างหน่วย กองทัพบก (Military Units Excel System)
// =============================================================================

const UNIT_COLUMN_ALIASES = {
  id: ['รหัสหน่วย', 'id', 'unit_id', 'unitid', 'code_id', 'รหัสหน่วยทหาร', 'รหัสหน่วย (id)', 'รหัสหน่วย (id ภาษาอังกฤษ/สากล)'],
  level: ['ระดับ', 'level', 'ชั้น', 'ลำดับชั้น', 'ระดับ (1=ทบ., 2=กองพล/มทบ., 3=กรม/กองพัน)', 'ระดับ (level)'],
  levelName: ['ระดับโครงสร้าง', 'ระดับโครงสร้าง (level name)', 'level name', 'level_name', 'ชื่อระดับ', 'ชื่อระดับโครงสร้าง', 'ระดับโครงสร้างหน่วย'],
  code: ['รหัส', 'code', 'รหัสย่อ', 'อักษรย่อ', 'unit_code', 'รหัส/ชื่อย่อหน่วย', 'รหัส/ชื่อย่อหน่วย (code)', 'รหัส/อักษรย่อหน่วย (code)'],
  shortName: ['ชื่อย่อ', 'shortname', 'short_name', 'ชื่อย่อหน่วย', 'ชื่อย่อหน่วย (short name)'],
  name: ['ชื่อหน่วย', 'name', 'fullname', 'full_name', 'ชื่อเต็ม', 'ชื่อเต็มหน่วย', 'ชื่อเต็มหน่วย (full name)'],
  parentId: ['รหัสหน่วยต้นสังกัด', 'parentid', 'parent_id', 'หน่วยสังกัด', 'หน่วยแม่', 'สังกัดหน่วย', 'หน่วยบังคับบัญชา', 'รหัสหน่วยต้นสังกัด (parent id)'],
  type: [
    'ประเภทหน่วย', 'type', 'unit_type', 'ประเภท', 'หมวดหมู่', 'หมวดหมู่หน่วย', 'หมวดหมู่หน่วย (7 ส่วนหลัก)',
    'หมวดหมู่ (7 ส่วนหลัก)', 'หมวดหมู่ (โครงสร้าง ทบ. 7 ส่วนหลัก)', 'ส่วนหลัก', 'ส่วนหลัก ทบ.',
    'โครงสร้าง ทบ. 7 ส่วนหลัก', 'ประเภทหน่วย (โครงสร้าง ทบ. 7 ส่วนหลัก)', 'ประเภทหน่วย / หมวดหมู่ (โครงสร้าง ทบ. 7 ส่วนหลัก)',
    'ประเภทหน่วย / หมวดหมู่หน่วย (โครงสร้าง ทบ. 7 ส่วนหลัก)', 'ประเภทหน่วย (type)', 'หมวดหมู่ 7 ส่วนหลัก', '7 ส่วนหลัก'
  ],
  province: ['จังหวัด', 'province', 'จังหวัดที่ตั้ง', 'จังหวัดที่ตั้ง (province)'],
  locationName: ['ชื่อค่าย', 'locationname', 'location_name', 'สถานที่ตั้ง', 'ที่ตั้งค่าย', 'ค่ายทหาร', 'ชื่อค่าย/สถานที่ตั้ง', 'ชื่อค่าย/สถานที่ตั้ง (location name)', 'ชื่อค่าย/สถานที่ตั้ง (location)'],
  address: ['ที่อยู่', 'address', 'ที่อยู่หน่วย', 'รายละเอียดที่ตั้ง', 'ที่อยู่หน่วย (address)'],
  rtaPhone: ['โทร.ทบ.', 'rtaphone', 'rta_phone', 'โทรทบ', 'เบอร์โทรทบ', 'โทรศัพท์ทบ', 'โทร.ทบ. (5 หลัก)', 'โทร.ทบ. 5 หลัก (rta phone)'],
  phone: ['เบอร์โทรศัพท์', 'phone', 'telephone', 'เบอร์โทร', 'เบอร์ติดต่อ', 'เบอร์โทรศัพท์ภายนอก', 'เบอร์โทรศัพท์ทั่วไป', 'เบอร์โทรศัพท์ทั่วไป (phone)'],
  lat: ['ละติจูด', 'lat', 'latitude', 'พิกัด lat', 'พิกัดละติจูด', 'พิกัดละติจูด (latitude)', 'พิกัดละติจูด (lat)'],
  lng: ['ลองจิจูด', 'lng', 'longitude', 'พิกัด lng', 'พิกัดลองจิจูด', 'พิกัดลองจิจูด (longitude)', 'พิกัดลองจิจูด (lng)'],
  status: ['สถานะ', 'status', 'สถานะการใช้งาน', 'เปิดใช้งาน', 'สถานะ (active/inactive)', 'สถานะ (status)']
};

function mapUnitHeaderToField(header) {
  const norm = normalizeHeader(header);
  for (const [field, aliases] of Object.entries(UNIT_COLUMN_ALIASES)) {
    if (aliases.some((alias) => normalizeHeader(alias) === norm)) {
      return field;
    }
  }
  return null;
}

function parseUnitLevel(val) {
  if (val == null || val === '') return null;
  const str = String(val).trim();
  const num = parseInt(str, 10);
  if (num === 1 || num === 2 || num === 3) return num;
  if (str.includes('1') || str.includes('ทบ') || str.includes('กองทัพภาค')) return 1;
  if (str.includes('2') || str.includes('กองพล') || str.includes('มทบ')) return 2;
  if (str.includes('3') || str.includes('กรม') || str.includes('กองพัน')) return 3;
  return null;
}

function getUnitLevelName(level) {
  if (level === 1) return 'ระดับ ทบ.';
  if (level === 2) return 'ระดับ กองพล';
  return 'ระดับ กรม/กองพัน';
}

/**
 * สร้างไฟล์แบบฟอร์มตัวอย่าง Excel สำหรับการนำเข้าโครงสร้างหน่วย
 * ประกอบด้วย 2 Sheet:
 * 1) โครงสร้างหน่วย (Unit Structure) พร้อมข้อมูลตัวอย่าง 6 รายการ
 * 2) คำแนะนำการกรอก (Instructions) พร้อมรหัสหน่วยอ้างอิง
 */
export function generateUnitTemplateExcel() {
  const wb = XLSX.utils.book_new();

  // Sheet 1: ตัวอย่างโครงสร้างหน่วย
  const headers = [
    'รหัสหน่วย (ID ภาษาอังกฤษ/สากล)',
    'ระดับ (1=ทบ., 2=กองพล/มทบ., 3=กรม/กองพัน)',
    'ระดับโครงสร้าง (Level Name)',
    'รหัส/ชื่อย่อหน่วย (Code)',
    'ชื่อย่อหน่วย (Short Name)',
    'ชื่อเต็มหน่วย (Full Name)',
    'รหัสหน่วยต้นสังกัด (Parent ID)',
    'ประเภทหน่วย (โครงสร้าง ทบ. 7 ส่วนหลัก)',
    'จังหวัดที่ตั้ง (Province)',
    'ชื่อค่าย/สถานที่ตั้ง (Location Name)',
    'ที่อยู่หน่วย (Address)',
    'โทร.ทบ. 5 หลัก (RTA Phone)',
    'เบอร์โทรศัพท์ทั่วไป (Phone)',
    'พิกัดละติจูด (Latitude)',
    'พิกัดลองจิจูด (Longitude)',
    'สถานะ (ACTIVE/INACTIVE)'
  ];

  const sampleRows = [
    [
      '1st_ARMY',
      1,
      'ระดับ ทบ.',
      'ทภ.1',
      'ทภ.1',
      'กองทัพภาคที่ 1 (ทภ.1)',
      '',
      '5. ส่วนภูมิภาค (Territorial Forces / Regional Section)',
      'กรุงเทพมหานคร',
      'บก.ทภ.1 ถ.ราชดำเนินนอก',
      'ถ.ราชดำเนินนอก แขวงดุสิต เขตดุสิต',
      '91001',
      '02-281-7500',
      13.7651,
      100.5085,
      'ACTIVE'
    ],
    [
      'SWC_RTA',
      1,
      'ระดับ ทบ.',
      'นสศ.',
      'นสศ.',
      'หน่วยบัญชาการสงครามพิเศษ (นสศ.)',
      '',
      '2. ส่วนกำลังรบ (Combat Forces)',
      'ลพบุรี',
      'ค่ายสมเด็จพระนารายณ์มหาราช',
      'ต.ทะเลชุบศร อ.เมือง',
      '95001',
      '036-412-100',
      14.7995,
      100.6534,
      'ACTIVE'
    ],
    [
      '9th_INF_DIV',
      2,
      'ระดับ กองพล',
      'พล.ร.9',
      'พล.ร.9',
      'กองพลทหารราบที่ 9 (พล.ร.9)',
      '1st_ARMY',
      '2. ส่วนกำลังรบ (Combat Forces)',
      'กาญจนบุรี',
      'ค่ายสุรสีห์ ต.ลาดหญ้า',
      'ต.ลาดหญ้า อ.เมือง',
      '59001',
      '034-589-234',
      14.0228,
      99.5328,
      'ACTIVE'
    ],
    [
      'MTB_11',
      2,
      'ระดับ กองพล',
      'มทบ.11',
      'มทบ.11',
      'มณฑลทหารบกที่ 11 (มทบ.11)',
      '1st_ARMY',
      '5. ส่วนภูมิภาค (Territorial Forces / Regional Section)',
      'กรุงเทพมหานคร',
      'ถ.พระรามที่ 5',
      'แขวงถนนนครไชยศรี เขตดุสิต',
      '91101',
      '02-241-1122',
      13.7820,
      100.5280,
      'ACTIVE'
    ],
    [
      '19th_INF_REG_BN1',
      3,
      'ระดับ กรม/กองพัน',
      'ร.19 พัน.1',
      'ร.19 พัน.1',
      'กองพันทหารราบที่ 1 กรมทหารราบที่ 19 (ร.19 พัน.1)',
      '9th_INF_DIV',
      '2. ส่วนกำลังรบ (Combat Forces)',
      'กาญจนบุรี',
      'ค่ายสุรสีห์ ต.ลาดหญ้า',
      'ต.ลาดหญ้า อ.เมือง',
      '59111',
      '034-589-235',
      14.0235,
      99.5340,
      'ACTIVE'
    ],
    [
      '9th_CAV_SQN',
      3,
      'ระดับ กรม/กองพัน',
      'ม.พัน.19 พล.ร.9',
      'ม.พัน.19',
      'กองพันทหารม้าที่ 19 กองพลทหารราบที่ 9',
      '9th_INF_DIV',
      '2. ส่วนกำลังรบ (Combat Forces)',
      'กาญจนบุรี',
      'ค่ายสุรสีห์ ต.ลาดหญ้า',
      'ต.ลาดหญ้า อ.เมือง',
      '59119',
      '034-589-239',
      14.0240,
      99.5350,
      'ACTIVE'
    ]
  ];

  const wsUnits = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
  wsUnits['!cols'] = [
    { wch: 22 }, // id
    { wch: 10 }, // level
    { wch: 20 }, // levelName
    { wch: 16 }, // code
    { wch: 18 }, // shortName
    { wch: 42 }, // name
    { wch: 20 }, // parentId
    { wch: 36 }, // type (7 sections)
    { wch: 18 }, // province
    { wch: 32 }, // locationName
    { wch: 36 }, // address
    { wch: 15 }, // rtaPhone
    { wch: 18 }, // phone
    { wch: 14 }, // lat
    { wch: 14 }, // lng
    { wch: 12 }  // status
  ];
  XLSX.utils.book_append_sheet(wb, wsUnits, 'โครงสร้างหน่วย');

  // Sheet 2: คำแนะนำการใช้งาน
  const guideHeaders = ['หัวข้อ / คอลัมน์', 'คำอธิบายและข้อกำหนด', 'ตัวอย่างข้อมูล'];
  const guideRows = [
    ['รหัสหน่วย (ID)', 'รหัสระบุเฉพาะของหน่วย ภาษาอังกฤษหรือตัวเลข (ห้ามมีช่องว่าง) หากปล่อยว่าง ระบบจะสร้างรหัสให้อัตโนมัติ', '1st_ARMY, 9th_INF_DIV, 19th_INF_REG_BN1'],
    ['ระดับ (Level)', 'ระบุเป็นตัวเลข 1, 2 หรือ 3\n• 1 = ระดับ ทบ. / บชร. / กองทัพภาค\n• 2 = ระดับ กองพล / มณฑลทหารบก (มทบ.)\n• 3 = ระดับ กรม หรือ กองพัน', '1, 2, 3'],
    ['ระดับโครงสร้าง (Level Name)', 'ชื่อระดับโครงสร้างหน่วย:\n• ระดับ ทบ.\n• ระดับ กองพล\n• ระดับ กรม/กองพัน\n• อื่นๆ (สามารถระบุชื่อระดับเองได้ เช่น ระดับ บชร., ฉก., กองพันพิเศษ)', 'ระดับ ทบ., ระดับ กองพล, ระดับ กรม/กองพัน, ระดับ บชร.'],
    ['รหัส/ชื่อย่อหน่วย (Code)', 'อักษรย่อทางการทหารของหน่วย', 'ทภ.1, พล.ร.9, ร.19 พัน.1'],
    ['ชื่อย่อหน่วย (Short Name)', 'ชื่อย่อที่ใช้แสดงผลในตารางหรือตัวเลือก', 'พล.ร.9, มทบ.11, ร.19 พัน.1'],
    ['ชื่อเต็มหน่วย (Full Name)', 'ชื่อเต็มทางการของหน่วย (บังคับต้องระบุ)', 'กองพลทหารราบที่ 9 (พล.ร.9)'],
    ['รหัสหน่วยต้นสังกัด (Parent ID)', 'รหัสหน่วยที่สังกัดอยู่ (Parent ID)\n• ระดับ 1: ไม่ต้องระบุ (ว่างไว้)\n• ระดับ 2: ต้องระบุ ID ของหน่วยระดับ 1 ที่สังกัด\n• ระดับ 3: ต้องระบุ ID ของหน่วยระดับ 2 ที่สังกัด', '1st_ARMY, 9th_INF_DIV (หรือระบุชื่อย่อหน่วย เช่น ทภ.1 ระบบจะแปลงให้อัตโนมัติ)'],
    ['ประเภทหน่วย / หมวดหมู่ (โครงสร้าง ทบ. 7 ส่วนหลัก)', 'ระบุตามโครงสร้างกองทัพบกไทย (7 ส่วนหลัก):\n1. ส่วนบัญชาการ (Headquarters / Command Section) -> COMMAND\n2. ส่วนกำลังรบ (Combat Forces) -> COMBAT\n3. ส่วนสนับสนุนการรบ (Combat Support Forces) -> COMBAT_SUPPORT\n4. ส่วนช่วยรบ / ส่วนสนับสนุนการช่วยรบ (Combat Service Support Forces) -> COMBAT_SERVICE_SUPPORT\n5. ส่วนภูมิภาค (Territorial Forces / Regional Section) -> REGIONAL\n6. ส่วนการศึกษาและฝึกศึกษา (Education and Training Section) -> EDUCATION_TRAINING\n7. ส่วนช่วยการพัฒนาประเทศ (National Development Section) -> NATIONAL_DEVELOPMENT\n8. อื่นๆ / หน่วยเฉพาะกิจ -> OTHER', '2. ส่วนกำลังรบ (Combat Forces), 5. ส่วนภูมิภาค, COMBAT, REGIONAL'],
    ['จังหวัดที่ตั้ง (Province)', 'จังหวัดที่ตั้งของ บก.หน่วย หรือค่ายทหาร', 'กรุงเทพมหานคร, กาญจนบุรี, ปราจีนบุรี'],
    ['ชื่อค่าย/สถานที่ตั้ง (Location Name)', 'ชื่อค่ายทหารหรือสถานที่ตั้ง บก.หน่วย', 'ค่ายสุรสีห์ ต.ลาดหญ้า, ค่ายพรหมโยธี'],
    ['ที่อยู่หน่วย (Address)', 'ที่อยู่โดยละเอียด เช่น ตำบล อำเภอ ถนน', 'ต.ลาดหญ้า อ.เมือง จ.กาญจนบุรี'],
    ['โทร.ทบ. 5 หลัก (RTA Phone)', 'เบอร์โทรศัพท์ภายใน ทบ. ตัวเลข 5 หลักพอดี (ถ้ามี)', '91001, 59001, 54001'],
    ['เบอร์โทรศัพท์ทั่วไป (Phone)', 'เบอร์โทรศัพท์ติดต่อภายนอก / ทั่วไป', '02-281-7500, 034-589-234'],
    ['พิกัดละติจูด (Lat)', 'พิกัด GPS ละติจูด (ทศนิยม 4-6 ตำแหน่ง)', '14.0228'],
    ['พิกัดลองจิจูด (Lng)', 'พิกัด GPS ลองจิจูด (ทศนิยม 4-6 ตำแหน่ง)', '99.5328'],
    ['สถานะ (Status)', 'ACTIVE (เปิดใช้งาน) หรือ INACTIVE (ปิด/ระงับการใช้งาน)', 'ACTIVE, INACTIVE'],
    ['', '', ''],
    ['การนำเข้าข้อมูลซ้ำ (Overwrite/Update)', 'หากมีรหัสหน่วย (ID) อยู่ในระบบแล้ว และผู้ดูแลระบบเลือก "อัปเดตข้อมูลหากมีรหัสหน่วยอยู่แล้ว" ระบบจะปรับปรุงข้อมูลเดิมให้ทันที', 'ช่วยให้อัปเดตเบอร์โทรหรือพิกัดหน่วยพร้อมกันได้สะดวก']
  ];

  const wsGuide = XLSX.utils.aoa_to_sheet([guideHeaders, ...guideRows]);
  wsGuide['!cols'] = [
    { wch: 30 },
    { wch: 60 },
    { wch: 35 }
  ];
  XLSX.utils.book_append_sheet(wb, wsGuide, 'คำแนะนำการกรอก');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * ส่งออกข้อมูลโครงสร้างหน่วยทั้งหมดเป็นไฟล์ Excel (.xlsx)
 */
export function exportUnitsToExcel(units = []) {
  const wb = XLSX.utils.book_new();

  // สร้าง Map สำหรับค้นหาชื่อหน่วยแม่
  const unitMap = new Map((units || []).map((u) => [u.id, u]));

  const headers = [
    'รหัสหน่วย (ID)',
    'ระดับ (Level)',
    'ระดับโครงสร้าง (Level Name)',
    'รหัส/ชื่อย่อหน่วย (Code)',
    'ชื่อย่อหน่วย (Short Name)',
    'ชื่อเต็มหน่วย (Full Name)',
    'รหัสหน่วยต้นสังกัด (Parent ID)',
    'ชื่อหน่วยต้นสังกัด (Parent Name)',
    'ประเภทหน่วย (โครงสร้าง ทบ. 7 ส่วนหลัก)',
    'จังหวัดที่ตั้ง (Province)',
    'ชื่อค่าย/สถานที่ตั้ง (Location)',
    'ที่อยู่หน่วย (Address)',
    'โทร.ทบ. 5 หลัก (RTA Phone)',
    'เบอร์โทรศัพท์ทั่วไป (Phone)',
    'พิกัดละติจูด (Lat)',
    'พิกัดลองจิจูด (Lng)',
    'สถานะ (Status)'
  ];

  const rows = (units || []).map((u) => {
    const parent = u.parentId ? unitMap.get(u.parentId) : null;
    const parentName = parent ? (parent.name || parent.shortName || u.parentId) : '';
    const levelName = u.levelName || getUnitLevelName(u.level);
    const sec = getRtaSection(u.type);

    return [
      u.id || '',
      u.level ?? '',
      levelName,
      u.code || u.shortName || '',
      u.shortName || u.code || '',
      u.name || '',
      u.parentId || '',
      parentName,
      sec.label, // เช่น '2. ส่วนกำลังรบ (Combat Forces)'
      u.province || '',
      u.locationName || '',
      u.address || '',
      u.rtaPhone || '',
      u.phone || '',
      u.lat !== null && u.lat !== undefined ? u.lat : '',
      u.lng !== null && u.lng !== undefined ? u.lng : '',
      u.status || 'ACTIVE'
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = [
    { wch: 22 }, // ID
    { wch: 10 }, // Level
    { wch: 18 }, // Level Name
    { wch: 16 }, // Code
    { wch: 18 }, // Short Name
    { wch: 42 }, // Full Name
    { wch: 20 }, // Parent ID
    { wch: 32 }, // Parent Name
    { wch: 36 }, // Type (7 sections)
    { wch: 18 }, // Province
    { wch: 32 }, // Location
    { wch: 36 }, // Address
    { wch: 15 }, // RTA Phone
    { wch: 18 }, // Phone
    { wch: 14 }, // Lat
    { wch: 14 }, // Lng
    { wch: 12 }  // Status
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'โครงสร้างหน่วย ทบ.');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * อ่านไฟล์ Excel (Buffer) และแปลงเป็นรายการโครงสร้างหน่วย พร้อมตรวจสอบความถูกต้อง
 */
export function parseUnitsFromExcel(buffer, existingUnits = []) {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
      return { success: false, message: 'ไฟล์ Excel ไม่ถูกต้องหรือว่างเปล่า', units: [], errors: [], warnings: [] };
    }

    // หา Sheet ที่เก็บข้อมูลโครงสร้างหน่วย (ชีทแรก หรือชีทที่มีคำว่าหน่วย/unit)
    let targetSheetName = workbook.SheetNames[0];
    const unitSheetName = workbook.SheetNames.find((s) => s.includes('หน่วย') || s.toLowerCase().includes('unit'));
    if (unitSheetName) targetSheetName = unitSheetName;

    const sheet = workbook.Sheets[targetSheetName];
    const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });

    if (!rawRows || rawRows.length === 0) {
      return { success: false, message: 'ไม่พบข้อมูลในชีทโครงสร้างหน่วยของไฟล์ Excel', units: [], errors: [], warnings: [] };
    }

    // สร้างแผนที่ชื่อคอลัมน์ -> คีย์ในแถวข้อมูล
    const headerMap = {};
    const detectedFields = new Set();
    const firstRow = rawRows[0];

    for (const key of Object.keys(firstRow)) {
      const field = mapUnitHeaderToField(key);
      if (field) {
        headerMap[field] = key;
        detectedFields.add(field);
      }
    }

    // บังคับต้องมีคอลัมน์ชื่อหน่วย และระดับโครงสร้าง
    if (!detectedFields.has('name')) {
      return {
        success: false,
        message: 'ไม่พบคอลัมน์ "ชื่อเต็มหน่วย" หรือ "ชื่อหน่วย" ในไฟล์ Excel',
        units: [],
        errors: [{ row: 1, message: 'ต้องมีคอลัมน์ "ชื่อหน่วย" (Name) เป็นคอลัมน์หลัก' }],
        warnings: []
      };
    }

    // Map สำหรับแปลงชื่อย่อ/รหัสหน่วยแม่ -> ID หน่วยแม่จริง
    const parentLookup = new Map();
    (existingUnits || []).forEach((u) => {
      if (u.id) parentLookup.set(u.id.toLowerCase(), u.id);
      if (u.code) parentLookup.set(u.code.toLowerCase(), u.id);
      if (u.shortName) parentLookup.set(u.shortName.toLowerCase(), u.id);
      if (u.name) parentLookup.set(u.name.toLowerCase(), u.id);
    });

    const parsedUnits = [];
    const errors = [];
    const warnings = [];

    rawRows.forEach((row, index) => {
      const rowNum = index + 2; // แถวที่ 1 ใน Excel คือหัวตาราง ข้อมูลเริ่มแถว 2

      const name = String(row[headerMap.name] || '').trim();
      if (!name) {
        // ข้ามแถวว่างทั้งหมด
        const hasAnyVal = Object.values(row).some((v) => String(v).trim().length > 0);
        if (hasAnyVal) {
          errors.push({ row: rowNum, message: 'ชื่อหน่วยห้ามว่าง' });
        }
        return;
      }

      // ตรวจสอบระดับโครงสร้าง
      let level = parseUnitLevel(row[headerMap.level]);
      if (!level) {
        // ถ้าไม่ได้ระบุระดับ ให้คาดเดาจากชื่อหน่วย
        if (name.includes('ทภ.') || name.includes('กองทัพภาค') || name.includes('นสศ.') || name.includes('นปอ.')) {
          level = 1;
        } else if (name.includes('พล.ร.') || name.includes('พล.ม.') || name.includes('กองพล') || name.includes('มทบ.') || name.includes('มณฑลทหารบก')) {
          level = 2;
        } else {
          level = 3;
        }
        warnings.push({ row: rowNum, message: `ไม่ได้ระบุระดับหน่วย ระบบได้กำหนดเป็นระดับ ${level} (${getUnitLevelName(level)}) โดยอัตโนมัติ` });
      }

      const rawId = String(row[headerMap.id] || '').trim();
      const code = String(row[headerMap.code] || '').trim();
      const shortName = String(row[headerMap.shortName] || '').trim() || code || name;

      // สร้างรหัสหน่วย (ID) หากผู้ใช้ไม่ได้ระบุมา
      let id = rawId;
      if (!id) {
        // ถ้ามี code ภาษาอังกฤษให้ใช้ slug
        const engCode = (code || shortName).replace(/[^a-zA-Z0-9_]/g, '');
        if (engCode && engCode.length >= 2) {
          id = `UNIT_${engCode.toUpperCase()}`;
        } else {
          id = `UNIT_${Date.now()}_${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        }
      }

      // จัดการ parentId
      let parentId = String(row[headerMap.parentId] || '').trim();
      if (level === 1) {
        parentId = null; // ระดับ 1 ไม่มี parentId
      } else if (parentId) {
        // ลองเทียบกับ parentLookup
        const resolvedParentId = parentLookup.get(parentId.toLowerCase());
        if (resolvedParentId) {
          parentId = resolvedParentId;
        }
      } else {
        parentId = null;
        if (level > 1) {
          warnings.push({ row: rowNum, message: `หน่วยระดับ ${level} ("${name}") ยังไม่ได้ระบุหน่วยต้นสังกัด (Parent ID)` });
        }
      }

      // ทำความสะอาดเบอร์โทร.ทบ. (5 หลัก)
      let rtaPhone = String(row[headerMap.rtaPhone] || '').replace(/\D/g, '');
      if (rtaPhone) {
        if (rtaPhone.length !== 5) {
          warnings.push({ row: rowNum, message: `เบอร์โทร.ทบ. "${row[headerMap.rtaPhone]}" ควรมีตัวเลข 5 หลักพอดี` });
          rtaPhone = rtaPhone.slice(0, 5);
        }
      }

      // พิกัด GPS
      const rawLat = parseFloat(row[headerMap.lat]);
      const lat = Number.isFinite(rawLat) ? rawLat : null;
      const rawLng = parseFloat(row[headerMap.lng]);
      const lng = Number.isFinite(rawLng) ? rawLng : null;

      // สถานะ
      const rawStatus = String(row[headerMap.status] || '').trim().toUpperCase();
      const status = rawStatus === 'INACTIVE' || rawStatus === 'ระงับ' || rawStatus === 'ปิด' || rawStatus === 'FALSE' ? 'INACTIVE' : 'ACTIVE';

      const rawLevelName = String(row[headerMap.levelName] || '').trim();
      const levelName = rawLevelName || getUnitLevelName(level);
      const rawType = String(row[headerMap.type] || '').trim();
      const rtaSec = getRtaSection(rawType || (level === 1 ? 'REGIONAL' : level === 2 ? 'COMBAT' : 'COMBAT'));
      const type = rtaSec.code;

      const unitObj = {
        id,
        level,
        levelName,
        code: code || shortName,
        shortName,
        name,
        parentId: parentId || null,
        type,
        province: String(row[headerMap.province] || 'กรุงเทพมหานคร').trim(),
        locationName: String(row[headerMap.locationName] || '').trim(),
        address: String(row[headerMap.address] || '').trim(),
        rtaPhone,
        phone: String(row[headerMap.phone] || '').trim(),
        lat,
        lng,
        status,
        createdAt: new Date().toISOString()
      };

      // เพิ่มเข้า parentLookup เผื่อแถวถัดไปเป็นหน่วยลูกอ้างอิงถึงหน่วยนี้
      parentLookup.set(unitObj.id.toLowerCase(), unitObj.id);
      if (unitObj.code) parentLookup.set(unitObj.code.toLowerCase(), unitObj.id);
      if (unitObj.shortName) parentLookup.set(unitObj.shortName.toLowerCase(), unitObj.id);
      if (unitObj.name) parentLookup.set(unitObj.name.toLowerCase(), unitObj.id);

      parsedUnits.push(unitObj);
    });

    if (errors.length > 0 && parsedUnits.length === 0) {
      return {
        success: false,
        message: `พบข้อผิดพลาด ${errors.length} จุด ไม่สามารถอ่านข้อมูลหน่วยได้`,
        units: [],
        errors,
        warnings,
        totalRows: rawRows.length
      };
    }

    return {
      success: true,
      totalRows: rawRows.length,
      validCount: parsedUnits.length,
      errorCount: errors.length,
      warningCount: warnings.length,
      units: parsedUnits,
      errors,
      warnings
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการอ่านไฟล์ Excel โครงสร้างหน่วย',
      units: [],
      errors: [{ row: 0, message: error.message }],
      warnings: [],
      totalRows: 0
    };
  }
}

// ============================================================
// ระบบนำเข้าและส่งออกข้อมูลคำร้องขอรับสิทธิเงินสินไหม ทบ. (Claims Import/Export)
// ============================================================

const CLAIM_COLUMN_ALIASES = {
  trackingCode: ['เลขที่คำร้อง', 'เลขที่ติดตาม', 'เลขที่อ้างอิง', 'trackingcode', 'tracking_code', 'รหัสคำร้อง', 'รหัสอ้างอิง', 'เลขที่หนังสือ', 'เลขที่', 'เลขคำร้อง', 'เลขที่คำร้อง (Tracking Code)'],
  reportDate: ['วันที่รายงาน', 'วันที่ยื่นเรื่อง', 'วันที่เสนอเรื่อง', 'reportdate', 'report_date', 'วันที่รับเรื่อง', 'วันที่เอกสาร', 'วันรายงาน', 'วันที่ยื่น', 'วันที่รายงาน (Report Date)'],
  lossDate: ['วันที่สูญเสีย', 'วันที่เกิดเหตุ', 'วันที่เสียชีวิต', 'lossdate', 'loss_date', 'วันที่บาดเจ็บ', 'วันเกิดเหตุ', 'วันสูญเสีย', 'วันที่สูญเสีย (Loss Date)'],
  casualtyCitizenId: ['เลขประจำตัวประชาชน', 'เลขบัตรประชาชน', 'เลขปชช', 'citizenid', 'casualtycitizenid', 'เลขบัตร', 'เลขประจำตัว', 'casualty_citizen_id', 'เลขประจำตัวประชาชน 13 หลัก', 'เลขบัตรประชาชน 13 หลัก', 'เลขประจำตัวประชาชน (Citizen ID)'],
  casualtyRank: ['ยศ', 'คำนำหน้า', 'rank', 'casualtyrank', 'ยศ/คำนำหน้า', 'ยศผู้สูญเสีย', 'ยศ/คำนำหน้านาม', 'ยศ (Rank)'],
  casualtyFirstName: ['ชื่อ', 'ชื่อตัว', 'firstname', 'casualtyfirstname', 'ชื่อผู้สูญเสีย', 'ชื่อกำลังพล', 'casualty_first_name', 'ชื่อ (First Name)'],
  casualtyLastName: ['นามสกุล', 'lastname', 'casualtylastname', 'นามสกุลผู้สูญเสีย', 'นามสกุลกำลังพล', 'casualty_last_name', 'นามสกุล (Last Name)'],
  casualtyBirthDate: ['วันเกิด', 'วันเดือนปีเกิด', 'birthdate', 'casualtybirthdate', 'วันเกิดกำลังพล', 'casualty_birth_date', 'วันเกิด (Birth Date)'],
  casualtyGender: ['เพศ', 'gender', 'casualtygender', 'เพศกำลังพล', 'เพศ (Gender)'],
  personnelType: ['ประเภทกำลังพล', 'กลุ่มกำลังพล', 'personneltype', 'สถานะกำลังพล', 'ประเภท', 'personnel_type', 'ประเภทกำลังพล (Personnel Type)'],
  casualtyPosition: ['ตำแหน่ง', 'ตำแหน่งราชการ', 'position', 'casualtyposition', 'หน้าที่', 'casualty_position', 'ตำแหน่ง (Position)'],
  unitName: ['หน่วยสังกัด', 'หน่วย', 'สังกัด', 'unitname', 'unit', 'unit_name', 'ชื่อหน่วย', 'หน่วยต้นสังกัด', 'หน่วยสังกัด (Unit Name/Code)', 'หน่วยสังกัด (Unit Name)'],
  unitId: ['รหัสหน่วย', 'unitid', 'unit_id'],
  claimType: ['ประเภทสินไหม', 'ประเภทสิทธิ', 'claimtype', 'claim_type', 'วงเงินสินไหม', 'สิทธิสินไหม', 'ประเภทการขอรับสิทธิ', 'ประเภทสินไหม (Claim Type)'],
  lossType: ['ลักษณะการสูญเสีย', 'ประเภทการสูญเสีย', 'losstype', 'loss_type', 'ผลการสูญเสีย', 'สถานะการสูญเสีย', 'ลักษณะการสูญเสีย (Loss Type)'],
  incidentType: ['ลักษณะการเกิดเหตุ', 'ประเภทเหตุการณ์', 'incidenttype', 'incident_type', 'ลักษณะเหตุการณ์', 'สาเหตุ', 'ลักษณะการเกิดเหตุ (Incident Type)'],
  compensationAmount: ['ยอดเงินสินไหม', 'จำนวนเงิน', 'ยอดเงิน', 'compensationamount', 'compensation_amount', 'วงเงิน', 'เงินสินไหม', 'จำนวนเงินสินไหม', 'ยอดเงินสินไหม (Amount)', 'ยอดเงินสินไหม (บาท)'],
  isDriver: ['สถานะการขับขี่', 'เป็นผู้ขับขี่', 'isdriver', 'is_driver', 'สถานะการขับขี่ (Is Driver)'],
  alcoholTestResult: ['ผลตรวจแอลกอฮอล์', 'ตรวจวัดแอลกอฮอล์', 'alcoholtestresult', 'alcohol_test_result', 'แอลกอฮอล์', 'ผลตรวจแอลกอฮอล์ (Alcohol Test)'],
  causeOfLoss: ['สาเหตุการสูญเสีย', 'พฤติการณ์เหตุการณ์', 'causeofloss', 'cause_of_loss', 'รายละเอียดเหตุการณ์', 'พฤติการณ์', 'รายละเอียด', 'สาเหตุการสูญเสีย / พฤติการณ์เหตุการณ์', 'สาเหตุการสูญเสีย / พฤติการณ์เหตุการณ์ (Cause of Loss)'],
  lossSpecificCause: ['สาเหตุการเสียชีวิต', 'อวัยวะที่สูญเสีย', 'lossspecificcause', 'สาเหตุเฉพาะ', 'สาเหตุตามมรณบัตร', 'loss_specific_cause', 'สาเหตุการเสียชีวิต / อวัยวะที่สูญเสีย', 'สาเหตุการเสียชีวิต / อวัยวะที่สูญเสีย (Specific Cause)'],
  heirName: ['ชื่อทายาท', 'ผู้รับเงิน', 'ทายาท', 'heirname', 'heir_name', 'ทายาทผู้มีสิทธิ', 'ชื่อผู้รับเงิน', 'ชื่อ-สกุล ทายาท', 'ชื่อทายาทผู้รับสิทธิ', 'ชื่อทายาทผู้รับสิทธิ (Heir Name)'],
  status: ['สถานะ', 'สถานะคำร้อง', 'status', 'สถานะการดำเนินงาน', 'ขั้นตอน', 'สถานะคำร้อง (Status)', 'สถานะปัจจุบัน'],
  paidAt: ['วันที่จ่ายเงิน', 'วันที่โอนเงิน', 'paidat', 'paid_at', 'วันที่จ่ายสินไหม', 'วันโอนเงิน', 'วันที่จ่ายเงิน (Paid Date)', 'วันที่จ่ายเงินสินไหม'],
  reporterName: ['ผู้เสนอเรื่อง', 'ผู้รายงาน', 'reportername', 'reporter_name', 'เจ้าหน้าที่ผู้เสนอเรื่อง', 'ผู้เสนอเรื่อง (Reporter Name)']
};

/**
 * แปลงค่าวันที่จาก Excel (รองรับทั้ง serial number, YYYY-MM-DD, DD/MM/YYYY พ.ศ. และ ค.ศ.)
 */
export function parseExcelDateValue(val) {
  if (val == null || val === '') return null;
  if (val instanceof Date && !isNaN(val.getTime())) {
    return val.toISOString().slice(0, 10);
  }
  if (typeof val === 'number') {
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(date.getTime())) {
      return date.toISOString().slice(0, 10);
    }
  }
  const str = String(val).trim();
  if (!str) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  const m = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (m) {
    let day = parseInt(m[1], 10);
    let month = parseInt(m[2], 10);
    let year = parseInt(m[3], 10);
    if (year > 2400) year -= 543;
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  }

  const thaiMonthsShort = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const thaiMonthsFull = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

  for (let i = 0; i < 12; i++) {
    if (str.includes(thaiMonthsFull[i]) || str.includes(thaiMonthsShort[i])) {
      const parts = str.split(/\s+/).filter(Boolean);
      const day = parseInt(parts[0], 10) || 1;
      let year = parseInt(parts[parts.length - 1], 10) || (new Date().getFullYear() + 543);
      if (year > 2400) year -= 543;
      const mm = String(i + 1).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      return `${year}-${mm}-${dd}`;
    }
  }

  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }
  return null;
}

function normalizeClaimStatus(val, paidAt) {
  if (!val && paidAt) return 'PAID';
  if (!val) return 'SUBMITTED';
  const str = String(val).trim().toUpperCase();
  if (str.includes('PAID') || str.includes('จ่ายเงิน') || str.includes('โอนเงิน') || str.includes('สำเร็จ')) return 'PAID';
  if (str.includes('SK_NOTIFIED') || str.includes('สก.ทบ')) return 'SK_NOTIFIED';
  if (str.includes('APPROVED') || str.includes('อนุมัติ')) return 'APPROVED';
  if (str.includes('INSURANCE') || str.includes('ประกันภัย')) return 'INSURANCE_PROCESSING';
  if (str.includes('PENDING_APPROVAL') || str.includes('รออนุมัติ') || str.includes('เสนออนุมัติ')) return 'PENDING_APPROVAL';
  if (str.includes('UNDER_REVIEW') || str.includes('ตรวจ') || str.includes('กพ.ทบ')) return 'UNDER_REVIEW';
  if (str.includes('DRAFT') || str.includes('ร่าง')) return 'DRAFT';
  if (str.includes('REJECT') || str.includes('ไม่อนุมัติ') || str.includes('ส่งกลับ')) return 'REJECTED';
  return 'SUBMITTED';
}

function normalizeClaimTypeAndAmount(rawType, rawAmount) {
  const t = String(rawType || '').toLowerCase();
  const amtNum = parseFloat(String(rawAmount || '').replace(/[^\d.]/g, '')) || 0;

  if (t.includes('300') || t.includes('เสี่ยง') || t.includes('สำคัญ') || t.includes('high') || amtNum >= 200000) {
    return {
      claimType: 'HIGH_RISK',
      compensationAmount: amtNum > 0 ? amtNum : 300000
    };
  }
  return {
    claimType: 'NORMAL',
    compensationAmount: amtNum > 0 ? amtNum : 60000
  };
}

function normalizeLossType(val) {
  const str = String(val || '').toLowerCase();
  if (str.includes('พิการ') || str.includes('ทุพพลภาพ') || str.includes('disabled')) return 'DISABLED';
  return 'DECEASED';
}

function normalizeIncidentType(val) {
  const str = String(val || '').toLowerCase();
  if (str.includes('รบ') || str.includes('ปะทะ') || str.includes('เสี่ยงภัย') || str.includes('combat')) return 'COMBAT';
  if (str.includes('อุบัติเหตุ') || str.includes('รถ') || str.includes('accident')) return 'ACCIDENT';
  if (str.includes('ป่วย') || str.includes('โรค') || str.includes('illness')) return 'ILLNESS';
  return 'OTHER';
}

function resolveClaimUnit(rawUnitName, rawUnitId, allUnits = []) {
  if (rawUnitId) {
    const foundById = allUnits.find((u) => u.id === rawUnitId || u.id.toLowerCase() === rawUnitId.toLowerCase());
    if (foundById) return { unitId: foundById.id, unitName: foundById.name };
  }
  if (!rawUnitName) {
    return { unitId: '9th_INF_DIV', unitName: 'กองพลทหารราบที่ 9 (พล.ร.9)' };
  }
  const q = String(rawUnitName).trim().toLowerCase();
  let found = allUnits.find(
    (u) =>
      u.name.toLowerCase() === q ||
      (u.shortName && u.shortName.toLowerCase() === q) ||
      (u.code && u.code.toLowerCase() === q) ||
      u.id.toLowerCase() === q
  );
  if (!found) {
    found = allUnits.find(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        (u.shortName && q.includes(u.shortName.toLowerCase())) ||
        (u.code && q.includes(u.code.toLowerCase()))
    );
  }
  if (found) {
    return { unitId: found.id, unitName: found.name };
  }
  return { unitId: rawUnitId || 'LEGACY_UNIT', unitName: String(rawUnitName).trim() };
}

/**
 * สร้างไฟล์ Excel แบบฟอร์มแม่แบบตัวอย่างการนำเข้าข้อมูลคำร้อง (Claims Import Template)
 */
export function generateClaimsTemplateExcel() {
  const wb = XLSX.utils.book_new();

  const headers = [
    'เลขที่คำร้อง (Tracking Code)',
    'วันที่รายงาน (Report Date)',
    'วันที่สูญเสีย (Loss Date)',
    'เลขประจำตัวประชาชน (Citizen ID)',
    'ยศ (Rank)',
    'ชื่อ (First Name)',
    'นามสกุล (Last Name)',
    'วันเกิด (Birth Date)',
    'เพศ (Gender)',
    'ประเภทกำลังพล (Personnel Type)',
    'ตำแหน่ง (Position)',
    'หน่วยสังกัด (Unit Name/Code)',
    'ประเภทสินไหม (Claim Type)',
    'ลักษณะการสูญเสีย (Loss Type)',
    'ลักษณะการเกิดเหตุ (Incident Type)',
    'ยอดเงินสินไหม (Amount)',
    'สถานะการขับขี่ (Is Driver)',
    'ผลตรวจแอลกอฮอล์ (Alcohol Test)',
    'สาเหตุการสูญเสีย / พฤติการณ์เหตุการณ์ (Cause of Loss)',
    'สาเหตุการเสียชีวิต / อวัยวะที่สูญเสีย (Specific Cause)',
    'ชื่อทายาทผู้รับสิทธิ (Heir Name)',
    'สถานะคำร้อง (Status)',
    'วันที่จ่ายเงิน (Paid Date)',
    'ผู้เสนอเรื่อง (Reporter Name)'
  ];

  const sampleRows = [
    [
      'ทบ-กพ-66/001',
      '2023-11-10',
      '2023-11-05',
      '3100500112233',
      'ส.อ.',
      'สมศักดิ์',
      'ใจกล้า',
      '1994-04-12',
      'ชาย',
      'นายทหารประทวน',
      'ผบ.หมู่ ปืนเล็ก',
      'กองพลทหารราบที่ 9 (พล.ร.9)',
      'HIGH_RISK',
      'DECEASED',
      'COMBAT',
      300000,
      'NO',
      'NOT_EXCEEDED',
      'ถูกซุ่มโจมตีขณะปฏิบัติภารกิจลาดตระเวนรักษาความปลอดภัยเส้นทาง',
      'บาดแผลจากสะเก็ดระเบิดรุนแรง เสียเลือดมากในช่องอก',
      'นางสมใจ ใจกล้า (ภรรยา)',
      'PAID',
      '2023-12-05',
      'ร.อ. สมหมาย กล้าหาญ'
    ],
    [
      'ทบ-กพ-66/015',
      '2024-02-14',
      '2024-02-08',
      '1100500998877',
      'พลทหาร',
      'ธีรพงษ์',
      'บุญช่วย',
      '2002-09-18',
      'ชาย',
      'พลทหาร',
      'พลปืนเล็ก',
      'กรมทหารพรานที่ 41 (ทภ.4)',
      'HIGH_RISK',
      'DISABLED',
      'COMBAT',
      300000,
      'NO',
      'NOT_EXCEEDED',
      'เหยียบกับระเบิดขณะปฏิบัติหน้าที่ราชการสนาม',
      'สูญเสียขาทั้งสองข้างระดับเหนือเข่าตามคำสั่งปลด',
      'นายบุญ บุญช่วย (บิดา)',
      'PAID',
      '2024-03-10',
      'พ.ต. ยุทธนา มีชัย'
    ],
    [
      'ทบ-กพ-67/003',
      '2024-06-20',
      '2024-06-18',
      '3700100445566',
      'จ.ส.อ.',
      'มนัส',
      'เพชรดี',
      '1988-12-01',
      'ชาย',
      'นายทหารประทวน',
      'เสมียนส่งกำลัง',
      'กรมยุทธศึกษาทหารบก (ยศ.ทบ.)',
      'NORMAL',
      'DECEASED',
      'ILLNESS',
      60000,
      'NO',
      'NOT_TESTED',
      'หมดสติเฉียบพลันขณะปฏิบัติหน้าที่เวรยามประจำหน่วย',
      'กล้ามเนื้อหัวใจขาดเลือดเฉียบพลัน (ตามใบมรณบัตร)',
      'นางวาสนา เพชรดี (มารดา)',
      'PAID',
      '2024-07-15',
      'พ.ท. วรพจน์ ศรีสุข'
    ],
    [
      'ทบ-กพ-67/022',
      '2024-09-05',
      '2024-09-02',
      '1400200334411',
      'ร.ท.',
      'กิตติศักดิ์',
      'รุ่งเรือง',
      '1991-07-25',
      'ชาย',
      'นายทหารสัญญาบัตร',
      'รอง ผบ.ร้อย',
      'มณฑลทหารบกที่ 11 (มทบ.11)',
      'NORMAL',
      'DECEASED',
      'ACCIDENT',
      60000,
      'YES',
      'NOT_EXCEEDED',
      'อุบัติเหตุทางรถยนต์ขณะเดินทางไปราชการตรวจพื้นที่',
      'กะโหลกศีรษะแตกและสมองชอกช้ำรุนแรง',
      'นางดวงพร รุ่งเรือง (ภรรยา)',
      'PAID',
      '2024-09-28',
      'พ.อ. ชนินทร์ ปฏิบัติการ'
    ],
    [
      'ทบ-กพ-68/005',
      '2025-01-15',
      '2025-01-10',
      '1100500123456',
      'ส.ท.',
      'ธวัชชัย',
      'แก้วเกิด',
      '1998-03-10',
      'ชาย',
      'นายทหารประทวน',
      'พลขับ',
      'กองพลทหารม้าที่ 2 รักษาพระองค์ (พล.ม.2 รอ.)',
      'HIGH_RISK',
      'DECEASED',
      'COMBAT',
      300000,
      'YES',
      'NOT_EXCEEDED',
      'ปฏิบัติหน้าที่คุ้มกันขบวนส่งกำลังบำรุงในพื้นที่เสี่ยงภัย',
      'ถูกยิงด้วยอาวุธปืนสงครามขณะปฏิบัติภารกิจ',
      'นางจันทร์ แก้วเกิด (มารดา)',
      'APPROVED',
      '',
      'ร.อ. ชัยวัฒน์ มั่นจิต'
    ]
  ];

  const wsClaims = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
  wsClaims['!cols'] = [
    { wch: 18 }, // trackingCode
    { wch: 15 }, // reportDate
    { wch: 15 }, // lossDate
    { wch: 20 }, // citizenId
    { wch: 12 }, // rank
    { wch: 16 }, // firstName
    { wch: 18 }, // lastName
    { wch: 15 }, // birthDate
    { wch: 10 }, // gender
    { wch: 20 }, // personnelType
    { wch: 20 }, // position
    { wch: 35 }, // unitName
    { wch: 16 }, // claimType
    { wch: 15 }, // lossType
    { wch: 16 }, // incidentType
    { wch: 14 }, // amount
    { wch: 12 }, // isDriver
    { wch: 18 }, // alcohol
    { wch: 45 }, // causeOfLoss
    { wch: 35 }, // lossSpecificCause
    { wch: 24 }, // heirName
    { wch: 16 }, // status
    { wch: 15 }, // paidAt
    { wch: 22 }  // reporterName
  ];
  XLSX.utils.book_append_sheet(wb, wsClaims, 'รายการคำร้องสินไหม');

  // Sheet 2: คำแนะนำและรหัสข้อมูล
  const guideHeaders = ['คอลัมน์', 'คำอธิบายและข้อกำหนด', 'ตัวเลือกและค่าที่ระบบรองรับ (Allowed Values)'];
  const guideRows = [
    ['เลขที่คำร้อง (Tracking Code)', 'เลขที่อ้างอิงของคำร้องตามระเบียบ ทบ. (เช่น ทบ-กพ-66/001) หากเว้นว่างไว้ ระบบจะออกเลขที่คำร้องให้อัตโนมัติตามปีที่รายงาน', 'ทบ-กพ-66/001, ทบ-กพ-67/012'],
    ['วันที่รายงาน (Report Date)', 'วันที่หน่วยรายงานหรือยื่นเรื่อง สามารถระบุเป็น YYYY-MM-DD หรือ DD/MM/YYYY (พ.ศ. หรือ ค.ศ.)', '2024-10-15 หรือ 15/10/2567'],
    ['วันที่สูญเสีย (Loss Date)', 'วันที่กำลังพลเสียชีวิตหรือได้รับบาดเจ็บทุพพลภาพ', '2024-10-10 หรือ 10/10/2567'],
    ['เลขประจำตัวประชาชน (Citizen ID)', 'เลขประจำตัวประชาชน 13 หลักของผู้สูญเสีย (ไม่ต้องมีขีด -)', '1100500123456'],
    ['ยศ (Rank)', 'ยศหรือคำนำหน้านามทางทหารของผู้สูญเสีย', 'พล.อ., พ.อ., พ.ท., พ.ต., ร.อ., ร.ท., ร.ต., จ.ส.อ., ส.อ., ส.ท., ส.ต., พลทหาร, อส.ทพ.'],
    ['ชื่อ (First Name)', 'ชื่อจริงของผู้สูญเสีย (ห้ามเว้นว่าง)', 'สมศักดิ์, ธีรพงษ์, มนัส'],
    ['นามสกุล (Last Name)', 'นามสกุลของผู้สูญเสีย (ห้ามเว้นว่าง)', 'ใจกล้า, บุญช่วย, เพชรดี'],
    ['วันเกิด (Birth Date)', 'วันเดือนปีเกิดของกำลังพลผู้สูญเสีย', '1995-04-12 หรือ 12/04/2538'],
    ['เพศ (Gender)', 'เพศของผู้สูญเสีย', 'ชาย หรือ หญิง'],
    ['ประเภทกำลังพล (Personnel Type)', 'กลุ่มประเภทของกำลังพล', 'นายทหารสัญญาบัตร, นายทหารประทวน, พลทหาร, อส.ทพ. (อาสาสมัครทหารพราน), ลูกจ้างประจำ, พนักงานราชการ'],
    ['ตำแหน่ง (Position)', 'ตำแหน่งราชการขณะปฏิบัติหน้าที่', 'ผบ.หมู่ ปืนเล็ก, พลขับ, เสมียน'],
    ['หน่วยสังกัด (Unit Name/Code)', 'ชื่อเต็ม, ชื่อย่อ หรือรหัสของหน่วยสังกัดตามโครงสร้าง ทบ. (ระบบจะค้นหาและเชื่อมโยงหน่วยให้อัตโนมัติ)', 'พล.ร.9, กองพลทหารราบที่ 9 (พล.ร.9), ทภ.1, มทบ.11, นสศ., ยศ.ทบ.'],
    ['ประเภทสินไหม (Claim Type)', 'ประเภทสิทธิสินไหมทดแทน:\n• HIGH_RISK = ปฏิบัติหน้าที่สำคัญ/เสี่ยงภัย (300,000 บาท)\n• NORMAL = ปฏิบัติหน้าที่ยามปกติ (60,000 บาท)', 'HIGH_RISK, NORMAL, 300000, 60000'],
    ['ลักษณะการสูญเสีย (Loss Type)', 'ลักษณะของการสูญเสีย:\n• DECEASED = เสียชีวิต\n• DISABLED = พิการทุพพลภาพ', 'DECEASED (เสียชีวิต), DISABLED (พิการทุพพลภาพ)'],
    ['ลักษณะการเกิดเหตุ (Incident Type)', 'ประเภทและพฤติการณ์การเกิดเหตุ:\n• COMBAT = การรบ / ปะทะ / ปฏิบัติหน้าที่เสี่ยงภัย\n• ACCIDENT = อุบัติเหตุ\n• ILLNESS = ป่วย / โรคประจำตัว\n• OTHER = อื่นๆ', 'COMBAT, ACCIDENT, ILLNESS, OTHER'],
    ['ยอดเงินสินไหม (Amount)', 'จำนวนเงินค่าสินไหมทดแทน (บาท)', '300000 หรือ 60000'],
    ['สถานะการขับขี่ (Is Driver)', 'กรณีเกิดอุบัติเหตุทางถนน:\n• YES = เป็นผู้ขับขี่\n• NO = ไม่ใช่ผู้ขับขี่ (ผู้โดยสาร/เดินเท้า)', 'YES, NO'],
    ['ผลตรวจแอลกอฮอล์ (Alcohol Test)', 'ผลการตรวจวัดระดับแอลกอฮอล์ในเลือด:\n• NOT_EXCEEDED = ไม่เกินเกณฑ์ (≤ 50 mg%)\n• EXCEEDED = เกินเกณฑ์ (> 50 mg%)\n• NOT_TESTED = ไม่ได้ตรวจ\n• PENDING = รอผลตรวจ', 'NOT_EXCEEDED, EXCEEDED, NOT_TESTED, PENDING'],
    ['สาเหตุการสูญเสีย / พฤติการณ์', 'รายละเอียดเหตุการณ์ตามแบบรายงาน กพ.4 หรือสำนวนการสอบสวน', 'ถูกซุ่มโจมตีขณะปฏิบัติหน้าที่ลาดตระเวน'],
    ['สาเหตุการเสียชีวิต / อวัยวะที่สูญเสีย', 'สาเหตุตามใบมรณบัตร (กรณีเสียชีวิต) หรืออวัยวะที่สูญเสีย (กรณีทุพพลภาพ)', 'บาดแผลจากสะเก็ดระเบิดรุนแรง, กล้ามเนื้อหัวใจขาดเลือด'],
    ['ชื่อทายาทผู้รับสิทธิ (Heir Name)', 'ชื่อ-นามสกุล และความสัมพันธ์ของทายาทผู้รับเงินสินไหม', 'นางสมใจ ใจกล้า (ภรรยา)'],
    ['สถานะคำร้อง (Status)', 'สถานะความคืบหน้าของคำร้อง:\n• PAID = จ่ายเงินสินไหมเรียบร้อยแล้ว (เหมาะกับข้อมูลประวัติย้อนหลัง)\n• APPROVED = ผู้บังคับบัญชา (จก.กพ.ทบ.) อนุมัติแล้ว\n• INSURANCE_PROCESSING = ส่งเรื่องให้ บ.ประกันภัย กำลังดำเนินการ\n• UNDER_REVIEW = กสพ.กพ.ทบ. ตรวจสอบเอกสาร\n• SUBMITTED = ยื่นเรื่องใหม่ในระบบแล้ว\n• REJECTED = ไม่อนุมัติ\n• DRAFT = บันทึกแบบร่าง', 'PAID, APPROVED, INSURANCE_PROCESSING, UNDER_REVIEW, SUBMITTED, REJECTED, DRAFT'],
    ['วันที่จ่ายเงิน (Paid Date)', 'วันที่โอนเงินสินไหมเข้าบัญชีทายาท (สำหรับสถานะ PAID)', '2023-12-05 หรือ 05/12/2566'],
    ['ผู้เสนอเรื่อง (Reporter Name)', 'ชื่อและสังกัดของเจ้าหน้าที่หน่วยผู้เสนอเรื่อง', 'ร.อ. สมหมาย กล้าหาญ (พล.ร.9)']
  ];

  const wsGuide = XLSX.utils.aoa_to_sheet([guideHeaders, ...guideRows]);
  wsGuide['!cols'] = [
    { wch: 28 },
    { wch: 55 },
    { wch: 45 }
  ];
  XLSX.utils.book_append_sheet(wb, wsGuide, 'คำแนะนำและรหัสข้อมูล');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * อ่านไฟล์ Excel (Buffer) และแปลงเป็นรายการคำร้องสินไหม
 */
export function parseClaimsFromExcel(buffer, { allUnits = [] } = {}) {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
      return { success: false, message: 'ไฟล์ Excel ไม่ถูกต้องหรือไม่มีชีทข้อมูล', claims: [], errors: [] };
    }

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });

    if (!rawRows || rawRows.length === 0) {
      return { success: false, message: 'ไม่พบข้อมูลในชีทแรกของไฟล์ Excel', claims: [], errors: [] };
    }

    const headerMap = {};
    const firstRow = rawRows[0];
    for (const key of Object.keys(firstRow)) {
      const normKey = normalizeHeader(key);
      for (const [field, aliases] of Object.entries(CLAIM_COLUMN_ALIASES)) {
        if (aliases.some((alias) => normalizeHeader(alias) === normKey)) {
          headerMap[field] = key;
          break;
        }
      }
    }

    const parsedClaims = [];
    const errors = [];
    const warnings = [];

    rawRows.forEach((row, idx) => {
      const rowNum = idx + 2;
      const getValue = (field) => {
        const colKey = headerMap[field];
        if (!colKey) return '';
        const v = row[colKey];
        return v != null ? String(v).trim() : '';
      };

      const casualtyFirstName = getValue('casualtyFirstName');
      const casualtyLastName = getValue('casualtyLastName');

      if (!casualtyFirstName && !casualtyLastName && !getValue('trackingCode')) {
        return;
      }

      if (!casualtyFirstName || !casualtyLastName) {
        errors.push({ row: rowNum, message: 'กรุณาระบุชื่อและนามสกุลของผู้สูญเสีย' });
        return;
      }

      const rawCitizenId = getValue('casualtyCitizenId');
      const cleanCitizenId = rawCitizenId ? rawCitizenId.replace(/\D/g, '') : '';
      if (cleanCitizenId && cleanCitizenId.length !== 13) {
        warnings.push({ row: rowNum, message: `เลขบัตร ปชช. "${rawCitizenId}" มี ${cleanCitizenId.length} หลัก (ควรมี 13 หลัก)` });
      }

      const reportDate = parseExcelDateValue(getValue('reportDate')) || new Date().toISOString().slice(0, 10);
      const lossDate = parseExcelDateValue(getValue('lossDate')) || reportDate;
      const casualtyBirthDate = parseExcelDateValue(getValue('casualtyBirthDate')) || '1995-01-01';
      const paidAt = parseExcelDateValue(getValue('paidAt'));

      const rawRank = getValue('casualtyRank') || 'ส.อ.';
      const personnelType = getValue('personnelType') || getPersonnelTypeFromRank(rawRank) || 'นายทหารประทวน';

      const rawType = getValue('claimType');
      const rawAmt = getValue('compensationAmount');
      const { claimType, compensationAmount } = normalizeClaimTypeAndAmount(rawType, rawAmt);

      const lossType = normalizeLossType(getValue('lossType'));
      const incidentType = normalizeIncidentType(getValue('incidentType'));
      const status = normalizeClaimStatus(getValue('status'), paidAt);

      const rawUnitName = getValue('unitName');
      const rawUnitId = getValue('unitId');
      const resolvedUnit = resolveClaimUnit(rawUnitName, rawUnitId, allUnits);

      const rawIsDriver = getValue('isDriver');
      const isDriver = rawIsDriver ? (rawIsDriver.toLowerCase().includes('yes') || rawIsDriver.includes('ใช่') || rawIsDriver.includes('ผู้ขับขี่') ? 'YES' : 'NO') : null;

      const rawAlcohol = getValue('alcoholTestResult');
      let alcoholTestResult = null;
      if (rawAlcohol) {
        if (rawAlcohol.includes('เกิน') && !rawAlcohol.includes('ไม่เกิน')) alcoholTestResult = 'EXCEEDED';
        else if (rawAlcohol.includes('ไม่เกิน') || rawAlcohol.includes('NOT_EXCEEDED')) alcoholTestResult = 'NOT_EXCEEDED';
        else if (rawAlcohol.includes('รอ') || rawAlcohol.includes('PENDING')) alcoholTestResult = 'PENDING';
        else alcoholTestResult = 'NOT_TESTED';
      }

      let trackingCode = getValue('trackingCode');
      if (!trackingCode) {
        const fyYear = (new Date(reportDate).getFullYear() + 543).toString().slice(-2);
        trackingCode = `ทบ-กพ-${fyYear}/${String(idx + 1).padStart(3, '0')}`;
      }

      const claimObj = {
        trackingCode,
        reportDate,
        lossDate,
        casualtyCitizenId: cleanCitizenId || rawCitizenId,
        casualtyRank: rawRank,
        casualtyFirstName,
        casualtyLastName,
        casualtyBirthDate,
        casualtyGender: getValue('casualtyGender') || 'ชาย',
        casualtyPosition: getValue('casualtyPosition') || '',
        personnelType,
        unitId: resolvedUnit.unitId,
        unitName: resolvedUnit.unitName,
        claimType,
        lossType,
        incidentType,
        compensationAmount,
        isDriver,
        alcoholTestResult,
        causeOfLoss: getValue('causeOfLoss') || `รายงานการสูญเสียกำลังพลในการปฏิบัติหน้าที่ (${resolvedUnit.unitName})`,
        lossSpecificCause: getValue('lossSpecificCause') || (lossType === 'DECEASED' ? 'เสียชีวิตเนื่องจากการปฏิบัติหน้าที่' : 'สูญเสียสมรรถภาพทางกาย'),
        deathCertificateCause: lossType === 'DECEASED' ? (getValue('lossSpecificCause') || 'เสียชีวิตเนื่องจากการปฏิบัติหน้าที่') : '',
        disabledOrganDetail: lossType === 'DISABLED' ? (getValue('lossSpecificCause') || 'สูญเสียสมรรถภาพทางกาย') : '',
        heirName: getValue('heirName') || 'ทายาทผู้มีสิทธิตามกฎหมาย',
        status,
        paidAt: paidAt || (status === 'PAID' ? reportDate : null),
        reporterName: getValue('reporterName') || 'ระบบนำเข้าประวัติคำร้องเดิม'
      };

      parsedClaims.push(claimObj);
    });

    if (errors.length > 0 && parsedClaims.length === 0) {
      return {
        success: false,
        message: `พบข้อผิดพลาด ${errors.length} จุด ไม่สามารถอ่านข้อมูลคำร้องได้`,
        claims: [],
        errors,
        warnings,
        totalRows: rawRows.length
      };
    }

    return {
      success: true,
      totalRows: rawRows.length,
      validCount: parsedClaims.length,
      errorCount: errors.length,
      warningCount: warnings.length,
      claims: parsedClaims,
      errors,
      warnings
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการอ่านไฟล์ Excel คำร้องสินไหม',
      claims: [],
      errors: [{ row: 0, message: error.message }],
      warnings: [],
      totalRows: 0
    };
  }
}

/**
 * ส่งออกข้อมูลรายการคำร้องสินไหมทั้งหมดเป็นไฟล์ Excel (.xlsx)
 */
export function exportClaimsToExcel(claims = [], { allUnits = [] } = {}) {
  const wb = XLSX.utils.book_new();

  const headers = [
    'เลขที่คำร้อง (Tracking Code)',
    'วันที่รายงาน (Report Date)',
    'วันที่สูญเสีย (Loss Date)',
    'รอบปีกรมธรรม์ (Policy Year)',
    'รอบปีงบประมาณ (Fiscal Year)',
    'เลขประจำตัวประชาชน 13 หลัก',
    'ยศ/คำนำหน้า',
    'ชื่อ',
    'นามสกุล',
    'วันเกิด',
    'เพศ',
    'ประเภทกำลังพล',
    'ตำแหน่งราชการ',
    'รหัสหน่วย',
    'หน่วยสังกัด (Unit Name)',
    'ประเภทสินไหม',
    'ยอดเงินสินไหม (บาท)',
    'ลักษณะการสูญเสีย',
    'ลักษณะเหตุการณ์',
    'สถานะการขับขี่',
    'ผลตรวจแอลกอฮอล์',
    'สาเหตุการสูญเสีย / พฤติการณ์เหตุการณ์',
    'สาเหตุการเสียชีวิต / อวัยวะที่สูญเสีย',
    'ชื่อทายาทผู้รับสิทธิ',
    'สถานะปัจจุบัน',
    'วันที่จ่ายเงินสินไหม',
    'ผู้เสนอเรื่อง',
    'วันที่สร้างคำร้องในระบบ'
  ];

  const rows = claims.map((c) => {
    const policyYear = getPolicyYear(c.reportDate || c.createdAt);
    const fiscalYear = getFiscalYear(c.reportDate || c.createdAt);
    const claimTypeLabel = c.claimType === 'HIGH_RISK' ? 'หน้าที่สำคัญ/เสี่ยงภัย (300,000 บ.)' : 'ยามปกติ (60,000 บ.)';
    const lossTypeLabel = c.lossType === 'DISABLED' ? 'พิการทุพพลภาพ' : 'เสียชีวิต';
    const incidentLabel = c.incidentType === 'COMBAT' ? 'การรบ/เสี่ยงภัย' : c.incidentType === 'ACCIDENT' ? 'อุบัติเหตุ' : c.incidentType === 'ILLNESS' ? 'ป่วย/โรคประจำตัว' : (c.incidentType || 'อื่นๆ');
    const isDriverLabel = c.isDriver === 'YES' ? 'เป็นผู้ขับขี่' : c.isDriver === 'NO' ? 'ไม่ใช่ผู้ขับขี่' : '-';
    const alcoholLabel = c.alcoholTestResult === 'NOT_EXCEEDED' ? 'ไม่เกินกำหนด (≤ 50 mg%)' : c.alcoholTestResult === 'EXCEEDED' ? 'เกินกำหนด (> 50 mg%)' : c.alcoholTestResult === 'PENDING' ? 'รอผลตรวจ' : 'ไม่ได้ตรวจ';

    return [
      c.trackingCode || c.id,
      c.reportDate ? `${formatThaiDate(c.reportDate)} (${c.reportDate})` : '-',
      c.lossDate ? `${formatThaiDate(c.lossDate)} (${c.lossDate})` : '-',
      policyYear ? `ปีกรมธรรม์ ${policyYear}` : '-',
      fiscalYear ? `ปีงบประมาณ ${fiscalYear}` : '-',
      c.casualtyCitizenId ? formatCitizenId(c.casualtyCitizenId) : '-',
      c.casualtyRank || '-',
      c.casualtyFirstName || '-',
      c.casualtyLastName || '-',
      c.casualtyBirthDate ? `${formatThaiDate(c.casualtyBirthDate)} (${c.casualtyBirthDate})` : '-',
      c.casualtyGender || 'ชาย',
      c.personnelType || '-',
      c.casualtyPosition || '-',
      c.unitId || '-',
      c.unitName || '-',
      claimTypeLabel,
      Number(c.compensationAmount || (c.claimType === 'HIGH_RISK' ? 300000 : 60000)),
      lossTypeLabel,
      incidentLabel,
      isDriverLabel,
      alcoholLabel,
      c.causeOfLoss || '-',
      c.lossSpecificCause || c.deathCertificateCause || c.disabledOrganDetail || '-',
      c.heirName || '-',
      c.status || '-',
      c.paidAt ? `${formatThaiDate(c.paidAt)} (${c.paidAt.slice(0, 10)})` : '-',
      c.reporterName || '-',
      c.createdAt ? formatThaiDate(c.createdAt) : '-'
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = [
    { wch: 18 }, // trackingCode
    { wch: 22 }, // reportDate
    { wch: 22 }, // lossDate
    { wch: 16 }, // policyYear
    { wch: 16 }, // fiscalYear
    { wch: 20 }, // citizenId
    { wch: 12 }, // rank
    { wch: 16 }, // firstName
    { wch: 18 }, // lastName
    { wch: 20 }, // birthDate
    { wch: 8 },  // gender
    { wch: 22 }, // personnelType
    { wch: 20 }, // position
    { wch: 16 }, // unitId
    { wch: 35 }, // unitName
    { wch: 32 }, // claimType
    { wch: 18 }, // compensationAmount
    { wch: 16 }, // lossType
    { wch: 18 }, // incidentType
    { wch: 15 }, // isDriver
    { wch: 24 }, // alcohol
    { wch: 45 }, // causeOfLoss
    { wch: 35 }, // lossSpecificCause
    { wch: 24 }, // heirName
    { wch: 18 }, // status
    { wch: 22 }, // paidAt
    { wch: 24 }, // reporterName
    { wch: 22 }  // createdAt
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'รายการคำร้องสินไหม ทบ.');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}
