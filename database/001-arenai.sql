-- =========================================================
-- RESET: eliminar objetos previos (triggers, funciones, tablas, secuencias)
-- =========================================================
DROP TRIGGER IF EXISTS trg_enforce_same_subject_ins ON class_topic;
DROP TRIGGER IF EXISTS trg_class_professor_check ON class;
DROP TRIGGER IF EXISTS trg_cs_student_check ON class_student;
DROP TRIGGER IF EXISTS trg_cst_student_check ON class_student_topic;

DROP FUNCTION IF EXISTS enforce_same_subject_for_class_topic();
DROP FUNCTION IF EXISTS ensure_user_is_professor();
DROP FUNCTION IF EXISTS ensure_user_is_student();

DROP TABLE IF EXISTS user_section CASCADE;
DROP TABLE IF EXISTS professor_profile CASCADE;
DROP TABLE IF EXISTS student_profile CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;

DROP TABLE IF EXISTS class_student_topic CASCADE;
DROP TABLE IF EXISTS class_student CASCADE;
DROP TABLE IF EXISTS student_topic CASCADE;
DROP TABLE IF EXISTS class_topic CASCADE;
DROP TABLE IF EXISTS class CASCADE;

DROP TABLE IF EXISTS topic_resource CASCADE;
DROP TABLE IF EXISTS topic_father_son_relation CASCADE;
DROP TABLE IF EXISTS topic CASCADE;
DROP TABLE IF EXISTS subject CASCADE;

DROP TABLE IF EXISTS section CASCADE;
DROP TABLE IF EXISTS grade_score_average CASCADE;
DROP TABLE IF EXISTS institution CASCADE;

DROP SEQUENCE IF EXISTS seq_institution;
DROP SEQUENCE IF EXISTS seq_section;
DROP SEQUENCE IF EXISTS seq_subject;
DROP SEQUENCE IF EXISTS seq_topic;
DROP SEQUENCE IF EXISTS seq_topic_father_son_relation;
DROP SEQUENCE IF EXISTS seq_topic_resource;
DROP SEQUENCE IF EXISTS seq_user;
DROP SEQUENCE IF EXISTS seq_class;
DROP SEQUENCE IF EXISTS seq_class_topic;
DROP SEQUENCE IF EXISTS seq_student_topic;
DROP SEQUENCE IF EXISTS seq_grade_score_average;

-- =========================================================
-- SECUENCIAS
-- =========================================================
CREATE SEQUENCE seq_institution START 1;
CREATE SEQUENCE seq_section START 1;
CREATE SEQUENCE seq_subject START 1;
CREATE SEQUENCE seq_topic START 1;
CREATE SEQUENCE seq_topic_father_son_relation START 1;
CREATE SEQUENCE seq_topic_resource START 1;
CREATE SEQUENCE seq_user START 1;
CREATE SEQUENCE seq_class START 1;
CREATE SEQUENCE seq_class_topic START 1;
CREATE SEQUENCE seq_student_topic START 1;
CREATE SEQUENCE seq_grade_score_average START 1;

-- =========================================================
-- 1) INSTITUCIÓN / SECCIÓN
-- =========================================================
CREATE TABLE institution (
  id_institution   INTEGER PRIMARY KEY DEFAULT nextval('seq_institution'),
  name_institution VARCHAR(255) NOT NULL UNIQUE,
  score_average    NUMERIC(5,2)
);

CREATE TABLE section (
  id_section       INTEGER PRIMARY KEY DEFAULT nextval('seq_section'),
  name             VARCHAR(255) NOT NULL,
  grade            VARCHAR(100) NOT NULL,
  id_institution   INTEGER NOT NULL REFERENCES institution(id_institution) ON DELETE RESTRICT,
  UNIQUE (id_institution, name)
);

