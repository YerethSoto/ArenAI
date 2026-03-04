import React, { useState, useMemo, useEffect } from 'react';
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
import { getApiUrl } from '../config/api';
import '../components/ProfessorHeader.css';
import './ProfessorQuizResults.css';

// ================================ DATA MODELS ================================

interface QuizResult {
    studentId: number;
    studentName: string;
    score: number;
    maxScore: number;
    finishedAt: string;
    attemptId: number;
}

interface QuizInfo {
    id: number;
    title: string;
    subject: string;
    date: string;
    maxScore: number;
}

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
    if (!dateStr) return '';
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

    const [quizzes, setQuizzes] = useState<QuizInfo[]>([]);
    const [results, setResults] = useState<QuizResult[]>([]);
    const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState<'name' | 'score-desc' | 'score-asc'>('score-desc');
    const [showQuizPicker, setShowQuizPicker] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingResults, setLoadingResults] = useState(false);
    const history = useHistory();

    // Fetch quizzes on mount
    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                if (!user?.id) return;

                const response = await fetch(getApiUrl(`/api/quizzes/professor/${user.id}`), {
                    headers: { 'Content-Type': 'application/json' },
                });
                const data = await response.json();

                const quizList: QuizInfo[] = (data.quizzes || []).map((q: any) => ({
                    id: q.id_quiz,
                    title: q.quiz_name,
                    subject: q.name_subject || '',
                    date: q.created_at || '',
                    maxScore: 100,
                }));

                setQuizzes(quizList);
                if (quizList.length > 0) {
                    setSelectedQuizId(quizList[0].id);
                }
            } catch (err) {
                console.error('Error fetching quizzes:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchQuizzes();
    }, []);

    // Fetch results when selected quiz changes
    useEffect(() => {
        if (!selectedQuizId) return;

        const fetchResults = async () => {
            setLoadingResults(true);
            try {
                const response = await fetch(getApiUrl(`/api/quizzes/${selectedQuizId}/results`), {
                    headers: { 'Content-Type': 'application/json' },
                });
                const data = await response.json();

                if (data.quiz) {
                    // Update quiz maxScore from real data
                    setQuizzes(prev => prev.map(q =>
                        q.id === selectedQuizId ? { ...q, maxScore: data.quiz.maxScore } : q
                    ));
                }

                setResults((data.results || []).map((r: any) => ({
                    studentId: r.studentId,
                    studentName: r.studentName,
                    score: r.score,
                    maxScore: r.maxScore,
                    finishedAt: r.finishedAt || '',
                    attemptId: r.attemptId,
                })));
            } catch (err) {
                console.error('Error fetching quiz results:', err);
                setResults([]);
            } finally {
                setLoadingResults(false);
            }
        };
        fetchResults();
    }, [selectedQuizId]);

    const selectedQuiz = useMemo(
        () => quizzes.find(q => q.id === selectedQuizId) || quizzes[0],
        [selectedQuizId, quizzes]
    );

    const sortedResults = useMemo(() => {
        const arr = [...results];
        if (sortBy === 'name') arr.sort((a, b) => a.studentName.localeCompare(b.studentName));
        else if (sortBy === 'score-desc') arr.sort((a, b) => b.score - a.score);
        else arr.sort((a, b) => a.score - b.score);
        return arr;
    }, [results, sortBy]);

    // Summary stats
    const stats = useMemo(() => {
        if (results.length === 0) return { avg: 0, max: 0, min: 0, passed: 0, passRate: 0, total: 0 };
        const scores = results.map(r => r.score);
        const maxScore = selectedQuiz?.maxScore || 100;
        const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        const max = Math.max(...scores);
        const min = Math.min(...scores);
        const passed = scores.filter(s => (s / maxScore) * 100 >= 60).length;
        const passRate = Math.round((passed / scores.length) * 100);
        return { avg, max, min, passed, passRate, total: scores.length };
    }, [results, selectedQuiz]);

    if (loading) {
        return (
            <IonPage className="pqr-page global-background-pattern">
                <IonContent>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <p style={{ color: 'var(--ion-text-color)' }}>Cargando quizzes...</p>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

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

                    {quizzes.length === 0 ? (
                        <div className="pqr-section" style={{ textAlign: 'center', padding: '40px 20px' }}>
                            <IonIcon icon={schoolOutline} style={{ fontSize: '64px', opacity: 0.3, color: 'var(--ion-text-color)' }} />
                            <p style={{ color: 'var(--ion-text-color)', opacity: 0.6, marginTop: '16px' }}>No tienes quizzes creados todavía</p>
                        </div>
                    ) : (
                        <>
                            {/* ── Quiz Selector ── */}
                            <div className="pqr-section">
                                <button
                                    className="pqr-quiz-selector"
                                    onClick={() => setShowQuizPicker(p => !p)}
                                >
                                    <div className="pqr-quiz-selector-left">
                                        <IonIcon icon={schoolOutline} className="pqr-quiz-selector-icon" />
                                        <div className="pqr-quiz-selector-text">
                                            <span className="pqr-quiz-selector-title">{selectedQuiz?.title}</span>
                                            <span className="pqr-quiz-selector-sub">
                                                {selectedQuiz?.subject} · {formatDate(selectedQuiz?.date || '')}
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
                                        {quizzes.map(quiz => (
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
                                        <IonIcon icon={statsChartOutline} className="pqr-stat-icon" style={{ color: getScoreColor(stats.avg, selectedQuiz?.maxScore || 100) }} />
                                        <span className="pqr-stat-value" style={{ color: getScoreColor(stats.avg, selectedQuiz?.maxScore || 100) }}>
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
                                {loadingResults ? (
                                    <div style={{ textAlign: 'center', padding: '30px' }}>
                                        <p style={{ color: 'var(--ion-text-color)', opacity: 0.6 }}>Cargando resultados...</p>
                                    </div>
                                ) : sortedResults.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '30px' }}>
                                        <p style={{ color: 'var(--ion-text-color)', opacity: 0.6 }}>Ningún estudiante ha completado este quiz</p>
                                    </div>
                                ) : (
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
                                                        quizTitle: selectedQuiz?.title,
                                                        quizSubject: selectedQuiz?.subject,
                                                        quizDate: formatDate(selectedQuiz?.date || ''),
                                                        quizId: selectedQuizId,
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
                                )}
                            </div>
                        </>
                    )}

                    <div className="pqr-footer-spacer" />
                </PageTransition>
            </IonContent>
        </IonPage>
    );
};

export default ProfessorQuizResults;
