import React, { useState, useEffect } from "react";
import {
  IonContent,
  IonPage,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonIcon,
  IonModal,
  IonCard,
  IonCardContent,
  useIonRouter,
} from "@ionic/react";
import { arrowForward } from "ionicons/icons";
import { useTranslation } from "react-i18next";
import "./Quiz.css";
import StudentHeader from "../components/StudentHeader";
import StudentSidebar from "../components/StudentSidebar";
import { getUserData } from "../utils/userUtils";
import PageTransition from "../components/PageTransition";
import { useSound } from "../context/SoundContext";
import { triggerConfetti } from "../utils/confettiUtils";
import { QuizQuestionBanks } from "../data/questions";

const Quiz: React.FC = () => {
  const { t } = useTranslation();
  const router = useIonRouter();
  const { playSuccess } = useSound();

  const handleLogout = () => {
    router.push("/login", "root", "replace");
  };

  const questionBanks = QuizQuestionBanks;
  const currentUser = getUserData();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [animationPoints, setAnimationPoints] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [activeQuestions, setActiveQuestions] = useState(
    questionBanks.SocialStudies
  );
  const [selectedSubject, setSelectedSubject] = useState("SocialStudies");

  useEffect(() => {
    // Load subject from LS
    const sub = localStorage.getItem("selectedSubject");
    if (sub) {
      // Map "Math" -> Math, "Science" -> Science, etc.
      // Note: Main_Student uses keys like "Math", "Science", "SocialStudies", "Spanish"
      // We map them to our question banks
      let bankName: keyof typeof questionBanks = "SocialStudies";
      if (sub === "Math") bankName = "Math";
      else if (sub === "Science") bankName = "Science";
      else if (sub === "Spanish") bankName = "Spanish";
      else if (sub === "SocialStudies") bankName = "SocialStudies";

      setSelectedSubject(bankName);
      setActiveQuestions(questionBanks[bankName]);
    }
  }, []);

  const activeQuestionList = activeQuestions || questionBanks.SocialStudies;

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return;

    const endTime = Date.now();
    const timeTaken = (endTime - startTime) / 1000;
    const isCorrect =
      answerIndex === activeQuestionList[currentQuestion].correctAnswer;

    setSelectedAnswer(answerIndex);
    setIsAnswered(true);

    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
    }

    let pointsEarned = 0;
    if (isCorrect) {
      if (timeTaken < 5) pointsEarned = 150;
      else if (timeTaken < 10) pointsEarned = 125;
      else if (timeTaken < 15) pointsEarned = 110;
      else pointsEarned = 100;

      setAnimationPoints(pointsEarned);
      setShowPointsAnimation(true);

      setTimeout(() => {
        setScore((prev) => prev + pointsEarned);
      }, 500);
    } else {
      setScore((prev) => Math.max(0, prev - 25));
    }

    // Move to next or finish
    setTimeout(() => {
      if (currentQuestion < activeQuestionList.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setStartTime(Date.now());
        setShowPointsAnimation(false);
      } else {
        // End of Quiz
        setTimeout(() => {
          setShowResults(true);
          playSuccess();
          triggerConfetti();
        }, 1000);
      }
    }, 2000);
  };

  const getButtonColor = (index: number) => {
    if (!isAnswered) return "";
    if (index === activeQuestionList[currentQuestion].correctAnswer)
      return "correct";
    if (
      index === selectedAnswer &&
      index !== activeQuestionList[currentQuestion].correctAnswer
    )
      return "incorrect";
    return "";
  };

  const getQuestionText = () => {
    return activeQuestionList[currentQuestion].question.replace(
      "{name}",
      currentUser.name
    );
  };

  const getScoreRating = () => {
    const percentage = (correctAnswers / activeQuestionList.length) * 100;
    if (percentage >= 90)
      return { text: t("quiz.rating.perfect"), color: "#4CAF50" };
    if (percentage >= 80)
      return { text: t("quiz.rating.awesome"), color: "#2196F3" };
    if (percentage >= 70)
      return { text: t("quiz.rating.veryGood"), color: "#FF9800" };
    if (percentage >= 60)
      return { text: t("quiz.rating.goodJob"), color: "#9C27B0" };
    return { text: t("quiz.rating.keepPracticing"), color: "#F44336" };
  };

  const calculatePerformancePercentage = () => {
    return Math.round((correctAnswers / activeQuestionList.length) * 100);
  };

  const getRingChartColor = (percentage: number) => {
    if (percentage >= 80) return "#4CAF50";
    if (percentage >= 70) return "#2196F3";
    if (percentage >= 60) return "#FF9800";
    return "#F44336";
  };

  const handleBackToMenu = () => {
    router.push("/page/student", "back", "pop");
  };

  return (
    <IonPage>
      <StudentHeader pageTitle="quiz.title" showNotch={false} />

      <StudentSidebar onLogout={handleLogout} />

      <IonContent fullscreen className="quiz-content">
        <PageTransition variant="fade">
          <div className="quiz-container">
            <div
              className="quiz-stats-bar"
              style={{
                backgroundColor: "var(--ion-card-background)",
                borderColor: "var(--ion-color-primary)",
              }}
            >
              <div className="stat-box">
                <div className="stat-number">
                  {currentQuestion + 1}/{activeQuestionList.length}
                </div>
                <div className="stat-label">{t("quiz.questions")}</div>
              </div>
              <div className="stat-box">
                <div className="stat-number">{score} pts</div>
                <div className="stat-label">{t("quiz.points")}</div>
              </div>
              <div className="stat-box">
                <div className="stat-number">1ro</div>
                <div className="stat-label">{t("quiz.place")}</div>
              </div>
            </div>

            <div className="image-section">
              <img
                src="/assets/capybara_sprite_normal.png"
                alt="ArenAI Capybara"
                className="quiz-image"
              />
              <div className="character-name-hexagon">
                <IonText>
                  <p className="character-name">Aren</p>
                </IonText>
              </div>
            </div>

            <div className="question-section">
              <div className="question-card">
                <IonText>
                  <h2 className="question-title">{getQuestionText()}</h2>
                </IonText>
              </div>
            </div>

            <div className="options-section">
              <IonGrid>
                <IonRow>
                  {activeQuestionList[currentQuestion].options.map(
                    (option, index) => (
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
                    )
                  )}
                </IonRow>
              </IonGrid>
            </div>

            {/* Points Animation */}
            {showPointsAnimation && (
              <div className="points-animation">+{animationPoints} pts!</div>
            )}
          </div>
        </PageTransition>

        {/* Results Modal */}
        <IonModal isOpen={showResults} className="results-modal">
          <div className="results-container">
            <IonCard className="results-card">
              <IonCardContent>
                {/* Score Rating */}
                <div className="score-rating-section">
                  <IonText>
                    <h2
                      className="score-rating"
                      style={{ color: getScoreRating().color }}
                    >
                      {getScoreRating().text}
                    </h2>
                  </IonText>
                  <IonText>
                    <p className="congratulations-text">
                      {t("quiz.congrats", {
                        name: currentUser.name,
                        score: score,
                      })}
                    </p>
                  </IonText>
                </div>

                {/* Performance Ring */}
                <div className="performance-section">
                  <div className="circle-wrapper">
                    <div
                      className="performance-ring-chart"
                      style={
                        {
                          "--percentage": `${calculatePerformancePercentage()}%`,
                          "--ring-color": getRingChartColor(
                            calculatePerformancePercentage()
                          ),
                        } as React.CSSProperties
                      }
                    >
                      <div className="ring-center">
                        <IonText>
                          <h2 className="performance-percentage">
                            {calculatePerformancePercentage()}%
                          </h2>
                        </IonText>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Topics to Reinforce */}
                <div className="topics-section">
                  <IonText>
                    <h3 className="topics-title">
                      {t("quiz.topicsToReinforce")}
                    </h3>
                  </IonText>
                  <div className="topics-grid">
                    <div className="topic-item">
                      <IonText>
                        <p className="topic-name">{selectedSubject}</p>
                      </IonText>
                    </div>
                  </div>
                </div>

                {/* Back to Menu Button */}
                <div className="action-section">
                  <IonButton
                    expand="block"
                    className="menu-button-primary"
                    onClick={handleBackToMenu}
                  >
                    <IonIcon icon={arrowForward} slot="end" />
                    {t("quiz.backToMenu")}
                  </IonButton>
                </div>
              </IonCardContent>
            </IonCard>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Quiz;
