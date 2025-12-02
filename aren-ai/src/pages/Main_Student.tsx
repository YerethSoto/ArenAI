import React, { useState, useEffect, useRef } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonButton,
  IonText,
  IonIcon,
  IonMenuButton,
  IonSelect,
  IonSelectOption,
  IonPopover
} from '@ionic/react';
import { 
  chevronBack, 
  chevronForward, 
  person,
  menu,
  school,
  chevronDown,
  calculator,
  bulb,
  arrowForward,
  book,
  flask,
  globe,
  language
} from 'ionicons/icons';
import './Main_Student.css';
import StudentSidebar from '../components/StudentSidebar';
import StudentMenu from '../components/StudentMenu';

// ============================================================================
// DATA VARIABLES - These will be replaced with API calls later
// ============================================================================

// Week data - This will come from API
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

// Subject topics data - This will come from API
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

// Study recommendations text - This will come from API
const STUDY_RECOMMENDATIONS_TEXT = {
  'Math': 'Focus on improving your performance in mathematics. Use targeted exercises and additional practice materials to reinforce understanding and build confidence in challenging areas like calculus and probability.',
  'Science': 'Enhance science comprehension through hands-on experiments and real-world applications. You need more practice with physics concepts and chemical reactions.',
  'Social Studies': 'Improve historical analysis and geographical understanding. Incorporate more primary source analysis and map reading activities to build critical thinking skills.',
  'Spanish': 'Strengthen language acquisition through immersive activities. Focus on conversational practice and grammar reinforcement to improve overall fluency.'
};

// Learning recommendations - This will come from API
const LEARNING_RECOMMENDATIONS = {
  'Math': 'Focus on practicing quadratic equations with real-world examples. Consider using visual aids to help understand the graphical representation of equations.',
  'Science': 'Try hands-on experiments to help visualize scientific concepts. Use real-world examples to make the material more engaging and relatable.',
  'Social Studies': 'Use interactive timelines and maps to understand historical context. Connect current events with past events to see patterns.',
  'Spanish': 'Practice conversational Spanish through role-playing activities. Incorporate multimedia resources like videos and songs to improve listening comprehension.'
};

// Subject icons - This will come from API
const SUBJECT_ICONS = {
  'Math': calculator,
  'Science': flask,
  'Social Studies': globe,
  'Spanish': language
};

// ============================================================================
// HELPER FUNCTIONS - These will remain the same
// ============================================================================

