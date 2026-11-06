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
