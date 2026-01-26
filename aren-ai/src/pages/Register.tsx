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
  IonSearchbar,
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
  chevronDown,
  chevronUp,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import "./Register.css";
import { getApiUrl } from "../config/api";

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
  const [showMEPSelector, setShowMEPSelector] = useState(false);
  const [isMEPSelectorOpen, setIsMEPSelectorOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const history = useHistory();

  // Lista de instituciones públicas del MEP (ejemplo)
  const mepInstitutions = [
    "Liceo de Costa Rica",
    "Colegio Superior de Señoritas",
    "Liceo de Heredia",
    "Liceo de San José",
    "Colegio de San Luis Gonzaga",
    "Liceo de Cartago",
    "Colegio de Alajuela",
    "Liceo de Puntarenas",
    "Colegio de Limón",
    "Liceo de Guanacaste",
    "Colegio Técnico Profesional de Purral",
    "Liceo Experimental Bilingüe de Grecia",
    "Colegio Científico de Costa Rica",
    "Liceo Napoleón Quesada Salazar",
    "Colegio de Santa Cruz",
    "Liceo de Aserrí",
    "Colegio de San Ramón",
    "Liceo de San Carlos",
    "Colegio de Pérez Zeledón",
    "Liceo de Turrialba",
    "Colegio Nocturno de San José",
    "Liceo de Osa",
    "Colegio Técnico Profesional de Atenas",
    "Liceo de Sarapiquí",
    "Colegio de Upala",
    "Liceo de Los Santos",
    "Colegio de Tilarán",
    "Liceo de Bagaces",
    "Colegio de Cañas",
    "Liceo de Nicoya",
    "Colegio de La Cruz",
    "Liceo de Hojancha",
    "Colegio de Nandayure",
    "Liceo de Carrillo",
    "Colegio de Santa Bárbara",
    "Liceo de San Pablo",
    "Colegio de Barva",
    "Liceo de Santo Domingo",
    "Colegio de San Rafael",
    "Liceo de Belén",
    "Colegio de Flores",
    "Liceo de San Isidro",
    "Colegio de Curridabat",
    "Liceo de Goicoechea",
    "Colegio de Montes de Oca",
    "Liceo de Tibás",
    "Colegio de Moravia",
    "Liceo de Coronado",
    "Colegio de Acosta",
    "Liceo de Tarrazú",
    "Colegio de Dota",
    "Liceo de León Cortés",
    "Colegio de Desamparados",
    "Liceo de Alajuelita",
    "Colegio de Escazú",
    "Liceo de Santa Ana",
    "Colegio de Mora",
    "Liceo de Puriscal",
    "Colegio de Turrubares",
  ];

  // Mapeo de dominios a instituciones
  const domainToInstitution: { [key: string]: string } = {
    "mep.go.cr": "Ministerio de Educación Pública (MEP)",
    "stpaul.com": "Colegio San Paul",
    "ulacit.ed.cr": "ULACIT",
    "ucr.ac.cr": "Universidad de Costa Rica",
    "itcr.ac.cr": "Tecnológico de Costa Rica",
    "una.ac.cr": "Universidad Nacional",
    "uned.ac.cr": "Universidad Estatal a Distancia",
    "ulatina.ac.cr": "Universidad Latina",
    "fidelitas.ac.cr": "Universidad Fidélitas",
    "uam.ac.cr": "Universidad Americana",
  };

  // Filtrar instituciones basado en la búsqueda
  const filteredInstitutions = mepInstitutions.filter((institution) =>
    institution.toLowerCase().includes(searchText.toLowerCase()),
  );

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

    // Validar contraseña cuando cambia
    if (field === "password") {
      const errors = validatePassword(value);
      setPasswordErrors(errors);
    }

    // Auto-detectar institución cuando el email cambia
    if (field === "email") {
      const domain = value.split("@")[1];
      if (domain && domainToInstitution[domain]) {
        if (domain === "mep.go.cr") {
          // Para MEP, mostrar el selector pero no auto-completar
          setShowMEPSelector(true);
          setIsInstitutionLocked(false);
          if (!formData.institution) {
            setFormData((prev) => ({
              ...prev,
              institution: "",
            }));
          }
        } else {
          // Para otros dominios, auto-completar y bloquear
          setFormData((prev) => ({
            ...prev,
            institution: domainToInstitution[domain],
          }));
          setIsInstitutionLocked(true);
          setShowMEPSelector(false);
          setIsMEPSelectorOpen(false);
        }
      } else if (domain) {
        // Si el dominio no está en la lista, desbloquear el campo
        setIsInstitutionLocked(false);
        setShowMEPSelector(false);
        setIsMEPSelectorOpen(false);
        if (!formData.institution) {
          setFormData((prev) => ({
            ...prev,
            institution: "",
          }));
        }
      } else {
        // Si no hay dominio, desbloquear y limpiar
        setIsInstitutionLocked(false);
        setShowMEPSelector(false);
        setIsMEPSelectorOpen(false);
        setFormData((prev) => ({
          ...prev,
          institution: "",
        }));
      }
    }
  };

  const handleInstitutionSelect = (institution: string) => {
    setFormData((prev) => ({
      ...prev,
      institution: institution,
    }));
    setIsMEPSelectorOpen(false);
    setSearchText("");
  };

  const toggleMEPSelector = () => {
    if (showMEPSelector) {
      setIsMEPSelectorOpen(!isMEPSelectorOpen);
      setSearchText("");
    }
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
        } catch (_) {}
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

                      {/* Institution */}
                      <div className="input-section">
                        <IonText>
                          <h3 className="input-label">
                            Institution
                            {isInstitutionLocked && (
                              <span className="auto-filled-badge">
                                Auto-filled
                              </span>
                            )}
                            {showMEPSelector && (
                              <span className="mep-selector-badge">
                                Select from MEP
                              </span>
                            )}
                          </h3>
                        </IonText>

                        {showMEPSelector ? (
                          // Selector para MEP con campo clickeable
                          <div className="mep-selector-container">
                            <IonItem
                              className="institution-selector-item"
                              button
                              detail={false}
                              onClick={toggleMEPSelector}
                            >
                              <IonIcon
                                icon={business}
                                slot="start"
                                className="input-icon"
                              />
                              <IonText>
                                <p className="institution-display">
                                  {formData.institution ||
                                    "Select your institution..."}
                                </p>
                              </IonText>
                              <IonIcon
                                icon={
                                  isMEPSelectorOpen ? chevronUp : chevronDown
                                }
                                slot="end"
                                className="selector-arrow"
                              />
                            </IonItem>

                            {isMEPSelectorOpen && (
                              <div className="mep-selector-dropdown">
                                <IonSearchbar
                                  value={searchText}
                                  onIonInput={(e) =>
                                    setSearchText(e.detail.value!)
                                  }
                                  placeholder="Search MEP institutions..."
                                  className="institution-searchbar"
                                />

                                <div className="institution-list">
                                  {filteredInstitutions
                                    .slice(0, 10)
                                    .map((institution, index) => (
                                      <IonItem
                                        key={index}
                                        button
                                        detail={false}
                                        className="institution-item"
                                        onClick={() =>
                                          handleInstitutionSelect(institution)
                                        }
                                      >
                                        <IonIcon
                                          icon={school}
                                          slot="start"
                                          className="institution-icon"
                                        />
                                        <IonText>
                                          <p className="institution-name">
                                            {institution}
                                          </p>
                                        </IonText>
                                      </IonItem>
                                    ))}
                                  {filteredInstitutions.length === 0 && (
                                    <IonText>
                                      <p className="no-results">
                                        No institutions found
                                      </p>
                                    </IonText>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          // Campo normal para otras instituciones
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
                                  : "Enter your institution name"
                              }
                              value={formData.institution}
                              onIonInput={(e) =>
                                !isInstitutionLocked &&
                                handleInputChange(
                                  "institution",
                                  e.detail.value!,
                                )
                              }
                              className="custom-input"
                              required
                              readonly={isInstitutionLocked}
                            />
                          </IonItem>
                        )}

                        {isInstitutionLocked && (
                          <IonText>
                            <p className="institution-hint">
                              Institution automatically detected from email
                              domain
                            </p>
                          </IonText>
                        )}
                        {showMEPSelector && !formData.institution && (
                          <IonText>
                            <p className="institution-hint">
                              Click to select your specific institution from the
                              MEP list
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

export default Register;
