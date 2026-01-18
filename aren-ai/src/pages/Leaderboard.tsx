import React, { useState, useEffect } from 'react';
import { IonContent, IonPage, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonIcon, IonModal, IonButton, IonSpinner } from '@ionic/react';
import { trophy, ribbon, school, time, statsChart, close } from 'ionicons/icons';
import PageTransition from '../components/PageTransition';
import './Leaderboard.css';
import { getApiUrl } from '../config/api';

import { LeaderboardEntry } from '../types/student';

const Leaderboard: React.FC = () => {
    const [students, setStudents] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('authToken');
                const response = await fetch(getApiUrl('api/leaderboard'), {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch leaderboard');
                }

                const data = await response.json();
                setStudents(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching leaderboard:', err);
                setError('Error cargando el ranking');
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const top3 = students.slice(0, 3);
    const rest = students.slice(3);

    return (
        <IonPage className="leaderboard-page">
            <IonHeader className="ion-no-border">
                <IonToolbar style={{ '--background': 'transparent' }}>
                    <IonButtons slot="start">
                        <IonMenuButton color="primary" />
                    </IonButtons>
                    <IonTitle style={{ color: 'var(--ion-color-primary)', fontWeight: '800' }}>Ranking</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen className="student-page-content">
                <PageTransition>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                            <IonSpinner name="crescent" />
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                            <p>{error}</p>
                        </div>
                    ) : (
                        <>
                            <div className="leaderboard-header-section">
                                <h1 className="leaderboard-title">Top Estudiantes</h1>

                                {/* PODIUM */}
                                <div className="podium-container">
                                    {/* 2nd Place */}
                                    {top3[1] && (
                                        <div className="podium-spot rank-2" onClick={() => setSelectedStudent(top3[1])}>
                                            <div className="podium-avatar-wrapper">
                                                <div className="podium-avatar">{top3[1].avatar}</div>
                                            </div>
                                            <div className="podium-base">
                                                <div className="podium-rank-num">2</div>
                                                <div className="podium-name">{top3[1].name}</div>
                                                <div className="podium-score">{top3[1].totalScore} pts</div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 1st Place */}
                                    {top3[0] && (
                                        <div className="podium-spot rank-1" onClick={() => setSelectedStudent(top3[0])}>
                                            <div className="podium-avatar-wrapper">
                                                <IonIcon icon={trophy} className="crown-icon" />
                                                <div className="podium-avatar">{top3[0].avatar}</div>
                                            </div>
                                            <div className="podium-base">
                                                <div className="podium-rank-num">1</div>
                                                <div className="podium-name">{top3[0].name}</div>
                                                <div className="podium-score">{top3[0].totalScore} pts</div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 3rd Place */}
                                    {top3[2] && (
                                        <div className="podium-spot rank-3" onClick={() => setSelectedStudent(top3[2])}>
                                            <div className="podium-avatar-wrapper">
                                                <div className="podium-avatar">{top3[2].avatar}</div>
                                            </div>
                                            <div className="podium-base">
                                                <div className="podium-rank-num">3</div>
                                                <div className="podium-name">{top3[2].name}</div>
                                                <div className="podium-score">{top3[2].totalScore} pts</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* RANKING LIST */}
                            <div className="ranking-list">
                                {rest.map((student, idx) => (
                                    <div key={student.id} className="ranking-item" onClick={() => setSelectedStudent(student)}>
                                        <div className="ranking-num">{idx + 4}</div>
                                        <div className="ranking-avatar">{student.avatar}</div>
                                        <div className="ranking-info">
                                            <div className="ranking-name">{student.name}</div>
                                            <div className="ranking-detail">Nivel {Math.floor(student.totalScore / 500)} • {student.stats.arena} Trofeos</div>
                                        </div>
                                        <div className="ranking-total">{student.totalScore}</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </PageTransition>

                {/* SCORE BREAKDOWN MODAL */}
                <IonModal isOpen={!!selectedStudent} onDidDismiss={() => setSelectedStudent(null)} initialBreakpoint={0.5} breakpoints={[0, 0.5, 0.75]}>
                    <div className="score-breakdown-sheet">
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <IonIcon icon={close} size="large" onClick={() => setSelectedStudent(null)} />
                        </div>
                        {selectedStudent && (
                            <>
                                <div className="breakdown-header">
                                    <div className="breakdown-label">PUNTUACIÓN TOTAL DE {selectedStudent.name.toUpperCase()}</div>
                                    <div className="breakdown-total-display">{selectedStudent.totalScore}</div>
                                </div>

                                {/* ARENA ROW */}
                                <div className="breakdown-row">
                                    <div className="breakdown-icon-box color-arena">
                                        <IonIcon icon={trophy} />
                                    </div>
                                    <div className="breakdown-bar-container">
                                        <div className="breakdown-bar-label">
                                            <span>Arena (Trofeos)</span>
                                            <span className="text-arena">{selectedStudent.stats.arena} pts</span>
                                        </div>
                                        <div className="progress-track">
                                            <div className="progress-fill fill-arena" style={{ width: '60%' }}></div>
                                        </div>
                                    </div>
                                </div>

                                {/* QUIZ ROW */}
                                <div className="breakdown-row">
                                    <div className="breakdown-icon-box color-quiz">
                                        <IonIcon icon={school} />
                                    </div>
                                    <div className="breakdown-bar-container">
                                        <div className="breakdown-bar-label">
                                            <span>Académico (Promedio)</span>
                                            <span className="text-quiz">{selectedStudent.stats.quiz}% (x20)</span>
                                        </div>
                                        <div className="progress-track">
                                            <div className="progress-fill fill-quiz" style={{ width: `${selectedStudent.stats.quiz}%` }}></div>
                                        </div>
                                    </div>
                                </div>

                                {/* UTILIZATION ROW */}
                                <div className="breakdown-row">
                                    <div className="breakdown-icon-box color-util">
                                        <IonIcon icon={statsChart} />
                                    </div>
                                    <div className="breakdown-bar-container">
                                        <div className="breakdown-bar-label">
                                            <span>Índice de Utilización</span>
                                            <span className="text-util">{selectedStudent.stats.utilization} (x15)</span>
                                        </div>
                                        <div className="progress-track">
                                            <div className="progress-fill fill-util" style={{ width: `${selectedStudent.stats.utilization}%` }}></div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '12px', color: '#999' }}>
                                    * Los puntajes se actualizan diariamente a las 00:00.
                                </div>
                            </>
                        )}
                    </div>
                </IonModal>

            </IonContent>
        </IonPage>
    );
};

export default Leaderboard;
