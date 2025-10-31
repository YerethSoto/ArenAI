export interface Institution {
  id_institution: number;
  name_institution: string;
  score_average: string | null;
}

export interface Section {
  id_section: number;
  name: string;
  grade: string;
  id_institution: number;
}

export interface Subject {
  id_subject: number;
  name_subject: string;
}

export interface Topic {
  id_topic: number;
  name: string;
  id_subject: number;
  description: string | null;
}

export interface ClassRecord {
  id_class: number;
  id_professor: number;
  name_class: string;
  id_subject: number;
  id_section: number;
  fecha: string | null;
  ai_summary: string | null;
  current_questions_summary: string | null;
  score_average: string | null;
}

export interface StudentProgressRow {
  id_topic: number;
  topic_name: string;
  subject_name: string;
  score: string | null;
}
