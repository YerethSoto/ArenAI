import React, { useState, useMemo } from 'react';
import {
    IonPage,
    IonContent,
    IonIcon,
    IonHeader,
    IonToolbar,
    IonMenuButton,
} from '@ionic/react';
import {
    menu,
    schoolOutline,
    trophyOutline,
    alertCircleOutline,
    checkmarkCircleOutline,
    chevronDownOutline,
    chevronUpOutline,
    filterOutline,
    statsChartOutline,
    chevronForwardOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import ProfessorMenu from '../components/ProfessorMenu';
import { useProfessorFilters } from '../hooks/useProfessorFilters';
import { useTranslation } from 'react-i18next';
import '../components/ProfessorHeader.css';
import './ProfessorQuizResults.css';

// ================================ DATA MODELS ================================

interface QuizResult {
    studentId: string;
    studentName: string;
    score: number;
    maxScore: number;
    submittedAt: string; // ISO date string
}

interface QuizInfo {
    id: string;
    title: string;
    subject: string;
    date: string;
    maxScore: number;
    results: QuizResult[];
}

// ================================ MOCK DATA ================================

const QUIZZES: QuizInfo[] = [
    {
        id: 'q1',
        title: 'Quiz: Fracciones',
        subject: 'Matemáticas',
        date: '2026-02-24',
        maxScore: 100,
        results: [
            { studentId: 's1', studentName: 'Ana García', score: 88, maxScore: 100, submittedAt: '2026-02-24T10:15:00' },
            { studentId: 's2', studentName: 'Carlos Martínez', score: 94, maxScore: 100, submittedAt: '2026-02-24T10:20:00' },
            { studentId: 's3', studentName: 'María Rodríguez', score: 50, maxScore: 100, submittedAt: '2026-02-24T10:35:00' },
            { studentId: 's4', studentName: 'Diego Sánchez', score: 67, maxScore: 100, submittedAt: '2026-02-24T10:40:00' },
            { studentId: 's5', studentName: 'Sofía Torres', score: 32, maxScore: 100, submittedAt: '2026-02-24T10:50:00' },
            { studentId: 's6', studentName: 'Luis Rodríguez', score: 88, maxScore: 100, submittedAt: '2026-02-24T11:00:00' },
            { studentId: 's7', studentName: 'Elena Martínez', score: 90, maxScore: 100, submittedAt: '2026-02-24T11:05:00' },
            { studentId: 's8', studentName: 'Pedro Gómez', score: 45, maxScore: 100, submittedAt: '2026-02-24T11:20:00' },
        ],
    },
    {
        id: 'q2',
        title: 'Quiz: Álgebra',
        subject: 'Matemáticas',
        date: '2026-02-20',
        maxScore: 100,
        results: [
            { studentId: 's1', studentName: 'Ana García', score: 97, maxScore: 100, submittedAt: '2026-02-20T09:10:00' },
            { studentId: 's2', studentName: 'Carlos Martínez', score: 78, maxScore: 100, submittedAt: '2026-02-20T09:15:00' },
            { studentId: 's3', studentName: 'María Rodríguez', score: 62, maxScore: 100, submittedAt: '2026-02-20T09:25:00' },
            { studentId: 's4', studentName: 'Diego Sánchez', score: 80, maxScore: 100, submittedAt: '2026-02-20T09:30:00' },
            { studentId: 's5', studentName: 'Sofía Torres', score: 55, maxScore: 100, submittedAt: '2026-02-20T09:45:00' },
            { studentId: 's6', studentName: 'Luis Rodríguez', score: 70, maxScore: 100, submittedAt: '2026-02-20T09:55:00' },
            { studentId: 's7', studentName: 'Elena Martínez', score: 48, maxScore: 100, submittedAt: '2026-02-20T10:00:00' },
            { studentId: 's8', studentName: 'Pedro Gómez', score: 35, maxScore: 100, submittedAt: '2026-02-20T10:10:00' },
        ],
    },
    {
        id: 'q3',
        title: 'Quiz: Ecosistemas',
        subject: 'Ciencias',
        date: '2026-02-17',
        maxScore: 100,
        results: [
            { studentId: 's1', studentName: 'Ana García', score: 95, maxScore: 100, submittedAt: '2026-02-17T09:05:00' },
            { studentId: 's2', studentName: 'Carlos Martínez', score: 85, maxScore: 100, submittedAt: '2026-02-17T09:10:00' },
            { studentId: 's3', studentName: 'María Rodríguez', score: 90, maxScore: 100, submittedAt: '2026-02-17T09:20:00' },
            { studentId: 's4', studentName: 'Diego Sánchez', score: 73, maxScore: 100, submittedAt: '2026-02-17T09:35:00' },
            { studentId: 's5', studentName: 'Sofía Torres', score: 60, maxScore: 100, submittedAt: '2026-02-17T09:50:00' },
            { studentId: 's6', studentName: 'Luis Rodríguez', score: 55, maxScore: 100, submittedAt: '2026-02-17T10:00:00' },
            { studentId: 's7', studentName: 'Elena Martínez', score: 40, maxScore: 100, submittedAt: '2026-02-17T10:05:00' },
            { studentId: 's8', studentName: 'Pedro Gómez', score: 28, maxScore: 100, submittedAt: '2026-02-17T10:15:00' },
        ],
    },
];

// ================================ HELPERS ================================

const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    return parts.length >= 2
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : name.substring(0, 2).toUpperCase();
};