const calculateOverallPerformance = (topics: Array<{name: string, percentage: number}>) => {
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Main_Student: React.FC = () => {
  // State variables
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [overallPerformance, setOverallPerformance] = useState(82);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedGrade, setSelectedGrade] = useState('7');
  const [selectedSection, setSelectedSection] = useState('1');
  const [selectedSubject, setSelectedSubject] = useState('Math');
  const [topics, setTopics] = useState<any[]>([]);
  
  // Refs for carousel
  const carouselTrackRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const isDraggingRef = useRef(false);

  // Get current week data from variables
  const currentWeek = WEEKS_DATA[currentWeekIndex];

  // Update topics and overall performance when subject changes
  useEffect(() => {
    const newTopics = SUBJECT_TOPICS[selectedSubject as keyof typeof SUBJECT_TOPICS] || [];
    setTopics(newTopics);
    const newPerformance = calculateOverallPerformance(newTopics);
    setOverallPerformance(newPerformance);
    setCurrentSlide(0);
  }, [selectedSubject]);

  // Get current study recommendation and learning recommendation from variables
  const currentStudyRecommendation = STUDY_RECOMMENDATIONS_TEXT[selectedSubject as keyof typeof STUDY_RECOMMENDATIONS_TEXT] || '';
  const currentLearningRecommendation = LEARNING_RECOMMENDATIONS[selectedSubject as keyof typeof LEARNING_RECOMMENDATIONS] || '';
  const currentSubjectIcon = SUBJECT_ICONS[selectedSubject as keyof typeof SUBJECT_ICONS] || book;

  // Week navigation handlers
  const handlePreviousWeek = () => {
    if (currentWeekIndex > 0) {
      setCurrentWeekIndex(currentWeekIndex - 1);
    }
  };

  const handleNextWeek = () => {
    if (currentWeekIndex < WEEKS_DATA.length - 1) {
      setCurrentWeekIndex(currentWeekIndex + 1);
    }
  };

  // Carousel handlers
  const handlePreviousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleNextSlide = () => {
    const slidesNeeded = Math.ceil(topics.length / 3);
    if (currentSlide < slidesNeeded - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePracticeTopics = () => {
    console.log(`Starting practice for ${selectedSubject}`);
  };

  const totalSlides = Math.ceil(topics.length / 3);

  // Carousel swipe handlers (unchanged)
  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    isDraggingRef.current = true;
    if (carouselTrackRef.current) {
      carouselTrackRef.current.style.cursor = 'grabbing';
      carouselTrackRef.current.style.transition = 'none';
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    
    currentXRef.current = e.touches[0].clientX;
    const diff = startXRef.current - currentXRef.current;
    
    if (carouselTrackRef.current) {
      carouselTrackRef.current.style.transform = `translateX(calc(-${currentSlide * 100}% - ${diff}px))`;
    }
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current) return;
    
    isDraggingRef.current = false;
    const diff = startXRef.current - currentXRef.current;
    const threshold = 50;
    
    if (carouselTrackRef.current) {
      carouselTrackRef.current.style.cursor = 'grab';
      carouselTrackRef.current.style.transition = 'transform 0.3s ease';
      carouselTrackRef.current.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
    
    if (diff > threshold && currentSlide < totalSlides - 1) {
      handleNextSlide();
    } else if (diff < -threshold && currentSlide > 0) {
      handlePreviousSlide();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startXRef.current = e.clientX;
    isDraggingRef.current = true;
    if (carouselTrackRef.current) {
      carouselTrackRef.current.style.cursor = 'grabbing';
      carouselTrackRef.current.style.transition = 'none';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    
    currentXRef.current = e.clientX;
    const diff = startXRef.current - currentXRef.current;
    
    if (carouselTrackRef.current) {
      carouselTrackRef.current.style.transform = `translateX(calc(-${currentSlide * 100}% - ${diff}px))`;
    }
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    
    isDraggingRef.current = false;
    const diff = startXRef.current - currentXRef.current;
    const threshold = 50;
    
    if (carouselTrackRef.current) {
      carouselTrackRef.current.style.cursor = 'grab';
      carouselTrackRef.current.style.transition = 'transform 0.3s ease';
      carouselTrackRef.current.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
    
    if (diff > threshold && currentSlide < totalSlides - 1) {
      handleNextSlide();
    } else if (diff < -threshold && currentSlide > 0) {
      handlePreviousSlide();
    }
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
        <StudentMenu
          selectedSubject={selectedSubject}
          onSubjectChange={setSelectedSubject}
        />
      </div>
      
      <div className="header-brand">
        <div className="brand-text">
          <div className="arenai">ArenAI</div>
          <div className="student">Student</div>
        </div>
      </div>
    </div>
  </IonToolbar>
</IonHeader>





      

      <IonContent fullscreen class="main-student-content">
        <div className="dashboard-container">
          
          {/* Week Selector Section */}
          <div className="week-selector-section">
            <div className="week-selector">
              <IonButton 
                fill="clear" 
                className="week-nav-button"
                onClick={handlePreviousWeek}
                disabled={currentWeekIndex === 0}
              >
                <IonIcon icon={chevronBack} />
              </IonButton>
              
              <div className="week-display">
                <IonText>
                  <h2 className="week-title">{currentWeek.name}</h2>
                  <p className="section-info">Grade {selectedGrade} - Section {selectedSection}</p>
                </IonText>
              </div>
              
              <IonButton 
                fill="clear" 
                className="week-nav-button"
                onClick={handleNextWeek}
                disabled={currentWeekIndex === WEEKS_DATA.length - 1}
              >
                <IonIcon icon={chevronForward} />
              </IonButton>
            </div>
          </div>

          {/* Overall Performance Section */}
          <div className="performance-container-new">
            <div className="performance-background">
              <div className="performance-content-wrapper">
                <div className="performance-text-content">
                  <div className="subject-pill-new">
                    <IonText>
                      <h3 className="subject-name-new">{selectedSubject}</h3>
                    </IonText>
                  </div>
                  <IonText>
                    <p className="performance-label-new">My Overall Performance</p>
                  </IonText>
                  <IonButton 
                    fill="clear" 
                    className="review-button-new"
                  >
                    View details <IonIcon icon={arrowForward} slot="end" />
                  </IonButton>
                </div>
                
                <div className="performance-chart-content">
                  <div className="circle-wrapper">
                    <div 
                      className="performance-ring-chart"
                      style={{
                        '--percentage': `${overallPerformance}%`,
                        '--ring-color': getRingChartColor(overallPerformance)
                      } as React.CSSProperties}
                    >
                      <div className="ring-center">
                        <IonText>
                          <h2 className="performance-percentage">{overallPerformance}%</h2>
                        </IonText>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance by Topic Section */}
          <div className="topics-section">
            <div className="section-header">
              <IonText>
                <h3 className="section-title">My Performance by Topic</h3>
              </IonText>
              {totalSlides > 1 && (
                <div className="carousel-indicator-large">
                  {currentSlide + 1} / {totalSlides}
                </div>
              )}
            </div>
            
            {topics.length > 0 ? (
              <>
                <div className="topics-carousel-container">
                  <div 
                    ref={carouselTrackRef}
                    className="carousel-track" 
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                      <div key={slideIndex} className="carousel-slide">
                        {topics.slice(slideIndex * 3, slideIndex * 3 + 3).map((topic, index) => (
                          <IonCard key={`${slideIndex}-${index}`} className="topic-card">
                            <IonCardContent>
                              <div className="topic-header">
                                <IonIcon icon={currentSubjectIcon} className="topic-icon" />
                                <IonText>
                                  <h4 className="topic-name">{topic.name}</h4>
                                </IonText>
                              </div>
                              
                              <div className="topic-progress">
                                <IonText>
                                  <p className={`topic-percentage ${getPerformanceClass(topic.percentage)}`}>
                                    {topic.percentage}%
                                  </p>
                                </IonText>
                                <div className="topic-progress-bar-container">
                                  <div 
                                    className={`topic-progress-bar ${getPerformanceClass(topic.percentage)}`}
                                    style={{ width: `${topic.percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            </IonCardContent>
                          </IonCard>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                
                {totalSlides > 1 && (
                  <div className="carousel-controls">
                    <IonButton 
                      fill="clear" 
                      size="small"
                      className="carousel-button"
                      onClick={handlePreviousSlide}
                      disabled={currentSlide === 0}
                    >
                      <IonIcon icon={chevronBack} />
                    </IonButton>
                    
                    <IonButton 
                      fill="clear" 
                      size="small"
                      className="carousel-button"
                      onClick={handleNextSlide}
                      disabled={currentSlide === totalSlides - 1}
                    >
                      <IonIcon icon={chevronForward} />
                    </IonButton>
                  </div>
                )}
              </>
            ) : (
              <IonCard className="no-topics-card">
                <IonCardContent>
                  <IonText>
                    <p className="no-topics-text">No topics available for {selectedSubject}</p>
                  </IonText>
                </IonCardContent>
              </IonCard>
            )}
          </div>

          {/* Study Recommendations Section */}
          <div className="study-section">
            <IonText>
              <h3 className="section-title">Study Recommendations</h3>
            </IonText>
            
            <IonCard className="study-card">
              <IonCardContent>
                <div className="study-content">
                  <IonIcon icon={person} className="study-icon" />
                  <IonText>
                    <p className="study-text">
                      {currentStudyRecommendation}
                    </p>
                  </IonText>
                </div>
              </IonCardContent>
            </IonCard>
          </div>

          {/* Today's Learning Section */}
          <div className="todays-learning-section">
            <IonText>
              <h3 className="section-title">Today's Learning</h3>
            </IonText>
            
            <IonCard className="learning-card">
              <IonCardContent>
                <div className="learning-header">
                  <IonIcon icon={bulb} className="learning-icon" />
                  <IonText>
                    <h4 className="learning-title">Learning Recommendation</h4>
                  </IonText>
                </div>
                
                <IonText>
                  <p className="learning-recommendation">
                    {currentLearningRecommendation}
                  </p>
                </IonText>
              </IonCardContent>
            </IonCard>
          </div>

          

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Main_Student;