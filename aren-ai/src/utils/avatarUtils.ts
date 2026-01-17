
export const AVATAR_DEFINITIONS = [
    {
        id: "capybara",
        name: "Capibara",
        icon: "/assets/profile_picture_capybara_eyes_open.png",
        // Note: We might want consistent naming, but for now map to existing assets
    },
    {
        id: "sloth",
        name: "Perezoso",
        icon: "/assets/profile_picture_sloth_eyes_open.png",
    },
    {
        id: "owl",
        name: "Búho Sabio",
        icon: "/assets/OWL.JPG",
    },
    {
        id: "fox",
        name: "Zorro Astuto",
        icon: "/assets/FOX.jpg",
    },
    {
        id: "axol",
        name: "Ajolote Místico",
        icon: "/assets/AXOL.jpg",
    },
];

export const getAvatarPath = (avatarId: string): string => {
    if (!avatarId) return AVATAR_DEFINITIONS[0].icon;

    // Handle variations if they still exist in legacy data, or just specific IDs
    // For now, simple lookup
    const def = AVATAR_DEFINITIONS.find(a => a.id === avatarId);
    if (def) return def.icon;

    // Fallback logic for variations if the ID is complex (e.g., 'capybara_wink')
    // We stripped them from the UI list but they might exist in code/storage
    if (avatarId.includes('capybara')) return AVATAR_DEFINITIONS[0].icon;
    if (avatarId.includes('sloth')) return AVATAR_DEFINITIONS[1].icon;

    return AVATAR_DEFINITIONS[0].icon;
};
