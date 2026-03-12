import React, { useState, useEffect } from 'react';
import {
    IonPage,
    IonContent,
    IonHeader,
    IonToolbar,
    IonIcon,
    IonBackButton,
    IonButtons,
} from '@ionic/react';
import {
    arrowBackOutline,
    checkmarkCircleOutline,
    closeCircleOutline,
    timeOutline,
    trophyOutline,
    flashOutline,
    statsChartOutline,
    ribbonOutline,
    saveOutline,
    createOutline,
} from 'ionicons/icons';
import { useLocation, useHistory } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import { getApiUrl } from '../config/api';
import './ProfessorStudentQuizDetail.css';

// ================================ TYPES ================================

interface QuestionResult {
    questionNumber: number;
    questionText: string;
    studentAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    points: number;
    maxPoints: number;
    timeTaken: number; // seconds
}

export interface StudentQuizDetailData {
    studentId: string | number;
    studentName: string;
    score: number;
    maxScore: number;
    quizTitle: string;
    quizSubject: string;
    quizDate: string;
    quizId?: number; // NEW: used to fetch real data
    submittedAt: string;
    questionResults: QuestionResult[];
    // Radar metrics (0-100)
    metrics: {
        precision: number;
        speed: number;
        consistency: number;
        participation: number;
        comprehension: number;
        effort: number;
    };
}

// ================================ MOCK QUESTIONS ================================

const buildMockQuestions = (score: number, max: number): QuestionResult[] => {
    const pct = score / max;
    const questions: QuestionResult[] = [
        {
            questionNumber: 1,
            questionText: '¿Cuál es la diferencia entre un ecosistema terrestre y acuático?',
            studentAnswer: 'El ecosistema terrestre se desarrolla en tierra y el acuático en el agua',
            correctAnswer: 'El ecosistema terrestre se desarrolla en tierra y el acuático en el agua',
            isCorrect: pct >= 0.5,
            points: pct >= 0.5 ? 20 : 0,
            maxPoints: 20,
            timeTaken: 45,
        },
        {
            questionNumber: 2,
            questionText: '¿Qué son los productores en una cadena alimenticia?',
            studentAnswer: 'Los herbívoros que solo comen plantas',
            correctAnswer: 'Los organismos autótrofos (plantas) que producen su propio alimento',
            isCorrect: pct >= 0.7,
            points: pct >= 0.7 ? 20 : 0,
            maxPoints: 20,
            timeTaken: 62,
        },
        {
            questionNumber: 3,
            questionText: '¿Qué es la fotosíntesis?',
            studentAnswer: 'El proceso por el que las plantas convierten luz solar en energía',
            correctAnswer: 'El proceso por el que las plantas convierten luz solar en energía',
            isCorrect: pct >= 0.3,
            points: pct >= 0.3 ? 20 : 0,
            maxPoints: 20,
            timeTaken: 30,
        },
        {
            questionNumber: 4,
            questionText: '¿Cuál es el papel de los descomponedores en el ecosistema?',
            studentAnswer: 'Reciclan materia orgánica muerta para que vuelva al suelo',
            correctAnswer: 'Reciclan materia orgánica muerta para que vuelva al suelo',
            isCorrect: score >= 60,
            points: score >= 60 ? 20 : 0,
            maxPoints: 20,
            timeTaken: 55,
        },
        {
            questionNumber: 5,
            questionText: '¿Qué factores abióticos afectan un ecosistema?',
            studentAnswer: 'Temperatura, lluvia y suelo',
            correctAnswer: 'Temperatura, agua, luz solar, suelo y aire',
            isCorrect: score >= 80,
            points: score >= 80 ? 20 : 0,
            maxPoints: 20,
            timeTaken: 80,
        },
    ];
    return questions;
};

const buildMetrics = (score: number, max: number, studentId: string): StudentQuizDetailData['metrics'] => {
    const pct = (score / max) * 100;
    const seed = studentId.charCodeAt(studentId.length - 1);
    return {
        precision: Math.min(100, Math.round(pct + (seed % 10) - 5)),
        speed: Math.min(100, Math.round(60 + (seed % 30))),
        consistency: Math.min(100, Math.round(pct - 5 + (seed % 15))),
        participation: Math.min(100, Math.round(70 + (seed % 25))),
        comprehension: Math.min(100, Math.round(pct + (seed % 20) - 10)),
        effort: Math.min(100, Math.round(55 + (seed % 40))),
    };
};

// ================================ HEXAGON RADAR CHART ================================

interface RadarAxis {
    label: string;
    value: number; // 0-100
    emoji?: string;
}

