import React, { useEffect, useState } from 'react';
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
import { Link } from 'react-router-dom';

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
  analyticsOutline,
  timeOutline
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
    title: 'Main Menu',
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
    title: 'Quiz',
    url: '/quiz',
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

// Cálculo simplificado del índice de utilización
// Ejemplo: Meta diaria de índice = 100
// Índice = (tiempoDeUso * 0.7) + (actividadesCompletadas * 10) + otrosFactores
function calcularIndiceUtilizacion({
  tiempoDeUso,
  actividadesCompletadas
}: { tiempoDeUso: number; actividadesCompletadas: number }) {
  // Ejemplo de fórmula compuesta y clara:
  // - El tiempo de uso pondera más al principio y menos después (logarítmico)
  // - Las actividades completadas tienen peso cuadrático
  // - Hay un pequeño bonus si el usuario supera ciertos umbrales
  const usoLog = Math.log1p(tiempoDeUso) * 15;
  const actividadesPeso = Math.pow(actividadesCompletadas, 1.5) * 6;
  const bonus = (tiempoDeUso > 60 ? 10 : 0) + (actividadesCompletadas >= 5 ? 8 : 0);
  return Math.round(usoLog + actividadesPeso + bonus);
}

const META_DIARIA = 100;

const StudentSidebar: React.FC<StudentSidebarProps> = ({ onLogout }) => {
  const [showAnimation, setShowAnimation] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Solo muestra la animación la primera vez
    const timer = setTimeout(() => setShowAnimation(false), 1000); // duración de la animación
    return () => clearTimeout(timer);
  }, []);

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

  // --- NUEVO: Estados para uso e índice ---
  const [tiempoDeUso, setTiempoDeUso] = useState<number>(0); // en minutos
  const [actividadesCompletadas, setActividadesCompletadas] = useState<number>(0);

  // Simulación de otros factores (quemado)
  const otrosFactores = 10;

  // Simulación: incrementar tiempo de uso cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setTiempoDeUso(prev => prev + 1);
    }, 60000); // cada minuto
    return () => clearInterval(interval);
  }, []);

  // Simulación: actividades completadas (puedes cambiarlo por datos reales)
  useEffect(() => {
    setActividadesCompletadas(3); // valor quemado
  }, []);

  // Cálculo del índice de utilización usando la función determinista
  const indiceUtilizacion = calcularIndiceUtilizacion({
    tiempoDeUso,
    actividadesCompletadas
  });

  // Cálculo del porcentaje de progreso
  const progreso = Math.min(100, Math.round((indiceUtilizacion / META_DIARIA) * 100));

  // Estado para mostrar la ventanita de explicación
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);

  return (
    <IonMenu contentId="main">
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

        {/* --- NUEVO: Indicadores de uso --- */}
        <div className="sidebar-usage-info">
          <div className="usage-row">
            <IonIcon icon={analyticsOutline} className="usage-icon" />
            <span className="usage-label">Índice de utilización:</span>
            <span className="usage-value">{indiceUtilizacion}</span>
            <button
              className="usage-help-btn"
              aria-label="¿Cómo se calcula?"
              onClick={() => setShowFormulaInfo(true)}
              tabIndex={0}
            >
              <IonIcon icon={helpCircleOutline} />
            </button>
          </div>
          <div className="usage-progress-bar">
            <div className="usage-progress-inner" style={{ width: `${progreso}%` }} />
          </div>
          <div className="usage-progress-label">
           
          </div>
          <div className="usage-row">
            <IonIcon icon={timeOutline} className="usage-icon" />
            <span className="usage-label">Tiempo de uso hoy:</span>
            <span className="usage-value">{tiempoDeUso} min</span>
          </div>
          {showFormulaInfo && (
            <div className="usage-formula-tooltip" onClick={() => setShowFormulaInfo(false)}>
              <strong>¿Cómo se calcula?</strong>
              <div>
                Índice = log(1 + minutos de uso) × 15 + (actividades completadas<sup>1.5</sup> × 6) + bonus<br /><br />
                <b>Bonus:</b> +10 si usas más de 60 min, +8 si completas 5 o más actividades.<br />
                <b>Meta diaria:</b> {META_DIARIA} puntos.<br />
                <b>Progreso:</b> La barra muestra tu avance hacia la meta diaria.
              </div>
              <div className="usage-formula-close">Cerrar</div>
            </div>
          )}
        </div>

        {/* Información de la app */}
        <div className="menu-footer">
          <IonNote className="app-version">ArenAI v1.0.0</IonNote>
        </div>
      </IonContent>
    </IonMenu>
  );
};

export default StudentSidebar;