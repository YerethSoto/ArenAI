
const STORAGE_KEY = 'aren_progression';

export interface ProgressionStats {
    xp: number;
    level: number;
    totalPoints: number; // Cumulative points/score
}

export const progressionService = {
    getStats(): ProgressionStats {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error("Failed to load progression stats", e);
        }

        // Default starting stats
        return {
            xp: 0,
            level: 1,
            totalPoints: 0
        };
    },

    // Add XP and calculate level up
    // Formula: Level = floor(sqrt(XP / 50)) + 1
    // XP needed for level L: 50 * (L-1)^2
    addXp(amount: number): { stats: ProgressionStats, leveledUp: boolean, levelsGained: number } {
        const stats = this.getStats();
        const oldLevel = stats.level;

        stats.xp += amount;
        stats.totalPoints += amount;

        // Calculate new level
        // Example: 0 XP = Lvl 1. 50 XP = Lvl 2. 200 XP = Lvl 3.
        const newLevel = Math.floor(Math.sqrt(stats.xp / 50)) + 1;

        // Ensure we don't de-level (though unlikely with addXp)
        stats.level = Math.max(stats.level, newLevel);

        const levelsGained = stats.level - oldLevel;
        const leveledUp = levelsGained > 0;

        this.saveStats(stats);

        return { stats, leveledUp, levelsGained };
    },

    saveStats(stats: ProgressionStats) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
        } catch (e) {
            console.error("Failed to save progression stats", e);
        }
    },

    // Helper to get XP required for next level
    getNextLevelXp(currentLevel: number): number {
        // Inverse of formula: XP = 50 * (Level)^2
        // If current is 1, next is 2. XP needed for 2 is 50 * (2-1)^2 = 50.
        // Wait, let's check formula: L = floor(sqrt(X/50)) + 1
        // L-1 = floor(sqrt(X/50))
        // (L-1)^2 = X/50
        // X = 50 * (L-1)^2  <-- This is XP for START of level L

        // XP for START of NEXT level (L+1):
        // X_next = 50 * ((L+1)-1)^2 = 50 * L^2

        return 50 * Math.pow(currentLevel, 2);
    }
};
