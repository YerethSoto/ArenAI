import React, { useState, useEffect, useRef } from "react";
import {
  IonContent,
  IonPage,
  IonIcon,
  IonMenuButton,
  IonText,
  useIonRouter,
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

// ============================================================================
// DATA VARIABLES
// ============================================================================

const WEEKS_DATA = [
  { number: 1, nameKey: "mainStudent.weeks.week1" },
  { number: 2, nameKey: "mainStudent.weeks.week2" },
  { number: 3, nameKey: "mainStudent.weeks.week3" },
  { number: 4, nameKey: "mainStudent.weeks.week4" },
  { number: 5, nameKey: "mainStudent.weeks.week5" },
  { number: 6, nameKey: "mainStudent.weeks.week6" },
  { number: 7, nameKey: "mainStudent.weeks.week7" },
  { number: 8, nameKey: "mainStudent.weeks.week8" },
  { number: 9, nameKey: "mainStudent.weeks.week9" },
  { number: 10, nameKey: "mainStudent.weeks.week10" },
  { number: 11, nameKey: "mainStudent.weeks.week11" },
  { number: 12, nameKey: "mainStudent.weeks.week12" },
];

const SUBJECT_TOPICS = {
  Math: [
    { nameKey: "mainStudent.topics.Algebra", percentage: 85, icon: "∑" },
    { nameKey: "mainStudent.topics.Geometry", percentage: 45, icon: "📐" },
    { nameKey: "mainStudent.topics.Calculus", percentage: 92, icon: "∫" },
    { nameKey: "mainStudent.topics.Statistics", percentage: 60, icon: "📊" },
    { nameKey: "mainStudent.topics.Trigonometry", percentage: 78, icon: "📐" },
    { nameKey: "mainStudent.topics.Probability", percentage: 55, icon: "🎲" },
    { nameKey: "mainStudent.topics.LinearEq", percentage: 72, icon: "x" },
    { nameKey: "mainStudent.topics.Functions", percentage: 68, icon: "f(x)" },
  ],
  Science: [
    { nameKey: "mainStudent.topics.Biology", percentage: 75, icon: "🧬" },
    { nameKey: "mainStudent.topics.Chemistry", percentage: 62, icon: "🧪" },
    { nameKey: "mainStudent.topics.Physics", percentage: 58, icon: "⚛️" },
    { nameKey: "mainStudent.topics.EarthSci", percentage: 81, icon: "🌍" },
    { nameKey: "mainStudent.topics.Astronomy", percentage: 67, icon: "🔭" },
    { nameKey: "mainStudent.topics.EnvSci", percentage: 73, icon: "🌱" },
  ],
  "Social Studies": [
    { nameKey: "mainStudent.topics.History", percentage: 70, icon: "📜" },
    { nameKey: "mainStudent.topics.Geography", percentage: 65, icon: "🗺️" },
    { nameKey: "mainStudent.topics.Civics", percentage: 78, icon: "⚖️" },
    { nameKey: "mainStudent.topics.Economics", percentage: 55, icon: "💰" },
    { nameKey: "mainStudent.topics.Culture", percentage: 82, icon: "🎭" },
    { nameKey: "mainStudent.topics.Govt", percentage: 68, icon: "🏛️" },
  ],
  Spanish: [
    { nameKey: "mainStudent.topics.Vocab", percentage: 80, icon: "🗣️" },
    { nameKey: "mainStudent.topics.Grammar", percentage: 65, icon: "📝" },
    { nameKey: "mainStudent.topics.Reading", percentage: 72, icon: "📖" },
    { nameKey: "mainStudent.topics.Writing", percentage: 58, icon: "✍️" },
    { nameKey: "mainStudent.topics.Speaking", percentage: 75, icon: "🎤" },
    { nameKey: "mainStudent.topics.Listening", percentage: 70, icon: "👂" },
  ],
};

const STUDY_RECOMMENDATIONS_TEXT = {
  Math: "Focus on improving your performance in mathematics. Use targeted exercises and additional practice materials to reinforce understanding and build confidence in challenging areas like calculus and probability.",
  Science:
    "Enhance science comprehension through hands-on experiments and real-world applications. You need more practice with physics concepts and chemical reactions.",
  "Social Studies":
    "Improve historical analysis and geographical understanding. Incorporate more primary source analysis and map reading activities to build critical thinking skills.",
  Spanish:
    "Strengthen language acquisition through immersive activities. Focus on conversational practice and grammar reinforcement to improve overall fluency.",
};

const STUDENT_QUESTIONS = [
  "How do I calculate the area under a curve using integrals?",
  "What is the difference between a derivative and an integral?",
  "Can you explain the chain rule again?",
  "When should I use the quadratic formula?",
  "What are the applications of trigonometry in real life?",
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const calculateOverallPerformance = (
  topics: Array<{ nameKey: string; percentage: number }>
) => {
  if (!topics || topics.length === 0) return 75;
  const sum = topics.reduce((total, topic) => total + topic.percentage, 0);
  return Math.round(sum / topics.length);
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Main_Student: React.FC = () => {
  const router = useIonRouter();
  const { t } = useTranslation();

  // State variables
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [overallPerformance, setOverallPerformance] = useState(82);
  const [selectedSubject, setSelectedSubject] = useState("Math");
  const [topics, setTopics] = useState<any[]>([]);

  // New State for Redesign
  const [viewMode, setViewMode] = useState<"rec" | "que">("rec");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Get current week data
  const currentWeek = WEEKS_DATA[currentWeekIndex];

  // Update topics and overall performance when subject changes
  useEffect(() => {
    const newTopics =
      SUBJECT_TOPICS[selectedSubject as keyof typeof SUBJECT_TOPICS] || [];
    setTopics(newTopics);
    const newPerformance = calculateOverallPerformance(newTopics);
    setOverallPerformance(newPerformance);
  }, [selectedSubject]);

  const currentStudyRecommendation =
    STUDY_RECOMMENDATIONS_TEXT[
    selectedSubject as keyof typeof STUDY_RECOMMENDATIONS_TEXT
    ] || "";

  // Handlers
  const handlePreviousWeek = () => {
    if (currentWeekIndex > 0) setCurrentWeekIndex(currentWeekIndex - 1);
  };

  const handleNextWeek = () => {
    if (currentWeekIndex < WEEKS_DATA.length - 1)
      setCurrentWeekIndex(currentWeekIndex + 1);
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prev) => (prev + 1) % STUDENT_QUESTIONS.length);
  };

  const handlePrevQuestion = () => {
    setCurrentQuestionIndex(
      (prev) => (prev - 1 + STUDENT_QUESTIONS.length) % STUDENT_QUESTIONS.length
    );
  };

  const navigateTo = (path: string) => {
    router.push(path, "forward", "push");
  };

  // Helper to get subject translation key
  const getSubjectKey = (subject: string) => {
    // Remove spaces for key lookup if needed, but our keys match simple names mostly
    const keyMap: { [key: string]: string } = {
      Math: "Math",
      Science: "Science",
      "Social Studies": "SocialStudies",
      Spanish: "Spanish",
    };
    return `mainStudent.subjects.${keyMap[subject] || subject}`;
  };

  return (
    <IonPage className="main-student-page">
      {/* Replaced Header with Component */}
      <StudentHeader
        showSubject={true}
        selectedSubject={selectedSubject}
        onSubjectChange={setSelectedSubject}
      />

      <IonContent fullscreen class="main-student-content">
        <div className="ms-container">
          {/* Calendar Selector */}
          <div className="ms-week-selector">
            <CalendarSelector
              onDateSelect={(date: any) => console.log("Selected date:", date)}
              title={t("mainStudent.classSchedule") || "Class Schedule"}
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
                  onClick={() => navigateTo(`/subject/${selectedSubject}`)}
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
                    <div className="ms-topic-icon">{topic.icon || "•"}</div>
                  </div>
                  <span className="ms-topic-label">{t(topic.nameKey)}</span>
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
                    viewMode === "rec" ? "translateX(0)" : "translateX(100%)",
                }}
              ></div>
              <div
                className={`ms-switch-option ${viewMode === "rec" ? "active" : ""
                  }`}
                onClick={() => setViewMode("rec")}
              >
                {t("mainStudent.recommendations")}
              </div>
              <div
                className={`ms-switch-option ${viewMode === "que" ? "active" : ""
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
                      {STUDENT_QUESTIONS[currentQuestionIndex]}
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
        </div>
      </IonContent>

      {/* Bottom Navigation */}
      <div className="ms-bottom-nav">
        <div className="ms-nav-btn" onClick={() => navigateTo("/page/student")}>
          <IonIcon icon={homeOutline} />
        </div>
        <div className="ms-nav-btn" onClick={() => navigateTo("/quiz")}>
          <IonIcon icon={trophyOutline} />
        </div>

        <div className="ms-mascot-container">
          <AnimatedMascot
            openSrc="/assets/profile_picture_capybara_eyes_open.png"
            closedSrc="/assets/profile_picture_capybara_eyes_closed.png"
            winkSrc="/assets/profile_picture_capybara_wink.png"
            className="ms-mascot-image"
            onClick={() => navigateTo("/profile")}
          />
        </div>

        <div className="ms-nav-btn" onClick={() => navigateTo("/battleminigame")}>
          <IonIcon icon={americanFootballOutline} />
        </div>
        <div className="ms-nav-btn" onClick={() => navigateTo("/settings")}>
          <IonIcon icon={settingsOutline} />
        </div>
      </div>
    </IonPage>
  );
};

export default Main_Student;
