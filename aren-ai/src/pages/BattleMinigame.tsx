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
import { useLocation, useHistory } from "react-router-dom"; // Logic Fix
import { socketService } from "../services/socket"; // Logic Fix
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
  }>(); // Logic Fix
  const history = useHistory(); // Logic Fix
  const roomId = location.state?.roomId; // Logic Fix

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
  ];

  const currentUser = getUserData();

  // Logic Fix: Initialize from location state
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

  const scrollingTextRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const hitSoundRef = useRef<HTMLAudioElement | null>(null);

  // --- Socket Logic: Drive Game State ---
  useEffect(() => {
    if (!roomId) return;

    console.log("Connecting to Game Room:", roomId);
    socketService.connect();
    const socket = socketService.socket;

    if (socket) {
      // 1. Round Start: Received new question index
      socket.on("round_start", (data: { questionIndex: number }) => {
        console.log("Round Start:", data);

        // Wait a moment if we were showing results/damage
        setTimeout(() => {
          setCurrentQuestion(data.questionIndex % questions.length);
          resetRound();
          showQuestion();
        }, 500);
      });

      // 2. Opponent Answered (Optional Feedback)
      socket.on("opponent_answered", () => {
        console.log("Opponent Answered");
        // Could show a bubble or indicator
      });

      // 3. Round Result: Received damage/winner info
      socket.on(
        "round_result",
        (data: { winnerId: string; damage: number }) => {
          console.log("Round Result:", data);
          handleServerRoundResult(data);
        }
      );

      // 4. Game Over
      socket.on("game_over", (data: { winnerId: string }) => {
        console.log("Game Over:", data);
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
      });
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

  // Handle Server Result Animation
  const handleServerRoundResult = (data: {
    winnerId: string;
    damage: number;
  }) => {
    const myId = socketService.socket?.id;
    const isMeWinner = data.winnerId === myId;
    const isDraw = data.winnerId === "draw";

    setDamageAmount(data.damage);
    setShowQuestionPopup(false);
    setProgress(0);

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

        // End animation cleanup happens via timeouts or next round
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

  // --- Audio Logic ---
  useEffect(() => {
    const bgm = new Audio("/assets/battlesong.mp3");
    bgm.loop = true;
    bgm.volume = 0;
    bgmRef.current = bgm;

    const hit = new Audio("/assets/hit-sound.mp3");
    hit.volume = 0.6;
    hitSoundRef.current = hit;

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
    };
  }, []);

  useIonViewWillLeave(() => {
    if (bgmRef.current) {
      bgmRef.current.pause();
      bgmRef.current.currentTime = 0;
    }
  });

  useIonViewWillEnter(() => {
    if (bgmRef.current && bgmRef.current.paused) {
      bgmRef.current.play().catch((e) => console.warn("Resume BGM failed:", e));
    }
  });

  const playHitSound = () => {
    if (hitSoundRef.current) {
      hitSoundRef.current.currentTime = 0;
      hitSoundRef.current
        .play()
        .catch((e) => console.warn("Hit sound failed:", e));
    }
  };

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

          <div className="section-separator"></div>

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
        <IonModal isOpen={showResults} className="results-modal">
          <div className="results-container">
            <IonCard className="results-card">
              <IonCardContent>
                <div className="battle-results-section">
                  <IonText>
                    <h2 className="battle-result-title">
                      {winner === "player" && t("battle.victory")}
                      {winner === "opponent" && t("battle.defeat")}
                      {winner === "draw" && t("battle.draw")}
                    </h2>
                  </IonText>

                  <div className="battle-stats">
                    <div className="battle-stat">
                      <div className="stat-label">
                        {t("battle.finalHealth")}
                      </div>
                      <div className="stat-value">
                        {player.health}/{player.maxHealth}
                      </div>
                    </div>
                    <div className="battle-stat">
                      <div className="stat-label">
                        {t("battle.opponentHealth")}
                      </div>
                      <div className="stat-value">
                        {opponent.health}/{opponent.maxHealth}
                      </div>
                    </div>
                    <div className="battle-stat">
                      <div className="stat-label">{t("battle.score")}</div>
                      <div className="stat-value">{player.score} pts</div>
                    </div>
                  </div>

                  <div className="battle-actions">
                    <IonButton
                      expand="block"
                      className="rematch-button"
                      onClick={restartBattle}
                    >
                      {t("battle.rematch")}
                    </IonButton>
                    <IonButton
                      expand="block"
                      className="menu-button-primary"
                      onClick={handleBackToMenu}
                    >
                      <IonIcon icon={arrowForward} slot="end" />
                      {t("battle.backToMenu")}
                    </IonButton>
                  </div>
                </div>
              </IonCardContent>
            </IonCard>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default BattleMinigame;
