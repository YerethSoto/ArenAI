import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ProfessorSidebar from './components/ProfessorSidebar';
import StudentSidebar from './components/StudentSidebar';
import Page from './pages/Page';
import Chat from './pages/Chatbot';
import Login from './pages/Login';
import Register from './pages/Register';
import Class_Creation from './pages/Class_Creation';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import Main_Prof from './pages/Main_Prof';
import Main_Student from './pages/Main_Student';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => {
  // State to track user role - this will come from your authentication system
  const [userRole, setUserRole] = useState<'professor' | 'student' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // This useEffect simulates checking user authentication
  useEffect(() => {
    // Check if user role exists in localStorage
    const savedRole = localStorage.getItem('userRole') as 'professor' | 'student' | null;
    console.log('App: Checking localStorage for userRole:', savedRole);
    
    if (savedRole) {
      setUserRole(savedRole);
    } else {
      // NO DEFAULT ROLE - user must login first
      setUserRole(null);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (role: 'professor' | 'student', userData?: any) => {
    console.log('App: User logged in as:', role, 'with data:', userData);
    setUserRole(role);
    localStorage.setItem('userRole', role);
    
    // Store user data for personalization
    if (userData) {
      localStorage.setItem('userData', JSON.stringify(userData));
    }
  };

  // Handle logout
  const handleLogout = () => {
    console.log('App: Logging out user');
    setUserRole(null);
    localStorage.removeItem('userData');
    localStorage.removeItem('userRole');
  };

  // Determine which sidebar to show based on user role
  const renderSidebar = () => {
    if (!userRole) {
      console.log('App: No user role, not rendering sidebar');
      return null;
    }
    
    console.log('App: Rendering sidebar for role:', userRole);
    switch (userRole) {
      case 'professor':
        return <ProfessorSidebar onLogout={handleLogout} />;
      case 'student':
        return <StudentSidebar onLogout={handleLogout} />;
      default:
        return null;
    }
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <IonApp>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <p>Loading...</p>
        </div>
      </IonApp>
    );
  }

  return (
    <IonApp>
      <IonReactRouter>
        <IonSplitPane contentId="main" disabled={!userRole}>
          {renderSidebar()}
          <IonRouterOutlet id="main">
            <Route path="/" exact={true}>
              {userRole ? (
                <Redirect to={userRole === 'student' ? "/page/student" : "/page/professor"} />
              ) : (
                <Redirect to="/login" />
              )}
            </Route>
            
            {/* Authentication Routes */}
            <Route path="/login" exact={true}>
              {userRole ? (
                <Redirect to={userRole === 'student' ? "/page/student" : "/page/professor"} />
              ) : (
                <Login onLogin={handleLogin} />
              )}
            </Route>

            {/* Importante activar al crear registro
            <Route path="/register" exact={true}>
              <Register onRegister={(role: 'professor' | 'student') => {
                setUserRole(role);
                localStorage.setItem('userRole', role);
              }} />
            </Route>
            */}
            
            {/* Main Dashboard Routes */}
            <Route path="/page/professor" exact={true}>
              {userRole === 'professor' ? <Main_Prof /> : <Redirect to="/login" />}
            </Route>
            <Route path="/page/student" exact={true}>
              {userRole === 'student' ? <Main_Student /> : <Redirect to="/login" />}
            </Route>
            
            {/* Additional Features */}
            <Route path="/class-creation" exact={true}>
              {userRole === 'professor' ? <Class_Creation /> : <Redirect to="/login" />}
            </Route>
            <Route path="/folder/:name" exact={true}>
              {userRole ? <Page /> : <Redirect to="/login" />}
            </Route>
            <Route path="/chat" exact={true}>
              {userRole ? <Chat /> : <Redirect to="/login" />}
            </Route>
          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;