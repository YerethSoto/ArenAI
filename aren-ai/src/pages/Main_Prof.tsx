import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonButton,
  IonIcon,
  IonMenuButton,
  useIonRouter,
} from '@ionic/react';
import {
  chevronBack,
  chevronForward,
  menu,
  calculator,
  flask,
  globe,
  language,
  trendingUp,
  alertCircle,
  bulb,
  homeOutline,
  peopleOutline,
  add,
  chatbubblesOutline,
  personOutline
} from 'ionicons/icons';
import './Main_Prof.css'; // Ensure this CSS is updated next
import ProfessorMenu from '../components/ProfessorMenu';
import { useTranslation } from 'react-i18next';

// Mapping for icons
const SUBJECT_ICONS: { [key: string]: string } = {
  'Math': calculator,
  'Science': flask,
  'SocialStudies': globe,
  'Spanish': language
};

const getPerformanceClass = (percentage: number) => {
  if (percentage >= 80) return 'excellent';
  if (percentage >= 70) return 'good';
  if (percentage >= 60) return 'average';
  return 'poor';
};

const getRingChartColor = (percentage: number) => {
  if (percentage >= 80) return '#4CAF50';
  if (percentage >= 70) return '#90beab';
  if (percentage >= 60) return '#FFC107';
  return '#F44336';
};

