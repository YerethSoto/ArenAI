import React, { useState, useMemo } from 'react';
import {
    IonPage,
    IonContent,
    IonIcon,
    IonHeader,
    IonToolbar,
    IonMenuButton,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonLabel,
} from '@ionic/react';
import {
    menu,
    trophyOutline,
    flameOutline,
    schoolOutline,
    gameControllerOutline,
    peopleOutline,
    statsChartOutline,
    chevronDownOutline,
    chevronUpOutline,
    chevronForwardOutline,
    alertCircleOutline,
    checkmarkCircleOutline,
    starOutline,
    timeOutline,
    ribbonOutline,
    swapHorizontalOutline,
    filterOutline,
    arrowDownOutline,
    pulseOutline,
    shieldOutline,
    heartOutline,
    sparklesOutline,
    flashOutline,
} from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import PageTransition from '../components/PageTransition';
import ProfessorMenu from '../components/ProfessorMenu';
import { SUBJECTS } from '../data/topicsData';
import { useProfessorFilters } from '../hooks/useProfessorFilters';
import '../components/ProfessorHeader.css';
import './ProfessorStudents.css';

// ================================ DATA MODELS ================================

interface StudentData {
    id: string;
    name: string;
    averageScore: number;
    streak: number;
    level: number;
    xp: number;
    quizzesTaken: number;
    battlesWon: number;
    totalBattles: number;
    studyTime: number;
    tardies: number;
    subjectScores: { subjectId: number; score: number; topicsCompleted: number; totalTopics: number }[];
    weakTopics: { name: string; score: number; subjectId: number }[];
    strongTopics: { name: string; score: number; subjectId: number }[];
    recentActivity: { type: 'quiz' | 'battle' | 'study' | 'achievement'; description: string; date: string; score?: number }[];
    achievements: { name: string; icon: string; date: string }[];
    battleHistory: { opponentId: string; opponentName: string; result: 'win' | 'loss'; date: string; score: number; opponentScore: number }[];
}

// ================================ MOCK DATA ================================

