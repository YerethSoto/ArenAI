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
  add,
  school,
  book,
  bulb,
  calculator,
  flask,
  leaf,
  language,
  brush,
  globe,
  code,
  fitness
} from 'ionicons/icons';
import './Main_Prof.css';

const Main_Prof: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [overallPerformance, setOverallPerformance] = useState(78);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedClass, setSelectedClass] = useState('Class A');
  const [selectedSection, setSelectedSection] = useState('Section 1');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [topics, setTopics] = useState<any[]>([]);
  
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

  // Datos de temas por materia (más temas para hacer carrusel)
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

  // Recomendaciones para la clase
  const classRecommendations: { [key: string]: string } = {
    'Mathematics': 'Focus on practicing quadratic equations with real-world examples. Consider using visual aids to help students understand the graphical representation of equations.',
    'Physics': 'Incorporate hands-on experiments with Newton\'s laws. Use simple demonstrations with everyday objects to make concepts more tangible.',
    'Chemistry': 'Plan a lab session for chemical reactions. Prepare safety guidelines and ensure all materials are ready for practical learning.',
    'Biology': 'Use microscope activities to explore cell structures. Prepare slides in advance and create comparison charts for different cell types.',
    'English': 'Organize group discussions about the assigned reading. Prepare discussion questions that encourage critical thinking and analysis.',
    'History': 'Create interactive timelines for historical events. Use primary sources and documents to make history come alive for students.',
    'Geography': 'Incorporate map-reading exercises and case studies of different regions. Use multimedia resources to show diverse landscapes.',
    'Art': 'Set up different art stations with various mediums. Encourage creative expression while teaching fundamental techniques.',
    'Music': 'Combine theory with practical instrument sessions. Use listening exercises to develop musical appreciation.',
    'Computer Science': 'Provide hands-on coding exercises with immediate feedback. Use real-world projects to demonstrate practical applications.',
    'Physical Education': 'Mix team sports with individual fitness activities. Focus on both skill development and health education.'
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

  // Función para obtener color del ring chart
  const getRingChartColor = (percentage: number) => {
    if (percentage >= 80) return '#4CAF50';
    if (percentage >= 70) return '#90beab';
    if (percentage >= 60) return '#FFC107';
    return '#F44336';
  };

  // Actualizar topics cuando cambia la materia
  useEffect(() => {
    setTopics(subjectTopics[selectedSubject] || []);
    setOverallPerformance(subjectPerformance[selectedSubject] || 75);
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

  const handleCreateQuiz = () => {
    console.log(`Creating quiz for ${selectedSubject}`);
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
    const threshold = 50; // mínimo de pixels para cambiar slide
    
    if (carouselTrackRef.current) {
      carouselTrackRef.current.style.cursor = 'grab';
      carouselTrackRef.current.style.transition = 'transform 0.3s ease';
      carouselTrackRef.current.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
    
    if (diff > threshold && currentSlide < totalSlides - 1) {
      // Swipe izquierda - siguiente slide
      handleNextSlide();
    } else if (diff < -threshold && currentSlide > 0) {
      // Swipe derecha - slide anterior
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

      <IonContent fullscreen class="main-prof-content">
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

          {/* Tarjeta de Overall Performance */}
          <IonCard className="performance-card">
            <IonCardContent>
              <div className="performance-header">
                <IonText>
                  <h3 className="subject-title">{selectedSubject}</h3>
                  <p className="performance-label">Overall Performance</p>
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

          {/* Sección Enforce Topics - COLOR VERDE */}
          <div className="enforce-section">
            <IonText>
              <h3 className="section-title">Enforce Topics</h3>
            </IonText>
            
            <IonCard className="enforce-card">
              <IonCardContent>
                <div className="enforce-content">
                  <IonIcon icon={school} className="enforce-icon" />
                  <IonText>
                    <p className="enforce-text">
                      Focus on improving student performance in {selectedSubject.toLowerCase()}. 
                      Use targeted exercises and additional practice materials to 
                      reinforce understanding and build confidence in challenging areas.
                    </p>
                  </IonText>
                </div>
              </IonCardContent>
            </IonCard>
          </div>

          {/* Sección Today's Class - COLOR VERDE */}
          <div className="todays-class-section">
            <IonText>
              <h3 className="section-title">Today's Class</h3>
            </IonText>
            
            <IonCard className="class-card">
              <IonCardContent>
                <div className="class-header">
                  <IonIcon icon={bulb} className="class-icon" />
                  <IonText>
                    <h4 className="class-title">Teaching Recommendation</h4>
                  </IonText>
                </div>
                
                <IonText>
                  <p className="class-recommendation">
                    {classRecommendations[selectedSubject]}
                  </p>
                </IonText>
              </IonCardContent>
            </IonCard>
          </div>

          {/* Botón Create Quiz - COLOR VERDE OSCURO */}
          <div className="quiz-section">
            <IonButton 
              expand="block" 
              className="create-quiz-button"
              onClick={handleCreateQuiz}
            >
              <IonIcon icon={add} slot="start" />
              Create Quiz for {selectedSubject}
            </IonButton>
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Main_Prof;