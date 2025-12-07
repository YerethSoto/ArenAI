import React, { useContext } from 'react';
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
    useIonRouter,
    IonBackButton,
    IonButtons
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
import './ProfessorProfile.css';

const ProfessorProfile: React.FC = () => {
    const router = useIonRouter();
    const { theme, setTheme, availableThemes } = useTheme();

    const handleLogout = () => {
        // Clear local storage and redirect
        localStorage.removeItem("userRole");
        localStorage.removeItem("userData");
        // Force reload or redirect to login
        window.location.href = '/login';
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/page/professor" className="back-button" text="" icon={chevronForward} style={{ transform: 'rotate(180deg)' }} />
                    </IonButtons>
                    {/* Reuse new header style implicitly or standard toolbar text */}
                    <div className="header-brand" style={{ right: 'auto', left: '50%', transform: 'translateX(-50%)', bottom: 'auto', top: '15px' }}>
                        <div className="brand-text" style={{ alignItems: 'center' }}>
                            <div className="arenai" style={{ color: 'var(--ion-color-primary)' }}>Profile</div>
                        </div>
                    </div>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen class="prof-profile-content">
                <div className="profile-container">

                    {/* Profile Card */}
                    <div className="profile-card">
                        <div className="profile-avatar-large">
                            <IonIcon icon={person} />
                        </div>
                        <h2 className="profile-name">Yereth Soto</h2>
                        <p className="profile-title">Senior Mathematics Professor</p>
                        <p className="profile-email">yereth.soto@arenai.edu</p>

                        <IonButton fill="outline" className="edit-profile-btn">
                            <IonIcon slot="start" icon={createOutline} />
                            Edit Profile
                        </IonButton>
                    </div>

                    {/* Settings Group 1: Appearance */}
                    <div>
                        <h3 className="settings-section-title">Appearance</h3>
                        <IonList className="settings-list">
                            <IonItem className="settings-item" lines="full">
                                <IonIcon icon={colorPaletteOutline} slot="start" />
                                <IonLabel>Theme</IonLabel>
                                <IonSelect
                                    value={theme}
                                    interface="popover"
                                    onIonChange={e => setTheme(e.detail.value)}
                                    style={{ maxWidth: '150px' }}
                                >
                                    {availableThemes.map(t => (
                                        <IonSelectOption key={t} value={t}>
                                            {t === 'original-alter' ? 'Original (ALTER)' : t.charAt(0).toUpperCase() + t.slice(1)}
                                        </IonSelectOption>
                                    ))}
                                </IonSelect>
                            </IonItem>
                        </IonList>
                    </div>

                    {/* Settings Group 2: Notifications */}
                    <div>
                        <h3 className="settings-section-title">Notifications</h3>
                        <IonList className="settings-list">
                            <IonItem className="settings-item" lines="full">
                                <IonIcon icon={notificationsOutline} slot="start" />
                                <IonLabel>Class Alerts</IonLabel>
                                <IonToggle slot="end" checked={true} color="primary" />
                            </IonItem>
                            <IonItem className="settings-item" lines="none">
                                <IonIcon icon={moonOutline} slot="start" />
                                <IonLabel>Do Not Disturb</IonLabel>
                                <IonToggle slot="end" checked={false} color="primary" />
                            </IonItem>
                        </IonList>
                    </div>

                    {/* Settings Group 3: Support */}
                    <div>
                        <h3 className="settings-section-title">Support</h3>
                        <IonList className="settings-list">
                            <IonItem className="settings-item" button detail={true} lines="none">
                                <IonIcon icon={helpCircleOutline} slot="start" />
                                <IonLabel>Help Center</IonLabel>
                            </IonItem>
                        </IonList>
                    </div>

                    {/* Logout */}
                    <IonButton expand="block" fill="outline" className="logout-btn" onClick={handleLogout}>
                        <IonIcon slot="start" icon={logOutOutline} />
                        Log Out
                    </IonButton>

                </div>
            </IonContent>
        </IonPage>
    );
};

export default ProfessorProfile;
