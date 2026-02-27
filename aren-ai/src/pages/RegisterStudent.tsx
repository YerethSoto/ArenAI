import React, { useState, useRef, useEffect } from "react";
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
import {
  person,
  key,
  business,
  arrowBack,
  eye,
  eyeOff,
  school,
  chevronDown,
} from "ionicons/icons";
import "./RegisterStudent.css";
import { useHistory } from "react-router-dom";
import { getApiUrl } from "../config/api";
import { INSTITUTIONS, GRADES, SECTIONS } from "../config/institutions";

const RegisterStudent: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    institution: "",
  });
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  // Autocomplete state
  const [institutionQuery, setInstitutionQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<
    number | null
  >(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  const history = useHistory();

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

  // Validate password
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
    return errors;
  };

  const handleInputChange = (field: string, value: string) => {
    const newFormData = {
      ...formData,
      [field]: value,
    };

    setFormData(newFormData);

    if (field === "password") {
      const errors = validatePassword(value);
      setPasswordErrors(errors);
    }
  };

  const handleInstitutionInput = (value: string) => {
    setInstitutionQuery(value);
    setShowSuggestions(value.trim().length > 0);
    // If user types after selecting, clear the selection
    if (formData.institution && value !== formData.institution) {
      setFormData((prev) => ({ ...prev, institution: "" }));
      setSelectedInstitutionId(null);
    }
  };

  const handleInstitutionSelect = (name: string, id: number) => {
    setFormData((prev) => ({ ...prev, institution: name }));
    setInstitutionQuery(name);
    setSelectedInstitutionId(id);
    setShowSuggestions(false);
  };

  const handleRegister = async (e?: React.FormEvent) => {
    e?.preventDefault();

    // Validate required fields
    if (!formData.username.trim() || !formData.password) {
      alert("Please fill all fields");
      return;
    }

    if (!formData.institution.trim()) {
      alert("Please select an institution");
      return;
    }

    if (!selectedGrade || !selectedSection) {
      alert("Please select your grade and section");
      return;
    }

    // Validate password
    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      alert("Please fix password requirements:\n" + passwordErrors.join("\n"));
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setIsLoading(true);

    const sectionNumber = `${selectedGrade}-${selectedSection}`;

    try {
      const resp = await fetch(getApiUrl("/api/auth/register-student"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password,
          institution: formData.institution.trim(),
          sectionNumber: sectionNumber,
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
          localStorage.setItem("userRole", "student");
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

                      {/* Institution Autocomplete */}
                      <div className="input-section">
                        <IonText>
                          <h3 className="input-label">
                            Institution
                            {formData.institution && (
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
                              placeholder="Type to search institutions..."
                              value={institutionQuery}
                              onIonInput={(e) =>
                                handleInstitutionInput(e.detail.value!)
                              }
                              onIonFocus={() => {
                                if (institutionQuery.trim())
                                  setShowSuggestions(true);
                              }}
                              className="custom-input"
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
                                      handleInstitutionSelect(
                                        inst.name,
                                        inst.id,
                                      )
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
                      </div>

                      {/* Grade & Section */}
                      <div className="input-section">
                        <IonText>
                          <h3 className="input-label">Grade & Section</h3>
                        </IonText>
                        <div className="grade-section-row">
                          {/* Grade Select */}
                          <div className="select-wrapper">
                            <label className="select-label">Grade</label>
                            <div className="custom-select">
                              <select
                                value={selectedGrade}
                                onChange={(e) =>
                                  setSelectedGrade(e.target.value)
                                }
                                className="grade-select"
                              >
                                <option value="" disabled>
                                  —
                                </option>
                                {GRADES.map((g) => (
                                  <option key={g} value={g}>
                                    {g}
                                  </option>
                                ))}
                              </select>
                              <IonIcon
                                icon={chevronDown}
                                className="select-arrow"
                              />
                            </div>
                          </div>

                          <span className="grade-section-divider">–</span>

                          {/* Section Select */}
                          <div className="select-wrapper">
                            <label className="select-label">Section</label>
                            <div className="custom-select">
                              <select
                                value={selectedSection}
                                onChange={(e) =>
                                  setSelectedSection(e.target.value)
                                }
                                className="section-select"
                              >
                                <option value="" disabled>
                                  —
                                </option>
                                {SECTIONS.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                              <IonIcon
                                icon={chevronDown}
                                className="select-arrow"
                              />
                            </div>
                          </div>
                        </div>
                        {selectedGrade && selectedSection && (
                          <p className="section-preview">
                            Section: {selectedGrade}-{selectedSection}
                          </p>
                        )}
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
