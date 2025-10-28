import React, { useState } from "react";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonPage,
  IonText,
  IonToolbar,
  IonInput,
} from "@ionic/react";
import "./Login.css";

const Login: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (firstName.trim() === "" || lastName.trim() === "" || password.trim() === "") {
      setError("Please enter first name, last name and password");
      return;
    }

    // Demo: credenciales quemadas (no hace backend)
    if (firstName === "Admin" && lastName === "User" && password === "password") {
      setLoggedIn(true);
      return;
    }

    // marcar como ingresado si hay cualquier valor (modo demo)
    setLoggedIn(true);
  };

  return (
    <IonPage>
      <IonHeader className="app-header">
        <IonToolbar>
          <IonText className="app-title" color="dark">
            <strong>ArenAI</strong>
          </IonText>
        </IonToolbar>
      </IonHeader>

      {/* fullscreen para poder centrar respecto a toda la pantalla */}
      <IonContent fullscreen className="login-content">
        <div className="login-center">
          <div className="login-form" role="form" aria-label="Login form">
            <h2 className="login-title">Welcome</h2>

            {error && (
              <IonText color="danger" className="error-message">
                {error}
              </IonText>
            )}
            {loggedIn && (
              <IonText color="success" className="success-message">
                Login successful (demo)
              </IonText>
            )}

            <IonItem className="form-item">
              <IonLabel position="floating">First name</IonLabel>
              <IonInput
                value={firstName}
                onIonInput={(e: any) => setFirstName(e.detail.value ?? "")}
                disabled={loggedIn}
                className="message-input"
                inputMode="text"
                autocomplete="given-name"
              />
            </IonItem>

            <IonItem className="form-item">
              <IonLabel position="floating">Last name</IonLabel>
              <IonInput
                value={lastName}
                onIonInput={(e: any) => setLastName(e.detail.value ?? "")}
                disabled={loggedIn}
                className="message-input"
                inputMode="text"
                autocomplete="family-name"
              />
            </IonItem>

            <IonItem className="form-item">
              <IonLabel position="floating">Password</IonLabel>
              <IonInput
                type="password"
                value={password}
                onIonInput={(e: any) => setPassword(e.detail.value ?? "")}
                disabled={loggedIn}
                className="message-input"
                autocomplete="current-password"
              />
            </IonItem>

            <IonButton
              expand="full"
              onClick={handleLogin}
              disabled={loggedIn}
              className="login-button"
              aria-label="Login"
              href="/teacher-main"
            >
              {loggedIn ? "Logged in" : "Login"}
            </IonButton>

            <div className="teacher-row">
              <a className="teacher-link" href="/teacher-signup">
                Are you a teacher?
              </a>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;