import React, { useState } from "react";
import { IonPage, IonContent, IonIcon, useIonRouter } from "@ionic/react";
import {
  arrowBack,
  heart,
  flash,
  ribbon,
  checkmarkCircle,
} from "ionicons/icons";
import { useTranslation } from "react-i18next";
import { progressionService } from "../services/progressionService";
import { IonToast } from "@ionic/react";
import { useAvatar } from "../context/AvatarContext";
import "./CharacterDetail.css";



// ----------------------------------------------------------------------------
// Main Page Component
// ----------------------------------------------------------------------------

const CharacterDetail: React.FC = () => {
  const { t } = useTranslation();
  const router = useIonRouter();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // User global context
  const { currentAvatar, setAvatar } = useAvatar();

  // Get User Level
  const userStats = progressionService.getStats();
  const userLevel = userStats.level;

  // Use local state for preview, sync with global on mount/change
  const [previewAvatar, setPreviewAvatar] = useState<string>(currentAvatar);

  const AVATAR_OPTIONS = [
    {
      id: "capybara",
      name: "Capibara",
      icon: "/assets/profile_picture_capybara_eyes_open.png",
      background: "/assets/Pond.jpg",
      lore: "El amigo de todos.",
      theme: "cryo",
      requiredLevel: 1
    },
    {
      id: "sloth",
      name: "Perezoso",
      icon: "/assets/profile_picture_sloth_eyes_open.png",
      background: "/assets/RainForest.jpg",
      lore: "Lento pero seguro.",
      theme: "dendro",
      requiredLevel: 5
    },
    {
      id: "owl",
      name: "Búho Sabio",
      icon: "/assets/OWL.JPG",
      background: "/assets/Pond.jpg", // Using existing background for now
      lore: "La sabiduría es poder.",
      theme: "anemo",
      requiredLevel: 10
    },
    {
      id: "fox",
      name: "Zorro Astuto",
      icon: "/assets/FOX.jpg",
      background: "/assets/RainForest.jpg", // Using existing background for now
      lore: "Rápido y audaz.",
      theme: "pyro",
      requiredLevel: 15
    },
    {
      id: "axol",
      name: "Ajolote Místico",
      icon: "/assets/AXOL.jpg",
      background: "/assets/Pond.jpg", // Using existing background for now
      lore: "Un tesoro escondido.",
      theme: "hydro",
      requiredLevel: 20
    },
  ];

  const handleBack = () => {
    router.goBack();
  };

  const handleEquip = () => {
    setAvatar(previewAvatar as any);
  };

  const handleSelect = (avatar: any) => {
    if (userLevel >= avatar.requiredLevel) {
      setPreviewAvatar(avatar.id);
    } else {
      setToastMessage(`Level ${avatar.requiredLevel} required to unlock!`);
      setShowToast(true);
    }
  };

  const selectedAvatarData = AVATAR_OPTIONS.find(a => a.id === previewAvatar) || AVATAR_OPTIONS[0];
  const currentTheme = selectedAvatarData.theme || "cryo";
  const currentBackground = selectedAvatarData.background || "";

  return (
    <IonPage className="character-detail-page" data-theme={currentTheme}>
      <div
        className="cd-background"
        style={{
          backgroundImage: `url(${currentBackground})`,
        }}
      >
        <div className="cd-texture-overlay"></div>
      </div>

      <IonContent fullscreen className="cd-content-wrapper">
        <div className="cd-content">
          {/* Header Controls */}
          <div className="cd-header">
            <button className="cd-back-btn" onClick={handleBack}>
              <IonIcon icon={arrowBack} />
              {t("ui.back", "Volver")}
            </button>
          </div>

          <div className="cd-main-grid">
            {/* Left: Showcase */}
            <div className="cd-left-panel">
              {/* BIG SLANTED TITLE OVERLAY (Moved inside panel for better mobile flow) */}
              <div className="cd-title-overlay">
                <h1 className="cd-char-title-big">
                  {selectedAvatarData.name}
                </h1>
                <div className="cd-char-subtitle-big">
                  <span className="cd-stars">★★★★★</span>
                  <span>{selectedAvatarData.lore}</span>
                </div>
              </div>

              <div className="cd-element-bg">
                <IonIcon icon={flash} />
              </div>

              <img
                src={selectedAvatarData.icon}
                alt={previewAvatar}
                className="cd-character-img"
              />
            </div>

            {/* Right: Library Grid */}
            <div className="cd-right-panel">
              <div className="cd-library-header">
                <h2>Biblioteca de Avatares</h2>
                <p>Selecciona tu compañero de estudio</p>
              </div>

              <div className="avatar-library-grid">
                {AVATAR_OPTIONS.map((avatar) => {
                  const isLocked = userLevel < avatar.requiredLevel;
                  return (
                    <div
                      key={avatar.id}
                      className={`library-item ${previewAvatar === avatar.id ? "selected" : ""} ${currentAvatar === avatar.id ? "equipped" : ""} ${isLocked ? "locked" : ""}`}
                      onClick={() => handleSelect(avatar)}
                    >
                      <img src={avatar.icon} alt={avatar.name} loading="lazy" />
                      {currentAvatar === avatar.id && <div className="equipped-badge"><IonIcon icon={checkmarkCircle} /></div>}
                    </div>
                  );
                })}
              </div>

              {/* Equip Button - Floating at bottom of panel */}
              <button
                className={`cd-equip-btn ${currentAvatar === previewAvatar ? "equipped" : ""}`}
                onClick={handleEquip}
              >
                {currentAvatar === previewAvatar ? (
                  <> <IonIcon icon={checkmarkCircle} /> {t("ui.equipped", "Equipado")} </>
                ) : (
                  t("ui.equip", "Equipar")
                )}
              </button>
            </div>

            <IonToast
              isOpen={showToast}
              onDidDismiss={() => setShowToast(false)}
              message={toastMessage}
              duration={2000}
              color="dark"
              position="top"
            />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CharacterDetail;
