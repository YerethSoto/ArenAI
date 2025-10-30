import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonNote,
  IonMenuToggle,
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
  clipboardOutline
} from 'ionicons/icons';
import './Menu.css';

interface AppPage {
  url: string;
  iosIcon: string;
  mdIcon: string;
  title: string;
}

const appPages: AppPage[] = [
  {
    title: 'Dashboard',
    url: '/main-prof',
    iosIcon: homeOutline,
    mdIcon: homeSharp
  },
  {
    title: 'My Classes',
    url: '/folder/Classes',
    iosIcon: schoolOutline,
    mdIcon: schoolSharp
  },
  {
    title: 'Create Class',
    url: '/class-creation',
    iosIcon: createOutline,
    mdIcon: createSharp
  },
  {
    title: 'Analytics',
    url: '/folder/Analytics',
    iosIcon: analyticsOutline,
    mdIcon: analyticsSharp
  },
  {
    title: 'Students',
    url: '/folder/Students',
    iosIcon: peopleOutline,
    mdIcon: peopleSharp
  },
  {
    title: 'Assignments',
    url: '/folder/Assignments',
    iosIcon: clipboardOutline,
    mdIcon: clipboardOutline
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

const Menu: React.FC = () => {
  const location = useLocation();

  return (
    <IonMenu contentId="main" type="overlay">
      <IonContent>
        {/* Header del menú */}
        <div className="menu-header">
          <div className="teacher-info">
            <div className="teacher-avatar">
              <IonIcon icon={schoolSharp} />
            </div>
            <div className="teacher-details">
              <IonLabel className="teacher-name">Prof. Rodriguez</IonLabel>
              <IonNote className="teacher-email">prof.rodriguez@arenai.edu</IonNote>
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

export default Menu;