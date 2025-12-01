SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- Limpieza de objetos previos que se recrean en este script
DROP TRIGGER IF EXISTS trg_enforce_same_subject_ins;
DROP TRIGGER IF EXISTS trg_enforce_same_subject_upd;
DROP TRIGGER IF EXISTS trg_class_professor_check_ins;
DROP TRIGGER IF EXISTS trg_class_professor_check_upd;
DROP TRIGGER IF EXISTS trg_cs_student_check_ins;
DROP TRIGGER IF EXISTS trg_cs_student_check_upd;
DROP TRIGGER IF EXISTS trg_cst_student_check_ins;
DROP TRIGGER IF EXISTS trg_cst_student_check_upd;

DROP FUNCTION IF EXISTS enforce_same_subject_for_class_topic;
DROP FUNCTION IF EXISTS ensure_user_is_professor;
DROP FUNCTION IF EXISTS ensure_user_is_student;

-- =========================================================
-- 1) INSTITUCIÓN / SECCIÓN
-- =========================================================
CREATE TABLE IF NOT EXISTS institution (
  id_institution   INT AUTO_INCREMENT PRIMARY KEY,
  name_institution VARCHAR(255) NOT NULL UNIQUE,
  score_average    DECIMAL(5,2)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS section (
  id_section       INT AUTO_INCREMENT PRIMARY KEY,
  section_number   VARCHAR(255) NOT NULL,
  grade            VARCHAR(100) NOT NULL,
  id_institution   INT NOT NULL,
  UNIQUE (id_institution, section_number),
  CONSTRAINT fk_section_institution
    FOREIGN KEY (id_institution) REFERENCES institution(id_institution)
    ON DELETE RESTRICT
) ENGINE = InnoDB;

-- =========================================================
-- 2) MATERIAS / TEMAS / RECURSOS / RELACIONES TEMÁTICAS
-- =========================================================
CREATE TABLE IF NOT EXISTS subject (
  id_subject       INT AUTO_INCREMENT PRIMARY KEY,
  name_subject     VARCHAR(255) NOT NULL UNIQUE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS topic (
  id_topic         INT AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(255) NOT NULL,
  id_subject       INT NOT NULL,
  description      TEXT,
  UNIQUE (id_subject, name),
  CONSTRAINT fk_topic_subject
    FOREIGN KEY (id_subject) REFERENCES subject(id_subject)
    ON DELETE RESTRICT
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS topic_father_son_relation (
  id_topic_father_son_relation INT AUTO_INCREMENT PRIMARY KEY,
  id_topic_father              INT NOT NULL,
  id_topic_son                 INT NOT NULL,
  correlation_coefficient      DECIMAL(5,2),
  CONSTRAINT fk_topic_relation_father
    FOREIGN KEY (id_topic_father) REFERENCES topic(id_topic)
    ON DELETE CASCADE,
  CONSTRAINT fk_topic_relation_son
    FOREIGN KEY (id_topic_son) REFERENCES topic(id_topic)
    ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS topic_resource (
  id_topic_resource INT AUTO_INCREMENT PRIMARY KEY,
  id_topic          INT NOT NULL,
  resource_source   VARCHAR(1024) NOT NULL,
  description       TEXT,
  resource_quality  DECIMAL(5,2),
  CONSTRAINT fk_topic_resource_topic
    FOREIGN KEY (id_topic) REFERENCES topic(id_topic)
    ON DELETE CASCADE
) ENGINE = InnoDB;

-- =========================================================
-- 3) USUARIOS UNIFICADOS + PERFILES
-- =========================================================
CREATE TABLE IF NOT EXISTS `user` (
  id_user         INT AUTO_INCREMENT PRIMARY KEY,
  username        VARCHAR(100) NOT NULL UNIQUE,
  email           VARCHAR(255) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  name            VARCHAR(150) NOT NULL,
  last_name       VARCHAR(200),
  phone_number    VARCHAR(50),
  id_institution  INT,
  role            VARCHAR(30),
  CONSTRAINT fk_user_institution
    FOREIGN KEY (id_institution) REFERENCES institution(id_institution)
    ON DELETE SET NULL
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS student_profile (
  id_user        INT PRIMARY KEY,
  email_guardian VARCHAR(255),
  score_average  DECIMAL(5,2),
  CONSTRAINT fk_student_profile_user
    FOREIGN KEY (id_user) REFERENCES `user`(id_user)
    ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS professor_profile (
  id_user        INT PRIMARY KEY,
  grade          VARCHAR(100),
  CONSTRAINT fk_professor_profile_user
    FOREIGN KEY (id_user) REFERENCES `user`(id_user)
    ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS user_section (
  id_user         INT NOT NULL,
  id_section      INT NOT NULL,
  role_in_section VARCHAR(30),
  PRIMARY KEY (id_user, id_section),
  CONSTRAINT fk_user_section_user
    FOREIGN KEY (id_user) REFERENCES `user`(id_user)
    ON DELETE CASCADE,
  CONSTRAINT fk_user_section_section
    FOREIGN KEY (id_section) REFERENCES section(id_section)
    ON DELETE CASCADE
) ENGINE = InnoDB;

-- =========================================================
-- 4) CLASES Y ASIGNACIÓN DE TEMAS
-- =========================================================
CREATE TABLE IF NOT EXISTS class (
  id_class          INT AUTO_INCREMENT PRIMARY KEY,
  id_professor      INT NOT NULL,
  name_class        VARCHAR(255) NOT NULL,
  id_subject        INT NOT NULL,
  id_section        INT NOT NULL,
  fecha             DATE,
  ai_summary        TEXT,
  current_questions_summary  TEXT,
  score_average     DECIMAL(5,2),
  UNIQUE (id_subject, id_section, name_class),
  CONSTRAINT fk_class_professor
    FOREIGN KEY (id_professor) REFERENCES `user`(id_user)
    ON DELETE RESTRICT,
  CONSTRAINT fk_class_subject
    FOREIGN KEY (id_subject) REFERENCES subject(id_subject)
    ON DELETE RESTRICT,
  CONSTRAINT fk_class_section
    FOREIGN KEY (id_section) REFERENCES section(id_section)
    ON DELETE RESTRICT
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS class_topic (
  id_class_topic    INT AUTO_INCREMENT PRIMARY KEY,
  id_class          INT NOT NULL,
  id_topic          INT NOT NULL,
  score_average     DECIMAL(5,2),
  UNIQUE (id_class, id_topic),
  CONSTRAINT fk_class_topic_class
    FOREIGN KEY (id_class) REFERENCES class(id_class)
    ON DELETE CASCADE,
  CONSTRAINT fk_class_topic_topic
    FOREIGN KEY (id_topic) REFERENCES topic(id_topic)
    ON DELETE RESTRICT
) ENGINE = InnoDB;

-- =========================================================
-- 5) PARTICIPACIÓN Y MÉTRICAS (USANDO id_user)
-- =========================================================
CREATE TABLE IF NOT EXISTS class_student (
  id_class          INT NOT NULL,
  id_user           INT NOT NULL,
  ai_summary        TEXT,
  interaction_coefficient DECIMAL(5,2),
  score_average     DECIMAL(5,2),
  PRIMARY KEY (id_class, id_user),
  CONSTRAINT fk_class_student_class
    FOREIGN KEY (id_class) REFERENCES class(id_class)
    ON DELETE CASCADE,
  CONSTRAINT fk_class_student_user
    FOREIGN KEY (id_user) REFERENCES `user`(id_user)
    ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS class_student_topic (
  id_class          INT NOT NULL,
  id_topic          INT NOT NULL,
  id_user           INT NOT NULL,
  score             DECIMAL(5,2),
  ai_summary        TEXT,
  PRIMARY KEY (id_class, id_topic, id_user),
  CONSTRAINT fk_cst_class_topic
    FOREIGN KEY (id_class, id_topic)
      REFERENCES class_topic (id_class, id_topic)
      ON DELETE CASCADE,
  CONSTRAINT fk_cst_class_student
    FOREIGN KEY (id_class, id_user)
      REFERENCES class_student (id_class, id_user)
      ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS student_topic (
  id_student_topic  INT AUTO_INCREMENT PRIMARY KEY,
  id_user           INT NOT NULL,
  id_topic          INT NOT NULL,
  score             DECIMAL(5,2),
  UNIQUE (id_user, id_topic),
  CONSTRAINT fk_student_topic_user
    FOREIGN KEY (id_user) REFERENCES `user`(id_user)
    ON DELETE CASCADE,
  CONSTRAINT fk_student_topic_topic
    FOREIGN KEY (id_topic) REFERENCES topic(id_topic)
    ON DELETE CASCADE
) ENGINE = InnoDB;

-- =========================================================
-- 6) AGREGADOS POR GRADO (OPCIONAL)
-- =========================================================
CREATE TABLE IF NOT EXISTS grade_score_average (
  id_grade_average  INT AUTO_INCREMENT PRIMARY KEY,
  id_institution    INT NOT NULL,
  grade             VARCHAR(100) NOT NULL,
  score             DECIMAL(5,2),
  UNIQUE (id_institution, grade),
  CONSTRAINT fk_grade_score_institution
    FOREIGN KEY (id_institution) REFERENCES institution(id_institution)
    ON DELETE CASCADE
) ENGINE = InnoDB;

-- =========================================================
-- 7) REGLAS DE INTEGRIDAD (TRIGGERS)
-- =========================================================
CREATE TRIGGER trg_enforce_same_subject_ins
BEFORE INSERT ON class_topic
FOR EACH ROW
BEGIN
  DECLARE v_class_subject INT;
  DECLARE v_topic_subject INT;

  SELECT id_subject INTO v_class_subject FROM class WHERE id_class = NEW.id_class;
  SELECT id_subject INTO v_topic_subject FROM topic WHERE id_topic = NEW.id_topic;

  IF v_class_subject IS NULL OR v_topic_subject IS NULL OR v_class_subject <> v_topic_subject THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'class_topic: topic no pertenece a la misma subject que class';
  END IF;
END;

CREATE TRIGGER trg_enforce_same_subject_upd
BEFORE UPDATE ON class_topic
FOR EACH ROW
BEGIN
  DECLARE v_class_subject INT;
  DECLARE v_topic_subject INT;

  SELECT id_subject INTO v_class_subject FROM class WHERE id_class = NEW.id_class;
  SELECT id_subject INTO v_topic_subject FROM topic WHERE id_topic = NEW.id_topic;

  IF v_class_subject IS NULL OR v_topic_subject IS NULL OR v_class_subject <> v_topic_subject THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'class_topic: topic no pertenece a la misma subject que class';
  END IF;
END;


CREATE TRIGGER trg_cs_student_check_ins
BEFORE INSERT ON class_student
FOR EACH ROW
BEGIN
  DECLARE v_count INT DEFAULT 0;
  SELECT COUNT(*) INTO v_count FROM student_profile s WHERE s.id_user = NEW.id_user;
  IF v_count = 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'El usuario indicado no tiene perfil de estudiante';
  END IF;
END;

CREATE TRIGGER trg_cs_student_check_upd
BEFORE UPDATE ON class_student
FOR EACH ROW
BEGIN
  DECLARE v_count INT DEFAULT 0;
  SELECT COUNT(*) INTO v_count FROM student_profile s WHERE s.id_user = NEW.id_user;
  IF v_count = 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'El usuario indicado no tiene perfil de estudiante';
  END IF;
END;

CREATE TRIGGER trg_cst_student_check_ins
BEFORE INSERT ON class_student_topic
FOR EACH ROW
BEGIN
  DECLARE v_count INT DEFAULT 0;
  SELECT COUNT(*) INTO v_count FROM student_profile s WHERE s.id_user = NEW.id_user;
  IF v_count = 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'El usuario indicado no tiene perfil de estudiante';
  END IF;
END;

CREATE TRIGGER trg_cst_student_check_upd
BEFORE UPDATE ON class_student_topic
FOR EACH ROW
BEGIN
  DECLARE v_count INT DEFAULT 0;
  SELECT COUNT(*) INTO v_count FROM student_profile s WHERE s.id_user = NEW.id_user;
  IF v_count = 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'El usuario indicado no tiene perfil de estudiante';
  END IF;
END;

-- =========================================================
-- 8) ÍNDICES ÚTILES (IDEMPOTENTES)
-- =========================================================
DROP PROCEDURE IF EXISTS ensure_index;
CREATE PROCEDURE ensure_index (
  IN in_table_name VARCHAR(64),
  IN in_index_name VARCHAR(64),
  IN in_index_expression VARCHAR(512),
  IN in_required_columns VARCHAR(512)
)
proc: BEGIN
  DECLARE idx_exists INT DEFAULT 0;
  DECLARE col_check TEXT DEFAULT in_required_columns;
  DECLARE column_missing INT DEFAULT 0;
  DECLARE col_name VARCHAR(64);
  DECLARE comma_pos INT DEFAULT 0;
  DECLARE col_exists INT DEFAULT 0;

  column_loop: WHILE col_check IS NOT NULL AND CHAR_LENGTH(TRIM(col_check)) > 0 DO
    SET comma_pos = LOCATE(',', col_check);
    IF comma_pos = 0 THEN
      SET col_name = TRIM(col_check);
      SET col_check = NULL;
    ELSE
      SET col_name = TRIM(SUBSTRING(col_check, 1, comma_pos - 1));
      SET col_check = SUBSTRING(col_check, comma_pos + 1);
    END IF;

    IF col_name <> '' THEN
      SELECT COUNT(*)
        INTO col_exists
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = in_table_name
        AND column_name = col_name;

      IF col_exists = 0 THEN
        SET column_missing = 1;
        LEAVE column_loop;
      END IF;
    END IF;
  END WHILE;

  IF column_missing = 1 THEN
    LEAVE proc;
  END IF;

  SELECT COUNT(*)
    INTO idx_exists
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = in_table_name
    AND index_name = in_index_name;

  IF idx_exists = 0 THEN
    SET @create_stmt = CONCAT('CREATE INDEX `', in_index_name, '` ON `', in_table_name, '` ', in_index_expression);
    PREPARE stmt FROM @create_stmt;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END;

CALL ensure_index('class', 'idx_class__subject_section', '(id_subject, id_section, fecha)', 'id_subject,id_section');
CALL ensure_index('topic', 'idx_topic__subject', '(id_subject)', 'id_subject');
CALL ensure_index('class_topic', 'idx_class_topic__topic', '(id_topic)', 'id_topic');
CALL ensure_index('class_student', 'idx_class_student__user', '(id_user)', 'id_user');
CALL ensure_index('class_student_topic', 'idx_class_student_topic__user', '(id_user)', 'id_user');
CALL ensure_index('student_topic', 'idx_student_topic__user', '(id_user)', 'id_user');

DROP PROCEDURE IF EXISTS ensure_index;
