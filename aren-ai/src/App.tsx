import {
  IonApp,
  IonRouterOutlet,
  IonSplitPane,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import ProfessorSidebar from "./components/ProfessorSidebar";
import StudentSidebar from "./components/StudentSidebar";
import Page from "./pages/Page";
import Chat from "./pages/Chatbot";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterStudent from "./pages/RegisterStudent";
import Class_Creation from "./pages/Class_Creation";
import CreateTask from "./pages/CreateTask";
import StudentSectionPage from "./pages/StudentScores";
import StudentDetail from "./pages/StudentDetail";
import Quiz from "./pages/Quiz";
import PersonalityQuiz from "./pages/PersonalityQuiz";
import Main_Prof from "./pages/Main_Prof";
import Main_Student from "./pages/Main_Student";
import Class_Join from "./pages/Class_Join";
import BattleMinigame from "./pages/BattleMinigame";
import BattleLobby from "./components/BattleLobby";
import SubjectDetail from "./pages/SubjectDetail";
import StudentProfile from "./pages/StudentProfile";
import CharacterDetail from "./pages/CharacterDetail";
import StudentSettings from "./pages/StudentSettings";
import Achievements from "./pages/Achievements";
import Leaderboard from "./pages/Leaderboard";
import Shop from "./pages/Shop";
import Clan from "./pages/Clan";
import Help from "./pages/Help";
import ProfessorAdmin from "./pages/ProfessorAdmin";
import ProfessorProfile from "./pages/ProfessorProfile";
import ProfessorChat from "./pages/ProfessorChat";
import { ThemeProvider } from "./context/ThemeContext";
import { AvatarProvider } from "./context/AvatarContext";
import { SoundProvider } from "./context/SoundContext";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "./theme/shared.css"; /* Global Shared Styles */

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import "@ionic/react/css/palettes/dark.system.css";

/* Theme variables */
import "./theme/variables.css";

/* i18n */
import "./i18n";

setupIonicReact();

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<"professor" | "student" | null>(
    null
  );
  const [userData, setUserData] = useState<any>(null); // Add userData state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedRole = localStorage.getItem("userRole") as
      | "professor"
      | "student"
      | null;
    const savedUserData = localStorage.getItem("userData"); // Load user data

    if (savedRole) {
      setUserRole(savedRole);
    } else {
      setUserRole(null);
    }

    if (savedUserData) {
      try {
        setUserData(JSON.parse(savedUserData));
      } catch (e) {
        console.error("Failed to parse user data", e);
        setUserData(null);
      }
    }

    setIsLoading(false);
  }, []);

  const handleLogin = (role: "professor" | "student", userData?: any) => {
    setUserRole(role);
    localStorage.setItem("userRole", role);
    if (userData) {
      setUserData(userData); // Set state
      localStorage.setItem("userData", JSON.stringify(userData));
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setUserData(null); // Clear state
    localStorage.removeItem("userData");
    localStorage.removeItem("userRole");
  };

  const renderSidebar = () => {
    if (!userRole) return null;
    switch (userRole) {
      case "professor":
        return <ProfessorSidebar key="professor" onLogout={handleLogout} />;
      case "student":
        return <StudentSidebar key="student" onLogout={handleLogout} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <IonApp>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <p>Loading...</p>
        </div>
      </IonApp>
    );
  }

  return (
    <IonApp>
      <AvatarProvider>
        <ThemeProvider>
          <SoundProvider>
            <IonReactRouter>
              <IonSplitPane contentId="main" disabled={!userRole}>
                {renderSidebar()}
                <IonRouterOutlet id="main">
                  <Route path="/" exact={true}>
                    {userRole ? (
                      <Redirect
                        to={
                          userRole === "student"
                            ? userData?.first_login
                              ? "/personality-quiz"
                              : "/page/student"
                            : "/page/professor"
                        }
                      />
                    ) : (
                      <Redirect to="/login" />
                    )}
                  </Route>

                  {/* Authentication Routes */}
                  <Route path="/login" exact={true}>
                    {userRole ? (
                      <Redirect
                        to={
                          userRole === "student"
                            ? userData?.first_login
                              ? "/personality-quiz"
                              : "/page/student"
                            : "/page/professor"
                        }
                      />
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
                    {userRole === "professor" ? (
                      <Main_Prof />
                    ) : (
                      <Redirect to="/login" />
                    )}
                  </Route>
                  <Route path="/page/student" exact={true}>
                    {userRole === "student" ? (
                      <Main_Student />
                    ) : (
                      <Redirect to="/login" />
                    )}
                  </Route>
                  <Route path="/leaderboard" exact={true}>
                    {userRole === "student" ? (
                      <Leaderboard />
                    ) : (
                      <Redirect to="/login" />
                    )}
                  </Route>
                  <Route path="/leaderboard" exact={true}>
                    {userRole === "student" ? (
                      <Leaderboard />
                    ) : (
                      <Redirect to="/login" />
                    )}
                  </Route>

                  {/* Additional Features */}
                  <Route path="/class-creation" exact={true}>
                    {userRole === "professor" ? (
                      <Class_Creation />
                    ) : (
                      <Redirect to="/login" />
                    )}
                  </Route>
                  <Route path="/create-task" exact={true}>
                    {userRole === "professor" ? (
                      <CreateTask />
                    ) : (
                      <Redirect to="/login" />
                    )}
                  </Route>

                  <Route path="/settings" exact={true}>
                    {userRole === "student" ? (
                      <StudentSettings />
                    ) : (
                      <Redirect to="/login" />
                    )}
                  </Route>

                  <Route path="/folder/:name" exact={true}>
                    {userRole ? <Page /> : <Redirect to="/login" />}
                  </Route>

                  <Route path="/quiz" exact={true}>
                    {userRole === "student" ? <Quiz /> : <Redirect to="/login" />}
                  </Route>

                  <Route path="/personality-quiz" exact={true}>
                    {userRole === "student" ? (
                      <PersonalityQuiz />
                    ) : (
                      <Redirect to="/login" />
                    )}
                  </Route>

                  <Route path="/battleminigame" exact={true}>
                    {userRole === "student" ? (
                      <BattleMinigame></BattleMinigame>
                    ) : (
                      <Redirect to="/login" />
                    )}
                  </Route>

                  <Route path="/battlelobby" exact={true}>
                    {userRole === "student" ? (
                      <BattleLobby></BattleLobby>
                    ) : (
                      <Redirect to="/login" />
                    )}
                  </Route>

                  <Route path="/subject/:name" exact={true}>
                    {userRole === "student" ? (
                      <SubjectDetail />
                    ) : (
                      <Redirect to="/login" />
                    )}
                  </Route>

                  <Route path="/profile" exact={true}>
                    {userRole === "student" ? (
                      <StudentProfile />
                    ) : (
                      <Redirect to="/login" />
                    )}
                  </Route>

                  <Route path="/character-detail" exact={true}>
                    {userRole === "student" ? (
                      <CharacterDetail />
                    ) : (
                      <Redirect to="/login" />
                    )}
                  </Route>

                  <Route path="/achievements" exact={true}>
                    {userRole === "student" ? (
                      <Achievements />
                    ) : (
                      <Redirect to="/login" />
                    )}
                  </Route>

                  <Route path="/chat" exact={true}>
                    {userRole ? <Chat /> : <Redirect to="/login" />}
                  </Route>

                  {/* Students by section */}
                  <Route path="/student-section" exact={true}>
                    {userRole === "professor" ? (
                      <StudentSectionPage />
                    ) : (
                      <Redirect to="/login" />
                    )}
                  </Route>

                  {/* Student Detail Page */}
                  <Route
                    path="/teacher-student-detail/:username/:subject"
                    exact={true}
                  >
                    {userRole === "professor" ? (
                      <StudentDetail />
                    ) : (
                      <Redirect to="/login" />
                    )}
                  </Route>

                  {/* Professor Admin Page */}
                  <Route path="/teacher-admin" exact={true}>
                    {userRole === "professor" ? (
                      <ProfessorAdmin />
                    ) : (
                      <Redirect to="/login" />
                    )}
                  </Route>

                  <Route path="/professor-profile" exact={true}>
                    {userRole === "professor" ? (
                      <ProfessorProfile />
                    ) : (
                      <Redirect to="/login" />
                    )}
                  </Route>

                  <Route path="/professor-chat" exact={true}>
                    {userRole === "professor" ? (
                      <ProfessorChat />
                    ) : (
                      <Redirect to="/login" />
                    )}
                  </Route>

                  <Route path="/help" exact={true}>
                    {userRole === "student" ? <Help /> : <Redirect to="/login" />}
                  </Route>

                  {/* Nueva ruta para unirse a clase por código o QR */}
                  <Route path="/join/:code?" exact={true}>
                    <Class_Join />
                  </Route>
                </IonRouterOutlet>
              </IonSplitPane>
            </IonReactRouter>
          </SoundProvider>
        </ThemeProvider>
      </AvatarProvider>
    </IonApp >
  );
};

export default App;
