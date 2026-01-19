import React, { useState } from "react";
import {
  IonPage,
  IonContent,
  IonIcon,
  IonSearchbar,
  IonHeader,
  IonToolbar,
  IonMenuButton,
} from "@ionic/react";
import {
  menu,
  filterOutline,
  calendarOutline,
  statsChartOutline,
} from "ionicons/icons";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import ProfessorMenu from "../components/ProfessorMenu";
import PageTransition from "../components/PageTransition";
import "./AssignmentsMenu.css";
import "../components/ProfessorHeader.css";

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
  averageScore: number; // Average score of students who completed
}

// Mock data - Ongoing Assignments
const ONGOING_ASSIGNMENTS: Assignment[] = [
  {
    id: "ongoing1",
    name: "History of Psychology",
    instructions: "Complete all questions in the psychology history quiz.",
    dueDate: "2026-01-25",
    totalPoints: 100,
    topics: ["Psychology"],
    hasTextSubmission: true,
    studentsTotal: 35,
    studentsCompleted: 10,
    isOngoing: true,
    pendingReviews: 3,
    colorStyle: 1,
    averageScore: 82,
  },
  {
    id: "ongoing2",
    name: "Introduction to AI",
    instructions: "Complete the introductory AI concepts quiz.",
    dueDate: "2026-01-28",
    totalPoints: 50,
    topics: ["Technology", "AI"],
    hasTextSubmission: false,
    studentsTotal: 35,
    studentsCompleted: 15,
    isOngoing: true,
    pendingReviews: 0,
    colorStyle: 2,
    averageScore: 76,
  },
  {
    id: "ongoing3",
    name: "Statistics",
    instructions: "Complete the statistics fundamentals homework.",
    dueDate: "2026-01-22",
    totalPoints: 25,
    topics: ["Math", "Statistics"],
    hasTextSubmission: true,
    studentsTotal: 35,
    studentsCompleted: 28,
    isOngoing: true,
    pendingReviews: 5,
    colorStyle: 3,
    averageScore: 88,
  },
  {
    id: "ongoing4",
    name: "Creative Writing",
    instructions: "Write a short story on the given topic.",
    dueDate: "2026-01-30",
    totalPoints: 40,
    topics: ["English"],
    hasTextSubmission: true,
    studentsTotal: 35,
    studentsCompleted: 12,
    isOngoing: true,
    pendingReviews: 8,
    colorStyle: 4,
    averageScore: 71,
  },
  {
    id: "ongoing5",
    name: "Geography Quiz",
    instructions: "Complete the world geography assessment.",
    dueDate: "2026-01-26",
    totalPoints: 30,
    topics: ["Geography"],
    hasTextSubmission: false,
    studentsTotal: 35,
    studentsCompleted: 20,
    isOngoing: true,
    pendingReviews: 0,
    colorStyle: 5,
    averageScore: 79,
  },
  {
    id: "ongoing6",
    name: "Biology Lab Report",
    instructions: "Submit your lab report on cell structure.",
    dueDate: "2026-01-29",
    totalPoints: 50,
    topics: ["Biology"],
    hasTextSubmission: true,
    studentsTotal: 35,
    studentsCompleted: 8,
    isOngoing: true,
    pendingReviews: 2,
    colorStyle: 1,
    averageScore: 85,
  },
];

// Mock data - Previous Assignments
const PREVIOUS_ASSIGNMENTS: Assignment[] = [
  {
    id: "prev1",
    name: "History of Psychology",
    instructions: "Complete the introductory psychology quiz.",
    dueDate: "2026-01-10",
    totalPoints: 50,
    topics: ["Psychology"],
    hasTextSubmission: true,
    studentsTotal: 35,
    studentsCompleted: 33,
    isOngoing: false,
    pendingReviews: 1,
    colorStyle: 1,
    averageScore: 84,
  },
  {
    id: "prev2",
    name: "Introduction Assignment",
    instructions: "Introduce yourself and your learning goals.",
    dueDate: "2026-01-05",
    totalPoints: 10,
    topics: ["General"],
    hasTextSubmission: true,
    studentsTotal: 35,
    studentsCompleted: 35,
    isOngoing: false,
    pendingReviews: 0,
    colorStyle: 2,
    averageScore: 92,
  },
  {
    id: "prev3",
    name: "Statistics",
    instructions: "Complete the basic statistics quiz.",
    dueDate: "2025-12-20",
    totalPoints: 40,
    topics: ["Math", "Statistics"],
    hasTextSubmission: false,
    studentsTotal: 35,
    studentsCompleted: 34,
    isOngoing: false,
    pendingReviews: 0,
    colorStyle: 3,
    averageScore: 78,
  },
];

const AssignmentsMenu: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();

  // Header state
  const [selectedGrade, setSelectedGrade] = useState(7);
  const [selectedSubject, setSelectedSubject] = useState("Math");
  const [currentSection, setCurrentSection] = useState("7-1");

  // Search state
  const [ongoingSearch, setOngoingSearch] = useState("");
  const [previousSearch, setPreviousSearch] = useState("");

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

  // Filter assignments
  const filteredOngoing = ONGOING_ASSIGNMENTS.filter(
    (a) =>
      a.name.toLowerCase().includes(ongoingSearch.toLowerCase()) ||
      a.topics.some((t) =>
        t.toLowerCase().includes(ongoingSearch.toLowerCase())
      )
  );

  const filteredPrevious = PREVIOUS_ASSIGNMENTS.filter(
    (a) =>
      a.name.toLowerCase().includes(previousSearch.toLowerCase()) ||
      a.topics.some((t) =>
        t.toLowerCase().includes(previousSearch.toLowerCase())
      )
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
                  selectedSection={currentSection.split("-")[1] || "1"}
                  selectedSubject={t(
                    "professor.dashboard.subjects." +
                      selectedSubject.replace(/\s+/g, "")
                  )}
                  onGradeChange={(grade) =>
                    setSelectedGrade(parseInt(grade, 10))
                  }
                  onSectionChange={(section) =>
                    setCurrentSection(`${selectedGrade}-${section}`)
                  }
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

              {filteredOngoing.length === 0 ? (
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

              {filteredPrevious.length === 0 ? (
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
