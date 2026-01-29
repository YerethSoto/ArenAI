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
import { useIonViewWillEnter } from "@ionic/react";
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
import { studentService } from "../services/studentService";
import { StudentStats } from "../types/student";
import { battleStatsService } from "../services/battleStats";
import PageTransition from "../components/PageTransition";

const BattleLobby: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { currentAvatar } = useAvatar();

  // State
  const [battleType, setBattleType] = useState<"quick" | "friend">("quick");
  const [quickScope, setQuickScope] = useState<"global" | "school" | "section">(
    "global",
  );
  const [friendName, setFriendName] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("Math");
  const [openGames, setOpenGames] = useState<any[]>([]);

  // Stats State (use real battle stats from localStorage)
  const [winRate, setWinRate] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Load battle stats
    const loadStats = () => {
      const wr = battleStatsService.getWinRate();
      const st = battleStatsService.getStats().streak;
      setWinRate(wr);
      setStreak(st);
    };
    loadStats();
  }, []);

  // Refresh stats when view enters (after returning from battle)
  useIonViewWillEnter(() => {
    const wr = battleStatsService.getWinRate();
    const st = battleStatsService.getStats().streak;
    setWinRate(wr);
    setStreak(st);
  });

  // Socket - Connect Early Like ChatMenu
  useIonViewWillEnter(() => {
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
        console.log("[BattleLobby] Socket connected:", socket.id),
      );
      socket.on("match_found", handleMatchFound);

      // List Listeners
      socket.on("games_list", (games) => {
        console.log("Received games list:", games);
        setOpenGames(games);
      });
      socket.on("games_list_update", (games) => {
        console.log("Updated games list:", games);
        setOpenGames(games);
      });
      socket.on("game_created", (data) => {
        console.log("Game created, waiting...", data);
        // We stay in lobby but show "Waiting" status
      });

      // Initial Fetch
      socket.emit("get_games");
    }

    return () => {
      if (socket) {
        socket.off("match_found", handleMatchFound);
        socket.off("games_list");
        socket.off("games_list_update");
        socket.off("game_created");
      }
    };
  });

  const handleStartBattle = () => {
    if (isSearching) return;

    const storedUserData = JSON.parse(localStorage.getItem("userData") || "{}");
    const realName = storedUserData.name || "Student";

    console.log("[BattleLobby] Hosting game as:", {
      name: realName,
      avatar: currentAvatar,
    });
    setIsSearching(true);

    // Host Game
    socketService.socket?.emit("create_game", {
      name: realName,
      avatar: currentAvatar,
    });
  };

  const handleJoinGame = (roomId: string) => {
    const storedUserData = JSON.parse(localStorage.getItem("userData") || "{}");
    const realName = storedUserData.name || "Student";

    console.log("[BattleLobby] Joining game:", roomId);
    socketService.socket?.emit("join_game", {
      roomId,
      name: realName,
      avatar: currentAvatar,
    });
  };

  const handleCancelSearch = () => {
    console.log("[BattleLobby] Cancelling search");

    // Find and cancel our hosted game
    const myGame = openGames.find((g) => {
      const storedUserData = JSON.parse(
        localStorage.getItem("userData") || "{}",
      );
      return g.hostName === (storedUserData.name || "Student");
    });

    if (myGame) {
      console.log("[BattleLobby] Removing game from lobby:", myGame.roomId);
      socketService.socket?.emit("cancel_game", { roomId: myGame.roomId });
    }

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
        <PageTransition variant="fade">
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
                    <span className="stat-label">
                      {t("battleLobby.winRate")}
                    </span>
                    <span className="stat-val">{winRate}%</span>
                  </div>
                  <div className="stat-unit">
                    <span className="stat-label">
                      {t("battleLobby.streak")}
                    </span>
                    <span className="stat-val">{streak}</span>
                  </div>
                </div>
              </div>

              {/* Right Col: Mascot */}
              <div className="avatar-visual-col">
                <img
                  src={`/assets/${currentAvatar}-front.png`}
                  alt="Mascot"
                  className="mascot-img-lg"
                />
              </div>
            </div>

            {/* Status Bar - Between Cards */}
            <div className="status-bar-reserved">
              {isSearching && (
                <div className="active-status fade-in">
                  <div className="spinner-mini"></div>
                  <span className="status-text">
                    {t("battleLobby.findingMatch")}
                  </span>
                  <span className="cancel-link" onClick={handleCancelSearch}>
                    {t("battleLobby.cancel")}
                  </span>
                </div>
              )}
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
                  {t("battleLobby.quickBattle")}
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
                          <IonIcon icon={globe} /> {t("battleLobby.all")}
                        </div>
                      </IonSegmentButton>
                      <IonSegmentButton value="school">
                        <div className="seg-content">
                          <IonIcon icon={school} /> {t("battleLobby.school")}
                        </div>
                      </IonSegmentButton>
                      <IonSegmentButton value="section">
                        <div className="seg-content">
                          <IonIcon icon={searchOutline} />{" "}
                          {t("battleLobby.class")}
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

              {/* Lobby List Table - INSIDE Card */}
              <div className="lobby-list-container">
                {isSearching ? (
                  <div className="lobby-waiting-state">
                    <div className="spinner-mini"></div>
                    <span>Waiting for opponent...</span>
                  </div>
                ) : (
                  <div className="lobby-table-wrapper">
                    <div className="lobby-table-header">
                      <div className="col-host">
                        {t("battleLobby.lobbyHost")}
                      </div>
                      <div className="col-subject">
                        {t("battleLobby.lobbySubject")}
                      </div>
                      <div className="col-school">
                        {t("battleLobby.lobbySchool")}
                      </div>
                      <div className="col-section">
                        {t("battleLobby.lobbySection")}
                      </div>
                    </div>
                    <div className="lobby-table-body">
                      {openGames.length === 0 ? (
                        <div className="lobby-empty-state">
                          <span>{t("battleLobby.noGamesAvailable")}</span>
                        </div>
                      ) : (
                        openGames
                          .filter((g) => {
                            if (quickScope === "global") return true;
                            if (quickScope === "school")
                              return g.schoolId === "school_123";
                            return g.sectionId === "10-1";
                          })
                          .filter((g) => g.roomId) // Filter out invalid games
                          .map((game) => (
                            <div
                              key={game.roomId}
                              className="lobby-table-row"
                              onClick={() => handleJoinGame(game.roomId)}
                            >
                              <div className="col-host">
                                <img
                                  src={`https://ui-avatars.com/api/?name=${game.hostName}&background=random`}
                                  alt="host"
                                  className="host-avatar-mini"
                                />
                                <span>{game.hostName}</span>
                              </div>
                              <div className="col-subject">
                                {selectedSubject}
                              </div>
                              <div className="col-school">
                                {game.schoolId || "ArenAI School"}
                              </div>
                              <div className="col-section">
                                {game.sectionId || "10-1"}
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </PageTransition>
      </IonContent>

      {/* Footer / Bottom Nav */}
      <div className="student-bottom-nav">
        <div
          className="student-nav-btn"
          onClick={() => handleNavigation("/page/student")}
        >
          <IonIcon icon={homeOutline} />
        </div>
        <div className="student-nav-btn">
          <IonIcon icon={trophyOutline} />
        </div>

        {/* Start Button in Center */}
        <div
          className={`student-mascot-container battle-start-btn ${
            isSearching ? "disabled" : ""
          }`}
          onClick={handleStartBattle}
        >
          <IonIcon icon={flash} className="swords-icon" />
        </div>

        <div className="student-nav-btn">
          <IonIcon icon={chatbubbleEllipsesOutline} />
        </div>
        <div className="student-nav-btn">
          <IonIcon icon={settingsOutline} />
        </div>
      </div>
    </IonPage>
  );
};

export default BattleLobby;
