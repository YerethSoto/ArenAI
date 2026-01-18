
const STORAGE_KEY = 'aren_learning_stats';

export interface QuizResult {
    subject: string;
    score: number;        // Points earned
    correctCount: number;
    totalQuestions: number;
    timestamp: number;
}

export interface SubjectStats {
    subject: string;
    quizzesTaken: number;
    averageScore: number; // Average accuracy percentage (0-100)
    totalCorrect: number;
    totalQuestionsAnswered: number;
    mastery: number; // 0-100 percentage based on accuracy
}


import { achievementsService } from './achievementsService';

export const learningStatsService = {
    getAllResults(): QuizResult[] {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    },

    saveResult(result: QuizResult) {
        const results = this.getAllResults();
        results.push(result);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(results));

        // CHECK ACHIEVEMENTS
        achievementsService.checkAchievement('quizzes_taken', results.length);

        // Perfect Score Check
        if (result.totalQuestions > 0 && result.correctCount === result.totalQuestions) {
            // We don't have a direct 'score' check in achievementsService aimed at "1 perfect score",
            // but 'streak' maps to 'perfect_streak' in the service, which might be "Consecutive Perfect Scores"?
            // For simplicity, let's map 'streak' achievement to act as "Total Perfect Quizzes" or "Current Streak of Perfect Quizzes"
            // Since 'perfect_streak' implies consecutive, we need to calculate consecutive perfects.

            let consecutive = 0;
            // Iterate backwards
            for (let i = results.length - 1; i >= 0; i--) {
                const r = results[i];
                if (r.correctCount === r.totalQuestions) {
                    consecutive++;
                } else {
                    break;
                }
            }
            achievementsService.checkAchievement('streak', consecutive);
        }
    },

    getSubjectStats(subject: string): SubjectStats {
        const allResults = this.getAllResults();
        const subjectResults = allResults.filter(r => r.subject === subject);

        if (subjectResults.length === 0) {
            return {
                subject,
                quizzesTaken: 0,
                averageScore: 0,
                totalCorrect: 0,
                totalQuestionsAnswered: 0,
                mastery: 0
            };
        }

        const totalScore = subjectResults.reduce((sum, r) => sum + r.score, 0);
        const totalCorrect = subjectResults.reduce((sum, r) => sum + r.correctCount, 0);
        const totalQuestions = subjectResults.reduce((sum, r) => sum + r.totalQuestions, 0);

        // Mastery = Overall Accuracy Percentage (All questions combined)
        const mastery = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

        // Average Accuracy = Average of individual quiz percentages
        const totalPercentage = subjectResults.reduce((sum, r) => {
            const accuracy = r.totalQuestions > 0 ? (r.correctCount / r.totalQuestions) * 100 : 0;
            return sum + accuracy;
        }, 0);

        const averageAccuracy = Math.round(totalPercentage / subjectResults.length);

        return {
            subject,
            quizzesTaken: subjectResults.length,
            averageScore: averageAccuracy, // Now returns percentage (0-100)
            totalCorrect,
            totalQuestionsAnswered: totalQuestions,
            mastery
        };
    },

    getAllSubjectStats(): SubjectStats[] {
        // Get unique subjects
        const results = this.getAllResults();
        const subjects = Array.from(new Set(results.map(r => r.subject)));

        // Add default subjects if empty
        const defaultSubjects = ["Math", "Science", "History", "Spanish", "SocialStudies"];
        const allSubjects = Array.from(new Set([...subjects, ...defaultSubjects]));

        return allSubjects.map(sub => this.getSubjectStats(sub));
    }
};
