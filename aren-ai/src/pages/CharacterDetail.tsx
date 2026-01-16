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
    logic: stats.logic / 100, // Top
    creativity: stats.creativity / 100, // Top Right
    focus: stats.focus / 100, // Bottom Right
    memory: stats.memory / 100, // Bottom Left
    speed: stats.speed / 100, // Top Left
  };

  // Calculate Coordinates
  // 1. Logic (Top) - 0 deg (-90 in svg space)
  const p1 = { x: center, y: center - size * p.logic };

  // 2. Creativity (Right Top) - 72 deg
  const p2 = {
    x: center + size * p.creativity * Math.cos((Math.PI * -18) / 180),
    y: center + size * p.creativity * Math.sin((Math.PI * -18) / 180),
  };

  // 3. Focus (Right Bottom) - 144 deg
  const p3 = {
    x: center + size * p.focus * Math.cos((Math.PI * 54) / 180),
    y: center + size * p.focus * Math.sin((Math.PI * 54) / 180),
  };

  // 4. Memory (Left Bottom) - 216 deg
  const p4 = {
    x: center + size * p.memory * Math.cos((Math.PI * 126) / 180),
    y: center + size * p.memory * Math.sin((Math.PI * 126) / 180),
  };

  // 5. Speed (Left Top) - 288 deg
  const p5 = {
    x: center + size * p.speed * Math.cos((Math.PI * 198) / 180),
    y: center + size * p.speed * Math.sin((Math.PI * 198) / 180),
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
    },
    {
      id: "sloth",
      name: "Perezoso",
      icon: "/assets/profile_picture_sloth_eyes_open.png",
      background: "/assets/RainForest.jpg",
      lore: "Lento pero seguro.",
    },
  ];

  const handleBack = () => {
    router.goBack();
  };

  const handleEquip = () => {
    setAvatar(previewAvatar as any);
  };

  // Helper to get translated data safely
  const getData = (id: string, field: string) => {
    if (field === "title")
      return AVATAR_OPTIONS.find((a) => a.id === id)?.name || id;
    if (field === "lore")
      return AVATAR_OPTIONS.find((a) => a.id === id)?.lore || "";
    if (field === "origin") return "ArenAI World";
    if (field === "affiliation") return "Student";
    return id;
  };

  const getStats = (id: string): RadarStats => {
    if (id === "sloth")
      return { logic: 70, creativity: 30, focus: 90, memory: 80, speed: 10 };
    return { logic: 60, creativity: 80, focus: 50, memory: 60, speed: 60 }; // Capybara
  };

  // Map avatars to their "Element/Theme" color
  const THEME_MAP: { [key: string]: string } = {
    capybara: "cryo", // Blue/Ice
    sloth: "dendro", // Green/Nature
  };

  const currentTheme = THEME_MAP[previewAvatar] || "cryo";
  const stats = getStats(previewAvatar);

  const currentBackground = AVATAR_OPTIONS.find(a => a.id === previewAvatar)?.background || "";

  return (
    <IonPage className="character-detail-page" data-theme={currentTheme}>
      <div
        className="cd-background"
        style={{
          backgroundImage: `url(${currentBackground})`,
        }}
      >
        {/* Storybook Overlay for texture (optional) */}
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

          {/* BIG SLANTED TITLE OVERLAY */}
          <div className="cd-title-overlay">
            <h1 className="cd-char-title-big">
              {getData(previewAvatar, "title")}
            </h1>
            <div className="cd-char-subtitle-big">
              <span className="cd-stars">★★★★★</span>
              <span>{getData(previewAvatar, "origin")}</span>
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
                src={AVATAR_OPTIONS.find((a) => a.id === previewAvatar)?.icon}
                alt={previewAvatar}
                className="cd-character-img"
              />
            </div>

            {/* Right: Info */}
            <div className="cd-right-panel">
              {/* Story / Description */}
              <div className="cd-story-section">
                <p className="cd-story-text">
                  "{getData(previewAvatar, "lore")}"
                </p>
              </div>

              {/* Attributes Box */}
              <div className="cd-attributes-grid">
                <div className="cd-attr-box">
                  <span className="cd-attr-label">
                    {t("avatars.attributes.affiliation")}
                  </span>
                  <span className="cd-attr-value">
                    <IonIcon icon={ribbon} />
                    {getData(previewAvatar, "affiliation")}
                  </span>
                </div>
                <div className="cd-attr-box">
                  <span className="cd-attr-label">
                    {t("avatars.actions.friendship")}
                  </span>
                  <span className="cd-attr-value" style={{ color: "#FF5252" }}>
                    <IonIcon icon={heart} />
                    Lv. 5
                  </span>
                </div>
              </div>

              {/* Radar Chart */}
              <div className="cd-radar-container">
                <span className="cd-chart-title">Combat Stats</span>
                <RadarChart stats={stats} />
              </div>

              {/* Equip Button */}
              <button
                className={`cd-equip-btn ${currentAvatar === previewAvatar ? "equipped" : ""
                  }`}
                onClick={handleEquip}
                style={{
                  marginTop: "20px",
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "none",
                  background:
                    currentAvatar === previewAvatar ? "#4CAF50" : "#FFC107",
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                {currentAvatar === previewAvatar ? (
                  <>
                    {" "}
                    <IonIcon icon={checkmarkCircle} />{" "}
                    {t("ui.equipped", "Equipado")}{" "}
                  </>
                ) : (
                  t("ui.equip", "Equipar")
                )}
              </button>

              <div style={{ height: "20px" }}></div>
            </div>
          </div>

          {/* Bottom Bar: Selector Only (Centered) */}
          <div className="cd-bottom-bar">
            <div className="cd-avatar-list centered">
              {AVATAR_OPTIONS.map((opt) => (
                <div
                  key={opt.id}
                  className={`cd-avatar-thumb ${previewAvatar === opt.id ? "active" : ""
                    }`}
                  onClick={() => setPreviewAvatar(opt.id)}
                >
                  <img
                    src={opt.icon}
                    alt={opt.id}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "6px",
                    }}
                  />
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
