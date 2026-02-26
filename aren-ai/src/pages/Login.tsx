import React, { useState, useEffect } from "react";
import { useAvatar } from "../context/AvatarContext";
import {
  IonContent,
  IonPage,
  IonItem,
  IonInput,
  IonButton,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonCard,
  IonCardContent,
} from "@ionic/react";
import { person, key, eye, eyeOff, globeOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Login.css";
import { getApiUrl } from "../config/api";
import AnimatedMascot from "../components/AnimatedMascot";
import ThemeSelectionModal from "../components/ThemeSelectionModal";
import { Theme } from "../context/ThemeContext";

// The real authentication happens via the backend API at POST /api/auth/login
// We keep a small local type to represent the shape of the response's user
interface ApiUser {
  id: number;
  username: string;
  email: string;
  role: "professor" | "student" | null;
  name: string;
  lastName?: string | null;
  first_login?: boolean;
}

// ============================================================================
// PROPS INTERFACE
// ============================================================================

interface LoginProps {
  onLogin: (role: "professor" | "student", userData?: any) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const LANGUAGES = [
  { code: "es", label: "ES", flag: "🇪🇸" },
  { code: "en", label: "EN", flag: "🇺🇸" },
  { code: "zh", label: "ZH", flag: "🇨🇳" },
];

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { t, i18n } = useTranslation();
  const { getAvatarAssets } = useAvatar();
  const avatarAssets = getAvatarAssets();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [pendingUser, setPendingUser] = useState<{
    role: "professor" | "student";
    data: any;
  } | null>(null);
  const history = useHistory();

  const currentLang =
    LANGUAGES.find((l) => i18n.language?.startsWith(l.code)) || LANGUAGES[0];

  const cycleLanguage = () => {
    const currentIdx = LANGUAGES.findIndex((l) =>
      i18n.language?.startsWith(l.code),
    );
    const nextIdx = (currentIdx + 1) % LANGUAGES.length;
    i18n.changeLanguage(LANGUAGES[nextIdx].code);
  };

  // Recarga la página solo una vez al llegar a esta ruta
  useEffect(() => {
    if (!window.location.hash.includes("#reloaded")) {
      window.location.hash = "#reloaded";
      window.location.reload();
    }
    // Si ya tiene el hash, no vuelve a recargar
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    // Validate inputs
    if (!username.trim() || !password.trim()) {
      setError(t("auth.enterBothFields"));
      setIsLoading(false);
      return;
    }

    // --- DEV BYPASS (Student 1) ---
    if (username === "student" && password === "test") {
      console.log("Using Dev Bypass (Student 1)");
      const dummyStudent = {
        id: 999,
        username: "student_test",
        email: "student@test.com",
        role: "student",
        name: "Test Student",
        first_login: false,
      };
      // Mock token
      localStorage.setItem("authToken", "dev-test-token-student");
      localStorage.setItem("userRole", "student");
      localStorage.setItem("userData", JSON.stringify(dummyStudent));

      setTimeout(() => {
        completeLogin("student", dummyStudent, "/page/student");
        setIsLoading(false);
      }, 500);
      return;
    }

    // --- DEV BYPASS (Student 2) ---
    if (username === "student2" && password === "test") {
      console.log("Using Dev Bypass (Student 2)");
      const dummyStudent2 = {
        id: 998,
        username: "student_test_2",
        email: "student2@test.com",
        role: "student",
        name: "Test Student 2",
        first_login: false,
      };
      // Mock token
      localStorage.setItem("authToken", "dev-test-token-student-2");
      localStorage.setItem("userRole", "student");
      localStorage.setItem("userData", JSON.stringify(dummyStudent2));

      setTimeout(() => {
        completeLogin("student", dummyStudent2, "/page/student");
        setIsLoading(false);
      }, 500);
      return;
    }

    if (username === "professor" && password === "test") {
      console.log("Using Dev Bypass (Professor)");
      const dummyProf = {
        id: 888,
        username: "prof_test",
        email: "prof@test.com",
        role: "professor",
        name: "Test Professor",
      };
      // Mock token
      localStorage.setItem("authToken", "dev-test-token-prof");
      localStorage.setItem("userRole", "professor");
      localStorage.setItem("userData", JSON.stringify(dummyProf));

      setTimeout(() => {
        completeLogin("professor", dummyProf, "/page/professor");
        setIsLoading(false);
      }, 500);
      return;
    }
    // ------------------

    // Call backend API
    try {
      const resp = await fetch(getApiUrl("/api/auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier: username, password }),
      });

      if (!resp.ok) {
        // Attempt to show server error message
        const errBody = await resp.json().catch(() => null);
        setError(errBody?.message || t("auth.invalidCredentials"));
        setIsLoading(false);
        return;
      }

      const data = await resp.json();

      // Persist token for subsequent requests
      if (data.token) {
        try {
          localStorage.setItem("authToken", data.token);
        } catch (_) {
          // ignore storage errors
        }
      }

      const role = data.user.role ?? "student";
      console.log("role", role);
      if (role === "student") {
        // CORRECTION: Standard convention is first_login=true means IT IS THE FIRST LOGIN (Not Onboarded).
        // So if first_login is TRUE, we show the modal.
        // If first_login is FALSE, we skip to dashboard.
        const isFirstLogin = !!data.user.first_login;
        console.log("firstLogin", isFirstLogin);

        if (isFirstLogin) {
          localStorage.setItem("userRole", "student");
          completeLogin(role, data.user, "/page/student");
        } else {
          completeLogin(role, data.user, "/page/student");
        }
      } else {
        // Direct login for professors
        completeLogin(role, data.user);
      }
    } catch (error) {
      console.error("Login error", error);
      setError(t("auth.serverError"));
      setIsLoading(false);
    }
  };

  const completeLogin = (
    role: "professor" | "student",
    userData: any,
    targetPath?: string,
  ) => {
    // Ensure fresh socket connection for new user
    import("../services/socket").then(({ socketService }) => {
      console.log(
        "Login: Disconnecting previous socket to ensure fresh session.",
      );
      socketService.disconnect();
    });

    onLogin(role, userData);

    // Clear form
    setUsername("");
    setPassword("");

    // Redirect to the appropriate dashboard or specific path
    if (targetPath) {
      history.replace(targetPath);
    } else {
      const redirectPath =
        role === "student" ? "/page/student" : "/page/professor";
      history.replace(redirectPath);
    }
  };

  const handleThemeSelection = async (theme: Theme) => {
    // Theme is already set in context by the modal
    if (pendingUser) {
      setShowThemeModal(false);

      // Update backend to mark first_login as true (onboarding complete)
      try {
        const token = localStorage.getItem("authToken");
        await fetch(
          getApiUrl(`/api/students/${pendingUser.data.id}/onboarding`),
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ first_login: true }),
          },
        );
      } catch (err) {
        console.error("Failed to update user onboarding status", err);
      }

      completeLogin(pendingUser.role, pendingUser.data, "/personality-quiz");
    }
  };

  const handleTeacherLogin = () => {
    // Redirect to registration page
    history.push("/register");
  };

  const handleStudentRegister = () => {
    history.push("/register-student");
  };

  const handleForgotPassword = () => {
    console.log("Forgot password clicked");
    // Logic for password recovery
    setError(t("auth.passwordRecovery"));
  };

  return (
    <IonPage>
      <IonContent fullscreen class="login-content">
        {/* Language Toggle Button */}
        <button
          className="lang-toggle-btn"
          onClick={cycleLanguage}
          title="Change language"
        >
          <span className="lang-flag">{currentLang.flag}</span>
          <span className="lang-code">{currentLang.label}</span>
        </button>

        <div className="login-container">
          <IonGrid>
            <IonRow class="ion-justify-content-center">
              <IonCol size="12" size-md="8" size-lg="6" size-xl="4">
                {/* Brand section */}
                <div className="brand-section">
                  <IonText>
                    <h1 className="brand-title">{t("auth.brandTitle")}</h1>
                  </IonText>
                  <div className="logo-container">
                    <AnimatedMascot
                      openSrc={avatarAssets.open}
                      closedSrc={avatarAssets.closed}
                      winkSrc={avatarAssets.wink}
                      className="logo-image"
                    />
                  </div>
                  <IonText>
                    <p className="brand-subtitle">{t("auth.brandSubtitle")}</p>
                  </IonText>
                </div>

                {/* Card de login SOLO con campos */}
                <IonCard className="login-card">
                  <IonCardContent>
                    <form onSubmit={handleLogin}>
                      {/* Error Message */}
                      {error && (
                        <div
                          className="error-message"
                          style={{
                            color: "red",
                            textAlign: "center",
                            marginBottom: "15px",
                            fontSize: "0.9rem",
                          }}
                        >
                          {error}
                        </div>
                      )}

                      {/* Username Section */}
                      <div className="input-section">
                        <IonText>
                          <h3 className="input-label">{t("auth.username")}</h3>
                        </IonText>
                        <IonItem className="input-item" lines="none">
                          <IonIcon
                            icon={person}
                            slot="start"
                            className="input-icon"
                          />
                          <IonInput
                            type="text"
                            placeholder={t("auth.usernamePlaceholder")}
                            value={username}
                            onIonInput={(e) => setUsername(e.detail.value!)}
                            className="custom-input"
                            required
                          />
                        </IonItem>
                      </div>

                      {/* Password Section */}
                      <div className="input-section">
                        <IonText>
                          <h3 className="input-label">{t("auth.password")}</h3>
                        </IonText>
                        <IonItem className="input-item" lines="none">
                          <IonIcon
                            icon={key}
                            slot="start"
                            className="input-icon"
                          />
                          <IonInput
                            type={showPassword ? "text" : "password"}
                            placeholder={t("auth.passwordPlaceholder")}
                            value={password}
                            onIonInput={(e) => setPassword(e.detail.value!)}
                            className="custom-input"
                            required
                          />
                          <IonButton
                            fill="clear"
                            slot="end"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            <IonIcon icon={showPassword ? eyeOff : eye} />
                          </IonButton>
                        </IonItem>
                      </div>

                      {/* Forgot Password Link */}
                      <div className="forgot-password-section">
                        <IonButton
                          fill="clear"
                          className="forgot-password-link"
                          onClick={handleForgotPassword}
                        >
                          {t("auth.forgotPassword")}
                        </IonButton>
                      </div>
                    </form>
                  </IonCardContent>
                </IonCard>

                {/* Botones MUY ABAJO de la tarjeta */}
                <div className="buttons-container">
                  <IonButton
                    type="submit"
                    expand="block"
                    className="login-button"
                    onClick={handleLogin}
                    disabled={isLoading}
                  >
                    {isLoading ? t("auth.loggingIn") : t("auth.login")}
                  </IonButton>

                  <IonButton
                    expand="block"
                    fill="outline"
                    className="teacher-button"
                    onClick={handleTeacherLogin}
                    disabled={isLoading}
                  >
                    {t("auth.areYouTeacher")}
                  </IonButton>

                  <IonButton
                    expand="block"
                    fill="outline"
                    className="teacher-button"
                    onClick={handleStudentRegister}
                    disabled={isLoading}
                    style={{ marginTop: 8 }}
                  >
                    {t("auth.areYouStudent")}
                  </IonButton>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>

      <ThemeSelectionModal
        isOpen={showThemeModal}
        onDismiss={() => setShowThemeModal(false)}
        onThemeSelected={handleThemeSelection}
      />
    </IonPage>
  );
};

export default Login;
