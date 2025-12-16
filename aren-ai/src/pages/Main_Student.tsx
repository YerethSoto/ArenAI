import React, { useState, useEffect, useRef } from "react";
import { useAvatar } from "../context/AvatarContext";
import {
  IonContent,
  IonPage,
  IonIcon,
  IonMenuButton,
  IonText,
  useIonRouter,
  IonSkeletonText,
} from "@ionic/react";
import {
  calculator,
  flask,
  globe,
  language,
  book,
  trophyOutline,
  chatbubbleEllipsesOutline,
  settingsOutline,
  homeOutline,
  americanFootballOutline,
} from "ionicons/icons";
import { useTranslation } from "react-i18next";
import "./Main_Student.css";
import StudentMenu from "../components/StudentMenu";
import StudentHeader from "../components/StudentHeader";
import AnimatedMascot from "../components/AnimatedMascot";
import { CalendarSelector } from "../components/CalendarSelector";
import { studentService } from "../services/studentService";
import { TopicProgress, WeekData } from "../types/student";
import { getSubjectKey } from "../utils/subjectUtils";
import PageTransition from "../components/PageTransition";

// ============================================================================
// COMPONENT
// ============================================================================

const Main_Student: React.FC = () => {
  const router = useIonRouter();
  const { t } = useTranslation();
  const { getAvatarAssets } = useAvatar();
  const avatarAssets = getAvatarAssets();

  // State
  const [weeks, setWeeks] = useState<WeekData[]>([]);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [overallPerformance, setOverallPerformance] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState(() => {
    return localStorage.getItem("selectedSubject") || "Math";
  });
  const [topics, setTopics] = useState<TopicProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New State for Redesign
  const [viewMode, setViewMode] = useState<"rec" | "que">("rec");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Persist selectedSubject
  useEffect(() => {
    localStorage.setItem("selectedSubject", selectedSubject);
  }, [selectedSubject]);

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [fetchedWeeks, fetchedStats] = await Promise.all([
          studentService.getWeeks(),
          studentService.getStudentStats(),
        ]);
        setWeeks(fetchedWeeks);
        // Stats can be used if we want global performance
      } catch (error) {
        console.error("Failed to fetch initial data", error);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // Update topics and overall performance when subject changes
  useEffect(() => {
    const fetchSubjectData = async () => {
      // Don't set full loading here to avoid screen flickering,
      // maybe just a small loading indicator or skeleton on the list if needed.
      // For now we'll do a quick fetch.
      const subjectData = await studentService.getSubjectDetails(
        selectedSubject
      );
      setTopics(subjectData.topics);

      const newPerformance = calculateOverallPerformance(subjectData.topics);
      setOverallPerformance(newPerformance);
    };

    fetchSubjectData();
  }, [selectedSubject]);

  // Helper Functions
  const calculateOverallPerformance = (currentTopics: TopicProgress[]) => {
    if (!currentTopics || currentTopics.length === 0) return 0;
    const sum = currentTopics.reduce(
      (total, topic) => total + topic.percentage,
      0
    );
    return Math.round(sum / currentTopics.length);
  };

  // Helper for color interpolation (Red to Teal)
  const getColorForPercentage = (percentage: number) => {
    const p = Math.max(0, Math.min(100, percentage)) / 100;

    // Interpolate between Red (#FF5252) and Teal (#78B8B0)
    const startColor = { r: 255, g: 82, b: 82 }; // Red
    const endColor = { r: 120, g: 184, b: 176 }; // #78B8B0

    const r = Math.round(startColor.r + (endColor.r - startColor.r) * p);
    const g = Math.round(startColor.g + (endColor.g - startColor.g) * p);
    const b = Math.round(startColor.b + (endColor.b - startColor.b) * p);

    return `rgb(${r}, ${g}, ${b})`;
  };

  const currentStudyRecommendation = t(
    `mainStudent.recommendationsText.${selectedSubject}` // Simplified using logic that keys match unless mapped, but we use map below
  );

  const questionKeys = ["q1", "q2", "q3", "q4", "q5"];
  const currentQuestion = t(
    `mainStudent.studentQuestions.${questionKeys[currentQuestionIndex]}`
  );

  // Handlers
  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prev) => (prev + 1) % 5);
  };

  const handlePrevQuestion = () => {
    setCurrentQuestionIndex((prev) => (prev - 1 + 5) % 5);
  };

  const navigateTo = (path: string) => {
    router.push(path, "forward", "push");
  };

  return (
    <IonPage className="main-student-page">
      {/* Replaced Header with Component */}
      <StudentHeader
        showSubject={true}
        selectedSubject={selectedSubject}
        onSubjectChange={setSelectedSubject}
      />

      <IonContent fullscreen class="student-page-content">
        <PageTransition variant="fade">
          <div className="ms-container">
            {/* Skeleton Loader for Main Content */}
            {isLoading ? (
              <div style={{ padding: "20px" }}>
                <IonSkeletonText
                  animated
                  style={{
                    width: "100%",
                    height: "50px",
                    borderRadius: "12px",
                    marginBottom: "20px",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "30px",
                  }}
                >
                  <IonSkeletonText
                    animated
                    style={{
                      width: "40%",
                      height: "30px",
                      borderRadius: "20px",
                    }}
                  />
                  <IonSkeletonText
                    animated
                    style={{
                      width: "70px",
                      height: "70px",
                      borderRadius: "50%",
                    }}
                  />
                </div>
                <IonSkeletonText
                  animated
                  style={{
                    width: "100%",
                    height: "120px",
                    borderRadius: "15px",
                  }}
                />
              </div>
            ) : (
              <>
                {/* Calendar Selector */}
                <div className="ms-week-selector">
                  <CalendarSelector
                    onDateSelect={(date: any) =>
                      console.log("Selected date:", date)
                    }
                    title={t("Clase prototipo") || "Class Schedule"}
                  />
                </div>

                {/* Stats Row: Subject + Grade */}
                <div className="ms-stats-row">
                  <div className="ms-your-math-pill">
                    {t("mainStudent.yourSubject", {
                      subject: t(getSubjectKey(selectedSubject)),
                    })}
                  </div>
                  <div
                    className="ms-progress-circle"
                    style={{
                      border: `6px solid ${getColorForPercentage(
                        overallPerformance
                      )}`,
                      boxShadow: `inset 0 0 0 3px white`, // White inner outline
                      color: "white",
                      width: "70px",
                      height: "70px",
                      borderRadius: "50%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontWeight: "bold",
                      fontSize: "18px",
                      backgroundColor: "var(--ion-color-secondary)",
                    }}
                  >
                    {overallPerformance}%
                  </div>
                </div>

                {/* Topics Grid (Swipeable) */}
                <div className="ms-topics-scroll-container">
                  <div className="ms-topics-track">
                    {topics.map((topic, index) => (
                      <div
                        key={index}
                        className="ms-topic-btn"
                        onClick={() =>
                          navigateTo(`/subject/${selectedSubject}`)
                        }
                      >
                        <div className="ms-topic-fill-box">
                          <div
                            className="ms-topic-fill"
                            style={{
                              height: `${topic.percentage}%`,
                              backgroundColor:
                                topic.percentage < 60 ? "#FFC107" : "#78B8B0",
                            }}
                          ></div>
                          <div className="ms-topic-icon">
                            {topic.icon || "•"}
                          </div>
                        </div>
                        <span className="ms-topic-label">
                          {t(topic.nameKey)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Section (Switch + Content) */}
                <div className="ms-bottom-section">
                  <div className="ms-switch-container">
                    <div
                      className="ms-switch-bg"
                      style={{
                        transform:
                          viewMode === "rec"
                            ? "translateX(0)"
                            : "translateX(100%)",
                      }}
                    ></div>
                    <div
                      className={`ms-switch-option ${
                        viewMode === "rec" ? "active" : ""
                      }`}
                      onClick={() => setViewMode("rec")}
                    >
                      {t("mainStudent.recommendations")}
                    </div>
                    <div
                      className={`ms-switch-option ${
                        viewMode === "que" ? "active" : ""
                      }`}
                      onClick={() => setViewMode("que")}
                    >
                      {t("mainStudent.questions")}
                    </div>
                  </div>

                  <div className="ms-info-display">
                    {viewMode === "rec" ? (
                      <>
                        <div className="ms-info-title">
                          {t("mainStudent.studyRecommendation")}
                        </div>
                        <div className="ms-info-content">
                          {currentStudyRecommendation}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="ms-info-title">
                          {t("mainStudent.popularQuestions")}
                        </div>
                        <div className="ms-question-carousel">
                          <div
                            className="ms-carousel-arrow"
                            onClick={handlePrevQuestion}
                          >
                            &lt;
                          </div>
                          <div
                            className="ms-info-content"
                            style={{ padding: "0 10px" }}
                          >
                            {currentQuestion}
                          </div>
                          <div
                            className="ms-carousel-arrow"
                            onClick={handleNextQuestion}
                          >
                            &gt;
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </PageTransition>
      </IonContent>

      {/* Bottom Navigation */}
      <div className="student-bottom-nav">
        <div
          className="student-nav-btn"
          onClick={() => navigateTo("/page/student")}
        >
          <IonIcon icon={homeOutline} />
        </div>
        <div className="student-nav-btn" onClick={() => navigateTo("/quiz")}>
          <IonIcon icon={trophyOutline} />
        </div>

        <div className="student-mascot-container">
          <AnimatedMascot
            openSrc={avatarAssets.open}
            closedSrc={avatarAssets.closed}
            winkSrc={avatarAssets.wink}
            className="student-mascot-image"
            onClick={() => navigateTo("/chat")}
          />
        </div>

        <div
          className="student-nav-btn"
          onClick={() => navigateTo("/battlelobby")}
        >
          <IonIcon icon={americanFootballOutline} />
        </div>
        <div
          className="student-nav-btn"
          onClick={() => navigateTo("/settings")}
        >
          <IonIcon icon={settingsOutline} />
        </div>
      </div>
    </IonPage>
  );
};

export default Main_Student;
