import React, { useState, useEffect, useRef } from "react";
import {
  IonPage,
  IonContent,
  IonIcon,
  IonHeader,
  IonToolbar,
  useIonToast,
} from "@ionic/react";
import {
  arrowBackOutline,
  documentTextOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  schoolOutline,
  checkmarkOutline,
  closeOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import "../components/StudentHeader.css";
import "./AssignmentDetail.css";

// Interfaces
interface Assignment {
  id: string;
  name: string;
  instructions: string;
  dueDate: string;
  totalPoints: number;
}

interface Answer {
  questionId: string;
  questionText: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  points: number;
  maxPoints: number;
}

interface StudentSubmission {
  studentId: string;
  studentName: string;
  totalScore: number | null;
  maxScore: number;
  textScore: number | null;
  textMaxScore: number;
  quizScore: number;
  quizMaxScore: number;
  aiStudyProgress: number;
  aiStudyRequired: boolean;
  answers: Answer[];
  textSubmission?: string;
  submittedAt?: string;
  needsReview: boolean;
}

// Mock student submissions
const MOCK_SUBMISSIONS: StudentSubmission[] = [
  {
    studentId: "s1",
    studentName: "Maria Garcia",
    totalScore: 95,
    maxScore: 100,
    textScore: 25,
    textMaxScore: 30,
    quizScore: 50,
    quizMaxScore: 50,
    aiStudyProgress: 100,
    aiStudyRequired: true,
    submittedAt: "2026-01-18T14:30:00",
    needsReview: false,
    textSubmission:
      "For this problem, I first identified the variables and analyzed the psychological theories presented.",
    answers: [
      {
        questionId: "q1",
        questionText: "Who is considered the father of psychology?",
        selectedAnswer: "Wilhelm Wundt",
        correctAnswer: "Wilhelm Wundt",
        isCorrect: true,
        points: 10,
        maxPoints: 10,
      },
      {
        questionId: "q2",
        questionText: "What is cognitive dissonance?",
        selectedAnswer: "Mental discomfort from conflicting beliefs",
        correctAnswer: "Mental discomfort from conflicting beliefs",
        isCorrect: true,
        points: 10,
        maxPoints: 10,
      },
      {
        questionId: "q3",
        questionText: "Who developed the hierarchy of needs?",
        selectedAnswer: "Abraham Maslow",
        correctAnswer: "Abraham Maslow",
        isCorrect: true,
        points: 10,
        maxPoints: 10,
      },
    ],
  },
  {
    studentId: "s2",
    studentName: "Carlos Rodriguez",
    totalScore: null,
    maxScore: 100,
    textScore: null,
    textMaxScore: 30,
    quizScore: 40,
    quizMaxScore: 50,
    aiStudyProgress: 75,
    aiStudyRequired: true,
    submittedAt: "2026-01-18T15:45:00",
    needsReview: true,
    textSubmission:
      "My analysis of behavioral psychology focused on Skinner's operant conditioning experiments.",
    answers: [
      {
        questionId: "q1",
        questionText: "Who is considered the father of psychology?",
        selectedAnswer: "Wilhelm Wundt",
        correctAnswer: "Wilhelm Wundt",
        isCorrect: true,
        points: 10,
        maxPoints: 10,
      },
      {
        questionId: "q2",
        questionText: "What is cognitive dissonance?",
        selectedAnswer: "A type of therapy",
        correctAnswer: "Mental discomfort from conflicting beliefs",
        isCorrect: false,
        points: 0,
        maxPoints: 10,
      },
    ],
  },
  {
    studentId: "s3",
    studentName: "Ana Martinez",
    totalScore: 88,
    maxScore: 100,
    textScore: 28,
    textMaxScore: 30,
    quizScore: 40,
    quizMaxScore: 50,
    aiStudyProgress: 100,
    aiStudyRequired: true,
    submittedAt: "2026-01-18T10:20:00",
    needsReview: false,
    textSubmission: "I explored the development of humanistic psychology.",
    answers: [
      {
        questionId: "q1",
        questionText: "Who is considered the father of psychology?",
        selectedAnswer: "Wilhelm Wundt",
        correctAnswer: "Wilhelm Wundt",
        isCorrect: true,
        points: 10,
        maxPoints: 10,
      },
    ],
  },
  {
    studentId: "s4",
    studentName: "Luis Hernandez",
    totalScore: 45,
    maxScore: 100,
    textScore: 15,
    textMaxScore: 30,
    quizScore: 20,
    quizMaxScore: 50,
    aiStudyProgress: 50,
    aiStudyRequired: true,
    submittedAt: "2026-01-17T16:00:00",
    needsReview: false,
    answers: [
      {
        questionId: "q1",
        questionText: "Who is considered the father of psychology?",
        selectedAnswer: "Sigmund Freud",
        correctAnswer: "Wilhelm Wundt",
        isCorrect: false,
        points: 0,
        maxPoints: 10,
      },
    ],
  },
  {
    studentId: "s5",
    studentName: "Sofia Lopez",
    totalScore: null,
    maxScore: 100,
    textScore: null,
    textMaxScore: 30,
    quizScore: 0,
    quizMaxScore: 50,
    aiStudyProgress: 0,
    aiStudyRequired: true,
    needsReview: false,
    answers: [],
  },
  {
    studentId: "s6",
    studentName: "Diego Sanchez",
    totalScore: 100,
    maxScore: 100,
    textScore: 30,
    textMaxScore: 30,
    quizScore: 50,
    quizMaxScore: 50,
    aiStudyProgress: 100,
    aiStudyRequired: true,
    submittedAt: "2026-01-17T09:15:00",
    needsReview: false,
    textSubmission: "A comprehensive analysis of psychology history.",
    answers: [
      {
        questionId: "q1",
        questionText: "Who is considered the father of psychology?",
        selectedAnswer: "Wilhelm Wundt",
        correctAnswer: "Wilhelm Wundt",
        isCorrect: true,
        points: 10,
        maxPoints: 10,
      },
    ],
  },
  {
    studentId: "s7",
    studentName: "Elena Torres",
    totalScore: null,
    maxScore: 100,
    textScore: null,
    textMaxScore: 30,
    quizScore: 30,
    quizMaxScore: 50,
    aiStudyProgress: 80,
    aiStudyRequired: true,
    submittedAt: "2026-01-18T11:00:00",
    needsReview: true,
    textSubmission: "I examined nature versus nurture.",
    answers: [],
  },
  {
    studentId: "s8",
    studentName: "Pedro Gutierrez",
    totalScore: null,
    maxScore: 100,
    textScore: null,
    textMaxScore: 30,
    quizScore: 0,
    quizMaxScore: 50,
    aiStudyProgress: 0,
    aiStudyRequired: true,
    needsReview: false,
    answers: [],
  },
];

const AssignmentDetail: React.FC = () => {
  const history = useHistory();
  const [present] = useIonToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const studentBarRef = useRef<HTMLDivElement>(null);

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editedTextScore, setEditedTextScore] = useState<string>("");
  const [editedTotalScore, setEditedTotalScore] = useState<string>("");

  useEffect(() => {
    const stored = sessionStorage.getItem("selectedAssignment");
    if (stored) setAssignment(JSON.parse(stored));

    // Sort: submitted first, not submitted to back
    const sorted = [...MOCK_SUBMISSIONS].sort((a, b) => {
      const aSubmitted =
        a.totalScore !== null || a.textSubmission || a.answers.length > 0;
      const bSubmitted =
        b.totalScore !== null || b.textSubmission || b.answers.length > 0;
      if (aSubmitted && !bSubmitted) return -1;
      if (!aSubmitted && bSubmitted) return 1;
      return 0;
    });
    setSubmissions(sorted);
  }, []);

  useEffect(() => {
    const current = submissions[currentIndex];
    if (current) {
      setEditedTextScore(
        current.textScore !== null ? String(current.textScore) : "0"
      );
      setEditedTotalScore(
        current.totalScore !== null ? String(current.totalScore) : "0"
      );
    }
  }, [currentIndex, submissions]);

  useEffect(() => {
    if (!studentBarRef.current) return;
    const container = studentBarRef.current;
    const chips = container.querySelectorAll(".student-chip");
    if (chips[currentIndex]) {
      const chip = chips[currentIndex] as HTMLElement;
      const scrollLeft =
        chip.offsetLeft - container.clientWidth / 2 + chip.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, [currentIndex]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const newIndex = Math.round(
      scrollRef.current.scrollLeft / scrollRef.current.clientWidth
    );
    if (
      newIndex !== currentIndex &&
      newIndex >= 0 &&
      newIndex < submissions.length
    ) {
      setCurrentIndex(newIndex);
    }
  };

  const scrollToStudent = (index: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      left: index * scrollRef.current.clientWidth,
      behavior: "smooth",
    });
    setCurrentIndex(index);
  };

  const getScoreClass = (score: number | null, maxScore: number): string => {
    if (score === null) return "score-none";
    const percent = (score / maxScore) * 100;
    if (percent >= 80) return "score-excellent";
    if (percent >= 60) return "score-good";
    if (percent >= 40) return "score-fair";
    return "score-poor";
  };

  const saveTextScore = (studentId: string) => {
    const newScore = parseFloat(editedTextScore);
    const student = submissions.find((s) => s.studentId === studentId);
    if (
      !student ||
      isNaN(newScore) ||
      newScore < 0 ||
      newScore > student.textMaxScore
    ) {
      present({
        message: `Enter valid score`,
        duration: 2000,
        color: "warning",
      });
      return;
    }
    setSubmissions((prev) =>
      prev.map((s) =>
        s.studentId === studentId
          ? {
              ...s,
              textScore: newScore,
              needsReview: false,
              totalScore:
                newScore + s.quizScore + (s.aiStudyProgress === 100 ? 20 : 0),
            }
          : s
      )
    );
    present({
      message: `Saved: ${newScore}/${student.textMaxScore}`,
      duration: 1500,
      color: "success",
    });
  };

  const saveTotalGrade = () => {
    const current = submissions[currentIndex];
    if (!current) return;
    const newScore = parseFloat(editedTotalScore);
    if (isNaN(newScore) || newScore < 0 || newScore > current.maxScore) {
      present({
        message: `Enter valid grade`,
        duration: 2000,
        color: "warning",
      });
      return;
    }
    setSubmissions((prev) =>
      prev.map((s) =>
        s.studentId === current.studentId ? { ...s, totalScore: newScore } : s
      )
    );
    present({
      message: `Total: ${newScore}/${current.maxScore}`,
      duration: 1500,
      color: "success",
    });
  };

  const current = submissions[currentIndex];
  const hasSubmitted =
    current &&
    (current.totalScore !== null ||
      current.textSubmission ||
      current.answers.length > 0);

  return (
    <IonPage className="assignment-detail-page">
      <IonHeader className="student-header-container">
        <IonToolbar className="student-toolbar">
          <div className="sh-content">
            <div className="sh-menu-btn-container">
              <button
                className="detail-back-btn"
                onClick={() => history.goBack()}
              >
                <IonIcon icon={arrowBackOutline} />
              </button>
            </div>
          </div>
          <div className="sh-brand-container-absolute">
            <span className="sh-brand-name">ArenAI</span>
            <span className="sh-brand-sub">Assignment</span>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="assignment-detail-content" scrollY={false}>
        <div className="detail-main-container">
          {/* Horizontal Snap Scroll */}
          <div
            ref={scrollRef}
            className="submissions-scroll-container"
            onScroll={handleScroll}
          >
            {submissions.map((submission, idx) => (
              <div key={submission.studentId} className="submission-snap-card">
                {/* Island inside scroll */}
                <div
                  className={`student-header-island ${getScoreClass(
                    submission.totalScore,
                    submission.maxScore
                  )}`}
                >
                  <div className="island-decoration d1"></div>
                  <div className="island-decoration d2"></div>
                  <div className="island-name-row">
                    <span className="island-student-name">
                      {submission.studentName}
                    </span>
                    <div className="island-total-score">
                      <span className="island-score-value">
                        {submission.totalScore ?? "—"}
                      </span>
                      <span className="island-score-max">
                        /{submission.maxScore}
                      </span>
                    </div>
                  </div>
                  <div className="island-progress-bars">
                    <div className="island-progress-row">
                      <span className="island-progress-label">Text</span>
                      <div className="island-progress-bar">
                        <div
                          className="island-progress-fill"
                          style={{
                            width: `${
                              submission.textMaxScore > 0
                                ? ((submission.textScore ?? 0) /
                                    submission.textMaxScore) *
                                  100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="island-progress-value">
                        {submission.textScore ?? 0}/{submission.textMaxScore}
                      </span>
                    </div>
                    <div className="island-progress-row">
                      <span className="island-progress-label">Quiz</span>
                      <div className="island-progress-bar">
                        <div
                          className="island-progress-fill"
                          style={{
                            width: `${
                              submission.quizMaxScore > 0
                                ? (submission.quizScore /
                                    submission.quizMaxScore) *
                                  100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="island-progress-value">
                        {submission.quizScore}/{submission.quizMaxScore}
                      </span>
                    </div>
                    {submission.aiStudyRequired && (
                      <div className="island-progress-row">
                        <span className="island-progress-label">AI Study</span>
                        <div className="island-progress-bar">
                          <div
                            className="island-progress-fill"
                            style={{ width: `${submission.aiStudyProgress}%` }}
                          ></div>
                        </div>
                        <span className="island-progress-value">
                          {submission.aiStudyProgress}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="island-status">
                    {submission.needsReview ? (
                      <span className="island-status-badge needs-review">
                        Needs Review
                      </span>
                    ) : hasSubmitted ? (
                      <span className="island-status-badge submitted">
                        Submitted
                      </span>
                    ) : (
                      <span className="island-status-badge not-submitted">
                        Not Submitted
                      </span>
                    )}
                  </div>
                </div>

                {/* Submission Content */}
                {!submission.textSubmission &&
                submission.answers.length === 0 ? (
                  <div className="not-submitted-card">
                    <IonIcon
                      icon={closeCircleOutline}
                      className="not-submitted-icon"
                    />
                    <div className="not-submitted-text">
                      {submission.studentName} has not submitted
                    </div>
                    <div className="not-submitted-hint">Check back later</div>
                  </div>
                ) : (
                  <>
                    {(submission.textSubmission ||
                      submission.textMaxScore > 0) && (
                      <div className="submission-section">
                        <div className="section-header">
                          <div className="section-title">
                            <IonIcon icon={documentTextOutline} />
                            Text Submission
                          </div>
                          <span
                            className={`section-status-badge ${
                              submission.textSubmission
                                ? submission.needsReview
                                  ? "pending"
                                  : "complete"
                                : "not-started"
                            }`}
                          >
                            {submission.textSubmission
                              ? submission.needsReview
                                ? "Needs Review"
                                : "Reviewed"
                              : "Not Submitted"}
                          </span>
                        </div>
                        {submission.textSubmission && (
                          <div className="section-content">
                            <div className="text-content">
                              {submission.textSubmission}
                            </div>
                          </div>
                        )}
                        <div className="section-grade-row">
                          <span className="grade-label">Score:</span>
                          <div className="grade-input-box">
                            <input
                              type="number"
                              className="grade-input-small"
                              value={
                                idx === currentIndex
                                  ? editedTextScore
                                  : submission.textScore ?? 0
                              }
                              onChange={(e) =>
                                idx === currentIndex &&
                                setEditedTextScore(e.target.value)
                              }
                              min={0}
                              max={submission.textMaxScore}
                            />
                            <span className="grade-max-label">
                              / {submission.textMaxScore}
                            </span>
                            <button
                              className="grade-save-mini"
                              onClick={() =>
                                saveTextScore(submission.studentId)
                              }
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    {submission.answers.length > 0 && (
                      <div className="submission-section">
                        <div className="section-header">
                          <div className="section-title">
                            <IonIcon icon={checkmarkCircleOutline} />
                            Quiz Results
                          </div>
                          <span className="section-status-badge complete">
                            {submission.quizScore}/{submission.quizMaxScore} pts
                          </span>
                        </div>
                        <div className="section-content">
                          {submission.answers.map((answer, i) => (
                            <div
                              key={answer.questionId}
                              className="quiz-result-item"
                            >
                              <div
                                className={`quiz-result-icon ${
                                  answer.isCorrect ? "correct" : "incorrect"
                                }`}
                              >
                                <IonIcon
                                  icon={
                                    answer.isCorrect
                                      ? checkmarkOutline
                                      : closeOutline
                                  }
                                />
                              </div>
                              <div className="quiz-result-content">
                                <div className="quiz-result-question">
                                  {i + 1}. {answer.questionText}
                                </div>
                                <div className="quiz-result-answer">
                                  {answer.selectedAnswer}
                                  {!answer.isCorrect &&
                                    ` (Correct: ${answer.correctAnswer})`}
                                </div>
                              </div>
                              <div className="quiz-result-points">
                                {answer.points}/{answer.maxPoints}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {submission.aiStudyRequired && (
                      <div className="submission-section">
                        <div className="section-header">
                          <div className="section-title">
                            <IonIcon icon={schoolOutline} />
                            AI Study Progress
                          </div>
                          <span
                            className={`section-status-badge ${
                              submission.aiStudyProgress >= 100
                                ? "complete"
                                : submission.aiStudyProgress > 0
                                ? "pending"
                                : "not-started"
                            }`}
                          >
                            {submission.aiStudyProgress >= 100
                              ? "Complete"
                              : submission.aiStudyProgress > 0
                              ? "In Progress"
                              : "Not Started"}
                          </span>
                        </div>
                        <div className="section-content">
                          <div className="ai-study-progress">
                            <div className="ai-progress-bar">
                              <div
                                className="ai-progress-fill"
                                style={{
                                  width: `${submission.aiStudyProgress}%`,
                                }}
                              ></div>
                            </div>
                            <span className="ai-progress-text">
                              {submission.aiStudyProgress}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Bottom Student Bar */}
          <div className="student-bottom-bar">
            <div ref={studentBarRef} className="student-btn-scroll">
              {submissions.map((submission, idx) => (
                <div
                  key={submission.studentId}
                  className={`student-chip ${getScoreClass(
                    submission.totalScore,
                    submission.maxScore
                  )} ${idx === currentIndex ? "selected" : ""}`}
                  onClick={() => scrollToStudent(idx)}
                >
                  <span className="student-chip-name">
                    {submission.studentName}
                  </span>
                  <span className="student-chip-score">
                    {submission.totalScore !== null
                      ? `${submission.totalScore}/${submission.maxScore}`
                      : "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total Grade Editor */}
          {current && (
            <div className="total-grade-editor">
              <span className="total-grade-label">Total Grade</span>
              <div className="total-grade-input-box">
                <input
                  type="number"
                  className="total-grade-input"
                  value={editedTotalScore}
                  onChange={(e) => setEditedTotalScore(e.target.value)}
                  min={0}
                  max={current.maxScore}
                />
                <span className="total-grade-max">/ {current.maxScore}</span>
                <button className="total-grade-save" onClick={saveTotalGrade}>
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AssignmentDetail;
