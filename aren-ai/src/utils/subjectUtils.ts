// Helper to get subject translation key
export const getSubjectKey = (subject: string): string => {
    const keyMap: { [key: string]: string } = {
        Math: "Math",
        Science: "Science",
        "Social Studies": "SocialStudies",
        Spanish: "Spanish",
    };
    return `mainStudent.subjects.${keyMap[subject] || subject}`;
};

export const SUBJECT_OPTIONS = ['Math', 'Science', 'Social Studies', 'Spanish'];
