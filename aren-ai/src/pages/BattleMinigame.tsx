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
  id: number;
  name: string;
  avatarName: string;
  health: number;
  maxHealth: number;
  score: number;
}

const BattleMinigame: React.FC = () => {
  const { t } = useTranslation();

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

  const [player, setPlayer] = useState<BattlePlayer>({
    id: 1,
    name: currentUser.name.split(" ")[0],
    avatarName: "Aren",
    health: 100,
    maxHealth: 100,
    score: 0,
  });

  const [opponent, setOpponent] = useState<BattlePlayer>({
    id: 2,
    name: "Bot",
    avatarName: "Capy",
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

  // Audio refs
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const hitSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize Background Music
    const bgm = new Audio("/assets/battlesong.mp3");
    bgm.loop = true;
    bgm.volume = 0; // Start at 0 for fade in
    bgmRef.current = bgm;

    // Initialize Hit Sound
    const hit = new Audio("/assets/hit-sound.mp3");
    hit.volume = 0.6;
    hitSoundRef.current = hit;

    // Play BGM
    const playBGM = async () => {
      try {
        await bgm.play();
      } catch (e) {
        console.error("Autoplay prevented:", e);
      }
    };
    playBGM();

    // Volume Fade Logic
    const FADE_DURATION = 3; // seconds
    const MAX_VOLUME = 0.3; // Lower volume for background music

    const handleTimeUpdate = () => {
      const timeLeft = bgm.duration - bgm.currentTime;

      if (timeLeft <= FADE_DURATION) {
        // Fade out
        bgm.volume = Math.max(0, (timeLeft / FADE_DURATION) * MAX_VOLUME);
      } else if (bgm.currentTime <= FADE_DURATION) {
        // Fade in
        bgm.volume = Math.min(
          MAX_VOLUME,
          (bgm.currentTime / FADE_DURATION) * MAX_VOLUME
        );
      } else {
        // Stable volume
        bgm.volume = MAX_VOLUME;
      }
    };

    bgm.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      bgm.removeEventListener("timeupdate", handleTimeUpdate);
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
      bgmRef.current
        .play()
        .catch((e) => console.error("Resume BGM failed:", e));
    }
  });

  const playHitSound = () => {
    if (hitSoundRef.current) {
      hitSoundRef.current.currentTime = 0;
      hitSoundRef.current
        .play()
        .catch((e) => console.error("Hit sound failed:", e));
    }
  };

  useEffect(() => {
    const scrollText = () => {
      setScrollingTextPosition((prev) => {
        const textWidth = scrollingTextRef.current?.scrollWidth || 0;
        const containerWidth =
          scrollingTextRef.current?.parentElement?.offsetWidth || 0;

        if (textWidth > containerWidth) {
          const newPosition = prev - 0.5;
          if (newPosition < -textWidth) {
            return containerWidth;
          }
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
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentQuestion]);

  useEffect(() => {
    if (!isAnswered) {
      setShowQuestionPopup(true);
      setProgress(0);

      const duration = 8000;
      const interval = 50;
      const steps = duration / interval;
      const increment = 100 / steps;

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
  }, [currentQuestion, isAnswered]);

  const showQuestion = () => {
    setShowQuestionPopup(true);
    setProgress(0);

    const duration = 8000;
    const interval = 50;
    const steps = duration / interval;
    const increment = 100 / steps;

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + increment;
      });
    }, interval);

    setTimeout(() => {
      if (!isAnswered) {
        setShowQuestionPopup(false);
        clearInterval(progressTimer);
      }
    }, duration);
  };

  const closeQuestion = () => {
    setShowQuestionPopup(false);
    setProgress(0);
  };

  const calculateDamage = (isCorrect: boolean, timeTaken: number): number => {
    if (!isCorrect) return 0;

    let damage = 25;
    if (timeTaken < 3) damage += 10;
    else if (timeTaken < 5) damage += 5;

    return damage;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return;

    const isCorrect = answerIndex === questions[currentQuestion].correctAnswer;
    const damage = calculateDamage(isCorrect, 2);

    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    setShowQuestionPopup(false);
    setProgress(0);

    if (isCorrect) {
      setPlayerAttackAnimation(true);
      setDamageAmount(damage);
      setDamageTarget("opponent");

      // Play hit sound when animation connects (0.3s)
      setTimeout(() => playHitSound(), 300);

      setTimeout(() => {
        setShowDamageAnimation(true);
        setOpponentHitAnimation(true);
      }, 600);

      const newOpponentHealth = Math.max(0, opponent.health - damage);
      setOpponent((prev) => ({
        ...prev,
        health: newOpponentHealth,
        score: prev.score + damage,
      }));

      if (newOpponentHealth <= 0) {
        setTimeout(() => {
          setWinner("player");
          setShowResults(true);
          setPlayerAttackAnimation(false);
          setOpponentHitAnimation(false);
        }, 2000);
        return;
      }
    } else {
      setOpponentAttackAnimation(true);
      setDamageAmount(damage);
      setDamageTarget("player");

      // Play hit sound when animation connects (0.3s)
      setTimeout(() => playHitSound(), 300);

      setTimeout(() => {
        setShowDamageAnimation(true);
        setPlayerHitAnimation(true);
      }, 600);

      const newPlayerHealth = Math.max(0, player.health - damage);
      setPlayer((prev) => ({
        ...prev,
        health: newPlayerHealth,
      }));

      if (newPlayerHealth <= 0) {
        setTimeout(() => {
          setWinner("opponent");
          setShowResults(true);
          setOpponentAttackAnimation(false);
          setPlayerHitAnimation(false);
        }, 2000);
        return;
      }
    }

    setTimeout(() => {
      if (
        currentQuestion < questions.length - 1 &&
        player.health > 0 &&
        opponent.health > 0
      ) {
        setCurrentQuestion((prev) => prev + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setShowDamageAnimation(false);
        setPlayerAttackAnimation(false);
        setOpponentAttackAnimation(false);
        setPlayerHitAnimation(false);
        setOpponentHitAnimation(false);
      } else {
        setTimeout(() => {
          if (player.health > opponent.health) {
            setWinner("player");
          } else if (opponent.health > player.health) {
            setWinner("opponent");
          } else {
            setWinner("draw");
          }
          setShowResults(true);
          setPlayerAttackAnimation(false);
          setOpponentAttackAnimation(false);
          setPlayerHitAnimation(false);
          setOpponentHitAnimation(false);
        }, 1000);
      }
    }, 2000);
  };

  const getButtonColor = (index: number) => {
    if (!isAnswered) return "";

    if (index === questions[currentQuestion].correctAnswer) {
      return "correct";
    } else if (
      index === selectedAnswer &&
      index !== questions[currentQuestion].correctAnswer
    ) {
      return "incorrect";
    }
    return "";
  };

  const getHealthBarColor = (health: number, maxHealth: number) => {
    const percentage = (health / maxHealth) * 100;
    if (percentage > 60) return "#4CAF50";
    if (percentage > 30) return "#FF9800";
    return "#F44336";
  };

  const handleBackToMenu = () => {
    window.location.href = "/page/student";
  };

  const restartBattle = () => {
    setPlayer((prev) => ({ ...prev, health: 100, score: 0 }));
    setOpponent((prev) => ({ ...prev, health: 100, score: 0 }));
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowDamageAnimation(false);
    setShowResults(false);
    setWinner(null);
    setShowQuestionPopup(true);
    setProgress(0);
    setPlayerAttackAnimation(false);
    setOpponentAttackAnimation(false);
    setPlayerHitAnimation(false);
    setOpponentHitAnimation(false);
  };

  return (
    <IonPage>
      <StudentHeader pageTitle="battle.title" />

      <StudentSidebar onLogout={handleLogout} />

      <IonContent fullscreen={false} className="battle-content">
        {" "}
        {/* Changed fullscreen to false */}
        <div className="battle-container">
          <div className="battle-section enemy-section">
            <div className="character-container">
              <div className="health-bar enemy-health">
                <div className="character-name-row">
                  <span className="character-name">
                    {opponent.name} - {opponent.avatarName}
                  </span>
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
                  src="/assets/battle_sprite_front_capybara.png"
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
                  src="/assets/battle_sprite_back_capybara.png"
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
                  <span className="character-name">
                    {player.name} - {player.avatarName}
                  </span>
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
