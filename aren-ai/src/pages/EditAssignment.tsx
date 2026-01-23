import React, { useState, useEffect } from "react";
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
  useIonAlert,
} from "@ionic/react";
import {
  createOutline,
  checkmark,
  menu,
  filterOutline,
  closeOutline,
} from "ionicons/icons";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";
import ProfessorMenu from "../components/ProfessorMenu";
import PageTransition from "../components/PageTransition";
import { getApiUrl } from "../config/api";
import "./TaskAssignment.css";
import "../components/ProfessorHeader.css";
import { useProfessorFilters } from "../hooks/useProfessorFilters";

// Section interface for API data
interface Section {
  id: number;
  sectionNumber: string;
  grade: string;
  name: string;
}

// Student interface
interface Student {
  id: number;
  username: string;
  name: string;
  lastName: string;
}

const GRADES = [7, 8, 9, 10, 11, 12];

// Quiz interface
interface Quiz {
  id: string;
  name: string;
  subject: string;
  description: string;
  grade: number;
  topics: string[];
  questions: { text: string; points: number }[];
  createdAt: string;
  creatorId: string;
}

const EditAssignment: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [present] = useIonToast();
  const [presentAlert] = useIonAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Current context (from global hook)
  const {
    selectedGrade,
    setSelectedGrade,
    selectedSection,
    setSelectedSection,
    selectedSubject,
    setSelectedSubject,
  } = useProfessorFilters();

  // Sections and students from DB
  const [sections, setSections] = useState<Section[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingSections, setLoadingSections] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Real Quizzes state
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);

  // Assignment mode: section or student
  const [assignMode, setAssignMode] = useState<"section" | "student">(
    "section",
  );
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null,
  );
  const [studentSearch, setStudentSearch] = useState("");

  // Assignment state
  const today = new Date().toISOString().split("T")[0];
  const [assignmentName, setAssignmentName] = useState("");
  const [dueDate, setDueDate] = useState(today);
  const [assignedSections, setAssignedSections] = useState<string[]>([]);
  const [points, setPoints] = useState(0);
  const [instructions, setInstructions] = useState("");
  const [battlesCount, setBattlesCount] = useState(0);
  const [agentTime, setAgentTime] = useState(0); // in minutes - default to 0

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
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [showQuizDetailModal, setShowQuizDetailModal] = useState(false);

  // Quiz filter states
  const [showQuizFilterModal, setShowQuizFilterModal] = useState(false);
  const [quizFilterGrade, setQuizFilterGrade] = useState<number | null>(null);
  const [quizFilterTopics, setQuizFilterTopics] = useState<string[]>([]);
  const [quizSortOrder, setQuizSortOrder] = useState<"newest" | "oldest">(
    "newest",
  );
  const [tempFilterGrade, setTempFilterGrade] = useState<number | null>(null);
  const [tempFilterTopics, setTempFilterTopics] = useState<string[]>([]);
  const [tempSortOrder, setTempSortOrder] = useState<"newest" | "oldest">(
    "newest",
  );
  const [topicSearch, setTopicSearch] = useState("");

  // Fetch Assignment Details
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const token =
          localStorage.getItem("authToken") || localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(getApiUrl(`/api/assignments/${id}`), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setAssignmentName(data.title);
          setInstructions(data.description || "");
          setDueDate(
            data.due_time
              ? new Date(data.due_time).toISOString().split("T")[0]
              : today,
          );
          setBattlesCount(data.win_battle_requirement || 0);
          setAssignedSections(data.id_section ? [String(data.id_section)] : []);
          if (data.id_quiz) setSelectedQuizId(String(data.id_quiz));

          // Initial temp states
          setTempSections(data.id_section ? [String(data.id_section)] : []);
          setTempBattles(String(data.win_battle_requirement || 0));
        } else {
          console.error("Failed to fetch assignment details");
          present({
            message: "Failed to load assignment",
            duration: 2000,
            color: "danger",
          });
        }
      } catch (error) {
        console.error("Error fetching assignment:", error);
      }
    };

    if (id) fetchAssignment();
  }, [id]);

  // Fetch sections from API on mount
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const token =
          localStorage.getItem("authToken") || localStorage.getItem("token");

        if (!token) {
          setLoadingSections(false);
          return;
        }

        const url = getApiUrl("/api/sections/institution");

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          const sectionsList = data.sections || [];
          setSections(sectionsList);
        }
      } catch (error) {
        console.error("Error fetching sections:", error);
      } finally {
        setLoadingSections(false);
      }
    };
    fetchSections();
  }, []);

  // Fetch Quizzes from API (Professor's quizzes)
  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoadingQuizzes(true);
      try {
        const token =
          localStorage.getItem("authToken") || localStorage.getItem("token");
        const userStr =
          localStorage.getItem("userData") || localStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;

        if (token && user?.id) {
          const response = await fetch(
            getApiUrl(`/api/quizzes/professor/${user.id}`),
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          if (response.ok) {
            const data = await response.json();
            if (data.quizzes) {
              const transformed: Quiz[] = data.quizzes.map((q: any) => ({
                id: String(q.id_quiz),
                name: q.quiz_name,
                subject:
                  q.id_subject === 1
                    ? "Math"
                    : q.id_subject === 2
                      ? "Science"
                      : q.id_subject === 3
                        ? "Social Studies"
                        : "Spanish",
                grade: 7,
                description: q.description || "",
                topics: q.topics ? q.topics.split(",") : [],
                questions: Array(q.question_count || 0).fill({
                  text: "Question",
                  points: 1,
                }),
                createdAt: q.created_at || new Date().toISOString(),
                creatorId: String(q.id_professor),
              }));
              setQuizzes(transformed);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      } finally {
        setLoadingQuizzes(false);
      }
    };
    fetchQuizzes();
  }, []);

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
    setFilterGrade(selectedGrade);
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
      const section = sections.find(
        (s: Section) => String(s.id) === assignedSections[0],
      );
      return section?.name || "1 section";
    }
    return `${assignedSections.length} sections`;
  };

  // Filter sections based on search and grade
  const filteredSections = sections.filter((section: Section) => {
    const matchesSearch = section.name
      .toLowerCase()
      .includes(sectionSearch.toLowerCase());
    const matchesGrade =
      filterGrade === null || section.grade === String(filterGrade);
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
  const filteredQuizzes = quizzes
    .filter((quiz) => {
      const matchesSearch =
        quiz.name.toLowerCase().includes(quizSearch.toLowerCase()) ||
        quiz.subject.toLowerCase().includes(quizSearch.toLowerCase());

      const matchesGrade =
        quizFilterGrade === null || quiz.grade === quizFilterGrade;

      const matchesTopics =
        quizFilterTopics.length === 0 ||
        quiz.topics.some((t) => quizFilterTopics.includes(t));

      const matchesSubject = quiz.subject === selectedSubject;

      return matchesSearch && matchesGrade && matchesTopics && matchesSubject;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return quizSortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  // Format date for display
  const formatQuizDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

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

  // UPDATE handler - save changes to database
  const handleUpdate = async () => {
    if (assignedSections.length === 0) {
      present({
        message: "Please select at least one section",
        duration: 2000,
        color: "danger",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token =
        localStorage.getItem("authToken") || localStorage.getItem("token");
      const userStr =
        localStorage.getItem("userData") || localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      if (!token || !user?.id) {
        present({
          message: "Please log in to edit assignments",
          duration: 2000,
          color: "warning",
        });
        setIsSubmitting(false);
        return;
      }

      const sectionId =
        assignedSections.length > 0 ? assignedSections[0] : null;

      const response = await fetch(getApiUrl(`/api/assignments/${id}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: assignmentName,
          description: instructions || null,
          sectionId: sectionId ? Number(sectionId) : null,
          professorId: user.id,
          subjectId: 1,
          dueTime: dueDate,
          quizId: selectedQuizId ? Number(selectedQuizId) : null,
          winBattleRequirement: battlesCount > 0 ? battlesCount : null,
          minBattleWins: battlesCount > 0 ? battlesCount : 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update assignment");
      }

      history.push("/page/assignments-menu");
      present({
        message: "Assignment updated successfully",
        duration: 2000,
        color: "success",
      });
    } catch (error) {
      console.error("Error updating assignment:", error);
      present({
        message: "Failed to update assignment. Please try again.",
        duration: 2000,
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <IonPage className="task-assignment-page">
      {/* Professor Header */}
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
          <div className="ph-brand-sub">Edit Assignment</div>
        </div>

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

      <IonContent className="task-assignment-content">
        <PageTransition>
          <div className="task-container">
            {/* Assignment Name */}
            <div className="task-name-section">
              <span className="task-name" onClick={openNameModal}>
                {assignmentName || "Untitled Assignment"}
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
              <div className="task-card-title">
                {t("taskAssignment.pageTitle")}
              </div>

              {/* Due Date Row */}
              <div className="task-details-row" onClick={openDateModal}>
                <span className="task-details-label">
                  {t("taskAssignment.dueDate")}
                </span>
                <span className="task-details-value">
                  {formatDate(dueDate)}
                </span>
              </div>

              {/* Assign To Row */}
              <div className="task-details-row" onClick={openSectionModal}>
                <span className="task-details-label">
                  {t("taskAssignment.assignToSections")}
                </span>
                <span className="task-details-value">{getAssignedText()}</span>
              </div>

              {/* Points Row */}
              <div className="task-details-row" onClick={openPointsModal}>
                <span className="task-details-label">
                  {t("taskAssignment.points")}
                </span>
                <span className="task-details-value">{points}</span>
              </div>

              {/* Instructions Textbox */}
              <div className="task-instructions-section">
                <textarea
                  className="task-instructions-input"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder={t("taskAssignment.instructions")}
                  rows={3}
                />
              </div>
            </div>

            {/* Additional Assignments Card */}
            <div className="task-card">
              <div className="task-card-title">
                {t("taskAssignment.additionalAssignments")}
              </div>

              <div className="task-slider-section">
                <div className="task-slider-grid">
                  {/* Battles Column */}
                  <div className="task-slider-column">
                    <span className="task-slider-label">
                      {t("taskAssignment.battlesRequired")}
                    </span>
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
                    <span className="task-slider-label">
                      {t("taskAssignment.studyWithAgentTime")}
                    </span>
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
              <div className="task-card-title">
                {t("assignment.yourQuizzes")}
              </div>

              {/* Quiz Search with Filter Button */}
              <div className="task-quiz-search-row">
                <IonSearchbar
                  className="task-quiz-searchbar"
                  value={quizSearch}
                  onIonInput={(e) => setQuizSearch(e.detail.value || "")}
                  placeholder={t("taskAssignment.searchQuizzes")}
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
                {t("taskAssignment.sortedBy")}{" "}
                {quizSortOrder === "newest"
                  ? t("taskAssignment.newestFirst")
                  : t("taskAssignment.oldestFirst")}
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
                          {t(
                            "professor.dashboard.subjects." +
                              quiz.subject.replace(/\s+/g, ""),
                          )}{" "}
                          • {t("taskAssignment.gradeFilter")} {quiz.grade}
                        </span>
                      </div>
                    </div>
                    <div className="task-quiz-date">
                      {t("quizMenu.created")}: {formatQuizDate(quiz.createdAt)}
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
                      {t("taskAssignment.viewDetails")}
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
        <div className="task-assign-btn" onClick={handleUpdate}>
          {isSubmitting ? "Updating..." : "Update Assignment"}
        </div>
      </div>

      {/* ========== NAME MODAL ========== */}
      <IonModal
        isOpen={showNameModal}
        onDidDismiss={() => setShowNameModal(false)}
        className="task-modal"
      >
        <div className="task-modal-inner">
          <h2 className="task-modal-title">{t("taskAssignment.editName")}</h2>
          <input
            type="text"
            className="task-modal-input"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            placeholder={t("taskAssignment.enterName")}
          />
          <div className="task-modal-buttons">
            <button
              className="task-modal-btn cancel"
              onClick={() => setShowNameModal(false)}
            >
              {t("taskAssignment.cancel")}
            </button>
            <button className="task-modal-btn save" onClick={saveName}>
              {t("taskAssignment.save")}
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
          <h2 className="task-modal-title">{t("taskAssignment.dueDate")}</h2>
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
              {t("taskAssignment.cancel")}
            </button>
            <button className="task-modal-btn save" onClick={saveDate}>
              {t("taskAssignment.save")}
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
            <h2 className="task-section-title">
              {t("taskAssignment.assignToSections")}
            </h2>
            <IonSearchbar
              className="task-section-search"
              value={sectionSearch}
              onIonInput={(e) => setSectionSearch(e.detail.value || "")}
              placeholder={t("taskAssignment.searchSections")}
            />
          </div>

          <div className="task-grade-filter">
            <div
              className={`task-grade-chip ${
                filterGrade === null ? "active" : ""
              }`}
              onClick={() => setFilterGrade(null)}
            >
              {t("taskAssignment.all")}
            </div>
            {GRADES.map((grade) => (
              <div
                key={grade}
                className={`task-grade-chip ${
                  filterGrade === grade ? "active" : ""
                }`}
                onClick={() => setFilterGrade(grade)}
              >
                {t("taskAssignment.gradeFilter")} {grade}
              </div>
            ))}
          </div>

          <div className="task-section-list">
            {loadingSections ? (
              <div style={{ padding: "20px", textAlign: "center" }}>
                {t("taskAssignment.loadingSections")}
              </div>
            ) : filteredSections.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center" }}>
                {t("taskAssignment.noSectionsFound")}
              </div>
            ) : (
              filteredSections.map((section) => (
                <div
                  key={section.id}
                  className={`task-section-item ${
                    tempSections.includes(String(section.id)) ? "selected" : ""
                  }`}
                  onClick={() => toggleSection(String(section.id))}
                >
                  <div className="task-section-checkbox">
                    {tempSections.includes(String(section.id)) && (
                      <IonIcon
                        icon={checkmark}
                        style={{ color: "white", fontSize: "14px" }}
                      />
                    )}
                  </div>
                  <span className="task-section-name">{section.name}</span>
                  <span className="task-section-grade">
                    {t("taskAssignment.gradeFilter")} {section.grade}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="task-section-footer">
            <button
              className="task-modal-btn cancel"
              onClick={() => setShowSectionModal(false)}
            >
              {t("taskAssignment.cancel")}
            </button>
            <button className="task-modal-btn save" onClick={saveSections}>
              {t("taskAssignment.save")} ({tempSections.length})
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
          <h2 className="task-modal-title">{t("taskAssignment.points")}</h2>
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
              {t("taskAssignment.cancel")}
            </button>
            <button className="task-modal-btn save" onClick={savePoints}>
              {t("taskAssignment.save")}
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
          <h2 className="task-modal-title">
            {t("taskAssignment.battlesRequired")}
          </h2>
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
              {t("taskAssignment.cancel")}
            </button>
            <button className="task-modal-btn save" onClick={saveBattles}>
              {t("taskAssignment.save")}
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
          <h2 className="task-modal-title">
            {t("taskAssignment.studyWithAgentTime")}
          </h2>
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
              <span className="task-time-label">
                {t("taskAssignment.hours")}
              </span>
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
              <span className="task-time-label">
                {t("taskAssignment.minutes")}
              </span>
            </div>
          </div>
          <div className="task-modal-buttons">
            <button
              className="task-modal-btn cancel"
              onClick={() => setShowAgentModal(false)}
            >
              {t("taskAssignment.cancel")}
            </button>
            <button className="task-modal-btn save" onClick={saveAgentTime}>
              {t("taskAssignment.save")}
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
                {t(
                  "professor.dashboard.subjects." +
                    selectedQuiz.subject.replace(/\s+/g, ""),
                )}{" "}
                • {t("taskAssignment.gradeFilter")} {selectedQuiz.grade}
              </span>
              <span className="task-quiz-detail-date">
                {t("quizMenu.created")}:{" "}
                {formatQuizDate(selectedQuiz.createdAt)}
              </span>
            </div>

            <p className="task-quiz-detail-description">
              {selectedQuiz.description}
            </p>

            <div className="task-quiz-detail-section">
              <h3 className="task-quiz-detail-section-title">
                {t("taskAssignment.topics")}
              </h3>
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
                {t("quiz.questions")} ({selectedQuiz.questions.length})
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
                {t("sidebar.close")}
              </button>
              <button
                className="task-modal-btn save"
                onClick={() => {
                  setSelectedQuizId(selectedQuiz.id);
                  setShowQuizDetailModal(false);
                }}
              >
                {t("taskAssignment.selectQuiz")}
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
            <h2 className="task-quiz-filter-title">
              {t("taskAssignment.filterQuizzes")}
            </h2>
            <button
              className="task-quiz-filter-close"
              onClick={() => setShowQuizFilterModal(false)}
            >
              <IonIcon icon={closeOutline} />
            </button>
          </div>

          {/* Sort Order */}
          <div className="task-quiz-filter-section">
            <h3 className="task-quiz-filter-section-title">
              {t("taskAssignment.sortBy")}
            </h3>
            <div className="task-quiz-sort-buttons">
              <button
                className={`task-quiz-sort-btn ${
                  tempSortOrder === "newest" ? "active" : ""
                }`}
                onClick={() => setTempSortOrder("newest")}
              >
                {t("taskAssignment.newestFirst")}
              </button>
              <button
                className={`task-quiz-sort-btn ${
                  tempSortOrder === "oldest" ? "active" : ""
                }`}
                onClick={() => setTempSortOrder("oldest")}
              >
                {t("taskAssignment.oldestFirst")}
              </button>
            </div>
          </div>

          {/* Grade Filter */}
          <div className="task-quiz-filter-section">
            <h3 className="task-quiz-filter-section-title">
              {t("taskAssignment.gradeFilter")}
            </h3>
            <div className="task-quiz-grade-chips">
              <div
                className={`task-quiz-grade-chip ${
                  tempFilterGrade === null ? "active" : ""
                }`}
                onClick={() => setTempFilterGrade(null)}
              >
                {t("taskAssignment.all")}
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
              {t("taskAssignment.topics")}{" "}
              {tempFilterTopics.length > 0 && `(${tempFilterTopics.length})`}
            </h3>
            <IonSearchbar
              className="task-quiz-topic-search"
              value={topicSearch}
              onIonInput={(e) => setTopicSearch(e.detail.value || "")}
              placeholder="Search topics..."
            />
            <div className="task-quiz-topic-grid">
              {Array.from(new Set(quizzes.flatMap((q) => q.topics)))
                .sort()
                .filter((t) =>
                  t.toLowerCase().includes(topicSearch.toLowerCase()),
                )
                .map((topic) => (
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
              {quizzes.length === 0 && (
                <div className="task-no-topics">No topics found.</div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="task-quiz-filter-buttons">
            <button
              className="task-modal-btn cancel"
              onClick={clearQuizFilters}
            >
              {t("taskAssignment.clearAll")}
            </button>
            <button className="task-modal-btn save" onClick={applyQuizFilters}>
              {t("taskAssignment.applyFilters")}
            </button>
          </div>
        </div>
      </IonModal>
    </IonPage>
  );
};

export default EditAssignment;
