import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonInput,
  IonButton,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonLabel,
  IonIcon,
} from '@ionic/react';
import { logInOutline, school } from 'ionicons/icons';
import { useHistory, useParams } from 'react-router-dom';
import './Class_Join.css';

interface RouteParams {
  code?: string;
}

const Class_Join: React.FC = () => {
  const history = useHistory();
  const { code } = useParams<RouteParams>();
  const [classCode, setClassCode] = useState(code || '');
  const [isLoading, setIsLoading] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [error, setError] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState<number | null>(null);
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');

  // Obtiene el nombre del usuario actual de localStorage
  useEffect(() => {
    if (code) setClassCode(code);
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setStudentName(user.name || user.username || '');
        setStudentId(user.id_user || user.id); // <-- Asegúrate de tener el id
      }
    } catch {
      setStudentName('');
      setStudentId(null);
    }
  }, [code]);

  const handleJoinClass = async () => {
    setError('');
    if (!classCode.trim() || !studentName.trim() || !studentId) {
      setError('No se pudo obtener tu usuario. Por favor inicia sesión.');
      return;
    }
    setIsLoading(true);
    try {
      const resp = await fetch('/api/sections/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ class_code: classCode, student_id: studentId }),
      });
      if (resp.status === 409) {
        setError('Ya estás inscrito en esta clase.');
        setIsLoading(false);
        return;
      }
      if (!resp.ok) {
        const errMsg = await resp.text();
        throw new Error(errMsg || 'Failed to join class');
      }
      setJoinSuccess(true);
      setTimeout(() => {
        // Redirige al dashboard del estudiante o a la clase
        history.replace('/page/student');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Join a Class</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="class-join-content">
        <div className="class-join-container">
          <IonGrid>
            <IonRow class="ion-justify-content-center">
              <IonCol size="12" size-md="8" size-lg="6" size-xl="4">
                <IonCard className="join-card">
                  <IonCardContent>
                    <IonText>
                      <h2>Join with Class Code</h2>
                    </IonText>
                    {/* Ya no se pide el nombre, solo se muestra */}
                    <div className="input-section">
                      <IonLabel position="stacked">Your Name</IonLabel>
                      <IonItem>
                        <IonInput
                          value={studentName}
                          readonly
                          disabled
                        />
                      </IonItem>
                    </div>
                    <div className="input-section">
                      <IonLabel position="stacked">Class Code</IonLabel>
                      <IonItem>
                        <IonIcon icon={school} slot="start" />
                        <IonInput
                          value={classCode}
                          placeholder="Enter class code"
                          onIonChange={e => setClassCode(e.detail.value!)}
                          disabled={!!code || isLoading}
                        />
                      </IonItem>
                    </div>
                    {error && (
                      <IonText color="danger">
                        <p>{error}</p>
                      </IonText>
                    )}
                    <div className="button-section">
                      <IonButton
                        expand="block"
                        onClick={handleJoinClass}
                        disabled={isLoading}
                      >
                        <IonIcon icon={logInOutline} slot="start" />
                        {isLoading ? 'JOINING...' : 'JOIN CLASS'}
                      </IonButton>
                    </div>
                    {joinSuccess && (
                      <IonText color="success">
                        <p>Successfully joined! Redirecting...</p>
                      </IonText>
                    )}
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Class_Join;