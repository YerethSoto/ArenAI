import React, { useState, useEffect } from 'react';
import {
    IonPage,
    IonContent,
    IonIcon,
    IonHeader,
    IonToolbar,
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import {
    trophyOutline,
    gameControllerOutline,
    schoolOutline,
    flameOutline,
    timeOutline,
    arrowBack,
    menu,
} from 'ionicons/icons';
import './StudentDetail.css';
import '../components/StudentHeader.css';
import { getApiUrl } from '../config/api';

interface StudentDetailParams {
    username: string;
    subject: string;
}

const StudentDetail: React.FC = () => {
    const { username, subject } = useParams<StudentDetailParams>();
    const history = useHistory();
    const decodedUsername = decodeURIComponent(username || '');
    const decodedSubject = decodeURIComponent(subject || 'Math');

    const [studentData, setStudentData] = useState({
        name: decodedUsername,
        overallScore: 83,
        quizzesCompleted: 12,
        battlesWon: 8,
        totalBattles: 15,
        studyTime: 45,
        classRank: 3,
        streak: 5,
    });

    useEffect(() => {
        const fetchStudentStats = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const userStr = localStorage.getItem('user');
                const currentUser = userStr ? JSON.parse(userStr) : null;
                const userId = currentUser?.id;

                if (userId) {
                    const response = await fetch(getApiUrl(`api/students/${userId}/stats`), {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.ok) {
                        const stats = await response.json();
                        setStudentData(prev => ({
                            ...prev,
                            quizzesCompleted: stats.quizzesCompleted || 0,
                            battlesWon: stats.battlesWon || 0,
                            totalBattles: stats.totalBattles || 0,
                            classRank: stats.classRank || 0,
                            overallScore: stats.quizAvgScore || 0,
                        }));
                    }
                }
            } catch (err) {
                console.error('Error fetching student stats:', err);
            }
        };

        fetchStudentStats();
    }, [decodedUsername]);

    const getInitials = (name: string) => {
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const getScoreColor = (score: number) => {
        if (score >= 85) return '#2ecc71';
        if (score >= 70) return '#f39c12';
        return '#e74c3c';
    };

    return (
        <IonPage className="sd-page">
            {/* Header - Same as student-header-container but with back button */}
            <IonHeader className="student-header-container sd-header-override">
                <IonToolbar className="student-toolbar">
                    <div className="sh-content">
                        <div className="sh-menu-btn-container">
                            <button className="sd-back-button" onClick={() => history.goBack()}>
                                <IonIcon icon={arrowBack} />
                                <span>Back</span>
                            </button>
                        </div>
                    </div>
                </IonToolbar>

                <div className="sh-brand-container-absolute">
                    <div className="sh-brand-name">ArenAI</div>
                    <div className="sh-brand-sub">Student</div>
                </div>

                <div className="sh-notch-container">
                    <div className="sh-notch">
                        <div className="sh-subject-display">
                            <span className="sh-subject-text">{decodedSubject}</span>
                        </div>
                    </div>
                </div>
            </IonHeader>

            <IonContent fullscreen className="sd-content">
                <div className="sd-scroll-content">
                    {/* Profile Card */}
                    <div className="sd-profile-card">
                        {/* Rank Badge */}
                        <div className="sd-rank-badge">
                            <IonIcon icon={trophyOutline} className="sd-rank-icon" />
                            <div className="sd-rank-number">#{studentData.classRank}</div>
                            <div className="sd-rank-label">CLASS RANK</div>
                        </div>

                        {/* Avatar */}
                        <div className="sd-avatar">
                            {getInitials(decodedUsername)}
                        </div>

                        {/* Name */}
                        <h1 className="sd-name">{decodedUsername}</h1>

                        {/* Overall Score */}
                        <div className="sd-overall-badge">
                            <span className="sd-overall-value" style={{ color: getScoreColor(studentData.overallScore) }}>
                                {studentData.overallScore}
                            </span>
                            <span className="sd-overall-label">OVERALL</span>
                        </div>
                    </div>

                    {/* Stats Container */}
                    <div className="sd-stats-container">
                        <div className="sd-stat-card">
                            <div className="sd-stat-icon-wrapper quiz">
                                <IonIcon icon={schoolOutline} />
                            </div>
                            <div className="sd-stat-info">
                                <span className="sd-stat-label">QUIZZES DONE</span>
                                <span className="sd-stat-value">{studentData.quizzesCompleted}</span>
                            </div>
                        </div>

                        <div className="sd-stat-card">
                            <div className="sd-stat-icon-wrapper battles">
                                <IonIcon icon={gameControllerOutline} />
                            </div>
                            <div className="sd-stat-info">
                                <span className="sd-stat-label">BATTLES WON</span>
                                <span className="sd-stat-value">{studentData.battlesWon}/{studentData.totalBattles}</span>
                            </div>
                        </div>

                        <div className="sd-stat-card">
                            <div className="sd-stat-icon-wrapper streak">
                                <IonIcon icon={flameOutline} />
                            </div>
                            <div className="sd-stat-info">
                                <span className="sd-stat-label">STREAK</span>
                                <span className="sd-stat-value success">{studentData.streak} days</span>
                            </div>
                        </div>

                        <div className="sd-stat-card">
                            <div className="sd-stat-icon-wrapper time">
                                <IonIcon icon={timeOutline} />
                            </div>
                            <div className="sd-stat-info">
                                <span className="sd-stat-label">STUDY TIME</span>
                                <span className="sd-stat-value">{studentData.studyTime}m</span>
                            </div>
                        </div>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default StudentDetail;
