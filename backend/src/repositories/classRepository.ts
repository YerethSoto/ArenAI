import { db } from '../db/pool.js';
import type { ClassRecord } from '../types.js';

interface ClassTopicPayload {
  topicId: number;
  scoreAverage?: number | null;
}

interface ClassStudentPayload {
  userId: number;
  interactionCoefficient?: number | null;
  scoreAverage?: number | null;
  aiSummary?: string | null;
}

interface ClassStudentTopicPayload {
  userId: number;
  topicId: number;
  score?: number | null;
  aiSummary?: string | null;
}

export async function createClass(payload: {
  professorId: number;
  name: string;
  subjectId: number;
  sectionId: number;
  date?: string | null;
  aiSummary?: string | null;
  currentQuestionsSummary?: string | null;
  scoreAverage?: number | null;
}) {
  const result = await db.query<ClassRecord>(
    `INSERT INTO class (id_professor, name_class, id_subject, id_section, fecha, ai_summary, current_questions_summary, score_average)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id_class, id_professor, name_class, id_subject, id_section, fecha, ai_summary, current_questions_summary, score_average`,
    [
      payload.professorId,
      payload.name,
      payload.subjectId,
      payload.sectionId,
      payload.date ?? null,
      payload.aiSummary ?? null,
      payload.currentQuestionsSummary ?? null,
      payload.scoreAverage ?? null,
    ]
  );

  return result.rows[0];
}

export async function assignTopicsToClass(classId: number, topics: ClassTopicPayload[]) {
  if (!topics.length) return;
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    for (const { topicId, scoreAverage } of topics) {
      await client.query(
        `INSERT INTO class_topic (id_class, id_topic, score_average)
         VALUES ($1, $2, $3)
         ON CONFLICT (id_class, id_topic)
         DO UPDATE SET score_average = EXCLUDED.score_average`,
        [classId, topicId, scoreAverage ?? null]
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function enrollStudentsInClass(classId: number, students: ClassStudentPayload[]) {
  if (!students.length) return;
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    for (const student of students) {
      await client.query(
        `INSERT INTO class_student (id_class, id_user, ai_summary, interaction_coefficient, score_average)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id_class, id_user)
         DO UPDATE SET ai_summary = EXCLUDED.ai_summary,
                       interaction_coefficient = EXCLUDED.interaction_coefficient,
                       score_average = EXCLUDED.score_average`,
        [
          classId,
          student.userId,
          student.aiSummary ?? null,
          student.interactionCoefficient ?? null,
          student.scoreAverage ?? null,
        ]
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function recordClassStudentTopicScores(classId: number, entries: ClassStudentTopicPayload[]) {
  if (!entries.length) return;
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    for (const entry of entries) {
      await client.query(
        `INSERT INTO class_student_topic (id_class, id_topic, id_user, score, ai_summary)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id_class, id_topic, id_user)
         DO UPDATE SET score = EXCLUDED.score,
                       ai_summary = EXCLUDED.ai_summary`,
        [classId, entry.topicId, entry.userId, entry.score ?? null, entry.aiSummary ?? null]
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