-- =========================================================
-- 2) MATERIAS / TEMAS / RECURSOS / RELACIONES TEMÁTICAS
-- =========================================================
CREATE TABLE subject (
  id_subject       INTEGER PRIMARY KEY DEFAULT nextval('seq_subject'),
  name_subject     VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE topic (
  id_topic         INTEGER PRIMARY KEY DEFAULT nextval('seq_topic'),
  name             VARCHAR(255) NOT NULL,
  id_subject       INTEGER NOT NULL REFERENCES subject(id_subject) ON DELETE RESTRICT,
  description      TEXT,
  UNIQUE (id_subject, name)
);

CREATE TABLE topic_father_son_relation (
  id_topic_father_son_relation INTEGER PRIMARY KEY DEFAULT nextval('seq_topic_father_son_relation'),
  id_topic_father              INTEGER NOT NULL REFERENCES topic(id_topic) ON DELETE CASCADE,
  id_topic_son                 INTEGER NOT NULL REFERENCES topic(id_topic) ON DELETE CASCADE,
  correlation_coefficient      NUMERIC(5,2)
);

CREATE TABLE topic_resource (
  id_topic_resource INTEGER PRIMARY KEY DEFAULT nextval('seq_topic_resource'),
  id_topic          INTEGER NOT NULL REFERENCES topic(id_topic) ON DELETE CASCADE,
  resource_source   VARCHAR(1024) NOT NULL,
  description       TEXT,
  resource_quality  NUMERIC(5,2)
);

-- =========================================================
-- 3) USUARIOS UNIFICADOS + PERFILES
-- =========================================================
CREATE TABLE "user" (
  id_user         INTEGER PRIMARY KEY DEFAULT nextval('seq_user'),
  username        VARCHAR(100) NOT NULL UNIQUE,
  email           VARCHAR(255) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  name            VARCHAR(150) NOT NULL,
  last_name       VARCHAR(200),
  phone_number    VARCHAR(50),
  id_institution  INTEGER REFERENCES institution(id_institution) ON DELETE SET NULL,
  role            VARCHAR(30)  -- opcional: 'student' | 'professor' | 'admin' ...
);

CREATE TABLE student_profile (
  id_user        INTEGER PRIMARY KEY REFERENCES "user"(id_user) ON DELETE CASCADE,
  email_guardian VARCHAR(255),
  score_average  NUMERIC(5,2)
);

CREATE TABLE professor_profile (
  id_user        INTEGER PRIMARY KEY REFERENCES "user"(id_user) ON DELETE CASCADE,
  grade          VARCHAR(100)
);

-- N:M usuario ↔ sección (roles por sección si aplica)
CREATE TABLE user_section (
  id_user        INTEGER NOT NULL REFERENCES "user"(id_user) ON DELETE CASCADE,
  id_section     INTEGER NOT NULL REFERENCES section(id_section) ON DELETE CASCADE,
  role_in_section VARCHAR(30),
  PRIMARY KEY (id_user, id_section)
);

-- =========================================================
-- 4) CLASES Y ASIGNACIÓN DE TEMAS
-- =========================================================
CREATE TABLE class (
  id_class          INTEGER PRIMARY KEY DEFAULT nextval('seq_class'),
  id_professor      INTEGER NOT NULL REFERENCES "user"(id_user) ON DELETE RESTRICT, -- debe tener perfil profesor
  name_class        VARCHAR(255) NOT NULL,
  id_subject        INTEGER NOT NULL REFERENCES subject(id_subject) ON DELETE RESTRICT,
  id_section        INTEGER NOT NULL REFERENCES section(id_section) ON DELETE RESTRICT,
  fecha             DATE,
  ai_summary        TEXT,
  current_questions_summary  TEXT,
  score_average     NUMERIC(5,2),
  UNIQUE (id_subject, id_section, name_class)
);

-- N:M class ↔ topic (solo temas de la misma subject; se valida con trigger)
CREATE TABLE class_topic (
  id_class_topic    INTEGER PRIMARY KEY DEFAULT nextval('seq_class_topic'),
  id_class          INTEGER NOT NULL REFERENCES class(id_class) ON DELETE CASCADE,
  id_topic          INTEGER NOT NULL REFERENCES topic(id_topic) ON DELETE RESTRICT,
  score_average     NUMERIC(5,2),
  UNIQUE (id_class, id_topic)
);

-- =========================================================
-- 5) PARTICIPACIÓN Y MÉTRICAS (USANDO id_user)
-- =========================================================
CREATE TABLE class_student (
  id_class          INTEGER NOT NULL REFERENCES class(id_class) ON DELETE CASCADE,
  id_user           INTEGER NOT NULL REFERENCES "user"(id_user) ON DELETE CASCADE, -- debe tener perfil estudiante
  ai_summary        TEXT,
  interaction_coefficient NUMERIC(5,2),
  score_average     NUMERIC(5,2),
  PRIMARY KEY (id_class, id_user)
);

