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

const Quiz: React.FC = () => {
  const { t } = useTranslation();
  const router = useIonRouter();
  const { playSuccess } = useSound();

  const handleLogout = () => {
    router.push("/login", "root", "replace");
  };

  // Mock data for the quiz
  const questions = [
    {
      id: 1,
      question:
        "Oye {name}, ¿sabes en qué año nuestro país tomó la valiente decisión de abolir el ejército?",
      options: ["A. 1948", "B. 1821", "C. 1856", "D. 1921"],
      correctAnswer: 0,
    },
    {
      id: 2,
      question:
        "{name}, ¿recuerdas cuál es nuestra flor nacional, esa orquídea morada tan linda?",
      options: [
        "A. La Guaria Morada",
        "B. La Rosa",
        "C. El Girasol",
        "D. La Margarita",
      ],
      correctAnswer: 0,
    },
    {
      id: 3,
      question:
        "{name}, ¿sabes quién es nuestro Héroe Nacional que quemó el Mesón de Guerra?",
      options: [
        "A. Juan Santamaría",
        "B. Juan Mora Porras",
        "C. Pancha Carrasco",
        "D. José María Castro Madriz",
      ],
      correctAnswer: 0,
    },
    {
      id: 4,
      question:
        "Oye {name}, ¿en qué provincia se encuentra el Parque Nacional Manuel Antonio?",
      options: ["A. Puntarenas", "B. Guanacaste", "C. Limón", "D. San José"],
      correctAnswer: 0,
    },
    {
      id: 5,
      question: "{name}, ¿cuál es el volcán más alto de Costa Rica?",
      options: [
        "A. Volcán Irazú",
        "B. Volcán Arenal",
        "C. Volcán Poás",
        "D. Volcán Turrialba",
      ],
      correctAnswer: 0,
    },
    {
      id: 6,
      question: "{name}, ¿qué día celebramos nuestra independencia?",
      options: [
        "A. 15 de septiembre",
        "B. 11 de abril",
        "C. 25 de julio",
        "D. 12 de octubre",
      ],
      correctAnswer: 0,
    },
    {
      id: 7,
      question: "Oye {name}, ¿dónde se encuentra el Teatro Nacional?",
      options: ["A. San José", "B. Cartago", "C. Heredia", "D. Alajuela"],
      correctAnswer: 0,
    },
    {
      id: 8,
      question:
        "{name}, ¿en qué año se fundó nuestra querida Universidad de Costa Rica?",
      options: ["A. 1940", "B. 1950", "C. 1930", "D. 1960"],
      correctAnswer: 0,
    },
    {
      id: 9,
      question:
        "{name}, ¿sabes qué presidente tico ganó el Premio Nobel de la Paz?",
      options: [
        "A. José Figueres Ferrer",
        "B. Óscar Arias Sánchez",
        "C. Luis Alberto Monge",
        "D. Rafael Ángel Calderón Guardia",
      ],
      correctAnswer: 1,
    },
    {
      id: 10,
      question:
        "Oye {name}, ¿en qué año se firmó nuestra Constitución Política actual?",
      options: ["A. 1949", "B. 1950", "C. 1821", "D. 1871"],
      correctAnswer: 0,
    },
    {
      id: 11,
      question:
        "{name}, ¿sabes qué producto fue la base de nuestra economía en el siglo XIX?",
      options: ["A. Banano", "B. Café", "C. Azúcar", "D. Cacao"],
      correctAnswer: 1,
    },
    {
      id: 12,
      question:
        "{name}, ¿recuerdas cómo se llamó la primera mujer en ser presidenta de nuestro país?",
      options: [
        "A. Laura Chinchilla",
        "B. Mireya Moscoso",
        "C. Violeta Chamorro",
        "D. María Teresa Obregón",
      ],
      correctAnswer: 0,
    },
    {
      id: 13,
      question:
        "Oye {name}, ¿en qué año se estableció la garantía social aquí en Costa Rica?",
      options: ["A. 1940", "B. 1950", "C. 1960", "D. 1970"],
      correctAnswer: 0,
    },
    {
      id: 14,
      question:
        "{name}, ¿sabes qué tratado define nuestras fronteras con Nicaragua?",
      options: [
        "A. Tratado Cañas-Jerez",
        "B. Tratado de París",
        "C. Tratado de Versalles",
        "D. Tratado de Tordesillas",
      ],
      correctAnswer: 0,
    },
    {
      id: 15,
      question:
        "{name}, ¿en qué año Costa Rica declaró su neutralidad perpetua?",
      options: ["A. 1983", "B. 1975", "C. 1990", "D. 2000"],
      correctAnswer: 0,
    },
  ];

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

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return;

    const endTime = Date.now();
    const timeTaken = (endTime - startTime) / 1000; // Time in seconds
    const isCorrect = answerIndex === questions[currentQuestion].correctAnswer;

    setSelectedAnswer(answerIndex);
    setIsAnswered(true);

    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
    }

    // Calculate time bonus (faster = more points)
    let pointsEarned = 0;
    if (isCorrect) {
      if (timeTaken < 5) pointsEarned = 150;
      else if (timeTaken < 10) pointsEarned = 125;
      else if (timeTaken < 15) pointsEarned = 110;
      else pointsEarned = 100;

      // Show points animation
      setAnimationPoints(pointsEarned);
      setShowPointsAnimation(true);

      // Update score after animation starts
      setTimeout(() => {
        setScore((prev) => prev + pointsEarned);
      }, 500);
    } else {
      // Small penalty for wrong answers
      setScore((prev) => Math.max(0, prev - 25));
    }

    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        // Quiz completed - show results
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

  const getQuestionText = () => {
    return questions[currentQuestion].question.replace(
      "{name}",
      currentUser.name
    );
  };

  const getScoreRating = () => {
    const percentage = (correctAnswers / questions.length) * 100;
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
    return Math.round((correctAnswers / questions.length) * 100);
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
                <div className="stat-number">{currentQuestion + 1}/15</div>
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
                        <p className="topic-name">
                          Independencia de Costa Rica
                        </p>
                      </IonText>
                    </div>
                    <div className="topic-item">
                      <IonText>
                        <p className="topic-name">
                          Guerra contra los Filibusteros
                        </p>
                      </IonText>
                    </div>
                    <div className="topic-item">
                      <IonText>
                        <p className="topic-name">Segunda República</p>
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
