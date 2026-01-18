import React, { useState } from "react";
import {
  IonPage,
  IonContent,
  IonIcon,
  IonModal,
  IonRange,
  IonSearchbar,
  IonHeader,
  IonToolbar,
  IonMenuButton,
  useIonToast,
} from "@ionic/react";
import {
  createOutline,
  checkmark,
  menu,
  filterOutline,
  closeOutline,
} from "ionicons/icons";
import { useTranslation } from "react-i18next";
import ProfessorMenu from "../components/ProfessorMenu";
import PageTransition from "../components/PageTransition";
import "./TaskAssignment.css";
import "../components/ProfessorHeader.css";

// Mock sections data
const MOCK_SECTIONS = [
  { id: "1", name: "7-1 Math", grade: 7, subject: "Math" },
  { id: "2", name: "7-2 Math", grade: 7, subject: "Math" },
  { id: "3", name: "8-1 Math", grade: 8, subject: "Math" },
  { id: "4", name: "8-2 Science", grade: 8, subject: "Science" },
  { id: "5", name: "9-1 History", grade: 9, subject: "History" },
  { id: "6", name: "9-2 Math", grade: 9, subject: "Math" },
  { id: "7", name: "10-1 Math", grade: 10, subject: "Math" },
  { id: "8", name: "10-2 Science", grade: 10, subject: "Science" },
];

const GRADES = [7, 8, 9, 10, 11, 12];

// Quiz interface
interface MockQuiz {
  id: string;
  name: string;
  subject: string;
  description: string;
  grade: number;
  topics: string[];
  questions: { text: string; points: number }[];
  createdAt: string; // ISO date string
}

// Available topics for filtering
const AVAILABLE_TOPICS = [
  "Algebra",
  "Geometry",
  "Calculus",
  "Statistics",
  "Trigonometry",
  "Probability",
  "Linear Equations",
  "Fractions",
  "Biology",
  "Chemistry",
  "Physics",
];

// Mock quizzes data
const MOCK_QUIZZES: MockQuiz[] = [
  {
    id: "q1",
    name: "Algebra Basics",
    subject: "Math",
    grade: 7,
    description: "Introduction to algebraic expressions and equations",
    topics: ["Algebra", "Linear Equations"],
    questions: [
      { text: "Solve for x: 2x + 4 = 10", points: 1.5 },
      { text: "What is the value of y in 3y - 9 = 0?", points: 1.5 },
      { text: "Simplify: 5x + 3x - 2x", points: 1.0 },
    ],
    createdAt: "2026-01-15",
  },
  {
    id: "q2",
    name: "Geometry Fundamentals",
    subject: "Math",
    grade: 8,
    description: "Basic concepts of shapes and measurements",
    topics: ["Geometry", "Trigonometry"],
    questions: [
      { text: "What is the area of a circle with radius 5?", points: 2.0 },
      { text: "Calculate the perimeter of a rectangle 4x6", points: 1.0 },
    ],
    createdAt: "2026-01-10",
  },
  {
    id: "q3",
    name: "Statistics Quiz",
    subject: "Math",
    grade: 9,
    description: "Mean, median, mode and data analysis",
    topics: ["Statistics", "Probability"],
    questions: [
      { text: "Find the mean of: 5, 8, 12, 15, 20", points: 1.5 },
      { text: "What is the median of: 3, 7, 9, 11, 14?", points: 1.5 },
      { text: "Calculate the mode of: 2, 4, 4, 5, 7, 7, 7", points: 1.0 },
      { text: "What is the range of: 10, 25, 30, 45?", points: 1.0 },
    ],
    createdAt: "2026-01-18",
  },
];

