// Battle Stats Tracking Service
// Stores and manages battle statistics in localStorage

interface BattleStats {
  wins: number;
  losses: number;
  streak: number;
  lastResult: 'win' | 'loss' | null;
}

const STORAGE_KEY = 'aren_battle_stats';


import { achievementsService } from './achievementsService';

export const battleStatsService = {
  // Get current stats
  getStats(): BattleStats {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      wins: 0,
      losses: 0,
      streak: 0,
      lastResult: null
    };
  },

  // Record a win
  recordWin() {
    const stats = this.getStats();
    stats.wins += 1;

    // Update streak
    if (stats.lastResult === 'win') {
      stats.streak += 1;
    } else {
      stats.streak = 1;
    }

    stats.lastResult = 'win';
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));

    // CHECK ACHIEVEMENTS
    achievementsService.checkAchievement('battle_wins', stats.wins);
    if (stats.streak > 0) {
      achievementsService.checkAchievement('streak', stats.streak);
    }
    achievementsService.checkAchievement('battles_played', stats.wins + stats.losses);

    return stats;
  },

  // Record a loss
  recordLoss() {
    const stats = this.getStats();
    stats.losses += 1;
    stats.streak = 0; // Reset streak on loss
    stats.lastResult = 'loss';
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));

    // Check battles played
    achievementsService.checkAchievement('battles_played', stats.wins + stats.losses);

    // Reset Streak Achievement Tracking
    achievementsService.checkAchievement('streak', 0);

    return stats;
  },

  // Calculate win rate percentage
  getWinRate(): number {
    const stats = this.getStats();
    const total = stats.wins + stats.losses;
    if (total === 0) return 0;
    return Math.round((stats.wins / total) * 100);
  },

  // Reset all stats
  resetStats() {
    localStorage.removeItem(STORAGE_KEY);
  }
};
