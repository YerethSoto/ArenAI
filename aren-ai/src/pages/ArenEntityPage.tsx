import React, { useState, useRef, useEffect } from "react";
import { IonPage, IonContent, IonIcon, IonModal } from "@ionic/react";
import { pencilSharp, trophy, flash, calendarClear } from "ionicons/icons";
import { useTranslation } from "react-i18next";
import { useAvatar } from "../context/AvatarContext";
import StudentHeader from "../components/StudentHeader";
import "./ArenEntityPage.css";

// Mock Data with expanded stats
const ENTITY_DATA = [
  {
    id: "capybara",
    defaultName: "Capibara",
    sprite: "/assets/capybara-front.png",
    thumb: "/assets/profile_picture_capybara_eyes_open.png",
    bg: "/assets/Pond.jpg",
    lore: "Un estudiante relajado que siempre mantiene la calma...", // Key acts as ID
    stats: { lvl: 5, wins: 12, usage: 142, firstSeend: "12 Oct 2024" },
  },
  {
    id: "sloth",
    defaultName: "Perezoso",
    sprite: "/assets/sloth-front.png",
    thumb: "/assets/profile_picture_sloth_eyes_open.png",
    bg: "/assets/RainForest.jpg",
    lore: "Lento pero meticuloso...",
    stats: { lvl: 3, wins: 8, usage: 45, firstSeend: "05 Nov 2024" },
  },
];

