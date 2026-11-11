// deploy/postgres/seed-from-json.js
// อ่านข้อมูลจาก data-store.json และแปลงเป็น SQL INSERT ที่ตรงกับ Schema ล่าสุดทั้ง 14 ตาราง
// หมายเหตุ: ไม่เขียนทับรหัสผ่านหรือคำร้องที่มีอยู่แล้วในฐานข้อมูล (ON CONFLICT DO NOTHING)
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../../data-store.json');
const outputPath = path.join(__dirname, 'seed-data.sql');

if (!fs.existsSync(jsonPath)) {
  console.error('ไม่พบไฟล์ data-store.json');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

function escapeJson(obj, fallback = '[]') {
  if (obj === null || obj === undefined) return `'${fallback}'::jsonb`;
  return `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;
}

function escapeNum(v, fallback = 0) {
  if (v === null || v === undefined || v === '') return String(fallback);
  const n = Number(v);
  return Number.isFinite(n) ? String(n) : String(fallback);
}

let sql = `-- ข้อมูลเริ่มต้นสำหรับระบบสินไหม ทบ. (Seed Data 14 ตาราง จาก data-store.json)
BEGIN;

`;

// 1. Military Units
if (Array.isArray(data.units)) {
  sql += `-- 1. โครงสร้างหน่วยทหาร\n`;
  for (const u of data.units) {
    sql += `INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES (${escapeSql(u.id)}, ${escapeSql(u.name)}, ${escapeSql(u.shortName || u.short_name)}, ${escapeSql(u.code)}, ${u.level !== undefined ? escapeNum(u.level) : 'NULL'}, ${escapeSql(u.parentId || u.parent_id)}, ${escapeSql(u.region)}, ${escapeSql(u.status || 'ACTIVE')})
ON CONFLICT (id) DO NOTHING;\n`;
  }
  sql += `INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('INSURANCE_CO', 'บริษัท ทิพยประกันภัย จำกัด (มหาชน)', 'ทิพยประกันภัย', 'INS', 1, NULL, 'ส่วนกลาง', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;\n\n`;
}

// 2. Users (never overwrite passwords/roles already in production)
if (Array.isArray(data.users)) {
  sql += `-- 2. ผู้ใช้งานระบบ\n`;
  for (const u of data.users) {
    sql += `INSERT INTO users (id, citizen_id, rank, first_name, last_name, position, unit_id, unit_name, phone, email, password, role, requested_role, status, is_active, created_at)
VALUES (${escapeSql(u.id)}, ${escapeSql(u.citizenId)}, ${escapeSql(u.rank)}, ${escapeSql(u.firstName)}, ${escapeSql(u.lastName)}, ${escapeSql(u.position)}, ${escapeSql(u.unitId)}, ${escapeSql(u.unitName)}, ${escapeSql(u.phone)}, ${escapeSql(u.email)}, ${escapeSql(u.password)}, ${escapeSql(u.role)}, ${escapeSql(u.requestedRole || u.role)}, ${escapeSql(u.status || 'APPROVED')}, ${u.isActive !== false ? 'TRUE' : 'FALSE'}, ${escapeSql(u.createdAt || new Date().toISOString())})
ON CONFLICT (id) DO NOTHING;\n`;
  }
  sql += '\n';
}

// 3. Claims
if (Array.isArray(data.claims)) {
  sql += `-- 3. รายการคำร้องสินไหม\n`;
  for (const c of data.claims) {
    sql += `INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES (${escapeSql(c.id)}, ${escapeSql(c.trackingCode)}, ${escapeSql(c.reporterId)}, ${escapeSql(c.reporterName)}, ${escapeSql(c.unitId)}, ${escapeSql(c.unitName)}, ${escapeSql(c.status)}, ${escapeNum(c.slaTargetDays, 30)}, ${escapeSql(c.reportDate)}, ${escapeSql(c.lossDate)}, ${escapeSql(c.casualtyCitizenId)}, ${escapeSql(c.casualtyRank)}, ${escapeSql(c.casualtyFirstName)}, ${escapeSql(c.casualtyLastName)}, ${escapeSql(c.casualtyBirthDate)}, ${escapeSql(c.casualtyGender)}, ${escapeSql(c.casualtyPosition)}, ${escapeSql(c.personnelType)}, ${escapeSql(c.lossType)}, ${escapeSql(c.claimType)}, ${escapeSql(c.incidentType)}, ${escapeSql(c.isDriver)}, ${escapeSql(c.alcoholTestResult)}, ${escapeNum(c.compensationAmount, 0)}, ${escapeSql(c.lossSpecificCause)}, ${escapeSql(c.deathCertificateCause)}, ${escapeSql(c.disabledOrganDetail)}, ${escapeSql(c.causeOfLoss)}, ${c.locationOfLoss ? escapeJson(c.locationOfLoss, '{}') : 'NULL'}, ${escapeSql(c.heirName)}, ${escapeJson(c.documents || [])}, ${escapeJson(c.timeline || [])}, ${c.approvalDocument ? escapeJson(c.approvalDocument, '{}') : 'NULL'}, ${c.transferDetails ? escapeJson(c.transferDetails, '{}') : 'NULL'}, ${escapeSql(c.delayReason)}, ${escapeSql(c.delayAttachmentUrl)}, ${escapeSql(c.paidAt)}, ${escapeSql(c.submittedAt)}, ${escapeSql(c.createdAt || new Date().toISOString())})
ON CONFLICT (id) DO NOTHING;\n`;
  }
  sql += '\n';
}

// 4. Knowledge Exams
if (Array.isArray(data.knowledgeExams)) {
  sql += `-- 4. ชุดแบบทดสอบความรู้\n`;
  for (const e of data.knowledgeExams) {
    sql += `INSERT INTO knowledge_exams (id, title, description, category, passing_score, time_limit_minutes, question_count, randomize_questions, randomize_options, question_source, is_active, instructions, question_ids, created_at)
VALUES (${escapeSql(e.id)}, ${escapeSql(e.title)}, ${escapeSql(e.description)}, ${escapeSql(e.category || 'ทั่วไป')}, ${escapeNum(e.passingScore, 80)}, ${escapeNum(e.timeLimitMinutes, 30)}, ${escapeNum(e.questionCount, 10)}, ${e.randomizeQuestions !== false ? 'TRUE' : 'FALSE'}, ${e.randomizeOptions !== false ? 'TRUE' : 'FALSE'}, ${escapeSql(e.questionSource || 'combined')}, ${e.isActive !== false ? 'TRUE' : 'FALSE'}, ${escapeSql(e.instructions)}, ${escapeJson(e.questionIds || [])}, ${escapeSql(e.createdAt || new Date().toISOString())})
ON CONFLICT (id) DO NOTHING;\n`;
  }
  sql += '\n';
}

// 5. Knowledge Questions
if (Array.isArray(data.knowledgeQuestions)) {
  sql += `-- 5. ข้อสอบประจำชุด\n`;
  for (const q of data.knowledgeQuestions) {
    sql += `INSERT INTO knowledge_questions (id, exam_id, question_text, options, points, order_index, explanation)
VALUES (${escapeSql(q.id)}, ${escapeSql(q.examId)}, ${escapeSql(q.questionText)}, ${escapeJson(q.options || [])}, ${escapeNum(q.points, 10)}, ${escapeNum(q.orderIndex, 0)}, ${escapeSql(q.explanation)})
ON CONFLICT (id) DO NOTHING;\n`;
  }
  sql += '\n';
}

// 6. Question Bank
if (Array.isArray(data.questionBank)) {
  sql += `-- 6. ธนาคารคำถามกลาง\n`;
  for (const qb of data.questionBank) {
    sql += `INSERT INTO question_bank (id, question_text, options, points, category, difficulty, tags, exam_id, source, explanation)
VALUES (${escapeSql(qb.id)}, ${escapeSql(qb.questionText)}, ${escapeJson(qb.options || [])}, ${escapeNum(qb.points, 10)}, ${escapeSql(qb.category || 'ทั่วไป')}, ${escapeSql(qb.difficulty || 'medium')}, ${escapeJson(qb.tags || [])}, ${escapeSql(qb.examId)}, ${escapeSql(qb.source || 'manual')}, ${escapeSql(qb.explanation)})
ON CONFLICT (id) DO NOTHING;\n`;
  }
  sql += '\n';
}

// 7. Manuals
if (Array.isArray(data.manuals)) {
  sql += `-- 7. คู่มือและเอกสารดาวน์โหลด\n`;
  for (const m of data.manuals) {
    sql += `INSERT INTO manuals (id, title, description, category, format, file_name, file_path, file_size, has_attachment, uploaded_by, created_at)
VALUES (${escapeSql(m.id)}, ${escapeSql(m.title)}, ${escapeSql(m.desc || m.description)}, ${escapeSql(m.category)}, ${escapeSql(m.format || 'PDF')}, ${escapeSql(m.fileName)}, ${escapeSql(m.fileUrl || m.filePath)}, ${escapeSql(m.size || m.fileSize)}, ${m.hasAttachment ? 'TRUE' : 'FALSE'}, ${escapeSql(m.uploadedBy)}, ${escapeSql(m.createdAt || new Date().toISOString())})
ON CONFLICT (id) DO NOTHING;\n`;
  }
  sql += '\n';
}

// 8. Videos
if (Array.isArray(data.videos)) {
  sql += `-- 8. วิดีโอสอนการใช้งาน\n`;
  for (const v of data.videos) {
    sql += `INSERT INTO videos (id, title, role, url, duration, category, description, steps, uploaded_by, created_at)
VALUES (${escapeSql(v.id)}, ${escapeSql(v.title)}, ${escapeSql(v.role)}, ${escapeSql(v.videoUrl || v.url || '')}, ${escapeSql(v.duration)}, ${escapeSql(v.category)}, ${escapeSql(v.description)}, ${escapeJson(v.steps || [])}, ${escapeSql(v.uploadedBy)}, ${escapeSql(v.createdAt || new Date().toISOString())})
ON CONFLICT (id) DO NOTHING;\n`;
  }
  sql += '\n';
}

// 9. Exam Settings
if (data.examSettings) {
  sql += `-- 9. การตั้งค่าห้วงการสอบ\n`;
  sql += `INSERT INTO system_settings (key, value) VALUES ('exam_settings', ${escapeJson(data.examSettings, '{}')}) ON CONFLICT (key) DO NOTHING;\n\n`;
}

sql += `COMMIT;\n`;

fs.writeFileSync(outputPath, sql, 'utf8');
console.log('สร้างไฟล์ seed-data.sql สำเร็จเรียบร้อย:', outputPath);
