import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import './AvatarSelector.css';

interface AvatarSelectorProps {
    currentAvatar: string;
    onSelect: (avatarId: string) => void;
    onClose: () => void;
}

// Map Avatar IDs to Assets
const AVATAR_MAP: { [key: string]: string } = {
    'scholar': '/assets/profile_picture_capybara_eyes_open.png',
    'dreamer': '/assets/profile_picture_capybara_wink.png',
    'zen': '/assets/profile_picture_capybara_eyes_closed.png',
    'warrior': '/assets/battle_sprite_front_capybara.png', // Using sprite as placeholder for warrior portrait
};

const AvatarSelector: React.FC<AvatarSelectorProps> = ({ currentAvatar, onSelect, onClose }) => {
    const { t } = useTranslation();
    const [previewAvatar, setPreviewAvatar] = useState<string>(currentAvatar);

    const handleSelect = () => {
        onSelect(previewAvatar);
        onClose();
    };

    return (
        <div className="avatar-selector-overlay">
            <div className="avatar-selector-card">
                <button className="as-close-btn" onClick={onClose}>
                    <IonIcon icon={closeOutline} />
                </button>

                <div className="as-header">
                    <h2 className="as-title">{t('avatars.select')}</h2>
                </div>

                <div className="as-showcase">
                    <img
                        src={AVATAR_MAP[previewAvatar]}
                        alt="Selected Avatar"
                        className="as-showcase-img"
                    />
                </div>

                <div className="as-lore-panel">
                    <h3 className="as-role-title">{t(`avatars.${previewAvatar}.title`)}</h3>
                    <p className="as-role-desc">"{t(`avatars.${previewAvatar}.lore`)}"</p>
                </div>

                <div className="as-grid">
                    {Object.keys(AVATAR_MAP).map((avatarId) => (
                        <div
                            key={avatarId}
                            className={`as-icon-btn ${previewAvatar === avatarId ? 'selected' : ''}`}
                            onClick={() => setPreviewAvatar(avatarId)}
                        >
                            <img src={AVATAR_MAP[avatarId]} alt={avatarId} />
                            <span className="as-grid-label">{avatarId}</span>
                        </div>
                    ))}
                </div>

                <button className="as-select-btn" onClick={handleSelect}>
                    {t('avatars.select')}
                </button>
            </div>
        </div>
    );
};

export default AvatarSelector;