const STUDENTS_DATA: StudentData[] = [
    {
        id: 's1', name: 'Ana García', averageScore: 95, streak: 12, level: 8, xp: 2450,
        quizzesTaken: 24, battlesWon: 18, totalBattles: 22, studyTime: 120, tardies: 0,
        subjectScores: [
            { subjectId: 1, score: 96, topicsCompleted: 45, totalTopics: 50 },
            { subjectId: 2, score: 94, topicsCompleted: 38, totalTopics: 42 },
            { subjectId: 3, score: 93, topicsCompleted: 28, totalTopics: 35 },
            { subjectId: 4, score: 97, topicsCompleted: 22, totalTopics: 25 },
        ],
        weakTopics: [{ name: 'Ecuaciones Cuadráticas', score: 72, subjectId: 1 }],
        strongTopics: [
            { name: 'Geometría', score: 98, subjectId: 1 },
            { name: 'Ecosistemas', score: 97, subjectId: 2 },
        ],
        recentActivity: [
            { type: 'battle', description: 'Ganó vs Carlos M.', date: '2026-02-25', score: 92 },
            { type: 'quiz', description: 'Quiz: Fracciones', date: '2026-02-24', score: 95 },
            { type: 'achievement', description: 'Desbloqueó "Maestra"', date: '2026-02-23' },
            { type: 'study', description: 'Repaso de Ciencias', date: '2026-02-22' },
        ],
        achievements: [
            { name: 'Top de la Clase', icon: '🏆', date: '2026-02-20' },
            { name: 'Racha Imparable', icon: '🔥', date: '2026-02-18' },
            { name: '10 Batallas', icon: '⚔️', date: '2026-02-10' },
        ],
        battleHistory: [
            { opponentId: 's2', opponentName: 'Carlos Martínez', result: 'win', date: '2026-02-25', score: 92, opponentScore: 78 },
            { opponentId: 's3', opponentName: 'María Rodríguez', result: 'win', date: '2026-02-23', score: 88, opponentScore: 85 },
            { opponentId: 's4', opponentName: 'Diego Sánchez', result: 'win', date: '2026-02-21', score: 95, opponentScore: 72 },
            { opponentId: 's2', opponentName: 'Carlos Martínez', result: 'loss', date: '2026-02-18', score: 80, opponentScore: 82 },
            { opponentId: 's5', opponentName: 'Sofía Torres', result: 'win', date: '2026-02-16', score: 90, opponentScore: 70 },
        ],
    },
    {
        id: 's2', name: 'Carlos Martínez', averageScore: 88, streak: 7, level: 7, xp: 1980,
        quizzesTaken: 20, battlesWon: 14, totalBattles: 20, studyTime: 95, tardies: 1,
        subjectScores: [
            { subjectId: 1, score: 90, topicsCompleted: 40, totalTopics: 50 },
            { subjectId: 2, score: 87, topicsCompleted: 34, totalTopics: 42 },
            { subjectId: 3, score: 85, topicsCompleted: 25, totalTopics: 35 },
            { subjectId: 4, score: 90, topicsCompleted: 20, totalTopics: 25 },
        ],
        weakTopics: [{ name: 'Redacción', score: 65, subjectId: 3 }],
        strongTopics: [
            { name: 'Álgebra', score: 95, subjectId: 1 },
            { name: 'Física Básica', score: 92, subjectId: 2 },
        ],
        recentActivity: [
            { type: 'battle', description: 'Perdió vs Ana G.', date: '2026-02-25', score: 78 },
            { type: 'quiz', description: 'Quiz: Álgebra', date: '2026-02-24', score: 94 },
        ],
        achievements: [
            { name: 'Guerrero', icon: '🗡️', date: '2026-02-15' },
            { name: 'Matemático', icon: '📐', date: '2026-02-12' },
        ],
        battleHistory: [
            { opponentId: 's1', opponentName: 'Ana García', result: 'loss', date: '2026-02-25', score: 78, opponentScore: 92 },
            { opponentId: 's3', opponentName: 'María Rodríguez', result: 'win', date: '2026-02-22', score: 88, opponentScore: 82 },
            { opponentId: 's1', opponentName: 'Ana García', result: 'win', date: '2026-02-18', score: 82, opponentScore: 80 },
            { opponentId: 's4', opponentName: 'Diego Sánchez', result: 'win', date: '2026-02-15', score: 90, opponentScore: 75 },
            { opponentId: 's6', opponentName: 'Luis Rodríguez', result: 'win', date: '2026-02-12', score: 85, opponentScore: 60 },
        ],
    },
    {
        id: 's3', name: 'María Rodríguez', averageScore: 85, streak: 5, level: 6, xp: 1650,
        quizzesTaken: 18, battlesWon: 11, totalBattles: 18, studyTime: 80, tardies: 0,
        subjectScores: [
            { subjectId: 1, score: 82, topicsCompleted: 35, totalTopics: 50 },
            { subjectId: 2, score: 88, topicsCompleted: 32, totalTopics: 42 },
            { subjectId: 3, score: 90, topicsCompleted: 28, totalTopics: 35 },
            { subjectId: 4, score: 80, topicsCompleted: 18, totalTopics: 25 },
        ],
        weakTopics: [{ name: 'Álgebra', score: 65, subjectId: 1 }],
        strongTopics: [{ name: 'Lectura Comprensiva', score: 96, subjectId: 3 }],
        recentActivity: [
            { type: 'study', description: 'Repaso de Español', date: '2026-02-24' },
            { type: 'battle', description: 'Perdió vs Ana G.', date: '2026-02-23', score: 85 },
        ],
        achievements: [{ name: 'Lectora Ávida', icon: '📚', date: '2026-01-18' }],
        battleHistory: [
            { opponentId: 's1', opponentName: 'Ana García', result: 'loss', date: '2026-02-23', score: 85, opponentScore: 88 },
            { opponentId: 's2', opponentName: 'Carlos Martínez', result: 'loss', date: '2026-02-22', score: 82, opponentScore: 88 },
            { opponentId: 's5', opponentName: 'Sofía Torres', result: 'win', date: '2026-02-20', score: 90, opponentScore: 72 },
            { opponentId: 's4', opponentName: 'Diego Sánchez', result: 'win', date: '2026-02-17', score: 88, opponentScore: 78 },
        ],
    },
    {
        id: 's4', name: 'Diego Sánchez', averageScore: 82, streak: 3, level: 5, xp: 1340,
        quizzesTaken: 15, battlesWon: 9, totalBattles: 14, studyTime: 65, tardies: 1,
        subjectScores: [
            { subjectId: 1, score: 80, topicsCompleted: 35, totalTopics: 50 },
            { subjectId: 2, score: 85, topicsCompleted: 30, totalTopics: 42 },
            { subjectId: 3, score: 78, topicsCompleted: 22, totalTopics: 35 },
            { subjectId: 4, score: 85, topicsCompleted: 18, totalTopics: 25 },
        ],
        weakTopics: [{ name: 'Verbos Irregulares', score: 55, subjectId: 3 }],
        strongTopics: [{ name: 'Ecosistemas', score: 92, subjectId: 2 }],
        recentActivity: [],
        achievements: [],
        battleHistory: [
            { opponentId: 's1', opponentName: 'Ana García', result: 'loss', date: '2026-02-21', score: 72, opponentScore: 95 },
            { opponentId: 's2', opponentName: 'Carlos Martínez', result: 'loss', date: '2026-02-15', score: 75, opponentScore: 90 },
            { opponentId: 's6', opponentName: 'Luis Rodríguez', result: 'win', date: '2026-02-12', score: 82, opponentScore: 65 },
        ],
    },
    {
        id: 's5', name: 'Sofía Torres', averageScore: 78, streak: 2, level: 5, xp: 1120,
        quizzesTaken: 14, battlesWon: 8, totalBattles: 15, studyTime: 55, tardies: 2,
        subjectScores: [
            { subjectId: 1, score: 75, topicsCompleted: 30, totalTopics: 50 },
            { subjectId: 2, score: 80, topicsCompleted: 28, totalTopics: 42 },
            { subjectId: 3, score: 82, topicsCompleted: 24, totalTopics: 35 },
            { subjectId: 4, score: 75, topicsCompleted: 15, totalTopics: 25 },
        ],
        weakTopics: [{ name: 'Potencias', score: 52, subjectId: 1 }, { name: 'Geografía', score: 58, subjectId: 4 }],
        strongTopics: [],
        recentActivity: [],
        achievements: [],
        battleHistory: [
            { opponentId: 's1', opponentName: 'Ana García', result: 'loss', date: '2026-02-16', score: 70, opponentScore: 90 },
            { opponentId: 's3', opponentName: 'María Rodríguez', result: 'loss', date: '2026-02-20', score: 72, opponentScore: 90 },
        ],
    },
    {
        id: 's6', name: 'Luis Rodríguez', averageScore: 72, streak: 1, level: 4, xp: 890,
        quizzesTaken: 12, battlesWon: 6, totalBattles: 14, studyTime: 40, tardies: 4,
        subjectScores: [
            { subjectId: 1, score: 68, topicsCompleted: 25, totalTopics: 50 },
            { subjectId: 2, score: 75, topicsCompleted: 24, totalTopics: 42 },
            { subjectId: 3, score: 70, topicsCompleted: 20, totalTopics: 35 },
            { subjectId: 4, score: 75, topicsCompleted: 14, totalTopics: 25 },
        ],
        weakTopics: [{ name: 'Fracciones', score: 45, subjectId: 1 }, { name: 'Ortografía', score: 48, subjectId: 3 }],
        strongTopics: [],
        recentActivity: [],
        achievements: [],
        battleHistory: [
            { opponentId: 's2', opponentName: 'Carlos Martínez', result: 'loss', date: '2026-02-12', score: 60, opponentScore: 85 },
            { opponentId: 's4', opponentName: 'Diego Sánchez', result: 'loss', date: '2026-02-12', score: 65, opponentScore: 82 },
        ],
    },
    {
        id: 's7', name: 'Elena Martínez', averageScore: 68, streak: 0, level: 4, xp: 720,
        quizzesTaken: 10, battlesWon: 4, totalBattles: 12, studyTime: 35, tardies: 2,
        subjectScores: [
            { subjectId: 1, score: 62, topicsCompleted: 22, totalTopics: 50 },
            { subjectId: 2, score: 72, topicsCompleted: 22, totalTopics: 42 },
            { subjectId: 3, score: 68, topicsCompleted: 18, totalTopics: 35 },
            { subjectId: 4, score: 70, topicsCompleted: 12, totalTopics: 25 },
        ],
        weakTopics: [{ name: 'Ecuaciones', score: 38, subjectId: 1 }],
        strongTopics: [],
        recentActivity: [],
        achievements: [],
        battleHistory: [
            { opponentId: 's8', opponentName: 'Pedro Gómez', result: 'win', date: '2026-02-10', score: 70, opponentScore: 55 },
        ],
    },
    {
        id: 's8', name: 'Pedro Gómez', averageScore: 55, streak: 0, level: 3, xp: 450,
        quizzesTaken: 8, battlesWon: 2, totalBattles: 10, studyTime: 20, tardies: 3,
        subjectScores: [
            { subjectId: 1, score: 48, topicsCompleted: 15, totalTopics: 50 },
            { subjectId: 2, score: 58, topicsCompleted: 18, totalTopics: 42 },
            { subjectId: 3, score: 55, topicsCompleted: 14, totalTopics: 35 },
            { subjectId: 4, score: 60, topicsCompleted: 10, totalTopics: 25 },
        ],
        weakTopics: [
            { name: 'Matemáticas Básicas', score: 35, subjectId: 1 },
            { name: 'Lectura', score: 42, subjectId: 3 },
            { name: 'Sistema Solar', score: 45, subjectId: 2 },
        ],
        strongTopics: [],
        recentActivity: [],
        achievements: [],
        battleHistory: [
            { opponentId: 's7', opponentName: 'Elena Martínez', result: 'loss', date: '2026-02-10', score: 55, opponentScore: 70 },
        ],
    },
];

