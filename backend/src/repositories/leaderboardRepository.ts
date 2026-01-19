import { db } from '../db/pool.js';

export interface LeaderboardEntry {
    id_user: number;
    name: string;
    avatar: string | null;
    arena_trophies: number;
    quiz_avg: number;
    quiz_count: number;
    total_score: number;
}

/**
 * Get leaderboard for a specific section.
 * Calculates total score based on:
 * - Arena trophies (battles won)
 * - Quiz average score
 * - Utilization (quiz participation)
 */
export async function getLeaderboardBySection(sectionId: number): Promise<LeaderboardEntry[]> {
    const result = await db.query<LeaderboardEntry>(`
    SELECT 
      u.id_user,
      u.name,
      u.profile_picture_name as avatar,
      COALESCE(battles.wins, 0) as arena_trophies,
      COALESCE(quizzes.avg_score, 0) as quiz_avg,
      COALESCE(quizzes.quiz_count, 0) as quiz_count,
      (
        COALESCE(battles.wins, 0) * 1 +
        COALESCE(quizzes.avg_score, 0) * 20 +
        LEAST(COALESCE(quizzes.quiz_count, 0), 100) * 15
      ) as total_score
    FROM user u
    INNER JOIN user_section us ON u.id_user = us.id_user
    INNER JOIN student_profile sp ON u.id_user = sp.id_user
    LEFT JOIN (
      SELECT 
        id_user_1 as id_user,
        SUM(CASE WHEN winner = 1 THEN 1 ELSE 0 END) as wins
      FROM battle_minigame
      GROUP BY id_user_1
      UNION ALL
      SELECT 
        id_user_2 as id_user,
        SUM(CASE WHEN winner = 0 THEN 1 ELSE 0 END) as wins
      FROM battle_minigame
      GROUP BY id_user_2
    ) battles ON u.id_user = battles.id_user
    LEFT JOIN (
      SELECT 
        id_student,
        AVG(score) as avg_score,
        COUNT(*) as quiz_count
      FROM quiz_student
      WHERE score IS NOT NULL
      GROUP BY id_student
    ) quizzes ON u.id_user = quizzes.id_student
    WHERE us.id_section = ?
    ORDER BY total_score DESC
    LIMIT 50
  `, [sectionId]);

    return result.rows;
}

/**
 * Get global leaderboard (all students).
 */
export async function getGlobalLeaderboard(): Promise<LeaderboardEntry[]> {
    const result = await db.query<LeaderboardEntry>(`
    SELECT 
      u.id_user,
      u.name,
      u.profile_picture_name as avatar,
      COALESCE(battles.wins, 0) as arena_trophies,
      COALESCE(quizzes.avg_score, 0) as quiz_avg,
      COALESCE(quizzes.quiz_count, 0) as quiz_count,
      (
        COALESCE(battles.wins, 0) * 1 +
        COALESCE(quizzes.avg_score, 0) * 20 +
        LEAST(COALESCE(quizzes.quiz_count, 0), 100) * 15
      ) as total_score
    FROM user u
    INNER JOIN student_profile sp ON u.id_user = sp.id_user
    LEFT JOIN (
      SELECT 
        id_user_1 as id_user,
        SUM(CASE WHEN winner = 1 THEN 1 ELSE 0 END) as wins
      FROM battle_minigame
      GROUP BY id_user_1
      UNION ALL
      SELECT 
        id_user_2 as id_user,
        SUM(CASE WHEN winner = 0 THEN 1 ELSE 0 END) as wins
      FROM battle_minigame
      GROUP BY id_user_2
    ) battles ON u.id_user = battles.id_user
    LEFT JOIN (
      SELECT 
        id_student,
        AVG(score) as avg_score,
        COUNT(*) as quiz_count
      FROM quiz_student
      WHERE score IS NOT NULL
      GROUP BY id_student
    ) quizzes ON u.id_user = quizzes.id_student
    ORDER BY total_score DESC
    LIMIT 50
  `, []);

    return result.rows;
}
