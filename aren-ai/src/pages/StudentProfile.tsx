import React, { useState } from "react";
import {
  IonPage,
  IonContent,
  IonIcon,
  useIonRouter,
  IonProgressBar,
  IonChip,
  IonAlert,
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
} from "ionicons/icons";
import { useTranslation } from "react-i18next";
import StudentHeader from "../components/StudentHeader";
import AvatarSelector from "../components/AvatarSelector";
import { useAvatar } from "../context/AvatarContext";
import PageTransition from "../components/PageTransition";
import "./StudentProfile.css";

const StudentProfile: React.FC = () => {
  const { t } = useTranslation();
  const router = useIonRouter();

  // Use global avatar state
  const { currentAvatar, setAvatar, getAvatarAssets } = useAvatar();

  // Get current assets
  const avatarAssets = getAvatarAssets();

  // Avatar Name State (Per Avatar Type)
  const [avatarNames, setAvatarNames] = useState<Record<string, string>>({
    capybara: "Aren",
    sloth: "Flash",
  });
  const [isEditingName, setIsEditingName] = useState(false);

  React.useEffect(() => {
    const storedNames = localStorage.getItem("avatar_names");
    if (storedNames) {
      setAvatarNames(JSON.parse(storedNames));
    }
  }, []);

  // Get current name based on selected avatar
  const currentName = avatarNames[currentAvatar] || "Aren";

  const handleSaveName = (newName: string) => {
    if (newName.trim()) {
      const updatedNames = { ...avatarNames, [currentAvatar]: newName };
      setAvatarNames(updatedNames);
      localStorage.setItem("avatar_names", JSON.stringify(updatedNames));
      // Also update single value for backward compatibility/Chatbot simplicity for now
      localStorage.setItem("avatarName", newName);
    }
    setIsEditingName(false);
  };

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
    rank: "Diamante III",
  };

  const xpPercentage = userData.xp / userData.nextLevelXp;

  // Mock Badges (some unlocked, some locked)
  const badges = [
    {
      id: "math_wizard",
      name: "Mago Numérico",
      icon: "📐",
      unlocked: true,
      rarity: "rare",
    },
    {
      id: "science_whiz",
      name: "Científico Loco",
      icon: "🧬",
      unlocked: true,
      rarity: "common",
    },
    {
      id: "early_bird",
      name: "Madrugador",
      icon: "🌅",
      unlocked: false,
      rarity: "common",
    },
    {
      id: "streak_master",
      name: "Imparable",
      icon: "🔥",
      unlocked: true,
      rarity: "epic",
    },
    {
      id: "quiz_master",
      name: "Sabelotodo",
      icon: "🏆",
      unlocked: false,
      rarity: "legendary",
    },
    {
      id: "bookworm",
      name: "Bibliotecario",
      icon: "📚",
      unlocked: true,
      rarity: "rare",
    },
  ];

  return (
    <IonPage className="profile-page-premium">
      <StudentHeader pageTitle="Æ" showNotch={false} />

      <IonContent
        fullscreen
        className="student-page-content profile-content-premium"
      >
        <PageTransition>
          {/* HERO SECTION */}
          <div className="profile-hero-card">
            <div className="profile-bg-pattern"></div>

            <div className="avatar-section">
              <div
                className="avatar-frame-premium"
                onClick={() => router.push("/character-detail")}
              >
                <div className="avatar-glow"></div>
                <img
                  src={avatarAssets.open}
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
                Nombre del Æ: {currentName}
                <IonIcon
                  icon={pencilOutline}
                  onClick={() => setIsEditingName(true)}
                  style={{ marginLeft: "8px", cursor: "pointer" }}
                />
              </div>
            </div>

            <IonAlert
              isOpen={isEditingName}
              onDidDismiss={() => setIsEditingName(false)}
              header="Nombre de tu Æ"
              inputs={[
                {
                  name: "name",
                  type: "text",
                  placeholder: `Ej: ${
                    currentAvatar === "sloth" ? "Flash" : "Aren"
                  }`,
                  value: currentName,
                },
              ]}
              buttons={[
                {
                  text: "Cancelar",
                  role: "cancel",
                  handler: () => {
                    setIsEditingName(false);
                  },
                },
                {
                  text: "Guardar",
                  handler: (data) => {
                    handleSaveName(data.name);
                  },
                },
              ]}
            />

            <div className="xp-status-container">
              <div className="xp-labels">
                <span>LVL {userData.level}</span>
                <span>Nivel de Amistad: {userData.xp}</span>
              </div>
              <IonProgressBar
                value={xpPercentage}
                className="xp-progress-bar"
              ></IonProgressBar>
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
            <div
              className="badges-header clickable"
              onClick={() => router.push("/achievements")}
            >
              <h3>
                <IonIcon icon={ribbonOutline} /> Insignias
              </h3>
              <div className="badges-header-right">
                <span className="badges-count">
                  {badges.filter((b) => b.unlocked).length}/{badges.length}
                </span>
                <IonIcon icon={arrowForward} className="header-arrow" />
              </div>
            </div>

            <div className="badges-grid-premium">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`badge-card-premium ${
                    badge.unlocked ? "unlocked" : "locked"
                  } ${badge.rarity}`}
                >
                  <div className="badge-shine"></div>
                  <div className="badge-icon-premium">{badge.icon}</div>
                  <div className="badge-name">{badge.name}</div>
                </div>
              ))}
            </div>
          </div>
        </PageTransition>
      </IonContent>
    </IonPage>
  );
};

export default StudentProfile;