// ================================ COMPONENT ================================

const ProfessorStudents: React.FC = () => {
    const { t } = useTranslation();
    const {
        selectedGrade,
        setSelectedGrade,
        selectedSection,
        setSelectedSection,
        selectedSubject: profSubject,
        setSelectedSubject: setProfSubject,
    } = useProfessorFilters();

    // Tab state
    const [activeTab, setActiveTab] = useState<'resumen' | 'listado' | 'interacciones'>('resumen');
    const [searchText, setSearchText] = useState('');
    const [sortBy, setSortBy] = useState<'score' | 'battles' | 'name' | 'streak'>('score');
    const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
    const [expandedDetailTab, setExpandedDetailTab] = useState<'perfil' | 'batallas' | 'logros'>('perfil');

    // Derived data
    const sortedStudents = useMemo(() => {
        let students = [...STUDENTS_DATA];

        // Search filter
        if (searchText.trim()) {
            const q = searchText.toLowerCase();
            students = students.filter(s =>
                s.name.toLowerCase().includes(q)
            );
        }

        // Sort
        switch (sortBy) {
            case 'score': students.sort((a, b) => b.averageScore - a.averageScore); break;
            case 'battles': students.sort((a, b) => b.battlesWon - a.battlesWon); break;
            case 'name': students.sort((a, b) => a.name.localeCompare(b.name)); break;
            case 'streak': students.sort((a, b) => b.streak - a.streak); break;
        }
        return students;
    }, [searchText, sortBy]);

    const classAverage = useMemo(() =>
        Math.round(STUDENTS_DATA.reduce((acc, s) => acc + s.averageScore, 0) / STUDENTS_DATA.length)
        , []);

    const totalBattles = useMemo(() =>
        STUDENTS_DATA.reduce((acc, s) => acc + s.totalBattles, 0) / 2
        , []);

    const atRiskStudents = useMemo(() =>
        STUDENTS_DATA.filter(s => s.averageScore < 70).sort((a, b) => a.averageScore - b.averageScore)
        , []);

    // Rivalries: find most frequent matchups
    const rivalries = useMemo(() => {
        const matchups: { [key: string]: { player1: string; player2: string; p1Name: string; p2Name: string; p1Wins: number; p2Wins: number; total: number } } = {};
        STUDENTS_DATA.forEach(student => {
            student.battleHistory.forEach(battle => {
                const key = [student.id, battle.opponentId].sort().join('-');
                if (!matchups[key]) {
                    matchups[key] = {
                        player1: student.id < battle.opponentId ? student.id : battle.opponentId,
                        player2: student.id < battle.opponentId ? battle.opponentId : student.id,
                        p1Name: student.id < battle.opponentId ? student.name : battle.opponentName,
                        p2Name: student.id < battle.opponentId ? battle.opponentName : student.name,
                        p1Wins: 0, p2Wins: 0, total: 0,
                    };
                }
                matchups[key].total++;
                if (battle.result === 'win') {
                    if (student.id === matchups[key].player1) matchups[key].p1Wins++;
                    else matchups[key].p2Wins++;
                } else {
                    if (student.id === matchups[key].player1) matchups[key].p2Wins++;
                    else matchups[key].p1Wins++;
                }
            });
        });
        return Object.values(matchups).sort((a, b) => b.total - a.total);
    }, []);

    const battleLeaderboard = useMemo(() =>
        [...STUDENTS_DATA].sort((a, b) => b.battlesWon - a.battlesWon)
        , []);

    // Helpers
    const getInitials = (name: string) => {
        const parts = name.split(' ');
        return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return '#2ecc71';
        if (score >= 60) return '#f39c12';
        return '#e74c3c';
    };

    const getLevelBadge = (level: number) => {
        if (level >= 8) return { label: 'Maestro', color: '#9b59b6' };
        if (level >= 6) return { label: 'Avanzado', color: '#3498db' };
        if (level >= 4) return { label: 'Intermedio', color: '#f39c12' };
        return { label: 'Novato', color: '#95a5a6' };
    };

    const getWinRate = (won: number, total: number) => total > 0 ? Math.round((won / total) * 100) : 0;

    const getFeedback = (student: StudentData): string => {
        if (student.averageScore >= 90) return `${student.name} es un estudiante destacado. Puede ser mentor para compañeros con dificultades.`;
        if (student.averageScore >= 75) return `${student.name} muestra buen progreso. Enfocarse en ${student.weakTopics[0]?.name || 'temas avanzados'} acelerará su mejora.`;
        if (student.averageScore >= 60) return `${student.name} necesita refuerzo en ${student.weakTopics.map(t => t.name).join(', ') || 'varios temas'}. Considere sesiones adicionales.`;
        return `⚠️ ${student.name} requiere atención urgente. Recomendación: plan de recuperación individualizado enfocado en ${student.weakTopics[0]?.name || 'fundamentos'}.`;
    };

    return (
        <IonPage className="pst-page">
            <IonHeader className="professor-header-container">
                <IonToolbar className="professor-toolbar">
                    <div className="ph-content">
                        <div className="ph-menu-btn-container">
                            <IonMenuButton className="ph-menu-btn">
                                <IonIcon icon={menu} />
                            </IonMenuButton>
                        </div>
                    </div>
                </IonToolbar>

                <div className="ph-brand-container-absolute">
                    <div className="ph-brand-name">ArenAI</div>
                    <div className="ph-brand-sub">Estudiantes</div>
                </div>

                <div className="ph-notch-container">
                    <div className="ph-notch">
                        <div className="ph-dropdowns-display">
                            <div className="ph-text-oval">
                                <ProfessorMenu
                                    selectedGrade={String(selectedGrade)}
                                    selectedSection={selectedSection}
                                    selectedSubject={t('professor.dashboard.subjects.' + profSubject.replace(/\s+/g, ''))}
                                    onGradeChange={(grade) => setSelectedGrade(parseInt(grade, 10))}
                                    onSectionChange={setSelectedSection}
                                    onSubjectChange={setProfSubject}
                                    hideSubject={true}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </IonHeader>

            <IonContent fullscreen className="pst-content">
                <PageTransition variant="fade">
                    {/* Tab Selector */}
                    <div className="pst-tabs-container">
                        <IonSegment
                            value={activeTab}
                            onIonChange={(e) => setActiveTab(e.detail.value as any)}
                            className="pst-segment"
                        >
                            <IonSegmentButton value="resumen">
                                <IonIcon icon={statsChartOutline} />
                                <IonLabel>Resumen</IonLabel>
                            </IonSegmentButton>
                            <IonSegmentButton value="listado">
                                <IonIcon icon={peopleOutline} />
                                <IonLabel>Listado</IonLabel>
                            </IonSegmentButton>
                            <IonSegmentButton value="interacciones">
                                <IonIcon icon={gameControllerOutline} />
                                <IonLabel>Interacciones</IonLabel>
                            </IonSegmentButton>
                        </IonSegment>
                    </div>

                    {/* ============================================ */}
                    {/* TAB: RESUMEN                                 */}
                    {/* ============================================ */}
                    {activeTab === 'resumen' && (
                        <div className="pst-tab-content">
                            {/* Quick Stats */}
                            <div className="pst-stats-grid">
                                <div className="pst-stat-card">
                                    <IonIcon icon={peopleOutline} className="pst-stat-icon" />
                                    <span className="pst-stat-value">{STUDENTS_DATA.length}</span>
                                    <span className="pst-stat-label">Estudiantes</span>
                                </div>
                                <div className="pst-stat-card">
                                    <IonIcon icon={trophyOutline} className="pst-stat-icon" style={{ color: getScoreColor(classAverage) }} />
                                    <span className="pst-stat-value" style={{ color: getScoreColor(classAverage) }}>{classAverage}%</span>
                                    <span className="pst-stat-label">Promedio</span>
                                </div>
                                <div className="pst-stat-card">
                                    <IonIcon icon={schoolOutline} className="pst-stat-icon" />
                                    <span className="pst-stat-value">{STUDENTS_DATA.reduce((a, s) => a + s.quizzesTaken, 0)}</span>
                                    <span className="pst-stat-label">Quizzes</span>
                                </div>
                                <div className="pst-stat-card">
                                    <IonIcon icon={gameControllerOutline} className="pst-stat-icon" />
                                    <span className="pst-stat-value">{Math.round(totalBattles)}</span>
                                    <span className="pst-stat-label">Batallas</span>
                                </div>
                            </div>

                            {/* Performance Distribution */}
                            <div className="pst-card-section">
                                <h3 className="pst-section-title">
                                    <IonIcon icon={statsChartOutline} /> Distribución de Rendimiento
                                </h3>
                                <div className="pst-distribution">
                                    {[
                                        { label: 'Excelente', range: '≥85%', count: STUDENTS_DATA.filter(s => s.averageScore >= 85).length, color: '#2ecc71', icon: '⭐' },
                                        { label: 'Bueno', range: '70-84%', count: STUDENTS_DATA.filter(s => s.averageScore >= 70 && s.averageScore < 85).length, color: '#f39c12', icon: '👍' },
                                        { label: 'En Riesgo', range: '<70%', count: STUDENTS_DATA.filter(s => s.averageScore < 70).length, color: '#e74c3c', icon: '⚠️' },
                                    ].map(tier => (
                                        <div key={tier.label} className="pst-dist-item">
                                            <div className="pst-dist-header">
                                                <span className="pst-dist-emoji">{tier.icon}</span>
                                                <span className="pst-dist-label">{tier.label}</span>
                                                <span className="pst-dist-range">{tier.range}</span>
                                            </div>
                                            <div className="pst-dist-bar-track">
                                                <div
                                                    className="pst-dist-bar-fill"
                                                    style={{
                                                        width: `${(tier.count / STUDENTS_DATA.length) * 100}%`,
                                                        background: tier.color,
                                                    }}
                                                />
                                            </div>
                                            <span className="pst-dist-count" style={{ color: tier.color }}>
                                                {tier.count} estudiante{tier.count !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Top 3 Podium */}
                            <div className="pst-card-section">
                                <h3 className="pst-section-title">
                                    <IonIcon icon={trophyOutline} /> Top Estudiantes
                                </h3>
                                <div className="pst-podium">
                                    {STUDENTS_DATA.sort((a, b) => b.averageScore - a.averageScore).slice(0, 3).map((student, idx) => (
                                        <div
                                            key={student.id}
                                            className={`pst-podium-card rank-${idx + 1}`}
                                            onClick={() => {
                                                setActiveTab('listado');
                                                setExpandedStudentId(student.id);
                                            }}
                                        >
                                            <div className="pst-podium-rank">
                                                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                                            </div>
                                            <div className="pst-podium-avatar">
                                                {getInitials(student.name)}
                                            </div>
                                            <div className="pst-podium-name">{student.name}</div>
                                            <div className="pst-podium-score" style={{ color: getScoreColor(student.averageScore) }}>
                                                {student.averageScore}%
                                            </div>
                                            <div className="pst-podium-meta">
                                                <span><IonIcon icon={flameOutline} /> {student.streak}</span>
                                                <span>Lvl {student.level}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Top Battlers */}
                            <div className="pst-card-section">
                                <h3 className="pst-section-title">
                                    <IonIcon icon={gameControllerOutline} /> Más Activos en Batallas
                                </h3>
                                <div className="pst-battlers-list">
                                    {battleLeaderboard.slice(0, 4).map((student, idx) => (
                                        <div key={student.id} className="pst-battler-row">
                                            <span className="pst-battler-rank">{idx + 1}</span>
                                            <div className="pst-battler-avatar">{getInitials(student.name)}</div>
                                            <div className="pst-battler-info">
                                                <span className="pst-battler-name">{student.name}</span>
                                                <span className="pst-battler-stats">
                                                    {student.battlesWon}W / {student.totalBattles - student.battlesWon}L
                                                </span>
                                            </div>
                                            <div className="pst-battler-winrate" style={{ color: getScoreColor(getWinRate(student.battlesWon, student.totalBattles)) }}>
                                                {getWinRate(student.battlesWon, student.totalBattles)}%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* At Risk Alerts */}
                            {atRiskStudents.length > 0 && (
                                <div className="pst-card-section pst-alert-section">
                                    <h3 className="pst-section-title pst-alert-title">
                                        <IonIcon icon={alertCircleOutline} /> Alertas — Estudiantes en Riesgo
                                    </h3>
                                    <div className="pst-alerts-list">
                                        {atRiskStudents.map(student => (
                                            <div
                                                key={student.id}
                                                className="pst-alert-card"
                                                onClick={() => {
                                                    setActiveTab('listado');
                                                    setExpandedStudentId(student.id);
                                                }}
                                            >
                                                <div className="pst-alert-header">
                                                    <div className="pst-alert-avatar" style={{ borderColor: '#e74c3c' }}>
                                                        {getInitials(student.name)}
                                                    </div>
                                                    <div className="pst-alert-info">
                                                        <span className="pst-alert-name">{student.name}</span>
                                                        <span className="pst-alert-score" style={{ color: '#e74c3c' }}>
                                                            {student.averageScore}% promedio
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="pst-alert-weak-topics">
                                                    {student.weakTopics.map((topic, idx) => (
                                                        <span key={idx} className="pst-alert-topic-chip">
                                                            {SUBJECTS[topic.subjectId]?.icon} {topic.name}: {topic.score}%
                                                        </span>
                                                    ))}
                                                </div>
                                                <p className="pst-alert-feedback">{getFeedback(student)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ============================================ */}
                    {/* TAB: LISTADO                                 */}
                    {/* ============================================ */}
                    {activeTab === 'listado' && (
                        <div className="pst-tab-content">
                            {/* Search and Sort */}
                            <div className="pst-search-sort-row">
                                <IonSearchbar
                                    className="pst-search-bar"
                                    value={searchText}
                                    onIonInput={(e) => setSearchText(e.detail.value || '')}
                                    placeholder="Buscar estudiante..."
                                />
                                <div className="pst-sort-chips">
                                    {[
                                        { key: 'score' as const, label: 'Puntaje', icon: trophyOutline },
                                        { key: 'battles' as const, label: 'Batallas', icon: gameControllerOutline },
                                        { key: 'name' as const, label: 'Nombre', icon: filterOutline },
                                        { key: 'streak' as const, label: 'Racha', icon: flameOutline },
                                    ].map(opt => (
                                        <button
                                            key={opt.key}
                                            className={`pst-sort-chip ${sortBy === opt.key ? 'active' : ''}`}
                                            onClick={() => setSortBy(opt.key)}
                                        >
                                            <IonIcon icon={opt.icon} /> {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Student List */}
                            <div className="pst-student-list">
                                {sortedStudents.map((student, idx) => {
                                    const isExpanded = expandedStudentId === student.id;
                                    const badge = getLevelBadge(student.level);
                                    const winRate = getWinRate(student.battlesWon, student.totalBattles);

                                    return (
                                        <div key={student.id} className={`pst-student-card ${isExpanded ? 'expanded' : ''}`}>
                                            {/* Student Summary Row */}
                                            <div
                                                className="pst-student-summary"
                                                onClick={() => setExpandedStudentId(isExpanded ? null : student.id)}
                                            >
                                                <span className="pst-student-number">{idx + 1}</span>
                                                <div className="pst-student-avatar-circle" style={{ borderColor: getScoreColor(student.averageScore) }}>
                                                    {getInitials(student.name)}
                                                </div>
                                                <div className="pst-student-main-info">
                                                    <span className="pst-student-display-name">{student.name}</span>
                                                    <div className="pst-student-mini-stats">
                                                        <span className="pst-mini-badge" style={{ backgroundColor: badge.color }}>{badge.label}</span>
                                                        <span><IonIcon icon={schoolOutline} /> {student.quizzesTaken}</span>
                                                        <span><IonIcon icon={gameControllerOutline} /> {student.battlesWon}W</span>
                                                        {student.streak > 0 && <span className="pst-streak-glow"><IonIcon icon={flameOutline} /> {student.streak}</span>}
                                                    </div>
                                                </div>
                                                <div className="pst-student-end">
                                                    <span className="pst-student-score-big" style={{ color: getScoreColor(student.averageScore) }}>
                                                        {student.averageScore}%
                                                    </span>
                                                    <IonIcon icon={isExpanded ? chevronUpOutline : chevronDownOutline} className="pst-expand-icon" />
                                                </div>
                                            </div>

                                            {/* Expanded Detail */}
                                            {isExpanded && (
                                                <div className="pst-student-detail">
                                                    {/* Detail Sub-tabs */}
                                                    <div className="pst-detail-tabs">
                                                        {[
                                                            { key: 'perfil' as const, label: 'Perfil', icon: statsChartOutline },
                                                            { key: 'batallas' as const, label: 'Batallas', icon: gameControllerOutline },
                                                            { key: 'logros' as const, label: 'Logros', icon: ribbonOutline },
                                                        ].map(tab => (
                                                            <button
                                                                key={tab.key}
                                                                className={`pst-detail-tab ${expandedDetailTab === tab.key ? 'active' : ''}`}
                                                                onClick={() => setExpandedDetailTab(tab.key)}
                                                            >
                                                                <IonIcon icon={tab.icon} /> {tab.label}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    {/* Sub-tab: Perfil */}
                                                    {expandedDetailTab === 'perfil' && (
                                                        <div className="pst-detail-content">
                                                            {/* Level & XP */}
                                                            <div className="pst-profile-header-row">
                                                                <div className="pst-profile-stat">
                                                                    <span className="pst-profile-stat-label">Nivel</span>
                                                                    <span className="pst-profile-stat-value" style={{ color: badge.color }}>
                                                                        {student.level}
                                                                    </span>
                                                                </div>
                                                                <div className="pst-profile-stat">
                                                                    <span className="pst-profile-stat-label">XP</span>
                                                                    <span className="pst-profile-stat-value">⚡ {student.xp}</span>
                                                                </div>
                                                                <div className="pst-profile-stat">
                                                                    <span className="pst-profile-stat-label">Estudio</span>
                                                                    <span className="pst-profile-stat-value">{student.studyTime}m</span>
                                                                </div>
                                                                <div className="pst-profile-stat">
                                                                    <span className="pst-profile-stat-label">Win Rate</span>
                                                                    <span className="pst-profile-stat-value" style={{ color: getScoreColor(winRate) }}>
                                                                        {winRate}%
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {student.tardies >= 3 && (
                                                                <div className="pst-warning-banner">
                                                                    ⚠️ {student.tardies} tardanzas este período
                                                                </div>
                                                            )}

                                                            {/* Subject Breakdown */}
                                                            <div className="pst-detail-section">
                                                                <h4>📊 Rendimiento por Materia</h4>
                                                                <div className="pst-subject-bars">
                                                                    {student.subjectScores.map(subj => (
                                                                        <div key={subj.subjectId} className="pst-subject-bar-row">
                                                                            <span className="pst-subj-icon">{SUBJECTS[subj.subjectId]?.icon}</span>
                                                                            <span className="pst-subj-name">{SUBJECTS[subj.subjectId]?.name}</span>
                                                                            <div className="pst-subj-bar-track">
                                                                                <div
                                                                                    className="pst-subj-bar-fill"
                                                                                    style={{ width: `${subj.score}%`, background: getScoreColor(subj.score) }}
                                                                                />
                                                                            </div>
                                                                            <span className="pst-subj-score" style={{ color: getScoreColor(subj.score) }}>
                                                                                {subj.score}%
                                                                            </span>
                                                                            <span className="pst-subj-progress">{subj.topicsCompleted}/{subj.totalTopics}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Weak Topics */}
                                                            {student.weakTopics.length > 0 && (
                                                                <div className="pst-detail-section pst-section-danger">
                                                                    <h4>⚠️ Temas por Reforzar</h4>
                                                                    <div className="pst-topic-chips">
                                                                        {student.weakTopics.map((topic, idx) => (
                                                                            <div key={idx} className="pst-topic-chip weak">
                                                                                <span>{SUBJECTS[topic.subjectId]?.icon} {topic.name}</span>
                                                                                <span className="pst-topic-chip-score" style={{ color: getScoreColor(topic.score) }}>
                                                                                    {topic.score}%
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Strong Topics */}
                                                            {student.strongTopics.length > 0 && (
                                                                <div className="pst-detail-section pst-section-success">
                                                                    <h4>⭐ Temas Dominados</h4>
                                                                    <div className="pst-topic-chips">
                                                                        {student.strongTopics.map((topic, idx) => (
                                                                            <div key={idx} className="pst-topic-chip strong">
                                                                                <span>{SUBJECTS[topic.subjectId]?.icon} {topic.name}</span>
                                                                                <span className="pst-topic-chip-score" style={{ color: '#2ecc71' }}>
                                                                                    {topic.score}%
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* AI Feedback */}
                                                            <div className="pst-detail-section pst-section-feedback">
                                                                <h4>💡 Recomendación</h4>
                                                                <p className="pst-feedback-text">{getFeedback(student)}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Sub-tab: Batallas */}
                                                    {expandedDetailTab === 'batallas' && (
                                                        <div className="pst-detail-content">
                                                            <div className="pst-battle-summary-row">
                                                                <div className="pst-battle-stat">
                                                                    <span className="pst-battle-stat-value">{student.battlesWon}</span>
                                                                    <span className="pst-battle-stat-label">Victorias</span>
                                                                </div>
                                                                <div className="pst-battle-stat">
                                                                    <span className="pst-battle-stat-value">{student.totalBattles - student.battlesWon}</span>
                                                                    <span className="pst-battle-stat-label">Derrotas</span>
                                                                </div>
                                                                <div className="pst-battle-stat">
                                                                    <span className="pst-battle-stat-value" style={{ color: getScoreColor(winRate) }}>
                                                                        {winRate}%
                                                                    </span>
                                                                    <span className="pst-battle-stat-label">Win Rate</span>
                                                                </div>
                                                            </div>

                                                            {student.battleHistory.length > 0 ? (
                                                                <div className="pst-battle-history">
                                                                    {student.battleHistory.map((battle, idx) => (
                                                                        <div key={idx} className={`pst-battle-item ${battle.result}`}>
                                                                            <span className={`pst-battle-result-badge ${battle.result}`}>
                                                                                {battle.result === 'win' ? '✓' : '✗'}
                                                                            </span>
                                                                            <div className="pst-battle-info">
                                                                                <span className="pst-battle-opponent">
                                                                                    vs {battle.opponentName}
                                                                                </span>
                                                                                <span className="pst-battle-date">{battle.date}</span>
                                                                            </div>
                                                                            <div className="pst-battle-scores">
                                                                                <span className={battle.result === 'win' ? 'winner' : 'loser'}>
                                                                                    {battle.score}
                                                                                </span>
                                                                                <span className="pst-vs">-</span>
                                                                                <span className={battle.result === 'loss' ? 'winner' : 'loser'}>
                                                                                    {battle.opponentScore}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="pst-empty-state">
                                                                    <span>🎮</span>
                                                                    <p>Sin historial de batallas</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Sub-tab: Logros */}
                                                    {expandedDetailTab === 'logros' && (
                                                        <div className="pst-detail-content">
                                                            {/* Recent Activity */}
                                                            {student.recentActivity.length > 0 && (
                                                                <div className="pst-detail-section">
                                                                    <h4>📅 Actividad Reciente</h4>
                                                                    <div className="pst-activity-timeline">
                                                                        {student.recentActivity.map((act, idx) => (
                                                                            <div key={idx} className="pst-activity-row">
                                                                                <span className="pst-activity-icon">
                                                                                    {act.type === 'quiz' && '📝'}
                                                                                    {act.type === 'battle' && '⚔️'}
                                                                                    {act.type === 'study' && '📖'}
                                                                                    {act.type === 'achievement' && '🏆'}
                                                                                </span>
                                                                                <div className="pst-activity-info">
                                                                                    <span className="pst-activity-desc">{act.description}</span>
                                                                                    <span className="pst-activity-date">{act.date}</span>
                                                                                </div>
                                                                                {act.score !== undefined && (
                                                                                    <span className="pst-activity-score" style={{ color: getScoreColor(act.score) }}>
                                                                                        {act.score}%
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Achievements */}
                                                            {student.achievements.length > 0 ? (
                                                                <div className="pst-detail-section">
                                                                    <h4>🎖️ Logros Desbloqueados</h4>
                                                                    <div className="pst-achievements-grid">
                                                                        {student.achievements.map((ach, idx) => (
                                                                            <div key={idx} className="pst-achievement-badge">
                                                                                <span className="pst-achievement-icon">{ach.icon}</span>
                                                                                <span className="pst-achievement-name">{ach.name}</span>
                                                                                <span className="pst-achievement-date">{ach.date}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="pst-empty-state">
                                                                    <span>🎖️</span>
                                                                    <p>Sin logros todavía</p>
                                                                    <span className="pst-empty-hint">Necesita más actividad para desbloquear logros</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ============================================ */}
                    {/* TAB: INTERACCIONES                          */}
                    {/* ============================================ */}
                    {activeTab === 'interacciones' && (
                        <div className="pst-tab-content">
                            {/* Battle Leaderboard */}
                            <div className="pst-card-section">
                                <h3 className="pst-section-title">
                                    <IonIcon icon={trophyOutline} /> Ranking de Batallas
                                </h3>
                                <div className="pst-battle-leaderboard">
                                    {battleLeaderboard.map((student, idx) => {
                                        const wr = getWinRate(student.battlesWon, student.totalBattles);
                                        return (
                                            <div key={student.id} className={`pst-lb-row ${idx < 3 ? `top-${idx + 1}` : ''}`}>
                                                <span className="pst-lb-pos">
                                                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                                                </span>
                                                <div className="pst-lb-avatar">{getInitials(student.name)}</div>
                                                <div className="pst-lb-info">
                                                    <span className="pst-lb-name">{student.name}</span>
                                                    <div className="pst-lb-bar-track">
                                                        <div className="pst-lb-bar-fill" style={{ width: `${wr}%`, background: getScoreColor(wr) }} />
                                                    </div>
                                                </div>
                                                <div className="pst-lb-stats">
                                                    <span className="pst-lb-wins">{student.battlesWon}W</span>
                                                    <span className="pst-lb-total">/{student.totalBattles}</span>
                                                </div>
                                                <span className="pst-lb-wr" style={{ color: getScoreColor(wr) }}>{wr}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Rivalries */}
                            <div className="pst-card-section">
                                <h3 className="pst-section-title">
                                    <IonIcon icon={flashOutline} /> Rivalidades
                                </h3>
                                <p className="pst-section-subtitle">Enfrentamientos más frecuentes entre estudiantes</p>
                                <div className="pst-rivalries-list">
                                    {rivalries.slice(0, 6).map((match, idx) => {
                                        const totalMatches = match.total;
                                        const p1Rate = totalMatches > 0 ? Math.round((match.p1Wins / totalMatches) * 100) : 50;
                                        return (
                                            <div key={idx} className="pst-rivalry-card">
                                                <div className="pst-rivalry-header">
                                                    <div className="pst-rivalry-player">
                                                        <div className="pst-rivalry-avatar">{getInitials(match.p1Name)}</div>
                                                        <span className="pst-rivalry-name">{match.p1Name.split(' ')[0]}</span>
                                                        <span className="pst-rivalry-wins">{match.p1Wins}W</span>
                                                    </div>
                                                    <div className="pst-rivalry-vs">
                                                        <span className="pst-rivalry-total">{totalMatches}</span>
                                                        <span className="pst-rivalry-label">batallas</span>
                                                    </div>
                                                    <div className="pst-rivalry-player">
                                                        <div className="pst-rivalry-avatar">{getInitials(match.p2Name)}</div>
                                                        <span className="pst-rivalry-name">{match.p2Name.split(' ')[0]}</span>
                                                        <span className="pst-rivalry-wins">{match.p2Wins}W</span>
                                                    </div>
                                                </div>
                                                <div className="pst-rivalry-bar">
                                                    <div className="pst-rivalry-bar-p1" style={{ width: `${p1Rate}%` }} />
                                                    <div className="pst-rivalry-bar-p2" style={{ width: `${100 - p1Rate}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Engagement Summary */}
                            <div className="pst-card-section">
                                <h3 className="pst-section-title">
                                    <IonIcon icon={pulseOutline} /> Índice de Participación
                                </h3>
                                <div className="pst-engagement-list">
                                    {STUDENTS_DATA.sort((a, b) => (b.totalBattles + b.quizzesTaken) - (a.totalBattles + a.quizzesTaken)).map(student => {
                                        const engagement = student.totalBattles + student.quizzesTaken;
                                        const maxEngagement = Math.max(...STUDENTS_DATA.map(s => s.totalBattles + s.quizzesTaken));
                                        return (
                                            <div key={student.id} className="pst-engagement-row">
                                                <span className="pst-engagement-name">{student.name}</span>
                                                <div className="pst-engagement-bar-track">
                                                    <div
                                                        className="pst-engagement-bar-fill"
                                                        style={{
                                                            width: `${(engagement / maxEngagement) * 100}%`,
                                                            background: `linear-gradient(90deg, ${getScoreColor(student.averageScore)}88, ${getScoreColor(student.averageScore)})`,
                                                        }}
                                                    >
                                                        <span>{engagement}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pst-footer-spacer"></div>
                </PageTransition>
            </IonContent>
        </IonPage>
    );
};

export default ProfessorStudents;
