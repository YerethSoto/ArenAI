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
export async function listStudentsBySection(sectionId) {
    const result = await db.query(`SELECT
        u.id_user,
        u.username,
        u.name,
        u.last_name,
        u.email,
        u.phone_number,
        us.role_in_section,
        sp.email_guardian,
        sp.score_average,
        sp.quiz_streak
     FROM user_section us
     INNER JOIN \`user\` u ON u.id_user = us.id_user
     INNER JOIN student_profile sp ON sp.id_user = u.id_user
     WHERE us.id_section = ?
     ORDER BY u.name, u.last_name, u.username`, [sectionId]);
    return result.rows;
}
