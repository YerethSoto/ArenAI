import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonContent,
  IonIcon,
  IonSearchbar,
  useIonViewWillEnter,
} from "@ionic/react";
import {
  calendarOutline,
  checkmarkCircleOutline,
  timeOutline,
  trophyOutline,
  bookOutline,
} from "ionicons/icons";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import StudentHeader from "../components/StudentHeader";
import PageTransition from "../components/PageTransition";
import { getApiUrl } from "../config/api";
import "./StudentAssignments.css";

interface StudentAssignment {
  id: string;
  assignmentTitle: string;
  quizTitle: string;
  dueDate: string;
  subject: string;
  status: "pending" | "completed" | "overdue";
  score?: number;
  questionCount: number;
  topics: string[];
  colorStyle: number;
}

const StudentAssignments: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();

  const [selectedSubject, setSelectedSubject] = useState("Math");
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [pendingSearch, setPendingSearch] = useState("");
  const [completedSearch, setCompletedSearch] = useState("");

  const fetchAssignments = async () => {
    try {
      const token =
        localStorage.getItem("authToken") || localStorage.getItem("token");
      const userStr =
        localStorage.getItem("userData") || localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      if (token && user?.id) {
        const response = await fetch(
          getApiUrl(`/api/assignments/student/${user.id}`),
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.ok) {
          const data = await response.json();
          // Transform
          const transformed: StudentAssignment[] = (data || []).map(
            (a: any, index: number) => {
              const dueDate = new Date(a.due_time);
              const now = new Date();
              let status: "pending" | "completed" | "overdue" = "pending";

              if (a.status === "SUBMITTED" || a.status === "GRADED")
                status = "completed";
              else if (a.status === "IN_PROGRESS") status = "pending";
              else if (now > dueDate) status = "overdue";

              return {
                id: String(a.id_assignment),
                assignmentTitle: a.title,
                quizTitle: a.quiz_name || "Quiz",
                dueDate: a.due_time,
                subject: a.subject_name || "General",
                status,
                score: a.grade ? Number(a.grade) : undefined,
                questionCount: a.questions_count || 0,
                topics: [],
                colorStyle: (index % 5) + 1,
              };
            },
          );
          setAssignments(transformed);
        }
      }
    } catch (error) {
      console.error("Error fetching student assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  useIonViewWillEnter(() => {
    fetchAssignments();
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const pendingAssignments = assignments.filter(
    (a) =>
      (a.status === "pending" || a.status === "overdue") &&
      (a.assignmentTitle.toLowerCase().includes(pendingSearch.toLowerCase()) ||
        a.quizTitle.toLowerCase().includes(pendingSearch.toLowerCase())),
  );

  const completedAssignments = assignments.filter(
    (a) =>
      a.status === "completed" &&
      (a.assignmentTitle
        .toLowerCase()
        .includes(completedSearch.toLowerCase()) ||
        a.quizTitle.toLowerCase().includes(completedSearch.toLowerCase())),
  );

  const startAssignment = (id: string, dueDate: string) => {
    // Check for overdue? Assuming allowed for now or backend blocks it.
    // Pass assignmentId in query or state
    history.push(`/quiz?assignmentId=${id}`);
  };

  return (
    <IonPage className="student-assignments-page">
      <StudentHeader
        showSubject={true}
        selectedSubject={selectedSubject}
        onSubjectChange={setSelectedSubject}
      />
      <IonContent fullscreen className="student-page-content">
        <PageTransition>
          <div className="assignments-container">
            <h1 className="page-title">{t("sidebar.assignments")}</h1>

            {/* Pending Section */}
            <div className="assignments-section">
              <div className="section-header">
                <h2>{t("studentAssignments.pending")}</h2>
                <span className="count-badge">{pendingAssignments.length}</span>
              </div>
              <IonSearchbar
                value={pendingSearch}
                onIonInput={(e) => setPendingSearch(e.detail.value!)}
                placeholder={t("studentAssignments.searchPending")}
                className="custom-searchbar"
              />

              <div className="assignments-grid">
                {pendingAssignments.length === 0 ? (
                  <div className="no-assignments">
                    <IonIcon icon={bookOutline} />
                    <p>{t("studentAssignments.noPending")}</p>
                  </div>
                ) : (
                  pendingAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className={`assignment-card style-${assignment.colorStyle}`}
                    >
                      <div className="card-header">
                        <span className="assignment-subject">
                          {assignment.subject}
                        </span>
                        {assignment.status === "overdue" && (
                          <span className="status-badge overdue">
                            {t("studentAssignments.overdue")}
                          </span>
                        )}
                      </div>
                      <h3 className="assignment-title">
                        {assignment.assignmentTitle}
                      </h3>
                      <div className="quiz-info">
                        <IonIcon icon={trophyOutline} />
                        <span>{assignment.quizTitle}</span>
                      </div>

                      <div className="card-details">
                        <div className="detail-item">
                          <IonIcon icon={timeOutline} />
                          <span>{formatDate(assignment.dueDate)}</span>
                        </div>
                        <div className="detail-item">
                          <span>
                            {assignment.questionCount}{" "}
                            {t("studentAssignments.questions")}
                          </span>
                        </div>
                      </div>

                      <div className="topics-list">
                        {assignment.topics.slice(0, 3).map((topic, i) => (
                          <span key={i} className="topic-chip">
                            {topic}
                          </span>
                        ))}
                      </div>

                      <button
                        className="start-btn"
                        onClick={() =>
                          startAssignment(assignment.id, assignment.dueDate)
                        }
                      >
                        {t("studentAssignments.start")}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Completed Section */}
            <div className="assignments-section completed-section">
              <div className="section-header">
                <h2>{t("studentAssignments.completed")}</h2>
                <span className="count-badge completed">
                  {completedAssignments.length}
                </span>
              </div>
              <IonSearchbar
                value={completedSearch}
                onIonInput={(e) => setCompletedSearch(e.detail.value!)}
                placeholder={t("studentAssignments.searchCompleted")}
                className="custom-searchbar"
              />

              <div className="assignments-grid">
                {completedAssignments.length === 0 ? (
                  <div className="no-assignments">
                    <IonIcon icon={checkmarkCircleOutline} />
                    <p>{t("studentAssignments.noCompleted")}</p>
                  </div>
                ) : (
                  completedAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="assignment-card completed"
                    >
                      <div className="card-header">
                        <span className="assignment-subject">
                          {assignment.subject}
                        </span>
                        <span className="status-badge completed-badge">
                          {t("studentAssignments.completed")}
                        </span>
                      </div>
                      <h3 className="assignment-title">
                        {assignment.assignmentTitle}
                      </h3>
                      <div className="quiz-info">
                        <IonIcon icon={trophyOutline} />
                        <span>{assignment.quizTitle}</span>
                      </div>

                      <div className="score-display">
                        <span className="score-label">
                          {t("studentAssignments.score")}
                        </span>
                        <span
                          className={`score-value ${
                            (assignment.score || 0) >= 70 ? "pass" : "fail"
                          }`}
                        >
                          {assignment.score || 0}%
                        </span>
                      </div>

                      <div className="card-details">
                        <div className="detail-item">
                          <IonIcon icon={calendarOutline} />
                          <span>
                            {t("studentAssignments.submitted")}:{" "}
                            {formatDate(assignment.dueDate)}
                          </span>
                          {/* Ideally submission date, using due date for now */}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </PageTransition>
      </IonContent>
    </IonPage>
  );
};

export default StudentAssignments;
