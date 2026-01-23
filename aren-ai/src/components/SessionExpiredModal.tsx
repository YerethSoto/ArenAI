import React from "react";
import { IonModal, IonButton, IonIcon } from "@ionic/react";
import { timeOutline, logOutOutline } from "ionicons/icons";
import { useTranslation } from "react-i18next";
import "./SessionExpiredModal.css";

interface SessionExpiredModalProps {
  isOpen: boolean;
  onConfirm: () => void;
}

const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({
  isOpen,
  onConfirm,
}) => {
  const { t } = useTranslation();

  return (
    <IonModal
      isOpen={isOpen}
      backdropDismiss={false}
      className="session-expired-modal"
    >
      <div className="session-expired-content">
        <div className="session-expired-icon-wrapper">
          <IonIcon icon={timeOutline} className="session-expired-icon" />
        </div>

        <h2 className="session-expired-title">{t("session.expiredTitle")}</h2>

        <p className="session-expired-message">{t("session.expiredMessage")}</p>

        <div className="session-expired-actions">
          <button className="session-expired-btn" onClick={onConfirm}>
            <IonIcon icon={logOutOutline} style={{ marginRight: "8px" }} />
            {t("session.loginAgain")}
          </button>
        </div>
      </div>
    </IonModal>
  );
};

export default SessionExpiredModal;
