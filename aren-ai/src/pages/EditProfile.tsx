import React, { useState, useEffect } from 'react';
import {
    IonContent,
    IonHeader,
    IonPage,
    IonToolbar,
    IonButton,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonBackButton,
    IonButtons,
    IonSpinner,
    IonToast,
    useIonRouter
} from '@ionic/react';
import {
    chevronForward,
    saveOutline,
    personOutline,
    mailOutline
} from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { getUserData, saveUserData } from '../utils/userUtils';
import { userService } from '../services/userService';
import PageTransition from '../components/PageTransition';
import './EditProfile.css';

const EditProfile: React.FC = () => {
    const { t } = useTranslation();
    const router = useIonRouter();
    const currentUser = getUserData();

    const [name, setName] = useState(currentUser.name || '');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState(currentUser.email || '');
    const [isLoading, setIsLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

    useEffect(() => {
        // Load user data fresh
        const userData = getUserData();
        const fullName = userData.name || '';
        const nameParts = fullName.split(' ');

        if (nameParts.length > 1) {
            setName(nameParts[0]);
            setLastName(nameParts.slice(1).join(' '));
        } else {
            setName(fullName);
            setLastName('');
        }
        setEmail(userData.email || '');
    }, []);

    const handleSave = async () => {
        if (!name.trim()) {
            setToastMessage(t('editProfile.nameRequired') || 'Name is required');
            setToastColor('danger');
            setShowToast(true);
            return;
        }

        setIsLoading(true);

        try {
            // Try to update via API
            await userService.updateProfile({
                name: name.trim(),
                lastName: lastName.trim() || undefined,
                email: email.trim(),
            });

            // Update local storage
            const fullName = lastName.trim() ? `${name.trim()} ${lastName.trim()}` : name.trim();
            saveUserData({
                ...currentUser,
                name: fullName,
                email: email.trim(),
            });

            setToastMessage(t('editProfile.saveSuccess') || 'Profile updated successfully');
            setToastColor('success');
            setShowToast(true);

            // Navigate back after short delay
            setTimeout(() => {
                router.push('/professor-profile', 'back');
            }, 1000);
        } catch (error) {
            console.error('API update failed, saving locally:', error);
            // Fallback: save locally only
            const fullName = lastName.trim() ? `${name.trim()} ${lastName.trim()}` : name.trim();
            saveUserData({
                ...currentUser,
                name: fullName,
                email: email.trim(),
            });

            setToastMessage(t('editProfile.saveSuccess') || 'Profile updated successfully');
            setToastColor('success');
            setShowToast(true);

            setTimeout(() => {
                router.push('/professor-profile', 'back');
            }, 1000);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <IonPage className="profile-page-premium">
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton
                            defaultHref="/professor-profile"
                            className="back-button"
                            text=""
                            icon={chevronForward}
                            style={{ transform: 'rotate(180deg)' }}
                        />
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen className="edit-profile-content">
                <PageTransition>
                    {/* HERO SECTION */}
                    <div className="edit-hero-card">
                        <div className="profile-bg-pattern"></div>
                        <div className="edit-hero-content">
                            <h1>{t('editProfile.title') || 'Edit Profile'}</h1>
                            <p>{t('editProfile.subtitle') || 'Update your personal information'}</p>
                        </div>
                    </div>

                    <div className="edit-form-container">
                        {/* Name Input */}
                        <div className="input-group">
                            <IonLabel className="input-label">
                                <IonIcon icon={personOutline} />
                                {t('editProfile.firstName') || 'First Name'}
                            </IonLabel>
                            <IonItem className="modern-input" lines="none">
                                <IonInput
                                    value={name}
                                    placeholder={t('editProfile.firstNamePlaceholder') || 'Enter your first name'}
                                    onIonInput={(e) => setName(e.detail.value || '')}
                                />
                            </IonItem>
                        </div>

                        {/* Last Name Input */}
                        <div className="input-group">
                            <IonLabel className="input-label">
                                <IonIcon icon={personOutline} />
                                {t('editProfile.lastName') || 'Last Name'}
                            </IonLabel>
                            <IonItem className="modern-input" lines="none">
                                <IonInput
                                    value={lastName}
                                    placeholder={t('editProfile.lastNamePlaceholder') || 'Enter your last name'}
                                    onIonInput={(e) => setLastName(e.detail.value || '')}
                                />
                            </IonItem>
                        </div>

                        {/* Email Input */}
                        <div className="input-group">
                            <IonLabel className="input-label">
                                <IonIcon icon={mailOutline} />
                                {t('editProfile.email') || 'Email'}
                            </IonLabel>
                            <IonItem className="modern-input" lines="none">
                                <IonInput
                                    type="email"
                                    value={email}
                                    placeholder={t('editProfile.emailPlaceholder') || 'Enter your email'}
                                    onIonInput={(e) => setEmail(e.detail.value || '')}
                                />
                            </IonItem>
                        </div>

                        {/* Save Button */}
                        <IonButton
                            expand="block"
                            className="save-button"
                            onClick={handleSave}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <IonSpinner name="crescent" />
                            ) : (
                                <>
                                    <IonIcon slot="start" icon={saveOutline} />
                                    {t('editProfile.save') || 'Save Changes'}
                                </>
                            )}
                        </IonButton>
                    </div>
                </PageTransition>

                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={toastMessage}
                    duration={2000}
                    color={toastColor}
                    position="bottom"
                />
            </IonContent>
        </IonPage>
    );
};

export default EditProfile;
