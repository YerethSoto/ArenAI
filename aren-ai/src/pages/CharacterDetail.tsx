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
import { useAvatar } from "../context/AvatarContext";
import "./CharacterDetail.css";



// ----------------------------------------------------------------------------
// Main Page Component
// ----------------------------------------------------------------------------

const CharacterDetail: React.FC = () => {
  const { t } = useTranslation();
  const router = useIonRouter();

  // User global context
  const { currentAvatar, setAvatar } = useAvatar();

  // Use local state for preview, sync with global on mount/change
  const [previewAvatar, setPreviewAvatar] = useState<string>(currentAvatar);

  const AVATAR_OPTIONS = [
    {
      id: "capybara",
      name: "Capibara",
      icon: "/assets/profile_picture_capybara_eyes_open.png",
      background: "/assets/Pond.jpg",
      lore: "El amigo de todos.",
      theme: "cryo"
    },
    {
      id: "capybara_wink",
      name: "Capi Guiño",
      icon: "/assets/profile_picture_capybara_wink.png",
      background: "/assets/Pond.jpg",
      lore: "Un guiño amistoso.",
      theme: "cryo"
    },
    {
      id: "capybara_sleep",
      name: "Capi Zen",
      icon: "/assets/profile_picture_capybara_eyes_closed.png",
      background: "/assets/Pond.jpg",
      lore: "Meditando en paz.",
      theme: "cryo"
    },
    {
      id: "sloth",
      name: "Perezoso",
      icon: "/assets/profile_picture_sloth_eyes_open.png",
      background: "/assets/RainForest.jpg",
      lore: "Lento pero seguro.",
      theme: "dendro"
    },
    {
      id: "sloth_wink",
      name: "Perezoso Feliz",
      icon: "/assets/profile_picture_sloth_winking.png",
      background: "/assets/RainForest.jpg",
      lore: "Disfrutando el momento.",
      theme: "dendro"
    },
    {
      id: "sloth_sleep",
      name: "Perezoso Dormilón",
      icon: "/assets/profile_picture_sloth_eyes_closed.png",
      background: "/assets/RainForest.jpg",
      lore: "Cinco minutos más...",
      theme: "dendro"
    },
  ];

  const handleBack = () => {
    router.goBack();
  };

  const handleEquip = () => {
    setAvatar(previewAvatar as any);
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
                {AVATAR_OPTIONS.map((avatar) => (
                  <div
                    key={avatar.id}
                    className={`library-item ${previewAvatar === avatar.id ? "selected" : ""} ${currentAvatar === avatar.id ? "equipped" : ""}`}
                    onClick={() => setPreviewAvatar(avatar.id)}
                  >
                    <img src={avatar.icon} alt={avatar.name} loading="lazy" />
                    {currentAvatar === avatar.id && <div className="equipped-badge"><IonIcon icon={checkmarkCircle} /></div>}
                  </div>
                ))}
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
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CharacterDetail;
