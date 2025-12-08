import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import {
  IonPage,
  IonContent,
  IonIcon,
  IonButton,
  IonInput,
  IonSegment,
  IonSegmentButton,
  IonLabel,
} from "@ionic/react";
import {
  trophyOutline,
  homeOutline,
  chatbubbleEllipsesOutline,
  settingsOutline,
  flash,
  globe,
  school,
  person,
  searchOutline,
} from "ionicons/icons";
import { socketService } from "../services/socket";
import { useTranslation } from "react-i18next";
import { useAvatar } from "../context/AvatarContext";
import StudentHeader from "../components/StudentHeader";
import "./BattleLobby.css";
// We rely on Main_Student.css / global variables for theming
import "../pages/Main_Student.css";

const BattleLobby: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { currentAvatar } = useAvatar();

  // State
  const [battleType, setBattleType] = useState<"quick" | "friend">("quick");
  const [quickScope, setQuickScope] = useState<"global" | "school" | "section">(
    "global"
  );
  const [friendName, setFriendName] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("Math");

  // Mock Data
  const stats = {
    winRate: 86,
    streak: 5,
    happiness: 0.8,
  };

  // Socket
  useEffect(() => {
    console.log("[BattleLobby] Connecting to socket...");
    socketService.connect();
    const socket = socketService.socket;

    const handleMatchFound = (data: { roomId: string; opponent: any }) => {
      console.log("[BattleLobby] Match found! Navigating...", data);
      setIsSearching(false);

      // Use standard history push with state
      history.push({
        pathname: "/battleminigame",
        state: {
          roomId: data.roomId,
          opponent: data.opponent,
          myAvatar: currentAvatar,
        },
      });
    };

    if (socket) {
      if (socket.connected) {
        console.log("[BattleLobby] Socket already connected:", socket.id);
      }
      socket.on("connect", () =>
        console.log("[BattleLobby] Socket connected:", socket.id)
      );
      socket.on("match_found", handleMatchFound);
    }

    return () => {
      if (socket) {
        socket.off("match_found", handleMatchFound);
      }
    };
  }, [history, currentAvatar]);

  const handleStartBattle = () => {
    if (isSearching) return;

    console.log("[BattleLobby] Joining queue as:", {
      name: "Student",
      avatar: currentAvatar,
    });
    setIsSearching(true);

    // Simplest payload matching backend expectation
    socketService.socket?.emit("join_queue", {
      name: "Student",
      avatar: currentAvatar,
    });
  };

  const handleCancelSearch = () => {
    console.log("[BattleLobby] Cancelling search (UI only)");
    setIsSearching(false);
  };

  const handleNavigation = (path: string) => {
    history.replace(path);
  };

  return (
    <IonPage className="battle-lobby-page">
      <StudentHeader
        pageTitle="battle.title"
        showSubject={true}
        selectedSubject={selectedSubject}
        onSubjectChange={setSelectedSubject}
      />

      <IonContent className="battle-content">
        <div className="battle-container">
          {/* Top Section: Avatar Card */}
          <div className="lobby-card avatar-section-card">
            {/* Left Col: Speech Bubble & Stats */}
            <div className="avatar-info-col">
              <div className="message-container">
                <div className="name-tag">Aren</div>
                {/* Speech bubble points to right/mascot */}
                <div className="speech-bubble">
                  {isSearching
                    ? t("battleLobby.lookingStatus")
                    : t("battleLobby.readyStatus")}
                </div>
              </div>

              <div className="stats-display">
                <div className="stat-unit">
                  <span className="stat-label">WIN RATE</span>
                  <span className="stat-val">{stats.winRate}%</span>
                </div>
                <div className="stat-unit">
                  <span className="stat-label">STREAK</span>
                  <span className="stat-val">{stats.streak}</span>
                </div>
              </div>
            </div>

            {/* Right Col: Mascot */}
            <div className="avatar-visual-col">
              <img
                src="/assets/battle_sprite_front_capybara.png"
                alt="Mascot"
                className="mascot-img-lg"
              />
              <div className="happiness-bar-container">
                <div
                  className="happiness-fill"
                  style={{ width: `${stats.happiness * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Middle Section: Opponent Card */}
          <div className="lobby-card opponent-section-card">
            <div className="section-header-pill">
              {t("battleLobby.opponent")}
            </div>

            <div className="battle-type-toggle">
              <button
                className={`toggle-opt ${
                  battleType === "quick" ? "selected" : ""
                }`}
                onClick={() => setBattleType("quick")}
              >
                {t("battleLobby.quickBattleBtn")}
              </button>
              <span className="toggle-sep">/</span>
              <button
                className={`toggle-opt ${
                  battleType === "friend" ? "selected" : ""
                }`}
                onClick={() => setBattleType("friend")}
              >
                {t("battleLobby.friendBattleBtn")}
              </button>
            </div>

            <div className="battle-options-area">
              {battleType === "quick" && (
                <div className="quick-scope-selector fade-in">
                  <IonSegment
                    value={quickScope}
                    onIonChange={(e) => setQuickScope(e.detail.value as any)}
                    mode="ios"
                    className="custom-segment"
                  >
                    <IonSegmentButton value="global">
                      <div className="seg-content">
                        <IonIcon icon={globe} /> All
                      </div>
                    </IonSegmentButton>
                    <IonSegmentButton value="school">
                      <div className="seg-content">
                        <IonIcon icon={school} /> School
                      </div>
                    </IonSegmentButton>
                    <IonSegmentButton value="section">
                      <div className="seg-content">
                        <IonIcon icon={searchOutline} /> Class
                      </div>
                    </IonSegmentButton>
                  </IonSegment>
                </div>
              )}

              {battleType === "friend" && (
                <div className="friend-input-area fade-in">
                  <IonInput
                    placeholder="Enter friend's name"
                    value={friendName}
                    onIonChange={(e) => setFriendName(e.detail.value!)}
                    className="friend-input"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Reserved Status Bar Area */}
          <div className="status-bar-reserved">
            {isSearching && (
              <div className="active-status fade-in">
                <div className="spinner-mini"></div>
                <span className="status-text">Finding match...</span>
                <span className="cancel-link" onClick={handleCancelSearch}>
                  Cancel
                </span>
              </div>
            )}
          </div>
        </div>
      </IonContent>

      {/* Footer / Bottom Nav */}
      <div className="ms-bottom-nav">
        <div
          className="ms-nav-btn"
          onClick={() => handleNavigation("/page/student")}
        >
          <IonIcon icon={homeOutline} />
        </div>
        <div className="ms-nav-btn">
          <IonIcon icon={trophyOutline} />
        </div>

        {/* Start Button in Center */}
        <div
          className={`ms-mascot-container battle-start-btn ${
            isSearching ? "disabled" : ""
          }`}
          onClick={handleStartBattle}
        >
          <IonIcon icon={flash} className="swords-icon" />
        </div>

        <div className="ms-nav-btn">
          <IonIcon icon={chatbubbleEllipsesOutline} />
        </div>
        <div className="ms-nav-btn">
          <IonIcon icon={settingsOutline} />
        </div>
      </div>
    </IonPage>
  );
};

export default BattleLobby;
