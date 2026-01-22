import React, { useState, useEffect } from "react";
import {
  IonContent,
  IonPage,
  IonButton,
  IonIcon,
  IonModal,
  IonCard,
  IonCardContent,
  useIonRouter,
} from "@ionic/react";
import {
  checkmarkCircle,
  ellipseOutline,
  leaf,
  arrowBack,
} from "ionicons/icons";
import { useTranslation } from "react-i18next";
import "./Quiz.css";
import StudentHeader from "../components/StudentHeader";
import StudentSidebar from "../components/StudentSidebar";
import { getUserData } from "../utils/userUtils";
import { useSound } from "../context/SoundContext";
import { triggerConfetti } from "../utils/confettiUtils";
import { QuizQuestionBanks } from "../data/questions";
import { progressionService } from "../services/progressionService";
import { learningStatsService } from "../services/learningStatsService";

// Helper Interface
interface ExpandedQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  correctAnswers?: number[];
  allowMultiple?: boolean;
}

const Quiz: React.FC = () => {
  const { t } = useTranslation();
  const router = useIonRouter();
  const { playSuccess } = useSound(); // We use manual audio for correct/wrong specific sounds

  const handleLogout = () => {
    router.push("/login", "root", "replace");
  };

  const questionBanks = QuizQuestionBanks;
  const currentUser = getUserData();

  // State
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);

  const [isAnswered, setIsAnswered] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [animationPoints, setAnimationPoints] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const [activeQuestions, setActiveQuestions] = useState<ExpandedQuestion[]>(
    [],
  );
  const [selectedSubject, setSelectedSubject] = useState("SocialStudies");

  // Audio refs
  // Note: Creating new Audio objects on render is okay for simple logic,
  // but better to memoize if causing issues. For now, this works.
  const correctAudio = new Audio("/assets/correct-answer.mp3");
  const wrongAudio = new Audio("/assets/wrong-answer.mp3");

  useEffect(() => {
    const sub = localStorage.getItem("selectedSubject");
    let bankQuestions: any[] = questionBanks.SocialStudies;

    if (sub) {
      let bankName: keyof typeof questionBanks = "SocialStudies";
      if (sub === "Math") bankName = "Math";
      else if (sub === "Science") bankName = "Science";
      else if (sub === "Spanish") bankName = "Spanish";
      else if (sub === "SocialStudies") bankName = "SocialStudies";

      setSelectedSubject(bankName);
      bankQuestions = questionBanks[bankName];
    }

    // Default mapping
    const mapped: ExpandedQuestion[] = bankQuestions.map((q) => ({
      ...q,
      allowMultiple: false,
      correctAnswers: [q.correctAnswer],
    }));
    setActiveQuestions(mapped);
  }, []);

  const currentQ = activeQuestions[currentQuestion];
  const isMultiple = currentQ?.allowMultiple || false;

  const handleOptionClick = (index: number) => {
    if (isAnswered && !isMultiple) return;

    if (isMultiple) {
      if (isAnswered) return;
      if (selectedAnswers.includes(index)) {
        setSelectedAnswers(selectedAnswers.filter((i) => i !== index));
      } else {
        setSelectedAnswers([...selectedAnswers, index]);
      }
    } else {
      submitSingleAnswer(index);
    }
  };

  const submitSingleAnswer = (index: number) => {
    const endTime = Date.now();
    const timeTaken = (endTime - startTime) / 1000;
    const isCorrect = index === currentQ.correctAnswer;

    setSelectedAnswer(index);
    setIsAnswered(true);

    processResult(isCorrect, timeTaken);
  };

  const submitMultipleAnswer = () => {
    if (selectedAnswers.length === 0) return;

    const endTime = Date.now();
    const timeTaken = (endTime - startTime) / 1000;
    const correctSet = currentQ.correctAnswers || [currentQ.correctAnswer];
    const isCorrect =
      selectedAnswers.length === correctSet.length &&
      selectedAnswers.every((a) => correctSet.includes(a));

    setIsAnswered(true);
    processResult(isCorrect, timeTaken);
  };

  const processResult = (isCorrect: boolean, timeTaken: number) => {
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);

      let pointsEarned = 0;
      if (timeTaken < 5) pointsEarned = 150;
      else if (timeTaken < 10) pointsEarned = 125;
      else if (timeTaken < 15) pointsEarned = 110;
      else pointsEarned = 100;

      setAnimationPoints(pointsEarned);
      setShowPointsAnimation(true);

      // Play Correct Sound
      correctAudio.play().catch((e) => console.log("Audio play failed", e));

      // Animate Score
      const startScore = score;
      const endScore = score + pointsEarned;
      animateScore(startScore, endScore);
    } else {
      // Play Wrong Sound
      wrongAudio.play().catch((e) => console.log("Audio play failed", e));

      setScore((prev) => Math.max(0, prev - 25));
    }

    setTimeout(() => {
      if (currentQuestion < activeQuestions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
        setSelectedAnswer(null);
        setSelectedAnswers([]);
        setIsAnswered(false);
        setStartTime(Date.now());
        setShowPointsAnimation(false);
      } else {
        finishQuiz();
      }
    }, 2000);
  };

  // Helper for Score Animation
  const animateScore = (start: number, end: number) => {
    const duration = 1000; // 1 second
    const startTime = performance.now();

    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease Out Quart formula
      const ease = 1 - Math.pow(1 - progress, 4);

      const current = Math.floor(start + (end - start) * ease);
      setScore(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  };

  const finishQuiz = () => {
    setTimeout(() => {
      if (score > 0) progressionService.addXp(score);
      learningStatsService.saveResult({
        subject: selectedSubject,
        score: score,
        correctCount: correctCount,
        totalQuestions: activeQuestions.length,
        timestamp: Date.now(),
      });
      setShowResults(true);
      triggerConfetti();
    }, 1000);
  };

  const getQuestionText = () => {
    if (!currentQ) return "";
    return currentQ.question.replace("{name}", currentUser.name);
  };

  const getButtonClass = (index: number) => {
    let base = "quiz-answer-btn-new";
    const isSelected = isMultiple
      ? selectedAnswers.includes(index)
      : selectedAnswer === index;

    if (isAnswered) {
      const correctSet = currentQ.correctAnswers || [currentQ.correctAnswer];
      const isCorrect = correctSet.includes(index);
      if (isCorrect) return `${base} status-correct`;
      if (isSelected && !isCorrect) return `${base} status-incorrect`;
      return base;
    }

    if (isSelected) return `${base} selected`;
    return base;
  };

  const handleBackToMenu = () => {
    router.push("/quiz-menu", "back", "pop");
  };

  if (!currentQ)
    return (
      <IonPage>
        <IonContent>Loading...</IonContent>
      </IonPage>
    );

  return (
    <IonPage className="quiz-new-layout">
      {/* Floating Points Animation Overlay */}
      {showPointsAnimation && (
        <div className="quiz-floating-points">+{animationPoints}</div>
      )}

      {/* Shared Student Header with Custom Notch */}
      <StudentHeader
        pageTitle="Quiz"
        showBackButton
        onBack={handleBackToMenu}
        notchContent={
          <div
            className="sh-subject-display"
            style={{ width: "auto", padding: "0 20px", cursor: "default" }}
          >
            <span
              className="quiz-score-val"
              style={{ fontSize: "1.5rem", fontWeight: 800, color: "white" }}
            >
              {score}
            </span>
          </div>
        }
      />

      <StudentSidebar onLogout={handleLogout} />

      <IonContent fullscreen className="quiz-content-redesign">
        {/* Scaler Wrapper - 5% Smaller */}
        <div className="quiz-scaler-wrapper">
          <div className="quiz-main-layout">
            {/* Mascot Wrapper */}
            <div className="quiz-visual-block">
              <div className="quiz-mascot-layer">
                <img
                  src="/assets/capybara_sprite_normal.png"
                  alt="Mascot"
                  className="quiz-mascot-img-large"
                />
              </div>

              {/* Question Card */}
              <div className="quiz-card-container">
                <div className="quiz-name-pill">
                  <span>Aren</span>
                </div>
                <div className="quiz-card-text">{getQuestionText()}</div>
              </div>
            </div>

            {/* Controls */}
            <div className="quiz-controls-row">
              <div className="quiz-type-badge">
                {isMultiple ? t("Respuesta multiple") : t("Respuesta única")}
              </div>

              {isMultiple && (
                <div
                  className="quiz-ok-btn-visible"
                  onClick={submitMultipleAnswer}
                >
                  Ok
                </div>
              )}
            </div>

            {/* Separator */}
            <div className="quiz-separator-floral">
              <div className="separator-line"></div>
              <div className="separator-icon">
                <IonIcon icon={leaf} /> <span>❧</span>
              </div>
              <div className="separator-line"></div>
            </div>

            {/* Answers Box */}
            <div className="quiz-answers-container-box">
              {currentQ.options.map((option, idx) => (
                <div
                  key={idx}
                  className={getButtonClass(idx)}
                  onClick={() => handleOptionClick(idx)}
                >
                  <div className="answer-check-icon">
                    {(
                      isMultiple
                        ? selectedAnswers.includes(idx)
                        : selectedAnswer === idx
                    ) ? (
                      <IonIcon icon={checkmarkCircle} />
                    ) : (
                      <IonIcon icon={ellipseOutline} />
                    )}
                  </div>
                  <span className="answer-text-content">{option}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Progress Bar - Touching Bottom & Sides */}
        <div className="quiz-footer-progress">
          <div
            className="quiz-progress-fill"
            style={{
              width: `${((currentQuestion + 1) / activeQuestions.length) * 100}%`,
            }}
          ></div>
        </div>
      </IonContent>

      <IonModal isOpen={showResults} className="results-modal">
        <IonCard className="results-card">
          <IonCardContent>
            <h2>{t("quiz.congrats", { name: currentUser.name, score })}</h2>
            <IonButton expand="block" onClick={handleBackToMenu}>
              {t("quiz.backToMenu")}
            </IonButton>
          </IonCardContent>
        </IonCard>
      </IonModal>
    </IonPage>
  );
};

export default Quiz;
