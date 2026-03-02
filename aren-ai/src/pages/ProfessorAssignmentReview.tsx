import React, { useState, useEffect } from "react";
import {
    IonPage,
    IonContent,
    IonIcon,
    IonHeader,
    IonToolbar,
    IonMenuButton,
    useIonToast,
} from "@ionic/react";
import {
    menu,
    arrowBackOutline,
    statsChartOutline,
    peopleOutline,
    calendarOutline,
    ribbonOutline,
    checkmarkCircleOutline,
    closeCircleOutline,
    schoolOutline,
    documentTextOutline,
} from "ionicons/icons";
import { useHistory, useParams } from "react-router-dom";
import { getApiUrl } from "../config/api";
import "../components/ProfessorHeader.css";
import "./ProfessorAssignmentReview.css";

// ═══════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════
interface AssignmentInfo {
    id: number;
    title: string;
    description: string;
    dueTime: string;
    quizName: string | null;
    subjectName: string | null;
    winBattleRequirement: number | null;
    minBattleWins: number | null;
}

interface StudentSubmission {
    studentId: number;
    studentName: string;
    status: string;
    grade: number | null;
    textResponse: string | null;
    feedback: string | null;
    submittedAt: string | null;
    gradedAt: string | null;
    winStreakAchieved: number;
    submissionId: number | null;
}

interface TopicStat {
    topicName: string;
    questionCount: number;
    totalPoints: number;
}

