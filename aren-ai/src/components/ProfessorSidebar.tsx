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
} from '@ionic/react';

import { useLocation } from 'react-router-dom';
import {
  homeOutline,
  homeSharp,
  schoolOutline,
  schoolSharp,
  createOutline,
  createSharp,
  analyticsOutline,
  analyticsSharp,
  peopleOutline,
  peopleSharp,
  settingsOutline,
  settingsSharp,
  helpCircleOutline,
  helpCircleSharp,
  exitOutline,
  exitSharp,
  bookOutline,
  clipboardOutline,
  glassesOutline
} from 'ionicons/icons';
import './ProfessorSidebar.css';

interface AppPage {
  url: string;
  iosIcon: string;
  mdIcon: string;
  title: string;
}

const appPages: AppPage[] = [
  {
    title: 'Main Menu',
    url: '/page/professor',
    iosIcon: homeOutline,
    mdIcon: homeSharp
  },


  {
    title: 'Students',
    url: '/folder/Students',
    iosIcon: peopleOutline,
    mdIcon: peopleSharp
  },

  {
    title: 'Create Section',
    url: '/class-creation',
    iosIcon: createOutline,
    mdIcon: createSharp
  },
  {
    title: 'Create Task',
    url: '/create-task',
    iosIcon: clipboardOutline,
    mdIcon: clipboardOutline
  },
  {
    title: 'Student Sections',
    url: '/student-section',
    iosIcon: analyticsOutline,
    mdIcon: analyticsSharp
  }
];

const settingsPages: AppPage[] = [
  {
    title: 'Settings',
    url: '/folder/Settings',
    iosIcon: settingsOutline,
    mdIcon: settingsSharp
  },
  {
    title: 'Help & Support',
    url: '/folder/Help',
    iosIcon: helpCircleOutline,
    mdIcon: helpCircleSharp
  },
  {
    title: 'Logout',
    url: '/login',
    iosIcon: exitOutline,
    mdIcon: exitSharp
  }
];

// Interface for user data
interface UserData {
  name: string;
  email: string;
  username: string;
}

// Props interface for the sidebar
interface ProfessorSidebarProps {
  onLogout: () => void;
}

const ProfessorSidebar: React.FC<ProfessorSidebarProps> = ({ onLogout }) => {
  const location = useLocation();

  // Get current user data from localStorage
  const getUserData = (): UserData => {
    try {
      const storedData = localStorage.getItem('userData');
      if (storedData) {
        return JSON.parse(storedData);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }

    // Fallback data if nothing is stored
    return {
      name: 'Prof. Rodriguez',
      email: 'prof.rodriguez@arenai.edu',
      username: 'prof.rodriguez'
    };
  };

  const currentUser = getUserData();

  // Handle logout
  const handleLogout = () => {
    console.log('ProfessorSidebar: Logging out');
    onLogout(); // Call the parent's logout function
  };

  return (
    <IonMenu contentId="main" type="overlay">
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
              <IonNote className="teacher-username">@{currentUser.username}</IonNote>
            </div>
          </div>
        </div>

        {/* Navegación principal */}
        <IonList id="main-list" lines="none">
          <IonListHeader>Teaching</IonListHeader>
          {appPages.map((appPage, index) => {
            return (
              <IonMenuToggle key={index} autoHide={false}>
                <IonItem
                  className={location.pathname === appPage.url ? 'selected' : ''}
                  routerLink={appPage.url}
                  routerDirection="none"
                  lines="none"
                  detail={false}
                >
                  <IonIcon aria-hidden="true" slot="start" ios={appPage.iosIcon} md={appPage.mdIcon} />
                  <IonLabel>{appPage.title}</IonLabel>
                </IonItem>
              </IonMenuToggle>
            );
          })}
        </IonList>

        {/* Configuración y ayuda */}
        <IonList id="settings-list" lines="none">
          <IonListHeader>Account</IonListHeader>
          {settingsPages.map((appPage, index) => {
            if (appPage.title === 'Logout') {
              return (
                <IonMenuToggle key={index} autoHide={false}>
                  <IonItem
                    className={location.pathname === appPage.url ? 'selected' : ''}
                    routerLink={appPage.url}
                    routerDirection="none"
                    lines="none"
                    detail={false}
                    onClick={handleLogout}
                  >
                    <IonIcon aria-hidden="true" slot="start" ios={appPage.iosIcon} md={appPage.mdIcon} />
                    <IonLabel>{appPage.title}</IonLabel>
                  </IonItem>
                </IonMenuToggle>
              );
            }

            return (
              <IonMenuToggle key={index} autoHide={false}>
                <IonItem
                  className={location.pathname === appPage.url ? 'selected' : ''}
                  routerLink={appPage.url}
                  routerDirection="none"
                  lines="none"
                  detail={false}
                >
                  <IonIcon aria-hidden="true" slot="start" ios={appPage.iosIcon} md={appPage.mdIcon} />
                  <IonLabel>{appPage.title}</IonLabel>
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