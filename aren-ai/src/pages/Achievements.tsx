import React, { useState } from 'react';
import {
    IonPage,
    IonContent,
    IonIcon,
    useIonRouter
} from '@ionic/react';
import {
    arrowBack,
    trophy,
    lockClosed
} from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import PageTransition from '../components/PageTransition';
import './Achievements.css';

import { Achievement } from '../types/student';

// ...

const Achievements: React.FC = () => {
    const { t } = useTranslation();
    const router = useIonRouter();
    const [filter, setFilter] = useState<'all' | 'study' | 'combat' | 'social'>('all');

    // MOCK DATA (Ideally moved to a service, but typing is the first step)
    const ACHIEVEMENTS_DATA: Achievement[] = [
        { id: 'first_login', category: 'social', icon: '👋', maxProgress: 1, currentProgress: 1, rewardValue: 50, rewardType: 'XP' },
        { id: 'math_wizard', category: 'study', icon: '📐', maxProgress: 1, currentProgress: 1, rewardValue: 200, rewardType: 'XP' },
        { id: 'battle_champion', category: 'combat', icon: '⚔️', maxProgress: 5, currentProgress: 3, rewardValue: 100, rewardType: 'Coins' },
        { id: 'quiz_master', category: 'study', icon: '🧠', maxProgress: 10, currentProgress: 4, rewardValue: 300, rewardType: 'XP' },
        { id: 'bookworm', category: 'study', icon: '📚', maxProgress: 50, currentProgress: 12, rewardValue: 150, rewardType: 'XP' },
        { id: 'streak_master', category: 'study', icon: '🔥', maxProgress: 7, currentProgress: 7, rewardValue: 500, rewardType: 'Coins' },
        { id: 'social_butterfly', category: 'social', icon: '🦋', maxProgress: 5, currentProgress: 2, rewardValue: 100, rewardType: 'XP' }
    ];

    // ...

    // Filter Logic
    const filteredList = filter === 'all'
        ? ACHIEVEMENTS_DATA
        : ACHIEVEMENTS_DATA.filter(a => a.category === filter);

    const handleBack = () => {
        router.goBack();
    };

    // Calculate Totals
    const totalUnlocked = ACHIEVEMENTS_DATA.filter(a => a.currentProgress >= a.maxProgress).length;
    const totalScore = ACHIEVEMENTS_DATA.reduce((acc, curr) => {
        return curr.currentProgress >= curr.maxProgress ? acc + 10 : acc; // Arbitrary score points
    }, 0);


    return (
        <IonPage className="achievements-page">

            {/* Removed custom background div to allow global theme background */}

            <IonContent fullscreen className="student-page-content">
                <PageTransition>
                    <div className="ach-content">

                        {/* Header */}
                        <div className="ach-header">
                            <button
                                className="ach-back-btn"
                                onClick={handleBack}
                                style={{
                                    background: 'var(--ion-card-background)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    color: 'var(--ion-color-dark)',
                                    cursor: 'pointer'
                                }}
                            >
                                <IonIcon icon={arrowBack} />
                            </button>

                            <div className="ach-total-score">
                                <IonIcon icon={trophy} />
                                <span>{totalScore} pts</span>
                            </div>
                        </div>

                        <h1 className="ach-title">{t('achievements.pageTitle', 'Sala de Logros')}</h1>

                        {/* Filters */}
                        <div className="ach-filters">
                            {(['all', 'study', 'combat', 'social'] as const).map(cat => (
                                <button
                                    key={cat}
                                    className={`ach-filter-btn ${filter === cat ? 'active' : ''}`}
                                    onClick={() => setFilter(cat)}
                                    data-cat={cat}
                                >
                                    {t(`achievements.filters.${cat}`)}
                                </button>
                            ))}
                        </div>

                        {/* List */}
                        <div className="ach-list">
                            {filteredList.map(item => {
                                const isUnlocked = item.currentProgress >= item.maxProgress;
                                const percent = Math.min(100, (item.currentProgress / item.maxProgress) * 100);

                                return (
                                    <div
                                        key={item.id}
                                        className={`student-card ach-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                                        data-cat={item.category}
                                    >
                                        <div className="ach-icon-wrapper">
                                            {isUnlocked ? item.icon : <IonIcon icon={lockClosed} />}
                                        </div>

                                        <div className="ach-info">
                                            <h3 className="ach-name">{t(`achievements.items.${item.id}.title`)}</h3>
                                            <p className="ach-desc">{t(`achievements.items.${item.id}.description`)}</p>

                                            <div className="ach-progress-container">
                                                <div className="ach-progress-fill" style={{ width: `${percent}%` }}></div>
                                            </div>

                                            <div className="ach-progress-text">
                                                <span>{isUnlocked ? t('achievements.ui.unlocked') : t('achievements.ui.progress')}</span>
                                                <span>{item.currentProgress} / {item.maxProgress}</span>
                                            </div>
                                        </div>

                                        {/* Reward Badge */}
                                        {isUnlocked && (
                                            <div className="ach-reward-badge">
                                                +{item.rewardValue} {item.rewardType}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                    </div>
                </PageTransition>
            </IonContent>
        </IonPage>
    );
};

export default Achievements;
