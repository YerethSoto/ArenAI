import React, { useState, useMemo } from 'react';
import {
    IonPage,
    IonContent,
    IonIcon,
    IonHeader,
    IonToolbar,
    IonMenuButton,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonModal,
    IonSearchbar,
} from '@ionic/react';
import {
    menu,
    statsChartOutline,
    gitNetworkOutline,
    peopleOutline,
    alertCircleOutline,
    flameOutline,
    closeOutline,
    schoolOutline,
    gameControllerOutline,
    timeOutline,
    trendingUpOutline,
    trendingDownOutline,
    checkmarkCircleOutline,
    closeCircleOutline,
    listOutline,
    globeOutline,
    searchOutline,
    filterOutline,
    chevronDownOutline,
    chevronUpOutline,
} from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import PageTransition from '../components/PageTransition';
import ProfessorMenu from '../components/ProfessorMenu';
import TopicGlobe from '../components/TopicGlobe';
import { useProfessorFilters } from '../hooks/useProfessorFilters';
import {
    SUBJECTS,
    COMPLETE_TOPICS,
    getTopicsWithStats,
    getSubjectStats,
    getClassOverview,
    TopicWithStats,
    SubjectStats,
} from '../data/topicsData';
import '../components/ProfessorHeader.css';
import '../components/TopicGlobe.css';
import './ProfessorTopicStats.css';

// Mock student data with detailed subject scores and activity
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
    weakTopics: { name: string; nameEn?: string; score: number; subjectId: number }[];
    strongTopics: { name: string; nameEn?: string; score: number; subjectId: number }[];
    recentActivity: { type: 'quiz' | 'battle' | 'study' | 'achievement'; description: string; date: string; score?: number }[];
    achievements: { name: string; nameEn?: string; icon: string; date: string }[];
}

const STUDENTS: StudentData[] = [
    {
        id: 's1', name: 'Ana García', averageScore: 95, streak: 12, level: 8, xp: 2450,
        quizzesTaken: 24, battlesWon: 18, totalBattles: 22, studyTime: 120, tardies: 0,
        subjectScores: [
            { subjectId: 1, score: 96, topicsCompleted: 45, totalTopics: 50 },
            { subjectId: 2, score: 94, topicsCompleted: 38, totalTopics: 42 },
            { subjectId: 3, score: 93, topicsCompleted: 28, totalTopics: 35 },
            { subjectId: 4, score: 97, topicsCompleted: 22, totalTopics: 25 },
        ],
        weakTopics: [
            { name: 'Ecuaciones Cuadráticas', score: 72, subjectId: 1 },
            { name: 'Reacciones Químicas', score: 78, subjectId: 2 },
        ],
        strongTopics: [
            { name: 'Fracciones', score: 100, subjectId: 1 },
            { name: 'Historia de Costa Rica', score: 100, subjectId: 4 },
            { name: 'Gramática', score: 98, subjectId: 3 },
        ],
        recentActivity: [
            { type: 'quiz', description: 'Quiz de Matemáticas: Fracciones', date: '2026-02-01', score: 100 },
            { type: 'battle', description: 'Victoria vs Carlos M.', date: '2026-02-01', score: 95 },
            { type: 'achievement', description: 'Racha de 10 días', date: '2026-01-30' },
            { type: 'study', description: 'Estudió 45 minutos', date: '2026-01-29' },
        ],
        achievements: [
            { name: 'Estrella de Matemáticas', nameEn: 'Math Star', icon: '⭐', date: '2026-01-28' },
            { name: 'Racha Legendaria', nameEn: 'Legendary Streak', icon: '🔥', date: '2026-01-25' },
            { name: 'Campeón de Batallas', nameEn: 'Battle Champion', icon: '🏆', date: '2026-01-20' },
        ],
    },
    {
        id: 's2', name: 'Carlos Méndez', averageScore: 91, streak: 8, level: 7, xp: 1980,
        quizzesTaken: 20, battlesWon: 15, totalBattles: 20, studyTime: 95, tardies: 1,
        subjectScores: [
            { subjectId: 1, score: 94, topicsCompleted: 42, totalTopics: 50 },
            { subjectId: 2, score: 92, topicsCompleted: 35, totalTopics: 42 },
            { subjectId: 3, score: 88, topicsCompleted: 25, totalTopics: 35 },
            { subjectId: 4, score: 90, topicsCompleted: 20, totalTopics: 25 },
        ],
        weakTopics: [{ name: 'Ortografía', nameEn: 'Spelling', score: 68, subjectId: 3 }],
        strongTopics: [{ name: 'Geometría', nameEn: 'Geometry', score: 98, subjectId: 1 }],
        recentActivity: [{ type: 'quiz', description: 'Quiz de Ciencias', date: '2026-02-01', score: 92 }],
        achievements: [{ name: 'Científico Curioso', nameEn: 'Curious Scientist', icon: '🔬', date: '2026-01-22' }],
    },
    {
        id: 's3', name: 'María López', averageScore: 88, streak: 5, level: 6, xp: 1650,
        quizzesTaken: 18, battlesWon: 12, totalBattles: 18, studyTime: 80, tardies: 0,
        subjectScores: [
            { subjectId: 1, score: 85, topicsCompleted: 38, totalTopics: 50 },
            { subjectId: 2, score: 90, topicsCompleted: 32, totalTopics: 42 },
            { subjectId: 3, score: 92, topicsCompleted: 28, totalTopics: 35 },
            { subjectId: 4, score: 85, topicsCompleted: 18, totalTopics: 25 },
        ],
        weakTopics: [{ name: 'Álgebra', nameEn: 'Algebra', score: 65, subjectId: 1 }],
        strongTopics: [{ name: 'Lectura Comprensiva', nameEn: 'Reading Comprehension', score: 96, subjectId: 3 }],
        recentActivity: [{ type: 'study', description: 'Repaso de Español', date: '2026-02-01' }],
        achievements: [{ name: 'Lectora Ávida', nameEn: 'Avid Reader', icon: '📚', date: '2026-01-18' }],
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
        weakTopics: [{ name: 'Potencias', nameEn: 'Powers', score: 52, subjectId: 1 }, { name: 'Geografía', nameEn: 'Geography', score: 58, subjectId: 4 }],
        strongTopics: [],
        recentActivity: [],
        achievements: [],
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
        weakTopics: [{ name: 'Fracciones', nameEn: 'Fractions', score: 45, subjectId: 1 }, { name: 'Ortografía', nameEn: 'Spelling', score: 48, subjectId: 3 }],
        strongTopics: [],
        recentActivity: [],
        achievements: [],
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
        weakTopics: [{ name: 'Ecuaciones', nameEn: 'Equations', score: 38, subjectId: 1 }],
        strongTopics: [],
        recentActivity: [],
        achievements: [],
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
            { name: 'Matemáticas Básicas', nameEn: 'Basic Mathematics', score: 35, subjectId: 1 },
            { name: 'Lectura', nameEn: 'Reading', score: 42, subjectId: 3 },
            { name: 'Sistema Solar', nameEn: 'Solar System', score: 45, subjectId: 2 },
        ],
        strongTopics: [],
        recentActivity: [],
        achievements: [],
    },
];

