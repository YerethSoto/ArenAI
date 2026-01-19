import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    IonPage,
    IonContent,
    IonIcon,
    IonHeader,
    IonToolbar,
    IonMenuButton,
    IonSearchbar,
    useIonRouter,
} from '@ionic/react';
import {
    menu,
    trophyOutline,
    flameOutline,
    schoolOutline,
    gameControllerOutline,
} from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import PageTransition from '../components/PageTransition';
import '../components/StudentHeader.css';
import './ProfessorStudents.css';

// Types
interface Student {
    id: number;
    username: string;
    email: string;
    avatar?: string;
    stats: {
        averageScore: number;
        quizzesTaken: number;
        battlesWon: number;
        streak: number;
    };
}

// Mock students data
const getLocalStudents = (): Student[] => {
    const stored = localStorage.getItem('professorStudentsData');
    if (stored) {
        return JSON.parse(stored);
    }
    const defaultStudents: Student[] = [
        { id: 1, username: 'Yereth Soto', email: 'yereth@arenai.edu', stats: { averageScore: 82, quizzesTaken: 15, battlesWon: 8, streak: 5 } },
        { id: 2, username: 'Leonardo Escobar', email: 'leonardo@arenai.edu', stats: { averageScore: 78, quizzesTaken: 12, battlesWon: 6, streak: 3 } },
        { id: 3, username: 'Sofia Mendez', email: 'sofia@arenai.edu', stats: { averageScore: 91, quizzesTaken: 18, battlesWon: 12, streak: 7 } },
        { id: 4, username: 'Carlos Rivera', email: 'carlos@arenai.edu', stats: { averageScore: 75, quizzesTaken: 10, battlesWon: 4, streak: 2 } },
        { id: 5, username: 'Maria Lopez', email: 'maria@arenai.edu', stats: { averageScore: 88, quizzesTaken: 14, battlesWon: 9, streak: 4 } },
        { id: 6, username: 'Diego Castro', email: 'diego@arenai.edu', stats: { averageScore: 72, quizzesTaken: 8, battlesWon: 3, streak: 1 } },
        { id: 7, username: 'Ana Garcia', email: 'ana@arenai.edu', stats: { averageScore: 95, quizzesTaken: 20, battlesWon: 15, streak: 10 } },
        { id: 8, username: 'Pablo Sanchez', email: 'pablo@arenai.edu', stats: { averageScore: 80, quizzesTaken: 11, battlesWon: 5, streak: 2 } },
    ];
    localStorage.setItem('professorStudentsData', JSON.stringify(defaultStudents));
    return defaultStudents;
};

const GRADES = ['7', '8', '9', '10', '11', '12'];
const SECTIONS = ['1', '2', '3', '4'];
const SUBJECTS = ['Math', 'Science', 'Social Studies', 'Spanish'];

