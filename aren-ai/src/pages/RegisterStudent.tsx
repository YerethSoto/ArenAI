import React, { useState } from "react";
import {
  IonContent,
  IonPage,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonItem,
  IonInput,
  IonButton,
  IonText,
  IonIcon,
} from "@ionic/react";
import { person, key, business, arrowBack, eye, eyeOff } from "ionicons/icons";
import "./RegisterStudent.css";
import { useHistory } from "react-router-dom";
import { getApiUrl } from "../config/api";

const RegisterStudent: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    institution: "",
    sectionId: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const history = useHistory();

  // Validar contrase単a
  const validatePassword = (password: string) => {
    const errors: string[] = [];
    if (password.length < 8) {
      errors.push("At least 8 characters");
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push("At least one lowercase letter");
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push("At least one uppercase letter");
    }
    /*
    if (!/(?=.*\d)/.test(password)) {
      errors.push('At least one number');
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('At least one special character (@$!%*?&)');
    }
      */
    return errors;
  };

  const handleInputChange = (field: string, value: string) => {
    const newFormData = {
      ...formData,
      [field]: value,
    };

    setFormData(newFormData);

    // Validar contrase単a cuando cambia
    if (field === "password") {
      const errors = validatePassword(value);
      setPasswordErrors(errors);
    }
  };

  const handleRegister = async (e?: React.FormEvent) => {
    e?.preventDefault();

    // Validar campos requeridos
    if (
      !formData.username.trim() ||
      !formData.password ||
      !formData.institution.trim() ||
      !formData.sectionId.trim()
    ) {
      alert("Please fill all fields");
      return;
    }

    // Validar contrase単a
    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      alert("Please fix password requirements:\n" + passwordErrors.join("\n"));
      return;
    }

    // Validar que las contrase単as coincidan
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const resp = await fetch(getApiUrl("/api/auth/register-student"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password,
          institution: formData.institution.trim(),
          sectionId: parseInt(formData.sectionId),
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => null);
        console.error("Register Error:", err, "Status:", resp.status);
        const msg = err?.error || err?.message || "Registration failed";
        alert(`Error ${resp.status}: ${msg}`);
        setIsLoading(false);
        return;
      }

      const data = await resp.json();
      if (data.token) {
        try {
          localStorage.setItem("authToken", data.token);
          // mark role so App routing allows student pages immediately
          localStorage.setItem("userRole", "student");
          // store basic user data for personalization
          if (data.user)
            localStorage.setItem("userData", JSON.stringify(data.user));
        } catch (_) {}
      }

      setIsLoading(false);
      history.replace("/page/student");
    } catch (error) {
      console.error("Student register error", error);
      alert("Unable to reach server");
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    history.push("/login");
  };

  return (
    <IonPage>
      <IonContent fullscreen class="register-content">
        <div className="register-container">
          <IonGrid>
            <IonRow class="ion-justify-content-center">
              <IonCol size="12" size-md="8" size-lg="6" size-xl="4">
                {/* Brand section */}
                <div className="brand-section">
                  <IonButton
                    fill="clear"
                    className="back-button"
                    onClick={handleBackToLogin}
                  >
                    <IonIcon icon={arrowBack} slot="start" />
                    Back to Login
                  </IonButton>

                  <IonText>
                    <h1 className="brand-title">Student Sign Up</h1>
                  </IonText>
                  <IonText>
                    <p className="brand-subtitle">
                      Quick registration for students
                    </p>
                  </IonText>
                </div>

                <IonCard className="register-card">
                  <IonCardContent>
                    <form onSubmit={handleRegister}>
                      {/* Username */}
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
                            placeholder="Choose a username"
                            value={formData.username}
                            onIonInput={(e) =>
                              handleInputChange("username", e.detail.value!)
                            }
                            className="custom-input"
                            required
                          />
                        </IonItem>
                      </div>

                      {/* Password */}
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
                            placeholder="Create a password"
                            value={formData.password}
                            onIonInput={(e) =>
                              handleInputChange("password", e.detail.value!)
                            }
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
                        {passwordErrors.length > 0 && (
                          <div className="password-requirements">
                            <IonText>
                              <p className="requirements-title">
                                Password must contain:
                              </p>
                              <ul className="requirements-list">
                                {passwordErrors.map((error, index) => (
                                  <li key={index} className="requirement-error">
                                    {error}
                                  </li>
                                ))}
                              </ul>
                            </IonText>
                          </div>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div className="input-section">
                        <IonText>
                          <h3 className="input-label">Confirm Password</h3>
                        </IonText>
                        <IonItem className="input-item" lines="none">
                          <IonIcon
                            icon={key}
                            slot="start"
                            className="input-icon"
                          />
                          <IonInput
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onIonInput={(e) =>
                              handleInputChange(
                                "confirmPassword",
                                e.detail.value!,
                              )
                            }
                            className="custom-input"
                            required
                          />
                          <IonButton
                            fill="clear"
                            slot="end"
                            className="password-toggle"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            <IonIcon
                              icon={showConfirmPassword ? eyeOff : eye}
                            />
                          </IonButton>
                        </IonItem>
                        {formData.confirmPassword &&
                          formData.password !== formData.confirmPassword && (
                            <IonText>
                              <p className="password-error">
                                Passwords do not match
                              </p>
                            </IonText>
                          )}
                      </div>

                      {/* Institution */}
                      <div className="input-section">
                        <IonText>
                          <h3 className="input-label">Institution</h3>
                        </IonText>
                        <IonItem className="input-item" lines="none">
                          <IonIcon
                            icon={business}
                            slot="start"
                            className="input-icon"
                          />
                          <IonInput
                            type="text"
                            placeholder="Enter institution name"
                            value={formData.institution}
                            onIonInput={(e) =>
                              handleInputChange("institution", e.detail.value!)
                            }
                            className="custom-input"
                            required
                          />
                        </IonItem>
                      </div>

                      {/* Section ID */}
                      <div className="input-section">
                        <IonText>
                          <h3 className="input-label">Section ID</h3>
                        </IonText>
                        <IonItem className="input-item" lines="none">
                          <IonInput
                            type="number"
                            placeholder="Enter section ID"
                            value={formData.sectionId}
                            onIonInput={(e) =>
                              handleInputChange(
                                "sectionId",
                                String(e.detail.value),
                              )
                            }
                            className="custom-input"
                            required
                          />
                        </IonItem>
                      </div>
                    </form>
                  </IonCardContent>
                </IonCard>

                {/* Buttons */}
                <div className="buttons-container">
                  <IonButton
                    type="submit"
                    expand="block"
                    className="register-button"
                    onClick={handleRegister}
                    disabled={isLoading}
                  >
                    {isLoading ? "CREATING ACCOUNT..." : "SIGN UP"}
                  </IonButton>

                  <IonButton
                    expand="block"
                    fill="outline"
                    className="back-login-button"
                    onClick={handleBackToLogin}
                    disabled={isLoading}
                  >
                    Back to Login
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

export default RegisterStudent;