const Main_Prof: React.FC = () => {
  const router = useIonRouter();
  const { t } = useTranslation();
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [overallPerformance, setOverallPerformance] = useState(82);
  const [selectedGrade, setSelectedGrade] = useState('7');
  const [selectedSection, setSelectedSection] = useState('1');
  const [selectedSubject, setSelectedSubject] = useState('Math');
  const [topics, setTopics] = useState<any[]>([]);

  // Construct Weeks Data dynamically from i18n
  const weeksData = [
    { number: 1, name: t('professor.dashboard.weeks.week1') },
    { number: 2, name: t('professor.dashboard.weeks.week2') },
    { number: 3, name: t('professor.dashboard.weeks.week3') },
    { number: 4, name: t('professor.dashboard.weeks.week4') },
    { number: 5, name: t('professor.dashboard.weeks.week5') },
    { number: 6, name: t('professor.dashboard.weeks.week6') },
    { number: 7, name: t('professor.dashboard.weeks.week7') },
    { number: 8, name: t('professor.dashboard.weeks.week8') },
    { number: 9, name: t('professor.dashboard.weeks.week9') },
    { number: 10, name: t('professor.dashboard.weeks.week10') },
    { number: 11, name: t('professor.dashboard.weeks.week11') },
    { number: 12, name: t('professor.dashboard.weeks.week12') },
  ];

  // Dummy Data Generators using i18n keys for topics
  const getSubjectTopics = (subject: string) => {
    switch (subject) {
      case 'Math':
        return [
          { name: t('professor.dashboard.topics.Algebra'), percentage: 85 },
          { name: t('professor.dashboard.topics.Geometry'), percentage: 65 },
          { name: t('professor.dashboard.topics.Calculus'), percentage: 45 },
          { name: t('professor.dashboard.topics.Statistics'), percentage: 78 },
          { name: t('professor.dashboard.topics.Trigonometry'), percentage: 92 },
          { name: t('professor.dashboard.topics.Probability'), percentage: 60 },
          { name: t('professor.dashboard.topics.LinearEq'), percentage: 72 },
          { name: t('professor.dashboard.topics.Functions'), percentage: 68 }
        ];
      case 'Science':
        return [
          { name: t('professor.dashboard.topics.Biology'), percentage: 75 },
          { name: t('professor.dashboard.topics.Chemistry'), percentage: 62 },
          { name: t('professor.dashboard.topics.Physics'), percentage: 58 },
          { name: t('professor.dashboard.topics.EarthSci'), percentage: 81 },
          { name: t('professor.dashboard.topics.Astronomy'), percentage: 67 },
          { name: t('professor.dashboard.topics.EnvSci'), percentage: 73 }
        ];
      case 'Social Studies': // Matching the key used in state
        return [
          { name: t('professor.dashboard.topics.History'), percentage: 70 },
          { name: t('professor.dashboard.topics.Geography'), percentage: 65 },
          { name: t('professor.dashboard.topics.Civics'), percentage: 78 },
          { name: t('professor.dashboard.topics.Economics'), percentage: 55 },
          { name: t('professor.dashboard.topics.Culture'), percentage: 82 },
          { name: t('professor.dashboard.topics.Govt'), percentage: 68 }
        ];
      case 'Spanish':
        return [
          { name: t('professor.dashboard.topics.Vocab'), percentage: 80 },
          { name: t('professor.dashboard.topics.Grammar'), percentage: 65 },
          { name: t('professor.dashboard.topics.Reading'), percentage: 72 },
          { name: t('professor.dashboard.topics.Writing'), percentage: 58 },
          { name: t('professor.dashboard.topics.Speaking'), percentage: 75 },
          { name: t('professor.dashboard.topics.Listening'), percentage: 70 }
        ];
      default:
        return [];
    }
  };


  useEffect(() => {
    const newTopics = getSubjectTopics(selectedSubject);
    setTopics(newTopics);

    // Calculate average
    if (newTopics.length > 0) {
      const sum = newTopics.reduce((acc, curr) => acc + curr.percentage, 0);
      setOverallPerformance(Math.round(sum / newTopics.length));
    } else {
      setOverallPerformance(0);
    }

  }, [selectedSubject, t]); // Re-run when subject or language changes

  const currentWeek = weeksData[currentWeekIndex];

  // Dynamic Insights
  // Needs mapping for "Social Studies" vs key in JSON if there's a mismatch. 
  // In JSON "SocialStudies" (no space). In state 'Social Studies' (space).
  const getInsightKey = (subject: string) => {
    if (subject === 'Social Studies') return 'SocialStudies';
    return subject;
  }

  const subjectKey = getInsightKey(selectedSubject);

  const currentEnforceText = t(`professor.dashboard.insights.enforce.${subjectKey}`, 'No insight available.');
  const currentClassRecommendation = t(`professor.dashboard.insights.recommendation.${subjectKey}`, 'No recommendation available.');


  const handlePreviousWeek = () => {
    if (currentWeekIndex > 0) setCurrentWeekIndex(currentWeekIndex - 1);
  };

  const handleNextWeek = () => {
    if (currentWeekIndex < weeksData.length - 1) setCurrentWeekIndex(currentWeekIndex + 1);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <div className="header-content">
            <IonMenuButton slot="start" className="menu-button enlarged-menu">
              <IonIcon icon={menu} />
            </IonMenuButton>

            <div className="header-center">
              <ProfessorMenu
                selectedGrade={selectedGrade}
                selectedSection={selectedSection}
                selectedSubject={selectedSubject}
                onGradeChange={setSelectedGrade}
                onSectionChange={setSelectedSection}
                onSubjectChange={setSelectedSubject}
              />
            </div>

            <div className="header-brand">
              <div className="brand-text">
                <div className="arenai">ArenAI</div>
                <div className="teacher">Teacher</div>
              </div>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen class="main-prof-content">
        <div className="dashboard-container">

          {/* 1. Overview Section Card */}
          <div className="prof-card performance-overview-card">
            <div className="performance-info">
              {/* Translate Subject Name if possible, or just display. Since state is 'Math', 'Science' we can try to translate. */}
              <span className="subject-badge">
                {t(`professor.subjects.${subjectKey}`, selectedSubject)} • {selectedGrade}-{selectedSection}
              </span>
              <h1 className="performance-headline">{overallPerformance}% {t('professor.dashboard.performance')}</h1>
              <p className="performance-subtext">
                {t('professor.dashboard.average')} <strong>+3%</strong> {t('professor.dashboard.compared')}.
              </p>

              <div className="week-nav-minimal">
                <IonButton fill="clear" size="small" className="week-nav-btn" onClick={handlePreviousWeek} disabled={currentWeekIndex === 0}>
                  <IonIcon icon={chevronBack} />
                </IonButton>
                <div className="week-nav-text">{currentWeek.name}</div>
                <IonButton fill="clear" size="small" className="week-nav-btn" onClick={handleNextWeek} disabled={currentWeekIndex === weeksData.length - 1}>
                  <IonIcon icon={chevronForward} />
                </IonButton>
              </div>
            </div>

            {/* Same Ring Chart Structure as Student/Original but Minimalist */}
            <div className="circle-wrapper">
              <div
                className="performance-ring-chart"
                style={{
                  '--percentage': `${overallPerformance}%`,
                  '--ring-color': getRingChartColor(overallPerformance)
                } as React.CSSProperties}
              >
                <div className="ring-center">
                  <h2 className="performance-percentage">{overallPerformance}%</h2>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Topic Breakdown (Scrollable) */}
          <div className="topics-section">
            <div className="prof-card-header" style={{ border: 'none', paddingLeft: 0 }}>
              <h3 className="prof-card-title">
                <IonIcon icon={trendingUp} color="primary" /> {t('professor.dashboard.classTopics')}
              </h3>
            </div>

            <div className="topics-scroll-container">
              {topics.map((topic, index) => (
                <div key={index} className="topic-mini-card">
                  <div className="topic-mini-header">{topic.name}</div>
                  <div className={`topic-mini-stat ${getPerformanceClass(topic.percentage)}`}>
                    {topic.percentage}%
                  </div>
                  <div className="mini-progress">
                    <div
                      className="mini-progress-bar"
                      style={{
                        width: `${topic.percentage}%`,
                        backgroundColor: getRingChartColor(topic.percentage)
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Insights Grid */}
          <div className="insights-grid">
            <div className="prof-card">
              <div className="prof-card-header">
                <h3 className="prof-card-title">
                  <IonIcon icon={bulb} /> {t('professor.dashboard.excellentProgress')}
                </h3>
              </div>
              <div className="prof-card-content">
                <div className="insight-content">
                  <div className="insight-text-box">
                    <p>{currentClassRecommendation}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="prof-card">
              <div className="prof-card-header">
                <h3 className="prof-card-title">
                  <IonIcon icon={alertCircle} /> {t('professor.dashboard.needsAttention')}
                </h3>
              </div>
              <div className="prof-card-content">
                <div className="insight-content">
                  <div className="insight-text-box">
                    <p>{currentEnforceText}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </IonContent>

      {/* Professor Bottom Navigation */}
      <div className="prof-bottom-nav">
        <div className="prof-nav-btn active">
          <IonIcon icon={homeOutline} />
          <span className="nav-label">{t('sidebar.mainMenu')}</span>
        </div>
        <div className="prof-nav-btn" onClick={() => router.push('/student-section')}>
          <IonIcon icon={peopleOutline} />
          <span className="nav-label">{t('professor.sidebar.students')}</span>
        </div>

        <div className="prof-nav-fab-container">
          <div className="prof-nav-fab" onClick={() => router.push('/create-task')}>
            <IonIcon icon={add} />
          </div>
        </div>

        <div className="prof-nav-btn" onClick={() => router.push('/professor-chat')}>
          <IonIcon icon={chatbubblesOutline} />
          <span className="nav-label">{t('sidebar.chat')}</span>
        </div>
        <div className="prof-nav-btn" onClick={() => router.push('/professor-profile')}>
          <IonIcon icon={personOutline} />
          <span className="nav-label">{t('sidebar.account')}</span>
        </div>
      </div>
    </IonPage>
  );
};

export default Main_Prof;
