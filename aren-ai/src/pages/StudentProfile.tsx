import React, { useState } from 'react';
import {
    IonPage,
    IonContent,
    IonIcon,
    useIonRouter,
    IonProgressBar,
    IonChip
} from '@ionic/react';
import {
    ribbonOutline,
    flame,
    timeOutline,
    trophyOutline,
    schoolOutline,
    star,
    pencilOutline,
    shieldCheckmark,
    flash,
    medal
} from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import StudentHeader from '../components/StudentHeader';
import AvatarSelector from '../components/AvatarSelector';
import './StudentProfile.css';

const StudentProfile: React.FC = () => {
    const { t } = useTranslation();
    const router = useIonRouter();

    // Map Avatar IDs to Assets (Should match Selector)
    const AVATAR_MAP: { [key: string]: string } = {
        'scholar': '/assets/profile_picture_capybara_eyes_open.png',
        'dreamer': '/assets/profile_picture_capybara_wink.png',
        'zen': '/assets/profile_picture_capybara_eyes_closed.png',
        'warrior': '/assets/battle_sprite_front_capybara.png',
    };

    const [currentAvatar, setCurrentAvatar] = useState<string>('scholar');
    const [showSelector, setShowSelector] = useState(false);

    // Mock User Data (Replace with real data later)
    const userData = {
        name: "Estudiante Modelo",
        level: 8,
        xp: 2450,
        nextLevelXp: 3000,
        title: "Erudito Legendario",
        streak: 12, // Days
        totalPoints: 2450,
        accuracy: 86,
        wins: 42,
        rank: "Diamante III"
    };

    const xpPercentage = userData.xp / userData.nextLevelXp;

    // Mock Badges (some unlocked, some locked)
    const badges = [
        { id: 'math_wizard', name: 'Mago Numérico', icon: '📐', unlocked: true, rarity: 'rare' },
        { id: 'science_whiz', name: 'Científico Loco', icon: '🧬', unlocked: true, rarity: 'common' },
        { id: 'early_bird', name: 'Madrugador', icon: '🌅', unlocked: false, rarity: 'common' },
        { id: 'streak_master', name: 'Imparable', icon: '🔥', unlocked: true, rarity: 'epic' },
        { id: 'quiz_master', name: 'Sabelotodo', icon: '🏆', unlocked: false, rarity: 'legendary' },
        { id: 'bookworm', name: 'Bibliotecario', icon: '📚', unlocked: true, rarity: 'rare' },
    ];

    return (
        <IonPage className="profile-page-premium">
            <StudentHeader
                pageTitle={t('profile.title') || 'Perfil de Jugador'}
                showNotch={false}
            />

            <IonContent fullscreen className="profile-content-premium">

                {/* HERO SECTION */}
                <div className="profile-hero-card">
                    <div className="profile-bg-pattern"></div>

                    <div className="avatar-section">
                        <div className="avatar-frame-premium" onClick={() => router.push('/character-detail')}>
                            <div className="avatar-glow"></div>
                            <img
                                src={AVATAR_MAP[currentAvatar]}
                                alt="Avatar"
                                className="main-avatar-img"
                            />
                            <div className="edit-btn-circle">
                                <IonIcon icon={pencilOutline} />
                            </div>
                            <div className="level-badge-premium">{userData.level}</div>
                        </div>
                    </div>

                    <div className="player-identity">
                        <h1 className="player-name">{userData.name}</h1>
                        <div className="player-title-badge">
                            <IonIcon icon={medal} /> {userData.title}
                        </div>
                    </div>

                    <div className="xp-status-container">
                        <div className="xp-labels">
                            <span>LVL {userData.level}</span>
                            <span>{userData.xp} / {userData.nextLevelXp} XP</span>
                        </div>
                        <IonProgressBar value={xpPercentage} className="xp-progress-bar"></IonProgressBar>
                    </div>
                </div>

                {/* STATS DECK */}
                <div className="profile-stats-deck">
                    <div className="stat-item-premium blue">
                        <div className="stat-icon-circle">
                            <IonIcon icon={trophyOutline} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-num">{userData.wins}</span>
                            <span className="stat-lbl">Victorias</span>
                        </div>
                    </div>
                    <div className="stat-item-premium fire">
                        <div className="stat-icon-circle">
                            <IonIcon icon={flame} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-num">{userData.streak}</span>
                            <span className="stat-lbl">Racha</span>
                        </div>
                    </div>
                    <div className="stat-item-premium green">
                        <div className="stat-icon-circle">
                            <IonIcon icon={shieldCheckmark} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-num">{userData.accuracy}%</span>
                            <span className="stat-lbl">Precisión</span>
                        </div>
                    </div>
                </div>

                {/* BADGES COLLECTION */}
                <div className="badges-section-premium">
                    <div className="badges-header">
                        <h3><IonIcon icon={ribbonOutline} /> Insignias</h3>
                        <span className="badges-count">{badges.filter(b => b.unlocked).length}/{badges.length}</span>
                    </div>

                    <div className="badges-grid-premium">
                        {badges.map((badge) => (
                            <div key={badge.id} className={`badge-card-premium ${badge.unlocked ? 'unlocked' : 'locked'} ${badge.rarity}`}>
                                <div className="badge-shine"></div>
                                <div className="badge-icon-premium">
                                    {badge.icon}
                                </div>
                                <div className="badge-name">{badge.name}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Avatar Selector Modal - Kept in code but unused if we navigate away */}
                {showSelector && (
                    <AvatarSelector
                        currentAvatar={currentAvatar}
                        onSelect={(id) => setCurrentAvatar(id)}
                        onClose={() => setShowSelector(false)}
                    />
                )}
            </IonContent>
        </IonPage>
    );
};

export default StudentProfile;