const getScoreColor = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 80) return '#2ecc71';
    if (pct >= 60) return '#f39c12';
    return '#e74c3c';
};

const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ================================ SUB-COMPONENTS ================================

const ScoreBadge: React.FC<{ score: number; maxScore: number }> = ({ score, maxScore }) => {
    const color = getScoreColor(score, maxScore);
    return (
        <span className="pqr-score-badge" style={{ color, borderColor: color }}>
            {score}/{maxScore}
        </span>
    );
};

// ================================ MAIN COMPONENT ================================

const ProfessorQuizResults: React.FC = () => {
    const { t } = useTranslation();
    const {
        selectedGrade,
        setSelectedGrade,
        selectedSection,
        setSelectedSection,
        selectedSubject: profSubject,
        setSelectedSubject: setProfSubject,
    } = useProfessorFilters();

    const [selectedQuizId, setSelectedQuizId] = useState<string>(QUIZZES[0].id);
    const [sortBy, setSortBy] = useState<'name' | 'score-desc' | 'score-asc'>('score-desc');
    const [showQuizPicker, setShowQuizPicker] = useState(false);
    const history = useHistory();

    const selectedQuiz = useMemo(
        () => QUIZZES.find(q => q.id === selectedQuizId) || QUIZZES[0],
        [selectedQuizId]
    );

    const sortedResults = useMemo(() => {
        const arr = [...selectedQuiz.results];
        if (sortBy === 'name') arr.sort((a, b) => a.studentName.localeCompare(b.studentName));
        else if (sortBy === 'score-desc') arr.sort((a, b) => b.score - a.score);
        else arr.sort((a, b) => a.score - b.score);
        return arr;
    }, [selectedQuiz, sortBy]);

    // Summary stats
    const stats = useMemo(() => {
        const scores = selectedQuiz.results.map(r => r.score);
        const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        const max = Math.max(...scores);
        const min = Math.min(...scores);
        const passed = scores.filter(s => (s / selectedQuiz.maxScore) * 100 >= 60).length;
        const passRate = Math.round((passed / scores.length) * 100);
        return { avg, max, min, passed, passRate, total: scores.length };
    }, [selectedQuiz]);

    return (
        <IonPage className="pqr-page global-background-pattern">
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
                    <div className="ph-brand-sub">Resultados</div>
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

            <IonContent fullscreen className="pqr-content">
                <PageTransition variant="fade">

                    {/* ── Quiz Selector ── */}
                    <div className="pqr-section">
                        <button
                            className="pqr-quiz-selector"
                            onClick={() => setShowQuizPicker(p => !p)}
                        >
                            <div className="pqr-quiz-selector-left">
                                <IonIcon icon={schoolOutline} className="pqr-quiz-selector-icon" />
                                <div className="pqr-quiz-selector-text">
                                    <span className="pqr-quiz-selector-title">{selectedQuiz.title}</span>
                                    <span className="pqr-quiz-selector-sub">
                                        {selectedQuiz.subject} · {formatDate(selectedQuiz.date)}
                                    </span>
                                </div>
                            </div>
                            <IonIcon
                                icon={showQuizPicker ? chevronUpOutline : chevronDownOutline}
                                className="pqr-quiz-selector-chevron"
                            />
                        </button>

                        {showQuizPicker && (
                            <div className="pqr-quiz-picker">
                                {QUIZZES.map(quiz => (
                                    <button
                                        key={quiz.id}
                                        className={`pqr-quiz-option ${quiz.id === selectedQuizId ? 'active' : ''}`}
                                        onClick={() => {
                                            setSelectedQuizId(quiz.id);
                                            setShowQuizPicker(false);
                                        }}
                                    >
                                        <span className="pqr-quiz-option-title">{quiz.title}</span>
                                        <span className="pqr-quiz-option-sub">
                                            {quiz.subject} · {formatDate(quiz.date)}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Summary Stats ── */}
                    <div className="pqr-section">
                        <div className="pqr-stats-grid">
                            <div className="pqr-stat-card">
                                <IonIcon icon={statsChartOutline} className="pqr-stat-icon" style={{ color: getScoreColor(stats.avg, 100) }} />
                                <span className="pqr-stat-value" style={{ color: getScoreColor(stats.avg, 100) }}>
                                    {stats.avg}
                                </span>
                                <span className="pqr-stat-label">Promedio</span>
                            </div>
                            <div className="pqr-stat-card">
                                <IonIcon icon={trophyOutline} className="pqr-stat-icon" style={{ color: '#2ecc71' }} />
                                <span className="pqr-stat-value" style={{ color: '#2ecc71' }}>{stats.max}</span>
                                <span className="pqr-stat-label">Más Alto</span>
                            </div>
                            <div className="pqr-stat-card">
                                <IonIcon icon={alertCircleOutline} className="pqr-stat-icon" style={{ color: '#e74c3c' }} />
                                <span className="pqr-stat-value" style={{ color: '#e74c3c' }}>{stats.min}</span>
                                <span className="pqr-stat-label">Más Bajo</span>
                            </div>
                            <div className="pqr-stat-card">
                                <IonIcon icon={checkmarkCircleOutline} className="pqr-stat-icon" style={{ color: '#3498db' }} />
                                <span className="pqr-stat-value" style={{ color: '#3498db' }}>{stats.passRate}%</span>
                                <span className="pqr-stat-label">Aprobados</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Sort Controls ── */}
                    <div className="pqr-section pqr-sort-row">
                        <IonIcon icon={filterOutline} className="pqr-sort-icon" />
                        <span className="pqr-sort-label">Ordenar por:</span>
                        <div className="pqr-sort-chips">
                            {[
                                { key: 'score-desc' as const, label: 'Mayor puntaje' },
                                { key: 'score-asc' as const, label: 'Menor puntaje' },
                                { key: 'name' as const, label: 'Nombre' },
                            ].map(opt => (
                                <button
                                    key={opt.key}
                                    className={`pqr-sort-chip ${sortBy === opt.key ? 'active' : ''}`}
                                    onClick={() => setSortBy(opt.key)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Student Results List ── */}
                    <div className="pqr-section">
                        <div className="pqr-results-list">
                            {sortedResults.map((result, idx) => {
                                const color = getScoreColor(result.score, result.maxScore);
                                const pct = Math.round((result.score / result.maxScore) * 100);
                                return (
                                    <div
                                        key={result.studentId}
                                        className="pqr-result-row pqr-result-row-clickable"
                                        onClick={() => history.push('/prof-student-quiz-detail', {
                                            studentId: result.studentId,
                                            studentName: result.studentName,
                                            score: result.score,
                                            maxScore: result.maxScore,
                                            quizTitle: selectedQuiz.title,
                                            quizSubject: selectedQuiz.subject,
                                            quizDate: formatDate(selectedQuiz.date),
                                            metrics: {
                                                precision: Math.min(100, Math.round(pct + (result.studentId.charCodeAt(result.studentId.length - 1) % 10) - 5)),
                                                speed: Math.min(100, Math.round(60 + (result.studentId.charCodeAt(result.studentId.length - 1) % 30))),
                                                consistency: Math.min(100, Math.round(pct - 5 + (result.studentId.charCodeAt(result.studentId.length - 1) % 15))),
                                                participation: Math.min(100, Math.round(70 + (result.studentId.charCodeAt(result.studentId.length - 1) % 25))),
                                                comprehension: Math.min(100, Math.round(pct + (result.studentId.charCodeAt(result.studentId.length - 1) % 20) - 10)),
                                            },
                                        })}
                                    >
                                        {/* Rank */}
                                        <span className="pqr-rank">{idx + 1}</span>

                                        {/* Avatar */}
                                        <div className="pqr-avatar" style={{ borderColor: color }}>
                                            {getInitials(result.studentName)}
                                        </div>

                                        {/* Name */}
                                        <div className="pqr-student-info">
                                            <span className="pqr-student-name">{result.studentName}</span>
                                            <div className="pqr-score-bar-track">
                                                <div
                                                    className="pqr-score-bar-fill"
                                                    style={{ width: `${pct}%`, background: color }}
                                                />
                                            </div>
                                        </div>

                                        {/* Score */}
                                        <ScoreBadge score={result.score} maxScore={result.maxScore} />

                                        {/* Arrow */}
                                        <IonIcon icon={chevronForwardOutline} className="pqr-row-arrow" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pqr-footer-spacer" />
                </PageTransition>
            </IonContent>
        </IonPage>
    );
};

export default ProfessorQuizResults;
