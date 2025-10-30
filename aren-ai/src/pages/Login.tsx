import React, { useState } from 'react';
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
  IonCardContent
} from '@ionic/react';
import { person, key, eye, eyeOff } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import './Login.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular proceso de login
    setTimeout(() => {
      console.log('Login attempt with:', { username, password });
      setIsLoading(false);
    }, 1500);
  };

  const handleTeacherLogin = () => {
    // Redirigir a la pantalla de registro
    history.push('/register');
  };

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
    // Lógica para recuperar contraseña
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
                    <h1 className="brand-title">ARENAI</h1>
                  </IonText>
                  <div className="logo-container">
                    <img 
                      src="./resources/Capybara profile picture.png" 
                      alt="ArenAI Logo" 
                      className="logo-image"
                    />
                  </div>
                  <IonText>
                    <p className="brand-subtitle">Ready to learn?</p>
                  </IonText>
                </div>

                {/* Card de login SOLO con campos */}
                <IonCard className="login-card">
                  <IonCardContent>
                    <form onSubmit={handleLogin}>
                      
                      {/* Username Section */}
                      <div className="input-section">
                        <IonText>
                          <h3 className="input-label">Username</h3>
                        </IonText>
                        <IonItem className="input-item" lines="none">
                          <IonIcon icon={person} slot="start" className="input-icon" />
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
                          <IonIcon icon={key} slot="start" className="input-icon" />
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
                    {isLoading ? 'LOGGING IN...' : 'LOGIN'}
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