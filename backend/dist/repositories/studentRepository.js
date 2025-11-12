import { db } from '../db/pool.js';
export async function getStudentTopicProgress(userId) {
    const result = await db.query(`SELECT
        st.id_topic,
        t.name AS topic_name,
        s.name_subject AS subject_name,
        st.score
     FROM student_topic st
     INNER JOIN topic t ON t.id_topic = st.id_topic
     INNER JOIN subject s ON s.id_subject = t.id_subject
     WHERE st.id_user = ?
     ORDER BY s.name_subject, t.name`, [userId]);
    return result.rows;
}
export async function upsertStudentTopicScore(payload) {
    await db.query(`INSERT INTO student_topic (id_user, id_topic, score)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE score = VALUES(score)`, [payload.userId, payload.topicId, payload.score]);
    const result = await db.query(`SELECT
        st.id_topic,
        t.name AS topic_name,
        s.name_subject AS subject_name,
        st.score
     FROM student_topic st
     INNER JOIN topic t ON t.id_topic = st.id_topic
     INNER JOIN subject s ON s.id_subject = t.id_subject
     WHERE st.id_user = ? AND st.id_topic = ?`, [payload.userId, payload.topicId]);
    return result.rows[0];
}
