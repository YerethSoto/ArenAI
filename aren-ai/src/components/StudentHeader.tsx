import React from 'react';
import {
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonIcon
} from '@ionic/react';
import { menu } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import StudentMenu from './StudentMenu';
import './StudentHeader.css';

interface StudentHeaderProps {
    pageTitle?: string;
    showSubject?: boolean;
    selectedSubject?: string;
    onSubjectChange?: (subject: string) => void;
    showNotch?: boolean;
}

const StudentHeader: React.FC<StudentHeaderProps> = ({
    pageTitle,
    showSubject = false,
    selectedSubject = 'Math',
    onSubjectChange,
    showNotch = true
}) => {
    const { t } = useTranslation();

    // Helper to get subject translation key (reused logic)
    const getSubjectKey = (subject: string) => {
        const keyMap: { [key: string]: string } = {
            'Math': 'Math',
            'Science': 'Science',
            'Social Studies': 'SocialStudies',
            'Spanish': 'Spanish'
        };
        return `mainStudent.subjects.${keyMap[subject] || subject}`;
    };

    return (
        <IonHeader className="student-header-container">
            <IonToolbar color="primary" className="student-toolbar">
                <div className="sh-content">
                    {/* Menu Button */}
                    <IonButtons slot="start" className="sh-menu-btn-container">
                        <IonMenuButton className="sh-menu-btn">
                            <IonIcon icon={menu} />
                        </IonMenuButton>
                    </IonButtons>

                    {/* Brand / Title */}
                    <div className="sh-brand-container">
                        <div className="sh-brand-name">ArenAI</div>
                        <div className="sh-brand-sub">
                            {pageTitle ? t(pageTitle) : t('mainStudent.brandSub')}
                        </div>
                    </div>
                </div>
            </IonToolbar>

            {/* Notch / Subject Pill - Moved outside Toolbar to avoid clipping */}
            {showNotch && (
                <div className="sh-notch-container">
                    <div className="sh-notch">
                        {showSubject ? (
                            <div className="sh-subject-display">
                                {onSubjectChange ? (
                                    <StudentMenu
                                        selectedSubject={t(getSubjectKey(selectedSubject))}
                                        onSubjectChange={onSubjectChange}
                                        variant="header"
                                    />
                                ) : (
                                    <span className="sh-subject-text">
                                        {t(getSubjectKey(selectedSubject))}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <div className="sh-notch-decoration"></div>
                        )}
                    </div>
                </div>
            )}
        </IonHeader>
    );
};

export default StudentHeader;