const TaskAssignment: React.FC = () => {
  const { t } = useTranslation();
  const [present] = useIonToast();

  // Current context (from header)
  const [selectedGrade, setSelectedGrade] = useState(7);
  const [selectedSubject, setSelectedSubject] = useState("Math");
  const [currentSection, setCurrentSection] = useState("7-1");

  // Assignment state
  const [assignmentName, setAssignmentName] = useState("Calculus assignment");
  const [dueDate, setDueDate] = useState("2026-11-26");
  const [assignedSections, setAssignedSections] = useState<string[]>(["1"]);
  const [points, setPoints] = useState(10);
  const [instructions, setInstructions] = useState("");
  const [battlesCount, setBattlesCount] = useState(3);
  const [agentTime, setAgentTime] = useState(30); // in minutes

  // Modal states
  const [showNameModal, setShowNameModal] = useState(false);
  const [tempName, setTempName] = useState("");

  const [showDateModal, setShowDateModal] = useState(false);
  const [tempDate, setTempDate] = useState("");

  const [showSectionModal, setShowSectionModal] = useState(false);
  const [tempSections, setTempSections] = useState<string[]>([]);
  const [sectionSearch, setSectionSearch] = useState("");
  const [filterGrade, setFilterGrade] = useState<number | null>(null);

  const [showPointsModal, setShowPointsModal] = useState(false);
  const [tempPoints, setTempPoints] = useState("");

  const [showBattlesModal, setShowBattlesModal] = useState(false);
  const [tempBattles, setTempBattles] = useState("");

  const [showAgentModal, setShowAgentModal] = useState(false);
  const [tempAgentHours, setTempAgentHours] = useState("0");
  const [tempAgentMinutes, setTempAgentMinutes] = useState("30");

  // Quiz states
  const [quizSearch, setQuizSearch] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState<MockQuiz | null>(null);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [showQuizDetailModal, setShowQuizDetailModal] = useState(false);

  // Quiz filter states
  const [showQuizFilterModal, setShowQuizFilterModal] = useState(false);
  const [quizFilterGrade, setQuizFilterGrade] = useState<number | null>(null);
  const [quizFilterTopics, setQuizFilterTopics] = useState<string[]>([]);
  const [quizSortOrder, setQuizSortOrder] = useState<"newest" | "oldest">(
    "newest"
  );
  const [tempFilterGrade, setTempFilterGrade] = useState<number | null>(null);
  const [tempFilterTopics, setTempFilterTopics] = useState<string[]>([]);
  const [tempSortOrder, setTempSortOrder] = useState<"newest" | "oldest">(
    "newest"
  );
  const [topicSearch, setTopicSearch] = useState("");

  // Name modal handlers
  const openNameModal = () => {
    setTempName(assignmentName);
    setShowNameModal(true);
  };

  const saveName = () => {
    if (tempName.trim()) {
      setAssignmentName(tempName.trim());
    }
    setShowNameModal(false);
  };

  // Date modal handlers
  const openDateModal = () => {
    setTempDate(dueDate);
    setShowDateModal(true);
  };

  const saveDate = () => {
    if (tempDate) {
      setDueDate(tempDate);
    }
    setShowDateModal(false);
  };

  // Format date for display (DD-MM-YY)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Select";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
  };

  // Section modal handlers
  const openSectionModal = () => {
    setTempSections([...assignedSections]);
    setSectionSearch("");
    setFilterGrade(selectedGrade); // Default to current grade
    setShowSectionModal(true);
  };

  const toggleSection = (id: string) => {
    if (tempSections.includes(id)) {
      setTempSections(tempSections.filter((s) => s !== id));
    } else {
      setTempSections([...tempSections, id]);
    }
  };

  const saveSections = () => {
    setAssignedSections(tempSections);
    setShowSectionModal(false);
  };

  // Get display text for assigned sections
  const getAssignedText = () => {
    if (assignedSections.length === 0) return "Select";
    if (assignedSections.length === 1) {
      const section = MOCK_SECTIONS.find((s) => s.id === assignedSections[0]);
      return section?.name.split(" ")[0] || "1";
    }
    return `${assignedSections.length} sections`;
  };

  // Filter sections based on search and grade
  const filteredSections = MOCK_SECTIONS.filter((section) => {
    const matchesSearch = section.name
      .toLowerCase()
      .includes(sectionSearch.toLowerCase());
    const matchesGrade = filterGrade === null || section.grade === filterGrade;
    return matchesSearch && matchesGrade;
  });

  // Quiz filter handlers
  const openQuizFilterModal = () => {
    setTempFilterGrade(quizFilterGrade);
    setTempFilterTopics([...quizFilterTopics]);
    setTempSortOrder(quizSortOrder);
    setTopicSearch("");
    setShowQuizFilterModal(true);
  };

  const applyQuizFilters = () => {
    setQuizFilterGrade(tempFilterGrade);
    setQuizFilterTopics(tempFilterTopics);
    setQuizSortOrder(tempSortOrder);
    setShowQuizFilterModal(false);
  };

  const clearQuizFilters = () => {
    setTempFilterGrade(null);
    setTempFilterTopics([]);
    setTempSortOrder("newest");
  };

  const toggleFilterTopic = (topic: string) => {
    if (tempFilterTopics.includes(topic)) {
      setTempFilterTopics(tempFilterTopics.filter((t) => t !== topic));
    } else {
      setTempFilterTopics([...tempFilterTopics, topic]);
    }
  };

  // Filter and sort quizzes
  const filteredQuizzes = MOCK_QUIZZES.filter((quiz) => {
    // Search filter
    const matchesSearch =
      quiz.name.toLowerCase().includes(quizSearch.toLowerCase()) ||
      quiz.subject.toLowerCase().includes(quizSearch.toLowerCase());

    // Grade filter
    const matchesGrade =
      quizFilterGrade === null || quiz.grade === quizFilterGrade;

    // Topics filter (quiz must contain at least one selected topic)
    const matchesTopics =
      quizFilterTopics.length === 0 ||
      quiz.topics.some((t) => quizFilterTopics.includes(t));

    return matchesSearch && matchesGrade && matchesTopics;
  }).sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return quizSortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  // Format date for display
  const formatQuizDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Check if any filter is active
  const hasActiveFilters =
    quizFilterGrade !== null || quizFilterTopics.length > 0;

  // Points modal handlers
  const openPointsModal = () => {
    setTempPoints(String(points));
    setShowPointsModal(true);
  };

  const savePoints = () => {
    const value = parseInt(tempPoints, 10);
    if (!isNaN(value) && value >= 1 && value <= 100) {
      setPoints(value);
    }
    setShowPointsModal(false);
  };

  // Battles modal handlers
  const openBattlesModal = () => {
    setTempBattles(String(battlesCount));
    setShowBattlesModal(true);
  };

  const saveBattles = () => {
    const value = parseInt(tempBattles, 10);
    if (!isNaN(value) && value >= 0 && value <= 50) {
      setBattlesCount(value);
    }
    setShowBattlesModal(false);
  };

  // Agent time modal handlers
  const openAgentModal = () => {
    const hours = Math.floor(agentTime / 60);
    const minutes = agentTime % 60;
    setTempAgentHours(String(hours));
    setTempAgentMinutes(String(minutes));
    setShowAgentModal(true);
  };

  const saveAgentTime = () => {
    const hours = parseInt(tempAgentHours, 10) || 0;
    const minutes = parseInt(tempAgentMinutes, 10) || 0;
    const totalMinutes = Math.max(0, Math.min(180, hours * 60 + minutes));
    setAgentTime(totalMinutes);
    setShowAgentModal(false);
  };

  // Assign handler
  const handleAssign = () => {
    if (assignedSections.length === 0) {
      present({
        message: "Please select at least one section",
        duration: 2000,
        color: "danger",
      });
      return;
    }

    console.log("Assigning task:", {
      name: assignmentName,
      dueDate,
      sections: assignedSections,
      points,
      instructions,
      battles: battlesCount,
      agentTime,
    });

    present({
      message: "Task assigned successfully!",
      duration: 2000,
      color: "success",
    });
  };

  return (
    <IonPage className="task-assignment-page">
      {/* Professor Header - matching Main_Prof style */}
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
          <div className="ph-brand-sub">
            {t("professor.sidebar.assignment")}
          </div>
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

      <IonContent className="task-assignment-content">
        <PageTransition>
          <div className="task-container">
            {/* Assignment Name */}
            <div className="task-name-section">
              <span className="task-name" onClick={openNameModal}>
                {assignmentName}
                <IonIcon icon={createOutline} className="task-edit-icon" />
              </span>
              <div className="task-separator">
                <div className="task-line"></div>
                <span className="task-center">❧</span>
                <div className="task-line"></div>
              </div>
            </div>

            {/* Details Card */}
            <div className="task-card">
              <div className="task-card-title">Details</div>

              {/* Due Date Row */}
              <div className="task-details-row" onClick={openDateModal}>
                <span className="task-details-label">Due date</span>
                <span className="task-details-value">
                  {formatDate(dueDate)}
                </span>
              </div>

              {/* Assign To Row */}
              <div className="task-details-row" onClick={openSectionModal}>
                <span className="task-details-label">Assign to</span>
                <span className="task-details-value">{getAssignedText()}</span>
              </div>

              {/* Points Row */}
              <div className="task-details-row" onClick={openPointsModal}>
                <span className="task-details-label">Points</span>
                <span className="task-details-value">{points}</span>
              </div>

              {/* Instructions Textbox */}
              <div className="task-instructions-section">
                <textarea
                  className="task-instructions-input"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Add specific instructions for the AI..."
                  rows={3}
                />
              </div>
            </div>

            {/* Additional Assignments Card */}
            <div className="task-card">
              <div className="task-card-title">Additional assignments</div>

              <div className="task-slider-section">
                {/* Two column grid for parallel display */}
                <div className="task-slider-grid">
                  {/* Battles Column */}
                  <div className="task-slider-column">
                    <span className="task-slider-label">Assign battles</span>
                    <div
                      className="task-value-circle"
                      onClick={openBattlesModal}
                    >
                      {battlesCount}
                    </div>
                    <div className="task-slider-row">
                      <div className="task-slider-range">
                        <span className="task-range-label">0</span>
                        <IonRange
                          min={0}
                          max={20}
                          step={1}
                          value={battlesCount}
                          onIonChange={(e) =>
                            setBattlesCount(e.detail.value as number)
                          }
                          color="secondary"
                          style={{ flex: 1 }}
                        />
                        <span className="task-range-label">20</span>
                      </div>
                    </div>
                  </div>

                  {/* Agent Time Column */}
                  <div className="task-slider-column">
                    <span className="task-slider-label">Study with Agent</span>
                    <div className="task-value-circle" onClick={openAgentModal}>
                      {agentTime}
                    </div>
                    <div className="task-slider-row">
                      <div className="task-slider-range">
                        <span className="task-range-label">0</span>
                        <IonRange
                          min={0}
                          max={60}
                          step={5}
                          value={agentTime}
                          onIonChange={(e) =>
                            setAgentTime(e.detail.value as number)
                          }
                          color="secondary"
                          style={{ flex: 1 }}
                        />
                        <span className="task-range-label">60</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Your Quizzes Card */}
            <div className="task-card">
              <div className="task-card-title">Your quizzes</div>

              {/* Quiz Search with Filter Button */}
              <div className="task-quiz-search-row">
                <IonSearchbar
                  className="task-quiz-searchbar"
                  value={quizSearch}
                  onIonInput={(e) => setQuizSearch(e.detail.value || "")}
                  placeholder="Search for quizzes..."
                />
                <button
                  className={`task-quiz-filter-btn ${
                    hasActiveFilters ? "active" : ""
                  }`}
                  onClick={openQuizFilterModal}
                >
                  <IonIcon icon={filterOutline} />
                  {hasActiveFilters && (
                    <span className="task-filter-badge">
                      {(quizFilterGrade ? 1 : 0) + quizFilterTopics.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Sort indicator */}
              <div className="task-quiz-sort-indicator">
                Sorted by:{" "}
                {quizSortOrder === "newest" ? "Newest first" : "Oldest first"}
              </div>

              {/* Quiz List Grid */}
              <div className="task-quiz-grid">
                {filteredQuizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className={`task-quiz-card ${
                      selectedQuizId === quiz.id ? "selected" : ""
                    }`}
                    onClick={() => {
                      if (selectedQuizId === quiz.id) {
                        setSelectedQuizId(null);
                      } else {
                        setSelectedQuizId(quiz.id);
                      }
                    }}
                  >
                    <div className="task-quiz-header">
                      <div className="task-quiz-select-circle">
                        {selectedQuizId === quiz.id && (
                          <IonIcon
                            icon={checkmark}
                            style={{ color: "white", fontSize: "12px" }}
                          />
                        )}
                      </div>
                      <div className="task-quiz-info">
                        <span className="task-quiz-name">{quiz.name}</span>
                        <span className="task-quiz-subject">
                          {quiz.subject} • Grade {quiz.grade}
                        </span>
                      </div>
                    </div>
                    <div className="task-quiz-date">
                      Created: {formatQuizDate(quiz.createdAt)}
                    </div>
                    <div className="task-quiz-topics">
                      {quiz.topics.map((topic, i) => (
                        <span key={i} className="task-quiz-topic-chip">
                          {topic}
                        </span>
                      ))}
                    </div>
                    <button
                      className="task-quiz-details-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedQuiz(quiz);
                        setShowQuizDetailModal(true);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Spacer */}
            <div className="task-footer-spacer"></div>
          </div>
        </PageTransition>
      </IonContent>

      {/* Footer */}
      <div className="task-footer">
        <div className="task-assign-btn" onClick={handleAssign}>
          Assign
        </div>
      </div>

      {/* ========== NAME MODAL ========== */}
      <IonModal
        isOpen={showNameModal}
        onDidDismiss={() => setShowNameModal(false)}
        className="task-modal"
      >
        <div className="task-modal-inner">
          <h2 className="task-modal-title">Assignment Name</h2>
          <input
            type="text"
            className="task-modal-input"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            placeholder="Enter assignment name"
          />
          <div className="task-modal-buttons">
            <button
              className="task-modal-btn cancel"
              onClick={() => setShowNameModal(false)}
            >
              Cancel
            </button>
            <button className="task-modal-btn save" onClick={saveName}>
              Save
            </button>
          </div>
        </div>
      </IonModal>

      {/* ========== DATE MODAL ========== */}
      <IonModal
        isOpen={showDateModal}
        onDidDismiss={() => setShowDateModal(false)}
        className="task-modal"
      >
        <div className="task-modal-inner">
          <h2 className="task-modal-title">Due Date</h2>
          <div className="task-date-picker">
            <input
              type="date"
              value={tempDate}
              onChange={(e) => setTempDate(e.target.value)}
            />
          </div>
          <div className="task-modal-buttons">
            <button
              className="task-modal-btn cancel"
              onClick={() => setShowDateModal(false)}
            >
              Cancel
            </button>
            <button className="task-modal-btn save" onClick={saveDate}>
              Save
            </button>
          </div>
        </div>
      </IonModal>

      {/* ========== SECTION SELECTOR MODAL ========== */}
      <IonModal
        isOpen={showSectionModal}
        onDidDismiss={() => setShowSectionModal(false)}
        className="task-section-modal"
      >
        <div className="task-section-modal-content">
          <div className="task-section-header">
            <h2 className="task-section-title">Assign to Sections</h2>
            <IonSearchbar
              className="task-section-search"
              value={sectionSearch}
              onIonInput={(e) => setSectionSearch(e.detail.value || "")}
              placeholder="Search sections..."
            />
          </div>

          {/* Grade Filter */}
          <div className="task-grade-filter">
            <div
              className={`task-grade-chip ${
                filterGrade === null ? "active" : ""
              }`}
              onClick={() => setFilterGrade(null)}
            >
              All
            </div>
            {GRADES.map((grade) => (
              <div
                key={grade}
                className={`task-grade-chip ${
                  filterGrade === grade ? "active" : ""
                }`}
                onClick={() => setFilterGrade(grade)}
              >
                Grade {grade}
              </div>
            ))}
          </div>

          {/* Section List */}
          <div className="task-section-list">
            {filteredSections.map((section) => (
              <div
                key={section.id}
                className={`task-section-item ${
                  tempSections.includes(section.id) ? "selected" : ""
                }`}
                onClick={() => toggleSection(section.id)}
              >
                <div className="task-section-checkbox">
                  {tempSections.includes(section.id) && (
                    <IonIcon
                      icon={checkmark}
                      style={{ color: "white", fontSize: "14px" }}
                    />
                  )}
                </div>
                <span className="task-section-name">{section.name}</span>
                <span className="task-section-grade">
                  Grade {section.grade}
                </span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="task-section-footer">
            <button
              className="task-modal-btn cancel"
              onClick={() => setShowSectionModal(false)}
            >
              Cancel
            </button>
            <button className="task-modal-btn save" onClick={saveSections}>
              Save ({tempSections.length})
            </button>
          </div>
        </div>
      </IonModal>

      {/* ========== POINTS MODAL ========== */}
      <IonModal
        isOpen={showPointsModal}
        onDidDismiss={() => setShowPointsModal(false)}
        className="task-modal"
      >
        <div className="task-modal-inner">
          <h2 className="task-modal-title">Points</h2>
          <input
            type="number"
            className="task-modal-input"
            value={tempPoints}
            onChange={(e) => setTempPoints(e.target.value)}
            placeholder="1-100"
            min={1}
            max={100}
          />
          <div className="task-modal-buttons">
            <button
              className="task-modal-btn cancel"
              onClick={() => setShowPointsModal(false)}
            >
              Cancel
            </button>
            <button className="task-modal-btn save" onClick={savePoints}>
              Save
            </button>
          </div>
        </div>
      </IonModal>

      {/* ========== BATTLES MODAL ========== */}
      <IonModal
        isOpen={showBattlesModal}
        onDidDismiss={() => setShowBattlesModal(false)}
        className="task-modal"
      >
        <div className="task-modal-inner">
          <h2 className="task-modal-title">Number of Battles</h2>
          <input
            type="number"
            className="task-modal-input"
            value={tempBattles}
            onChange={(e) => setTempBattles(e.target.value)}
            placeholder="0-50"
            min={0}
            max={50}
          />
          <div className="task-modal-buttons">
            <button
              className="task-modal-btn cancel"
              onClick={() => setShowBattlesModal(false)}
            >
              Cancel
            </button>
            <button className="task-modal-btn save" onClick={saveBattles}>
              Save
            </button>
          </div>
        </div>
      </IonModal>

      {/* ========== AGENT TIME MODAL ========== */}
      <IonModal
        isOpen={showAgentModal}
        onDidDismiss={() => setShowAgentModal(false)}
        className="task-modal"
      >
        <div className="task-modal-inner">
          <h2 className="task-modal-title">Study Time</h2>
          <div className="task-time-picker">
            <div className="task-time-group">
              <input
                type="number"
                className="task-time-input"
                value={tempAgentHours}
                onChange={(e) => setTempAgentHours(e.target.value)}
                placeholder="0"
                min={0}
                max={3}
              />
              <span className="task-time-label">Hours</span>
            </div>
            <span className="task-time-separator">:</span>
            <div className="task-time-group">
              <input
                type="number"
                className="task-time-input"
                value={tempAgentMinutes}
                onChange={(e) => setTempAgentMinutes(e.target.value)}
                placeholder="0"
                min={0}
                max={59}
              />
              <span className="task-time-label">Minutes</span>
            </div>
          </div>
          <div className="task-modal-buttons">
            <button
              className="task-modal-btn cancel"
              onClick={() => setShowAgentModal(false)}
            >
              Cancel
            </button>
            <button className="task-modal-btn save" onClick={saveAgentTime}>
              Save
            </button>
          </div>
        </div>
      </IonModal>

      {/* ========== QUIZ DETAIL MODAL ========== */}
      <IonModal
        isOpen={showQuizDetailModal}
        onDidDismiss={() => setShowQuizDetailModal(false)}
        className="task-quiz-detail-modal"
      >
        {selectedQuiz && (
          <div className="task-quiz-detail-content">
            <div className="task-quiz-detail-header">
              <h2 className="task-quiz-detail-title">{selectedQuiz.name}</h2>
              <span className="task-quiz-detail-subject">
                {selectedQuiz.subject} • Grade {selectedQuiz.grade}
              </span>
              <span className="task-quiz-detail-date">
                Created: {formatQuizDate(selectedQuiz.createdAt)}
              </span>
            </div>

            <p className="task-quiz-detail-description">
              {selectedQuiz.description}
            </p>

            <div className="task-quiz-detail-section">
              <h3 className="task-quiz-detail-section-title">Topics</h3>
              <div className="task-quiz-detail-topics">
                {selectedQuiz.topics.map((topic, i) => (
                  <span key={i} className="task-quiz-topic-chip">
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="task-quiz-detail-section">
              <h3 className="task-quiz-detail-section-title">
                Questions ({selectedQuiz.questions.length})
              </h3>
              <div className="task-quiz-detail-questions">
                {selectedQuiz.questions.slice(0, 3).map((q, i) => (
                  <div key={i} className="task-quiz-question-preview">
                    <span className="task-quiz-question-number">{i + 1}.</span>
                    <span className="task-quiz-question-text">{q.text}</span>
                    <span className="task-quiz-question-points">
                      {q.points} pts
                    </span>
                  </div>
                ))}
                {selectedQuiz.questions.length > 3 && (
                  <div className="task-quiz-more-questions">
                    +{selectedQuiz.questions.length - 3} more questions...
                  </div>
                )}
              </div>
            </div>

            <div className="task-modal-buttons">
              <button
                className="task-modal-btn cancel"
                onClick={() => setShowQuizDetailModal(false)}
              >
                Close
              </button>
              <button
                className="task-modal-btn save"
                onClick={() => {
                  setSelectedQuizId(selectedQuiz.id);
                  setShowQuizDetailModal(false);
                }}
              >
                Select Quiz
              </button>
            </div>
          </div>
        )}
      </IonModal>
      {/* ========== QUIZ FILTER MODAL ========== */}
      <IonModal
        isOpen={showQuizFilterModal}
        onDidDismiss={() => setShowQuizFilterModal(false)}
        className="task-quiz-filter-modal"
      >
        <div className="task-quiz-filter-content">
          <div className="task-quiz-filter-header">
            <h2 className="task-quiz-filter-title">Filter Quizzes</h2>
            <button
              className="task-quiz-filter-close"
              onClick={() => setShowQuizFilterModal(false)}
            >
              <IonIcon icon={closeOutline} />
            </button>
          </div>

          {/* Sort Order */}
          <div className="task-quiz-filter-section">
            <h3 className="task-quiz-filter-section-title">Sort By</h3>
            <div className="task-quiz-sort-buttons">
              <button
                className={`task-quiz-sort-btn ${
                  tempSortOrder === "newest" ? "active" : ""
                }`}
                onClick={() => setTempSortOrder("newest")}
              >
                Newest First
              </button>
              <button
                className={`task-quiz-sort-btn ${
                  tempSortOrder === "oldest" ? "active" : ""
                }`}
                onClick={() => setTempSortOrder("oldest")}
              >
                Oldest First
              </button>
            </div>
          </div>

          {/* Grade Filter */}
          <div className="task-quiz-filter-section">
            <h3 className="task-quiz-filter-section-title">Grade</h3>
            <div className="task-quiz-grade-chips">
              <div
                className={`task-quiz-grade-chip ${
                  tempFilterGrade === null ? "active" : ""
                }`}
                onClick={() => setTempFilterGrade(null)}
              >
                All
              </div>
              {GRADES.map((grade) => (
                <div
                  key={grade}
                  className={`task-quiz-grade-chip ${
                    tempFilterGrade === grade ? "active" : ""
                  }`}
                  onClick={() => setTempFilterGrade(grade)}
                >
                  {grade}
                </div>
              ))}
            </div>
          </div>

          {/* Topics Filter */}
          <div className="task-quiz-filter-section">
            <h3 className="task-quiz-filter-section-title">
              Topics{" "}
              {tempFilterTopics.length > 0 && `(${tempFilterTopics.length})`}
            </h3>
            <IonSearchbar
              className="task-quiz-topic-search"
              value={topicSearch}
              onIonInput={(e) => setTopicSearch(e.detail.value || "")}
              placeholder="Search topics..."
            />
            <div className="task-quiz-topic-grid">
              {AVAILABLE_TOPICS.filter((t) =>
                t.toLowerCase().includes(topicSearch.toLowerCase())
              ).map((topic) => (
                <div
                  key={topic}
                  className={`task-quiz-topic-item ${
                    tempFilterTopics.includes(topic) ? "selected" : ""
                  }`}
                  onClick={() => toggleFilterTopic(topic)}
                >
                  <div className="task-quiz-topic-checkbox">
                    {tempFilterTopics.includes(topic) && (
                      <IonIcon
                        icon={checkmark}
                        style={{ color: "white", fontSize: "12px" }}
                      />
                    )}
                  </div>
                  <span className="task-quiz-topic-name">{topic}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="task-quiz-filter-buttons">
            <button
              className="task-modal-btn cancel"
              onClick={clearQuizFilters}
            >
              Clear All
            </button>
            <button className="task-modal-btn save" onClick={applyQuizFilters}>
              Apply Filters
            </button>
          </div>
        </div>
      </IonModal>
    </IonPage>
  );
};

export default TaskAssignment;