const ProfessorStudents: React.FC = () => {
    const router = useIonRouter();
    const { t } = useTranslation();

    const [selectedGrade, setSelectedGrade] = useState('7');
    const [selectedSection, setSelectedSection] = useState('1');
    const [selectedSubject, setSelectedSubject] = useState('Math');
    const [showDropdown, setShowDropdown] = useState(false);

    const [students, setStudents] = useState<Student[]>([]);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        setStudents(getLocalStudents());
    }, []);

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

    const handleStudentClick = (student: Student) => {
        const encodedUsername = encodeURIComponent(student.username);
        router.push(`/teacher-student-detail/${encodedUsername}/${selectedSubject}`);
    };

    const filteredStudents = students.filter(s =>
        s.username.toLowerCase().includes(searchText.toLowerCase()) ||
        s.email.toLowerCase().includes(searchText.toLowerCase())
    );

    const classAverage = students.length > 0
        ? Math.round(students.reduce((acc, s) => acc + s.stats.averageScore, 0) / students.length)
        : 0;

    // Get display label for current selection
    const getDisplayLabel = () => {
        const subjectLabel = t(`professor.dashboard.subjects.${selectedSubject.replace(/\s+/g, '')}`) || selectedSubject;
        return `${selectedGrade} - ${selectedSection} : ${subjectLabel}`;
    };

    return (
        <IonPage className="pst-page">
            {/* Header */}
            <IonHeader className="student-header-container">
                <IonToolbar className="student-toolbar">
                    <div className="sh-content">
                        <div className="sh-menu-btn-container">
                            <IonMenuButton className="sh-menu-btn">
                                <IonIcon icon={menu} />
                            </IonMenuButton>
                        </div>
                    </div>
                </IonToolbar>

                <div className="sh-brand-container-absolute">
                    <div className="sh-brand-name">ArenAI</div>
                    <div className="sh-brand-sub">Students</div>
                </div>

                {/* Original Notch with Oval - Now showing Grade-Section:Subject */}
                <div className="sh-notch-container">
                    <div className="sh-notch">
                        <div
                            className="sh-subject-display interactive"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowDropdown(!showDropdown);
                            }}
                            style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                        >
                            <span className="sh-subject-text pst-compact-text">
                                {getDisplayLabel()}
                            </span>
                        </div>
                    </div>
                </div>
            </IonHeader>

            {/* Dropdown Portal */}
            {showDropdown && createPortal(
                <div className="pst-class-dropdown" onClick={(e) => e.stopPropagation()}>
                    <div className="pst-dropdown-section">
                        <div className="pst-dropdown-label">Grade</div>
                        <div className="pst-dropdown-options-row">
                            {GRADES.map(g => (
                                <div
                                    key={g}
                                    className={`pst-dropdown-chip ${selectedGrade === g ? 'selected' : ''}`}
                                    onClick={() => setSelectedGrade(g)}
                                >
                                    {g}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="pst-dropdown-section">
                        <div className="pst-dropdown-label">Section</div>
                        <div className="pst-dropdown-options-row">
                            {SECTIONS.map(s => (
                                <div
                                    key={s}
                                    className={`pst-dropdown-chip ${selectedSection === s ? 'selected' : ''}`}
                                    onClick={() => setSelectedSection(s)}
                                >
                                    {s}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="pst-dropdown-section">
                        <div className="pst-dropdown-label">Subject</div>
                        <div className="pst-dropdown-options-col">
                            {SUBJECTS.map(subj => (
                                <div
                                    key={subj}
                                    className={`pst-dropdown-option ${selectedSubject === subj ? 'selected' : ''}`}
                                    onClick={() => {
                                        setSelectedSubject(subj);
                                        setShowDropdown(false);
                                    }}
                                >
                                    {t(`professor.dashboard.subjects.${subj.replace(/\s+/g, '')}`) || subj}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <IonContent
                className="pst-content"
                fullscreen
                onClick={() => showDropdown && setShowDropdown(false)}
            >
                <PageTransition variant="fade">
                    <div className="pst-container">
                        {/* Class Stats Card */}
                        <div className="pst-card">
                            <div className="pst-card-title">Class Overview</div>

                            <div className="pst-stats-row">
                                <div className="pst-stat-item">
                                    <div className="pst-stat-circle">
                                        <IonIcon icon={schoolOutline} />
                                    </div>
                                    <div className="pst-stat-info">
                                        <span className="pst-stat-value">{students.length}</span>
                                        <span className="pst-stat-label">Students</span>
                                    </div>
                                </div>
                                <div className="pst-stat-item">
                                    <div className="pst-stat-circle average" style={{ backgroundColor: getScoreColor(classAverage) }}>
                                        <IonIcon icon={trophyOutline} />
                                    </div>
                                    <div className="pst-stat-info">
                                        <span className="pst-stat-value">{classAverage}%</span>
                                        <span className="pst-stat-label">Average</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search Section */}
                        <div className="pst-search-container">
                            <IonSearchbar
                                className="pst-searchbar"
                                value={searchText}
                                onIonInput={(e) => setSearchText(e.detail.value || '')}
                                placeholder="Search students..."
                            />
                        </div>

                        {/* Students Card */}
                        <div className="pst-card">
                            <div className="pst-card-title">Students</div>

                            <div className="pst-students-grid">
                                {filteredStudents.map(student => (
                                    <div
                                        key={student.id}
                                        className="pst-student-item"
                                        onClick={() => handleStudentClick(student)}
                                    >
                                        <div className="pst-student-avatar">
                                            {getInitials(student.username)}
                                        </div>
                                        <div className="pst-student-info">
                                            <span className="pst-student-name">{student.username}</span>
                                            <div className="pst-student-stats">
                                                <span className="pst-mini-stat">
                                                    <IonIcon icon={schoolOutline} />
                                                    {student.stats.quizzesTaken}
                                                </span>
                                                <span className="pst-mini-stat">
                                                    <IonIcon icon={gameControllerOutline} />
                                                    {student.stats.battlesWon}
                                                </span>
                                                <span className="pst-mini-stat streak">
                                                    <IonIcon icon={flameOutline} />
                                                    {student.stats.streak}
                                                </span>
                                            </div>
                                        </div>
                                        <div
                                            className="pst-score-badge"
                                            style={{ backgroundColor: getScoreColor(student.stats.averageScore) }}
                                        >
                                            {student.stats.averageScore}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pst-footer-spacer"></div>
                    </div>
                </PageTransition>
            </IonContent>
        </IonPage>
    );
};

export default ProfessorStudents;