CREATE TABLE class_student_topic (
  id_class          INTEGER NOT NULL,
  id_topic          INTEGER NOT NULL,
  id_user           INTEGER NOT NULL,
  score             NUMERIC(5,2),
  ai_summary        TEXT,
  PRIMARY KEY (id_class, id_topic, id_user),
  FOREIGN KEY (id_class, id_topic)
    REFERENCES class_topic (id_class, id_topic) ON DELETE CASCADE,
  FOREIGN KEY (id_class, id_user)
    REFERENCES class_student (id_class, id_user) ON DELETE CASCADE
);

-- Rendimiento longitudinal por tema (independiente de la clase)
CREATE TABLE student_topic (
  id_student_topic  INTEGER PRIMARY KEY DEFAULT nextval('seq_student_topic'),
  id_user           INTEGER NOT NULL REFERENCES "user"(id_user) ON DELETE CASCADE,
  id_topic          INTEGER NOT NULL REFERENCES topic(id_topic) ON DELETE CASCADE,
  score             NUMERIC(5,2),
  UNIQUE (id_user, id_topic)
);

-- =========================================================
-- 6) AGREGADOS POR GRADO (OPCIONAL)
-- =========================================================
CREATE TABLE grade_score_average (
  id_grade_average  INTEGER PRIMARY KEY DEFAULT nextval('seq_grade_score_average'),
  id_institution    INTEGER NOT NULL REFERENCES institution(id_institution) ON DELETE CASCADE,
  grade             VARCHAR(100) NOT NULL,
  score             NUMERIC(5,2),
  UNIQUE (id_institution, grade)
);

-- =========================================================
-- 7) REGLAS DE INTEGRIDAD (TRIGGERS)
-- =========================================================

-- A) El topic de class_topic debe pertenecer a la MISMA subject que la class
CREATE OR REPLACE FUNCTION enforce_same_subject_for_class_topic()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_class_subject INTEGER;
  v_topic_subject INTEGER;
BEGIN
  SELECT id_subject INTO v_class_subject FROM class  WHERE id_class = NEW.id_class;
  SELECT id_subject INTO v_topic_subject FROM topic  WHERE id_topic = NEW.id_topic;

  IF v_class_subject IS NULL OR v_topic_subject IS NULL OR v_class_subject <> v_topic_subject THEN
    RAISE EXCEPTION 'class_topic: topic % no pertenece a la misma subject que class %', NEW.id_topic, NEW.id_class;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_same_subject_ins
BEFORE INSERT OR UPDATE ON class_topic
FOR EACH ROW EXECUTE PROCEDURE enforce_same_subject_for_class_topic();

-- B) El id_professor de class debe tener perfil professor
CREATE OR REPLACE FUNCTION ensure_user_is_professor()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM professor_profile p WHERE p.id_user = NEW.id_professor) THEN
    RAISE EXCEPTION 'El usuario % no tiene perfil de profesor', NEW.id_professor;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_class_professor_check
BEFORE INSERT OR UPDATE ON class
FOR EACH ROW EXECUTE PROCEDURE ensure_user_is_professor();

-- C) En class_student y class_student_topic, el id_user debe tener perfil student
CREATE OR REPLACE FUNCTION ensure_user_is_student()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM student_profile s WHERE s.id_user = NEW.id_user) THEN
    RAISE EXCEPTION 'El usuario % no tiene perfil de estudiante', NEW.id_user;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_cs_student_check
BEFORE INSERT OR UPDATE ON class_student
FOR EACH ROW EXECUTE PROCEDURE ensure_user_is_student();

CREATE TRIGGER trg_cst_student_check
BEFORE INSERT OR UPDATE ON class_student_topic
FOR EACH ROW EXECUTE PROCEDURE ensure_user_is_student();

-- =========================================================
-- 8) ÍNDICES ÚTILES
-- =========================================================
CREATE INDEX idx_class__subject_section        ON class(id_subject, id_section, fecha);
CREATE INDEX idx_topic__subject                ON topic(id_subject);
CREATE INDEX idx_class_topic__topic            ON class_topic(id_topic);
CREATE INDEX idx_class_student__user           ON class_student(id_user);
CREATE INDEX idx_class_student_topic__user     ON class_student_topic(id_user);
CREATE INDEX idx_student_topic__user           ON student_topic(id_user);

DROP TABLE professor CASCADE;
DROP TABLE student CASCADE;