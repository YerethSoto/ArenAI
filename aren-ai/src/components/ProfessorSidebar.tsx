import React, { useEffect } from "react";
import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote,
} from "@ionic/react";

import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  homeOutline,
  homeSharp,
  peopleOutline,
  peopleSharp,
  createOutline,
  createSharp,
  analyticsOutline,
  analyticsSharp,
  documentTextOutline,
  settingsOutline,
  settingsSharp,
  helpCircleOutline,
  helpCircleSharp,
  exitOutline,
  exitSharp,
  clipboardOutline,
  glassesOutline,
} from "ionicons/icons";
import "./ProfessorSidebar.css";

interface AppPage {
  url: string;
  iosIcon: string;
  mdIcon: string;
  titleKey: string; // Changed to translation key
}

const ProfessorSidebar: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const location = useLocation();
  const { t } = useTranslation();

  const appPages: AppPage[] = [
    {
      titleKey: "professor.sidebar.mainMenu",
      url: "/page/professor",
      iosIcon: homeOutline,
      mdIcon: homeSharp,
    },
    {
      titleKey: "professor.sidebar.students",
      url: "/folder/Students",
      iosIcon: peopleOutline,
      mdIcon: peopleSharp,
    },
    {
      titleKey: "professor.sidebar.createSection",
      url: "/class-creation",
      iosIcon: createOutline,
      mdIcon: createSharp,
    },
    {
      titleKey: "professor.sidebar.createTask",
      url: "/create-task",
      iosIcon: clipboardOutline,
      mdIcon: clipboardOutline,
    },
    {
      titleKey: "professor.sidebar.studentSections",
      url: "/student-section",
      iosIcon: analyticsOutline,
      mdIcon: analyticsSharp,
    },
    {
      titleKey: "professor.sidebar.teacherAdmin",
      url: "/teacher-admin",
      iosIcon: documentTextOutline,
      mdIcon: documentTextOutline,
    },
  ];

  const settingsPages: AppPage[] = [
    {
      titleKey: "professor.sidebar.settings",
      url: "/folder/Settings",
      iosIcon: settingsOutline,
      mdIcon: settingsSharp,
    },
    {
      titleKey: "professor.sidebar.help",
      url: "/folder/Help",
      iosIcon: helpCircleOutline,
      mdIcon: helpCircleSharp,
    },
    {
      titleKey: "professor.sidebar.logout",
      url: "/login",
      iosIcon: exitOutline,
      mdIcon: exitSharp,
    },
  ];

  // Get current user data from localStorage
  const getUserData = () => {
    try {
      const storedData = localStorage.getItem("userData");
      if (storedData) return JSON.parse(storedData);
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
    return {
      name: "Prof. Rodriguez",
      email: "prof.rodriguez@arenai.edu",
      username: "prof.rodriguez",
    };
  };

  const currentUser = getUserData();

  const handleLogout = () => {
    console.log("ProfessorSidebar: Logging out");
    onLogout();
  };

  useEffect(() => {
    localStorage.setItem("userRole", "professor");
  }, []);

  return (
    <IonMenu contentId="main" id="professor-menu">
      <IonContent>
        {/* Header del menú con datos dinámicos del usuario */}
        <div className="menu-header">
          <div className="teacher-info">
            <div className="teacher-avatar">
              <IonIcon icon={glassesOutline} />
            </div>
            <div className="teacher-details">
              <IonLabel className="teacher-name">{currentUser.name}</IonLabel>
              <IonNote className="teacher-email">{currentUser.email}</IonNote>
              <IonNote className="teacher-username">
                @{currentUser.username}
              </IonNote>
            </div>
          </div>
        </div>

        {/* Navegación principal */}
        <IonList id="main-list" lines="none">
          <IonListHeader>{t("professor.sidebar.teaching")}</IonListHeader>
          {appPages.map((appPage, index) => {
            return (
              <IonMenuToggle key={index} autoHide={false}>
                <IonItem
                  className={
                    location.pathname === appPage.url ? "selected" : ""
                  }
                  routerLink={appPage.url}
                  routerDirection="none"
                  lines="none"
                  detail={false}
                >
                  <IonIcon
                    aria-hidden="true"
                    slot="start"
                    ios={appPage.iosIcon}
                    md={appPage.mdIcon}
                  />
                  <IonLabel>{t(appPage.titleKey)}</IonLabel>
                </IonItem>
              </IonMenuToggle>
            );
          })}
        </IonList>

        {/* Configuración y ayuda */}
        <IonList id="settings-list" lines="none">
          <IonListHeader>{t("professor.sidebar.account")}</IonListHeader>
          {settingsPages.map((appPage, index) => {
            const isLogout = appPage.url === "/login";
            return (
              <IonMenuToggle key={index} autoHide={false}>
                <IonItem
                  className={`${
                    location.pathname === appPage.url ? "selected" : ""
                  } ${isLogout ? "logout-item" : ""}`}
                  routerLink={appPage.url}
                  routerDirection="none"
                  lines="none"
                  detail={false}
                  onClick={isLogout ? handleLogout : undefined}
                >
                  <IonIcon
                    aria-hidden="true"
                    slot="start"
                    ios={appPage.iosIcon}
                    md={appPage.mdIcon}
                  />
                  <IonLabel>{t(appPage.titleKey)}</IonLabel>
                </IonItem>
              </IonMenuToggle>
            );
          })}
        </IonList>

        {/* Información de la app */}
        <div className="menu-footer">
          <IonNote className="app-version">ArenAI v1.0.0</IonNote>
        </div>
      </IonContent>
    </IonMenu>
  );
};

export default ProfessorSidebar;