const ProfessorTopicStats: React.FC = () => {
    const { t, i18n } = useTranslation();
    const {
        selectedGrade,
        setSelectedGrade,
        selectedSection,
        setSelectedSection,
        selectedSubject: profSubject,
        setSelectedSubject: setProfSubject,
    } = useProfessorFilters();

    // Tab state
    const [activeTab, setActiveTab] = useState<'resumen' | 'red' | 'estudiantes'>('resumen');
    const [topicsView, setTopicsView] = useState<'list' | 'globe'>('list');

    // Map header subject name to subject ID
    const SUBJECT_NAME_TO_ID: { [key: string]: number } = {
        'Math': 1,
        'Matemáticas': 1,
        'Science': 2,
        'Ciencias': 2,
        'Spanish': 3,
        'Español': 3,
        'Social Studies': 4,
        'Estudios Sociales': 4,
    };

    // Get current subject ID from header filter
    const currentSubjectId = SUBJECT_NAME_TO_ID[profSubject] || 1;

    // Filter state (secondary filters within the page)
    const [searchQuery, setSearchQuery] = useState('');
    const [performanceFilter, setPerformanceFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
    const [displayCount, setDisplayCount] = useState(30);
    const [expandedTopicId, setExpandedTopicId] = useState<number | null>(null);

    // Modal state
    const [selectedTopic, setSelectedTopic] = useState<TopicWithStats | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);

    // Get data with memoization
    const classOverview = useMemo(() => getClassOverview(28), []);
    const subjectStats = useMemo(() => getSubjectStats(28), []);
    const allTopicsWithStats = useMemo(() => getTopicsWithStats(28), []);

    // Current subject info (from header filter)
    const currentSubject = SUBJECTS[currentSubjectId];

    // Filtered topics - PRIMARY filter is from header, secondary filters below
    const filteredTopics = useMemo(() => {
        // PRIMARY FILTER: Subject from header selector
        let topics = allTopicsWithStats.filter(t => t.subjectId === currentSubjectId);

        // SECONDARY FILTER: Search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            topics = topics.filter(t =>
                t.name.toLowerCase().includes(query) ||
                t.description.toLowerCase().includes(query)
            );
        }

        // SECONDARY FILTER: Performance
        if (performanceFilter === 'low') {
            topics = topics.filter(t => t.score < 60);
        } else if (performanceFilter === 'medium') {
            topics = topics.filter(t => t.score >= 60 && t.score < 80);
        } else if (performanceFilter === 'high') {
            topics = topics.filter(t => t.score >= 80);
        }

        return topics;
    }, [allTopicsWithStats, currentSubjectId, searchQuery, performanceFilter]);

    // Topics to display (with pagination)
    const displayedTopics = filteredTopics.slice(0, displayCount);
    const hasMoreTopics = displayCount < filteredTopics.length;

    const getScoreColor = (score: number) => {
        if (score >= 80) return '#2ecc71';
        if (score >= 60) return '#f39c12';
        return '#e74c3c';
    };

    const loadMoreTopics = () => {
        setDisplayCount(prev => Math.min(prev + 30, filteredTopics.length));
    };

    const toggleTopicExpand = (topicId: number) => {
        setExpandedTopicId(prev => prev === topicId ? null : topicId);
    };

    return (
        <IonPage className="pts-page">
            <IonHeader className="professor-header-container">
                <IonToolbar color="primary" className="professor-toolbar">
                    <div className="ph-content">
                        <IonMenuButton className="ph-menu-btn">
                            <IonIcon icon={menu} />
                        </IonMenuButton>
                    </div>
                </IonToolbar>

                <div className="ph-brand-container-absolute">
                    <div className="ph-brand-name">ArenAI</div>
                    <div className="ph-brand-sub">{t('professor.topicStats.headerTitle')}</div>
                </div>

                <div className="ph-notch-container">
                    <div className="ph-notch">
                        <div className="ph-dropdowns-display">
                            <div className="ph-text-oval">
                                <ProfessorMenu
                                    selectedGrade={String(selectedGrade)}
                                    selectedSection={selectedSection}
                                    selectedSubject={t(currentSubject?.nameKey || 'professor.topicStats.subjects.math')}
                                    onGradeChange={(grade) => setSelectedGrade(parseInt(grade, 10))}
                                    onSectionChange={setSelectedSection}
                                    onSubjectChange={setProfSubject}
                                    hideSubject={activeTab === 'resumen'}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </IonHeader>

            <IonContent fullscreen className="pts-content">
                <PageTransition variant="fade">
                    {/* Tab Selector */}
                    <div className="pts-tabs-container">
                        <IonSegment
                            value={activeTab}
                            onIonChange={(e) => setActiveTab(e.detail.value as any)}
                            className="pts-segment"
                        >
                            <IonSegmentButton value="resumen">
                                <IonIcon icon={statsChartOutline} />
                                <IonLabel>{t('professor.topicStats.tabSummary')}</IonLabel>
                            </IonSegmentButton>
                            <IonSegmentButton value="red">
                                <IonIcon icon={gitNetworkOutline} />
                                <IonLabel>{t('professor.topicStats.tabTopics')}</IonLabel>
                            </IonSegmentButton>
                            <IonSegmentButton value="estudiantes">
                                <IonIcon icon={peopleOutline} />
                                <IonLabel>{t('professor.topicStats.tabStudents')}</IonLabel>
                            </IonSegmentButton>
                        </IonSegment>
                    </div>

                    {/* TAB: Resumen */}
                    {activeTab === 'resumen' && (
                        <div className="pts-tab-content">
                            {/* Class Overview Stats */}
                            <div className="pts-stats-row">
                                <div className="pts-stat-circle" onClick={() => setActiveTab('estudiantes')}>
                                    <span className="pts-stat-value">{classOverview.totalStudents}</span>
                                    <span className="pts-stat-label">{t('professor.topicStats.students')}</span>
                                </div>
                                <div className="pts-stat-circle">
                                    <span className="pts-stat-value" style={{ color: getScoreColor(classOverview.classAverage) }}>
                                        {classOverview.classAverage}%
                                    </span>
                                    <span className="pts-stat-label">{t('professor.topicStats.average')}</span>
                                </div>
                                <div className="pts-stat-circle" onClick={() => setActiveTab('red')}>
                                    <span className="pts-stat-value">{classOverview.totalTopics}</span>
                                    <span className="pts-stat-label">{t('professor.topicStats.topics')}</span>
                                </div>
                                <div className="pts-stat-circle">
                                    <span className="pts-stat-value" style={{ color: getScoreColor(classOverview.completionRate) }}>
                                        {classOverview.completionRate}%
                                    </span>
                                    <span className="pts-stat-label">{t('professor.topicStats.completed')}</span>
                                </div>
                            </div>

                            {/* Performance Distribution */}
                            <div className="pts-card">
                                <div className="pts-card-title">
                                    <IonIcon icon={statsChartOutline} />
                                    {t('professor.topicStats.performanceDistribution')}
                                </div>
                                <div className="pts-performance-bars">
                                    <div className="pts-perf-bar">
                                        <div className="pts-perf-label">
                                            <span className="pts-perf-dot" style={{ background: '#e74c3c' }}></span>
                                            {t('professor.topicStats.low')} ({'<'}60%)
                                        </div>
                                        <div className="pts-perf-track">
                                            <div className="pts-perf-fill" style={{
                                                width: `${(classOverview.lowTopics / classOverview.totalTopics) * 100}%`,
                                                background: '#e74c3c'
                                            }}></div>
                                        </div>
                                        <span className="pts-perf-count">{classOverview.lowTopics}</span>
                                    </div>
                                    <div className="pts-perf-bar">
                                        <div className="pts-perf-label">
                                            <span className="pts-perf-dot" style={{ background: '#f39c12' }}></span>
                                            {t('professor.topicStats.medium')} (60-80%)
                                        </div>
                                        <div className="pts-perf-track">
                                            <div className="pts-perf-fill" style={{
                                                width: `${(classOverview.mediumTopics / classOverview.totalTopics) * 100}%`,
                                                background: '#f39c12'
                                            }}></div>
                                        </div>
                                        <span className="pts-perf-count">{classOverview.mediumTopics}</span>
                                    </div>
                                    <div className="pts-perf-bar">
                                        <div className="pts-perf-label">
                                            <span className="pts-perf-dot" style={{ background: '#2ecc71' }}></span>
                                            {t('professor.topicStats.high')} ({'>'}80%)
                                        </div>
                                        <div className="pts-perf-track">
                                            <div className="pts-perf-fill" style={{
                                                width: `${(classOverview.highTopics / classOverview.totalTopics) * 100}%`,
                                                background: '#2ecc71'
                                            }}></div>
                                        </div>
                                        <span className="pts-perf-count">{classOverview.highTopics}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Subject Breakdown */}
                            <div className="pts-card">
                                <div className="pts-card-title">
                                    <IonIcon icon={schoolOutline} />
                                    {t('professor.topicStats.subjectPerformance')}
                                </div>
                                <div className="pts-subject-grid">
                                    {subjectStats.map(subject => (
                                        <div
                                            key={subject.subjectId}
                                            className="pts-subject-card"
                                            style={{ borderLeftColor: subject.color }}
                                            onClick={() => {
                                                // Change header subject selector
                                                setProfSubject(subject.name);
                                                setActiveTab('red');
                                            }}
                                        >
                                            <div className="pts-subject-header">
                                                <span className="pts-subject-icon">{subject.icon}</span>
                                                <span className="pts-subject-name">{subject.nameKey ? t(subject.nameKey) : subject.name}</span>
                                            </div>
                                            <div className="pts-subject-score" style={{ color: getScoreColor(subject.averageScore) }}>
                                                {subject.averageScore}%
                                            </div>
                                            <div className="pts-subject-meta">
                                                <span>{subject.topicCount} {t('professor.topicStats.topicsLabel')}</span>
                                                <span className="pts-subject-alerts" style={{ color: '#e74c3c' }}>
                                                    ⚠️ {subject.lowCount} {t('professor.topicStats.lowAlerts')}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Weak Topics Alert */}
                            <div className="pts-card">
                                <div className="pts-card-title">
                                    <IonIcon icon={alertCircleOutline} />
                                    {t('professor.topicStats.topicsNeedAttention')}
                                </div>
                                <div className="pts-alerts-list">
                                    {allTopicsWithStats
                                        .filter(t => t.score < 60)
                                        .sort((a, b) => a.score - b.score)
                                        .slice(0, 5)
                                        .map(topic => (
                                            <div
                                                key={topic.id}
                                                className="pts-alert-item warning clickable"
                                                onClick={() => setSelectedTopic(topic)}
                                            >
                                                <span className="pts-alert-icon">{SUBJECTS[topic.subjectId]?.icon}</span>
                                                <div className="pts-alert-info">
                                                    <span className="pts-alert-title">{i18n.language.startsWith('en') ? topic.nameEn || topic.name : topic.name}</span>
                                                    <span className="pts-alert-desc">{SUBJECTS[topic.subjectId]?.nameKey ? t(SUBJECTS[topic.subjectId].nameKey) : SUBJECTS[topic.subjectId]?.name}</span>
                                                </div>
                                                <span style={{ color: getScoreColor(topic.score), fontWeight: 600 }}>
                                                    {topic.score}%
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: Temas */}
                    {activeTab === 'red' && (
                        <div className="pts-tab-content">
                            {/* View Toggle */}
                            <div className="pts-view-toggle">
                                <button
                                    className={`pts-view-btn ${topicsView === 'list' ? 'active' : ''}`}
                                    onClick={() => setTopicsView('list')}
                                >
                                    <IonIcon icon={listOutline} />
                                    {t('professor.topicStats.listView')}
                                </button>
                                <button
                                    className={`pts-view-btn ${topicsView === 'globe' ? 'active' : ''}`}
                                    onClick={() => setTopicsView('globe')}
                                >
                                    <IonIcon icon={globeOutline} />
                                    {t('professor.topicStats.globeView')}
                                </button>
                            </div>

                            {/* Filters */}
                            <div className="pts-filters">
                                {/* Search */}
                                <IonSearchbar
                                    value={searchQuery}
                                    onIonInput={(e) => setSearchQuery(e.detail.value || '')}
                                    placeholder={t('professor.topicStats.searchTopic')}
                                    className="pts-searchbar"
                                />

                                {/* Current Subject Indicator (from header) */}
                                <div className="pts-current-subject">
                                    <div
                                        className="pts-current-subject-badge"
                                        style={{ background: currentSubject?.color }}
                                    >
                                        <span>{currentSubject?.icon}</span>
                                        <span>{currentSubject?.nameKey ? t(currentSubject.nameKey) : currentSubject?.name}</span>
                                    </div>
                                    <span className="pts-subject-count">
                                        {filteredTopics.length} {t('professor.topicStats.topicsLabel')}
                                    </span>
                                </div>

                                {/* Performance Chips */}
                                <div className="pts-perf-chips">
                                    <button
                                        className={`pts-chip ${performanceFilter === 'all' ? 'active' : ''}`}
                                        onClick={() => setPerformanceFilter('all')}
                                    >
                                        {t('professor.topicStats.all')}
                                    </button>
                                    <button
                                        className={`pts-chip low ${performanceFilter === 'low' ? 'active' : ''}`}
                                        onClick={() => setPerformanceFilter('low')}
                                    >
                                        ❌ &lt;60%
                                    </button>
                                    <button
                                        className={`pts-chip medium ${performanceFilter === 'medium' ? 'active' : ''}`}
                                        onClick={() => setPerformanceFilter('medium')}
                                    >
                                        ⚠️ 60-80%
                                    </button>
                                    <button
                                        className={`pts-chip high ${performanceFilter === 'high' ? 'active' : ''}`}
                                        onClick={() => setPerformanceFilter('high')}
                                    >
                                        ✅ &gt;80%
                                    </button>
                                </div>

                                {/* Results Count */}
                                <div className="pts-results-count">
                                    {t('professor.topicStats.showing')} {displayedTopics.length} {t('professor.topicStats.of')} {filteredTopics.length} {t('professor.topicStats.topicsLabel')}
                                    {filteredTopics.length !== allTopicsWithStats.length && (
                                        <span> ({t('professor.topicStats.filteredOf')} {allTopicsWithStats.length})</span>
                                    )}
                                </div>
                            </div>

                            {/* Globe View */}
                            {topicsView === 'globe' && (
                                <>
                                    {filteredTopics.length <= 50 ? (
                                        <>
                                            <TopicGlobe
                                                topics={filteredTopics.map(t => ({
                                                    id: String(t.id),
                                                    name: t.name,
                                                    parentId: null,
                                                    level: 0,
                                                    score: t.score,
                                                    connections: [],
                                                    studentsCompleted: t.studentsCompleted,
                                                    totalStudents: t.totalStudents,
                                                    correctAnswers: t.correctAnswers,
                                                    incorrectAnswers: t.incorrectAnswers,
                                                    commonMistakes: t.commonMistakes,
                                                    strugglingStudents: t.strugglingStudents,
                                                    topPerformers: t.topPerformers,
                                                }))}
                                                onTopicClick={(topic) => {
                                                    const found = filteredTopics.find(t => String(t.id) === topic.id);
                                                    if (found) setSelectedTopic(found);
                                                }}
                                            />
                                            <div className="pts-globe-legend">
                                                {Object.entries(SUBJECTS).map(([id, s]) => (
                                                    <span key={id} style={{ color: s.color }}>
                                                        {s.icon} {s.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="pts-globe-message">
                                            <IonIcon icon={filterOutline} />
                                            <p>{t('professor.topicStats.applyFilters')}</p>
                                            <span>{t('professor.topicStats.maxTopics')}</span>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* List View */}
                            {topicsView === 'list' && (
                                <div className="pts-topics-list">
                                    {displayedTopics.map(topic => (
                                        <div
                                            key={topic.id}
                                            className={`pts-topic-card ${expandedTopicId === topic.id ? 'expanded' : ''}`}
                                        >
                                            <div
                                                className="pts-topic-header clickable"
                                                onClick={() => toggleTopicExpand(topic.id)}
                                            >
                                                <span
                                                    className="pts-topic-subject"
                                                    style={{ background: SUBJECTS[topic.subjectId]?.color }}
                                                >
                                                    {SUBJECTS[topic.subjectId]?.icon}
                                                </span>
                                                <div className="pts-topic-info">
                                                    <span className="pts-topic-name">{i18n.language.startsWith('en') ? topic.nameEn || topic.name : topic.name}</span>
                                                    <div className="pts-topic-bar-track">
                                                        <div
                                                            className="pts-topic-bar-fill"
                                                            style={{
                                                                width: `${topic.score}%`,
                                                                background: getScoreColor(topic.score),
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                                <span
                                                    className="pts-topic-score"
                                                    style={{ color: getScoreColor(topic.score) }}
                                                >
                                                    {topic.score}%
                                                </span>
                                                <IonIcon
                                                    icon={expandedTopicId === topic.id ? chevronUpOutline : chevronDownOutline}
                                                    className="pts-topic-expand-icon"
                                                />
                                            </div>

                                            {expandedTopicId === topic.id && (
                                                <div className="pts-topic-details">
                                                    <p className="pts-topic-desc">{i18n.language.startsWith('en') ? topic.descriptionEn || topic.description : topic.description}</p>
                                                    <div className="pts-topic-stats">
                                                        <div className="pts-topic-stat">
                                                            <IonIcon icon={peopleOutline} />
                                                            <span>{topic.studentsCompleted}/{topic.totalStudents} {t('professor.topicStats.completedCount')}</span>
                                                        </div>
                                                        <div className="pts-topic-stat">
                                                            <IonIcon icon={checkmarkCircleOutline} style={{ color: '#2ecc71' }} />
                                                            <span>{topic.correctAnswers} {t('professor.topicStats.correct')}</span>
                                                        </div>
                                                        <div className="pts-topic-stat">
                                                            <IonIcon icon={closeCircleOutline} style={{ color: '#e74c3c' }} />
                                                            <span>{topic.incorrectAnswers} {t('professor.topicStats.incorrect')}</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        className="pts-topic-btn"
                                                        onClick={() => setSelectedTopic(topic)}
                                                    >
                                                        {t('professor.topicStats.viewFullDetails')}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {hasMoreTopics && (
                                        <button className="pts-load-more" onClick={loadMoreTopics}>
                                            {t('professor.topicStats.loadMore')} ({filteredTopics.length - displayCount} {t('professor.topicStats.remaining')})
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: Estudiantes */}
                    {activeTab === 'estudiantes' && (
                        <div className="pts-tab-content">
                            <div className="pts-top-students">
                                {STUDENTS.slice(0, 3).map((student, idx) => (
                                    <div
                                        key={student.id}
                                        className={`pts-top-card rank-${idx + 1}`}
                                        onClick={() => setSelectedStudent(student)}
                                    >
                                        <div className="pts-top-rank">{idx + 1}</div>
                                        <div className="pts-top-avatar">
                                            {student.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div className="pts-top-name">{student.name}</div>
                                        <div className="pts-top-score" style={{ color: getScoreColor(student.averageScore) }}>
                                            {student.averageScore}%
                                        </div>
                                        <div className="pts-top-streak">
                                            <IonIcon icon={flameOutline} />
                                            {student.streak}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pts-students-list">
                                {STUDENTS.slice(3).map((student, idx) => (
                                    <div
                                        key={student.id}
                                        className="pts-student-row clickable"
                                        onClick={() => setSelectedStudent(student)}
                                    >
                                        <div className="pts-student-rank">{idx + 4}</div>
                                        <div className="pts-student-avatar">
                                            {student.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div className="pts-student-info">
                                            <span className="pts-student-name">{student.name}</span>
                                            <span className="pts-student-stats">
                                                Lvl {student.level} • {student.quizzesTaken} {t('professor.topicStats.quizzes').toLowerCase()}
                                            </span>
                                        </div>
                                        <div className="pts-student-score" style={{ color: getScoreColor(student.averageScore) }}>
                                            {student.averageScore}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="pts-footer-spacer"></div>
                </PageTransition>
            </IonContent>

            {/* Topic Detail Modal */}
            <IonModal isOpen={!!selectedTopic} onDidDismiss={() => setSelectedTopic(null)}>
                <div className="pts-modal">
                    <div className="pts-modal-header">
                        <h2>{i18n.language.startsWith('en') ? selectedTopic?.nameEn || selectedTopic?.name : selectedTopic?.name}</h2>
                        <button className="pts-modal-close" onClick={() => setSelectedTopic(null)}>
                            <IonIcon icon={closeOutline} />
                        </button>
                    </div>
                    {selectedTopic && (
                        <div className="pts-modal-content">
                            <div className="pts-modal-subject-badge" style={{ background: SUBJECTS[selectedTopic.subjectId]?.color }}>
                                {SUBJECTS[selectedTopic.subjectId]?.icon} {SUBJECTS[selectedTopic.subjectId]?.nameKey ? t(SUBJECTS[selectedTopic.subjectId].nameKey) : SUBJECTS[selectedTopic.subjectId]?.name}
                            </div>

                            <div className="pts-modal-score-row">
                                <div className="pts-modal-big-score" style={{ color: getScoreColor(selectedTopic.score) }}>
                                    {selectedTopic.score}%
                                </div>
                                <div className="pts-modal-score-label">{t('professor.topicStats.classAverage')}</div>
                            </div>

                            <p className="pts-modal-description">
                                {i18n.language.startsWith('en') ? selectedTopic.descriptionEn || selectedTopic.description : selectedTopic.description}
                            </p>

                            <div className="pts-modal-stats">
                                <div className="pts-modal-stat">
                                    <IonIcon icon={checkmarkCircleOutline} style={{ color: '#2ecc71' }} />
                                    <span className="pts-modal-stat-value">{selectedTopic.correctAnswers}</span>
                                    <span className="pts-modal-stat-label">{t('professor.topicStats.modalCorrect')}</span>
                                </div>
                                <div className="pts-modal-stat">
                                    <IonIcon icon={closeCircleOutline} style={{ color: '#e74c3c' }} />
                                    <span className="pts-modal-stat-value">{selectedTopic.incorrectAnswers}</span>
                                    <span className="pts-modal-stat-label">{t('professor.topicStats.modalIncorrect')}</span>
                                </div>
                                <div className="pts-modal-stat">
                                    <IonIcon icon={peopleOutline} />
                                    <span className="pts-modal-stat-value">{selectedTopic.studentsCompleted}/{selectedTopic.totalStudents}</span>
                                    <span className="pts-modal-stat-label">{t('professor.topicStats.modalCompleted')}</span>
                                </div>
                            </div>

                            <div className="pts-modal-section">
                                <h3>❌ {t('professor.topicStats.commonMistakes')}</h3>
                                <ul>
                                    {(i18n.language.startsWith('en') && selectedTopic.commonMistakesEn && selectedTopic.commonMistakesEn.length > 0
                                        ? selectedTopic.commonMistakesEn
                                        : selectedTopic.commonMistakes
                                    ).map((mistake, idx) => (
                                        <li key={idx}>{mistake}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="pts-modal-section">
                                <h3>⚠️ {t('professor.topicStats.strugglingStudents')}</h3>
                                <div className="pts-modal-student-list">
                                    {selectedTopic.strugglingStudents.map((s, idx) => (
                                        <div key={idx} className="pts-modal-student-item">
                                            <span>{s.name}</span>
                                            <span style={{ color: getScoreColor(s.score) }}>{s.score}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pts-modal-section">
                                <h3>⭐ {t('professor.topicStats.topPerformers')}</h3>
                                <div className="pts-modal-student-list">
                                    {selectedTopic.topPerformers.map((s, idx) => (
                                        <div key={idx} className="pts-modal-student-item">
                                            <span>{s.name}</span>
                                            <span style={{ color: getScoreColor(s.score) }}>{s.score}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </IonModal>

            {/* Student Detail Modal */}
            <IonModal isOpen={!!selectedStudent} onDidDismiss={() => setSelectedStudent(null)}>
                <div className="pts-modal">
                    <div className="pts-modal-header">
                        <h2>{selectedStudent?.name}</h2>
                        <button className="pts-modal-close" onClick={() => setSelectedStudent(null)}>
                            <IonIcon icon={closeOutline} />
                        </button>
                    </div>
                    {selectedStudent && (
                        <div className="pts-modal-content">
                            {/* Score & Level Row */}
                            <div className="pts-student-profile-row">
                                <div className="pts-student-avatar-lg">
                                    {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="pts-student-profile-info">
                                    <div className="pts-student-level-badge">
                                        {t('professor.topicStats.level')} {selectedStudent.level}
                                    </div>
                                    <div className="pts-student-xp">
                                        ⚡ {selectedStudent.xp} XP
                                    </div>
                                    <div className="pts-student-main-score" style={{ color: getScoreColor(selectedStudent.averageScore) }}>
                                        {selectedStudent.averageScore}% {t('professor.topicStats.averageLabel')}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="pts-modal-stats">
                                <div className="pts-modal-stat">
                                    <IonIcon icon={flameOutline} style={{ color: selectedStudent.streak > 0 ? '#e74c3c' : '#ccc' }} />
                                    <span className="pts-modal-stat-value">{selectedStudent.streak}</span>
                                    <span className="pts-modal-stat-label">{t('professor.topicStats.streak')}</span>
                                </div>
                                <div className="pts-modal-stat">
                                    <IonIcon icon={schoolOutline} />
                                    <span className="pts-modal-stat-value">{selectedStudent.quizzesTaken}</span>
                                    <span className="pts-modal-stat-label">{t('professor.topicStats.quizzes')}</span>
                                </div>
                                <div className="pts-modal-stat">
                                    <IonIcon icon={gameControllerOutline} />
                                    <span className="pts-modal-stat-value">{selectedStudent.battlesWon}/{selectedStudent.totalBattles}</span>
                                    <span className="pts-modal-stat-label">{t('professor.topicStats.battles')}</span>
                                </div>
                                <div className="pts-modal-stat">
                                    <IonIcon icon={timeOutline} />
                                    <span className="pts-modal-stat-value">{selectedStudent.studyTime}m</span>
                                    <span className="pts-modal-stat-label">{t('professor.topicStats.studyTime')}</span>
                                </div>
                            </div>

                            {selectedStudent.tardies >= 3 && (
                                <div className="pts-modal-warning">
                                    ⚠️ {selectedStudent.tardies} {t('professor.topicStats.tardiesWarning')}
                                </div>
                            )}

                            {/* Subject Breakdown */}
                            <div className="pts-modal-section">
                                <h3>📊 {t('professor.topicStats.subjectBreakdown')}</h3>
                                <div className="pts-subject-bars">
                                    {selectedStudent.subjectScores.map(subj => (
                                        <div key={subj.subjectId} className="pts-subject-bar-row">
                                            <span className="pts-subject-bar-icon">{SUBJECTS[subj.subjectId]?.icon}</span>
                                            <span className="pts-subject-bar-name">{SUBJECTS[subj.subjectId]?.nameKey ? t(SUBJECTS[subj.subjectId].nameKey) : SUBJECTS[subj.subjectId]?.name}</span>
                                            <div className="pts-subject-bar-track">
                                                <div
                                                    className="pts-subject-bar-fill"
                                                    style={{
                                                        width: `${subj.score}%`,
                                                        background: getScoreColor(subj.score)
                                                    }}
                                                />
                                            </div>
                                            <span className="pts-subject-bar-score" style={{ color: getScoreColor(subj.score) }}>
                                                {subj.score}%
                                            </span>
                                            <span className="pts-subject-bar-progress">
                                                {subj.topicsCompleted}/{subj.totalTopics}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Weak Topics */}
                            {selectedStudent.weakTopics.length > 0 && (
                                <div className="pts-modal-section">
                                    <h3>⚠️ {t('professor.topicStats.weakTopics')}</h3>
                                    <div className="pts-weak-topics-list">
                                        {selectedStudent.weakTopics.map((topic, idx) => (
                                            <div key={idx} className="pts-weak-topic-item">
                                                <span className="pts-weak-topic-icon">{SUBJECTS[topic.subjectId]?.icon}</span>
                                                <span className="pts-weak-topic-name">{i18n.language.startsWith('en') ? topic.nameEn || topic.name : topic.name}</span>
                                                <span className="pts-weak-topic-score" style={{ color: getScoreColor(topic.score) }}>
                                                    {topic.score}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Strong Topics */}
                            {selectedStudent.strongTopics.length > 0 && (
                                <div className="pts-modal-section">
                                    <h3>⭐ {t('professor.topicStats.strongTopics')}</h3>
                                    <div className="pts-strong-topics-list">
                                        {selectedStudent.strongTopics.map((topic, idx) => (
                                            <div key={idx} className="pts-strong-topic-item">
                                                <span className="pts-strong-topic-icon">{SUBJECTS[topic.subjectId]?.icon}</span>
                                                <span className="pts-strong-topic-name">{i18n.language.startsWith('en') ? topic.nameEn || topic.name : topic.name}</span>
                                                <span className="pts-strong-topic-score" style={{ color: '#2ecc71' }}>
                                                    {topic.score}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recent Activity */}
                            {selectedStudent.recentActivity.length > 0 && (
                                <div className="pts-modal-section">
                                    <h3>📅 {t('professor.topicStats.recentActivity')}</h3>
                                    <div className="pts-activity-timeline">
                                        {selectedStudent.recentActivity.map((activity, idx) => (
                                            <div key={idx} className="pts-activity-item">
                                                <span className="pts-activity-icon">
                                                    {activity.type === 'quiz' && '📝'}
                                                    {activity.type === 'battle' && '⚔️'}
                                                    {activity.type === 'study' && '📖'}
                                                    {activity.type === 'achievement' && '🏆'}
                                                </span>
                                                <div className="pts-activity-info">
                                                    <span className="pts-activity-desc">{activity.description}</span>
                                                    <span className="pts-activity-date">{activity.date}</span>
                                                </div>
                                                {activity.score !== undefined && (
                                                    <span className="pts-activity-score" style={{ color: getScoreColor(activity.score) }}>
                                                        {activity.score}%
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Achievements */}
                            {selectedStudent.achievements.length > 0 && (
                                <div className="pts-modal-section">
                                    <h3>🎖️ {t('professor.topicStats.achievements')}</h3>
                                    <div className="pts-achievements-grid">
                                        {selectedStudent.achievements.map((ach, idx) => (
                                            <div key={idx} className="pts-achievement-badge">
                                                <span className="pts-achievement-icon">{ach.icon}</span>
                                                <span className="pts-achievement-name">{ach.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Empty State for students with little data */}
                            {selectedStudent.recentActivity.length === 0 && selectedStudent.achievements.length === 0 && (
                                <div className="pts-modal-empty-state">
                                    <span>📉</span>
                                    <p>{t('professor.topicStats.emptyStateTitle')}</p>
                                    <span className="pts-empty-hint">{t('professor.topicStats.emptyStateHint')}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </IonModal>
        </IonPage>
    );
};

export default ProfessorTopicStats;
