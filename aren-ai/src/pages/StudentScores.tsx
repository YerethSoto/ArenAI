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
  IonSelectOption
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { menu, trophyOutline } from 'ionicons/icons';
import './StudentScores.css';
import ProfessorMenu from '../components/ProfessorMenu';

const StudentSectionPage: React.FC = () => {
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
    Science: {
      '1': [
        { username: 'Yereth Soto', score: 88 },
        { username: 'Leonardo Escobar', score: 52 },
        { username: 'Barack Obama', score: 90 },
        { username: 'Alice Johnson', score: 87 },
        { username: 'Bob Martin', score: 81 },
        { username: 'Charlie Davis', score: 79 },
        { username: 'Sofia Mendez', score: 86 },
        { username: 'Michael Jordan', score: 93 },
        { username: 'Luis Fernandez', score: 71 },
      ],
      '2': [
        { username: 'Diana Wilson', score: 91 },
        { username: 'Edward Brown', score: 68 },
        { username: 'Fiona Garcia', score: 92 },
        { username: 'Camila Rojas', score: 83 },
        { username: 'Jose Martinez', score: 78 },
        { username: 'Natalie Portman', score: 94 },
        { username: 'Kevin Diaz', score: 62 },
        { username: 'Andrea Gomez', score: 80 },
        { username: 'Daniel Smith', score: 74 },
      ],
    },
    'Social Studies': {
      '1': [
        { username: 'Yereth Soto', score: 79 },
        { username: 'Leonardo Escobar', score: 38 },
        { username: 'Barack Obama', score: 95 },
        { username: 'Alice Johnson', score: 84 },
        { username: 'Bob Martin', score: 76 },
        { username: 'Charlie Davis', score: 88 },
        { username: 'Sofia Mendez', score: 82 },
        { username: 'Michael Jordan', score: 71 },
        { username: 'Luis Fernandez', score: 65 },
      ],
      '2': [
        { username: 'Diana Wilson', score: 85 },
        { username: 'Edward Brown', score: 77 },
        { username: 'Fiona Garcia', score: 90 },
        { username: 'Camila Rojas', score: 88 },
        { username: 'Jose Martinez', score: 81 },
        { username: 'Natalie Portman', score: 87 },
        { username: 'Kevin Diaz', score: 70 },
        { username: 'Andrea Gomez', score: 83 },
        { username: 'Daniel Smith', score: 72 },
      ],
    },
    Spanish: {
      '1': [
        { username: 'Yereth Soto', score: 94 },
        { username: 'Leonardo Escobar', score: 60 },
        { username: 'Barack Obama', score: 75 },
        { username: 'Alice Johnson', score: 89 },
        { username: 'Bob Martin', score: 72 },
        { username: 'Charlie Davis', score: 83 },
        { username: 'Sofia Mendez', score: 96 },
        { username: 'Michael Jordan', score: 68 },
        { username: 'Luis Fernandez', score: 92 },
      ],
      '2': [
        { username: 'Diana Wilson', score: 80 },
        { username: 'Edward Brown', score: 71 },
        { username: 'Fiona Garcia', score: 88 },
        { username: 'Camila Rojas', score: 95 },
        { username: 'Jose Martinez', score: 91 },
        { username: 'Natalie Portman', score: 85 },
        { username: 'Kevin Diaz', score: 63 },
        { username: 'Andrea Gomez', score: 87 },
        { username: 'Daniel Smith', score: 66 },
      ],
    },
  };

  const [selectedSection, setSelectedSection] = useState('1');
  const [selectedGrade, setSelectedGrade] = useState('7');
  const [selectedSubject, setSelectedSubject] = useState('Math');
  const history = useHistory();

  // Get current students based on selected subject and section
  const currentStudents = subjectData[selectedSubject]?.[selectedSection] || [];

  // Handle student card click
  const handleStudentClick = (username: string) => {
    const encodedUsername = encodeURIComponent(username);
    const encodedSubject = encodeURIComponent(selectedSubject);
    history.push(`/teacher-student-detail/${encodedUsername}/${encodedSubject}`);
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
          <div className="header-content">
            <IonMenuButton slot="start" className="menu-button enlarged-menu">
              <IonIcon icon={menu} />
            </IonMenuButton>
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
        <div className="dashboard-container student-score-section">
          {/* Section Header */}
          <div className="section-header">
            <div className="header-controls" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <IonItem lines="none" className="filter-item">
                <IonLabel>Grade</IonLabel>
                <IonSelect value={selectedGrade} placeholder="Select Grade" onIonChange={e => setSelectedGrade(e.detail.value)}>
                  <IonSelectOption value="7">7</IonSelectOption>
                  <IonSelectOption value="8">8</IonSelectOption>
                  <IonSelectOption value="9">9</IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonItem lines="none" className="filter-item">
                <IonLabel>Section</IonLabel>
                <IonSelect value={selectedSection} placeholder="Select Section" onIonChange={e => setSelectedSection(e.detail.value)}>
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
                Average Class Score: {averageScore}%
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
                style={{ cursor: 'pointer' }}
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
