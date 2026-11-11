-- deploy/postgres/schema.sql
-- โครงสร้างฐานข้อมูล PostgreSQL สมบูรณ์ (14 ตาราง) สำหรับระบบเสนอขอรับสิทธิเงินค่าสินไหมทดแทน ทบ.

-- 1. โครงสร้างหน่วยทหาร (military_units)
CREATE TABLE IF NOT EXISTS military_units (
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
);

-- 2. ผู้ใช้งานระบบ (users)
CREATE TABLE IF NOT EXISTS users (
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
);

CREATE INDEX IF NOT EXISTS idx_users_citizen_id ON users(citizen_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- 3. รายการคำร้องสินไหมทดแทน (claims)
CREATE TABLE IF NOT EXISTS claims (
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
);

CREATE INDEX IF NOT EXISTS idx_claims_tracking_code ON claims(tracking_code);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_unit_id ON claims(unit_id);
CREATE INDEX IF NOT EXISTS idx_claims_casualty_citizen_id ON claims(casualty_citizen_id);

-- 4. ชุดแบบทดสอบความรู้ (knowledge_exams)
CREATE TABLE IF NOT EXISTS knowledge_exams (
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
);

-- 5. ข้อสอบประจำชุด (knowledge_questions)
CREATE TABLE IF NOT EXISTS knowledge_questions (
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
);

CREATE INDEX IF NOT EXISTS idx_questions_exam_id ON knowledge_questions(exam_id);

-- 6. ธนาคารคำถามกลาง (question_bank)
CREATE TABLE IF NOT EXISTS question_bank (
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
);

-- 7. ประวัติการทำแบบทดสอบ (exam_attempts)
CREATE TABLE IF NOT EXISTS exam_attempts (
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
);

CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON exam_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_exam_id ON exam_attempts(exam_id);

-- 8. ประวัติการใช้งานและ Audit Log (activity_logs)
CREATE TABLE IF NOT EXISTS activity_logs (
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
);

CREATE INDEX IF NOT EXISTS idx_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON activity_logs(created_at DESC);

-- 9. คู่มือและเอกสารดาวน์โหลด (manuals)
CREATE TABLE IF NOT EXISTS manuals (
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
);

-- 10. วิดีโอสอนการใช้งาน (videos)
CREATE TABLE IF NOT EXISTS videos (
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
);

-- 11. ประวัติความยินยอม PDPA & Cookies (pdpa_consents)
CREATE TABLE IF NOT EXISTS pdpa_consents (
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
);

CREATE INDEX IF NOT EXISTS idx_pdpa_consents_at ON pdpa_consents(consented_at DESC);

-- 12. สถิติการเยี่ยมชมเว็บไซต์ (visit_logs)
CREATE TABLE IF NOT EXISTS visit_logs (
    id VARCHAR(100) PRIMARY KEY,
    visitor_id VARCHAR(120),
    user_role VARCHAR(50),
    path VARCHAR(255),
    masked_ip VARCHAR(100),
    device TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_visit_logs_ts ON visit_logs(timestamp DESC);

-- 13. ประวัติการแจ้งเตือน Socket.IO & Telegram Bot (notifications)
CREATE TABLE IF NOT EXISTS notifications (
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
);

CREATE INDEX IF NOT EXISTS idx_notifications_ts ON notifications(timestamp DESC);

-- 14. การตั้งค่าระบบ (system_settings)
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- Migration อัปเกรดฐานข้อมูลเดิมอัตโนมัติ (Idempotent ALTER TABLE สำหรับ Production)
-- =============================================================================
ALTER TABLE military_units ADD COLUMN IF NOT EXISTS level INT;
ALTER TABLE military_units ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ACTIVE';
ALTER TABLE military_units ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}'::jsonb;

ALTER TABLE users ADD COLUMN IF NOT EXISTS requested_role VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_by VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS rejected_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rejected_by VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS pdpa_consent JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}'::jsonb;

ALTER TABLE claims ADD COLUMN IF NOT EXISTS report_date VARCHAR(30);
ALTER TABLE claims ADD COLUMN IF NOT EXISTS loss_date VARCHAR(30);
ALTER TABLE claims ADD COLUMN IF NOT EXISTS casualty_birth_date VARCHAR(30);
ALTER TABLE claims ADD COLUMN IF NOT EXISTS casualty_gender VARCHAR(30);
ALTER TABLE claims ADD COLUMN IF NOT EXISTS personnel_type VARCHAR(100);
ALTER TABLE claims ADD COLUMN IF NOT EXISTS loss_type VARCHAR(50);
ALTER TABLE claims ADD COLUMN IF NOT EXISTS claim_type VARCHAR(50);
ALTER TABLE claims ADD COLUMN IF NOT EXISTS is_driver VARCHAR(20);
ALTER TABLE claims ADD COLUMN IF NOT EXISTS alcohol_test_result VARCHAR(50);
ALTER TABLE claims ADD COLUMN IF NOT EXISTS loss_specific_cause TEXT;
ALTER TABLE claims ADD COLUMN IF NOT EXISTS death_certificate_cause TEXT;
ALTER TABLE claims ADD COLUMN IF NOT EXISTS disabled_organ_detail TEXT;
ALTER TABLE claims ADD COLUMN IF NOT EXISTS cause_of_loss TEXT;
ALTER TABLE claims ADD COLUMN IF NOT EXISTS location_of_loss JSONB;
ALTER TABLE claims ADD COLUMN IF NOT EXISTS heir_name VARCHAR(255);
ALTER TABLE claims ADD COLUMN IF NOT EXISTS timeline JSONB DEFAULT '[]'::jsonb;
ALTER TABLE claims ADD COLUMN IF NOT EXISTS approval_document JSONB;
ALTER TABLE claims ADD COLUMN IF NOT EXISTS transfer_details JSONB;
ALTER TABLE claims ADD COLUMN IF NOT EXISTS delay_reason TEXT;
ALTER TABLE claims ADD COLUMN IF NOT EXISTS delay_attachment_url TEXT;
ALTER TABLE claims ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE claims ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE claims ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}'::jsonb;

ALTER TABLE knowledge_exams ADD COLUMN IF NOT EXISTS question_ids JSONB DEFAULT '[]'::jsonb;
ALTER TABLE knowledge_exams ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}'::jsonb;

ALTER TABLE knowledge_questions ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE knowledge_questions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE exam_attempts ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}'::jsonb;

ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS unit_name VARCHAR(255);
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS ip VARCHAR(100);
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS device TEXT;
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE manuals ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE manuals ADD COLUMN IF NOT EXISTS format VARCHAR(30);
ALTER TABLE manuals ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);
ALTER TABLE manuals ADD COLUMN IF NOT EXISTS file_size VARCHAR(50);
ALTER TABLE manuals ADD COLUMN IF NOT EXISTS file_data TEXT;
ALTER TABLE manuals ADD COLUMN IF NOT EXISTS has_attachment BOOLEAN DEFAULT FALSE;
ALTER TABLE manuals ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}'::jsonb;

ALTER TABLE videos ADD COLUMN IF NOT EXISTS role VARCHAR(255);
ALTER TABLE videos ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS steps JSONB DEFAULT '[]'::jsonb;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}'::jsonb;

DO $$
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
END $$;
