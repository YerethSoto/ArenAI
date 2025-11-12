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

// ============================================================================
// DUMMY DATA - This will be replaced with API calls later
// ============================================================================

interface User {
  username: string;
  password: string;
  role: 'professor' | 'student';
  name: string;
  email: string;
}

const DUMMY_USERS: User[] = [
  // Professor accounts
  {
    username: 'prof.rodriguez',
    password: 'password123',
    role: 'professor',
    name: 'Prof. Rodriguez',
    email: 'prof.rodriguez@arenai.edu'
  },
  {
    username: 'Yereth',
    password: '123',
    role: 'professor',
    name: 'Yereth Soto',
    email: 'ysotoz011@ulacit.ed.cr'
  },
  {
    username: 'dr.smith',
    password: 'password123',
    role: 'professor',
    name: 'Dr. Smith',
    email: 'dr.smith@arenai.edu'
  },
  // Student accounts
  {
    username: 'maria.garcia',
    password: 'password123',
    role: 'student',
    name: 'Maria Garcia',
    email: 'maria.garcia@arenai.edu'
  },
  {
    username: 'john.doe',
    password: 'password123',
    role: 'student',
    name: 'John Doe',
    email: 'john.doe@arenai.edu'
  },
  {
    username: 'sarah.wilson',
    password: 'password123',
    role: 'student',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@arenai.edu'
  }
];

// ============================================================================
// HELPER FUNCTIONS - These will remain the same
// ============================================================================

const authenticateUser = (username: string, password: string): User | null => {
  const user = DUMMY_USERS.find(
    user => user.username === username && user.password === password
  );
  return user || null;
};

// ============================================================================
// PROPS INTERFACE
// ============================================================================

interface LoginProps {
  onLogin: (role: 'professor' | 'student', userData?: any) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const history = useHistory();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Validate inputs
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      setIsLoading(false);
      return;
    }

    // Simulate API call delay
    setTimeout(() => {
      const authenticatedUser = authenticateUser(username, password);
      
      if (authenticatedUser) {
        console.log('Login successful:', authenticatedUser);
        
        // Call the onLogin callback with user role and data
        onLogin(authenticatedUser.role, {
          name: authenticatedUser.name,
          email: authenticatedUser.email,
          username: authenticatedUser.username
        });
        
        // Clear form
        setUsername('');
        setPassword('');
        
        // Redirige SIEMPRE al dashboard principal
        const redirectPath = authenticatedUser.role === 'student' 
          ? '/page/student' 
          : '/page/professor';
        history.replace(redirectPath); // <-- Usa replace en vez de push
        
      } else {
        setError('Invalid username or password');
        setIsLoading(false);
      }
    }, 1500);
  };

  const handleTeacherLogin = () => {
    // Redirect to registration page
    history.push('/register');
  };

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
    // Logic for password recovery
    setError('Password recovery feature coming soon!');
  };

  // Quick login for demo purposes (optional - remove in production)
  const handleQuickLogin = (demoUsername: string, demoPassword: string) => {
    setUsername(demoUsername);
    setPassword(demoPassword);
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

                {/* Demo Quick Login - Remove in production */}
                <div className="demo-section" style={{ marginBottom: '20px', textAlign: 'center' }}>
                  <IonText>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>
                      Demo Accounts (Click to auto-fill):
                    </p>
                  </IonText>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <IonButton 
                      size="small" 
                      fill="outline"
                      onClick={() => handleQuickLogin('prof.rodriguez', 'password123')}
                    >
                      Professor
                    </IonButton>
                    <IonButton 
                      size="small" 
                      fill="outline"
                      onClick={() => handleQuickLogin('Yereth', '123')}
                    >
                      Yereth (Prof)
                    </IonButton>
                    <IonButton 
                      size="small" 
                      fill="outline"
                      onClick={() => handleQuickLogin('maria.garcia', 'password123')}
                    >
                      Student
                    </IonButton>
                  </div>
                </div>

                {/* Card de login SOLO con campos */}
                <IonCard className="login-card">
                  <IonCardContent>
                    <form onSubmit={handleLogin}>
                      
                      {/* Error Message */}
                      {error && (
                        <div className="error-message" style={{ 
                          color: 'red', 
                          textAlign: 'center', 
                          marginBottom: '15px',
                          fontSize: '0.9rem'
                        }}>
                          {error}
                        </div>
                      )}

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