import React, { useState, useEffect } from 'react';
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
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonMenuButton,
  IonProgressBar,
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
  time,
  caretForward,
  caretBack
} from 'ionicons/icons';
import './Main_Prof.css';

const Main_Prof: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [overallPerformance, setOverallPerformance] = useState(78);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedGrade, setSelectedGrade] = useState('10th Grade');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [topics, setTopics] = useState<any[]>([]);

  // Datos de temas por materia
  const subjectTopics: { [key: string]: Array<{ name: string; percentage: number }> } = {
    'Mathematics': [
      { name: 'Algebra', percentage: 85 },
      { name: 'Geometry', percentage: 65 },
      { name: 'Calculus', percentage: 72 },
      { name: 'Statistics', percentage: 58 },
      { name: 'Trigonometry', percentage: 80 },
      { name: 'Probability', percentage: 45 }
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
    ]
  };

  // Rendimiento general por materia
  const subjectPerformance: { [key: string]: number } = {
    'Mathematics': 78,
    'Physics': 65,
    'Chemistry': 62,
    'Biology': 72,
    'English': 75
  };

  // Descripciones de clase por materia
  const classDescriptions: { [key: string]: string } = {
    'Mathematics': 'Today we covered quadratic equations and their applications. Students practiced solving equations using different methods and worked on real-world problem scenarios.',
    'Physics': 'Today we explored Newton\'s laws of motion and their applications. Students conducted experiments with forces and motion, analyzing real-world physics phenomena.',
    'Chemistry': 'Today we studied chemical reactions and balancing equations. Students performed lab experiments to observe reaction rates and identify different types of chemical changes.',
    'Biology': 'Today we examined cellular structure and function. Students used microscopes to observe different cell types and discussed the processes of mitosis and meiosis.',
    'English': 'Today we analyzed Shakespearean sonnets and practiced literary analysis. Students wrote their own poetry and discussed themes of love and time in classical literature.'
  };

  // Opciones para los selectores
  const grades = ['9th Grade', '10th Grade', '11th Grade', '12th Grade'];
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'];

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
    if (currentSlide < Math.ceil(topics.length / 2) - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleCreateQuiz = () => {
    console.log(`Creating quiz for ${selectedSubject}`);
  };

  // Calcular qué temas mostrar en el slide actual
  const getCurrentTopics = () => {
    const startIndex = currentSlide * 2;
    return topics.slice(startIndex, startIndex + 2);
  };

  const totalSlides = Math.ceil(topics.length / 2);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>Teacher Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen class="main-prof-content">
        <div className="dashboard-container">
          
          {/* Header con selector de semana */}
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
                </IonText>
                
                {/* Selectores de Grado y Materia */}
                <div className="subject-selectors">
                  <IonSelect
                    value={selectedGrade}
                    placeholder="Select Grade"
                    onIonChange={(e) => setSelectedGrade(e.detail.value)}
                    interface="action-sheet"
                    className="grade-select"
                  >
                    {grades.map((grade, index) => (
                      <IonSelectOption key={index} value={grade}>
                        {grade}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                  
                  <IonSelect
                    value={selectedSubject}
                    placeholder="Select Subject"
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
                    className="ring-chart"
                    style={{
                      background: `conic-gradient(
                        #ffffff 0% ${overallPerformance}%,
                        rgba(255, 255, 255, 0.3) ${overallPerformance}% 100%
                      )`
                    }}
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

          {/* Carrusel de Topics Progress */}
          <div className="topics-section">
            <div className="topics-header">
              <IonText>
                <h3 className="section-title">{selectedSubject} Topics</h3>
              </IonText>
              
              {topics.length > 0 && (
                <div className="carousel-controls">
                  <IonButton 
                    fill="clear" 
                    size="small"
                    className="carousel-button"
                    onClick={handlePreviousSlide}
                    disabled={currentSlide === 0}
                  >
                    <IonIcon icon={caretBack} />
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
                    <IonIcon icon={caretForward} />
                  </IonButton>
                </div>
              )}
            </div>
            
            {topics.length > 0 ? (
              <div className="topics-carousel">
                <div 
                  className="carousel-track" 
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                    <div key={slideIndex} className="carousel-slide">
                      <div className="topics-grid">
                        {topics.slice(slideIndex * 2, slideIndex * 2 + 2).map((topic, index) => (
                          <IonCard key={index} className="topic-card">
                            <IonCardContent>
                              <div className="topic-header">
                                <IonIcon icon={book} className="topic-icon" />
                                <IonText>
                                  <h4 className="topic-name">{topic.name}</h4>
                                </IonText>
                              </div>
                              
                              <div className="topic-progress">
                                <IonText>
                                  <p className="topic-percentage">{topic.percentage}%</p>
                                </IonText>
                                <IonProgressBar 
                                  value={topic.percentage / 100} 
                                  className="topic-progress-bar"
                                />
                              </div>
                            </IonCardContent>
                          </IonCard>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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

          {/* Sección Enforce Topics */}
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

          {/* Sección Today's Class */}
          <div className="todays-class-section">
            <IonText>
              <h3 className="section-title">Today's Class</h3>
            </IonText>
            
            <IonCard className="class-card">
              <IonCardContent>
                <div className="class-header">
                  <IonIcon icon={time} className="class-icon" />
                  <IonText>
                    <h4 className="class-summary">Class Summary - {selectedSubject}</h4>
                  </IonText>
                </div>
                
                <div className="class-content">
                  <IonText>
                    <p className="class-description">
                      {classDescriptions[selectedSubject]}
                    </p>
                  </IonText>
                </div>
              </IonCardContent>
            </IonCard>
          </div>

          {/* Botón Create Quiz */}
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