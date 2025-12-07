import React, { useState, useEffect } from 'react';
import {
    IonPage,
    IonContent,
    IonHeader,
    IonToolbar,
    IonMenuButton,
    IonIcon,
    IonButton,
    IonToast
} from '@ionic/react';
import { menu, saveOutline, checkmarkCircle } from 'ionicons/icons';
import './ProfessorAdmin.css';
import ProfessorMenu from '../components/ProfessorMenu';

interface StudentData {
    id: string;
    username: string;
    score: number;
    attendance: 'present' | 'absent' | 'late';
}

const ProfessorAdmin: React.FC = () => {
    // Mock Data - In a real app, this would come from an API
    const initialData: { [key: string]: StudentData[] } = {
        'Math-1': [
            { id: '1', username: 'Yereth Soto', score: 82, attendance: 'present' },
            { id: '2', username: 'Leonardo Escobar', score: 45, attendance: 'absent' },
            { id: '3', username: 'Barack Obama', score: 88, attendance: 'present' },
            { id: '4', username: 'Alice Johnson', score: 92, attendance: 'present' },
            { id: '5', username: 'Bob Martin', score: 78, attendance: 'late' },
        ],
        'Science-1': [
            { id: '1', username: 'Yereth Soto', score: 88, attendance: 'present' },
            { id: '2', username: 'Leonardo Escobar', score: 52, attendance: 'present' },
        ]
        // Add more mock data as needed for other sections/subjects
    };

    const [selectedSection, setSelectedSection] = useState('1');
    const [selectedGrade, setSelectedGrade] = useState('7');
    const [selectedSubject, setSelectedSubject] = useState('Math');
    const [students, setStudents] = useState<StudentData[]>([]);
    const [showToast, setShowToast] = useState(false);

    // Load students when filters change
    useEffect(() => {
        // Simulating data fetch based on filters
        // For demo purposes, we'll just use a composite key or fallback to empty
        const key = `${selectedSubject}-${selectedSection}`;
        setStudents(initialData[key] || initialData['Math-1']); // Fallback to Math-1 for demo
    }, [selectedSubject, selectedSection, selectedGrade]);

    const handleAttendanceChange = (id: string, status: 'present' | 'absent' | 'late') => {
        setStudents(students.map(student =>
            student.id === id ? { ...student, attendance: status } : student
        ));
    };

    const handleScoreChange = (id: string, newScore: string) => {
        const score = parseInt(newScore);
        if (!isNaN(score) && score >= 0 && score <= 100) {
            setStudents(students.map(student =>
                student.id === id ? { ...student, score: score } : student
            ));
        }
    };

    const handleSave = () => {
        // Here you would send the updated data to the backend
        console.log('Saving data:', students);
        setShowToast(true);
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const getScoreColor = (score: number) => {
        if (score >= 85) return 'high';
        if (score >= 70) return 'medium';
        return 'low';
    };

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
                                <div className="teacher">Admin</div>
                            </div>
                        </div>
                    </div>
                </IonToolbar>
            </IonHeader>

            <IonContent className="admin-content">
                <div className="admin-container">
                    <div className="admin-header-section">
                        <h1 className="admin-title">Class Management</h1>
                        <p className="admin-subtitle">
                            {selectedSubject} • Grade {selectedGrade} • Section {selectedSection}
                        </p>
                    </div>

                    <div className="admin-grid">
                        {students.map(student => (
                            <div key={student.id} className="student-admin-card">
                                <div className="admin-card-content">
                                    <div className="student-admin-header">
                                        <div className="admin-avatar">
                                            {getInitials(student.username)}
                                        </div>
                                        <div className="admin-student-info">
                                            <h3>{student.username}</h3>
                                            <span className="admin-student-id">ID: {student.id.padStart(4, '0')}</span>
                                        </div>
                                    </div>

                                    <div className="admin-controls">
                                        <div className="control-group">
                                            <span className="control-label">Attendance</span>
                                            <div className="attendance-toggles">
                                                <button
                                                    className={`attendance-btn present ${student.attendance === 'present' ? 'active' : ''}`}
                                                    onClick={() => handleAttendanceChange(student.id, 'present')}
                                                >
                                                    Present
                                                </button>
                                                <button
                                                    className={`attendance-btn late ${student.attendance === 'late' ? 'active' : ''}`}
                                                    onClick={() => handleAttendanceChange(student.id, 'late')}
                                                >
                                                    Late
                                                </button>
                                                <button
                                                    className={`attendance-btn absent ${student.attendance === 'absent' ? 'active' : ''}`}
                                                    onClick={() => handleAttendanceChange(student.id, 'absent')}
                                                >
                                                    Absent
                                                </button>
                                            </div>
                                        </div>

                                        <div className="control-group">
                                            <span className="control-label">Current Grade</span>
                                            <div className="grade-input-container">
                                                <input
                                                    type="number"
                                                    className="grade-input"
                                                    value={student.score}
                                                    onChange={(e) => handleScoreChange(student.id, e.target.value)}
                                                    min="0"
                                                    max="100"
                                                />
                                                <span className={`grade-badge ${getScoreColor(student.score)}`}>
                                                    {student.score >= 85 ? 'Excellent' : student.score >= 70 ? 'Good' : 'Needs Work'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="save-fab">
                    <IonButton className="save-btn" onClick={handleSave}>
                        <IonIcon slot="start" icon={saveOutline} />
                        Save Changes
                    </IonButton>
                </div>

                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message="Changes saved successfully"
                    duration={2000}
                    position="bottom"
                    color="success"
                    icon={checkmarkCircle}
                />
            </IonContent>
        </IonPage>
    );
};

export default ProfessorAdmin;
