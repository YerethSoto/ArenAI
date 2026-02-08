-- Chat Analytics Tables - Run this to add the new tables
-- Execute this SQL on your MySQL database

-- ==========================================
-- CHAT ANALYTICS SYSTEM TABLES
-- ==========================================

-- Raw chat message logs with analysis flag (Phase 1: Delta Strategy)
CREATE TABLE IF NOT EXISTS chat_logs (
    id_chat_log      INT AUTO_INCREMENT PRIMARY KEY,
    id_user          INT NOT NULL,
    id_subject       INT NULL,
    role             ENUM('user', 'model') NOT NULL,
    content          TEXT NOT NULL,
    is_analyzed      TINYINT(1) DEFAULT 0 NOT NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_chat_logs_user
        FOREIGN KEY (id_user) REFERENCES user (id_user)
            ON DELETE CASCADE,
    CONSTRAINT fk_chat_logs_subject
        FOREIGN KEY (id_subject) REFERENCES subject (id_subject)
            ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_logs_unanalyzed ON chat_logs (is_analyzed, id_user);
CREATE INDEX IF NOT EXISTS idx_chat_logs_user_subject ON chat_logs (id_user, id_subject);

-- AI-generated student insights (Phase 2: Hourly Worker)
CREATE TABLE IF NOT EXISTS student_insights (
    id_insight       INT AUTO_INCREMENT PRIMARY KEY,
    id_user          INT NOT NULL,
    id_subject       INT NULL,
    knowledge_gaps   JSON NULL,
    sentiment        VARCHAR(50) NULL,
    study_tips       JSON NULL,
    raw_analysis     TEXT NULL,
    messages_count   INT DEFAULT 0,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_insights_user
        FOREIGN KEY (id_user) REFERENCES user (id_user)
            ON DELETE CASCADE,
    CONSTRAINT fk_student_insights_subject
        FOREIGN KEY (id_subject) REFERENCES subject (id_subject)
            ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_student_insights_user ON student_insights (id_user, created_at);

-- Aggregated class reports for professors (Phase 3: Aggregator)
CREATE TABLE IF NOT EXISTS class_reports (
    id_report        INT AUTO_INCREMENT PRIMARY KEY,
    id_professor     INT NOT NULL,
    id_section       INT NULL,
    id_subject       INT NULL,
    trending_problems JSON NULL,
    suggested_topics  JSON NULL,
    summary          TEXT NULL,
    students_analyzed INT DEFAULT 0,
    period_start     TIMESTAMP NULL,
    period_end       TIMESTAMP NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_class_reports_professor
        FOREIGN KEY (id_professor) REFERENCES user (id_user)
            ON DELETE CASCADE,
    CONSTRAINT fk_class_reports_section
        FOREIGN KEY (id_section) REFERENCES section (id_section)
            ON DELETE SET NULL,
    CONSTRAINT fk_class_reports_subject
        FOREIGN KEY (id_subject) REFERENCES subject (id_subject)
            ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_class_reports_professor ON class_reports (id_professor, created_at);
