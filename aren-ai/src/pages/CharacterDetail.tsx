import React, { useState } from 'react';
import {
    IonPage,
    IonContent,
    IonIcon,
    useIonRouter
} from '@ionic/react';
import {
    arrowBack,
    heart,
    flash,
    ribbon,
    checkmarkCircle
} from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import './CharacterDetail.css';

// ----------------------------------------------------------------------------
// Simple Radar Chart Component (SVG)
// ----------------------------------------------------------------------------
interface RadarStats {
    logic: number;
    creativity: number;
    focus: number;
    memory: number;
    speed: number;
}

const RadarChart: React.FC<{ stats: RadarStats }> = ({ stats }) => {
    // 5 Axis System
    // Angles: -90 (Top), -18, 54, 126, 198 degrees (approx for pentagon)
    const size = 100; // Radius
    const center = 100; // Center X,Y

    // Normalize stats to 0-1
    const p = {
        logic: stats.logic / 100,      // Top
        creativity: stats.creativity / 100, // Top Right
        focus: stats.focus / 100,      // Bottom Right
        memory: stats.memory / 100,    // Bottom Left
        speed: stats.speed / 100       // Top Left
    };

    // Calculate Coordinates
    // 1. Logic (Top) - 0 deg (-90 in svg space)
    const p1 = { x: center, y: center - (size * p.logic) };

    // 2. Creativity (Right Top) - 72 deg
    const p2 = {
        x: center + (size * p.creativity * Math.cos(Math.PI * -18 / 180)),
        y: center + (size * p.creativity * Math.sin(Math.PI * -18 / 180))
    };

    // 3. Focus (Right Bottom) - 144 deg
    const p3 = {
        x: center + (size * p.focus * Math.cos(Math.PI * 54 / 180)),
        y: center + (size * p.focus * Math.sin(Math.PI * 54 / 180))
    };

    // 4. Memory (Left Bottom) - 216 deg
    const p4 = {
        x: center + (size * p.memory * Math.cos(Math.PI * 126 / 180)),
        y: center + (size * p.memory * Math.sin(Math.PI * 126 / 180))
    };

    // 5. Speed (Left Top) - 288 deg
    const p5 = {
        x: center + (size * p.speed * Math.cos(Math.PI * 198 / 180)),
        y: center + (size * p.speed * Math.sin(Math.PI * 198 / 180))
    };

    const points = `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y} ${p5.x},${p5.y}`;

    return (
        <svg viewBox="0 0 200 200" className="cd-radar-svg">
            {/* Background Pentagon (Full) */}
            <polygon points="100,0 195,69 159,181 41,181 5,69" className="radar-bg" />
            {/* Inner Guides (Optional - simplified for now) */}

            {/* Stats Shape */}
            <polygon points={points} className="radar-shape" />
        </svg>
    );
};

// ----------------------------------------------------------------------------
// Main Page Component
// ----------------------------------------------------------------------------

