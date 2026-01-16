import React, { useState } from "react";
import { IonIcon } from "@ionic/react";
import { closeOutline } from "ionicons/icons";
import { useTranslation } from "react-i18next";
import "./AvatarSelector.css";

interface AvatarSelectorProps {
  currentAvatar: string;
  onSelect: (avatarId: string) => void;
  onClose: () => void;
}

// Map Avatar IDs to Assets
const AVATAR_OPTIONS = [
  {
    id: "capybara",
    name: "Capibara",
    icon: "/assets/profile_picture_capybara_eyes_open.png",
    lore: "El amigo de todos.",
  },
  {
    id: "sloth",
    name: "Perezoso",
    icon: "/assets/profile_picture_sloth_eyes_open.png",
    lore: "Lento pero seguro.",
  },
];

const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  currentAvatar,
  onSelect,
  onClose,
}) => {
  const { t } = useTranslation();
  const [previewAvatar, setPreviewAvatar] = useState<string>(currentAvatar);

  // Helper to get asset for preview
  const getPreviewAsset = (id: string) => {
    const opt = AVATAR_OPTIONS.find((o) => o.id === id);
    return opt ? opt.icon : AVATAR_OPTIONS[0].icon;
  };

  const handleSelect = () => {
    onSelect(previewAvatar);
    onClose();
  };

  return (
    <div className="avatar-selector-overlay">
      <div className="avatar-selector-card">
        <button className="as-close-btn" onClick={onClose}>
          <IonIcon icon={closeOutline} />
        </button>

        <div className="as-header">
          <h2 className="as-title">
            {t("avatars.select") || "Selecciona tu Avatar"}
          </h2>
        </div>

        <div className="as-showcase">
          <img
            src={getPreviewAsset(previewAvatar)}
            alt="Selected Avatar"
            className="as-showcase-img"
          />
        </div>

        <div className="as-lore-panel">
          <h3 className="as-role-title">
            {AVATAR_OPTIONS.find((o) => o.id === previewAvatar)?.name}
          </h3>
          <p className="as-role-desc">
            "{AVATAR_OPTIONS.find((o) => o.id === previewAvatar)?.lore}"
          </p>
        </div>

        <div className="as-grid">
          {AVATAR_OPTIONS.map((opt) => (
            <div
              key={opt.id}
              className={`as-icon-btn ${previewAvatar === opt.id ? "selected" : ""
                }`}
              onClick={() => setPreviewAvatar(opt.id)}
            >
              <img src={opt.icon} alt={opt.id} />
              <span className="as-grid-label">{opt.name}</span>
            </div>
          ))}
        </div>

        <button className="as-select-btn" onClick={handleSelect}>
          {t("avatars.select")}
        </button>
      </div>
    </div>
  );
};

export default AvatarSelector;
