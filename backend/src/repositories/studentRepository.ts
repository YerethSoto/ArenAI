import type { ResultSetHeader } from 'mysql2';
import { db } from '../db/pool.js';
import type { StudentProgressRow } from '../types.js';

interface SectionStudentRow {
  id_user: number;
  username: string;
  name: string;
  last_name: string | null;
  email: string;
  phone_number: string | null;
  role_in_section: string | null;
  email_guardian: string | null;
  score_average: string | null;
}

export async function getStudentTopicProgress(userId: number) {
  const result = await db.query<StudentProgressRow>(
    `SELECT
        st.id_topic,
        t.name AS topic_name,
        s.name_subject AS subject_name,
        st.score
     FROM student_topic st
     INNER JOIN topic t ON t.id_topic = st.id_topic
     INNER JOIN subject s ON s.id_subject = t.id_subject
     WHERE st.id_user = ?
     ORDER BY s.name_subject, t.name`,
    [userId]
  );

  return result.rows;
}

export async function upsertStudentTopicScore(payload: { userId: number; topicId: number; score: number | null }) {
  await db.query<ResultSetHeader>(
    `INSERT INTO student_topic (id_user, id_topic, score)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE score = VALUES(score)`,
    [payload.userId, payload.topicId, payload.score]
  );

  const result = await db.query<StudentProgressRow>(
    `SELECT
        st.id_topic,
        t.name AS topic_name,
        s.name_subject AS subject_name,
        st.score
     FROM student_topic st
     INNER JOIN topic t ON t.id_topic = st.id_topic
     INNER JOIN subject s ON s.id_subject = t.id_subject
     WHERE st.id_user = ? AND st.id_topic = ?`,
    [payload.userId, payload.topicId]
  );

  return result.rows[0];
}

export async function listStudentsBySection(sectionId: number) {
  const result = await db.query<SectionStudentRow>(
    `SELECT
        u.id_user,
        u.username,
        u.name,
        u.last_name,
        u.email,
        u.phone_number,
        us.role_in_section,
        sp.email_guardian,
        sp.score_average
     FROM user_section us
     INNER JOIN \`user\` u ON u.id_user = us.id_user
     INNER JOIN student_profile sp ON sp.id_user = u.id_user
     WHERE us.id_section = ?
     ORDER BY u.name, u.last_name, u.username`,
    [sectionId]
  );

  return result.rows;
}
