import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardContent,
  IonText,
  IonHeader,
  IonToolbar,
  IonMenuButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  useIonRouter,
  IonBackButton,
  IonButtons
} from '@ionic/react';
import { trophyOutline, chevronForward, person } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import './StudentScores.css';

const StudentSectionPage: React.FC = () => {
  const { t } = useTranslation();
  const router = useIonRouter();

  type StudentScore = { username: string; score: number };
  type SubjectData = { [subject: string]: { [section: string]: StudentScore[] } };

  // Data organized by subject -> section -> students
  const subjectData: SubjectData = {
    Math: {
      '1': [
        { username: 'Yereth Soto', score: 82 },
        { username: 'Leonardo Escobar', score: 45 },
        { username: 'Barack Obama', score: 88 },
        { username: 'Alice Johnson', score: 92 },
        { username: 'Bob Martin', score: 78 },
        { username: 'Charlie Davis', score: 85 },
        { username: 'Sofia Mendez', score: 74 },
        { username: 'Michael Jordan', score: 96 },
        { username: 'Luis Fernandez', score: 67 },
      ],
      '2': [
        { username: 'Diana Wilson', score: 88 },
        { username: 'Edward Brown', score: 73 },
        { username: 'Fiona Garcia', score: 95 },
        { username: 'Camila Rojas', score: 79 },
        { username: 'Jose Martinez', score: 84 },
        { username: 'Natalie Portman', score: 91 },
        { username: 'Kevin Diaz', score: 65 },
        { username: 'Andrea Gomez', score: 77 },
        { username: 'Daniel Smith', score: 69 },
      ],
    },
    // ... (rest of mock data assumes English keys for subjects currently, could be improved)
    Science: {
      '1': [{ username: 'Yereth Soto', score: 88 }, { username: 'Leonardo Escobar', score: 52 }],
      '2': [{ username: 'Diana Wilson', score: 91 }]
    },
    'Social Studies': {
      '1': [{ username: 'Yereth Soto', score: 79 }],
      '2': [{ username: 'Diana Wilson', score: 85 }]
    },
    Spanish: {
      '1': [{ username: 'Yereth Soto', score: 94 }],
      '2': [{ username: 'Diana Wilson', score: 80 }]
    }
  };

  const [selectedSection, setSelectedSection] = useState('1');
  const [selectedGrade, setSelectedGrade] = useState('7');
  const [selectedSubject, setSelectedSubject] = useState('Math'); // Defaults to Math

  // Get current students based on selected subject and section
  // Note: For full robustness, subject keys should match what's selected globally or dropdown
  const currentStudents = subjectData[selectedSubject] && subjectData[selectedSubject][selectedSection]
    ? subjectData[selectedSubject][selectedSection]
    : subjectData['Math']['1']; // Fallback to avoid empty

  // Handle student card click
  const handleStudentClick = (username: string) => {
    const encodedUsername = encodeURIComponent(username);
    const encodedSubject = encodeURIComponent(selectedSubject);
    router.push(`/teacher-student-detail/${encodedUsername}/${encodedSubject}`);
  };

  // Get score class based on score value
  const getScoreClass = (score: number) => {
    if (score >= 85) return 'score-high';
    if (score >= 70) return 'score-medium';
    return 'score-low';
  };

  // Get initials from name
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const averageScore =
    currentStudents.length > 0
      ? Math.round(
        currentStudents.reduce((sum, s) => sum + s.score, 0) /
        currentStudents.length
      )
      : 0;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/page/professor" className="back-button" text="" icon={chevronForward} style={{ transform: 'rotate(180deg)', color: 'var(--ion-color-primary)' }} />
          </IonButtons>
          <div className="header-brand">
            <span className="brand-text">{t('professor.studentScores.title')}</span>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="student-scores-content">
        <div className="dashboard-container">
          {/* Section Header */}
          <div className="section-header">
            <div className="header-controls">
              <IonItem lines="none" className="filter-item">
                <IonLabel>{t('professor.studentScores.grade')}</IonLabel>
                <IonSelect value={selectedGrade} placeholder={t('professor.studentScores.selectGrade')} onIonChange={e => setSelectedGrade(e.detail.value)} interface="popover">
                  <IonSelectOption value="7">7</IonSelectOption>
                  <IonSelectOption value="8">8</IonSelectOption>
                  <IonSelectOption value="9">9</IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonItem lines="none" className="filter-item">
                <IonLabel>{t('professor.studentScores.section')}</IonLabel>
                <IonSelect value={selectedSection} placeholder={t('professor.studentScores.selectSection')} onIonChange={e => setSelectedSection(e.detail.value)} interface="popover">
                  <IonSelectOption value="1">1</IonSelectOption>
                  <IonSelectOption value="2">2</IonSelectOption>
                </IonSelect>
              </IonItem>
            </div>
          </div>

          {/* Average Score */}
          <div className="average-score-bubble">
            <IonText>
              <h2>
                <IonIcon icon={trophyOutline} className="average-icon" />
                {t('professor.studentScores.averageScore')}: {averageScore}%
              </h2>
            </IonText>
          </div>

          {/* Student Cards */}
          <div className="student-score-grid">
            {currentStudents.map((student, index) => (
              <IonCard
                key={index}
                className="student-bubble-card"
                onClick={() => handleStudentClick(student.username)}
              >
                <IonCardContent>
                  <div className="student-info">
                    <div className="student-avatar">
                      {getInitials(student.username)}
                    </div>
                    <div className="student-name">
                      {student.username}
                    </div>
                  </div>
                  <div className={`student-score ${getScoreClass(student.score)}`}>
                    {student.score}%
                  </div>
                </IonCardContent>
              </IonCard>
            ))}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default StudentSectionPage;
