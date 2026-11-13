// lib/excel.js
// Utility สำหรับอ่านไฟล์ Excel (.xlsx) และแปลงแถวข้อมูลเป็นข้อมูลคำถามแบบทดสอบ
// ใช้งานร่วมกับ library xlsx (https://cdn.sheetjs.com/)
import * as XLSX from 'xlsx';

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
  level: ['ระดับ', 'level', 'ชั้น', 'ระดับโครงสร้าง', 'ลำดับชั้น', 'ระดับ (1=ทบ., 2=กองพล/มทบ., 3=กรม/กองพัน)', 'ระดับ (level)'],
  code: ['รหัส', 'code', 'รหัสย่อ', 'อักษรย่อ', 'unit_code', 'รหัส/ชื่อย่อหน่วย', 'รหัส/ชื่อย่อหน่วย (code)', 'รหัส/อักษรย่อหน่วย (code)'],
  shortName: ['ชื่อย่อ', 'shortname', 'short_name', 'ชื่อย่อหน่วย', 'ชื่อย่อหน่วย (short name)'],
  name: ['ชื่อหน่วย', 'name', 'fullname', 'full_name', 'ชื่อเต็ม', 'ชื่อเต็มหน่วย', 'ชื่อเต็มหน่วย (full name)'],
  parentId: ['รหัสหน่วยต้นสังกัด', 'parentid', 'parent_id', 'หน่วยสังกัด', 'หน่วยแม่', 'สังกัดหน่วย', 'หน่วยบังคับบัญชา', 'รหัสหน่วยต้นสังกัด (parent id)'],
  type: ['ประเภทหน่วย', 'type', 'unit_type', 'ประเภท', 'ประเภทหน่วย (type)'],
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
    'รหัส/ชื่อย่อหน่วย (Code)',
    'ชื่อย่อหน่วย (Short Name)',
    'ชื่อเต็มหน่วย (Full Name)',
    'รหัสหน่วยต้นสังกัด (Parent ID)',
    'ประเภทหน่วย (Type)',
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
      'ทภ.1',
      'ทภ.1',
      'กองทัพภาคที่ 1 (ทภ.1)',
      '',
      'ARMY_REGION',
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
      'นสศ.',
      'นสศ.',
      'หน่วยบัญชาการสงครามพิเศษ (นสศ.)',
      '',
      'SPECIAL',
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
      'พล.ร.9',
      'พล.ร.9',
      'กองพลทหารราบที่ 9 (พล.ร.9)',
      '1st_ARMY',
      'DIVISION',
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
      'มทบ.11',
      'มทบ.11',
      'มณฑลทหารบกที่ 11 (มทบ.11)',
      '1st_ARMY',
      'DIVISION',
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
      'ร.19 พัน.1',
      'ร.19 พัน.1',
      'กองพันทหารราบที่ 1 กรมทหารราบที่ 19 (ร.19 พัน.1)',
      '9th_INF_DIV',
      'REGULAR',
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
      'ม.พัน.19 พล.ร.9',
      'ม.พัน.19',
      'กองพันทหารม้าที่ 19 กองพลทหารราบที่ 9',
      '9th_INF_DIV',
      'REGULAR',
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
    { wch: 16 }, // code
    { wch: 18 }, // shortName
    { wch: 42 }, // name
    { wch: 20 }, // parentId
    { wch: 16 }, // type
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
    ['รหัส/ชื่อย่อหน่วย (Code)', 'อักษรย่อทางการทหารของหน่วย', 'ทภ.1, พล.ร.9, ร.19 พัน.1'],
    ['ชื่อย่อหน่วย (Short Name)', 'ชื่อย่อที่ใช้แสดงผลในตารางหรือตัวเลือก', 'พล.ร.9, มทบ.11, ร.19 พัน.1'],
    ['ชื่อเต็มหน่วย (Full Name)', 'ชื่อเต็มทางการของหน่วย (บังคับต้องระบุ)', 'กองพลทหารราบที่ 9 (พล.ร.9)'],
    ['รหัสหน่วยต้นสังกัด (Parent ID)', 'รหัสหน่วยที่สังกัดอยู่ (Parent ID)\n• ระดับ 1: ไม่ต้องระบุ (ว่างไว้)\n• ระดับ 2: ต้องระบุ ID ของหน่วยระดับ 1 ที่สังกัด\n• ระดับ 3: ต้องระบุ ID ของหน่วยระดับ 2 ที่สังกัด', '1st_ARMY, 9th_INF_DIV (หรือระบุชื่อย่อหน่วย เช่น ทภ.1 ระบบจะแปลงให้อัตโนมัติ)'],
    ['ประเภทหน่วย (Type)', 'หมวดหมู่หน่วย เช่น REGULAR (รบ/ช่วยรบ), ARMY_REGION (กองทัพภาค), DIVISION (กองพล/มทบ.), SPECIAL (รบพิเศษ), LOGISTICS (ส่งกำลังบำรุง), TRAINING (ฝึก/ศึกษา)', 'REGULAR, DIVISION, SPECIAL'],
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
    'ประเภทหน่วย (Type)',
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

    return [
      u.id || '',
      u.level ?? '',
      levelName,
      u.code || u.shortName || '',
      u.shortName || u.code || '',
      u.name || '',
      u.parentId || '',
      parentName,
      u.type || 'REGULAR',
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
    { wch: 16 }, // Type
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

      const unitObj = {
        id,
        level,
        levelName: getUnitLevelName(level),
        code: code || shortName,
        shortName,
        name,
        parentId: parentId || null,
        type: String(row[headerMap.type] || (level === 1 ? 'ARMY_REGION' : level === 2 ? 'DIVISION' : 'REGULAR')).trim(),
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
