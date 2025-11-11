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
  bookOutline,
  bookSharp,
  calendarOutline,
  calendarSharp,
  trophyOutline,
  trophySharp,
  settingsOutline,
  settingsSharp,
  helpCircleOutline,
  helpCircleSharp,
  exitOutline,
  exitSharp,
  peopleOutline,
  analyticsOutline
} from 'ionicons/icons';
import './StudentSidebar.css';

interface AppPage {
  url: string;
  iosIcon: string;
  mdIcon: string;
  title: string;
}

const appPages: AppPage[] = [
  {
    title: 'Dashboard',
    url: '/page/student',
    iosIcon: homeOutline,
    mdIcon: homeSharp
  },
  {
    title: 'Chat with Aren',
    url: '/chat',
    iosIcon: schoolOutline,
    mdIcon: schoolSharp
  },
  
  {
    title: 'Progress',
    url: '/folder/Progress',
    iosIcon: analyticsOutline,
    mdIcon: analyticsOutline
  },
  {
    title: 'Leaderboard',
    url: '/folder/Leaderboard',
    iosIcon: trophyOutline,
    mdIcon: trophySharp
  },
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
interface StudentSidebarProps {
  onLogout: () => void;
}

const StudentSidebar: React.FC<StudentSidebarProps> = ({ onLogout }) => {
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
      name: 'Maria Garcia',
      email: 'maria.garcia@arenai.edu',
      username: 'maria.garcia'
    };
  };

  const currentUser = getUserData();

  // Handle logout
  const handleLogout = () => {
    console.log('StudentSidebar: Logging out');
    onLogout(); // Call the parent's logout function
  };

  return (
    <IonMenu contentId="main" type="overlay">
      <IonContent>
        {/* Header del menú */}
        <div className="menu-header">
          <div className="student-info">
            <div className="student-avatar">
              <IonIcon icon={schoolSharp} />
            </div>
            <div className="student-details">
              <IonLabel className="student-name">{currentUser.name}</IonLabel>
              <IonNote className="student-email">{currentUser.email}</IonNote>
              <IonNote className="student-username">@{currentUser.username}</IonNote>
              <IonNote className="student-role">Student</IonNote>
            </div>
          </div>
        </div>

        {/* Navegación principal */}
        <IonList id="main-list" lines="none">
          <IonListHeader>Learning</IonListHeader>
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

export default StudentSidebar;