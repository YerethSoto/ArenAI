import React from 'react';
import {
    IonContent,
    IonHeader,
    IonPage,
    IonToolbar,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonToggle,
    IonSelect,
    IonSelectOption,
    IonBackButton,
    IonButtons,
    useIonRouter
} from '@ionic/react';
import {
    person,
    createOutline,
    moonOutline,
    notificationsOutline,
    helpCircleOutline,
    logOutOutline,
    chevronForward,
    colorPaletteOutline
} from 'ionicons/icons';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { getUserData } from '../utils/userUtils';
import PageTransition from '../components/PageTransition';
import './ProfessorProfile.css';

const ProfessorProfile: React.FC = () => {
    const { theme, setTheme, availableThemes } = useTheme();
    const { t } = useTranslation();
    const router = useIonRouter();

    // Get real user data
    const currentUser = getUserData();

    const handleLogout = () => {
        // Clear local storage and redirect
        localStorage.removeItem("userRole");
        localStorage.removeItem("userData");
        // Force reload or redirect to login
        window.location.href = '/login';
    };

    return (
        <IonPage className="profile-page-premium">
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/page/professor" className="back-button" text="" icon={chevronForward} style={{ transform: 'rotate(180deg)' }} />
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen className="prof-profile-content">
                <PageTransition>
                    {/* HERO SECTION - Premium Style */}
                    <div className="profile-hero-card">
                        <div className="profile-bg-pattern"></div>

                        <div className="avatar-section-centered">
                            <div className="avatar-halo"></div>
                            <div className="avatar-frame-premium large">
                                <IonIcon icon={person} />
                            </div>
                        </div>

                        <div className="player-identity-centered">
                            <h1>{currentUser.name}</h1>
                            <div className="identity-subtitle">
                                {t('professor.profile.role')}
                            </div>
                            <div className="identity-email">
                                {currentUser.email}
                            </div>

                            <IonButton fill="clear" className="edit-profile-btn-hero" onClick={() => router.push('/edit-profile')}>
                                <IonIcon slot="start" icon={createOutline} />
                                {t('professor.profile.editProfile')}
                            </IonButton>
                        </div>
                    </div>

                    <div className="profile-content-container">
                        {/* Settings Group 1: Appearance */}
                        <div className="settings-section">
                            <h3 className="settings-section-title">{t('professor.profile.appearance')}</h3>
                            <IonList className="settings-list">
                                <IonItem className="settings-item" lines="full">
                                    <IonIcon icon={colorPaletteOutline} slot="start" />
                                    <IonLabel>{t('professor.profile.theme')}</IonLabel>
                                    <IonSelect
                                        value={theme}
                                        interface="popover"
                                        onIonChange={e => setTheme(e.detail.value)}
                                        className="theme-select"
                                    >
                                        {availableThemes.map(th => (
                                            <IonSelectOption key={th} value={th}>
                                                {th === 'original-alter' ? 'Original (ALTER)' : th.charAt(0).toUpperCase() + th.slice(1)}
                                            </IonSelectOption>
                                        ))}
                                    </IonSelect>
                                </IonItem>
                            </IonList>
                        </div>

                        {/* Settings Group 2: Notifications */}
                        <div className="settings-section">
                            <h3 className="settings-section-title">{t('professor.profile.notifications')}</h3>
                            <IonList className="settings-list">
                                <IonItem className="settings-item" lines="full">
                                    <IonIcon icon={notificationsOutline} slot="start" />
                                    <IonLabel>{t('professor.profile.classAlerts')}</IonLabel>
                                    <IonToggle slot="end" checked={true} color="primary" />
                                </IonItem>
                                <IonItem className="settings-item" lines="none">
                                    <IonIcon icon={moonOutline} slot="start" />
                                    <IonLabel>{t('professor.profile.dnd')}</IonLabel>
                                    <IonToggle slot="end" checked={false} color="primary" />
                                </IonItem>
                            </IonList>
                        </div>

                        {/* Settings Group 3: Support */}
                        <div className="settings-section">
                            <h3 className="settings-section-title">{t('professor.profile.support')}</h3>
                            <IonList className="settings-list">
                                <IonItem className="settings-item" button detail={true} lines="none">
                                    <IonIcon icon={helpCircleOutline} slot="start" />
                                    <IonLabel>{t('professor.profile.helpCenter')}</IonLabel>
                                </IonItem>
                            </IonList>
                        </div>

                        {/* Logout */}
                        <IonButton expand="block" fill="outline" className="logout-btn" onClick={handleLogout}>
                            <IonIcon slot="start" icon={logOutOutline} />
                            {t('professor.profile.logout')}
                        </IonButton>
                    </div>
                </PageTransition>
            </IonContent>
        </IonPage>
    );
};

export default ProfessorProfile;
