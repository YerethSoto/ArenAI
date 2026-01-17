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
import { achievementsService } from '../services/achievementsService';
import { useIonViewWillEnter } from '@ionic/react';

// ...

const Achievements: React.FC = () => {
    const { t } = useTranslation();
    const router = useIonRouter();
    const [filter, setFilter] = useState<'all' | 'study' | 'combat' | 'social'>('all');

    const [achievements, setAchievements] = useState<Achievement[]>([]);

    useIonViewWillEnter(() => {
        setAchievements(achievementsService.getAchievements());
    });

    // Filter Logic
    const filteredList = filter === 'all'
        ? achievements
        : achievements.filter(a => a.category === filter);

    const handleBack = () => {
        router.goBack();
    };

    // Calculate Totals
    const totalUnlocked = achievements.filter(a => a.currentProgress >= a.maxProgress).length;
    const totalScore = achievements.reduce((acc, curr) => {
        return curr.currentProgress >= curr.maxProgress ? acc + 10 : acc;
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
                                            <h3 className="ach-name">{item.titleKey ? t(item.titleKey) : item.name}</h3>
                                            <p className="ach-desc">{item.descKey ? t(item.descKey) : ''}</p>

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
