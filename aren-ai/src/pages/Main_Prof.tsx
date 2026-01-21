import React, { useState, useEffect } from "react";
import { useAvatar } from "../context/AvatarContext";
import {
  IonContent,
  IonPage,
  IonIcon,
  IonHeader,
  IonToolbar,
  IonMenuButton,
  useIonRouter,
} from "@ionic/react";
import {
  calculator,
  menu,
  chatbubbleEllipsesOutline,
  settingsOutline,
  clipboardOutline,
  analyticsOutline,
  chevronBackOutline,
  chevronForwardOutline,
  libraryOutline,
} from "ionicons/icons";
import "./Main_Prof.css";
import "../components/ProfessorHeader.css";
import ProfessorMenu from "../components/ProfessorMenu";
import { useProfessorFilters } from "../hooks/useProfessorFilters";
import { useTranslation } from "react-i18next";
import { getApiUrl } from "../config/api";
import AnimatedMascot from "../components/AnimatedMascot";
import { CalendarSelector } from "../components/CalendarSelector";
import { TopicProgress } from "../types/student";
import PageTransition from "../components/PageTransition";

const Main_Prof: React.FC = () => {
  const router = useIonRouter();
  const { t } = useTranslation();
  const { getAvatarAssets } = useAvatar();
  const avatarAssets = getAvatarAssets();

  const {
    selectedGrade,
    setSelectedGrade,
    selectedSection,
    setSelectedSection,
    selectedSubject,
    setSelectedSubject,
  } = useProfessorFilters();
  const [topics, setTopics] = useState<TopicProgress[]>([]);
  const [overallPerformance, setOverallPerformance] = useState(0);
  const [viewMode, setViewMode] = useState<"rec" | "que">("rec");

  useEffect(() => {
    const fetchTopicsFromAPI = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const userStr = localStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;
        const userId = user?.id;

        if (userId) {
          // Try to fetch topic progress from API
          const response = await fetch(
            getApiUrl(`api/students/${userId}/progress`),
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          );

          if (response.ok) {
            const progressData = await response.json();
            // Filter by selected subject and transform
            const subjectTopics = progressData
              .filter((p: any) =>
                p.subject_name
                  .toLowerCase()
                  .includes(selectedSubject.toLowerCase()),
              )
              .map((p: any) => ({
                name: t(
                  `professor.dashboard.topics.${p.topic_name}`,
                  p.topic_name,
                ),
                nameKey: p.topic_name,
                percentage: p.score || 0,
                icon: "📚", // Default icon for API data
              }));

            if (subjectTopics.length > 0) {
              setTopics(subjectTopics);
              const sum = subjectTopics.reduce(
                (acc: number, curr: any) => acc + curr.percentage,
                0,
              );
              setOverallPerformance(Math.round(sum / subjectTopics.length));
              return;
            }
          }
        }
      } catch (err) {
        console.error("Error fetching topics from API:", err);
        // No fallback - just leave empty
        setTopics([]);
        setOverallPerformance(0);
      }
    };

    fetchTopicsFromAPI();
  }, [selectedSubject, t]); // Re-run when subject or language changes

  // Dynamic Insights
  // Needs mapping for "Social Studies" vs key in JSON if there's a mismatch.
  // In JSON "SocialStudies" (no space). In state 'Social Studies' (space).
  const getInsightKey = (subject: string) => {
    if (subject === "Social Studies") return "SocialStudies";
    return subject;
  };

  const subjectKey = getInsightKey(selectedSubject);

  const currentEnforceText = t(
    `professor.dashboard.insights.enforce.${subjectKey}`,
    "No insight available.",
  );
  const currentClassRecommendation = t(
    `professor.dashboard.insights.recommendation.${subjectKey}`,
    "No recommendation available.",
  );

  const navigateTo = (path: string) => router.push(path);

  const getColorForPercentage = (p: number) => {
    const ratio = Math.max(0, Math.min(100, p)) / 100;
    const r = Math.round(255 + (120 - 255) * ratio);
    const g = Math.round(82 + (184 - 82) * ratio);
    const b = Math.round(82 + (176 - 82) * ratio);
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <IonPage className="main-student-page">
      <IonHeader className="professor-header-container">
        <IonToolbar color="primary" className="professor-toolbar">
          <div className="ph-content">
            <IonMenuButton className="ph-menu-btn">
              <IonIcon icon={menu} />
            </IonMenuButton>
          </div>
        </IonToolbar>

        {/* Brand / Title - Outside Toolbar for Z-Index control */}
        <div className="ph-brand-container-absolute">
          <div className="ph-brand-name">ArenAI</div>
          <div className="ph-brand-sub">Professor</div>
        </div>

        {/* Notch with three dropdowns */}
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
      <IonContent fullscreen className="student-page-content">
        <PageTransition variant="fade">
          <div className="ms-container">
            <div className="ms-week-selector">
              <CalendarSelector
                onDateSelect={() => {}}
                title={t("professor.dashboard.classSchedule")}
              />
            </div>
            <div className="ms-stats-row">
              <div className="ms-your-math-pill">
                {t("professor.dashboard.yourClass", {
                  subject: t(
                    "professor.dashboard.subjects." +
                      selectedSubject.replace(/\s+/g, ""),
                  ),
                })}
              </div>
              <div
                className="ms-progress-circle"
                style={{
                  border: `6px solid ${getColorForPercentage(
                    overallPerformance,
                  )}`,
                  boxShadow: "inset 0 0 0 3px white",
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
            <div className="ms-topics-scroll-container">
              <div className="ms-topics-track">
                {topics.map((topic, i) => (
                  <div key={i} className="ms-topic-btn">
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
                        <IonIcon icon={calculator} />
                      </div>
                    </div>
                    <span className="ms-topic-label">{topic.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="ms-bottom-section">
              <div className="ms-switch-container">
                <div
                  className={`ms-switch-option ${
                    viewMode === "rec" ? "active" : ""
                  }`}
                  onClick={() => setViewMode("rec")}
                >
                  {t("professor.dashboard.recommendations")}
                </div>
                <div
                  className={`ms-switch-option ${
                    viewMode === "que" ? "active" : ""
                  }`}
                  onClick={() => setViewMode("que")}
                >
                  {t("professor.dashboard.questions")}
                </div>
                <div
                  className="ms-switch-bg"
                  style={{
                    transform:
                      viewMode === "que" ? "translateX(100%)" : "translateX(0)",
                  }}
                />
              </div>
              <div className="ms-info-display">
                {viewMode === "rec" ? (
                  <>
                    <div className="ms-info-title">
                      {t("professor.dashboard.studyRecommendation")}
                    </div>
                    <div className="ms-info-content">
                      Focus on reinforcing {selectedSubject} fundamentals with
                      your class.
                    </div>
                  </>
                ) : (
                  <>
                    <div className="ms-info-title">
                      {t("professor.dashboard.popularQuestions")}
                    </div>
                    <div className="ms-question-carousel">
                      <IonIcon
                        icon={chevronBackOutline}
                        className="ms-carousel-arrow"
                        onClick={() => {}}
                      />
                      <div className="ms-info-content">
                        How can I better explain concepts to my students?
                      </div>
                      <IonIcon
                        icon={chevronForwardOutline}
                        className="ms-carousel-arrow"
                        onClick={() => {}}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </PageTransition>
      </IonContent>
      <div className="student-bottom-nav">
        <div
          className="student-nav-btn"
          onClick={() => navigateTo("/chat-menu")}
        >
          <IonIcon icon={chatbubbleEllipsesOutline} />
        </div>
        <div
          className="student-nav-btn"
          onClick={() => navigateTo("/page/quiz-menu")}
        >
          <IonIcon icon={libraryOutline} />
        </div>
        <div className="student-mascot-container">
          <AnimatedMascot
            openSrc={avatarAssets.open}
            closedSrc={avatarAssets.closed}
            winkSrc={avatarAssets.wink}
            className="student-mascot-btn"
            onClick={() => navigateTo("/professor-chat")}
          />
        </div>
        <div
          className="student-nav-btn"
          onClick={() => navigateTo("/page/ai-quiz-generator")}
        >
          <IonIcon icon={clipboardOutline} />
        </div>
        <div
          className="student-nav-btn"
          onClick={() => navigateTo("/professor-settings")}
        >
          <IonIcon icon={settingsOutline} />
        </div>
      </div>
    </IonPage>
  );
};

export default Main_Prof;
