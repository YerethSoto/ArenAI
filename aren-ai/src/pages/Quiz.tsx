import React from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonIcon,
  IonButton,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import { menu } from 'ionicons/icons';
import StudentMenu from '../components/StudentMenu';
import StudentSidebar from '../components/StudentSidebar';
import './Quiz.css';

const Quiz: React.FC = () => {
  const handleLogout = () => {
    console.log('Logout clicked');
  };

  return (
    <IonPage>
      <IonHeader className="app-header">
        <IonToolbar>
          <div className="header-content">
            <IonMenuButton slot="start" className="menu-button enlarged-menu">
              <IonIcon icon={menu} />
            </IonMenuButton>
            
            <div className="header-center">
              <StudentMenu
                selectedSubject={'History'} // Default subject for quiz
                onSubjectChange={() => {}} // Empty function for now
              />
            </div>
            
            <div className="header-brand">
              <div className="brand-text">
                <div className="arenai">ArenAI</div>
                <div className="student">Quiz</div>
              </div>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <StudentSidebar onLogout={handleLogout} />

      <IonContent fullscreen className="quiz-content">
        <div className="quiz-container">
          {/* Stats Bar */}
          <div className="stats-bar">
            <div className="stat-box">
              <div className="stat-number">1/15</div>
              <div className="stat-label">questions</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">1200 pts</div>
              <div className="stat-label">points</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">1st</div>
              <div className="stat-label">place</div>
            </div>
          </div>

          {/* Image Section - One Third */}
          <div className="image-section">
            <img 
              src="/assets/Capybara profile picture.png" 
              alt="ArenAI Capybara" 
              className="quiz-image"
            />
          </div>

          {/* Question Section - Half Size */}
          <div className="question-section">
            <div className="question-card">
              <IonText>
                <h2 className="question-title">What was the capital of Zaire?</h2>
              </IonText>
            </div>
          </div>

          {/* Options Section - Remaining Space */}
          <div className="options-section">
            <IonGrid>
              <IonRow>
                <IonCol size="12">
                  <IonButton expand="block" className="option-button">
                    A. San José
                  </IonButton>
                </IonCol>
                <IonCol size="12">
                  <IonButton expand="block" className="option-button">
                    B. San Marino
                  </IonButton>
                </IonCol>
                <IonCol size="12">
                  <IonButton expand="block" className="option-button">
                    C. Kirahasa
                  </IonButton>
                </IonCol>
                <IonCol size="12">
                  <IonButton expand="block" className="option-button">
                    D. Oromia
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Quiz;