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
  useIonLoading,
  useIonToast,
} from "@ionic/react";
import {
  checkmarkCircle,
  ellipseOutline,
  leaf,
  arrowBack,
} from "ionicons/icons";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import "./Quiz.css";
import StudentHeader from "../components/StudentHeader";
import StudentSidebar from "../components/StudentSidebar";
import { getUserData } from "../utils/userUtils";
import { useSound } from "../context/SoundContext";
import { triggerConfetti } from "../utils/confettiUtils";
import { progressionService } from "../services/progressionService";
import { learningStatsService } from "../services/learningStatsService";
import { getApiUrl } from "../config/api";
import { useAvatar } from "../context/AvatarContext";
import { getQuestionSprite } from "../utils/avatarUtils";

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
  const location = useLocation();
  const { playSuccess } = useSound();
  const { currentAvatar } = useAvatar();
  const [presentLoading, dismissLoading] = useIonLoading();
  const [presentToast] = useIonToast();

  const handleLogout = () => {
    router.push("/login", "root", "replace");
  };

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
  const [loading, setLoading] = useState(true);
  const [quizName, setQuizName] = useState("");
  const [assignmentId, setAssignmentId] = useState<string | null>(null);

  // Audio refs
  const correctAudio = new Audio("/assets/correct-answer.mp3");
  const wrongAudio = new Audio("/assets/wrong-answer.mp3");

  // Fetch Quiz Data
  useEffect(() => {
    const fetchQuiz = async () => {
      const searchParams = new URLSearchParams(location.search);
      const qId = searchParams.get("quizId");
      const aId = searchParams.get("assignmentId");
      setAssignmentId(aId);

      if (!qId) {
        setLoading(false);
        presentToast({
          message: "No quiz specified",
          duration: 2000,
          color: "danger",
        });
        return;
      }

      try {
        const token =
          localStorage.getItem("authToken") || localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(getApiUrl(`/api/quizzes/${qId}/full`), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          const quiz = data.quiz;
          setQuizName(quiz.quiz_name);

          // Transform questions
          const transformed: ExpandedQuestion[] = quiz.questions.map(
            (q: any) => {
              const options = [q.option_1, q.option_2];
              if (q.option_3) options.push(q.option_3);
              if (q.option_4) options.push(q.option_4);

              let correctIndices: number[] = [];
              try {
                // correct_options is JSON string "[1, 2]" (1-based)
                const parsed = JSON.parse(q.correct_options);
                if (Array.isArray(parsed)) {
                  correctIndices = parsed.map((i: any) => Number(i) - 1);
                }
              } catch (e) {
                console.error("Error parsing correct options", e);
              }

              return {
                id: q.id_question,
                question: q.question_text,
                options,
                correctAnswer: correctIndices[0] || 0,
                correctAnswers: correctIndices,
                allowMultiple:
                  q.allow_multiple_selection === 1 ||
                  q.allow_multiple_selection === true,
              };
            },
          );

          if (transformed.length === 0) {
            presentToast({
              message: "This quiz has no questions.",
              duration: 2000,
              color: "warning",
            });
          }

          setActiveQuestions(transformed);
        } else {
          presentToast({
            message: "Failed to load quiz.",
            duration: 2000,
            color: "danger",
          });
        }
      } catch (error) {
        console.error("Error loading quiz:", error);
        presentToast({
          message: "Error loading quiz.",
          duration: 2000,
          color: "danger",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [location.search]);

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

    // Check correctness
    let isCorrect = false;
    if (currentQ.correctAnswers && currentQ.correctAnswers.length > 0) {
      isCorrect = currentQ.correctAnswers.includes(index);
    } else {
      isCorrect = index === currentQ.correctAnswer;
    }

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
    const startTimeStamp = performance.now();

    const update = (currentTime: number) => {
      const elapsed = currentTime - startTimeStamp;
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

  const finishQuiz = async () => {
    // Wait a moment before showing results
    setTimeout(async () => {
      if (score > 0) progressionService.addXp(score);

      // Save local stats
      learningStatsService.saveResult({
        subject: "General", // Could be mapped from quiz subject if available
        score: score,
        correctCount: correctCount,
        totalQuestions: activeQuestions.length,
        timestamp: Date.now(),
      });

      // If played as an assignment, update status
      if (assignmentId) {
        try {
          const token =
            localStorage.getItem("authToken") || localStorage.getItem("token");
          if (token) {
            // Update status
            // Note: Ideally we would also save the score here.
            // Using the existing endpoint for now.
            await fetch(
              getApiUrl(`/api/assignments/student/${assignmentId}/complete`),
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ complete: true }),
              },
            );
          }
        } catch (e) {
          console.error("Failed to update assignment status", e);
        }
      }

      setShowResults(true);
      triggerConfetti();
    }, 1000);
  };

  const getQuestionText = () => {
    if (!currentQ) return "";
    return currentQ.question.replace("{name}", currentUser?.name || "Student");
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

  if (loading)
    return (
      <IonPage>
        <IonContent className="quiz-loading-content">
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            Loading quiz...
          </div>
        </IonContent>
      </IonPage>
    );

  if (!currentQ && !loading && !showResults)
    return (
      <IonPage>
        <StudentHeader
          pageTitle="Quiz"
          showBackButton
          onBack={handleBackToMenu}
        />
        <IonContent>
          <div style={{ padding: "20px", textAlign: "center" }}>
            <h3>Quiz not found or has no questions.</h3>
            <IonButton onClick={handleBackToMenu}>Back to Menu</IonButton>
          </div>
        </IonContent>
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
        pageTitle={quizName || "Quiz"}
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
                  src={getQuestionSprite(currentAvatar)}
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
            <h2>
              {t("quiz.congrats", {
                name: currentUser?.name || "Student",
                score,
              })}
            </h2>
            <div style={{ margin: "20px 0", fontSize: "18px" }}>
              You answered {correctCount} out of {activeQuestions.length}{" "}
              correctly!
            </div>
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
