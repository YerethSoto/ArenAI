
import { progressionService } from './progressionService';

interface UnlockableItem {
    id: string;
    type: 'frame' | 'background' | 'mascot';
    nameKey: string;
    requiredLevel: number;
    assetUrl: string; // Or dynamic import logic
    isPremium?: boolean;
}

// Definition of All Available Cosmetics
const ALL_UNLOCKABLES: UnlockableItem[] = [
    // Frames
    { id: 'frame_default', type: 'frame', nameKey: 'unlockables.frames.default', requiredLevel: 1, assetUrl: 'default' },
    { id: 'frame_bronze', type: 'frame', nameKey: 'unlockables.frames.bronze', requiredLevel: 3, assetUrl: 'bronze' },
    { id: 'frame_silver', type: 'frame', nameKey: 'unlockables.frames.silver', requiredLevel: 6, assetUrl: 'silver' },
    { id: 'frame_gold', type: 'frame', nameKey: 'unlockables.frames.gold', requiredLevel: 10, assetUrl: 'gold' },
    { id: 'frame_purple', type: 'frame', nameKey: 'unlockables.frames.neon', requiredLevel: 15, assetUrl: 'neon_purple' },

    // Backgrounds
    { id: 'bg_default', type: 'background', nameKey: 'unlockables.bg.default', requiredLevel: 1, assetUrl: 'default' },
    { id: 'bg_space', type: 'background', nameKey: 'unlockables.bg.space', requiredLevel: 5, assetUrl: 'space_theme' },
    { id: 'bg_forest', type: 'background', nameKey: 'unlockables.bg.forest', requiredLevel: 12, assetUrl: 'forest_theme' }
];

export const unlockablesService = {
    getAllItems: () => ALL_UNLOCKABLES,

    // Get only unlocked items for the current user
    getUnlockedItems: (userLevel: number) => {
        return ALL_UNLOCKABLES.filter(item => userLevel >= item.requiredLevel);
    },

    // Check specific item status
    isItemUnlocked: (itemId: string, userLevel: number): boolean => {
        const item = ALL_UNLOCKABLES.find(i => i.id === itemId);
        return item ? userLevel >= item.requiredLevel : false;
    },

    // Get next locked item (for "Next Reward" preview)
    getNextUnlock: (currentLevel: number) => {
        return ALL_UNLOCKABLES
            .filter(item => item.requiredLevel > currentLevel)
            .sort((a, b) => a.requiredLevel - b.requiredLevel)[0];
    }
};
