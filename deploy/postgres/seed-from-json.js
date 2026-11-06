// deploy/postgres/seed-from-json.js
// อ่านข้อมูลจาก data-store.json และแปลงเป็น SQL INSERT สำหรับนำเข้า PostgreSQL
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

function escapeJson(obj) {
  if (obj === null || obj === undefined) return "'[]'::jsonb";
  return `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;
}

let sql = `-- ข้อมูลเริ่มต้นสำหรับระบบสินไหม ทบ. (Seed Data จาก data-store.json)
BEGIN;

`;

// 1. Military Units
if (Array.isArray(data.units)) {
  sql += `-- 1. โครงสร้างหน่วยทหาร\n`;
  for (const u of data.units) {
    sql += `INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES (${escapeSql(u.id)}, ${escapeSql(u.name)}, ${escapeSql(u.shortName || u.short_name)}, ${escapeSql(u.code)}, ${escapeSql(u.parentId || u.parent_id)}, ${escapeSql(u.region)})
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;\n`;
  }
  sql += '\n';
}

// 2. Users
if (Array.isArray(data.users)) {
  sql += `-- 2. ผู้ใช้งานระบบ\n`;
  for (const u of data.users) {
    sql += `INSERT INTO users (id, citizen_id, rank, first_name, last_name, position, unit_id, unit_name, phone, email, password, role, status, is_active, created_at)
VALUES (${escapeSql(u.id)}, ${escapeSql(u.citizenId)}, ${escapeSql(u.rank)}, ${escapeSql(u.firstName)}, ${escapeSql(u.lastName)}, ${escapeSql(u.position)}, ${escapeSql(u.unitId)}, ${escapeSql(u.unitName)}, ${escapeSql(u.phone)}, ${escapeSql(u.email)}, ${escapeSql(u.password)}, ${escapeSql(u.role)}, ${escapeSql(u.status || 'APPROVED')}, ${u.isActive !== false ? 'TRUE' : 'FALSE'}, ${escapeSql(u.createdAt || new Date().toISOString())})
ON CONFLICT (id) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role, status = EXCLUDED.status;\n`;
  }
  sql += '\n';
}

// 3. Claims
if (Array.isArray(data.claims)) {
  sql += `-- 3. รายการคำร้องสินไหม\n`;
  for (const c of data.claims) {
    sql += `INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, incident_date, compensation_amount, documents, history, created_at)
VALUES (${escapeSql(c.id)}, ${escapeSql(c.trackingCode)}, ${escapeSql(c.reporterId)}, ${escapeSql(c.reporterName)}, ${escapeSql(c.unitId)}, ${escapeSql(c.unitName)}, ${escapeSql(c.status)}, ${Number(c.slaTargetDays) || 30}, ${escapeSql(c.casualtyCitizenId)}, ${escapeSql(c.casualtyRank)}, ${escapeSql(c.casualtyFirstName)}, ${escapeSql(c.casualtyLastName)}, ${c.incidentDate ? escapeSql(c.incidentDate) : 'NULL'}, ${Number(c.compensationAmount) || 0}, ${escapeJson(c.documents || [])}, ${escapeJson(c.history || [])}, ${escapeSql(c.createdAt || new Date().toISOString())})
ON CONFLICT (id) DO NOTHING;\n`;
  }
  sql += '\n';
}

// 4. Knowledge Exams
if (Array.isArray(data.knowledgeExams)) {
  sql += `-- 4. ชุดแบบทดสอบความรู้\n`;
  for (const e of data.knowledgeExams) {
    sql += `INSERT INTO knowledge_exams (id, title, description, category, passing_score, time_limit_minutes, question_count, randomize_questions, randomize_options, question_source, is_active, instructions, created_at)
