import React, { useState } from "react";
import {
  IonPage,
  IonContent,
  IonIcon,
  useIonRouter,
  IonProgressBar,
  IonChip,
  IonAlert,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonGrid,
  IonRow,
  IonCol,
  IonAccordion,
  IonAccordionGroup,
} from "@ionic/react";
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
  medal,
  arrowForward,
  bookOutline,
  starHalfOutline,
  trendingUpOutline,
  peopleOutline, // New
} from "ionicons/icons";
import { useTranslation } from "react-i18next";
import StudentHeader from "../components/StudentHeader";
import AnimatedMascot from "../components/AnimatedMascot";
import AvatarSelector from "../components/AvatarSelector";
import { useAvatar } from "../context/AvatarContext";
import PageTransition from "../components/PageTransition";
import "./StudentProfile.css";

import { getUserData } from "../utils/userUtils"; // Import user utils

const StudentProfile: React.FC = () => {
  const { t } = useTranslation();
  const router = useIonRouter();
  const { currentAvatar, getAvatarAssets } = useAvatar();
  const avatarAssets = getAvatarAssets();
  const currentUser = getUserData();
  const [avatarNames, setAvatarNames] = useState<Record<string, string>>({
    capybara: "Aren",
    sloth: "Flash",
  });
  const [isEditingName, setIsEditingName] = useState(false);

  React.useEffect(() => {
    const storedNames = localStorage.getItem("avatar_names");
    if (storedNames) setAvatarNames(JSON.parse(storedNames));
  }, []);

  const currentName = avatarNames[currentAvatar] || "Aren";

  const handleSaveName = (newName: string) => {
    if (newName.trim()) {
      const updatedNames = { ...avatarNames, [currentAvatar]: newName };
      setAvatarNames(updatedNames);
      localStorage.setItem("avatar_names", JSON.stringify(updatedNames));
    }
    setIsEditingName(false);
  };

  // MOCK DATA - Enhanced
  const userData = {
    name: currentUser.name || "Estudiante",
    level: 8,
    xp: 2450,
    nextLevelXp: 3000,
    streak: 12,
    wins: 42,
    friends: 15, // New
    gpa: 9.2, // New (Weighted Grade)
    accuracy: 86,
  };

  const learningStats = {
    exactSciences: [
      { subject: "Math", score: 92, icon: "📐", color: "primary" },
      { subject: "Science", score: 88, icon: "🧬", color: "success" },
    ],
    humanities: [
      { subject: "History", score: 76, icon: "📜", color: "warning" },
    ],
    languages: [
      { subject: "English", score: 85, icon: "🇬🇧", color: "tertiary" },
    ]
  };

  const allStats = Object.values(learningStats).flat();
  const bestSubject = allStats.reduce((prev, current) => (prev.score > current.score) ? prev : current);
  const xpPercentage = userData.xp / userData.nextLevelXp;

  // ACHIEVEMENTS - Grouped
  const achievements = {
    battle: [
      { id: "streak_master", name: "Imparable", icon: "🔥", unlocked: true, rarity: "epic" },
      { id: "hero", name: "Héroe", icon: "⚔️", unlocked: false, rarity: "legendary" },
    ],
    learning: [
      { id: "math_wizard", name: "Mago Numérico", icon: "📐", unlocked: true, rarity: "rare" },
      { id: "bookworm", name: "Bibliotecario", icon: "📚", unlocked: true, rarity: "common" },
    ],
    social: [
      { id: "friendly", name: "Amigable", icon: "👋", unlocked: true, rarity: "common" },
    ]
  };

  // Calculate total unlocked for display
  const totalBadges = Object.values(achievements).flat().length;
  const unlockedBadges = Object.values(achievements).flat().filter(b => b.unlocked).length;

  return (
    <IonPage className="profile-page-premium">
      <StudentHeader pageTitle="studentProfile.title" showNotch={false} />
      <IonContent fullscreen className="student-page-content profile-content-premium">
        <PageTransition>
          {/* HERO SECTION - Centered & Clean */}
          <div className="profile-hero-card">
            <div className="profile-bg-pattern"></div>

            <div className="avatar-section-centered">
              <div className="avatar-halo"></div>
              <div className="avatar-frame-premium large" onClick={() => router.push("/character-detail")}>
                <AnimatedMascot
                  openSrc={avatarAssets.open}
                  closedSrc={avatarAssets.closed}
                  winkSrc={avatarAssets.wink}
                  className="main-avatar-img"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
                <div className="edit-icon-badge" onClick={() => router.push("/character-detail")}>
                  <IonIcon icon={pencilOutline} />
                </div>
              </div>
            </div>

            <div className="player-identity-centered">
              <h1 onClick={() => setIsEditingName(true)}>
                {currentName} <IonIcon icon={pencilOutline} className="edit-name-icon" />
              </h1>
              <div className="identity-subtitle">{userData.name} • Lvl {userData.level}</div>
            </div>

            {/* QUICK STATS BAR - Scrollable */}
            <div className="quick-stats-scroll">
              <div className="quick-stat-item">
                <div className="qs-icon fire"><IonIcon icon={flame} /></div>
                <div className="qs-data">
                  <span className="qs-value">{userData.streak}</span>
                  <span className="qs-label">{t("studentProfile.labels.streak")}</span>
                </div>
              </div>
              <div className="quick-stat-item">
                <div className="qs-icon blue"><IonIcon icon={trophyOutline} /></div>
                <div className="qs-data">
                  <span className="qs-value">{userData.wins}</span>
                  <span className="qs-label">{t("studentProfile.labels.wins")}</span>
                </div>
              </div>
              <div className="quick-stat-item">
                <div className="qs-icon purple"><IonIcon icon={peopleOutline} /></div> {/* Requires IonIcon Import */}
                <div className="qs-data">
                  <span className="qs-value">{userData.friends}</span>
                  <span className="qs-label">{t("studentProfile.labels.friends")}</span>
                </div>
              </div>
              <div className="quick-stat-item">
                <div className="qs-icon gold"><IonIcon icon={schoolOutline} /></div>
                <div className="qs-data">
                  <span className="qs-value">{userData.gpa}</span>
                  <span className="qs-label">{t("studentProfile.labels.gpa")}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-content-container">
            {/* LEARNING STATS GROUP */}
            <div className="section-header-modern">
              <h3>{t("studentProfile.stats.learningStats")}</h3>
            </div>

            {/* BEST SUBJECT CARD */}
            <div className="stats-highlight-card stat-card-gold">
              <div className="highlight-icon glass-bg">
                {bestSubject.icon}
              </div>
              <div className="highlight-info">
                <span className="highlight-label">{t("studentProfile.stats.bestSubject")}</span>
                <span className="highlight-value">{t(`studentProfile.subjects.${bestSubject.subject}`)}</span>
                <span className="highlight-sub">{bestSubject.score}% {t("studentProfile.stats.average")}</span>
              </div>
              <div className="highlight-badge">
                <IonIcon icon={star} /> {t("studentProfile.stats.top10")}
              </div>
            </div>

            <IonAccordionGroup className="floating-accordions">
              {Object.entries(learningStats).map(([category, stats]) => (
                <IonAccordion value={category} key={category} className="modern-accordion">
                  <IonItem slot="header" lines="none" className="accordion-header-modern">
                    <IonLabel>{t(`studentProfile.stats.${category}`)}</IonLabel>
                  </IonItem>
                  <div className="ion-padding accordion-content-modern" slot="content">
                    {stats.map((stat, index) => (
                      <div key={index} className="modern-stat-row">
                        <div className="ms-icon" style={{ background: `var(--ion-color-${stat.color})` }}>{stat.icon}</div>
                        <div className="ms-info">
                          <div className="ms-top">
                            <span className="ms-subject">{t(`studentProfile.subjects.${stat.subject}`)}</span>
                            <span className="ms-score">{stat.score}%</span>
                          </div>
                          <IonProgressBar value={stat.score / 100} color={stat.color} className="ms-progress"></IonProgressBar>
                        </div>
                      </div>
                    ))}
                  </div>
                </IonAccordion>
              ))}
            </IonAccordionGroup>

            {/* ACHIEVEMENTS GROUP */}
            <div className="section-header-modern">
              <h3>{t("studentProfile.achievements.title")} <span className="header-badge">{unlockedBadges}/{totalBadges}</span></h3>
            </div>

            <IonAccordionGroup className="floating-accordions">
              {Object.entries(achievements).map(([cat, badgesList]) => (
                <IonAccordion value={cat} key={cat} className="modern-accordion">
                  <IonItem slot="header" lines="none" className="accordion-header-modern">
                    <IonLabel>{t(`studentProfile.achievements.${cat}`)}</IonLabel>
                  </IonItem>
                  <div className="ion-padding accordion-content-modern grid-content" slot="content">
                    <div className="badges-grid-micro">
                      {badgesList.map((badge) => (
                        <div key={badge.id} className={`micro-badge ${badge.unlocked ? "unlocked" : "locked"} ${badge.rarity}`}>
                          <div className="mb-icon">{badge.icon}</div>
                          <div className="mb-name">{badge.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </IonAccordion>
              ))}
            </IonAccordionGroup>
          </div>

          <IonAlert
            isOpen={isEditingName}
            onDidDismiss={() => setIsEditingName(false)}
            header={t("chat.changeNickname")}
            inputs={[
              {
                name: "name",
                type: "text",
                placeholder: currentName,
                value: currentName,
              },
            ]}
            buttons={[
              { text: t("common.cancel"), role: "cancel", handler: () => setIsEditingName(false) },
              { text: t("common.save"), handler: (data) => handleSaveName(data.name) },
            ]}
          />
        </PageTransition>
      </IonContent>
    </IonPage>
  );
};

export default StudentProfile;
