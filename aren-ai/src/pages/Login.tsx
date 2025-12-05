import React, { useState, useEffect } from "react";
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
import { person, key, eye, eyeOff } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import "./Login.css";
import { getApiUrl } from "../config/api";
import AnimatedMascot from "../components/AnimatedMascot";

// The real authentication happens via the backend API at POST /api/auth/login
// We keep a small local type to represent the shape of the response's user
interface ApiUser {
  id: number;
  username: string;
  email: string;
  role: "professor" | "student" | null;
  name: string;
  lastName?: string | null;
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

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const history = useHistory();

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
      setError("Please enter both username and password");
      setIsLoading(false);
      return;
    }

    // MOCK LOGIN FOR LOCAL TESTING (Database Offline)
    if (username === "prof" && password === "test") {
      console.log("Using Mock Professor Login");
      const mockProf = {
        id: 999,
        username: "prof",
        email: "prof@test.com",
        role: "professor",
        name: "Mock Professor",
      };
      onLogin("professor", mockProf);
      history.replace("/page/professor");
      setIsLoading(false);
      return;
    }

    if (username === "student" && password === "test") {
      console.log("Using Mock Student Login");
      const mockStudent = {
        id: 888,
        username: "student",
        email: "student@test.com",
        role: "student",
        name: "Mock Student",
      };
      onLogin("student", mockStudent);
      history.replace("/page/student");
      setIsLoading(false);
      return;
    }

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
        setError(errBody?.message || "Invalid username or password");
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

      // Call the onLogin callback with role and user data
      onLogin(data.user.role ?? "student", data.user);

      // Clear form
      setUsername("");
      setPassword("");

      // Redirect to the appropriate dashboard
      const redirectPath =
        data.user.role === "student" ? "/page/student" : "/page/professor";
      history.replace(redirectPath);
    } catch (error) {
      console.error("Login error", error);
      setError("Unable to reach authentication server");
      setIsLoading(false);
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
    setError("Password recovery feature coming soon!");
  };

  return (
    <IonPage>
      <IonContent fullscreen class="login-content">
        <div className="login-container">
          <IonGrid>
            <IonRow class="ion-justify-content-center">
              <IonCol size="12" size-md="8" size-lg="6" size-xl="4">
                {/* Brand section con título arriba del logo */}
                <div className="brand-section">
                  <IonText>
                    <h1 className="brand-title">Aren AI</h1>
                  </IonText>
                  <div className="logo-container">
                    <AnimatedMascot
                      openSrc="/assets/profile_picture_capybara_eyes_open.png"
                      closedSrc="/assets/profile_picture_capybara_eyes_closed.png"
                      winkSrc="/assets/profile_picture_capybara_wink.png"
                      className="logo-image"
                    />
                  </div>
                  <IonText>
                    <p className="brand-subtitle">
                      Less Monologues, more Dialogs
                    </p>
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
                          <h3 className="input-label">Username</h3>
                        </IonText>
                        <IonItem className="input-item" lines="none">
                          <IonIcon
                            icon={person}
                            slot="start"
                            className="input-icon"
                          />
                          <IonInput
                            type="text"
                            placeholder="Enter your username"
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
                          <h3 className="input-label">Password</h3>
                        </IonText>
                        <IonItem className="input-item" lines="none">
                          <IonIcon
                            icon={key}
                            slot="start"
                            className="input-icon"
                          />
                          <IonInput
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
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
                          Forgot password?
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
                    {isLoading ? "LOGGING IN..." : "LOGIN"}
                  </IonButton>

                  <IonButton
                    expand="block"
                    fill="outline"
                    className="teacher-button"
                    onClick={handleTeacherLogin}
                    disabled={isLoading}
                  >
                    Are you a teacher?
                  </IonButton>

                  <IonButton
                    expand="block"
                    fill="outline"
                    className="teacher-button"
                    onClick={handleStudentRegister}
                    disabled={isLoading}
                    style={{ marginTop: 8 }}
                  >
                    Are you a student?
                  </IonButton>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