const ArenEntityPage: React.FC = () => {
  const { t } = useTranslation();
  const { currentAvatar, setAvatar } = useAvatar();

  const [selectedId, setSelectedId] = useState<string>(currentAvatar);
  const [customName, setCustomName] = useState<string>("");
  const [showNameAlert, setShowNameAlert] = useState(false);
  const [hideUI, setHideUI] = useState(false);

  // Hide UI on scroll
  const handleScroll = (e: CustomEvent) => {
    const scrollTop = e.detail.scrollTop;
    // Hide if scrolled down more than 50px
    setHideUI(scrollTop > 50);
  };

  const currentEntity =
    ENTITY_DATA.find((e) => e.id === selectedId) || ENTITY_DATA[0];

  const [isJumping, setIsJumping] = useState(false);

  const handleJump = () => {
    if (!isJumping) {
      setIsJumping(true);
      // Reset after animation duration (500ms matches CSS)
      setTimeout(() => setIsJumping(false), 500);
    }
  };

  // Helper to save nickname to LocalStorage
  const saveNickname = (newName: string) => {
    setCustomName(newName);
    try {
      const stored = localStorage.getItem("aren_entity_nicknames");
      const nicknames = stored ? JSON.parse(stored) : {};
      nicknames[currentEntity.id] = newName;
      localStorage.setItem("aren_entity_nicknames", JSON.stringify(nicknames));
    } catch (e) {
      console.error("Failed to save nickname", e);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setAvatar(id as any);
  };

  useEffect(() => {
    // Load persist nickname or default translation
    try {
      const stored = localStorage.getItem("aren_entity_nicknames");
      const nicknames = stored ? JSON.parse(stored) : {};
      if (nicknames[currentEntity.id]) {
        setCustomName(nicknames[currentEntity.id]);
      } else {
        setCustomName(t(`arenEntity.names.${currentEntity.id}`));
      }
    } catch (e) {
      // Fallback
      setCustomName(t(`arenEntity.names.${currentEntity.id}`));
    }
  }, [currentEntity, t]);

  // Arc selector relies purely on render logic, no side effects needed for scroll

  return (
    <IonPage className="ae-page">
      {/* 1. Dynamic Background */}
      <div
        className="ae-background"
        style={{ backgroundImage: `url(${currentEntity.bg})` }}
      >
        <div className="ae-bg-overlay"></div>
      </div>

      {/* 2. Global Header with Interactive Name Oval */}
      <div className={`ae-header-wrapper ${hideUI ? "hidden" : ""}`}>
        <StudentHeader
          pageTitle="arenEntity.title"
          showSubject={true}
          selectedSubject={customName}
          skipTranslation={true}
          onSubjectClick={() => setShowNameAlert(true)}
        />
      </div>

      {/* 3. Main Content - Transparent to show bg */}
      <IonContent
        fullscreen
        className="ae-content-wrapper"
        scrollEvents={true}
        onIonScroll={handleScroll}
      >
        <div className="ae-scroll-content">
          {/* SPACER for header */}
          <div style={{ marginTop: "20px" }}></div>

          {/* Main Split: Stats (Left) & Sprite (Right) */}
          <div className="ae-main-split">
            {/* Left: Lore / Stats (Text Block) */}
            <div className="ae-lore-container">
              {/* Just text and simple stats, no excessive frames */}
              <div className="ae-text-scroll">
                <p className="ae-lore-text">
                  "
                  {t(`arenEntity.lore.${currentEntity.id}`, {
                    name:
                      customName || t(`arenEntity.names.${currentEntity.id}`),
                  })}
                  "
                </p>
                <div className="ae-simple-stats">
                  <div className="ae-stat-card">
                    <div className="ae-stat-icon-wrapper win">
                      <IonIcon icon={trophy} />
                    </div>
                    <div className="ae-stat-info">
                      <span className="ae-stat-label">
                        {t("arenEntity.battlesWon")}
                      </span>
                      <span className="ae-stat-value success">
                        {currentEntity.stats.wins}
                      </span>
                    </div>
                  </div>

                  <div className="ae-stat-card">
                    <div className="ae-stat-icon-wrapper usage">
                      <IonIcon icon={flash} />
                    </div>
                    <div className="ae-stat-info">
                      <span className="ae-stat-label">
                        {t("arenEntity.timesSummoned")}
                      </span>
                      <span className="ae-stat-value">
                        {currentEntity.stats.usage}
                      </span>
                    </div>
                  </div>

                  <div className="ae-stat-card">
                    <div className="ae-stat-icon-wrapper date">
                      <IonIcon icon={calendarClear} />
                    </div>
                    <div className="ae-stat-info">
                      <span className="ae-stat-label">
                        {t("arenEntity.firstEncounter")}
                      </span>
                      <span className="ae-stat-value small">
                        {currentEntity.stats.firstSeend}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Sprite + Friendship Level */}
            <div className="ae-sprite-container">
              <img
                src={currentEntity.sprite}
                alt={currentEntity.defaultName}
                className={`ae-sprite-img ${isJumping ? "jumping" : ""}`}
                onClick={handleJump}
              />
              {/* Friendship Badge below sprite */}
              <div className={`ae-friendship-badge ${hideUI ? "hidden" : ""}`}>
                <span className="ae-friendship-label">
                  {t("arenEntity.friendship")}
                </span>
                <span className="ae-friendship-value">
                  Lv. {currentEntity.stats.lvl}
                </span>
              </div>

              {/* Shadow Blob */}
              <div className="ae-sprite-shadow"></div>
            </div>
          </div>
        </div>
      </IonContent>

      {/* Duel Links Circular Selector */}
      <div className={`ae-duel-selector-container ${hideUI ? "hidden" : ""}`}>
        <div className="ae-carousel-arc">
          {/* Combine Real Entities and Locked Slots for the wheel */}
          {[
            ...ENTITY_DATA,
            { id: "locked1" },
            { id: "locked2" },
            { id: "locked3" },
          ].map((item, index) => {
            // Calculate offset from current selection
            // We map real entities to their actual index, locked ones follow
            const dataIndex = index;
            const activeIndex = [
              ...ENTITY_DATA,
              { id: "locked1" },
              { id: "locked2" },
              { id: "locked3" },
            ].findIndex((i) => i.id === selectedId);

            // If selectedId isn't found (initially), default to 0
            const safeActiveIndex = activeIndex === -1 ? 0 : activeIndex;

            const offset = dataIndex - safeActiveIndex;
            const isLocked = !("defaultName" in item);
            const entity = item as any;

            // Arc Math
            const X_SPACING = 110;
            const Y_CURVE = 25; // How much it drops down as it moves out
            const ROTATION = 8; // Degrees

            const style: React.CSSProperties = {
              transform: `
                                translateX(calc(-50% + ${offset * X_SPACING}px)) 
                                translateY(${Math.abs(offset) * Y_CURVE}px) 
                                rotate(${offset * ROTATION}deg)
                                scale(${1 - Math.abs(offset) * 0.1})
                            `,
              zIndex: 100 - Math.abs(offset),
              opacity: 1 - Math.abs(offset) * 0.3,
            };

            return (
              <div
                key={item.id}
                className={`ae-duel-card ${offset === 0 ? "active" : ""} ${isLocked ? "locked" : ""}`}
                style={style}
                onClick={() => !isLocked && handleSelect(item.id)}
              >
                <div className="ae-card-frame">
                  {isLocked ? (
                    <div className="ae-lock-content">🔒</div>
                  ) : (
                    <img src={entity.thumb} alt={entity.id} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rename Modal */}
      <IonModal
        isOpen={showNameAlert}
        onDidDismiss={() => setShowNameAlert(false)}
        className="ae-custom-modal"
      >
        <div className="ae-modal-content">
          <h2 className="ae-modal-title">{t("arenEntity.changeName")}</h2>

          <div className="ae-input-wrapper">
            <input
              type="text"
              className="ae-modal-input-field"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={t("arenEntity.nicknamePlaceholder")}
            />
          </div>

          <div className="ae-modal-buttons">
            <button
              className="ae-modal-btn cancel"
              onClick={() => setShowNameAlert(false)}
            >
              {t("common.cancel")}
            </button>
            <button
              className="ae-modal-btn save"
              onClick={() => {
                saveNickname(customName);
                setShowNameAlert(false);
              }}
            >
              {t("common.save")}
            </button>
          </div>
        </div>
      </IonModal>
    </IonPage>
  );
};

export default ArenEntityPage;
