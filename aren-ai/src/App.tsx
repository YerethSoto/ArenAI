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
import RegisterStudent from './pages/RegisterStudent';
import Class_Creation from './pages/Class_Creation';
import StudentSectionPage from './pages/StudentScores';
import Quiz from './pages/Quiz';
import Main_Prof from './pages/Main_Prof';
import Main_Student from './pages/Main_Student';
import Class_Join from './pages/Class_Join';
import BattleMinigame from './pages/BattleMinigame';
import BattleLobby from './components/BattleLobby';

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

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<'professor' | 'student' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedRole = localStorage.getItem('userRole') as 'professor' | 'student' | null;
    if (savedRole) {
      setUserRole(savedRole);
    } else {
      setUserRole(null);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (role: 'professor' | 'student', userData?: any) => {
    setUserRole(role);
    localStorage.setItem('userRole', role);
    if (userData) {
      localStorage.setItem('userData', JSON.stringify(userData));
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    localStorage.removeItem('userData');
    localStorage.removeItem('userRole');
  };

  const renderSidebar = () => {
    if (!userRole) return null;
    switch (userRole) {
      case 'professor':
        return <ProfessorSidebar key="professor" onLogout={handleLogout} />;
      case 'student':
        return <StudentSidebar key="student" onLogout={handleLogout} />;
      default:
        return null;
    }
  };

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

            <Route path="/Register" exact={true}>
              <Register />
            </Route>
            <Route path="/register-student" exact={true}>
              <RegisterStudent />
            </Route>
       
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

            <Route path="/quiz" exact={true}>
              {userRole === 'student' ? <Quiz /> : <Redirect to="/login" />}
            </Route>


            <Route path="/battleminigame" exact={true}>
              {userRole === 'student' ? <BattleMinigame></BattleMinigame>: <Redirect to="/login" />}
            </Route>
            
             <Route path="/battlelobby" exact={true}>
              {userRole === 'student' ? <BattleLobby></BattleLobby>: <Redirect to="/login" />}
            </Route>

            <Route path="/chat" exact={true}>
              {userRole ? <Chat /> : <Redirect to="/login" />}
            </Route>

            {/* Students by section */}
            <Route path="/student-section" exact={true}>
              {userRole === 'professor' ? <StudentSectionPage /> : <Redirect to="/login" />}
            </Route>

            {/* Nueva ruta para unirse a clase por código o QR */}
            <Route path="/join/:code?" exact={true}>
              <Class_Join />
            </Route>
          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;