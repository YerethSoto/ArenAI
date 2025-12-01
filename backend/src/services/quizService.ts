import * as quizRepo from '../repositories/quizRepository.js';

export const quizService = {
    createQuiz: quizRepo.createQuiz,
    getQuizById: quizRepo.getQuizById,
    listQuizzesByClass: quizRepo.listQuizzesByClass,
    addQuestion: quizRepo.addQuestionToQuiz,
    getQuestions: quizRepo.getQuizQuestions,
    recordScore: quizRepo.recordStudentQuizScore,
    getStudentScore: quizRepo.getStudentQuizScore,
};
