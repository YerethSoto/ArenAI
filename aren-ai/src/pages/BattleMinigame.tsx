import React, { useState, useEffect, useRef } from "react";
import {
  IonContent,
  IonPage,
  IonIcon,
  IonButton,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonModal,
  IonCard,
  IonCardContent,
  IonMenuButton,
  useIonViewWillLeave,
  useIonViewWillEnter,
} from "@ionic/react";
import { menu, arrowForward, close } from "ionicons/icons";
import { useTranslation } from "react-i18next";
import { useLocation, useHistory } from "react-router-dom";
import { socketService } from "../services/socket";
import StudentMenu from "../components/StudentMenu";
import StudentSidebar from "../components/StudentSidebar";
import StudentHeader from "../components/StudentHeader";
import "./BattleMinigame.css";

interface UserData {
  name: string;
  email: string;
  username: string;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface BattlePlayer {
  id: string; // Changed to string for socket safety
  name: string;
  avatarName: string;
  health: number;
  maxHealth: number;
  score: number;
}

const BattleMinigame: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation<{
    roomId: string;
    opponent: any;
    myAvatar: any;
  }>();
  const history = useHistory();
  const roomId = location.state?.roomId;

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  const getUserData = (): UserData => {
    try {
      const storedData = localStorage.getItem("userData");
      if (storedData) {
        return JSON.parse(storedData);
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }

    return {
      name: "Estudiante",
      email: "Error",
      username: "Error",
    };
  };

  // Questions Data
  const questions: Question[] = [
    {
      id: 1,
      question: "¿Cuál fue el año en que Costa Rica abolió su ejército?",
      options: ["A. 1948", "B. 1821", "C. 1856", "D. 1921"],
      correctAnswer: 0,
    },
    {
      id: 2,
      question:
        "¿Quién fue el presidente que eliminó el ejército costarricense?",
      options: [
        "A. Juan Rafael Mora Porras",
        "B. José Figueres Ferrer",
        "C. Ricardo Jiménez Oreamuno",
        "D. Cleto González Víquez",
      ],
      correctAnswer: 1,
    },
    {
      id: 3,
      question: "¿Contra quiénes luchó Costa Rica en la Batalla de Rivas?",
      options: [
        "A. España",
        "B. Nicaragua",
        "C. Los filibusteros de William Walker",
        "D. México",
      ],
      correctAnswer: 2,
    },
    {
      id: 4,
      question: "¿Cuál es el ave nacional de Costa Rica?",
      options: ["A. Yigüirro", "B. Lapa Roja", "C. Tucán", "D. Quetzal"],
      correctAnswer: 0,
    },
    {
      id: 5,
      question: "¿Cuándo se celebra la independencia de Costa Rica?",
      options: [
        "A. 15 de setiembre",
        "B. 11 de abril",
        "C. 25 de julio",
        "D. 1 de mayo",
      ],
      correctAnswer: 0,
    },
    {
      id: 6,
      question: "¿Cuál es el volcán más alto de Costa Rica?",
      options: ["A. Irazú", "B. Poás", "C. Arenal", "D. Turrialba"],
      correctAnswer: 0,
    },
    {
      id: 7,
      question: "¿Qué símbolo nacional representa el trabajo?",
      options: [
        "A. La Carreta",
        "B. El Yigüirro",
        "C. La Guaria Morada",
        "D. La Antorcha",
      ],
      correctAnswer: 0,
    },
    {
      id: 8,
      question: "¿Cuál es la flor nacional de Costa Rica?",
      options: ["A. Guaria Morada", "B. Rosa", "C. Girasol", "D. Orquídea"],
      correctAnswer: 0,
    },
    {
      id: 9,
      question: "¿Contra quiénes luchó Costa Rica en la Campaña de 1856?",
      options: [
        "A. Los filibusteros",
        "B. Los españoles",
        "C. Los ingleses",
        "D. Los franceses",
      ],
      correctAnswer: 0,
    },
    {
      id: 10,
      question: "¿Qué presidente decretó la abolición del ejército?",
      options: [
        "A. José Figueres Ferrer",
        "B. Rafael Ángel Calderón",
        "C. Teodoro Picado",
        "D. Otilio Ulate",
      ],
      correctAnswer: 0,
    },
    {
      id: 11,
      question: "¿Qué celebramos el 25 de julio?",
      options: [
        "A. Anexión del Partido de Nicoya",
        "B. Independencia",
        "C. Batalla de Rivas",
        "D. Día de la Madre",
      ],
      correctAnswer: 0,
    },
    {
      id: 12,
      question: "¿Cuál es la moneda oficial de Costa Rica?",
      options: ["A. Colón", "B. Dólar", "C. Peso", "D. Real"],
      correctAnswer: 0,
    },
    {
      id: 13,
      question: "¿Con qué país limita Costa Rica al norte?",
      options: ["A. Nicaragua", "B. Panamá", "C. México", "D. Honduras"],
      correctAnswer: 0,
    },
    {
      id: 14,
      question: "¿Qué prenda es típica del traje campesino costarricense?",
      options: ["A. Chonete", "B. Sombrero de copa", "C. Boina", "D. Casco"],
      correctAnswer: 0,
    },
    {
      id: 15,
      question: "¿Cuál es el instrumento musical nacional?",
      options: ["A. Marimba", "B. Guitarra", "C. Violín", "D. Flauta"],
      correctAnswer: 0,
    },
  ];

  const currentUser = getUserData();

  const [player, setPlayer] = useState<BattlePlayer>({
    id: "me",
    name: currentUser.name.split(" ")[0],
    avatarName: location.state?.myAvatar || "Aren",
    health: 100,
    maxHealth: 100,
    score: 0,
  });

  const [opponent, setOpponent] = useState<BattlePlayer>({
    id: "op",
    name: location.state?.opponent?.name || "Bot",
    avatarName: location.state?.opponent?.avatar || "Capy",
    health: 100,
    maxHealth: 100,
    score: 0,
  });

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showDamageAnimation, setShowDamageAnimation] = useState(false);
  const [damageAmount, setDamageAmount] = useState(0);
  const [damageTarget, setDamageTarget] = useState<"player" | "opponent">(
    "opponent"
  );
  const [showResults, setShowResults] = useState(false);
  const [winner, setWinner] = useState<"player" | "opponent" | "draw" | null>(
    null
  );
  const [showQuestionPopup, setShowQuestionPopup] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playerAttackAnimation, setPlayerAttackAnimation] = useState(false);
  const [opponentAttackAnimation, setOpponentAttackAnimation] = useState(false);
  const [playerHitAnimation, setPlayerHitAnimation] = useState(false);
  const [opponentHitAnimation, setOpponentHitAnimation] = useState(false);

  const [scrollingTextPosition, setScrollingTextPosition] = useState(0);
  // New Mechanics State
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showCritical, setShowCritical] = useState(false);

  // New Stats & Disconnect State
  const [winStreak, setWinStreak] = useState(0);
  const [utilizationIndex, setUtilizationIndex] = useState(0);
  const [disconnectMessage, setDisconnectMessage] = useState("");

  const scrollingTextRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const hitSoundRef = useRef<HTMLAudioElement | null>(null);
  const criticalSoundRef = useRef<HTMLAudioElement | null>(null);

  const playHitSound = () => {
    if (hitSoundRef.current) {
      hitSoundRef.current.currentTime = 0;
      hitSoundRef.current
        .play()
        .catch((e) => console.warn("Hit sound failed:", e));
    }
  };

  const playCriticalSound = () => {
    if (criticalSoundRef.current) {
      criticalSoundRef.current.currentTime = 0;
      criticalSoundRef.current
        .play()
        .catch((e) => console.warn("Critical sound failed:", e));
    }
  };

  const resetRound = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowDamageAnimation(false);
    // Popup managed by showQuestion called in round_start
    setPlayerAttackAnimation(false);
    setOpponentAttackAnimation(false);
    setPlayerHitAnimation(false);
    setOpponentHitAnimation(false);
  };

  // Handle Server Result Animation
  const handleServerRoundResult = (data: {
    winnerId: string;
    damage: number;
    isCritical?: boolean;
  }) => {
    const myId = socketService.socket?.id;
    const isMeWinner = data.winnerId === myId;
    const isDraw = data.winnerId === "draw";

    setDamageAmount(data.damage);
    setShowQuestionPopup(false);
    setProgress(0);

    // Handle Critical Visual
    if (data.isCritical) {
      setShowCritical(true);
      playCriticalSound();
      setTimeout(() => setShowCritical(false), 2500);
    }

    if (isMeWinner) {
      setPlayerAttackAnimation(true);
      setDamageTarget("opponent");

      setTimeout(() => playHitSound(), 300);
      setTimeout(() => {
        setShowDamageAnimation(true);
        setOpponentHitAnimation(true);

        setOpponent((prev) => {
          const newHealth = Math.max(0, prev.health - data.damage);
          return { ...prev, health: newHealth };
        });
        setPlayer((prev) => ({ ...prev, score: prev.score + 100 }));
      }, 600);
    } else if (!isDraw) {
      setOpponentAttackAnimation(true);
      setDamageTarget("player");

      setTimeout(() => playHitSound(), 300);
      setTimeout(() => {
        setShowDamageAnimation(true);
        setPlayerHitAnimation(true);
        setPlayer((prev) => {
          const newHealth = Math.max(0, prev.health - data.damage);
          return { ...prev, health: newHealth };
        });
      }, 600);
    }

    // Cleanup animations
    setTimeout(() => {
      setPlayerAttackAnimation(false);
      setOpponentAttackAnimation(false);
      setPlayerHitAnimation(false);
      setOpponentHitAnimation(false);
      setShowDamageAnimation(false);
    }, 2500);
  };

  // --- Socket Logic: Drive Game State ---
  useEffect(() => {
    if (!roomId) return;

    console.log("Connecting to Game Room:", roomId);
    socketService.connect();
    const socket = socketService.socket;

    if (socket) {
      // 1. Round Start
      socket.on("round_start", (data: { questionIndex: number }) => {
        console.log("Round Start:", data);

        setTimeout(() => {
          setCurrentQuestion(data.questionIndex % questions.length);
          resetRound();
          showQuestion();
          setIsTimerActive(false);
          setShowCritical(false);
        }, 500);
      });

      // 2. Opponent Answered
      socket.on("opponent_answered", () => {
        console.log("Opponent Answered - Timer Started");
        setIsTimerActive(true);
      });

      // 3. Round Result
      socket.on(
        "round_result",
        (data: { winnerId: string; damage: number; isCritical?: boolean }) => {
          console.log("Round Result:", data);
          setIsTimerActive(false);
          handleServerRoundResult(data);
        }
      );

      // 4. Game Over
      socket.on(
        "game_over",
        (data: {
          winnerId: string;
          reason?: string;
          stats?: { winStreak: number; utilizationIndex: number };
        }) => {
          console.log("Game Over:", data);
          setIsTimerActive(false);

          if (data.reason === "disconnect") {
            setDisconnectMessage(t("battle.opponentDisconnected"));
          }

          if (data.stats) {
            setWinStreak(data.stats.winStreak);
            setUtilizationIndex(data.stats.utilizationIndex);
          }

          setTimeout(() => {
            setWinner(
              data.winnerId === socket.id
                ? "player"
                : data.winnerId === "draw"
                ? "draw"
                : "opponent"
            );
            setShowResults(true);
          }, 2000);
        }
      );
    }

    return () => {
      if (socket) {
        socket.off("round_start");
        socket.off("opponent_answered");
        socket.off("round_result");
        socket.off("game_over");
      }
    };
  }, [roomId]);

  // --- Audio Logic ---
  useEffect(() => {
    const bgm = new Audio("/assets/battlesong.mp3");
    bgm.loop = true;
    bgm.volume = 0;
    bgmRef.current = bgm;

    const hit = new Audio("/assets/hit-sound.mp3");
    hit.volume = 0.6;
    hitSoundRef.current = hit;

    const critical = new Audio("/assets/critical-hit-sound.mp3");
    critical.volume = 0.7; // Slightly louder
    criticalSoundRef.current = critical;

    const playBGM = async () => {
      try {
        await bgm.play();
      } catch (e) {
        console.warn("Autoplay prevented:", e);
      }
    };
    playBGM();

    // Volume Fade In
    const FADE_DURATION = 3;
    const MAX_VOLUME = 0.3;
    const fadeIn = setInterval(() => {
      if (bgm.volume < MAX_VOLUME) {
        bgm.volume = Math.min(MAX_VOLUME, bgm.volume + 0.05);
      } else {
        clearInterval(fadeIn);
      }
    }, 500);

    return () => {
      clearInterval(fadeIn);
      bgm.pause();
      bgmRef.current = null;
      hitSoundRef.current = null;
      criticalSoundRef.current = null;
    };
  }, []);

  // --- Navigation & Cleanup Logic ---
  useEffect(() => {
    // We do NOT disconnect on unmount here to allow persistence,
    // or we rely on the lobby to manage connection start.
    // If we disconnect here, we lose the session if we just navigate back/forth.
    return () => {
      // socketService.disconnect(); // RESTORED: Commented out to prevent connection loss
    };
  }, []);

  useIonViewWillLeave(() => {
    if (bgmRef.current) {
      bgmRef.current.pause();
      bgmRef.current.currentTime = 0;
    }
    // socketService.disconnect(); // RESTORED: Commented out to prevent connection loss
  });

  useIonViewWillEnter(() => {
    if (bgmRef.current && bgmRef.current.paused) {
      bgmRef.current.play().catch((e) => console.warn("Resume BGM failed:", e));
    }
  });

  // --- UI/Animation Logic ---
  useEffect(() => {
    const scrollText = () => {
      setScrollingTextPosition((prev) => {
        const textWidth = scrollingTextRef.current?.scrollWidth || 0;
        const containerWidth =
          scrollingTextRef.current?.parentElement?.offsetWidth || 0;
        if (textWidth > containerWidth) {
          const newPosition = prev - 0.5;
          if (newPosition < -textWidth) return containerWidth;
          return newPosition;
        }
        return 0;
      });
    };
    animationRef.current = requestAnimationFrame(function animate() {
      scrollText();
      animationRef.current = requestAnimationFrame(animate);
    });
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [currentQuestion]);

  useEffect(() => {
    if (!isAnswered && showQuestionPopup) {
      const duration = 8000;
      const interval = 50;
      const increment = 100 / (duration / interval);
      const progressTimer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressTimer);
            return 100;
          }
          return prev + increment;
        });
      }, interval);
      const timer = setTimeout(() => {
        setShowQuestionPopup(false);
        clearInterval(progressTimer);
      }, duration);
      return () => {
        clearTimeout(timer);
        clearInterval(progressTimer);
      };
    }
  }, [currentQuestion, isAnswered, showQuestionPopup]);

  const showQuestion = () => {
    setShowQuestionPopup(true);
    setProgress(0);
  };

  const closeQuestion = () => {
    setShowQuestionPopup(false);
    setProgress(0);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return;

    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    setShowQuestionPopup(false);

    // User local feedback (optional color change handled by getButtonColor)
    // Emit to server
    if (roomId) {
      // Technically we can check correctness locally if we trust question list sync
      const isCorrect =
        answerIndex === questions[currentQuestion].correctAnswer;
      socketService.socket?.emit("submit_answer", {
        roomId,
        correct: isCorrect,
      });
    }
    // We do NOT update health/animations here. Wait for 'round_result' event.
  };

  const getButtonColor = (index: number) => {
    if (!isAnswered) return "";
    const isCorrect = index === questions[currentQuestion].correctAnswer;
    if (index === selectedAnswer) return isCorrect ? "correct" : "incorrect";
    if (index === questions[currentQuestion].correctAnswer) return "correct"; // Reveal answer?
    return "";
  };

  const getHealthBarColor = (health: number, maxHealth: number) => {
    const percentage = (health / maxHealth) * 100;
    if (percentage > 60) return "#4CAF50";
    if (percentage > 30) return "#FF9800";
    return "#F44336";
  };

  const handleBackToMenu = () => {
    history.replace("/page/student");
  };

  const restartBattle = () => {
    // Just resets UI, server controls real state?
    // For minigame, typically we just leave or rematch.
    setPlayer((prev) => ({ ...prev, health: 100, score: 0 }));
    setOpponent((prev) => ({ ...prev, health: 100, score: 0 }));
    resetRound();
    setShowResults(false);
    setWinner(null);
  };

  return (
    <IonPage>
      <StudentHeader pageTitle="battle.title" />

      {/* Logic Fix: Re-enabled Sidebar */}
      <StudentSidebar onLogout={handleLogout} />

      <IonContent fullscreen={false} className="battle-content">
        {" "}
        {/* Changed fullscreen to false */}
        <div className="battle-container">
          <div className="battle-section enemy-section">
            <div className="character-container">
              <div className="health-bar enemy-health">
                <div className="character-name-row">
                  <span className="character-name">{opponent.name}</span>
                </div>
                <div className="health-bar-container">
                  <div
                    className="health-bar-fill"
                    style={{
                      width: `${(opponent.health / opponent.maxHealth) * 100}%`,
                      backgroundColor: getHealthBarColor(
                        opponent.health,
                        opponent.maxHealth
                      ),
                    }}
                  ></div>
                </div>
                <div className="hp-row">
                  <span className="hp-text">
                    {t("battle.hp")}: {opponent.health}/{opponent.maxHealth}
                  </span>
                </div>
              </div>
              <div className="avatar-wrapper">
                <img
                  src={`/assets/battle_sprite_front_${opponent.avatarName.toLowerCase()}.png`}
                  onError={(e) =>
                    (e.currentTarget.src =
                      "/assets/battle_sprite_front_capybara.png")
                  } // Fallback
                  alt={opponent.avatarName}
                  className={`avatar-image ${
                    opponentAttackAnimation
                      ? "enemy-attack-animation"
                      : opponentHitAnimation
                      ? "damage-animation"
                      : ""
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="battle-section player-section">
            <div className="character-container">
              <div className="avatar-wrapper">
                <img
                  src={`/assets/battle_sprite_back_${player.avatarName.toLowerCase()}.png`}
                  onError={(e) =>
                    (e.currentTarget.src =
                      "/assets/battle_sprite_back_capybara.png")
                  } // Fallback
                  alt={player.avatarName}
                  className={`avatar-image ${
                    playerAttackAnimation
                      ? "player-attack-animation"
                      : playerHitAnimation
                      ? "damage-animation"
                      : ""
                  }`}
                />
              </div>
              <div className="health-bar player-health">
                <div className="character-name-row">
                  <span className="character-name">{player.name}</span>
                </div>
                <div className="health-bar-container">
                  <div
                    className="health-bar-fill"
                    style={{
                      width: `${(player.health / player.maxHealth) * 100}%`,
                      backgroundColor: getHealthBarColor(
                        player.health,
                        player.maxHealth
                      ),
                    }}
                  ></div>
                </div>
                <div className="hp-row">
                  <span className="hp-text">
                    {t("battle.hp")}: {player.health}/{player.maxHealth}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sudden Death Timer */}
          <div className="timer-bar-container">
            <div
              className={`timer-bar-fill ${isTimerActive ? "active" : ""}`}
            ></div>
          </div>

          <div className="section-separator"></div>

          {/* Critical Hit Overlay */}
          {showCritical && (
            <div className="critical-text-overlay">CRITICAL!</div>
          )}

          <div className="options-section">
            <IonGrid>
              <IonRow>
                {questions[currentQuestion].options.map((option, index) => (
                  <IonCol size="12" key={index}>
                    <IonButton
                      expand="block"
                      className={`option-button ${getButtonColor(index)}`}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={isAnswered}
                    >
                      {option}
                    </IonButton>
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
          </div>

          <div className="bottom-question-bar" onClick={showQuestion}>
            <div className="bottom-bar-content">
              <div className="scrolling-text-container">
                <div
                  ref={scrollingTextRef}
                  className="scrolling-text"
                  style={{
                    transform: `translateX(${scrollingTextPosition}px)`,
                  }}
                >
                  {questions[currentQuestion].question}
                </div>
              </div>
            </div>
          </div>

          {showQuestionPopup && (
            <div className="question-popup-overlay">
              <div className="question-popup">
                <div className="question-header">
                  <IonButton
                    fill="clear"
                    className="close-button"
                    onClick={closeQuestion}
                  >
                    <IonIcon icon={close} />
                  </IonButton>
                </div>
                <div className="question-content">
                  <IonText>
                    <h2 className="question-text">
                      {questions[currentQuestion].question}
                    </h2>
                  </IonText>
                </div>
                <div className="progress-container">
                  <div
                    className="progress-bar"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {showDamageAnimation && (
            <div className={`damage-popup ${damageTarget}`}>
              -{damageAmount}
            </div>
          )}
        </div>
        <IonModal
          isOpen={showResults}
          className="results-modal"
          backdropDismiss={false}
        >
          <div className="premium-results-container">
            {/* Victory / Defeat Header */}
            <div className={`result-header ${winner}`}>
              {disconnectMessage && (
                <div className="disconnect-badge">{disconnectMessage}</div>
              )}
              <div className="result-title">
                {winner === "player"
                  ? "¡VICTORIA!"
                  : winner === "opponent"
                  ? "DERROTA"
                  : "EMPATE"}
              </div>
            </div>

            {/* Stats Display (Only show for Winner or Player) */}
            <div className="result-stats-grid">
              <div className="stat-box">
                <span className="stat-label">Puntos</span>
                <span className="stat-value">{player.score}</span>
              </div>
              {winner === "player" && (
                <>
                  <div className="stat-box highlight">
                    <span className="stat-label">{t("battle.winStreak")}</span>
                    <span className="stat-value">🔥 {winStreak}</span>
                  </div>
                  <div className="stat-box highlight">
                    <span className="stat-label">
                      {t("battle.utilizationIndex")}
                    </span>
                    <span className="stat-value">⚡ {utilizationIndex}</span>
                  </div>
                </>
              )}
            </div>

            <div className="result-actions">
              <IonButton
                expand="block"
                className="premium-lobby-btn"
                onClick={handleBackToMenu}
              >
                {t("battle.backToLobby")}
                <IonIcon icon={arrowForward} slot="end" />
              </IonButton>
            </div>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default BattleMinigame;
