import React, { useState } from "react";
import {
  IonPage,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonButton,
  IonInput,
  IonLabel,
  IonText,
  IonIcon,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { arrowForward } from "ionicons/icons";
import { getApiUrl } from "../config/api";
import "./AvatarSelection.css";

const AVATAR_OPTIONS = [
  {
    id: "capybara",
    name: "Capybara",
    image: "/assets/profile_picture_capybara_eyes_open.png",
    description: "Chill and friendly. Great for steady learners.",
  },
  {
    id: "sloth",
    name: "Sloth",
    image: "/assets/profile_picture_sloth_eyes_open.png",
    description: "Slow and steady wins the race. Perfect for deep thinkers.",
  },
];

const AvatarSelection: React.FC = () => {
  const history = useHistory();
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    AVATAR_OPTIONS[0].id,
  );
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!nickname.trim()) {
      alert("Please enter a nickname for your companion.");
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem("authToken");

    try {
      // 1. Create Avatar
      const avatarResp = await fetch(getApiUrl("/api/users/avatars"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          avatarType: selectedAvatar,
          nickname: nickname.trim(),
          isCurrent: true,
        }),
      });

      if (!avatarResp.ok) throw new Error("Failed to create avatar");

      // 2. Mark First Login as Done
      const loginResp = await fetch(
        getApiUrl("/api/users/profile/first-login"),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ firstLogin: false }),
        },
      );

      if (!loginResp.ok) throw new Error("Failed to update login status");

      // Update local storage if needed (optional)
      const userDataStr = localStorage.getItem("userData");
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        userData.first_login = false; // Update local state
        localStorage.setItem("userData", JSON.stringify(userData));
      }

      // 3. Redirect to Dashboard
      history.replace("/page/student");
    } catch (error) {
      console.error("Avatar selection error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="avatar-selection-page">
        <div className="avatar-selection-container">
          <IonText className="page-header">
            <h1>Choose Your AI Companion</h1>
            <p>Select a friend to join you on your learning journey.</p>
          </IonText>

          <IonGrid>
            <IonRow className="ion-justify-content-center">
              {AVATAR_OPTIONS.map((avatar) => (
                <IonCol size="12" size-md="5" key={avatar.id}>
                  <IonCard
                    className={`avatar-card ${selectedAvatar === avatar.id ? "selected" : ""}`}
                    onClick={() => setSelectedAvatar(avatar.id)}
                  >
                    <div className="avatar-image-wrapper">
                      <img
                        src={avatar.image}
                        alt={avatar.name}
                        draggable={false}
                      />
                    </div>
                    <div className="avatar-info">
                      <h2>{avatar.name}</h2>
                      <p>{avatar.description}</p>
                    </div>
                  </IonCard>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>

          <div className="nickname-section">
            <IonLabel>Give your companion a name:</IonLabel>
            <IonInput
              value={nickname}
              placeholder="e.g. Professor Cappy"
              onIonInput={(e) => setNickname(e.detail.value!)}
              className="nickname-input"
            />
          </div>

          <IonButton
            expand="block"
            className="confirm-button"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Starting..." : "Start Adventure"}
            {!isLoading && <IonIcon slot="end" icon={arrowForward} />}
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AvatarSelection;
