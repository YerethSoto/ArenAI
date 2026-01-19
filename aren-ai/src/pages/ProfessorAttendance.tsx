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
} from '@ionic/react';
import {
    menu,
    checkmarkCircle,
    closeCircle,
    timeOutline,
    checkmarkDoneOutline,
    closeOutline,
    alarmOutline,
} from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { CalendarSelector } from '../components/CalendarSelector';
import PageTransition from '../components/PageTransition';
import '../components/StudentHeader.css';
import './ProfessorAttendance.css';

// Types
interface Student {
    id: number;
    username: string;
    email: string;
    avatar?: string;
}

type AttendanceStatus = 'present' | 'late' | 'absent';

const getLocalStudents = (): Student[] => {
    const stored = localStorage.getItem('professorStudentsList');
    if (stored) {
        return JSON.parse(stored);
    }
    const defaultStudents: Student[] = [
        { id: 1, username: 'Yereth Soto', email: 'yereth@arenai.edu' },
        { id: 2, username: 'Leonardo Escobar', email: 'leonardo@arenai.edu' },
        { id: 3, username: 'Sofia Mendez', email: 'sofia@arenai.edu' },
        { id: 4, username: 'Carlos Rivera', email: 'carlos@arenai.edu' },
        { id: 5, username: 'Maria Lopez', email: 'maria@arenai.edu' },
        { id: 6, username: 'Diego Castro', email: 'diego@arenai.edu' },
        { id: 7, username: 'Ana Garcia', email: 'ana@arenai.edu' },
        { id: 8, username: 'Pablo Sanchez', email: 'pablo@arenai.edu' },
    ];
    localStorage.setItem('professorStudentsList', JSON.stringify(defaultStudents));
    return defaultStudents;
};

interface AttendanceRecord {
    [dateKey: string]: {
        [studentId: number]: AttendanceStatus;
    };
}

const getAttendanceData = (): AttendanceRecord => {
    const stored = localStorage.getItem('attendanceRecords');
    if (stored) return JSON.parse(stored);
    return {};
};

const saveAttendanceData = (data: AttendanceRecord) => {
    localStorage.setItem('attendanceRecords', JSON.stringify(data));
};

const GRADES = ['7', '8', '9', '10', '11', '12'];
const SECTIONS = ['1', '2', '3', '4'];
const SUBJECTS = ['Math', 'Science', 'Social Studies', 'Spanish'];

