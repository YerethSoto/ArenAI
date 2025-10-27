SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

-- ========================
-- 0) Secuencias
-- ========================
CREATE SEQUENCE seq_institution START 1;
CREATE SEQUENCE seq_section START 1;
CREATE SEQUENCE seq_subject START 1;
CREATE SEQUENCE seq_topic START 1;
CREATE SEQUENCE seq_topic_father_son_relation START 1;
CREATE SEQUENCE seq_topic_resource START 1;
CREATE SEQUENCE seq_professor START 1;
CREATE SEQUENCE seq_student START 1;
CREATE SEQUENCE seq_class START 1;
CREATE SEQUENCE seq_class_topic START 1;
CREATE SEQUENCE seq_student_topic START 1;
CREATE SEQUENCE seq_grade_score_average START 1;

-- ========================
-- 1) Institución / Sección
-- ========================
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

-- ========================
-- 2) Materias y Temas
-- ========================
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

-- ========================
-- 3) Personas
-- ========================
CREATE TABLE professor (
  id_professor     INTEGER PRIMARY KEY DEFAULT nextval('seq_professor'),
  username         VARCHAR(100) NOT NULL UNIQUE,
  email            VARCHAR(255) NOT NULL UNIQUE,
  name             VARCHAR(150) NOT NULL,
  last_name        VARCHAR(200),
  phone_number     VARCHAR(50),
  password_hash    VARCHAR(255) NOT NULL,
  id_institution   INTEGER REFERENCES institution(id_institution) ON DELETE SET NULL,
  grade            VARCHAR(100)
);

CREATE TABLE student (
  id_student       INTEGER PRIMARY KEY DEFAULT nextval('seq_student'),
  username         VARCHAR(100) NOT NULL UNIQUE,
  email_guardian   VARCHAR(255),
  name             VARCHAR(150) NOT NULL,
  last_name        VARCHAR(200),
  password_hash    VARCHAR(255) NOT NULL,
  id_institution   INTEGER REFERENCES institution(id_institution) ON DELETE SET NULL,
  section          VARCHAR(100),
  score_average    NUMERIC(5,2)
);

-- ========================
-- 4) Clases y asignación temática
-- ========================
CREATE TABLE class (
  id_class          INTEGER PRIMARY KEY DEFAULT nextval('seq_class'),
  id_professor      INTEGER NOT NULL REFERENCES professor(id_professor) ON DELETE RESTRICT,
  name_class        VARCHAR(255) NOT NULL,
  id_subject        INTEGER NOT NULL REFERENCES subject(id_subject) ON DELETE RESTRICT,
  id_section        INTEGER NOT NULL REFERENCES section(id_section) ON DELETE RESTRICT,
  fecha             DATE,
  ai_summary        TEXT,
  current_questions_summary  TEXT,
  score_average     NUMERIC(5,2),
  UNIQUE (id_subject, id_section, name_class)
);

-- N:M Class–Topic (PK surrogate + UNIQUE para FKs compuestas descendentes)
CREATE TABLE class_topic (
  id_class_topic    INTEGER PRIMARY KEY DEFAULT nextval('seq_class_topic'),
  id_class          INTEGER NOT NULL REFERENCES class(id_class) ON DELETE CASCADE,
  id_topic          INTEGER NOT NULL REFERENCES topic(id_topic) ON DELETE RESTRICT,
  score_average     NUMERIC(5,2),
  UNIQUE (id_class, id_topic)
);

-- ========================
-- 5) Participación y métricas
-- ========================
CREATE TABLE class_student (
  id_class          INTEGER NOT NULL REFERENCES class(id_class) ON DELETE CASCADE,
  id_student        INTEGER NOT NULL REFERENCES student(id_student) ON DELETE CASCADE,
  ai_summary        TEXT,
  interaction_coefficient NUMERIC(5,2),
  score_average     NUMERIC(5,2),
  PRIMARY KEY (id_class, id_student)
);

CREATE TABLE class_student_topic (
  id_class          INTEGER NOT NULL,
  id_topic          INTEGER NOT NULL,
  id_student        INTEGER NOT NULL,
  score             NUMERIC(5,2),
  ai_summary        TEXT,
  PRIMARY KEY (id_class, id_topic, id_student),
  FOREIGN KEY (id_class, id_topic)
    REFERENCES class_topic (id_class, id_topic) ON DELETE CASCADE,
  FOREIGN KEY (id_class, id_student)
    REFERENCES class_student (id_class, id_student) ON DELETE CASCADE
);

CREATE TABLE student_topic (
  id_student_topic  INTEGER PRIMARY KEY DEFAULT nextval('seq_student_topic'),
  id_student        INTEGER NOT NULL REFERENCES student(id_student) ON DELETE CASCADE,
  id_topic          INTEGER NOT NULL REFERENCES topic(id_topic) ON DELETE CASCADE,
  score             NUMERIC(5,2),
  UNIQUE (id_student, id_topic)
);

-- ========================
-- 6) Agregados por grado (opcional)
-- ========================
CREATE TABLE grade_score_average (
  id_grade_average  INTEGER PRIMARY KEY DEFAULT nextval('seq_grade_score_average'),
  id_institution    INTEGER NOT NULL REFERENCES institution(id_institution) ON DELETE CASCADE,
  grade             VARCHAR(100) NOT NULL,
  score             NUMERIC(5,2),
  UNIQUE (id_institution, grade)
);

-- ========================
-- 7) Regla extra: topic de class_topic debe ser de la MISMA subject
-- ========================
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

DROP TRIGGER IF EXISTS trg_enforce_same_subject_ins ON class_topic;
CREATE TRIGGER trg_enforce_same_subject_ins
BEFORE INSERT OR UPDATE ON class_topic
FOR EACH ROW
EXECUTE PROCEDURE enforce_same_subject_for_class_topic();

-- ========================
-- 8) Índices útiles
-- ========================
CREATE INDEX idx_class__subject_section   ON class(id_subject, id_section, fecha);
CREATE INDEX idx_topic__subject           ON topic(id_subject);
CREATE INDEX idx_class_topic__topic       ON class_topic(id_topic);
CREATE INDEX idx_class_student__student   ON class_student(id_student);
CREATE INDEX idx_class_student_topic__student ON class_student_topic(id_student);
CREATE INDEX idx_student_topic__student   ON student_topic(id_student);