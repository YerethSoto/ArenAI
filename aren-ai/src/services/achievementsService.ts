
import { Achievement } from '../types/student';

const ACHIEVEMENTS_KEY = 'aren_achievements_v1';

// Initial Definitions
const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
    { id: 'first_battle', category: 'combat', icon: '⚔️', maxProgress: 1, currentProgress: 0, rewardValue: 50, rewardType: 'XP', titleKey: 'achievements.items.first_battle.title', descKey: 'achievements.items.first_battle.description' },
    { id: 'battle_winner_5', category: 'combat', icon: '🏆', maxProgress: 5, currentProgress: 0, rewardValue: 200, rewardType: 'XP', titleKey: 'achievements.items.battle_winner_5.title', descKey: 'achievements.items.battle_winner_5.description' },
    { id: 'quiz_novice', category: 'study', icon: '📝', maxProgress: 3, currentProgress: 0, rewardValue: 100, rewardType: 'XP', titleKey: 'achievements.items.quiz_novice.title', descKey: 'achievements.items.quiz_novice.description' },
    { id: 'quiz_master', category: 'study', icon: '🧠', maxProgress: 10, currentProgress: 0, rewardValue: 500, rewardType: 'XP', titleKey: 'achievements.items.quiz_master.title', descKey: 'achievements.items.quiz_master.description' },
    { id: 'perfect_streak', category: 'study', icon: '🔥', maxProgress: 5, currentProgress: 0, rewardValue: 300, rewardType: 'XP', titleKey: 'achievements.items.perfect_streak.title', descKey: 'achievements.items.perfect_streak.description' },
    { id: 'social_butterfly', category: 'social', icon: '💬', maxProgress: 10, currentProgress: 0, rewardValue: 100, rewardType: 'XP', titleKey: 'achievements.items.social_butterfly.title', descKey: 'achievements.items.social_butterfly.description' }
];

export const achievementsService = {
    // Initialize or Load
    getAchievements: (): Achievement[] => {
        try {
            const stored = localStorage.getItem(ACHIEVEMENTS_KEY);
            if (!stored) {
                return ACHIEVEMENT_DEFINITIONS;
            }

            const savedProgress = JSON.parse(stored);

            // Merge definitions with saved progress (to handle updates/new achievements)
            return ACHIEVEMENT_DEFINITIONS.map(def => {
                const saved = savedProgress.find((s: Achievement) => s.id === def.id);
                return saved ? { ...def, currentProgress: saved.currentProgress } : def;
            });
        } catch (e) {
            console.error("Failed to load achievements", e);
            return ACHIEVEMENT_DEFINITIONS;
        }
    },

    saveAchievements: (achievements: Achievement[]) => {
        localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
    },

    // Core Logic: Update Progress
    checkAchievement: (type: 'battle_wins' | 'quizzes_taken' | 'streak' | 'chat_msg' | 'battles_played', value: number) => {
        const current = achievementsService.getAchievements();
        let notified = false;

        const updated = current.map(ach => {
            let newProgress = ach.currentProgress;

            // Mapping types to achievement IDs
            if (type === 'battles_played') {
                if (ach.id === 'first_battle') {
                    newProgress = value;
                }
            }
            if (type === 'battle_wins') {
                if (ach.id === 'battle_winner_5') {
                    newProgress = value;
                }
            }
            if (type === 'quizzes_taken') {
                if (ach.id === 'quiz_novice' || ach.id === 'quiz_master') {
                    newProgress = value;
                }
            }
            if (type === 'streak') {
                if (ach.id === 'perfect_streak') {
                    newProgress = value; // Needs to be the current streak
                }
            }

            // Check unlock state
            if (newProgress >= ach.maxProgress && ach.currentProgress < ach.maxProgress) {
                // JUST UNLOCKED!
                console.log(`🏆 Achievement Unlocked: ${ach.id}`);
                notified = true;
                // Ideally trigger a toast or notification here
            }

            return { ...ach, currentProgress: Math.min(newProgress, ach.maxProgress) }; // Cap at max
        });

        achievementsService.saveAchievements(updated);
        return notified;
    },

    // For debugging/reset
    reset: () => {
        localStorage.removeItem(ACHIEVEMENTS_KEY);
    }
};
