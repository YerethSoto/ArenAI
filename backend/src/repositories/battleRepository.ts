import type { ResultSetHeader } from 'mysql2';
import { db } from '../db/pool.js';
import type { BattleMinigame, BattleMinigameQuestion } from '../types.js';

export async function createBattle(payload: {
    user1Id: number | null;
    user2Id: number | null;
    classId: number | null;
    subjectId: number | null;
    user1Health?: number | null;
    user2Health?: number | null;
}) {
    const result = await db.query<ResultSetHeader>(
        `INSERT INTO battle_minigame (id_user_1, id_user_2, id_class, id_subject, user_1_health, user_2_health)
     VALUES (?, ?, ?, ?, ?, ?)`,
        [
            payload.user1Id,
            payload.user2Id,
            payload.classId,
            payload.subjectId,
            payload.user1Health ?? 100,
            payload.user2Health ?? 100,
        ]
    );
    return result.rows[0].insertId;
}

export async function getBattleById(battleId: number) {
    const result = await db.query<BattleMinigame>(
        `SELECT * FROM battle_minigame WHERE id_battle_minigame = ?`,
        [battleId]
    );
    return result.rows.at(0) ?? null;
}

export async function updateBattleHealth(battleId: number, user1Health: number, user2Health: number) {
    await db.query(
        `UPDATE battle_minigame SET user_1_health = ?, user_2_health = ? WHERE id_battle_minigame = ?`,
        [user1Health, user2Health, battleId]
    );
}

export async function setBattleWinner(battleId: number, winner: boolean) {
    await db.query(
        `UPDATE battle_minigame SET winner = ? WHERE id_battle_minigame = ?`,
        [winner, battleId]
    );
}

export async function addQuestionToBattle(payload: {
    battleId: number;
    topicId: number | null;
    question: string;
    answer1: string | null;
    answer2: string | null;
    answer3: string | null;
    answer4: string | null;
}) {
    const result = await db.query<ResultSetHeader>(
        `INSERT INTO battle_minigame_question (id_battle_minigame, id_topic, question, answer1, answer2, answer3, answer4)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            payload.battleId,
            payload.topicId,
            payload.question,
            payload.answer1,
            payload.answer2,
            payload.answer3,
            payload.answer4,
        ]
    );
    return result.rows[0].insertId;
}

export async function getBattleQuestions(battleId: number) {
    const result = await db.query<BattleMinigameQuestion>(
        `SELECT * FROM battle_minigame_question WHERE id_battle_minigame = ?`,
        [battleId]
    );
    return result.rows;
}
