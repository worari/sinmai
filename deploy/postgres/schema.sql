-- deploy/postgres/schema.sql
-- โครงสร้างฐานข้อมูล PostgreSQL สำหรับระบบเสนอขอรับสิทธิเงินค่าสินไหมทดแทน ทบ.

-- 1. ตารางโครงสร้างหน่วยทหาร (military_units)
CREATE TABLE IF NOT EXISTS military_units (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100),
    code VARCHAR(50),
    parent_id VARCHAR(100),
    region VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. ตารางผู้ใช้งานระบบ (users)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY,
    citizen_id VARCHAR(20) UNIQUE NOT NULL,
    rank VARCHAR(50),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    position VARCHAR(150),
    unit_id VARCHAR(100) REFERENCES military_units(id) ON DELETE SET NULL,
    unit_name VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'UNIT_OFFICER',
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_citizen_id ON users(citizen_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- 3. ตารางรายการคำร้องสินไหม (claims)
CREATE TABLE IF NOT EXISTS claims (
    id VARCHAR(100) PRIMARY KEY,
    tracking_code VARCHAR(100) UNIQUE NOT NULL,
    reporter_id VARCHAR(100) REFERENCES users(id) ON DELETE SET NULL,
    reporter_name VARCHAR(255),
    unit_id VARCHAR(100),
    unit_name VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
    sla_target_days INT DEFAULT 30,
    casualty_citizen_id VARCHAR(20),
    casualty_rank VARCHAR(50),
    casualty_first_name VARCHAR(100),
    casualty_last_name VARCHAR(100),
    casualty_position VARCHAR(150),
    incident_date DATE,
    incident_type VARCHAR(100),
    incident_location TEXT,
    incident_cause TEXT,
    compensation_amount NUMERIC(15, 2) DEFAULT 0,
    documents JSONB DEFAULT '[]'::jsonb,
    history JSONB DEFAULT '[]'::jsonb,
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_claims_tracking_code ON claims(tracking_code);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_unit_id ON claims(unit_id);
CREATE INDEX IF NOT EXISTS idx_claims_casualty_citizen_id ON claims(casualty_citizen_id);

-- 4. ตารางชุดแบบทดสอบความรู้ (knowledge_exams)
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. ตารางข้อสอบประจำชุด (knowledge_questions)
CREATE TABLE IF NOT EXISTS knowledge_questions (
    id VARCHAR(100) PRIMARY KEY,
    exam_id VARCHAR(100) REFERENCES knowledge_exams(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    points INT DEFAULT 10,
    order_index INT DEFAULT 0,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_questions_exam_id ON knowledge_questions(exam_id);

-- 6. ตารางธนาคารคำถามกลาง (question_bank)
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. ตารางประวัติและคะแนนการทำแบบทดสอบ (exam_attempts)
CREATE TABLE IF NOT EXISTS exam_attempts (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255),
    user_role VARCHAR(50),
    unit_name VARCHAR(255),
    exam_id VARCHAR(100) REFERENCES knowledge_exams(id) ON DELETE CASCADE,
    exam_title VARCHAR(255),
    score INT NOT NULL,
    percentage INT NOT NULL,
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    total_questions INT NOT NULL,
    correct_answers INT NOT NULL,
    answers JSONB DEFAULT '[]'::jsonb,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    time_spent_seconds INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON exam_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_exam_id ON exam_attempts(exam_id);

-- 8. ตารางประวัติการใช้งานและ Audit Log (activity_logs)
CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100),
    user_name VARCHAR(255),
    user_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    action_badge VARCHAR(50),
    action_label VARCHAR(100),
    details TEXT,
    target_id VARCHAR(100),
    target_name VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON activity_logs(timestamp DESC);

-- 9. ตารางคู่มือและวิดีโอ (manuals & videos)
CREATE TABLE IF NOT EXISTS manuals (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    file_path TEXT,
    file_size VARCHAR(50),
    uploaded_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS videos (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    duration VARCHAR(50),
    category VARCHAR(100),
    uploaded_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. ตารางการตั้งค่าระบบ (system_settings)
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
