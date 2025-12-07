import React from "react";
import {
  IonContent,
  IonPage,
  IonList,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonText,
  IonIcon,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import StudentHeader from "../components/StudentHeader";
import "./StudentSettings.css";

const StudentSettings: React.FC = () => {
  console.log("StudentSettings mounting");
  const { theme, setTheme, availableThemes } = useTheme();
  const { t, i18n } = useTranslation();

  const handleThemeChange = (e: CustomEvent) => {
    setTheme(e.detail.value);
  };

  const handleLanguageChange = (e: CustomEvent) => {
    // Force base language code just in case
    const lang = e.detail.value;
    i18n.changeLanguage(lang);
    console.log("Language changed to:", lang);
  };

  return (
    <IonPage>
      <StudentHeader pageTitle="settings.title" showNotch={false} />

      <IonContent className="student-settings-content">
        <IonList inset>
          <IonItem>
            <IonLabel>{t("settings.theme")}</IonLabel>
            <IonSelect value={theme} onIonChange={handleThemeChange}>
              {availableThemes.map((themeName) => (
                <IonSelectOption key={themeName} value={themeName}>
                  {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonLabel>{t("settings.language")}</IonLabel>
            <IonSelect
              value={i18n.language.split("-")[0]}
              onIonChange={handleLanguageChange}
            >
              <IonSelectOption value="en">English</IonSelectOption>
              <IonSelectOption value="es">Español</IonSelectOption>
              <IonSelectOption value="zh">中文</IonSelectOption>
            </IonSelect>
          </IonItem>
        </IonList>

        <div className="theme-preview-section">
          <h2>{t("settings.themePreview")}</h2>
          <p>{t("settings.previewDesc")}</p>

          <div className="preview-container">
            <h1 style={{ color: "var(--ion-color-primary)" }}>
              {t("settings.primaryTitle")}
            </h1>
            <p style={{ color: "var(--ion-text-color)" }}>
              {t("settings.standardText")}
            </p>

            <div className="button-group">
              <IonButton color="primary">
                {t("settings.primaryButton")}
              </IonButton>
              <IonButton color="secondary">
                {t("settings.secondaryButton")}
              </IonButton>
              <IonButton color="tertiary">
                {t("settings.tertiaryButton")}
              </IonButton>
            </div>

            <IonCard color="primary">
              <IonCardHeader>
                <IonCardTitle>{t("settings.primaryCard")}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>{t("settings.cardDesc")}</IonCardContent>
            </IonCard>

            <IonButton fill="outline">{t("settings.outlineButton")}</IonButton>

            <IonList>
              <IonItem>
                <IonLabel>
                  <h2>{t("settings.listItem")}</h2>
                  <p>{t("settings.listDesc")}</p>
                </IonLabel>
              </IonItem>
            </IonList>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default StudentSettings;
