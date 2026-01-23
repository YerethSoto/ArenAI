import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonContent,
  IonIcon,
  IonSearchbar,
  IonHeader,
  IonToolbar,
  IonMenuButton,
  useIonViewWillEnter,
  useIonToast,
  useIonAlert,
} from "@ionic/react";
import {
  menu,
  filterOutline,
  calendarOutline,
  statsChartOutline,
  createOutline,
  trashOutline,
} from "ionicons/icons";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import ProfessorMenu from "../components/ProfessorMenu";
import PageTransition from "../components/PageTransition";
import { getApiUrl } from "../config/api";
import "./AssignmentsMenu.css";
import "../components/ProfessorHeader.css";
import { useProfessorFilters } from "../hooks/useProfessorFilters";

// Assignment interface
interface Assignment {
  id: string;
  name: string;
  instructions: string;
  dueDate: string;
  totalPoints: number;
  topics: string[];
  hasTextSubmission: boolean;
  studentsTotal: number;
  studentsCompleted: number;
  isOngoing: boolean;
  pendingReviews: number;
  colorStyle: number;
  averageScore: number;
}

const AssignmentsMenu: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [present] = useIonToast();
  const [presentAlert] = useIonAlert();

  // Header state
  // Header state (Global)
  const {
    selectedGrade,
    setSelectedGrade,
    selectedSection,
    setSelectedSection,
    selectedSubject,
    setSelectedSubject,
  } = useProfessorFilters();

  // Assignment lists - start empty, fetch from DB
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Search state
  const [ongoingSearch, setOngoingSearch] = useState("");
  const [previousSearch, setPreviousSearch] = useState("");

  // Fetch assignments from database
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const token =
          localStorage.getItem("authToken") || localStorage.getItem("token");
        const userStr =
          localStorage.getItem("userData") || localStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;

        if (token && user?.id) {
          const response = await fetch(
            getApiUrl(`/api/assignments/professor/${user.id}`),
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (response.ok) {
            const data = await response.json();
            // Transform database format to UI format
            const now = new Date();
            const transformed: Assignment[] = (data.assignments || []).map(
              (a: any, index: number) => {
                const dueDate = a.due_time ? new Date(a.due_time) : new Date();
                const isOngoing = dueDate >= now;

                return {
                  id: String(a.id_assignment),
                  name: a.title || `Assignment ${a.id_assignment}`,
                  instructions: a.description || a.instructions || "",
                  dueDate: a.due_time || new Date().toISOString(),
                  totalPoints: a.total_points || 100,
                  topics: a.subject_name ? [a.subject_name] : [],
                  hasTextSubmission: false,
                  studentsTotal:
                    Number(a.section_students_total) ||
                    Number(a.students_total) ||
                    0,
                  studentsCompleted: Number(a.students_completed) || 0,
                  isOngoing,
                  pendingReviews: 0,
                  colorStyle: (index % 5) + 1,
                  averageScore: 0,
                };
              },
            );
            setAssignments(transformed);
          }
        }
      } catch (error) {
        console.error("Error fetching assignments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  // Auto-reload when page becomes visible
  useIonViewWillEnter(() => {
    const reloadAssignments = async () => {
      const token =
        localStorage.getItem("authToken") || localStorage.getItem("token");
      const userStr =
        localStorage.getItem("userData") || localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      if (token && user?.id) {
        try {
          const response = await fetch(
            getApiUrl(`/api/assignments/professor/${user.id}`),
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          if (response.ok) {
            const data = await response.json();
            const now = new Date();
            const transformed: Assignment[] = (data.assignments || []).map(
              (a: any, index: number) => {
                const dueDate = a.due_time ? new Date(a.due_time) : new Date();
                const isOngoing = dueDate >= now;

                return {
                  id: String(a.id_assignment),
                  name: a.title || `Assignment ${a.id_assignment}`,
                  instructions: a.description || a.instructions || "",
                  dueDate: a.due_time || new Date().toISOString(),
                  totalPoints: a.total_points || 100,
                  topics: a.subject_name ? [a.subject_name] : [],
                  hasTextSubmission: false,
                  studentsTotal:
                    Number(a.section_students_total) ||
                    Number(a.students_total) ||
                    0,
                  studentsCompleted: Number(a.students_completed) || 0,
                  isOngoing,
                  pendingReviews: 0,
                  colorStyle: (index % 5) + 1,
                  averageScore: 0,
                };
              },
            );
            setAssignments(transformed);
          }
        } catch (error) {
          console.error("Error reloading assignments:", error);
        }
      }
    };
    reloadAssignments();
  });

  // Split into ongoing and previous
  const ongoingAssignments = assignments.filter((a) => a.isOngoing);
  const previousAssignments = assignments.filter((a) => !a.isOngoing);

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isOverdue = date < now;
    return {
      text: date.toLocaleDateString("en-US", {
        weekday: "short",
      }),
      full: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      isOverdue,
    };
  };

  // Navigate to assignment detail
  const goToDetail = (assignment: Assignment) => {
    sessionStorage.setItem("selectedAssignment", JSON.stringify(assignment));
    history.push(`/page/assignment-detail/${assignment.id}`);
  };

  // Navigate to edit assignment
  const goToEdit = (assignment: Assignment) => {
    history.push(`/page/edit-assignment/${assignment.id}`);
  };

  // Delete assignment
  const confirmDelete = (e: React.MouseEvent, assignmentId: string) => {
    e.stopPropagation();
    presentAlert({
      header: "Delete Assignment",
      message:
        "Are you sure you want to delete this assignment? This cannot be undone.",
      buttons: [
        "Cancel",
        {
          text: "Delete",
          role: "destructive",
          handler: () => handleDeleteAssignment(assignmentId),
        },
      ],
    });
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      const token =
        localStorage.getItem("authToken") || localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        getApiUrl(`/api/assignments/${assignmentId}`),
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        setAssignments(assignments.filter((a) => a.id !== assignmentId));
        present({
          message: "Assignment deleted successfully",
          duration: 2000,
          color: "success",
        });
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting assignment:", error);
      present({
        message: "Failed to delete assignment",
        duration: 2000,
        color: "danger",
      });
    }
  };

  // Filter assignments
  const filteredOngoing = ongoingAssignments.filter(
    (a) =>
      a.name.toLowerCase().includes(ongoingSearch.toLowerCase()) ||
      a.topics.some((t) =>
        t.toLowerCase().includes(ongoingSearch.toLowerCase()),
      ),
  );

  const filteredPrevious = previousAssignments.filter(
    (a) =>
      a.name.toLowerCase().includes(previousSearch.toLowerCase()) ||
      a.topics.some((t) =>
        t.toLowerCase().includes(previousSearch.toLowerCase()),
      ),
  );

  // Render assignment card
  const renderAssignmentCard = (assignment: Assignment) => {
    const dateInfo = formatDate(assignment.dueDate);

    return (
      <div
        key={assignment.id}
        className="assignment-card-v2"
        onClick={() => goToDetail(assignment)}
      >
        {/* Review notification badge */}
        {assignment.pendingReviews > 0 && (
          <div className="assignment-review-badge">
            {assignment.pendingReviews}
          </div>
        )}

        {/* Colorful Header */}
        <div
          className={`assignment-card-header-v2 style-${assignment.colorStyle}`}
        >
          <div className="assignment-card-title">{assignment.name}</div>
          <div className="assignment-card-subjects">
            {assignment.topics.slice(0, 2).map((topic, i) => (
              <span key={i} className="assignment-subject-tag">
                {topic}
              </span>
            ))}
          </div>
          <div className="assignment-students-count">
            {assignment.studentsTotal} students
          </div>
        </div>

        {/* Card Body */}
        <div className="assignment-card-body">
          <div
            className={`assignment-due-row ${
              dateInfo.isOverdue && assignment.isOngoing ? "overdue" : ""
            }`}
          >
            <IonIcon icon={calendarOutline} />
            <span>Due {dateInfo.full}</span>
          </div>
          <div className="assignment-completed-row">
            Completed {assignment.studentsCompleted}/{assignment.studentsTotal}
          </div>

          {/* Average Score */}
          <div className="assignment-avg-row">
            <IonIcon icon={statsChartOutline} />
            <span>Avg: {assignment.averageScore}%</span>
          </div>

          <div className="assignment-card-actions">
            <button
              className="assignment-action-btn secondary"
              onClick={(e) => {
                e.stopPropagation();
                goToEdit(assignment);
              }}
            >
              <IonIcon icon={createOutline} /> Edit
            </button>
            <button
              className="assignment-action-btn danger"
              onClick={(e) => confirmDelete(e, assignment.id)}
            >
              <IonIcon icon={trashOutline} /> Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <IonPage className="assignments-menu-page">
      {/* Professor Header */}
      <IonHeader className="professor-header-container">
        <IonToolbar color="primary" className="professor-toolbar">
          <div className="ph-content">
            <IonMenuButton className="ph-menu-btn">
              <IonIcon icon={menu} />
            </IonMenuButton>
          </div>
        </IonToolbar>

        {/* Brand / Title */}
        <div className="ph-brand-container-absolute">
          <div className="ph-brand-name">ArenAI</div>
          <div className="ph-brand-sub">Assignments</div>
        </div>

        {/* Notch with dropdowns */}
        <div className="ph-notch-container">
          <div className="ph-notch">
            <div className="ph-dropdowns-display">
              <div className="ph-text-oval">
                <ProfessorMenu
                  selectedGrade={String(selectedGrade)}
                  selectedSection={selectedSection}
                  selectedSubject={t(
                    "professor.dashboard.subjects." +
                      selectedSubject.replace(/\s+/g, ""),
                  )}
                  onGradeChange={(grade) =>
                    setSelectedGrade(parseInt(grade, 10))
                  }
                  onSectionChange={setSelectedSection}
                  onSubjectChange={setSelectedSubject}
                />
              </div>
            </div>
          </div>
        </div>
      </IonHeader>

      <IonContent className="assignments-menu-content">
        <PageTransition>
          <div className="assignments-menu-container">
            {/* ========== ONGOING SECTION ========== */}
            <div className="assignments-section">
              <div className="assignments-section-header">
                <button className="assignments-section-btn ongoing">
                  Ongoing
                  <span className="assignments-section-count">
                    {filteredOngoing.length}
                  </span>
                </button>
              </div>

              <div className="assignments-search-row">
                <IonSearchbar
                  className="assignments-searchbar"
                  value={ongoingSearch}
                  onIonInput={(e) => setOngoingSearch(e.detail.value || "")}
                  placeholder="Search ongoing..."
                />
                <button className="assignments-filter-btn">
                  <IonIcon icon={filterOutline} />
                </button>
              </div>

              {loading ? (
                <div className="assignments-grid">
                  <div className="assignments-empty">
                    Loading assignments...
                  </div>
                </div>
              ) : filteredOngoing.length === 0 ? (
                <div className="assignments-grid">
                  <div className="assignments-empty">
                    No ongoing assignments found.
                  </div>
                </div>
              ) : (
                <div className="assignments-grid">
                  {filteredOngoing.map(renderAssignmentCard)}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="assignments-divider"></div>

            {/* ========== PREVIOUS SECTION ========== */}
            <div className="assignments-section">
              <div className="assignments-section-header">
                <button className="assignments-section-btn previous">
                  Previous
                  <span className="assignments-section-count">
                    {filteredPrevious.length}
                  </span>
                </button>
              </div>

              <div className="assignments-search-row">
                <IonSearchbar
                  className="assignments-searchbar"
                  value={previousSearch}
                  onIonInput={(e) => setPreviousSearch(e.detail.value || "")}
                  placeholder="Search previous..."
                />
                <button className="assignments-filter-btn">
                  <IonIcon icon={filterOutline} />
                </button>
              </div>

              {loading ? (
                <div className="assignments-grid">
                  <div className="assignments-empty">Loading...</div>
                </div>
              ) : filteredPrevious.length === 0 ? (
                <div className="assignments-grid">
                  <div className="assignments-empty">
                    No previous assignments found.
                  </div>
                </div>
              ) : (
                <div className="assignments-grid">
                  {filteredPrevious.map(renderAssignmentCard)}
                </div>
              )}
            </div>

            {/* Footer Spacer */}
            <div className="assignments-footer-spacer"></div>
          </div>
        </PageTransition>
      </IonContent>
    </IonPage>
  );
};

export default AssignmentsMenu;
