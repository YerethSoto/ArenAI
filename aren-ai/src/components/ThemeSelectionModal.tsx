import React, { useState } from 'react';
import {
    IonModal,
    IonContent,
    IonButton,
    IonText,
    IonIcon
} from '@ionic/react';
import { checkmarkCircle } from 'ionicons/icons';
import { useTheme, Theme } from '../context/ThemeContext';
import './ThemeSelectionModal.css';

interface ThemeSelectionModalProps {
    isOpen: boolean;
    onDismiss: () => void;
    onThemeSelected: (theme: Theme) => void;
}

const ThemeSelectionModal: React.FC<ThemeSelectionModalProps> = ({
    isOpen,
    onDismiss,
    onThemeSelected
}) => {
    const { availableThemes, setTheme } = useTheme();
    const [selectedTheme, setSelectedTheme] = useState<Theme>('original');

    const handleConfirm = () => {
        setTheme(selectedTheme);
        onThemeSelected(selectedTheme);
    };

    const handleSelect = (theme: Theme) => {
        setSelectedTheme(theme);
        setTheme(theme); // Live preview
    };

    return (
        <IonModal
            isOpen={isOpen}
            className="theme-selection-modal"
            backdropDismiss={false}
        >
            <IonContent>
                <div className="theme-modal-content">
                    <div className="theme-modal-header">
                        <h2 className="theme-modal-title">Welcome to Aren AI!</h2>
                        <p className="theme-modal-subtitle">Choose a theme to personalize your experience</p>
                    </div>

                    <div className="theme-grid">
                        {availableThemes.map((themeName) => (
                            <div
                                key={themeName}
                                className={`theme-card ${selectedTheme === themeName ? 'selected' : ''}`}
                                onClick={() => handleSelect(themeName)}
                            >
                                <div className={`theme-preview-box theme-preview-${themeName}`}>
                                    <div className="preview-primary-circle primary"></div>
                                    <div className="preview-secondary-bar secondary"></div>
                                    <div className="preview-tertiary-bar tertiary"></div>
                                </div>
                                <p className="theme-name">
                                    {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="theme-modal-footer">
                        <IonButton
                            expand="block"
                            className="select-button"
                            onClick={handleConfirm}
                        >
                            Continue with {selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)}
                            <IonIcon slot="end" icon={checkmarkCircle} />
                        </IonButton>
                    </div>
                </div>
            </IonContent>
        </IonModal>
    );
};

export default ThemeSelectionModal;
