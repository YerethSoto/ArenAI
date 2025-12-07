import React, { useState } from 'react';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonContent,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonModal,
    IonButton,
    IonMenuButton
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import {
    trophyOutline,
    gameControllerOutline,
    ribbonOutline,
    timeOutline,
    closeOutline,
    checkmarkCircleOutline,
    warningOutline,
    menu,
    arrowBack
} from 'ionicons/icons';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './StudentDetail.css';
import ProfessorMenu from '../components/ProfessorMenu';

interface StudentDetailParams {
    username: string;
    subject: string;
}

interface SubjectFeedback {
    subject: string;
    score: number;
    color: string;
    strengths: string[];
    improvements: string[];
}

const StudentDetail: React.FC = () => {
    const { username, subject } = useParams<StudentDetailParams>();
    const decodedUsername = decodeURIComponent(username || '');
    const decodedSubject = decodeURIComponent(subject || 'Math');

    const [selectedSubject, setSelectedSubject] = useState<SubjectFeedback | null>(null);
    const [showModal, setShowModal] = useState(false);

    const studentData = {
        name: decodedUsername,
        overallScore: 82,
        quizzesCompleted: 15,
        battlesWon: 8,
        totalBattles: 12,
        studyTime: 45,
        classRank: 3,
    };

    const subjectFeedback: SubjectFeedback[] = [
        {
            subject: 'Math',
            score: 82,
            color: '#3b82f6',
            strengths: [
                'Strong foundation in basic arithmetic and algebra',
                'Excellent problem-solving skills in word problems',
                'Consistent performance in weekly quizzes'
            ],
            improvements: [
                'Practice advanced geometry concepts',
                'Review trigonometry fundamentals',
                'Work on speed in timed assessments'
            ]
        },
        {
            subject: 'Science',
            score: 88,
            color: '#10b981',
            strengths: [
                'Outstanding understanding of scientific method',
                'Excellent lab work and experimental design',
                'Strong grasp of biology and chemistry concepts'
            ],
            improvements: [
                'Review physics mechanics principles',
                'Practice more with chemical equations',
                'Improve technical writing in lab reports'
            ]
        },
        {
            subject: 'Social Studies',
            score: 79,
            color: '#f59e0b',
            strengths: [
                'Good understanding of historical timelines',
                'Strong critical thinking in analyzing events',
                'Engaged participation in class discussions'
            ],
            improvements: [
                'Study 20th century historical events more deeply',
                'Improve map reading and geography skills',
                'Work on essay writing structure'
            ]
        },
        {
            subject: 'Spanish',
            score: 94,
            color: '#ec4899',
            strengths: [
                'Exceptional vocabulary and grammar mastery',
                'Natural pronunciation and speaking fluency',
                'Excellent reading comprehension skills'
            ],
            improvements: [
                'Continue practicing verb conjugations',
                'Expand vocabulary in technical terms',
                'Read more advanced Spanish literature'
            ]
        }
    ];

    const pieData = subjectFeedback.map(item => ({
        name: item.subject,
        value: item.score,
        color: item.color,
        percentage: `${Math.round((item.score / subjectFeedback.reduce((sum, s) => sum + s.score, 0)) * 100)}%`
    }));

    const barData = [
        { week: 'Week 1', score: 75 },
        { week: 'Week 2', score: 80 },
        { week: 'Week 3', score: 78 },
        { week: 'Week 4', score: 85 },
    ];

    const lineData = [
        { month: 'Sep', score: 70 },
        { month: 'Oct', score: 75 },
        { month: 'Nov', score: 80 },
        { month: 'Dec', score: 82 }
    ];

    const COLORS = pieData.map(item => item.color);

    const handlePieClick = (data: any) => {
        const clickedSubject = subjectFeedback.find(s => s.subject === data.name);
        if (clickedSubject) {
            setSelectedSubject(clickedSubject);
            setShowModal(true);
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <div className="header-content">
                        <IonButtons slot="start">
                            <IonBackButton defaultHref="/student-section" text="Back" style={{ color: 'white' }} icon={arrowBack} />
                        </IonButtons>
                        <div className="header-brand">
                            <div className="brand-text">
                                <div className="arenai">ArenAI</div>
                                <div className="teacher">Teacher</div>
                            </div>
                        </div>
                    </div>
                </IonToolbar>
            </IonHeader>

            <IonContent className="student-detail-content">
                <div className="student-detail-container">
                    <div className="student-header-card-enhanced">
                        <div className="student-rank-badge">
                            <IonIcon icon={trophyOutline} className="rank-trophy" />
                            <div className="rank-number">#{studentData.classRank}</div>
                            <div className="rank-label">CLASS RANK</div>
                        </div>
                        <div className="student-main-info">
                            <div className="student-avatar-large">
                                {decodedUsername.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <h1 className="student-name-large">{decodedUsername}</h1>
                        </div>
                        <div className="student-overall-score">
                            <div className="score-circle">
                                <div className="score-value">{studentData.overallScore}</div>
                                <div className="score-label">OVERALL</div>
                            </div>
                        </div>
                    </div>

                    <IonGrid className="stats-grid">
                        <IonRow>
                            <IonCol size="6" size-md="3">
                                <IonCard className="stat-card">
                                    <IonCardContent>
                                        <IonIcon icon={trophyOutline} className="stat-icon quiz-icon" />
                                        <div className="stat-value">{studentData.quizzesCompleted}</div>
                                        <div className="stat-label">Quizzes Done</div>
                                    </IonCardContent>
                                </IonCard>
                            </IonCol>
                            <IonCol size="6" size-md="3">
                                <IonCard className="stat-card">
                                    <IonCardContent>
                                        <IonIcon icon={gameControllerOutline} className="stat-icon battle-icon" />
                                        <div className="stat-value">{studentData.battlesWon}/{studentData.totalBattles}</div>
                                        <div className="stat-label">Battles Won</div>
                                    </IonCardContent>
                                </IonCard>
                            </IonCol>
                            <IonCol size="6" size-md="3">
                                <IonCard className="stat-card">
                                    <IonCardContent>
                                        <IonIcon icon={ribbonOutline} className="stat-icon rank-icon" />
                                        <div className="stat-value">#{studentData.classRank}</div>
                                        <div className="stat-label">Class Rank</div>
                                    </IonCardContent>
                                </IonCard>
                            </IonCol>
                            <IonCol size="6" size-md="3">
                                <IonCard className="stat-card">
                                    <IonCardContent>
                                        <IonIcon icon={timeOutline} className="stat-icon time-icon" />
                                        <div className="stat-value">{studentData.studyTime}m</div>
                                        <div className="stat-label">Study Time</div>
                                    </IonCardContent>
                                </IonCard>
                            </IonCol>
                        </IonRow>
                    </IonGrid>

                    <IonGrid>
                        <IonRow>
                            <IonCol size="12">
                                <IonCard className="chart-card">
                                    <IonCardHeader>
                                        <IonCardTitle>Subject Performance</IonCardTitle>
                                        <p className="chart-subtitle">Click on any subject for detailed feedback</p>
                                    </IonCardHeader>
                                    <IonCardContent>
                                        <ResponsiveContainer width="100%" height={350}>
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={(entry) => `${entry.name}`}
                                                    outerRadius={70}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                    onClick={(data) => {
                                                        if (data && data.name) {
                                                            handlePieClick(data);
                                                        }
                                                    }}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {pieData.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={COLORS[index % COLORS.length]}
                                                            style={{ cursor: 'pointer' }}
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value) => `${value}%`} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </IonCardContent>
                                </IonCard>
                            </IonCol>

                            <IonCol size="12">
                                <IonCard className="chart-card">
                                    <IonCardHeader>
                                        <IonCardTitle>Weekly Quiz Scores</IonCardTitle>
                                    </IonCardHeader>
                                    <IonCardContent>
                                        <ResponsiveContainer width="100%" height={350}>
                                            <BarChart data={barData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="week" />
                                                <YAxis domain={[0, 100]} />
                                                <Tooltip formatter={(value) => `${value}%`} />
                                                <Bar dataKey="score" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </IonCardContent>
                                </IonCard>
                            </IonCol>

                            <IonCol size="12">
                                <IonCard className="chart-card">
                                    <IonCardHeader>
                                        <IonCardTitle>Progress Over Time</IonCardTitle>
                                    </IonCardHeader>
                                    <IonCardContent>
                                        <ResponsiveContainer width="100%" height={280}>
                                            <LineChart data={lineData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" />
                                                <YAxis domain={[0, 100]} />
                                                <Tooltip formatter={(value) => `${value}%`} />
                                                <Legend />
                                                <Line
                                                    type="monotone"
                                                    dataKey="score"
                                                    stroke="#10b981"
                                                    strokeWidth={3}
                                                    dot={{ r: 5 }}
                                                    activeDot={{ r: 7 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </IonCardContent>
                                </IonCard>
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </div>

                <IonModal
                    isOpen={showModal}
                    onDidDismiss={() => setShowModal(false)}
                    initialBreakpoint={0.75}
                    breakpoints={[0, 0.5, 0.75, 0.95]}
                >
                    <div style={{
                        padding: '24px',
                        background: selectedSubject?.color || '#667eea',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                            {selectedSubject?.subject} - {selectedSubject?.score}%
                        </h2>
                        <IonButton fill="clear" onClick={() => setShowModal(false)}>
                            <IonIcon icon={closeOutline} slot="icon-only" style={{ color: 'white', fontSize: '28px' }} />
                        </IonButton>
                    </div>

                    <div style={{
                        padding: '24px',
                        background: 'white',
                        minHeight: '60vh',
                        overflowY: 'auto'
                    }}>
                        {selectedSubject && (
                            <>
                                <div style={{ marginBottom: '30px', background: '#f0fdf4', padding: '20px', borderRadius: '12px', border: '2px solid #10b981' }}>
                                    <h3 style={{ color: '#10b981', fontSize: '1.3rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: '1.8rem' }} />
                                        Strengths
                                    </h3>
                                    {selectedSubject.strengths.map((strength, index) => (
                                        <div key={index} style={{
                                            background: 'rgba(16, 185, 129, 0.1)',
                                            padding: '15px',
                                            marginBottom: '10px',
                                            borderRadius: '8px',
                                            borderLeft: '4px solid #10b981'
                                        }}>
                                            <p style={{ margin: 0, color: '#065f46', fontSize: '1rem', lineHeight: '1.6' }}>
                                                {strength}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ marginBottom: '30px', background: '#fffbeb', padding: '20px', borderRadius: '12px', border: '2px solid #f59e0b' }}>
                                    <h3 style={{ color: '#f59e0b', fontSize: '1.3rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <IonIcon icon={warningOutline} style={{ fontSize: '1.8rem' }} />
                                        Areas for Improvement
                                    </h3>
                                    {selectedSubject.improvements.map((improvement, index) => (
                                        <div key={index} style={{
                                            background: 'rgba(245, 158, 11, 0.1)',
                                            padding: '15px',
                                            marginBottom: '10px',
                                            borderRadius: '8px',
                                            borderLeft: '4px solid #f59e0b'
                                        }}>
                                            <p style={{ margin: 0, color: '#92400e', fontSize: '1rem', lineHeight: '1.6' }}>
                                                {improvement}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </IonModal>
            </IonContent>
        </IonPage>
    );
};

export default StudentDetail;
