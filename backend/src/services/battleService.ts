import * as battleRepo from '../repositories/battleRepository.js';

export const battleService = {
    createBattle: battleRepo.createBattle,
    getBattleById: battleRepo.getBattleById,
    updateHealth: battleRepo.updateBattleHealth,
    setWinner: battleRepo.setBattleWinner,
    addQuestion: battleRepo.addQuestionToBattle,
    getQuestions: battleRepo.getBattleQuestions,
};