const CharacterDetail: React.FC = () => {
    const { t } = useTranslation();
    const router = useIonRouter();

    // In a real app, 'equipped' would come from Context/Global State
    const [equippedAvatar, setEquippedAvatar] = useState('scholar');
    const [selectedAvatar, setSelectedAvatar] = useState('scholar');

    const AVATAR_KEYS = ['scholar', 'dreamer', 'zen', 'warrior'];

    const AVATAR_IMAGES: { [key: string]: string } = {
        'scholar': '/assets/profile_picture_capybara_eyes_open.png',
        'dreamer': '/assets/profile_picture_capybara_wink.png',
        'zen': '/assets/profile_picture_capybara_eyes_closed.png',
        'warrior': '/assets/battle_sprite_front_capybara.png', // Fallback to sprite for warrior
    };

    const handleBack = () => {
        router.goBack();
    };

    const handleSelectAvatar = (key: string) => {
        setSelectedAvatar(key);
        setEquippedAvatar(key); // Auto-equip on select
        // Here you would save to user profile/backend immediately
    };

    // Helper to get translated data safely
    const getData = (key: string, field: string) => {
        return t(`avatars.${key}.${field}`);
    };

    const getStats = (key: string): RadarStats => {
        const stats = t(`avatars.${key}.stats`, { returnObjects: true }) as any;
        // Fallback default stats if translation missing or error
        if (!stats || typeof stats !== 'object') {
            return { logic: 50, creativity: 50, focus: 50, memory: 50, speed: 50 };
        }
        return stats as RadarStats;
    };

    // Map avatars to their "Element/Theme" color
    const THEME_MAP: { [key: string]: string } = {
        'scholar': 'cryo',   // Blue/Ice
        'dreamer': 'electro', // Purple/Electric
        'zen': 'dendro',     // Green/Nature
        'warrior': 'pyro'    // Red/Fire
    };

    const currentTheme = THEME_MAP[selectedAvatar] || 'cryo';

    const stats = getStats(selectedAvatar);

    return (
        <IonPage className="character-detail-page" data-theme={currentTheme}>
            <div className="cd-background">
                <div className="cd-nebula"></div>
                <div className="cd-stars-1"></div>
                <div className="cd-stars-2"></div>
            </div>

            <IonContent fullscreen className="cd-content-wrapper">
                <div className="cd-content">

                    {/* Header Controls */}
                    <div className="cd-header">
                        <button className="cd-back-btn" onClick={handleBack}>
                            <IonIcon icon={arrowBack} />
                            {t('ui.back', 'Volver')}
                        </button>
                    </div>

                    {/* BIG SLANTED TITLE OVERLAY */}
                    <div className="cd-title-overlay">
                        <h1 className="cd-char-title-big">{getData(selectedAvatar, 'title')}</h1>
                        <div className="cd-char-subtitle-big">
                            <span className="cd-stars">★★★★★</span>
                            <span>{getData(selectedAvatar, 'origin')}</span>
                        </div>
                    </div>

                    <div className="cd-main-grid">

                        {/* Left: Showcase */}
                        <div className="cd-left-panel">
                            {/* Big background element icon or letter */}
                            <div className="cd-element-bg">
                                <IonIcon icon={flash} />
                            </div>

                            <img
                                src={AVATAR_IMAGES[selectedAvatar]}
                                alt={selectedAvatar}
                                className="cd-character-img"
                            />
                        </div>

                        {/* Right: Info */}
                        <div className="cd-right-panel">

                            {/* Story / Description */}
                            <div className="cd-story-section">
                                <p className="cd-story-text">
                                    "{getData(selectedAvatar, 'lore')}"
                                </p>
                            </div>

                            {/* Attributes Box */}
                            <div className="cd-attributes-grid">
                                <div className="cd-attr-box">
                                    <span className="cd-attr-label">{t('avatars.attributes.affiliation')}</span>
                                    <span className="cd-attr-value">
                                        <IonIcon icon={ribbon} />
                                        {getData(selectedAvatar, 'affiliation')}
                                    </span>
                                </div>
                                <div className="cd-attr-box">
                                    <span className="cd-attr-label">{t('avatars.actions.friendship')}</span>
                                    <span className="cd-attr-value" style={{ color: '#FF5252' }}>
                                        <IonIcon icon={heart} />
                                        Lv. 5
                                    </span>
                                </div>
                                {/* Added Origin if you want it in the box too, 
                                but user asked for "among their data" and slanted title often has origin/title 
                                I put Origin in subtitle above, let's also add Element here explicitly? 
                                Or simply swap Affiliation -> Origin? 
                                User asked for "Country of Origin in data". I replaced element in subtitle with origin 
                                and will keep affiliation here. 
                                */}
                            </div>

                            {/* Radar Chart */}
                            <div className="cd-radar-container">
                                <span className="cd-chart-title">Combat Stats</span>
                                <RadarChart stats={stats} />
                            </div>

                            <div style={{ height: '20px' }}></div>
                        </div>

                    </div>

                    {/* Bottom Bar: Selector Only (Centered) */}
                    <div className="cd-bottom-bar">
                        <div className="cd-avatar-list centered">
                            {AVATAR_KEYS.map(key => (
                                <div
                                    key={key}
                                    className={`cd-avatar-thumb ${selectedAvatar === key ? 'active' : ''}`}
                                    onClick={() => handleSelectAvatar(key)}
                                >
                                    <img src={AVATAR_IMAGES[key]} alt={key} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </IonContent>
        </IonPage>
    );
};

export default CharacterDetail;
