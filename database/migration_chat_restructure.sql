-- ==========================================================
-- DATABASE MIGRATION: Restructure Chat and Insights Tables
-- ==========================================================
-- This migration replaces the old fragmented tables with a 
-- standardized, optimized schema.
--
-- OLD TABLES REMOVED:
--   - chatbot_message, chatbot, chat_logs
--   - student_insights, class_reports
--
-- NEW TABLES CREATED:
--   - learning_chat_history (unified chat storage)
--   - student_class_summary (per-student AI analysis)
--   - professor_class_report (aggregated class report)
-- ==========================================================

-- ==========================================================
-- PASO 1: LIMPIEZA TOTAL (BORRAR TABLAS VIEJAS Y REDUNDANTES)
-- ==========================================================
SET FOREIGN_KEY_CHECKS = 0;

-- Borramos tablas de chat redundantes
DROP TABLE IF EXISTS `chatbot_message`;
DROP TABLE IF EXISTS `chatbot`;
DROP TABLE IF EXISTS `chat_logs`;

-- Borramos tablas de reportes mal estructuradas
DROP TABLE IF EXISTS `student_insights`;
DROP TABLE IF EXISTS `class_reports`;

SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================================
-- PASO 2: CREAR LA TABLA MAESTRA DE CHAT (UNIFICADA)
-- ==========================================================
-- Esta tabla guarda el historial para el UI y para el análisis de IA.
CREATE TABLE `learning_chat_history` (
    `id_message` BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    -- Vínculos
    `id_user` INT NOT NULL,
    `id_subject` INT NOT NULL, 
    `id_class` INT NULL, -- NULL si el estudiante estudia por su cuenta, ID si es durante una clase
    
    -- Contenido
    `role` ENUM('user', 'model') NOT NULL,
    `content` TEXT NOT NULL,
    
    -- Banderas de Procesamiento (Para ahorrar tokens de IA)
    `is_analyzed` BOOLEAN DEFAULT FALSE, 
    
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Relaciones
    CONSTRAINT `fk_lch_user` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`) ON DELETE CASCADE,
    CONSTRAINT `fk_lch_subject` FOREIGN KEY (`id_subject`) REFERENCES `subject` (`id_subject`),
    CONSTRAINT `fk_lch_class` FOREIGN KEY (`id_class`) REFERENCES `class` (`id_class`) ON DELETE SET NULL
);

-- Índices de Alta Velocidad
-- 1. Para que el Cron Job encuentre rápido los mensajes nuevos de un usuario
CREATE INDEX `idx_lch_analysis_queue` ON `learning_chat_history` (`id_user`, `is_analyzed`);
-- 2. Para que la App cargue el historial del chat rápido
CREATE INDEX `idx_lch_history` ON `learning_chat_history` (`id_user`, `id_subject`, `created_at`);


-- ==========================================================
-- PASO 3: TABLA DE RESUMEN INDIVIDUAL (MAP - JSON OPTIMIZADO)
-- ==========================================================
-- Guarda el feedback de la IA para un estudiante en una clase específica.
CREATE TABLE `student_class_summary` (
    `id_summary` BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    `id_class` INT NOT NULL,
    `id_user` INT NOT NULL,
    
    -- Análisis de la IA
    `summary_text` TEXT NOT NULL,
    
    -- JSON Nativo para listas eficientes
    `strengths` JSON DEFAULT NULL,       -- Ej: ["Algebra", "Derivadas básicas"]
    `weaknesses` JSON DEFAULT NULL,      -- Ej: ["Integrales", "Regla de la cadena"]
    `study_tips` JSON DEFAULT NULL,      -- Ej: ["Ver video X", "Practicar ejercicios Y"]
    
    -- Bandera para el Reporte del Profesor
    `is_processed_for_professor` BOOLEAN DEFAULT FALSE, 
    
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Regla: Un estudiante solo tiene un resumen activo por clase (se va actualizando)
    UNIQUE KEY `unique_summary_per_class` (`id_class`, `id_user`),
    
    CONSTRAINT `fk_scs_class` FOREIGN KEY (`id_class`) REFERENCES `class` (`id_class`) ON DELETE CASCADE,
    CONSTRAINT `fk_scs_user` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`) ON DELETE CASCADE
);

-- ==========================================================
-- PASO 4: TABLA DE REPORTE AL PROFESOR (REDUCE - AGREGADO)
-- ==========================================================
-- Guarda el resumen general de toda la clase basado en los sumarios individuales.
CREATE TABLE `professor_class_report` (
    `id_report` BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    `id_class` INT NOT NULL,
    
    -- Resumen Ejecutivo
    `general_summary` TEXT NOT NULL,
    
    -- Estadísticas y Datos Agregados en JSON
    `top_confusion_topics` JSON DEFAULT NULL,  -- Ej: [{"topic": "Arrays", "count": 15}]
    `sentiment_average` VARCHAR(50) DEFAULT NULL,
    `suggested_action` TEXT DEFAULT NULL,
    
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT `fk_pcr_class` FOREIGN KEY (`id_class`) REFERENCES `class` (`id_class`) ON DELETE CASCADE
);

-- Índice para buscar reportes por fecha/clase rápidamente
CREATE INDEX `idx_pcr_class_date` ON `professor_class_report` (`id_class`, `created_at`);