const HexagonRadar: React.FC<{ axes: RadarAxis[]; color: string }> = ({ axes, color }) => {
    const cx = 110;
    const cy = 110;
    const R = 80;
    const N = axes.length; // 6

    const point = (i: number, r: number) => {
        const angle = (2 * Math.PI * i) / N - Math.PI / 2;
        return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    };

    // Concentric rings as dotted lines
    const rings = [0.25, 0.5, 0.75, 1.0];
    const DOT_SPACING = 6; // approx pixels between dots on ring circumference

    // Generate dots along a regular polygon ring
    const ringDots = (scale: number) => {
        const dots: { x: number; y: number }[] = [];
        for (let i = 0; i < N; i++) {
            const p1 = point(i, R * scale);
            const p2 = point((i + 1) % N, R * scale);
            // Number of dots along this edge
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const steps = Math.max(2, Math.round(len / DOT_SPACING));
            for (let s = 0; s < steps; s++) {
                dots.push({
                    x: p1.x + (dx * s) / steps,
                    y: p1.y + (dy * s) / steps,
                });
            }
        }
        return dots;
    };

    // Data polygon as dots along its edges
    const dataPolygonDots = () => {
        const dots: { x: number; y: number }[] = [];
        for (let i = 0; i < N; i++) {
            const p1 = point(i, (R * axes[i].value) / 100);
            const p2 = point((i + 1) % N, (R * axes[(i + 1) % N].value) / 100);
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const steps = Math.max(2, Math.round(len / 5));
            for (let s = 0; s < steps; s++) {
                dots.push({
                    x: p1.x + (dx * s) / steps,
                    y: p1.y + (dy * s) / steps,
                });
            }
        }
        return dots;
    };

    // Filled data polygon path
    const dataPath = axes
        .map((axis, i) => {
            const p = point(i, (R * axis.value) / 100);
            return `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
        })
        .join(' ') + ' Z';

    const labelR = R + 22;

    return (
        <svg viewBox="0 0 220 220" className="psqd-radar-svg">
            {/* Background rings as dots */}
            {rings.map((scale, ri) =>
                ringDots(scale).map((d, di) => (
                    <circle
                        key={`ring-${ri}-${di}`}
                        cx={d.x} cy={d.y} r={scale === 1.0 ? 1.2 : 0.8}
                        fill={`rgba(255,255,255,${scale === 1.0 ? 0.25 : 0.12})`}
                    />
                ))
            )}

            {/* Spoke dots */}
            {Array.from({ length: N }, (_, i) => {
                const outer = point(i, R);
                const steps = 8;
                return Array.from({ length: steps }, (__, s) => {
                    const t = s / steps;
                    return (
                        <circle
                            key={`spoke-${i}-${s}`}
                            cx={cx + (outer.x - cx) * t}
                            cy={cy + (outer.y - cy) * t}
                            r={0.7}
                            fill="rgba(255,255,255,0.15)"
                        />
                    );
                });
            })}

            {/* Filled data area */}
            <path
                d={dataPath}
                fill={color}
                fillOpacity={0.2}
                stroke="none"
            />

            {/* Data polygon edge dots */}
            {dataPolygonDots().map((d, i) => (
                <circle
                    key={`dp-${i}`}
                    cx={d.x} cy={d.y}
                    r={1.5}
                    fill={color}
                    opacity={0.85}
                />
            ))}

            {/* Data vertex dots (larger) */}
            {axes.map((axis, i) => {
                const p = point(i, (R * axis.value) / 100);
                return (
                    <circle
                        key={`vertex-${i}`}
                        cx={p.x} cy={p.y}
                        r={5}
                        fill={color}
                        stroke="white"
                        strokeWidth={1.5}
                    />
                );
            })}

            {/* Axis labels with emoji + value */}
            {axes.map((axis, i) => {
                const p = point(i, labelR);
                return (
                    <g key={`label-${i}`}>
                        <text
                            x={p.x}
                            y={p.y - 5}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize={9}
                            fontWeight="700"
                            fill="var(--ion-text-color, #333)"
                            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                        >
                            {axis.emoji} {axis.label}
                        </text>
                        <text
                            x={p.x}
                            y={p.y + 8}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize={8}
                            fontWeight="900"
                            fill={color}
                            fontFamily="'SF Mono', 'Fira Code', monospace"
                        >
                            {axis.value}
                        </text>
                    </g>
                );
            })}

            {/* Center dot */}
            <circle cx={cx} cy={cy} r={3} fill={color} opacity={0.5} />
        </svg>
    );
};

// ================================ HELPERS ================================

const getScoreColor = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 80) return '#2ecc71';
    if (pct >= 60) return '#f39c12';
    return '#e74c3c';
};

const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    return parts.length >= 2
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : name.substring(0, 2).toUpperCase();
};

const formatTime = (secs: number) => `${secs}s`;

// ================================ MAIN COMPONENT ================================

const ProfessorStudentQuizDetail: React.FC = () => {
    const location = useLocation<StudentQuizDetailData | undefined>();
    const history = useHistory();

    // Build data from location state (or use defaults for direct URL access)
    const state = location.state;
    const quizId = (state as any)?.quizId;
    const studentIdFromState = state?.studentId ?? 's1';
    const [studentName, setStudentName] = useState(state?.studentName ?? 'Estudiante');
    const [score, setScore] = useState(state?.score ?? 75);
    const [maxScore, setMaxScore] = useState(state?.maxScore ?? 100);
    const [quizTitle, setQuizTitle] = useState(state?.quizTitle ?? 'Quiz');
    const [quizSubject, setQuizSubject] = useState(state?.quizSubject ?? 'Materia');
    const [quizDate, setQuizDate] = useState(state?.quizDate ?? '');
    const [questions, setQuestions] = useState<QuestionResult[]>(state?.questionResults ?? buildMockQuestions(score, maxScore));
    const [metrics, setMetrics] = useState(state?.metrics ?? buildMetrics(score, maxScore, String(studentIdFromState)));
    const [loadingDetail, setLoadingDetail] = useState(false);

    // Fetch real data from API if quizId is available
    useEffect(() => {
        if (!quizId || !studentIdFromState) return;

        const fetchDetail = async () => {
            setLoadingDetail(true);
            try {
                const response = await fetch(
                    getApiUrl(`/api/quizzes/${quizId}/student/${studentIdFromState}/detail`),
                    { headers: { 'Content-Type': 'application/json' } }
                );
                if (!response.ok) throw new Error('Not found');
                const data = await response.json();

                setStudentName(data.studentName);
                setScore(data.score);
                setMaxScore(data.maxScore);
                setQuizTitle(data.quizTitle);
                setQuizSubject(data.quizSubject);
                setQuizDate(data.quizDate ? new Date(data.quizDate).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '');
                setQuestions(data.questionResults || []);
                setMetrics(data.metrics || buildMetrics(data.score, data.maxScore, String(studentIdFromState)));

                // Initialize edited points with real data
                const pts: Record<number, number> = {};
                (data.questionResults || []).forEach((q: QuestionResult) => { pts[q.questionNumber] = q.points; });
                setEditedPoints(pts);
            } catch (err) {
                console.error('Error fetching student quiz detail:', err);
                // Keep mock/state data as fallback
            } finally {
                setLoadingDetail(false);
            }
        };
        fetchDetail();
    }, [quizId, studentIdFromState]);

    // Editable points: track per-question overrides
    const [editedPoints, setEditedPoints] = useState<Record<number, number>>(() => {
        const initial: Record<number, number> = {};
        questions.forEach(q => { initial[q.questionNumber] = q.points; });
        return initial;
    });
    const [savedScore, setSavedScore] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);

    // Compute total from edited points
    const totalGrade = Object.values(editedPoints).reduce((sum, p) => sum + p, 0);

    const color = getScoreColor(totalGrade, maxScore);
    const pct = Math.round((totalGrade / maxScore) * 100);

    const radarAxes: RadarAxis[] = [
        { label: 'Precisión', value: metrics.precision },
        { label: 'Velocidad', value: metrics.speed },
        { label: 'Consistencia', value: metrics.consistency },
        { label: 'Participación', value: metrics.participation },
        { label: 'Comprensión', value: metrics.comprehension },
        { label: 'Esfuerzo', value: metrics.effort ?? Math.min(100, Math.round(pct + 5)) },
    ];

    const handleEditPoints = (questionNumber: number, value: number, maxPts: number) => {
        const clamped = Math.max(0, Math.min(maxPts, value));
        setEditedPoints(prev => ({ ...prev, [questionNumber]: clamped }));
        // Reset saved state so the professor can save again
        if (savedScore !== null) setSavedScore(null);
    };

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => {
            setSavedScore(totalGrade);
            setSaving(false);
        }, 800);
    };

    const correctCount = questions.filter(q => editedPoints[q.questionNumber] > 0).length;

    return (
        <IonPage className="psqd-page global-background-pattern">
            <IonHeader className="psqd-header">
                <IonToolbar className="psqd-toolbar">
                    <IonButtons slot="start">
                        <IonBackButton
                            defaultHref="/prof-quiz-results"
                            icon={arrowBackOutline}
                            className="psqd-back-btn"
                            text=""
                        />
                    </IonButtons>
                    <div className="psqd-toolbar-title">
                        <span className="psqd-title-text">Detalle del Alumno</span>
                        <span className="psqd-title-sub">{quizTitle}</span>
                    </div>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen className="psqd-content">
                <PageTransition variant="fade">

                    {/* ── Profile card ── */}
                    <div className="psqd-section">
                        <div className="psqd-profile-card">
                            {/* Left: avatar + name */}
                            <div className="psqd-profile-left">
                                <div className="psqd-avatar-wrap">
                                    <div className="psqd-avatar" style={{ borderColor: color }}>
                                        {getInitials(studentName)}
                                    </div>
                                    <div className="psqd-avatar-label">Foto de perfil</div>
                                </div>
                                <div className="psqd-profile-info">
                                    <span className="psqd-student-name">{studentName}</span>
                                    <span className="psqd-quiz-meta">{quizSubject}</span>
                                    <span className="psqd-quiz-meta">{quizDate}</span>
                                    <div className="psqd-score-pill" style={{ background: color }}>
                                        {score}/{maxScore}
                                    </div>
                                </div>
                            </div>

                            {/* Right: hexagon radar chart (no legend bars) */}
                            <div className="psqd-radar-wrap">
                                <HexagonRadar axes={radarAxes} color={color} />
                            </div>
                        </div>
                    </div>

                    {/* ── Summary chips ── */}
                    <div className="psqd-section psqd-summary-chips">
                        <div className="psqd-chip">
                            <IonIcon icon={checkmarkCircleOutline} style={{ color: 'var(--ion-color-success)' }} />
                            <span>{correctCount} Correctas</span>
                        </div>
                        <div className="psqd-chip">
                            <IonIcon icon={closeCircleOutline} style={{ color: 'var(--ion-color-danger)' }} />
                            <span>{questions.length - correctCount} Incorrectas</span>
                        </div>
                        <div className="psqd-chip">
                            <IonIcon icon={trophyOutline} style={{ color: color }} />
                            <span>{pct}%</span>
                        </div>
                    </div>

                    {/* ── Quiz Result / Questions ── */}
                    <div className="psqd-section">
                        <div className="psqd-questions-card">
                            <div className="psqd-questions-header">
                                <IonIcon icon={statsChartOutline} className="psqd-questions-icon" />
                                <span>Resultado del Quiz</span>
                            </div>

                            <div className="psqd-questions-separator" />

                            <div className="psqd-questions-list">
                                {questions.map((q) => (
                                    <div key={q.questionNumber} className={`psqd-question-row ${editedPoints[q.questionNumber] > 0 ? 'correct' : 'wrong'}`}>
                                        <div className="psqd-question-top">
                                            <span className="psqd-q-number">Pregunta {q.questionNumber}</span>
                                            <div className="psqd-q-right">
                                                <IonIcon
                                                    icon={editedPoints[q.questionNumber] > 0 ? checkmarkCircleOutline : closeCircleOutline}
                                                    className={`psqd-q-result-icon ${editedPoints[q.questionNumber] > 0 ? 'correct' : 'wrong'}`}
                                                />
                                                <div className="psqd-q-points-edit">
                                                    <IonIcon icon={createOutline} className="psqd-edit-icon" />
                                                    <input
                                                        type="number"
                                                        className="psqd-grade-input"
                                                        value={editedPoints[q.questionNumber]}
                                                        min={0}
                                                        max={q.maxPoints}
                                                        onChange={(e) => handleEditPoints(q.questionNumber, parseInt(e.target.value) || 0, q.maxPoints)}
                                                    />
                                                    <span className="psqd-grade-max">/{q.maxPoints} pts</span>
                                                </div>
                                                <span className="psqd-q-time">
                                                    <IonIcon icon={timeOutline} /> {formatTime(q.timeTaken)}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="psqd-q-text">— {q.questionText}</p>
                                        <div className="psqd-q-answers">
                                            <div className="psqd-q-answer student">
                                                <span className="psqd-answer-label">Respuesta</span>
                                                <span>{q.studentAnswer}</span>
                                            </div>
                                            {!q.isCorrect && (
                                                <div className="psqd-q-answer correct">
                                                    <span className="psqd-answer-label">Correcta</span>
                                                    <span>{q.correctAnswer}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="psqd-footer-spacer" />
                </PageTransition>
            </IonContent>

            {/* ── Footer: Total Grade + Save ── */}
            <div className="psqd-footer">
                <div className="psqd-footer-grade">
                    <IonIcon icon={ribbonOutline} className="psqd-footer-icon" />
                    <span className="psqd-footer-label">Total Grade</span>
                    <span className="psqd-footer-score" style={{ color }}>
                        {savedScore !== null ? savedScore : totalGrade}/{maxScore}
                    </span>
                </div>
                <button
                    className={`psqd-save-btn ${saving ? 'saving' : ''} ${savedScore !== null ? 'saved' : ''}`}
                    onClick={handleSave}
                    disabled={saving || savedScore !== null}
                >
                    <IonIcon icon={saveOutline} />
                    {saving ? 'Guardando…' : savedScore !== null ? 'Guardado ✓' : 'Guardar'}
                </button>
            </div>
        </IonPage>
    );
};

export default ProfessorStudentQuizDetail;
