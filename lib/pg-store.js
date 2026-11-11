// lib/pg-store.js
// เอนจิ้นเชื่อมต่อและซิงโครไนซ์ข้อมูลจริงกับ PostgreSQL (pg.Pool)
// รองรับการสร้าง Schema อัตโนมัติ, Migrate ข้อมูลจาก JSON/Seeds, Parameterized SQL Upsert และ Read-Fresh จาก PostgreSQL

import { Pool } from 'pg';

function getDatabaseConfig() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    };
  }
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'rta_sinmai',
    user: process.env.DB_USER || 'rta_admin',
    password: process.env.DB_PASSWORD || 'RtaSinmai@2026!',
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
  };
}

export function getPgPool() {
  if (!globalThis.__rtaPgPool) {
    globalThis.__rtaPgPool = new Pool(getDatabaseConfig());
    globalThis.__rtaPgPool.on('error', (err) => {
      console.error('PostgreSQL pool background error:', err.message);
    });
  }
  return globalThis.__rtaPgPool;
}

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS military_units (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100),
    code VARCHAR(50),
    level INT,
    parent_id VARCHAR(100),
    region VARCHAR(50),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    extra_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY,
    citizen_id VARCHAR(20) UNIQUE NOT NULL,
    rank VARCHAR(50),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    position VARCHAR(150),
    unit_id VARCHAR(100),
    unit_name VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'UNIT_OFFICER',
    requested_role VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by VARCHAR(255),
    rejected_reason TEXT,
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejected_by VARCHAR(255),
    pdpa_consent JSONB,
    extra_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS claims (
    id VARCHAR(100) PRIMARY KEY,
    tracking_code VARCHAR(100) UNIQUE NOT NULL,
    reporter_id VARCHAR(100),
    reporter_name VARCHAR(255),
    unit_id VARCHAR(100),
    unit_name VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
    sla_target_days INT DEFAULT 30,
    report_date VARCHAR(30),
    loss_date VARCHAR(30),
    casualty_citizen_id VARCHAR(20),
    casualty_rank VARCHAR(50),
    casualty_first_name VARCHAR(100),
    casualty_last_name VARCHAR(100),
    casualty_birth_date VARCHAR(30),
    casualty_gender VARCHAR(30),
    casualty_position VARCHAR(150),
    personnel_type VARCHAR(100),
    loss_type VARCHAR(50),
    claim_type VARCHAR(50),
    incident_type VARCHAR(100),
    is_driver VARCHAR(20),
    alcohol_test_result VARCHAR(50),
    compensation_amount NUMERIC(15, 2) DEFAULT 0,
    loss_specific_cause TEXT,
    death_certificate_cause TEXT,
    disabled_organ_detail TEXT,
    cause_of_loss TEXT,
    location_of_loss JSONB,
    heir_name VARCHAR(255),
    documents JSONB DEFAULT '[]'::jsonb,
    timeline JSONB DEFAULT '[]'::jsonb,
    approval_document JSONB,
    transfer_details JSONB,
    delay_reason TEXT,
    delay_attachment_url TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE,
    extra_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS knowledge_exams (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'ทั่วไป',
    passing_score INT DEFAULT 80,
    time_limit_minutes INT DEFAULT 30,
    question_count INT DEFAULT 10,
    randomize_questions BOOLEAN DEFAULT TRUE,
    randomize_options BOOLEAN DEFAULT TRUE,
    question_source VARCHAR(50) DEFAULT 'combined',
    is_active BOOLEAN DEFAULT TRUE,
    open_at TIMESTAMP WITH TIME ZONE,
    close_at TIMESTAMP WITH TIME ZONE,
    instructions TEXT,
    question_ids JSONB DEFAULT '[]'::jsonb,
    extra_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS knowledge_questions (
    id VARCHAR(100) PRIMARY KEY,
    exam_id VARCHAR(100),
    question_text TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    points INT DEFAULT 10,
    order_index INT DEFAULT 0,
    explanation TEXT,
    extra_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS question_bank (
    id VARCHAR(100) PRIMARY KEY,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    points INT DEFAULT 10,
    category VARCHAR(100),
    difficulty VARCHAR(50) DEFAULT 'medium',
    tags JSONB DEFAULT '[]'::jsonb,
    exam_id VARCHAR(100),
    source VARCHAR(50) DEFAULT 'manual',
    explanation TEXT,
    extra_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS exam_attempts (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100),
    user_name VARCHAR(255),
    user_role VARCHAR(50),
    unit_name VARCHAR(255),
    exam_id VARCHAR(100),
    exam_title VARCHAR(255),
    score INT NOT NULL DEFAULT 0,
    percentage INT NOT NULL DEFAULT 0,
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    total_questions INT NOT NULL DEFAULT 0,
    correct_answers INT NOT NULL DEFAULT 0,
    answers JSONB DEFAULT '[]'::jsonb,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    time_spent_seconds INT DEFAULT 0,
    extra_data JSONB DEFAULT '{}'::jsonb
  )`,
  `CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100),
    user_name VARCHAR(255),
    user_role VARCHAR(50),
    unit_name VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    action_badge VARCHAR(50),
    action_label VARCHAR(100),
    details TEXT,
    ip VARCHAR(100),
    device TEXT,
    target_id VARCHAR(100),
    target_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS manuals (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    format VARCHAR(30),
    file_name VARCHAR(255),
    file_path TEXT,
    file_size VARCHAR(50),
    file_data TEXT,
    has_attachment BOOLEAN DEFAULT FALSE,
    uploaded_by VARCHAR(100),
    extra_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS videos (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    url TEXT NOT NULL,
    duration VARCHAR(50),
    category VARCHAR(100),
    description TEXT,
    steps JSONB DEFAULT '[]'::jsonb,
    uploaded_by VARCHAR(100),
    extra_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS pdpa_consents (
    id VARCHAR(100) PRIMARY KEY,
    visitor_id VARCHAR(120),
    user_id VARCHAR(100),
    necessary BOOLEAN DEFAULT TRUE,
    security_log BOOLEAN DEFAULT TRUE,
    analytics BOOLEAN DEFAULT FALSE,
    preferences BOOLEAN DEFAULT FALSE,
    version VARCHAR(30) DEFAULT '1.0',
    masked_ip VARCHAR(100),
    device TEXT,
    consented_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS visit_logs (
    id VARCHAR(100) PRIMARY KEY,
    visitor_id VARCHAR(120),
    user_role VARCHAR(50),
    path VARCHAR(255),
    masked_ip VARCHAR(100),
    device TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255),
    message TEXT,
    claim_id VARCHAR(100),
    tracking_code VARCHAR(100),
    type VARCHAR(50),
    unit_id VARCHAR(100),
    allowed_unit_ids JSONB,
    target_roles JSONB,
    by_name VARCHAR(255),
    link TEXT,
    status VARCHAR(50),
    telegram_sent BOOLEAN DEFAULT FALSE,
    telegram_message_id VARCHAR(100),
    error TEXT,
    read_by JSONB DEFAULT '[]'::jsonb,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,
  `ALTER TABLE military_units ADD COLUMN IF NOT EXISTS level INT`,
  `ALTER TABLE military_units ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ACTIVE'`,
  `ALTER TABLE military_units ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}'::jsonb`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS requested_role VARCHAR(50)`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_by VARCHAR(255)`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS rejected_reason TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS rejected_by VARCHAR(255)`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS pdpa_consent JSONB`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}'::jsonb`,
  `ALTER TABLE claims ADD COLUMN IF NOT EXISTS report_date VARCHAR(30)`,
  `ALTER TABLE claims ADD COLUMN IF NOT EXISTS loss_date VARCHAR(30)`,
  `ALTER TABLE claims ADD COLUMN IF NOT EXISTS casualty_birth_date VARCHAR(30)`,
  `ALTER TABLE claims ADD COLUMN IF NOT EXISTS casualty_gender VARCHAR(30)`,
  `ALTER TABLE claims ADD COLUMN IF NOT EXISTS personnel_type VARCHAR(100)`,
  `ALTER TABLE claims ADD COLUMN IF NOT EXISTS loss_type VARCHAR(50)`,
  `ALTER TABLE claims ADD COLUMN IF NOT EXISTS claim_type VARCHAR(50)`,
  `ALTER TABLE claims ADD COLUMN IF NOT EXISTS is_driver VARCHAR(20)`,
  `ALTER TABLE claims ADD COLUMN IF NOT EXISTS alcohol_test_result VARCHAR(50)`,
  `ALTER TABLE claims ADD COLUMN IF NOT EXISTS loss_specific_cause TEXT`,
  `ALTER TABLE claims ADD COLUMN IF NOT EXISTS death_certificate_cause TEXT`,
  `ALTER TABLE claims ADD COLUMN IF NOT EXISTS disabled_organ_detail TEXT`,
  `ALTER TABLE claims ADD COLUMN IF NOT EXISTS cause_of_loss TEXT`,
  `ALTER TABLE claims ADD COLUMN IF NOT EXISTS location_of_loss JSONB`,
  `ALTER TABLE claims ADD COLUMN IF NOT EXISTS heir_name VARCHAR(255)`,
  `ALTER TABLE claims ADD COLUMN IF NOT EXISTS timeline JSONB DEFAULT '[]'::jsonb`,
  `ALTER TABLE claims ADD COLUMN IF NOT EXISTS approval_document JSONB`,
  `ALTER TABLE claims ADD COLUMN IF NOT EXISTS transfer_details JSONB`,
  `ALTER TABLE claims ADD COLUMN IF NOT EXISTS delay_reason TEXT`,
  `ALTER TABLE claims ADD COLUMN IF NOT EXISTS delay_attachment_url TEXT`,
  `ALTER TABLE claims ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE`,
  `ALTER TABLE claims ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE`,
  `ALTER TABLE claims ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}'::jsonb`,
  `ALTER TABLE knowledge_exams ADD COLUMN IF NOT EXISTS question_ids JSONB DEFAULT '[]'::jsonb`,
  `ALTER TABLE knowledge_exams ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}'::jsonb`,
  `ALTER TABLE knowledge_questions ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}'::jsonb`,
  `ALTER TABLE knowledge_questions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`,
  `ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}'::jsonb`,
  `ALTER TABLE exam_attempts ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}'::jsonb`,
  `ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS unit_name VARCHAR(255)`,
  `ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS ip VARCHAR(100)`,
  `ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS device TEXT`,
  `ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE`,
  `DO $$
  BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'activity_logs' AND column_name = 'timestamp') THEN
      UPDATE activity_logs SET created_at = COALESCE(timestamp, CURRENT_TIMESTAMP) WHERE created_at IS NULL;
    ELSE
      UPDATE activity_logs SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
    END IF;
    ALTER TABLE activity_logs ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'claims' AND column_name = 'history') THEN
      UPDATE claims SET timeline = history WHERE (timeline IS NULL OR timeline = '[]'::jsonb) AND history IS NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'claims' AND column_name = 'incident_cause') THEN
      UPDATE claims SET cause_of_loss = incident_cause WHERE cause_of_loss IS NULL AND incident_cause IS NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'claims' AND column_name = 'incident_date') THEN
      UPDATE claims SET loss_date = to_char(incident_date, 'YYYY-MM-DD') WHERE loss_date IS NULL AND incident_date IS NOT NULL;
    END IF;
  END $$`,
  `ALTER TABLE manuals ADD COLUMN IF NOT EXISTS description TEXT`,
  `ALTER TABLE manuals ADD COLUMN IF NOT EXISTS format VARCHAR(30)`,
  `ALTER TABLE manuals ADD COLUMN IF NOT EXISTS file_name VARCHAR(255)`,
  `ALTER TABLE manuals ADD COLUMN IF NOT EXISTS file_size VARCHAR(50)`,
  `ALTER TABLE manuals ADD COLUMN IF NOT EXISTS file_data TEXT`,
  `ALTER TABLE manuals ADD COLUMN IF NOT EXISTS has_attachment BOOLEAN DEFAULT FALSE`,
  `ALTER TABLE manuals ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}'::jsonb`,
  `ALTER TABLE videos ADD COLUMN IF NOT EXISTS role VARCHAR(255)`,
  `ALTER TABLE videos ADD COLUMN IF NOT EXISTS description TEXT`,
  `ALTER TABLE videos ADD COLUMN IF NOT EXISTS steps JSONB DEFAULT '[]'::jsonb`,
  `ALTER TABLE videos ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}'::jsonb`
];

function toIso(val) {
  if (!val) return null;
  if (val instanceof Date) return val.toISOString();
  return String(val);
}

function omitKeys(obj, keysSet) {
  const extra = {};
  for (const [k, v] of Object.entries(obj || {})) {
    if (!keysSet.has(k) && v !== undefined) {
      extra[k] = v;
    }
  }
  return extra;
}

function cleanObj(mapped, extra) {
  const merged = { ...(extra && typeof extra === 'object' ? extra : {}), ...mapped };
  const result = {};
  for (const [k, v] of Object.entries(merged)) {
    if (v !== null && v !== undefined) {
      result[k] = v;
    }
  }
  return result;
}

const CLAIM_KNOWN_KEYS = new Set([
  'id', 'trackingCode', 'reporterId', 'reporterName', 'unitId', 'unitName', 'status', 'slaTargetDays',
  'reportDate', 'lossDate', 'casualtyCitizenId', 'casualtyRank', 'casualtyFirstName', 'casualtyLastName',
  'casualtyBirthDate', 'casualtyGender', 'casualtyPosition', 'personnelType', 'lossType', 'claimType',
  'incidentType', 'isDriver', 'alcoholTestResult', 'compensationAmount', 'lossSpecificCause',
  'deathCertificateCause', 'disabledOrganDetail', 'causeOfLoss', 'locationOfLoss', 'heirName',
  'documents', 'timeline', 'approvalDocument', 'transferDetails', 'delayReason', 'delayAttachmentUrl',
  'paidAt', 'submittedAt', 'createdAt', 'updatedAt'
]);

const USER_KNOWN_KEYS = new Set([
  'id', 'citizenId', 'rank', 'firstName', 'lastName', 'position', 'unitId', 'unitName', 'phone', 'email',
  'password', 'role', 'requestedRole', 'status', 'isActive', 'approvedAt', 'approvedBy',
  'rejectedReason', 'rejectedAt', 'rejectedBy', 'pdpaConsent', 'createdAt', 'updatedAt'
]);

const UNIT_KNOWN_KEYS = new Set([
  'id', 'name', 'shortName', 'code', 'level', 'parentId', 'region', 'status', 'createdAt'
]);

const TABLE_SYNC_CONFIG = {
  units: {
    table: 'military_units',
    columns: ['id', 'name', 'short_name', 'code', 'level', 'parent_id', 'region', 'status', 'extra_data', 'created_at'],
    jsonCols: new Set(['extra_data']),
    mapRow: (u) => [
      u.id, u.name, u.shortName || null, u.code || null,
      u.level !== undefined ? Number(u.level) : null, u.parentId || null,
      u.region || null, u.status || 'ACTIVE',
      omitKeys(u, UNIT_KNOWN_KEYS), u.createdAt || new Date().toISOString()
    ]
  },
  users: {
    table: 'users',
    columns: [
      'id', 'citizen_id', 'rank', 'first_name', 'last_name', 'position', 'unit_id', 'unit_name',
      'phone', 'email', 'password', 'role', 'requested_role', 'status', 'is_active',
      'approved_at', 'approved_by', 'rejected_reason', 'rejected_at', 'rejected_by',
      'pdpa_consent', 'extra_data', 'created_at', 'updated_at'
    ],
    jsonCols: new Set(['pdpa_consent', 'extra_data']),
    mapRow: (u) => [
      u.id, u.citizenId, u.rank || null, u.firstName, u.lastName, u.position || null,
      u.unitId || null, u.unitName || null, u.phone || null, u.email, u.password,
      u.role || 'UNIT_OFFICER', u.requestedRole || u.role || 'UNIT_OFFICER',
      u.status || 'APPROVED', u.isActive !== false,
      u.approvedAt || null, u.approvedBy || null, u.rejectedReason || null,
      u.rejectedAt || null, u.rejectedBy || null, u.pdpaConsent || null,
      omitKeys(u, USER_KNOWN_KEYS), u.createdAt || new Date().toISOString(),
      u.updatedAt || u.createdAt || new Date().toISOString()
    ]
  },
  claims: {
    table: 'claims',
    columns: [
      'id', 'tracking_code', 'reporter_id', 'reporter_name', 'unit_id', 'unit_name', 'status',
      'sla_target_days', 'report_date', 'loss_date', 'casualty_citizen_id', 'casualty_rank',
      'casualty_first_name', 'casualty_last_name', 'casualty_birth_date', 'casualty_gender',
      'casualty_position', 'personnel_type', 'loss_type', 'claim_type', 'incident_type',
      'is_driver', 'alcohol_test_result', 'compensation_amount', 'loss_specific_cause',
      'death_certificate_cause', 'disabled_organ_detail', 'cause_of_loss', 'location_of_loss',
      'heir_name', 'documents', 'timeline', 'approval_document', 'transfer_details',
      'delay_reason', 'delay_attachment_url', 'paid_at', 'submitted_at', 'extra_data',
      'created_at', 'updated_at'
    ],
    jsonCols: new Set(['location_of_loss', 'documents', 'timeline', 'approval_document', 'transfer_details', 'extra_data']),
    mapRow: (c) => [
      c.id, c.trackingCode, c.reporterId || null, c.reporterName || null, c.unitId || null, c.unitName || null,
      c.status || 'SUBMITTED', Number(c.slaTargetDays || 30), c.reportDate || null, c.lossDate || null,
      c.casualtyCitizenId || null, c.casualtyRank || null, c.casualtyFirstName || null, c.casualtyLastName || null,
      c.casualtyBirthDate || null, c.casualtyGender || null, c.casualtyPosition || null,
      c.personnelType || null, c.lossType || null, c.claimType || null, c.incidentType || null,
      c.isDriver || null, c.alcoholTestResult || null, Number(c.compensationAmount || 0),
      c.lossSpecificCause || null, c.deathCertificateCause || null, c.disabledOrganDetail || null,
      c.causeOfLoss || null, c.locationOfLoss || null, c.heirName || null,
      Array.isArray(c.documents) ? c.documents : [], Array.isArray(c.timeline) ? c.timeline : [],
      c.approvalDocument || null, c.transferDetails || null,
      c.delayReason || null, c.delayAttachmentUrl || null, c.paidAt || null, c.submittedAt || null,
      omitKeys(c, CLAIM_KNOWN_KEYS), c.createdAt || new Date().toISOString(),
      c.updatedAt || c.createdAt || new Date().toISOString()
    ]
  },
  manuals: {
    table: 'manuals',
    columns: ['id', 'title', 'description', 'category', 'format', 'file_name', 'file_path', 'file_size', 'file_data', 'has_attachment', 'uploaded_by', 'extra_data', 'created_at'],
    jsonCols: new Set(['extra_data']),
    mapRow: (m) => [
      m.id, m.title, m.desc || m.description || null, m.category || null, m.format || 'PDF',
      m.fileName || null, m.fileUrl || m.filePath || null, m.size || m.fileSize || null,
      m.fileData || null, Boolean(m.hasAttachment), m.uploadedBy || null,
      omitKeys(m, new Set(['id', 'title', 'desc', 'description', 'category', 'format', 'fileName', 'fileUrl', 'filePath', 'size', 'fileSize', 'fileData', 'hasAttachment', 'uploadedBy', 'createdAt'])),
      m.createdAt || new Date().toISOString()
    ]
  },
  videos: {
    table: 'videos',
    columns: ['id', 'title', 'role', 'url', 'duration', 'category', 'description', 'steps', 'uploaded_by', 'extra_data', 'created_at'],
    jsonCols: new Set(['steps', 'extra_data']),
    mapRow: (v) => [
      v.id, v.title, v.role || null, v.videoUrl || v.url || '', v.duration || null,
      v.category || null, v.description || null, Array.isArray(v.steps) ? v.steps : [],
      v.uploadedBy || null,
      omitKeys(v, new Set(['id', 'title', 'role', 'videoUrl', 'url', 'duration', 'category', 'description', 'steps', 'uploadedBy', 'createdAt'])),
      v.createdAt || new Date().toISOString()
    ]
  },
  knowledgeExams: {
    table: 'knowledge_exams',
    columns: ['id', 'title', 'description', 'category', 'passing_score', 'time_limit_minutes', 'question_count', 'randomize_questions', 'randomize_options', 'question_source', 'is_active', 'open_at', 'close_at', 'instructions', 'question_ids', 'extra_data', 'created_at', 'updated_at'],
    jsonCols: new Set(['question_ids', 'extra_data']),
    mapRow: (e) => [
      e.id, e.title, e.description || null, e.category || 'ทั่วไป',
      Number(e.passingScore ?? 80), Number(e.timeLimitMinutes ?? 30), Number(e.questionCount ?? 10),
      e.randomizeQuestions !== false, e.randomizeOptions !== false, e.questionSource || 'combined',
      e.isActive !== false, e.openAt || null, e.closeAt || null, e.instructions || null,
      Array.isArray(e.questionIds) ? e.questionIds : [],
      omitKeys(e, new Set(['id', 'title', 'description', 'category', 'passingScore', 'timeLimitMinutes', 'questionCount', 'randomizeQuestions', 'randomizeOptions', 'questionSource', 'isActive', 'openAt', 'closeAt', 'instructions', 'questionIds', 'createdAt', 'updatedAt'])),
      e.createdAt || new Date().toISOString(), e.updatedAt || new Date().toISOString()
    ]
  },
  knowledgeQuestions: {
    table: 'knowledge_questions',
    columns: ['id', 'exam_id', 'question_text', 'options', 'points', 'order_index', 'explanation', 'extra_data', 'created_at', 'updated_at'],
    jsonCols: new Set(['options', 'extra_data']),
    mapRow: (q) => [
      q.id, q.examId || null, q.questionText, Array.isArray(q.options) ? q.options : [],
      Number(q.points ?? 10), Number(q.orderIndex ?? 0), q.explanation || null,
      omitKeys(q, new Set(['id', 'examId', 'questionText', 'options', 'points', 'orderIndex', 'explanation', 'createdAt', 'updatedAt'])),
      q.createdAt || new Date().toISOString(), q.updatedAt || new Date().toISOString()
    ]
  },
  questionBank: {
    table: 'question_bank',
    columns: ['id', 'question_text', 'options', 'points', 'category', 'difficulty', 'tags', 'exam_id', 'source', 'explanation', 'extra_data', 'created_at', 'updated_at'],
    jsonCols: new Set(['options', 'tags', 'extra_data']),
    mapRow: (q) => [
      q.id, q.questionText, Array.isArray(q.options) ? q.options : [],
      Number(q.points ?? 10), q.category || 'ทั่วไป', q.difficulty || 'medium',
      Array.isArray(q.tags) ? q.tags : [], q.examId || null, q.source || 'manual', q.explanation || null,
      omitKeys(q, new Set(['id', 'questionText', 'options', 'points', 'category', 'difficulty', 'tags', 'examId', 'source', 'explanation', 'createdAt', 'updatedAt'])),
      q.createdAt || new Date().toISOString(), q.updatedAt || new Date().toISOString()
    ]
  },
  examAttempts: {
    table: 'exam_attempts',
    columns: ['id', 'user_id', 'user_name', 'user_role', 'unit_name', 'exam_id', 'exam_title', 'score', 'percentage', 'passed', 'total_questions', 'correct_answers', 'answers', 'started_at', 'completed_at', 'time_spent_seconds', 'extra_data'],
    jsonCols: new Set(['answers', 'extra_data']),
    mapRow: (a) => [
      a.id, a.userId || null, a.userName || null, a.userRole || null, a.unitName || null,
      a.examId || null, a.examTitle || null, Number(a.score || 0), Number(a.percentage || 0),
      Boolean(a.passed), Number(a.totalQuestions || 0), Number(a.correctAnswers || 0),
      Array.isArray(a.answers) ? a.answers : [], a.startedAt || null,
      a.completedAt || new Date().toISOString(), Number(a.timeSpentSeconds || 0),
      omitKeys(a, new Set(['id', 'userId', 'userName', 'userRole', 'unitName', 'examId', 'examTitle', 'score', 'percentage', 'passed', 'totalQuestions', 'correctAnswers', 'answers', 'startedAt', 'completedAt', 'timeSpentSeconds']))
    ]
  },
  activityLogs: {
    table: 'activity_logs',
    columns: ['id', 'user_id', 'user_name', 'user_role', 'unit_name', 'action', 'action_badge', 'action_label', 'details', 'ip', 'device', 'target_id', 'target_name', 'created_at'],
    jsonCols: new Set(),
    mapRow: (l) => [
      l.id, l.userId || null, l.userName || null, l.userRole || null, l.unitName || null,
      l.action || 'GENERAL', l.actionBadge || null, l.actionLabel || null, l.details || null,
      l.ip || null, l.device || null, l.targetId || null, l.targetName || null,
      l.createdAt || l.timestamp || new Date().toISOString()
    ]
  },
  pdpaConsents: {
    table: 'pdpa_consents',
    columns: ['id', 'visitor_id', 'user_id', 'necessary', 'security_log', 'analytics', 'preferences', 'version', 'masked_ip', 'device', 'consented_at'],
    jsonCols: new Set(),
    mapRow: (p) => [
      p.id, p.visitorId || 'anon', p.userId || null, p.necessary !== false, p.securityLog !== false,
      Boolean(p.analytics), Boolean(p.preferences), p.version || '1.0', p.maskedIp || null,
      p.device || null, p.consentedAt || new Date().toISOString()
    ]
  },
  visitLogs: {
    table: 'visit_logs',
    columns: ['id', 'visitor_id', 'user_role', 'path', 'masked_ip', 'device', 'timestamp'],
    jsonCols: new Set(),
    mapRow: (v) => [
      v.id, v.visitorId || 'anon', v.userRole || 'GUEST', v.path || '/',
      v.maskedIp || null, v.device || null, v.timestamp || new Date().toISOString()
    ]
  },
  notifications: {
    table: 'notifications',
    columns: ['id', 'title', 'message', 'claim_id', 'tracking_code', 'type', 'unit_id', 'allowed_unit_ids', 'target_roles', 'by_name', 'link', 'status', 'telegram_sent', 'telegram_message_id', 'error', 'read_by', 'timestamp'],
    jsonCols: new Set(['allowed_unit_ids', 'target_roles', 'read_by']),
    mapRow: (n) => [
      n.id, n.title || null, n.message || null, n.claimId || null, n.trackingCode || null,
      n.type || 'INFO', n.unitId || null, n.allowedUnitIds || null, n.targetRoles || null,
      n.by || null, n.link || null, n.status || 'LOCAL_ONLY', Boolean(n.telegramSent),
      n.telegramMessageId ? String(n.telegramMessageId) : null, n.error || null,
      Array.isArray(n.readBy) ? n.readBy : [], n.timestamp || new Date().toISOString()
    ]
  }
};

async function syncTableRows(client, tableKey, rows) {
  const cfg = TABLE_SYNC_CONFIG[tableKey];
  if (!cfg) return;
  const list = Array.isArray(rows) ? rows : [];
  const ids = list.map((r) => r.id).filter(Boolean);

  if (ids.length === 0) {
    await client.query(`DELETE FROM ${cfg.table}`);
  } else {
    await client.query(`DELETE FROM ${cfg.table} WHERE NOT (id = ANY($1::varchar[]))`, [ids]);
  }

  if (list.length === 0) return;

  const colList = cfg.columns.join(', ');
  const placeholders = cfg.columns.map((_, idx) => `$${idx + 1}`).join(', ');
  const updates = cfg.columns
    .filter((c) => c !== 'id')
    .map((c) => `${c} = EXCLUDED.${c}`)
    .join(', ');
  const sql = `INSERT INTO ${cfg.table} (${colList}) VALUES (${placeholders}) ON CONFLICT (id) DO UPDATE SET ${updates}`;

  for (const row of list) {
    if (!row?.id) continue;
    const rawValues = cfg.mapRow(row);
    const params = cfg.columns.map((col, idx) => {
      const val = rawValues[idx];
      if (cfg.jsonCols.has(col)) {
        return val === null || val === undefined ? null : JSON.stringify(val);
      }
      return val === undefined ? null : val;
    });
    await client.query(sql, params);
  }
}

async function syncSettingsRows(client, examSettings, telegramConfig) {
  const upsertSql = `INSERT INTO system_settings (key, value, updated_at) VALUES ($1, $2::jsonb, CURRENT_TIMESTAMP)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`;
  if (examSettings) {
    await client.query(upsertSql, ['exam_settings', JSON.stringify(examSettings)]);
  }
  if (telegramConfig) {
    await client.query(upsertSql, ['telegram_config', JSON.stringify(telegramConfig)]);
  }
}

export async function ensurePgSchema(pool) {
  const client = await pool.connect();
  try {
    for (const ddl of SCHEMA_STATEMENTS) {
      await client.query(ddl);
    }
  } finally {
    client.release();
  }
}

export async function seedPgIfEmpty(snapshot) {
  const pool = getPgPool();
  const client = await pool.connect();
  try {
    const countRes = await client.query('SELECT (SELECT COUNT(*)::int FROM users) AS u, (SELECT COUNT(*)::int FROM claims) AS c');
    const isEmpty = countRes.rows[0].u === 0 && countRes.rows[0].c === 0;
    if (!isEmpty) return false;

    await client.query('BEGIN');
    for (const key of Object.keys(TABLE_SYNC_CONFIG)) {
      if (Array.isArray(snapshot[key]) && snapshot[key].length > 0) {
        await syncTableRows(client, key, snapshot[key]);
      }
    }
    await syncSettingsRows(client, snapshot.examSettings, snapshot.telegramConfig);
    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export async function syncSnapshotToPg(snapshot, dirtyKeys = null) {
  const pool = getPgPool();
  const client = await pool.connect();
  try {
    const targetKeys =
      Array.isArray(dirtyKeys) && dirtyKeys.length > 0
        ? dirtyKeys.filter((k) => TABLE_SYNC_CONFIG[k])
        : Object.keys(TABLE_SYNC_CONFIG);

    await client.query('BEGIN');
    for (const key of targetKeys) {
      await syncTableRows(client, key, snapshot[key] || []);
    }
    if (!dirtyKeys || dirtyKeys.includes('examSettings') || dirtyKeys.includes('telegramConfig')) {
      await syncSettingsRows(client, snapshot.examSettings, snapshot.telegramConfig);
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export async function loadAllFromPg() {
  const pool = getPgPool();
  const [
    unitsRes,
    usersRes,
    claimsRes,
    manualsRes,
    videosRes,
    examsRes,
    questionsRes,
    bankRes,
    attemptsRes,
    logsRes,
    pdpaRes,
    visitsRes,
    notifsRes,
    settingsRes
  ] = await Promise.all([
    pool.query('SELECT * FROM military_units'),
    pool.query('SELECT * FROM users'),
    pool.query('SELECT * FROM claims ORDER BY created_at DESC'),
    pool.query('SELECT * FROM manuals ORDER BY created_at ASC'),
    pool.query('SELECT * FROM videos ORDER BY created_at ASC'),
    pool.query('SELECT * FROM knowledge_exams ORDER BY created_at ASC'),
    pool.query('SELECT * FROM knowledge_questions ORDER BY order_index ASC, created_at ASC'),
    pool.query('SELECT * FROM question_bank ORDER BY created_at DESC'),
    pool.query('SELECT * FROM exam_attempts ORDER BY completed_at DESC'),
    pool.query('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 2000'),
    pool.query('SELECT * FROM pdpa_consents ORDER BY consented_at DESC LIMIT 2000'),
    pool.query('SELECT * FROM visit_logs ORDER BY timestamp DESC LIMIT 5000'),
    pool.query('SELECT * FROM notifications ORDER BY timestamp DESC LIMIT 200'),
    pool.query('SELECT key, value FROM system_settings')
  ]);

  notifsRes.rows.reverse();

  const settingsMap = {};
  for (const r of settingsRes.rows) {
    settingsMap[r.key] = r.value;
  }

  return {
    units: unitsRes.rows.map((r) => cleanObj({
      id: r.id,
      name: r.name,
      shortName: r.short_name,
      code: r.code,
      level: r.level !== null ? Number(r.level) : undefined,
      parentId: r.parent_id,
      region: r.region,
      status: r.status,
      createdAt: toIso(r.created_at)
    }, r.extra_data)),

    users: usersRes.rows.map((r) => cleanObj({
      id: r.id,
      citizenId: r.citizen_id,
      rank: r.rank,
      firstName: r.first_name,
      lastName: r.last_name,
      position: r.position,
      unitId: r.unit_id,
      unitName: r.unit_name,
      phone: r.phone,
      email: r.email,
      password: r.password,
      role: r.role,
      requestedRole: r.requested_role,
      status: r.status,
      isActive: r.is_active,
      approvedAt: toIso(r.approved_at),
      approvedBy: r.approved_by,
      rejectedReason: r.rejected_reason,
      rejectedAt: toIso(r.rejected_at),
      rejectedBy: r.rejected_by,
      pdpaConsent: r.pdpa_consent,
      createdAt: toIso(r.created_at),
      updatedAt: toIso(r.updated_at)
    }, r.extra_data)),

    claims: claimsRes.rows.map((r) => cleanObj({
      id: r.id,
      trackingCode: r.tracking_code,
      reporterId: r.reporter_id,
      reporterName: r.reporter_name,
      unitId: r.unit_id,
      unitName: r.unit_name,
      status: r.status,
      slaTargetDays: Number(r.sla_target_days || 30),
      reportDate: r.report_date,
      lossDate: r.loss_date,
      casualtyCitizenId: r.casualty_citizen_id,
      casualtyRank: r.casualty_rank,
      casualtyFirstName: r.casualty_first_name,
      casualtyLastName: r.casualty_last_name,
      casualtyBirthDate: r.casualty_birth_date,
      casualtyGender: r.casualty_gender,
      casualtyPosition: r.casualty_position,
      personnelType: r.personnel_type,
      lossType: r.loss_type,
      claimType: r.claim_type,
      incidentType: r.incident_type,
      isDriver: r.is_driver,
      alcoholTestResult: r.alcohol_test_result,
      compensationAmount: Number(r.compensation_amount || 0),
      lossSpecificCause: r.loss_specific_cause,
      deathCertificateCause: r.death_certificate_cause,
      disabledOrganDetail: r.disabled_organ_detail,
      causeOfLoss: r.cause_of_loss,
      locationOfLoss: r.location_of_loss,
      heirName: r.heir_name,
      documents: r.documents || [],
      timeline: r.timeline || [],
      approvalDocument: r.approval_document,
      transferDetails: r.transfer_details,
      delayReason: r.delay_reason,
      delayAttachmentUrl: r.delay_attachment_url,
      paidAt: toIso(r.paid_at),
      submittedAt: toIso(r.submitted_at),
      createdAt: toIso(r.created_at),
      updatedAt: toIso(r.updated_at)
    }, r.extra_data)),

    manuals: manualsRes.rows.map((r) => cleanObj({
      id: r.id,
      title: r.title,
      desc: r.description,
      category: r.category,
      format: r.format,
      fileName: r.file_name,
      fileUrl: r.file_path,
      size: r.file_size,
      fileData: r.file_data,
      hasAttachment: Boolean(r.has_attachment),
      uploadedBy: r.uploaded_by,
      createdAt: toIso(r.created_at)
    }, r.extra_data)),

    videos: videosRes.rows.map((r) => cleanObj({
      id: r.id,
      title: r.title,
      role: r.role,
      videoUrl: r.url,
      duration: r.duration,
      category: r.category,
      description: r.description,
      steps: r.steps || [],
      uploadedBy: r.uploaded_by,
      createdAt: toIso(r.created_at)
    }, r.extra_data)),

    knowledgeExams: examsRes.rows.map((r) => cleanObj({
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      passingScore: Number(r.passing_score ?? 80),
      timeLimitMinutes: Number(r.time_limit_minutes ?? 30),
      questionCount: Number(r.question_count ?? 10),
      randomizeQuestions: r.randomize_questions !== false,
      randomizeOptions: r.randomize_options !== false,
      questionSource: r.question_source || 'combined',
      isActive: r.is_active !== false,
      openAt: toIso(r.open_at),
      closeAt: toIso(r.close_at),
      instructions: r.instructions,
      questionIds: r.question_ids || [],
      createdAt: toIso(r.created_at),
      updatedAt: toIso(r.updated_at)
    }, r.extra_data)),

    knowledgeQuestions: questionsRes.rows.map((r) => cleanObj({
      id: r.id,
      examId: r.exam_id,
      questionText: r.question_text,
      options: r.options || [],
      points: Number(r.points ?? 10),
      orderIndex: Number(r.order_index ?? 0),
      explanation: r.explanation,
      createdAt: toIso(r.created_at),
      updatedAt: toIso(r.updated_at)
    }, r.extra_data)),

    questionBank: bankRes.rows.map((r) => cleanObj({
      id: r.id,
      questionText: r.question_text,
      options: r.options || [],
      points: Number(r.points ?? 10),
      category: r.category,
      difficulty: r.difficulty,
      tags: r.tags || [],
      examId: r.exam_id,
      source: r.source,
      explanation: r.explanation,
      createdAt: toIso(r.created_at),
      updatedAt: toIso(r.updated_at)
    }, r.extra_data)),

    examAttempts: attemptsRes.rows.map((r) => cleanObj({
      id: r.id,
      userId: r.user_id,
      userName: r.user_name,
      userRole: r.user_role,
      unitName: r.unit_name,
      examId: r.exam_id,
      examTitle: r.exam_title,
      score: Number(r.score || 0),
      percentage: Number(r.percentage || 0),
      passed: Boolean(r.passed),
      totalQuestions: Number(r.total_questions || 0),
      correctAnswers: Number(r.correct_answers || 0),
      answers: r.answers || [],
      startedAt: toIso(r.started_at),
      completedAt: toIso(r.completed_at),
      timeSpentSeconds: Number(r.time_spent_seconds || 0)
    }, r.extra_data)),

    activityLogs: logsRes.rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      userName: r.user_name,
      userRole: r.user_role,
      unitName: r.unit_name,
      action: r.action,
      actionBadge: r.action_badge,
      actionLabel: r.action_label,
      details: r.details,
      ip: r.ip,
      device: r.device,
      targetId: r.target_id,
      targetName: r.target_name,
      createdAt: toIso(r.created_at)
    })),

    pdpaConsents: pdpaRes.rows.map((r) => ({
      id: r.id,
      visitorId: r.visitor_id,
      userId: r.user_id,
      necessary: Boolean(r.necessary),
      securityLog: Boolean(r.security_log),
      analytics: Boolean(r.analytics),
      preferences: Boolean(r.preferences),
      version: r.version,
      maskedIp: r.masked_ip,
      device: r.device,
      consentedAt: toIso(r.consented_at)
    })),

    visitLogs: visitsRes.rows.map((r) => ({
      id: r.id,
      visitorId: r.visitor_id,
      userRole: r.user_role,
      path: r.path,
      maskedIp: r.masked_ip,
      device: r.device,
      timestamp: toIso(r.timestamp)
    })),

    notifications: notifsRes.rows.map((r) => ({
      id: r.id,
      title: r.title,
      message: r.message,
      claimId: r.claim_id,
      trackingCode: r.tracking_code,
      type: r.type,
      unitId: r.unit_id,
      allowedUnitIds: r.allowed_unit_ids,
      targetRoles: r.target_roles,
      by: r.by_name,
      link: r.link,
      status: r.status,
      telegramSent: Boolean(r.telegram_sent),
      telegramMessageId: r.telegram_message_id ? Number(r.telegram_message_id) || r.telegram_message_id : undefined,
      error: r.error,
      readBy: r.read_by || [],
      timestamp: toIso(r.timestamp)
    })),

    examSettings: settingsMap.exam_settings || null,
    telegramConfig: settingsMap.telegram_config || null
  };
}

export async function getPgDiagnostics() {
  try {
    const pool = getPgPool();
    const res = await pool.query(`
      SELECT
        current_database() AS database,
        current_user AS db_user,
        (SELECT COUNT(*)::int FROM claims) AS claims_count,
        (SELECT COUNT(*)::int FROM users) AS users_count,
        (SELECT COUNT(*)::int FROM military_units) AS units_count,
        (SELECT COUNT(*)::int FROM activity_logs) AS logs_count,
        (SELECT COUNT(*)::int FROM pdpa_consents) AS pdpa_count,
        (SELECT COUNT(*)::int FROM visit_logs) AS visits_count,
        (SELECT COUNT(*)::int FROM notifications) AS notifications_count
    `);
    return { connected: true, ...res.rows[0] };
  } catch (err) {
    return { connected: false, error: err.message };
  }
}
