import React, { useState, useEffect, useRef } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonButton,
  IonText,
  IonIcon,
  IonMenuButton,
  IonSelect,
  IonSelectOption
} from '@ionic/react';
import { 
  chevronBack, 
  chevronForward, 
  arrowForward, 
  play,
  school,
  book,
  warning,
  calculator,
  flask,
  leaf,
  language,
  brush,
  globe,
  code,
  fitness
} from 'ionicons/icons';
import './Main_Est.css';

const Main_Est: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [overallPerformance, setOverallPerformance] = useState(78);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedClass, setSelectedClass] = useState('Class A');
  const [selectedSection, setSelectedSection] = useState('Section 1');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [topics, setTopics] = useState<any[]>([]);
  const [challengingTopics, setChallengingTopics] = useState<any[]>([]);
  
  // Referencias para el swipe
  const carouselTrackRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const isDraggingRef = useRef(false);

  // Iconos por materia
  const subjectIcons: { [key: string]: any } = {
    'Mathematics': calculator,
    'Physics': flask,
    'Chemistry': flask,
    'Biology': leaf,
    'English': language,
    'History': history,
    'Geography': globe,
    'Art': brush,
    'Computer Science': code,
    'Physical Education': fitness
  };

  // Datos de temas por materia
  const subjectTopics: { [key: string]: Array<{ name: string; percentage: number }> } = {
    'Mathematics': [
      { name: 'Algebra', percentage: 85 },
      { name: 'Geometry', percentage: 65 },
      { name: 'Calculus', percentage: 45 },
      { name: 'Statistics', percentage: 78 },
      { name: 'Trigonometry', percentage: 92 },
      { name: 'Probability', percentage: 60 }
    ],
    'Physics': [
      { name: 'Mechanics', percentage: 78 },
      { name: 'Thermodynamics', percentage: 62 },
      { name: 'Electromagnetism', percentage: 55 },
      { name: 'Optics', percentage: 70 },
      { name: 'Quantum Physics', percentage: 40 },
      { name: 'Waves', percentage: 75 }
    ],
    'Chemistry': [
      { name: 'Organic Chemistry', percentage: 68 },
      { name: 'Inorganic Chemistry', percentage: 72 },
      { name: 'Physical Chemistry', percentage: 58 },
      { name: 'Analytical Chemistry', percentage: 65 },
      { name: 'Biochemistry', percentage: 52 },
      { name: 'Nuclear Chemistry', percentage: 45 }
    ],
    'Biology': [
      { name: 'Cell Biology', percentage: 82 },
      { name: 'Genetics', percentage: 70 },
      { name: 'Ecology', percentage: 75 },
      { name: 'Anatomy', percentage: 68 },
      { name: 'Physiology', percentage: 62 },
      { name: 'Evolution', percentage: 58 }
    ],
    'English': [
      { name: 'Grammar', percentage: 88 },
      { name: 'Literature', percentage: 72 },
      { name: 'Writing', percentage: 65 },
      { name: 'Reading', percentage: 80 },
      { name: 'Vocabulary', percentage: 75 },
      { name: 'Speaking', percentage: 60 }
    ],
    'History': [
      { name: 'Ancient History', percentage: 70 },
      { name: 'Medieval History', percentage: 65 },
      { name: 'Modern History', percentage: 58 },
      { name: 'World Wars', percentage: 72 },
      { name: 'Civil Rights', percentage: 68 },
      { name: 'Economic History', percentage: 55 }
    ],
    'Geography': [
      { name: 'Physical Geography', percentage: 75 },
      { name: 'Human Geography', percentage: 68 },
      { name: 'Climate Studies', percentage: 62 },
      { name: 'Geopolitics', percentage: 58 },
      { name: 'Cartography', percentage: 70 },
      { name: 'Environmental Geography', percentage: 65 }
    ],
    'Art': [
      { name: 'Drawing Techniques', percentage: 82 },
      { name: 'Color Theory', percentage: 78 },
      { name: 'Art History', percentage: 65 },
      { name: 'Sculpture', percentage: 60 },
      { name: 'Digital Art', percentage: 72 },
      { name: 'Perspective', percentage: 68 }
    ],
    'Music': [
      { name: 'Music Theory', percentage: 75 },
      { name: 'Instrument Practice', percentage: 70 },
      { name: 'Music History', percentage: 65 },
      { name: 'Composition', percentage: 58 },
      { name: 'Ear Training', percentage: 62 },
      { name: 'Performance', percentage: 68 }
    ],
    'Computer Science': [
      { name: 'Programming', percentage: 80 },
      { name: 'Algorithms', percentage: 72 },
      { name: 'Data Structures', percentage: 65 },
      { name: 'Web Development', percentage: 78 },
      { name: 'Database Systems', percentage: 70 },
      { name: 'Networking', percentage: 62 }
    ],
    'Physical Education': [
      { name: 'Team Sports', percentage: 85 },
      { name: 'Individual Sports', percentage: 78 },
      { name: 'Fitness Training', percentage: 72 },
      { name: 'Anatomy & Physiology', percentage: 65 },
      { name: 'Nutrition', percentage: 68 },
      { name: 'Sports Psychology', percentage: 60 }
    ]
  };

  // Rendimiento general por materia
  const subjectPerformance: { [key: string]: number } = {
    'Mathematics': 78,
    'Physics': 65,
    'Chemistry': 62,
    'Biology': 72,
    'English': 75,
    'History': 68,
    'Geography': 70,
    'Art': 74,
    'Music': 66,
    'Computer Science': 73,
    'Physical Education': 76
  };

  // Consejos de mejora por materia
  const improvementTips: { [key: string]: string } = {
    'Mathematics': 'Focus on practicing problems daily and review fundamental concepts',
    'Physics': 'Work on understanding the underlying principles before solving problems',
    'Chemistry': 'Memorize key formulas and practice balancing equations regularly',
    'Biology': 'Create visual diagrams and use flashcards for terminology',
    'English': 'Read extensively and practice writing essays with proper structure',
    'History': 'Create timelines and connect events to understand historical context',
    'Geography': 'Study maps regularly and relate physical features to human activities',
    'Art': 'Practice basic techniques daily and study different art styles',
    'Music': 'Consistent practice and ear training exercises will help significantly',
    'Computer Science': 'Code daily and work on understanding algorithms step by step',
    'Physical Education': 'Focus on proper form and gradually increase intensity'
  };

  // Opciones para los selectores
  const classes = ['Class A', 'Class B', 'Class C', 'Class D'];
  const sections = ['Section 1', 'Section 2', 'Section 3'];
  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
    'History', 'Geography', 'Art', 'Music', 'Computer Science', 'Physical Education'
  ];

  // Función para obtener clase de color según porcentaje
  const getPerformanceClass = (percentage: number) => {
    if (percentage >= 80) return 'excellent';
    if (percentage >= 70) return 'good';
    if (percentage >= 60) return 'average';
    return 'poor';
  };

  // Función para obtener temas desafiantes (los 3 con menor porcentaje)
  const getChallengingTopics = (topicsList: any[]) => {
    return topicsList
      .filter(topic => topic.percentage < 70) // Solo temas con menos del 70%
      .sort((a, b) => a.percentage - b.percentage) // Ordenar de menor a mayor
      .slice(0, 3); // Tomar los 3 más difíciles
  };

  // Función para obtener nivel de dificultad
  const getDifficultyLevel = (percentage: number) => {
    if (percentage < 50) return 'High';
    if (percentage < 60) return 'Medium-High';
    return 'Medium';
  };

  // Actualizar topics cuando cambia la materia
  useEffect(() => {
    const currentTopics = subjectTopics[selectedSubject] || [];
    setTopics(currentTopics);
    setOverallPerformance(subjectPerformance[selectedSubject] || 75);
    setChallengingTopics(getChallengingTopics(currentTopics));
    setCurrentSlide(0); // Resetear carrusel al cambiar materia
  }, [selectedSubject]);

  const handlePreviousWeek = () => {
    if (currentWeek > 1) {
      setCurrentWeek(currentWeek - 1);
    }
  };

  const handleNextWeek = () => {
    if (currentWeek < 12) {
      setCurrentWeek(currentWeek + 1);
    }
  };

  const handlePreviousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleNextSlide = () => {
    const slidesNeeded = Math.ceil(topics.length / 2);
    if (currentSlide < slidesNeeded - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePractice = () => {
    console.log(`Starting practice for ${selectedSubject}`);
  };

  // Calcular total de slides (2 tarjetas por slide)
  const totalSlides = Math.ceil(topics.length / 2);

  // Handlers para swipe
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

  // Handlers para mouse (desktop)
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
            <IonMenuButton slot="start" />
            {/* Selectores en el header */}
            <div className="header-selectors">
              <IonSelect
                value={selectedClass}
                placeholder="Class"
                onIonChange={(e) => setSelectedClass(e.detail.value)}
                interface="action-sheet"
                className="class-select"
              >
                {classes.map((classItem, index) => (
                  <IonSelectOption key={index} value={classItem}>
                    {classItem}
                  </IonSelectOption>
                ))}
              </IonSelect>
              
              <IonSelect
                value={selectedSection}
                placeholder="Section"
                onIonChange={(e) => setSelectedSection(e.detail.value)}
                interface="action-sheet"
                className="section-select"
              >
                {sections.map((section, index) => (
                  <IonSelectOption key={index} value={section}>
                    {section}
                  </IonSelectOption>
                ))}
              </IonSelect>
              
              <IonSelect
                value={selectedSubject}
                placeholder="Subject"
                onIonChange={(e) => setSelectedSubject(e.detail.value)}
                interface="action-sheet"
                className="subject-select"
              >
                {subjects.map((subject, index) => (
                  <IonSelectOption key={index} value={subject}>
                    {subject}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen class="main-est-content">
        <div className="dashboard-container">
          
          {/* Header con selector de semana - COLOR VERDE */}
          <div className="week-selector-section">
            <div className="week-selector">
              <IonButton 
                fill="clear" 
                className="week-nav-button"
                onClick={handlePreviousWeek}
                disabled={currentWeek === 1}
              >
                <IonIcon icon={chevronBack} />
              </IonButton>
              
              <div className="week-display">
                <IonText>
                  <h2 className="week-title">Week {currentWeek}</h2>
                  <p className="section-info">{selectedClass} - {selectedSection}</p>
                </IonText>
              </div>
              
              <IonButton 
                fill="clear" 
                className="week-nav-button"
                onClick={handleNextWeek}
                disabled={currentWeek === 12}
              >
                <IonIcon icon={chevronForward} />
              </IonButton>
            </div>
          </div>

          {/* Tarjeta de My Performance */}
          <IonCard className="performance-card">
            <IonCardContent>
              <div className="performance-header">
                <IonText>
                  <h3 className="subject-title">{selectedSubject}</h3>
                  <p className="performance-label">My Performance</p>
                </IonText>
              </div>
              
              <div className="performance-content">
                <div className="ring-chart-container">
                  <div 
                    className={`ring-chart ${getPerformanceClass(overallPerformance)}`}
                    style={{
                      '--percentage': `${overallPerformance}%`
                    } as React.CSSProperties}
                  >
                    <div className="ring-chart-inner">
                      <IonText>
                        <h2 className="performance-percentage">{overallPerformance}%</h2>
                      </IonText>
                    </div>
                  </div>
                </div>
                
                <IonButton 
                  fill="clear" 
                  className="review-button"
                >
                  Review details <IonIcon icon={arrowForward} slot="end" />
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Performance por Tema - CARRUSEL CON SWIPE */}
          <div className="topics-section">
            <IonText>
              <h3 className="section-title">Performance by Topic</h3>
            </IonText>
            
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
                        {topics.slice(slideIndex * 2, slideIndex * 2 + 2).map((topic, index) => (
                          <IonCard key={index} className="topic-card">
                            <IonCardContent>
                              <div className="topic-header">
                                <IonIcon icon={subjectIcons[selectedSubject] || book} className="topic-icon" />
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
                    
                    <span className="carousel-indicator">
                      {currentSlide + 1} / {totalSlides}
                    </span>
                    
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

          {/* Sección Challenging Topics - COLOR VERDE */}
          <div className="challenging-topics-section">
            <IonText>
              <h3 className="section-title">Challenging Topics</h3>
            </IonText>
            
            <IonCard className="challenging-topics-card">
              <IonCardContent>
                <div className="challenging-topics-header">
                  <IonIcon icon={warning} className="challenging-topics-icon" />
                  <IonText>
                    <h4 className="challenging-topics-title">Areas Needing Improvement</h4>
                  </IonText>
                </div>
                
                <div className="challenging-content">
                  {challengingTopics.length > 0 ? (
                    <>
                      {challengingTopics.map((topic, index) => (
                        <div key={index}>
                          <div className="challenging-topic-item">
                            <IonIcon icon={warning} className="topic-warning-icon" />
                            <div className="topic-difficulty-info">
                              <IonText>
                                <h5 className="topic-difficulty-name">{topic.name}</h5>
                                <p className="topic-difficulty-percentage">
                                  Current performance: {topic.percentage}%
                                </p>
                              </IonText>
                            </div>
                            <div className="topic-difficulty-badge">
                              {getDifficultyLevel(topic.percentage)}
                            </div>
                          </div>
                          {index === 0 && ( // Mostrar consejo solo para el tema más difícil
                            <p className="improvement-tip">
                              💡 {improvementTips[selectedSubject]}
                            </p>
                          )}
                        </div>
                      ))}
                    </>
                  ) : (
                    <IonText>
                      <p className="topic-difficulty-percentage" style={{ textAlign: 'center', padding: '20px' }}>
                        Great job! You're performing well in all topics. Keep up the good work! 🎉
                      </p>
                    </IonText>
                  )}
                </div>
              </IonCardContent>
            </IonCard>
          </div>

          {/* Botón Practice - COLOR VERDE OSCURO */}
          <div className="practice-section">
            <IonButton 
              expand="block" 
              className="practice-button"
              onClick={handlePractice}
            >
              <IonIcon icon={play} slot="start" />
              Practice {selectedSubject}
            </IonButton>
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Main_Est;