import { getApiUrl } from "../config/api";
import { StudentStats, TopicProgress, SubjectData, WeekData } from "../types/student";

// Mock Data (Moved from Main_Student and BattleLobby)
const MOCK_STATS: StudentStats = {
    winRate: 86,
    streak: 5,
    happiness: 0.8,
    overallPerformance: 82,
    level: 12,
    points: 1250
};

const MOCK_WEEKS: WeekData[] = Array.from({ length: 12 }, (_, i) => ({
    number: i + 1,
    nameKey: `mainStudent.weeks.week${i + 1}`,
}));

const MOCK_SUBJECTS: Record<string, SubjectData> = {
    Math: {
        name: "Math",
        key: "Math",
        topics: [
            { name: "Algebra", nameKey: "mainStudent.topics.Algebra", percentage: 85, icon: "∑" },
            { name: "Geometry", nameKey: "mainStudent.topics.Geometry", percentage: 45, icon: "📐" },
            { name: "Calculus", nameKey: "mainStudent.topics.Calculus", percentage: 92, icon: "∫" },
            { name: "Statistics", nameKey: "mainStudent.topics.Statistics", percentage: 60, icon: "📊" },
        ]
    },
    Science: {
        name: "Science",
        key: "Science",
        topics: [
            { name: "Biology", nameKey: "mainStudent.topics.Biology", percentage: 75, icon: "🧬" },
            { name: "Chemistry", nameKey: "mainStudent.topics.Chemistry", percentage: 62, icon: "🧪" },
            { name: "Physics", nameKey: "mainStudent.topics.Physics", percentage: 58, icon: "⚛️" },
        ]
    },
    "Social Studies": {
        name: "Social Studies",
        key: "SocialStudies",
        topics: [
            { name: "History", nameKey: "mainStudent.topics.History", percentage: 70, icon: "📜" },
            { name: "Geography", nameKey: "mainStudent.topics.Geography", percentage: 65, icon: "🗺️" },
        ]
    },
    Spanish: {
        name: "Spanish",
        key: "Spanish",
        topics: [
            { name: "Vocab", nameKey: "mainStudent.topics.Vocab", percentage: 80, icon: "🗣️" },
            { name: "Grammar", nameKey: "mainStudent.topics.Grammar", percentage: 65, icon: "📝" },
        ]
    }
};

class StudentService {
    // Simulate network delay
    private async delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async getStudentStats(studentId?: string): Promise<StudentStats> {
        await this.delay(600); // Simulate loading
        return { ...MOCK_STATS };
    }

    async getWeeks(studentId?: string): Promise<WeekData[]> {
        await this.delay(400);
        return [...MOCK_WEEKS];
    }

    async getSubjectDetails(subjectName: string, studentId?: string): Promise<SubjectData> {
        await this.delay(500);
        const subject = MOCK_SUBJECTS[subjectName] || MOCK_SUBJECTS["Math"];
        return subject;
    }
}

export const studentService = new StudentService();