VALUES (${escapeSql(e.id)}, ${escapeSql(e.title)}, ${escapeSql(e.description)}, ${escapeSql(e.category || 'ทั่วไป')}, ${Number(e.passingScore) || 80}, ${Number(e.timeLimitMinutes) || 30}, ${Number(e.questionCount) || 10}, ${e.randomizeQuestions !== false ? 'TRUE' : 'FALSE'}, ${e.randomizeOptions !== false ? 'TRUE' : 'FALSE'}, ${escapeSql(e.questionSource || 'combined')}, ${e.isActive !== false ? 'TRUE' : 'FALSE'}, ${escapeSql(e.instructions)}, ${escapeSql(e.createdAt || new Date().toISOString())})
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, passing_score = EXCLUDED.passing_score;\n`;
  }
  sql += '\n';
}

// 5. Knowledge Questions
if (Array.isArray(data.knowledgeQuestions)) {
  sql += `-- 5. ข้อสอบประจำชุด\n`;
  for (const q of data.knowledgeQuestions) {
    sql += `INSERT INTO knowledge_questions (id, exam_id, question_text, options, points, order_index, explanation)
VALUES (${escapeSql(q.id)}, ${escapeSql(q.examId)}, ${escapeSql(q.questionText)}, ${escapeJson(q.options || [])}, ${Number(q.points) || 10}, ${Number(q.orderIndex) || 0}, ${escapeSql(q.explanation)})
ON CONFLICT (id) DO NOTHING;\n`;
  }
  sql += '\n';
}

// 6. Question Bank
if (Array.isArray(data.questionBank)) {
  sql += `-- 6. ธนาคารคำถามกลาง\n`;
  for (const qb of data.questionBank) {
    sql += `INSERT INTO question_bank (id, question_text, options, points, category, difficulty, tags, exam_id, source, explanation)
VALUES (${escapeSql(qb.id)}, ${escapeSql(qb.questionText)}, ${escapeJson(qb.options || [])}, ${Number(qb.points) || 10}, ${escapeSql(qb.category || 'ทั่วไป')}, ${escapeSql(qb.difficulty || 'medium')}, ${escapeJson(qb.tags || [])}, ${escapeSql(qb.examId)}, ${escapeSql(qb.source || 'manual')}, ${escapeSql(qb.explanation)})
ON CONFLICT (id) DO NOTHING;\n`;
  }
  sql += '\n';
}

// 7. Exam Attempts
if (Array.isArray(data.examAttempts)) {
  sql += `-- 7. ประวัติการสอบ\n`;
  for (const att of data.examAttempts) {
    sql += `INSERT INTO exam_attempts (id, user_id, user_name, user_role, unit_name, exam_id, exam_title, score, percentage, passed, total_questions, correct_answers, answers, completed_at, time_spent_seconds)
VALUES (${escapeSql(att.id)}, ${escapeSql(att.userId)}, ${escapeSql(att.userName)}, ${escapeSql(att.userRole)}, ${escapeSql(att.unitName)}, ${escapeSql(att.examId)}, ${escapeSql(att.examTitle)}, ${Number(att.score) || 0}, ${Number(att.percentage) || 0}, ${att.passed ? 'TRUE' : 'FALSE'}, ${Number(att.totalQuestions) || 10}, ${Number(att.correctAnswers) || 0}, ${escapeJson(att.answers || [])}, ${escapeSql(att.completedAt || new Date().toISOString())}, ${Number(att.timeSpentSeconds) || 0})
ON CONFLICT (id) DO NOTHING;\n`;
  }
  sql += '\n';
}

// 8. Activity Logs
if (Array.isArray(data.activityLogs)) {
  sql += `-- 8. ประวัติการใช้งาน (Audit Logs)\n`;
  for (const log of data.activityLogs) {
    sql += `INSERT INTO activity_logs (id, user_id, user_name, user_role, action, action_badge, action_label, details, target_id, target_name, timestamp)
VALUES (${escapeSql(log.id)}, ${escapeSql(log.userId)}, ${escapeSql(log.userName)}, ${escapeSql(log.userRole)}, ${escapeSql(log.action)}, ${escapeSql(log.actionBadge)}, ${escapeSql(log.actionLabel)}, ${escapeSql(log.details)}, ${escapeSql(log.targetId)}, ${escapeSql(log.targetName)}, ${escapeSql(log.timestamp || new Date().toISOString())})
ON CONFLICT (id) DO NOTHING;\n`;
  }
  sql += '\n';
}

sql += `COMMIT;\n`;

fs.writeFileSync(outputPath, sql, 'utf8');
console.log('สร้างไฟล์ seed-data.sql สำเร็จเรียบร้อย:', outputPath);
