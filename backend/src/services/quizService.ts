import * as quizRepo from '../repositories/quizRepository.js';

export const quizService = {
    // Create a new quiz with questions
    async createFullQuiz(payload: {
        professorId: number;
        subjectId: number;
        name: string;
        description?: string;
        level: string;
        language?: string;
        questions: Array<{
            topicId?: number | null;
            questionText: string;
            points?: number;
            allowMultiple?: boolean;
            option1: string;
            option2: string;
            option3?: string | null;
            option4?: string | null;
            correctOptions: string;
        }>;
    }) {
        // Create the quiz header
        const quizId = await quizRepo.createQuiz({
            professorId: payload.professorId,
            subjectId: payload.subjectId,
            name: payload.name,
            description: payload.description,
            level: payload.level,
            language: payload.language,
        });

        // Add all questions
        for (const q of payload.questions) {
            await quizRepo.addQuestionToQuiz({
                quizId,
                topicId: q.topicId,
                questionText: q.questionText,
                points: q.points,
                allowMultiple: q.allowMultiple,
                option1: q.option1,
                option2: q.option2,
                option3: q.option3,
                option4: q.option4,
                correctOptions: q.correctOptions,
            });
        }

        return quizId;
    },

    // Get quiz by ID
    getQuizById: quizRepo.getQuizById,

    // Get full quiz with questions
    getFullQuiz: quizRepo.getFullQuiz,

    // List quizzes by professor
    listQuizzesByProfessor: quizRepo.listQuizzesByProfessor,

    // List public quizzes for community/popular section
    listPublicQuizzes: quizRepo.listPublicQuizzes,

    // List quizzes by subject
    listQuizzesBySubject: quizRepo.listQuizzesBySubject,

    // Get quiz questions
    getQuestions: quizRepo.getQuizQuestions,

    // Delete quiz
    deleteQuiz: quizRepo.deleteQuiz,

    // Get quiz count
    getQuizCount: quizRepo.getQuizCountByProfessor,

    // Rate a quiz
    rateQuiz: quizRepo.rateQuiz,

    // Increment downloads
    incrementDownloads: quizRepo.incrementDownloads,

    // Copy quiz to library (with credit to original creator)
    copyQuizToLibrary: quizRepo.copyQuizToLibrary,
};