const ProfessorAttendance: React.FC = () => {
    const { t } = useTranslation();

    const [selectedGrade, setSelectedGrade] = useState('7');
    const [selectedSection, setSelectedSection] = useState('1');
    const [selectedSubject, setSelectedSubject] = useState('Math');
    const [showDropdown, setShowDropdown] = useState(false);

    const [students, setStudents] = useState<Student[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [attendance, setAttendance] = useState<AttendanceRecord>({});
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        setStudents(getLocalStudents());
        setAttendance(getAttendanceData());
    }, []);

    const getDateKey = (date: Date) => date.toISOString().split('T')[0];

    const cycleAttendance = (studentId: number) => {
        const dateKey = getDateKey(selectedDate);
        const currentStatus: AttendanceStatus = attendance[dateKey]?.[studentId] ?? 'absent';

        let nextStatus: AttendanceStatus;
        if (currentStatus === 'absent') nextStatus = 'present';
        else if (currentStatus === 'present') nextStatus = 'late';
        else nextStatus = 'absent';

        const newAttendance = {
            ...attendance,
            [dateKey]: { ...attendance[dateKey], [studentId]: nextStatus }
        };
        setAttendance(newAttendance);
        saveAttendanceData(newAttendance);
    };

    const getStatus = (studentId: number): AttendanceStatus => {
        const dateKey = getDateKey(selectedDate);
        return attendance[dateKey]?.[studentId] ?? 'absent';
    };

    const markAll = (status: AttendanceStatus) => {
        const dateKey = getDateKey(selectedDate);
        const allStatus: { [id: number]: AttendanceStatus } = {};
        students.forEach(s => { allStatus[s.id] = status; });
        const newAttendance = { ...attendance, [dateKey]: allStatus };
        setAttendance(newAttendance);
        saveAttendanceData(newAttendance);
    };

    const getInitials = (name: string) => {
        const parts = name.split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    const getPresentCount = () => {
        const dateKey = getDateKey(selectedDate);
        return Object.values(attendance[dateKey] || {}).filter(s => s === 'present').length;
    };

    const getLateCount = () => {
        const dateKey = getDateKey(selectedDate);
        return Object.values(attendance[dateKey] || {}).filter(s => s === 'late').length;
    };

    const filteredStudents = students.filter(s =>
        s.username.toLowerCase().includes(searchText.toLowerCase())
    );

    const getStatusIcon = (status: AttendanceStatus) => {
        switch (status) {
            case 'present': return checkmarkCircle;
            case 'late': return timeOutline;
            case 'absent': return closeCircle;
        }
    };

    const getDisplayLabel = () => {
        const subjectLabel = t(`professor.dashboard.subjects.${selectedSubject.replace(/\s+/g, '')}`) || selectedSubject;
        return `${selectedGrade} - ${selectedSection} : ${subjectLabel}`;
    };

    return (
        <IonPage className="pa-page">
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
                    <div className="sh-brand-sub">Attendance</div>
                </div>

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
                            <span className="sh-subject-text pa-compact-text">
                                {getDisplayLabel()}
                            </span>
                        </div>
                    </div>
                </div>
            </IonHeader>

            {showDropdown && createPortal(
                <div className="pa-class-dropdown" onClick={(e) => e.stopPropagation()}>
                    <div className="pa-dropdown-section">
                        <div className="pa-dropdown-label">Grade</div>
                        <div className="pa-dropdown-options-row">
                            {GRADES.map(g => (
                                <div
                                    key={g}
                                    className={`pa-dropdown-chip ${selectedGrade === g ? 'selected' : ''}`}
                                    onClick={() => setSelectedGrade(g)}
                                >
                                    {g}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="pa-dropdown-section">
                        <div className="pa-dropdown-label">Section</div>
                        <div className="pa-dropdown-options-row">
                            {SECTIONS.map(s => (
                                <div
                                    key={s}
                                    className={`pa-dropdown-chip ${selectedSection === s ? 'selected' : ''}`}
                                    onClick={() => setSelectedSection(s)}
                                >
                                    {s}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="pa-dropdown-section">
                        <div className="pa-dropdown-label">Subject</div>
                        <div className="pa-dropdown-options-col">
                            {SUBJECTS.map(subj => (
                                <div
                                    key={subj}
                                    className={`pa-dropdown-option ${selectedSubject === subj ? 'selected' : ''}`}
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
                className="pa-content"
                fullscreen
                onClick={() => showDropdown && setShowDropdown(false)}
            >
                <PageTransition variant="fade">
                    <div className="pa-container">
                        <div className="pa-calendar-card">
                            <CalendarSelector
                                onDateSelect={(date) => setSelectedDate(date)}
                                title="Attendance"
                            />
                        </div>

                        <div className="pa-stats-bar">
                            <div className="pa-stats-counts">
                                <div className="pa-count-badge present">
                                    <IonIcon icon={checkmarkCircle} />
                                    <span>{getPresentCount()}</span>
                                </div>
                                <div className="pa-count-badge late">
                                    <IonIcon icon={timeOutline} />
                                    <span>{getLateCount()}</span>
                                </div>
                                <div className="pa-count-badge total">
                                    <span>{students.length} total</span>
                                </div>
                            </div>
                            <div className="pa-quick-actions">
                                <button className="pa-action-btn present" onClick={() => markAll('present')}>
                                    <IonIcon icon={checkmarkDoneOutline} />
                                </button>
                                <button className="pa-action-btn late" onClick={() => markAll('late')}>
                                    <IonIcon icon={alarmOutline} />
                                </button>
                                <button className="pa-action-btn absent" onClick={() => markAll('absent')}>
                                    <IonIcon icon={closeOutline} />
                                </button>
                            </div>
                        </div>

                        <div className="pa-search-container">
                            <IonSearchbar
                                className="pa-searchbar"
                                value={searchText}
                                onIonInput={(e) => setSearchText(e.detail.value || '')}
                                placeholder="Search students..."
                            />
                        </div>

                        <div className="pa-card">
                            <div className="pa-card-title">Student List</div>
                            <div className="pa-students-list">
                                {filteredStudents.map(student => {
                                    const status = getStatus(student.id);
                                    return (
                                        <div
                                            key={student.id}
                                            className={`pa-student-item ${status}`}
                                            onClick={() => cycleAttendance(student.id)}
                                        >
                                            <div className="pa-student-avatar">
                                                {getInitials(student.username)}
                                            </div>
                                            <div className="pa-student-info">
                                                <span className="pa-student-name">{student.username}</span>
                                                <span className="pa-student-email">{student.email}</span>
                                            </div>
                                            <div className={`pa-status-icon ${status}`}>
                                                <IonIcon icon={getStatusIcon(status)} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="pa-footer-spacer"></div>
                    </div>
                </PageTransition>
            </IonContent>
        </IonPage>
    );
};

export default ProfessorAttendance;
