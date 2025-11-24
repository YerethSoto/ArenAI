import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonText,
  IonHeader,
  IonToolbar,
  IonMenuButton,
  IonIcon
} from '@ionic/react';
import { menu } from 'ionicons/icons';
import './StudentScores.css';
import ProfessorMenu from '../components/ProfessorMenu';

const StudentSectionPage: React.FC = () => {
  type Student = { username: string; score: number };
  type Section = { name: string; students: Student[] };

  const sections: Section[] = [
    {
      name: '1',
      students: [
        { username: 'alice123', score: 92 },
        { username: 'bob456', score: 78 },
        { username: 'charlie789', score: 85 },
        { username: 'yereth_soto', score: 82 },
        { username: 'leonardo_escobar', score: 0 },
        { username: 'barack_obama', score: 88 },
        { username: 'sofia_mendez', score: 74 },
        { username: 'michael_jordan', score: 96 },
        { username: 'luis_fernandez', score: 67 },
      ],
    },
    {
      name: '2',
      students: [
        { username: 'diana321', score: 88 },
        { username: 'edward654', score: 73 },
        { username: 'fiona987', score: 95 },
        { username: 'camila_rojas', score: 79 },
        { username: 'jose_martinez', score: 84 },
        { username: 'natalie_portman', score: 91 },
        { username: 'kevin_diaz', score: 65 },
        { username: 'andrea_gomez', score: 77 },
        { username: 'daniel_smith', score: 69 },
      ],
    },
  ];

  const [selectedSection, setSelectedSection] = useState(sections[0].name);
  const [selectedGrade, setSelectedGrade] = useState('7');
  const [selectedSubject, setSelectedSubject] = useState('Math');

  const currentSection = sections.find(s => s.name === selectedSection);

  // Variable to get bubble color based on score
const getBubbleColor = (score: number) => {
  if (score >= 85) return '#c6e9c8ff'; // green
  if (score >= 70) return '#f8f2b1ff'; // yellow
  return '#ffc8ceff'; // red
};


  const averageScore =
    currentSection && currentSection.students.length > 0
      ? Math.round(
          currentSection.students.reduce((sum, s) => sum + s.score, 0) /
            currentSection.students.length
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
          {/* Promedio */}
          <div className="average-score-bubble">
            <IonText>
              <h2>Average class score: {averageScore}%</h2>
            </IonText>
          </div>

          {/* Bubble per student */}
          <IonGrid className="student-score-grid">
            <IonRow>
              {currentSection?.students.map((student, index) => (
                <IonCol key={index} size="12" size-md="12" size-lg="6">
                  <IonCard
                    className="student-bubble-card"
                    style={{ backgroundColor: getBubbleColor(student.score) }}
                  >
                    <IonCardContent
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 16px',
                        minHeight: '50px',
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '1rem', color: '#3e2723' }}>
                        {student.username}
                        <p style={{ fontWeight: 'bold', fontSize: '1rem', color: '#212121', margin: 0, alignSelf: 'flex-end' }}>{student.score}%</p>
                      </div>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default StudentSectionPage;
