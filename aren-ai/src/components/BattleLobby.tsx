import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonButton,
  IonLoading,
  IonCard,
  IonCardContent,
  IonCardTitle,
  IonCardSubtitle,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonText,
  IonAlert,
  IonProgressBar
} from '@ionic/react';
import {
  trophy,
  people,
  flash,
  hourglass,
  close,
  search,
  arrowDown
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StudentMenu from '../components/StudentMenu';
import StudentHeader from '../components/StudentHeader';
import './BattleLobby.css';

interface UserData {
  id: number;
  name: string;
  email: string;
  username: string;
}

interface Subject {
  id: number;
  nameKey: string;
  descKey: string;
  icon: string;
  color: string;
}

const BattleLobby: React.FC = () => {
  const { t } = useTranslation();
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [battleId, setBattleId] = useState<number | null>(null);
  const [searchInterval, setSearchInterval] = useState<NodeJS.Timeout | null>(null);
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const history = useHistory();

  const getUserData = (): UserData => {
    try {
      const storedData = localStorage.getItem('userData');
      if (storedData) {
        const data = JSON.parse(storedData);
        return {
          id: data.id_user || data.id || 1,
          name: data.name || 'Estudiante',
          email: data.email || 'Error',
          username: data.username || 'Error'
        };
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }

    return {
      id: 1,
      name: 'Estudiante',
      email: 'Error',
      username: 'Error'
    };
  };

  const currentUser = getUserData();

  const subjects: Subject[] = [
    {
      id: 1,
      nameKey: 'battleLobby.subjects.History',
      descKey: 'battleLobby.subjects.HistoryDesc',
      icon: '🏛️',
      color: '#8f6a56'
    },
    {
      id: 2,
      nameKey: 'battleLobby.subjects.Math',
      descKey: 'battleLobby.subjects.MathDesc',
      icon: '🧮',
      color: '#3c7782'
    },
    {
      id: 3,
      nameKey: 'battleLobby.subjects.Science',
      descKey: 'battleLobby.subjects.ScienceDesc',
      icon: '🔬',
      color: '#90beab'
    }
  ];

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (searchInterval) {
        clearInterval(searchInterval);
      }
    };
  }, [searchInterval]);

  const joinMatchmaking = async (subjectId: number) => {
    setIsSearching(true);
    setSearchProgress(0);
    setErrorMessage('');

    // Start progress animation
    const progressInterval = setInterval(() => {
      setSearchProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 100);

    try {
      console.log('Starting matchmaking for user:', currentUser.id, 'subject:', subjectId);

      const response = await fetch('http://localhost:3000/api/battles/matchmaking/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          userId: currentUser.id,
          subjectId: subjectId,
          classId: 1 // Default class ID
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
        } else if (response.status === 404) {
          throw new Error('Ruta no encontrada. Verifica la URL del servidor.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Matchmaking response:', data);

      clearInterval(progressInterval);

      if (data.battleId) {
        // Found a battle immediately
        setBattleId(data.battleId);

        // Start polling for battle readiness
        startBattlePolling(data.battleId);
      } else if (data.matchmakingId) {
        // Added to waiting list, start polling for match
        startMatchmakingPolling(data.matchmakingId, data.battleId);
      } else {
        throw new Error('Respuesta inválida del servidor');
      }

    } catch (error: any) {
      console.error('Matchmaking error:', error);
      clearInterval(progressInterval);
      setIsSearching(false);
      setSearchProgress(0);

      const errorMessage = error.message || 'Error al buscar oponente';
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Connection refused')) {
        setErrorMessage('Error de conexión con el servidor. Verifica que el servidor esté ejecutándose.');
      } else {
        setErrorMessage(errorMessage);
      }

      setShowErrorAlert(true);
    }
  };

  const startMatchmakingPolling = (matchmakingId: number, waitingBattleId?: number) => {
    console.log('Starting matchmaking polling for ID:', matchmakingId);

    // Store waiting battle ID if provided
    if (waitingBattleId) {
      setBattleId(waitingBattleId);
    }

    const interval = setInterval(async () => {
      try {
        console.log('Polling matchmaking status for user:', currentUser.id);

        const response = await fetch(`http://localhost:3000/api/battles/matchmaking/status/${currentUser.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const status = await response.json();
        console.log('Matchmaking status:', status);

        if (status && status.battle_id) {
          // Match found!
          clearInterval(interval);
          setSearchInterval(null);
          setBattleId(status.battle_id);

          // Check if battle is ready
          checkBattleReady(status.battle_id);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000); // Poll every 3 seconds

    setSearchInterval(interval);

    // Stop searching after 60 seconds
    setTimeout(() => {
      if (interval) {
        clearInterval(interval);
        setSearchInterval(null);
      }
      if (!battleId) {
        setIsSearching(false);
        setSearchProgress(0);
        setErrorMessage('No se encontró oponente. Intenta nuevamente.');
        setShowErrorAlert(true);
      }
    }, 60000);
  };

  const startBattlePolling = (battleId: number) => {
    console.log('Starting battle polling for ID:', battleId);

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/battles/${battleId}/ready`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.ready) {
          // Battle is ready!
          clearInterval(interval);
          setSearchInterval(null);
          navigateToBattle(battleId);
        }
      } catch (error) {
        console.error('Battle polling error:', error);
      }
    }, 2000); // Poll every 2 seconds

    setSearchInterval(interval);
  };

  const checkBattleReady = async (battleId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/battles/${battleId}/ready`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.ready) {
          navigateToBattle(battleId);
        }
      }
    } catch (error) {
      console.error('Error checking battle readiness:', error);
    }
  };

  const navigateToBattle = (battleId: number) => {
    console.log('Navigating to battle:', battleId);

    // Stop any polling
    if (searchInterval) {
      clearInterval(searchInterval);
      setSearchInterval(null);
    }

    setIsSearching(false);
    setSearchProgress(0);

    // Navigate to battle page
    history.push(`/battle/${battleId}`);
  };

  const cancelSearch = async () => {
    try {
      await fetch('http://localhost:3000/api/battles/matchmaking/leave', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ userId: currentUser.id })
      });
    } catch (error) {
      console.error('Cancel search error:', error);
    } finally {
      // Clean up
      if (searchInterval) {
        clearInterval(searchInterval);
        setSearchInterval(null);
      }
      setIsSearching(false);
      setSearchProgress(0);
      setShowCancelAlert(false);
    }
  };

  const handleBackToMenu = () => {
    // Cancel search if active
    if (isSearching) {
      cancelSearch();
    }
    history.push('/page/student');
  };

  return (
    <IonPage className="battle-lobby-page">
      <StudentHeader pageTitle="battleLobby.title" />

      <IonContent className="battle-lobby-content">
        <div className="battle-lobby-container">
          {/* Welcome Section */}
          <div className="welcome-section">
            <h1 className="welcome-title">
              <IonIcon icon={arrowDown} className="title-icon" />
              {t('battleLobby.welcomeTitle')}
            </h1>
            <p className="welcome-subtitle">
              {t('battleLobby.welcomeSubtitle')}
            </p>
          </div>

          {/* Search Status */}
          {isSearching && (
            <div className="searching-overlay">
              <div className="searching-content">
                <div className="searching-icon">
                  <IonIcon icon={search} className="spinning" />
                </div>

                <h2 className="searching-title">{t('battleLobby.searching')}</h2>

                <div className="search-progress">
                  <IonProgressBar value={searchProgress / 100} color="primary" />
                  <div className="progress-text">{Math.round(searchProgress)}%</div>
                </div>

                <p className="searching-description">
                  {searchProgress < 50
                    ? t('battleLobby.searchingDesc1')
                    : t('battleLobby.searchingDesc2')}
                </p>

                {battleId && (
                  <div className="battle-id-info">
                    <p><strong>{t('battleLobby.battleId', { id: battleId })}</strong></p>
                    <small>{t('battleLobby.shareId')}</small>
                  </div>
                )}

                <IonButton
                  expand="block"
                  color="medium"
                  fill="outline"
                  onClick={() => setShowCancelAlert(true)}
                  className="cancel-button"
                >
                  <IonIcon icon={close} slot="start" />
                  {t('battleLobby.cancelSearch')}
                </IonButton>
              </div>
            </div>
          )}

          {/* Battle Subjects */}
          <div className="subjects-section">
            <h2 className="section-title">
              <IonIcon icon={trophy} />
              {t('battleLobby.chooseSubject')}
            </h2>

            <IonGrid>
              <IonRow>
                {subjects.map((subject) => (
                  <IonCol size="12" size-md="6" key={subject.id}>
                    <IonCard
                      className="subject-card"
                      style={{ '--subject-color': subject.color } as any}
                    >
                      <IonCardContent>
                        <div className="subject-header">
                          <div
                            className="subject-icon"
                            style={{ backgroundColor: subject.color }}
                          >
                            {subject.icon}
                          </div>
                          <div className="subject-info">
                            <IonCardTitle>{t(subject.nameKey)}</IonCardTitle>
                            <IonCardSubtitle>{t(subject.descKey)}</IonCardSubtitle>
                          </div>
                        </div>

                        <div className="subject-actions">
                          <IonButton
                            expand="block"
                            className="battle-button"
                            onClick={() => joinMatchmaking(subject.id)}
                            disabled={isSearching}
                          >
                            <IonIcon icon={flash} slot="start" />
                            {t('battleLobby.quickBattle')}
                          </IonButton>
                        </div>
                      </IonCardContent>
                    </IonCard>
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
          </div>

          {/* How to Play */}
          <div className="instructions-section">
            <IonCard>
              <IonCardContent>
                <h3 className="instructions-title">
                  <IonIcon icon={people} />
                  {t('battleLobby.howToPlay')}
                </h3>
                <div className="instructions-list">
                  <div className="instruction-item">
                    <div className="instruction-number">1</div>
                    <div className="instruction-text">
                      <strong>{t('battleLobby.step1.title')}</strong>
                      <p>{t('battleLobby.step1.desc')}</p>
                    </div>
                  </div>
                  <div className="instruction-item">
                    <div className="instruction-number">2</div>
                    <div className="instruction-text">
                      <strong>{t('battleLobby.step2.title')}</strong>
                      <p>{t('battleLobby.step2.desc')}</p>
                    </div>
                  </div>
                  <div className="instruction-item">
                    <div className="instruction-number">3</div>
                    <div className="instruction-text">
                      <strong>{t('battleLobby.step3.title')}</strong>
                      <p>{t('battleLobby.step3.desc')}</p>
                    </div>
                  </div>
                  <div className="instruction-item">
                    <div className="instruction-number">4</div>
                    <div className="instruction-text">
                      <strong>{t('battleLobby.step4.title')}</strong>
                      <p>{t('battleLobby.step4.desc')}</p>
                    </div>
                  </div>
                </div>
              </IonCardContent>
            </IonCard>
          </div>

          {/* Back Button */}
          <div className="back-section">
            <IonButton
              expand="block"
              color="medium"
              fill="clear"
              onClick={handleBackToMenu}
            >
              {t('battleLobby.backToMenu')}
            </IonButton>
          </div>
        </div>

        {/* Loading */}
        <IonLoading
          isOpen={false}
          message={t('battleLobby.processing')}
        />

        {/* Cancel Alert */}
        <IonAlert
          isOpen={showCancelAlert}
          onDidDismiss={() => setShowCancelAlert(false)}
          header={t('battleLobby.cancelAlert.header')}
          message={t('battleLobby.cancelAlert.message')}
          buttons={[
            {
              text: t('battleLobby.cancelAlert.continue'),
              role: 'cancel'
            },
            {
              text: t('battleLobby.cancelAlert.cancel'),
              handler: cancelSearch
            }
          ]}
        />

        {/* Error Alert */}
        <IonAlert
          isOpen={showErrorAlert}
          onDidDismiss={() => setShowErrorAlert(false)}
          header={t('battleLobby.error')}
          message={errorMessage}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default BattleLobby;