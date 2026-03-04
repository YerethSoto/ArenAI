import React, { useState, useEffect, useRef } from "react";
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
import {
  person,
  mail,
  key,
  eye,
  eyeOff,
  arrowBack,
  call,
  business,
  school,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import "./Register.css";
import { getApiUrl } from "../config/api";
import { INSTITUTIONS, DOMAIN_TO_INSTITUTION } from "../config/institutions";

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    institution: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInstitutionLocked, setIsInstitutionLocked] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const history = useHistory();

  // Autocomplete state
  const [institutionQuery, setInstitutionQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  // Filter institutions based on what user types
  const filteredInstitutions = institutionQuery.trim()
    ? INSTITUTIONS.filter((inst) =>
      inst.name.toLowerCase().includes(institutionQuery.toLowerCase()),
    ).slice(0, 8)
    : [];

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputContainerRef.current &&
        !inputContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Validar contraseña
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

    // Validate password
    if (field === "password") {
      const errors = validatePassword(value);
      setPasswordErrors(errors);
    }

    // Auto-detect institution from email domain
    if (field === "email") {
      const domain = value.split("@")[1];
      if (domain && DOMAIN_TO_INSTITUTION[domain]) {
        const detectedInstitution = DOMAIN_TO_INSTITUTION[domain];
        setFormData((prev) => ({
          ...prev,
          institution: detectedInstitution,
        }));
        setInstitutionQuery(detectedInstitution);
        setIsInstitutionLocked(true);
        setShowSuggestions(false);
      } else if (domain) {
        // Unknown domain — unlock institution field
        setIsInstitutionLocked(false);
      } else {
        // No domain yet — unlock and clear
        setIsInstitutionLocked(false);
        setFormData((prev) => ({
          ...prev,
          institution: "",
        }));
        setInstitutionQuery("");
      }
    }
  };

  const handleInstitutionInput = (value: string) => {
    setInstitutionQuery(value);
    setShowSuggestions(value.trim().length > 0);
    // If user types after selecting, clear the selection
    if (formData.institution && value !== formData.institution) {
      setFormData((prev) => ({ ...prev, institution: "" }));
    }
  };

  const handleInstitutionSelect = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      institution: name,
    }));
    setInstitutionQuery(name);
    setShowSuggestions(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validar contraseña
    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      alert("Please fix password requirements:\n" + passwordErrors.join("\n"));
      setIsLoading(false);
      return;
    }

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validar institución para MEP
    if (formData.email.endsWith("@mep.go.cr") && !formData.institution) {
      alert("Please select your specific institution from the MEP list");
      setIsLoading(false);
      return;
    }

    // Validar institución para otros casos
    if (!formData.institution.trim()) {
      alert("Please enter your institution");
      setIsLoading(false);
      return;
    }

    // Call backend registration endpoint (every new registrant becomes a professor)
    try {
      const resp = await fetch(getApiUrl("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phone,
          institution: formData.institution,
          password: formData.password,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => null);
        alert(err?.message || "Registration failed");
        setIsLoading(false);
        return;
      }

      const data = await resp.json();
      // Save token
      if (data.token) {
        try {
          localStorage.setItem("authToken", data.token);
        } catch (_) { }
      }

      setIsLoading(false);
      // Redirect professors to professor dashboard
      history.replace("/page/professor");
    } catch (error) {
      console.error("Register error", error);
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
                    <h1 className="brand-title">Create Account</h1>
                  </IonText>
                  <IonText>
                    <p className="brand-subtitle">Join the ArenAI community</p>
                  </IonText>
                </div>

                {/* Card de registro */}
                <IonCard className="register-card">
                  <IonCardContent>
                    <form onSubmit={handleRegister}>
                      {/* First Name */}
                      <div className="input-section">
                        <IonText>
                          <h3 className="input-label">First Name</h3>
                        </IonText>
                        <IonItem className="input-item" lines="none">
                          <IonIcon
                            icon={person}
                            slot="start"
                            className="input-icon"
                          />
                          <IonInput
                            type="text"
                            placeholder="Enter your first name"
                            value={formData.firstName}
                            onIonInput={(e) =>
                              handleInputChange("firstName", e.detail.value!)
                            }
                            className="custom-input"
                            required
                          />
                        </IonItem>
                      </div>

                      {/* Last Name */}
                      <div className="input-section">
                        <IonText>
                          <h3 className="input-label">Last Name</h3>
                        </IonText>
                        <IonItem className="input-item" lines="none">
                          <IonIcon
                            icon={person}
                            slot="start"
                            className="input-icon"
                          />
                          <IonInput
                            type="text"
                            placeholder="Enter your last name"
                            value={formData.lastName}
                            onIonInput={(e) =>
                              handleInputChange("lastName", e.detail.value!)
                            }
                            className="custom-input"
                            required
                          />
                        </IonItem>
                      </div>

                      {/* Email */}
                      <div className="input-section">
                        <IonText>
                          <h3 className="input-label">Email</h3>
                        </IonText>
                        <IonItem className="input-item" lines="none">
                          <IonIcon
                            icon={mail}
                            slot="start"
                            className="input-icon"
                          />
                          <IonInput
                            type="email"
                            placeholder="username@domain.com"
                            value={formData.email}
                            onIonInput={(e) =>
                              handleInputChange("email", e.detail.value!)
                            }
                            className="custom-input"
                            required
                          />
                        </IonItem>
                      </div>

                      {/* Phone Number */}
                      <div className="input-section">
                        <IonText>
                          <h3 className="input-label">Phone Number</h3>
                        </IonText>
                        <IonItem className="input-item" lines="none">
                          <IonIcon
                            icon={call}
                            slot="start"
                            className="input-icon"
                          />
                          <IonInput
                            type="tel"
                            placeholder="Enter your phone number"
                            value={formData.phone}
                            onIonInput={(e) =>
                              handleInputChange("phone", e.detail.value!)
                            }
                            className="custom-input"
                            required
                          />
                        </IonItem>
                      </div>

                      {/* Institution Autocomplete */}
                      <div className="input-section">
                        <IonText>
                          <h3 className="input-label">
                            Institution
                            {isInstitutionLocked && (
                              <span className="auto-filled-badge">
                                Auto-filled
                              </span>
                            )}
                            {!isInstitutionLocked && formData.institution && (
                              <span className="auto-filled-badge">
                                ✓ Selected
                              </span>
                            )}
                          </h3>
                        </IonText>

                        <div
                          className="autocomplete-container"
                          ref={inputContainerRef}
                        >
                          <IonItem className="input-item" lines="none">
                            <IonIcon
                              icon={business}
                              slot="start"
                              className="input-icon"
                            />
                            <IonInput
                              type="text"
                              placeholder={
                                isInstitutionLocked
                                  ? "Institution auto-filled from email"
                                  : "Type to search institutions..."
                              }
                              value={
                                isInstitutionLocked
                                  ? formData.institution
                                  : institutionQuery
                              }
                              onIonInput={(e) =>
                                !isInstitutionLocked &&
                                handleInstitutionInput(e.detail.value!)
                              }
                              onIonFocus={() => {
                                if (
                                  !isInstitutionLocked &&
                                  institutionQuery.trim()
                                )
                                  setShowSuggestions(true);
                              }}
                              className="custom-input"
                              required
                              readonly={isInstitutionLocked}
                            />
                          </IonItem>

                          {showSuggestions &&
                            filteredInstitutions.length > 0 && (
                              <div
                                className="suggestions-dropdown"
                                ref={suggestionsRef}
                              >
                                {filteredInstitutions.map((inst, index) => (
                                  <div
                                    key={index}
                                    className="suggestion-item"
                                    onClick={() =>
                                      handleInstitutionSelect(inst.name)
                                    }
                                  >
                                    <IonIcon
                                      icon={school}
                                      className="suggestion-icon"
                                    />
                                    <span className="suggestion-name">
                                      {inst.name}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                          {showSuggestions &&
                            institutionQuery.trim() &&
                            filteredInstitutions.length === 0 && (
                              <div className="suggestions-dropdown">
                                <div className="suggestion-item no-results">
                                  No institutions found
                                </div>
                              </div>
                            )}
                        </div>

                        {isInstitutionLocked && (
                          <IonText>
                            <p className="institution-hint">
                              Institution automatically detected from email
                              domain
                            </p>
                          </IonText>
                        )}
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
                    </form>
                  </IonCardContent>
                </IonCard>

                {/* Botones */}
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
                    fill="clear"
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

export default Register;
