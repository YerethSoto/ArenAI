import React, { useState, useEffect, useRef } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonButton,
  IonText,
  IonIcon,
  IonMenuButton,
  useIonRouter,
} from '@ionic/react';
import {
  chevronBack,
  chevronForward,
  menu,
  calculator,
  bulb,
  flask,
  globe,
  language,
  trendingUp,
  alertCircle,
  school,
  homeOutline,
  peopleOutline,
  add,
  chatbubblesOutline,
  personOutline
} from 'ionicons/icons';
import './Main_Prof.css';
import ProfessorMenu from '../components/ProfessorMenu';
import { useTranslation } from 'react-i18next';

// Week data
const WEEKS_DATA = [
  { number: 1, name: "Week 1 - Algebraic Foundations" },
  { number: 2, name: "Week 2 - Functions and Graphs" },
  { number: 3, name: "Week 3 - Geometry Basics" },
  { number: 4, name: "Week 4 - Advanced Geometry" },
  { number: 5, name: "Week 5 - Trigonometry" },
  { number: 6, name: "Week 6 - Statistics & Probability" },
  { number: 7, name: "Week 7 - Calculus Introduction" },
  { number: 8, name: "Week 8 - Advanced Calculus" },
  { number: 9, name: "Week 9 - Number Theory" },
  { number: 10, name: "Week 10 - Mathematical Logic" },
  { number: 11, name: "Week 11 - Review & Applications" },
  { number: 12, name: "Week 12 - Final Projects" }
];

const SUBJECT_TOPICS = {
  'Math': [
    { name: 'Algebra', percentage: 85 },
    { name: 'Geometry', percentage: 65 },
    { name: 'Calculus', percentage: 45 },
    { name: 'Statistics', percentage: 78 },
    { name: 'Trigonometry', percentage: 92 },
    { name: 'Probability', percentage: 60 },
    { name: 'Linear Equations', percentage: 72 },
    { name: 'Functions', percentage: 68 }
  ],
  'Science': [
    { name: 'Biology', percentage: 75 },
    { name: 'Chemistry', percentage: 62 },
    { name: 'Physics', percentage: 58 },
    { name: 'Earth Science', percentage: 81 },
    { name: 'Astronomy', percentage: 67 },
    { name: 'Environmental Science', percentage: 73 }
  ],
  'Social Studies': [
    { name: 'History', percentage: 70 },
    { name: 'Geography', percentage: 65 },
    { name: 'Civics', percentage: 78 },
    { name: 'Economics', percentage: 55 },
    { name: 'Culture', percentage: 82 },
    { name: 'Government', percentage: 68 }
  ],
  'Spanish': [
    { name: 'Vocabulary', percentage: 80 },
    { name: 'Grammar', percentage: 65 },
    { name: 'Reading', percentage: 72 },
    { name: 'Writing', percentage: 58 },
    { name: 'Speaking', percentage: 75 },
    { name: 'Listening', percentage: 70 }
  ]
};

const ENFORCE_TOPICS_TEXT = {
  'Math': 'Focus on improving student performance in mathematics. Use targeted exercises and additional practice materials to reinforce understanding and build confidence in challenging areas like calculus and probability.',
  'Science': 'Enhance science comprehension through hands-on experiments and real-world applications. Students need more practice with physics concepts and chemical reactions.',
  'Social Studies': 'Improve historical analysis and geographical understanding. Incorporate more primary source analysis and map reading activities to build critical thinking skills.',
  'Spanish': 'Strengthen language acquisition through immersive activities. Focus on conversational practice and grammar reinforcement to improve overall fluency.'
};

const CLASS_RECOMMENDATIONS = {
  'Math': 'Focus on practicing quadratic equations with real-world examples. Consider using visual aids to help students understand the graphical representation of equations.',
  'Science': 'Incorporate hands-on experiments to help students visualize scientific concepts. Use real-world examples to make the material more engaging and relatable.',
  'Social Studies': 'Use interactive timelines and maps to help students understand historical context. Encourage discussions about current events to make connections with past events.',
  'Spanish': 'Practice conversational Spanish through role-playing activities. Incorporate multimedia resources like videos and songs to improve listening comprehension.'
};

const SUBJECT_ICONS = {
  'Math': calculator,
  'Science': flask,
  'Social Studies': globe,
  'Spanish': language
};

const calculateOverallPerformance = (topics: Array<{ name: string, percentage: number }>) => {
  if (!topics || topics.length === 0) return 75;
  const sum = topics.reduce((total, topic) => total + topic.percentage, 0);
  return Math.round(sum / topics.length);
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

  const currentWeek = WEEKS_DATA[currentWeekIndex];

  useEffect(() => {
    const newTopics = SUBJECT_TOPICS[selectedSubject as keyof typeof SUBJECT_TOPICS] || [];
    setTopics(newTopics);
    const newPerformance = calculateOverallPerformance(newTopics);
    setOverallPerformance(newPerformance);
  }, [selectedSubject]);

  const currentEnforceText = ENFORCE_TOPICS_TEXT[selectedSubject as keyof typeof ENFORCE_TOPICS_TEXT] || '';
  const currentClassRecommendation = CLASS_RECOMMENDATIONS[selectedSubject as keyof typeof CLASS_RECOMMENDATIONS] || '';
  const currentSubjectIcon = SUBJECT_ICONS[selectedSubject as keyof typeof SUBJECT_ICONS] || calculator;

  const handlePreviousWeek = () => {
    if (currentWeekIndex > 0) setCurrentWeekIndex(currentWeekIndex - 1);
  };

  const handleNextWeek = () => {
    if (currentWeekIndex < WEEKS_DATA.length - 1) setCurrentWeekIndex(currentWeekIndex + 1);
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
              <span className="subject-badge">{selectedSubject} • {selectedGrade}-{selectedSection}</span>
              <h1 className="performance-headline">{overallPerformance}% {t('professor.dashboard.performance')}</h1>
              <p className="performance-subtext">
                {t('professor.dashboard.average')} <strong>+3%</strong> {t('professor.dashboard.compared')}.
              </p>

              <div className="week-nav-minimal">
                <IonButton fill="clear" size="small" className="week-nav-btn" onClick={handlePreviousWeek} disabled={currentWeekIndex === 0}>
                  <IonIcon icon={chevronBack} />
                </IonButton>
                <div className="week-nav-text">{currentWeek.name}</div>
                <IonButton fill="clear" size="small" className="week-nav-btn" onClick={handleNextWeek} disabled={currentWeekIndex === WEEKS_DATA.length - 1}>
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
        <div className="prof-nav-btn">
          <IonIcon icon={peopleOutline} />
          <span className="nav-label">{t('professor.sidebar.students')}</span>
        </div>

        <div className="prof-nav-fab-container">
          <div className="prof-nav-fab">
            <IonIcon icon={add} />
          </div>
        </div>

        <div className="prof-nav-btn">
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