interface QuizQuestion {
    id: number;
    text: string;
    topicName: string;
    points: number;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════
const ProfessorAssignmentReview: React.FC = () => {
    const history = useHistory();
    const { id } = useParams<{ id: string }>();
    const [present] = useIonToast();

    const [assignment, setAssignment] = useState<AssignmentInfo | null>(null);
    const [students, setStudents] = useState<StudentSubmission[]>([]);
    const [topicStats, setTopicStats] = useState<TopicStat[]>([]);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState<"overview" | "students">("overview");
    const [selectedStudent, setSelectedStudent] = useState<StudentSubmission | null>(null);
    const [editedGrade, setEditedGrade] = useState<string>("");

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("authToken") || localStorage.getItem("token");
                if (!token || !id) return;

                const response = await fetch(getApiUrl(`/api/assignments/${id}/submissions`), {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.ok) {
                    const data = await response.json();
                    setAssignment(data.assignment);
                    const sorted = [...(data.students || [])].sort((a: StudentSubmission, b: StudentSubmission) => {
                        const aSubmitted = a.status === "SUBMITTED" || a.status === "GRADED";
                        const bSubmitted = b.status === "SUBMITTED" || b.status === "GRADED";
                        if (aSubmitted && !bSubmitted) return -1;
                        if (!aSubmitted && bSubmitted) return 1;
                        return 0;
                    });
                    setStudents(sorted);
                    setTopicStats(data.topicStats || []);
                    setQuestions(data.questions || []);
                }
            } catch (error) {
                console.error("Error fetching assignment submissions:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // Helpers
    const getScoreClass = (grade: number | null): string => {
        if (grade === null) return "score-none";
        if (grade >= 80) return "score-excellent";
        if (grade >= 60) return "score-good";
        if (grade >= 40) return "score-fair";
        return "score-poor";
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case "SUBMITTED": return { text: "Submitted", cls: "submitted", emoji: "📬" };
            case "GRADED": return { text: "Graded", cls: "graded", emoji: "✅" };
            case "IN_PROGRESS": return { text: "In Progress", cls: "in-progress", emoji: "⏳" };
            case "NOT_STARTED": return { text: "Not Started", cls: "not-started", emoji: "⭕" };
            default: return { text: "Not Assigned", cls: "not-assigned", emoji: "❌" };
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
        });
    };

    const saveGrade = async (student: StudentSubmission) => {
        const newGrade = parseFloat(editedGrade);
        if (isNaN(newGrade) || newGrade < 0 || newGrade > 100) {
            present({ message: "Enter valid grade (0-100)", duration: 2000, color: "warning" });
            return;
        }
        setStudents((prev) =>
            prev.map((s) =>
                s.studentId === student.studentId ? { ...s, grade: newGrade } : s
            )
        );
        setSelectedStudent((prev) => prev ? { ...prev, grade: newGrade } : null);
        present({ message: `Grade saved: ${newGrade}/100`, duration: 1500, color: "success" });
    };

    // Computed stats
    const totalStudents = students.length;
    const submittedStudents = students.filter(
        (s) => s.status === "SUBMITTED" || s.status === "GRADED"
    ).length;
    const gradedStudents = students.filter((s) => s.grade !== null).length;
    const avgGrade = (() => {
        const withGrades = students.filter((s) => s.grade !== null);
        if (withGrades.length === 0) return 0;
        return Math.round(withGrades.reduce((sum, s) => sum + (s.grade || 0), 0) / withGrades.length);
    })();
    const completionPct = totalStudents > 0 ? Math.round((submittedStudents / totalStudents) * 100) : 0;

    // ═══════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════
    return (
        <IonPage className="par-page">
            <IonHeader className="professor-header-container">
                <IonToolbar color="primary" className="professor-toolbar">
                    <div className="ph-content">
                        <button className="par-back-btn" onClick={() => history.goBack()}>
                            <IonIcon icon={arrowBackOutline} />
                        </button>
                    </div>
                </IonToolbar>
                <div className="ph-brand-container-absolute">
                    <div className="ph-brand-name">ArenAI</div>
                    <div className="ph-brand-sub">Review</div>
                </div>
            </IonHeader>

            <IonContent className="par-content">
                {loading ? (
                    <div className="par-loading">
                        <div className="par-loading-spinner" />
                        <span>Loading assignment data...</span>
                    </div>
                ) : (
                    <div className="par-container">
                        {/* ═══ ASSIGNMENT HEADER ═══ */}
                        <div className="par-header">
                            <h1 className="par-title">{assignment?.title || "Assignment"}</h1>
                            <div className="par-meta">
                                {assignment?.subjectName && (
                                    <span className="par-meta-tag subject">
                                        <IonIcon icon={ribbonOutline} /> {assignment.subjectName}
                                    </span>
                                )}
                                {assignment?.quizName && (
                                    <span className="par-meta-tag quiz">
                                        <IonIcon icon={checkmarkCircleOutline} /> {assignment.quizName}
                                    </span>
                                )}
                                {assignment?.dueTime && (
                                    <span className="par-meta-tag date">
                                        <IonIcon icon={calendarOutline} /> {formatDate(assignment.dueTime)}
                                    </span>
                                )}
                            </div>
                            {assignment?.description && (
                                <p className="par-desc">{assignment.description}</p>
                            )}
                        </div>

                        {/* ═══ TAB SWITCHER ═══ */}
                        <div className="par-tabs">
                            <button
                                className={`par-tab ${activeTab === "overview" ? "active" : ""}`}
                                onClick={() => { setActiveTab("overview"); setSelectedStudent(null); }}
                            >
                                <IonIcon icon={statsChartOutline} />
                                Overview
                            </button>
                            <button
                                className={`par-tab ${activeTab === "students" ? "active" : ""}`}
                                onClick={() => setActiveTab("students")}
                            >
                                <IonIcon icon={peopleOutline} />
                                Students
                            </button>
                        </div>

                        {/* ═══════════════════════════════════════════
                OVERVIEW TAB
            ═══════════════════════════════════════════ */}
                        {activeTab === "overview" && (
                            <div className="par-overview">
                                {/* Stats Cards */}
                                <div className="par-stats-grid">
                                    <div className="par-stat-card" style={{ animationDelay: "0s" }}>
                                        <span className="par-stat-number">{totalStudents}</span>
                                        <span className="par-stat-label">Students</span>
                                    </div>
                                    <div className="par-stat-card" style={{ animationDelay: "0.05s" }}>
                                        <span className="par-stat-number par-stat-submitted">{submittedStudents}</span>
                                        <span className="par-stat-label">Submitted</span>
                                    </div>
                                    <div className="par-stat-card" style={{ animationDelay: "0.1s" }}>
                                        <span className="par-stat-number par-stat-graded">{gradedStudents}</span>
                                        <span className="par-stat-label">Graded</span>
                                    </div>
                                    <div className="par-stat-card" style={{ animationDelay: "0.15s" }}>
                                        <span className="par-stat-number par-stat-avg">{avgGrade}%</span>
                                        <span className="par-stat-label">Avg Grade</span>
                                    </div>
                                </div>

                                {/* Completion Bar */}
                                <div className="par-completion">
                                    <div className="par-completion-header">
                                        <span className="par-completion-title">Completion Rate</span>
                                        <span className="par-completion-pct">{completionPct}%</span>
                                    </div>
                                    <div className="par-completion-bar">
                                        <div className="par-completion-fill" style={{ width: `${completionPct}%` }} />
                                    </div>
                                    <span className="par-completion-sub">
                                        {submittedStudents} of {totalStudents} students submitted
                                    </span>
                                </div>

                                {/* Topic Stats */}
                                {topicStats.length > 0 && (
                                    <div className="par-topics">
                                        <h3 className="par-section-title">
                                            <IonIcon icon={schoolOutline} /> Topic Breakdown
                                        </h3>
                                        <div className="par-topics-list">
                                            {topicStats.map((topic, i) => {
                                                const maxPts = topicStats.reduce((s, t) => s + t.totalPoints, 0);
                                                const pct = maxPts > 0 ? (topic.totalPoints / maxPts) * 100 : 0;
                                                return (
                                                    <div key={i} className="par-topic-card" style={{ animationDelay: `${i * 0.08}s` }}>
                                                        <div className="par-topic-header">
                                                            <span className="par-topic-name">{topic.topicName}</span>
                                                            <span className="par-topic-badge">
                                                                {topic.questionCount} Q · {topic.totalPoints} pts
                                                            </span>
                                                        </div>
                                                        <div className="par-topic-bar">
                                                            <div className="par-topic-fill" style={{ width: `${pct}%` }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Student Performance List */}
                                <div className="par-perf-section">
                                    <h3 className="par-section-title">
                                        <IonIcon icon={peopleOutline} /> Student Performance
                                    </h3>
                                    <div className="par-perf-list">
                                        {students.map((student, i) => {
                                            const statusInfo = getStatusInfo(student.status);
                                            return (
                                                <div
                                                    key={student.studentId}
                                                    className="par-perf-row"
                                                    style={{ animationDelay: `${i * 0.04}s` }}
                                                    onClick={() => {
                                                        setActiveTab("students");
                                                        setSelectedStudent(student);
                                                        setEditedGrade(student.grade !== null ? String(student.grade) : "0");
                                                    }}
                                                >
                                                    <div className="par-perf-avatar">
                                                        {student.studentName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="par-perf-info">
                                                        <span className="par-perf-name">{student.studentName}</span>
                                                        <span className={`par-perf-status ${statusInfo.cls}`}>
                                                            {statusInfo.emoji} {statusInfo.text}
                                                        </span>
                                                    </div>
                                                    <div className="par-perf-grade">
                                                        {student.grade !== null ? (
                                                            <span className={`par-perf-score ${getScoreClass(student.grade)}`}>
                                                                {student.grade}
                                                            </span>
                                                        ) : (
                                                            <span className="par-perf-score score-none">—</span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ═══════════════════════════════════════════
                STUDENTS TAB
            ═══════════════════════════════════════════ */}
                        {activeTab === "students" && (
                            <div className="par-students-tab">
                                {!selectedStudent ? (
                                    /* Student Select List */
                                    <div className="par-student-select">
                                        <p className="par-select-hint">Select a student to review:</p>
                                        <div className="par-student-grid">
                                            {students.map((student, i) => {
                                                const statusInfo = getStatusInfo(student.status);
                                                return (
                                                    <div
                                                        key={student.studentId}
                                                        className={`par-student-card ${getScoreClass(student.grade)}`}
                                                        style={{ animationDelay: `${i * 0.05}s` }}
                                                        onClick={() => {
                                                            setSelectedStudent(student);
                                                            setEditedGrade(student.grade !== null ? String(student.grade) : "0");
                                                        }}
                                                    >
                                                        <div className="par-sc-avatar">
                                                            {student.studentName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <span className="par-sc-name">{student.studentName}</span>
                                                        <span className={`par-sc-status ${statusInfo.cls}`}>{statusInfo.emoji}</span>
                                                        <span className="par-sc-grade">
                                                            {student.grade !== null ? student.grade : "—"}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    /* Student Detail View */
                                    <div className="par-student-detail">
                                        <button className="par-detail-back" onClick={() => setSelectedStudent(null)}>
                                            <IonIcon icon={arrowBackOutline} /> Back to list
                                        </button>

                                        {/* Student Header */}
                                        <div className={`par-detail-island ${getScoreClass(selectedStudent.grade)}`}>
                                            <div className="par-island-deco d1" />
                                            <div className="par-island-deco d2" />
                                            <div className="par-detail-top">
                                                <div className="par-detail-avatar">
                                                    {selectedStudent.studentName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                                                </div>
                                                <div className="par-detail-name-col">
                                                    <span className="par-detail-name">{selectedStudent.studentName}</span>
                                                    <span className={`par-detail-status ${getStatusInfo(selectedStudent.status).cls}`}>
                                                        {getStatusInfo(selectedStudent.status).emoji} {getStatusInfo(selectedStudent.status).text}
                                                    </span>
                                                </div>
                                                <div className="par-detail-score">
                                                    <span className="par-detail-score-val">{selectedStudent.grade ?? "—"}</span>
                                                    <span className="par-detail-score-max">/100</span>
                                                </div>
                                            </div>
                                            {selectedStudent.submittedAt && (
                                                <div className="par-detail-submitted">
                                                    Submitted: {formatDate(selectedStudent.submittedAt)}
                                                </div>
                                            )}
                                        </div>

                                        {/* Content sections */}
                                        {selectedStudent.status === "NOT_STARTED" || selectedStudent.status === "NOT_ASSIGNED" ? (
                                            <div className="par-not-submitted">
                                                <IonIcon icon={closeCircleOutline} className="par-ns-icon" />
                                                <p className="par-ns-text">{selectedStudent.studentName} has not submitted yet.</p>
                                                <p className="par-ns-hint">Check back later</p>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Text Response */}
                                                {selectedStudent.textResponse && (
                                                    <div className="par-section-card">
                                                        <div className="par-section-head">
                                                            <IonIcon icon={documentTextOutline} />
                                                            <span>Text Response</span>
                                                        </div>
                                                        <div className="par-text-response">{selectedStudent.textResponse}</div>
                                                    </div>
                                                )}

                                                {/* Battle Progress */}
                                                {assignment?.winBattleRequirement && (
                                                    <div className="par-section-card">
                                                        <div className="par-section-head">
                                                            <IonIcon icon={ribbonOutline} />
                                                            <span>Battle Progress</span>
                                                            <span className={`par-section-badge ${selectedStudent.winStreakAchieved >= (assignment.minBattleWins || 0) ? "complete" : "pending"
                                                                }`}>
                                                                {selectedStudent.winStreakAchieved}/{assignment.minBattleWins || 0} wins
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Feedback */}
                                                {selectedStudent.feedback && (
                                                    <div className="par-section-card">
                                                        <div className="par-section-head">
                                                            <IonIcon icon={schoolOutline} />
                                                            <span>Feedback</span>
                                                        </div>
                                                        <div className="par-text-response">{selectedStudent.feedback}</div>
                                                    </div>
                                                )}

                                                {/* Grade Editor */}
                                                <div className="par-grade-editor">
                                                    <span className="par-grade-label">Grade</span>
                                                    <div className="par-grade-input-row">
                                                        <input
                                                            type="number"
                                                            className="par-grade-input"
                                                            value={editedGrade}
                                                            onChange={(e) => setEditedGrade(e.target.value)}
                                                            min={0}
                                                            max={100}
                                                        />
                                                        <span className="par-grade-max">/ 100</span>
                                                        <button className="par-grade-save" onClick={() => saveGrade(selectedStudent)}>
                                                            Save
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default ProfessorAssignmentReview;
