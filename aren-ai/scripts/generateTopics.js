// Script to generate topicsData.ts from CSV
const fs = require('fs');

const csv = fs.readFileSync('resources/temas al 3er ciclo.xlsx - Materias.csv', 'utf8');
const lines = csv.split(/\r?\n/).slice(1).filter(l => l.trim());

const topics = lines.map((line, index) => {
    // Parse CSV line handling commas in descriptions
    const match = line.match(/^(\d+),([^,]+),(\d+),(.*)$/);
    if (!match) {
        console.error('Failed to parse line:', index, line.substring(0, 50));
        return null;
    }
    return {
        id: parseInt(match[3]),
        name: match[2].trim(),
        subjectId: parseInt(match[1]),
        description: match[4].trim().replace(/^"|"$/g, '')
    };
}).filter(Boolean);

console.log('Parsed', topics.length, 'topics');
console.log('Sample:', JSON.stringify(topics.slice(0, 3), null, 2));

// Count by subject
const bySubject = {};
topics.forEach(t => {
    bySubject[t.subjectId] = (bySubject[t.subjectId] || 0) + 1;
});
console.log('By subject:', bySubject);

// Generate TypeScript file
const tsContent = `// Topic data from curriculum CSV - Auto-generated
// Source: resources/temas al 3er ciclo.xlsx - Materias.csv
// Total: ${topics.length} topics

export interface Topic {
    id: number;
    name: string;
    subjectId: number;
    description: string;
}

export interface TopicWithStats extends Topic {
    score: number;
    studentsCompleted: number;
    totalStudents: number;
    correctAnswers: number;
    incorrectAnswers: number;
    commonMistakes: string[];
    strugglingStudents: { name: string; score: number }[];
    topPerformers: { name: string; score: number }[];
}

export const SUBJECTS: Record<number, { name: string; icon: string; color: string }> = {
    1: { name: 'Matemáticas', icon: '📐', color: '#3498db' },
    2: { name: 'Ciencias', icon: '🔬', color: '#27ae60' },
    3: { name: 'Español', icon: '📚', color: '#e67e22' },
    4: { name: 'Estudios Sociales', icon: '🌎', color: '#9b59b6' },
};

export const ALL_TOPICS: Topic[] = ${JSON.stringify(topics, null, 2)};

// Mock student names for generating stats
const STUDENT_NAMES = [
    'Ana García', 'Carlos Méndez', 'María López', 'Diego Sánchez',
    'Sofía Torres', 'Luis Rodríguez', 'Elena Martínez', 'Pedro Gómez',
    'Valentina Mora', 'Andrés Jiménez', 'Isabella Vargas', 'Gabriel Castro',
    'Camila Rojas', 'Mateo Hernández', 'Lucía Solano', 'Sebastián Araya',
];

// Seeded random for consistent mock data
function seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

// Generate mock stats for a topic
export function generateMockStats(topic: Topic, totalStudents: number = 28): TopicWithStats {
    const seed = topic.id * 31 + topic.subjectId * 17;
    const rand = () => seededRandom(seed + Math.random() * 100);
    
    const score = Math.floor(35 + seededRandom(seed) * 60); // 35-95%
    const completed = Math.floor(totalStudents * (0.65 + seededRandom(seed + 1) * 0.35));
    const totalAnswers = completed * 5;
    const correctRate = score / 100;
    
    const commonMistakes = getCommonMistakes(topic);
    
    // Generate struggling students (lower scores)
    const strugglingStudents = STUDENT_NAMES
        .slice(12, 16)
        .map((name, i) => ({
            name,
            score: Math.max(15, score - 25 + Math.floor(seededRandom(seed + i + 10) * 15)),
        }))
        .slice(0, 2);
    
    // Generate top performers (higher scores)
    const topPerformers = STUDENT_NAMES
        .slice(0, 4)
        .map((name, i) => ({
            name,
            score: Math.min(100, score + 10 + Math.floor(seededRandom(seed + i + 20) * 15)),
        }))
        .slice(0, 2);
    
    return {
        ...topic,
        score,
        studentsCompleted: completed,
        totalStudents,
        correctAnswers: Math.floor(totalAnswers * correctRate),
        incorrectAnswers: Math.floor(totalAnswers * (1 - correctRate)),
        commonMistakes,
        strugglingStudents,
        topPerformers,
    };
}

function getCommonMistakes(topic: Topic): string[] {
    const mistakesBySubject: Record<number, string[]> = {
        1: ['Error en operaciones básicas', 'Confusión de signos', 'Orden de operaciones incorrecto'],
        2: ['Confusión de conceptos científicos', 'Vocabulario técnico incorrecto', 'Interpretación de datos'],
        3: ['Ortografía', 'Uso incorrecto de tildes', 'Concordancia verbal'],
        4: ['Fechas incorrectas', 'Confusión de eventos históricos', 'Ubicación geográfica errónea'],
    };
    
    const subjectMistakes = mistakesBySubject[topic.subjectId] || [];
    return subjectMistakes.slice(0, 2);
}

// Get all topics with generated stats
export function getTopicsWithStats(totalStudents: number = 28): TopicWithStats[] {
    return ALL_TOPICS.map(t => generateMockStats(t, totalStudents));
}

// Get topics filtered by subject
export function getTopicsBySubject(subjectId: number | null): Topic[] {
    if (subjectId === null) return ALL_TOPICS;
    return ALL_TOPICS.filter(t => t.subjectId === subjectId);
}

// Subject statistics
export interface SubjectStats {
    subjectId: number;
    name: string;
    icon: string;
    color: string;
    topicCount: number;
    averageScore: number;
    lowPerformanceCount: number;
    mediumPerformanceCount: number;
    highPerformanceCount: number;
    topTopics: TopicWithStats[];
    weakTopics: TopicWithStats[];
}

export function getSubjectStats(totalStudents: number = 28): SubjectStats[] {
    const topicsWithStats = getTopicsWithStats(totalStudents);
    
    return Object.entries(SUBJECTS).map(([id, subject]) => {
        const subjectTopics = topicsWithStats.filter(t => t.subjectId === parseInt(id));
        const avgScore = subjectTopics.length > 0
            ? Math.round(subjectTopics.reduce((sum, t) => sum + t.score, 0) / subjectTopics.length)
            : 0;
        
        const sorted = [...subjectTopics].sort((a, b) => b.score - a.score);
        
        return {
            subjectId: parseInt(id),
            ...subject,
            topicCount: subjectTopics.length,
            averageScore: avgScore,
            lowPerformanceCount: subjectTopics.filter(t => t.score < 60).length,
            mediumPerformanceCount: subjectTopics.filter(t => t.score >= 60 && t.score < 80).length,
            highPerformanceCount: subjectTopics.filter(t => t.score >= 80).length,
            topTopics: sorted.slice(0, 5),
            weakTopics: sorted.slice(-5).reverse(),
        };
    });
}

// Class overview
export interface ClassOverview {
    totalStudents: number;
    totalTopics: number;
    classAverage: number;
    completionRate: number;
    lowPerformanceTopics: number;
    mediumPerformanceTopics: number;
    highPerformanceTopics: number;
    subjectBreakdown: { subjectId: number; name: string; average: number; count: number }[];
}

export function getClassOverview(totalStudents: number = 28): ClassOverview {
    const topicsWithStats = getTopicsWithStats(totalStudents);
    const avgScore = Math.round(
        topicsWithStats.reduce((sum, t) => sum + t.score, 0) / topicsWithStats.length
    );
    const completionRate = Math.round(
        topicsWithStats.reduce((sum, t) => sum + (t.studentsCompleted / t.totalStudents), 0) 
        / topicsWithStats.length * 100
    );
    
    const subjectBreakdown = Object.entries(SUBJECTS).map(([id, subject]) => {
        const subjectTopics = topicsWithStats.filter(t => t.subjectId === parseInt(id));
        return {
            subjectId: parseInt(id),
            name: subject.name,
            average: subjectTopics.length > 0
                ? Math.round(subjectTopics.reduce((sum, t) => sum + t.score, 0) / subjectTopics.length)
                : 0,
            count: subjectTopics.length,
        };
    });
    
    return {
        totalStudents,
        totalTopics: topicsWithStats.length,
        classAverage: avgScore,
        completionRate,
        lowPerformanceTopics: topicsWithStats.filter(t => t.score < 60).length,
        mediumPerformanceTopics: topicsWithStats.filter(t => t.score >= 60 && t.score < 80).length,
        highPerformanceTopics: topicsWithStats.filter(t => t.score >= 80).length,
        subjectBreakdown,
    };
}
`;

fs.writeFileSync('src/data/topicsData.ts', tsContent, 'utf8');
console.log('Generated src/data/topicsData.ts');
