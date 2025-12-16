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

  // 15 Questions per Subject for 7th Grade Costa Rica
  const questionBanks = {
    SocialStudies: [
      {
        id: 1,
        question:
          "Oye {name}, ¿en qué año se abolió el ejército en Costa Rica?",
        options: ["A. 1948", "B. 1821", "C. 1856", "D. 1921"],
        correctAnswer: 0,
      },
      {
        id: 2,
        question: "{name}, ¿cuál es la flor nacional?",
        options: ["A. Guaria Morada", "B. Rosa", "C. Girasol", "D. Margarita"],
        correctAnswer: 0,
      },
      {
        id: 3,
        question: "{name}, ¿quién quemó el Mesón de Guerra?",
        options: [
          "A. Juan Santamaría",
          "B. Juan Mora Porras",
          "C. Pancha Carrasco",
          "D. José María Castro",
        ],
        correctAnswer: 0,
      },
      {
        id: 4,
        question: "{name}, ¿dónde está el Parque Nacional Manuel Antonio?",
        options: ["A. Puntarenas", "B. Guanacaste", "C. Limón", "D. San José"],
        correctAnswer: 0,
      },
      {
        id: 5,
        question: "{name}, ¿cuál es el volcán más alto?",
        options: ["A. Irazú", "B. Arenal", "C. Poás", "D. Turrialba"],
        correctAnswer: 0,
      },
      {
        id: 6,
        question: "{name}, ¿cuándo es la independencia?",
        options: [
          "A. 15 Septiembre",
          "B. 11 Abril",
          "C. 25 Julio",
          "D. 12 Octubre",
        ],
        correctAnswer: 0,
      },
      {
        id: 7,
        question: "{name}, ¿dónde está el Teatro Nacional?",
        options: ["A. San José", "B. Cartago", "C. Heredia", "D. Alajuela"],
        correctAnswer: 0,
      },
      {
        id: 8,
        question: "{name}, ¿cuándo se fundó la UCR?",
        options: ["A. 1940", "B. 1950", "C. 1930", "D. 1960"],
        correctAnswer: 0,
      },
      {
        id: 9,
        question: "{name}, ¿quién ganó el Nobel de la Paz?",
        options: [
          "A. José Figueres",
          "B. Óscar Arias",
          "C. Luis Alberto Monge",
          "D. Calderón Guardia",
        ],
        correctAnswer: 1,
      },
      {
        id: 10,
        question: "{name}, ¿año de la Constitución actual?",
        options: ["A. 1949", "B. 1950", "C. 1821", "D. 1871"],
        correctAnswer: 0,
      },
      {
        id: 11,
        question: "{name}, ¿cultivo base del siglo XIX?",
        options: ["A. Banano", "B. Café", "C. Azúcar", "D. Cacao"],
        correctAnswer: 1,
      },
      {
        id: 12,
        question: "{name}, ¿primera mujer presidenta?",
        options: [
          "A. Laura Chinchilla",
          "B. Mireya Moscoso",
          "C. Violeta Chamorro",
          "D. María Teresa",
        ],
        correctAnswer: 0,
      },
      {
        id: 13,
        question: "{name}, ¿año de Garantías Sociales?",
        options: ["A. 1940", "B. 1950", "C. 1960", "D. 1970"],
        correctAnswer: 0,
      },
      {
        id: 14,
        question: "{name}, ¿tratado limítrofe con Nicaragua?",
        options: [
          "A. Cañas-Jerez",
          "B. Tratado París",
          "C. Versalles",
          "D. Tordesillas",
        ],
        correctAnswer: 0,
      },
      {
        id: 15,
        question: "{name}, ¿año de neutralidad perpetua?",
        options: ["A. 1983", "B. 1975", "C. 1990", "D. 2000"],
        correctAnswer: 0,
      },
    ],
    Math: [
      {
        id: 1,
        question: "Oye {name}, ¿cuánto es 15 + 27?",
        options: ["A. 42", "B. 32", "C. 52", "D. 45"],
        correctAnswer: 0,
      },
      {
        id: 2,
        question: "{name}, ¿cuál es la raíz cuadrada de 144?",
        options: ["A. 10", "B. 11", "C. 12", "D. 13"],
        correctAnswer: 2,
      },
      {
        id: 3,
        question: "{name}, simplifica: 3x + 2x - x",
        options: ["A. 4x", "B. 5x", "C. 2x", "D. 3x"],
        correctAnswer: 0,
      },
      {
        id: 4,
        question: "{name}, ¿cuánto es 8 x 7?",
        options: ["A. 54", "B. 56", "C. 58", "D. 64"],
        correctAnswer: 1,
      },
      {
        id: 5,
        question: "{name}, convierte 0.5 a fracción",
        options: ["A. 1/3", "B. 1/2", "C. 1/4", "D. 2/3"],
        correctAnswer: 1,
      },
      {
        id: 6,
        question: "{name}, ¿cuál es el perímetro de un cuadrado de lado 5?",
        options: ["A. 15", "B. 20", "C. 25", "D. 10"],
        correctAnswer: 1,
      },
      {
        id: 7,
        question: "{name}, resuelve: 2(3 + 4)",
        options: ["A. 10", "B. 12", "C. 14", "D. 16"],
        correctAnswer: 2,
      },
      {
        id: 8,
        question: "{name}, ¿cuánto es el 10% de 200?",
        options: ["A. 10", "B. 20", "C. 30", "D. 40"],
        correctAnswer: 1,
      },
      {
        id: 9,
        question: "{name}, ¿cuántos grados tiene un ángulo recto?",
        options: ["A. 60", "B. 90", "C. 180", "D. 45"],
        correctAnswer: 1,
      },
      {
        id: 10,
        question: "{name}, ¿cuál es el siguiente número primo después de 7?",
        options: ["A. 9", "B. 10", "C. 11", "D. 13"],
        correctAnswer: 2,
      },
      {
        id: 11,
        question: "{name}, resuelve: 5²",
        options: ["A. 10", "B. 15", "C. 20", "D. 25"],
        correctAnswer: 3,
      },
      {
        id: 12,
        question: "{name}, ¿cuántos lados tiene un hexágono?",
        options: ["A. 5", "B. 6", "C. 7", "D. 8"],
        correctAnswer: 1,
      },
      {
        id: 13,
        question: "{name}, 100 dividido por 4 es...",
        options: ["A. 20", "B. 25", "C. 24", "D. 30"],
        correctAnswer: 1,
      },
      {
        id: 14,
        question: "{name}, el valor de Pi es aprox...",
        options: ["A. 3.12", "B. 3.14", "C. 3.16", "D. 3.18"],
        correctAnswer: 1,
      },
      {
        id: 15,
        question: "{name}, 35 - 17 es...",
        options: ["A. 18", "B. 17", "C. 19", "D. 20"],
        correctAnswer: 0,
      },
    ],
    Science: [
      {
        id: 1,
        question: "{name}, ¿cuál es el planeta rojo?",
        options: ["A. Venus", "B. Marte", "C. Júpiter", "D. Saturno"],
        correctAnswer: 1,
      },
      {
        id: 2,
        question: "{name}, ¿qué gas respiramos?",
        options: ["A. Nitrógeno", "B. Oxígeno", "C. Helio", "D. Carbono"],
        correctAnswer: 1,
      },
      {
        id: 3,
        question:
          "{name}, ¿cuál es el órgano principal del sistema circulatorio?",
        options: ["A. Pulmón", "B. Cerebro", "C. Corazón", "D. Hígado"],
        correctAnswer: 2,
      },
      {
        id: 4,
        question: "{name}, ¿fórmula del agua?",
        options: ["A. CO2", "B. H2O", "C. O2", "D. NaCl"],
        correctAnswer: 1,
      },
      {
        id: 5,
        question: "{name}, ¿animal que produce leche?",
        options: ["A. Mamífero", "B. Reptil", "C. Anfibio", "D. Ave"],
        correctAnswer: 0,
      },
      {
        id: 6,
        question: "{name}, ¿centro del sistema solar?",
        options: ["A. Tierra", "B. Luna", "C. Sol", "D. Júpiter"],
        correctAnswer: 2,
      },
      {
        id: 7,
        question: "{name}, ¿qué parte de la planta hace fotosíntesis?",
        options: ["A. Raíz", "B. Tallo", "C. Hoja", "D. Flor"],
        correctAnswer: 2,
      },
      {
        id: 8,
        question: "{name}, ¿estado sólido del agua?",
        options: ["A. Vapor", "B. Hielo", "C. Líquido", "D. Nube"],
        correctAnswer: 1,
      },
      {
        id: 9,
        question: "{name}, ¿animal más rápido?",
        options: ["A. León", "B. Guepardo", "C. Águila", "D. Caballo"],
        correctAnswer: 1,
      },
      {
        id: 10,
        question: "{name}, ¿satélite natural de la Tierra?",
        options: ["A. Sol", "B. Marte", "C. Luna", "D. Venus"],
        correctAnswer: 2,
      },
      {
        id: 11,
        question: "{name}, ¿símbolo del Carbono?",
        options: ["A. Ca", "B. C", "C. Co", "D. Cr"],
        correctAnswer: 1,
      },
      {
        id: 12,
        question: "{name}, ¿fuerza que nos mantiene en el suelo?",
        options: ["A. Magnetismo", "B. Gravedad", "C. Fricción", "D. Tensión"],
        correctAnswer: 1,
      },
      {
        id: 13,
        question: "{name}, ¿qué comen los herbívoros?",
        options: ["A. Carne", "B. Insectos", "C. Plantas", "D. Todo"],
        correctAnswer: 2,
      },
      {
        id: 14,
        question: "{name}, ¿cuántos huesos tiene el humano adulto?",
        options: ["A. 206", "B. 200", "C. 300", "D. 150"],
        correctAnswer: 0,
      },
      {
        id: 15,
        question: "{name}, ¿planeta más grande?",
        options: ["A. Tierra", "B. Saturno", "C. Júpiter", "D. Urano"],
        correctAnswer: 2,
      },
    ],
    Spanish: [
      {
        id: 1,
        question: "{name}, sinónimo de 'feliz'",
        options: ["A. Triste", "B. Contento", "C. Enojado", "D. Cansado"],
        correctAnswer: 1,
      },
      {
        id: 2,
        question: "{name}, antónimo de 'grande'",
        options: ["A. Enorme", "B. Pequeño", "C. Alto", "D. Gigante"],
        correctAnswer: 1,
      },
      {
        id: 3,
        question: "{name}, ¿Qué es un verbo?",
        options: ["A. Acción", "B. Cualidad", "C. Nombre", "D. Lugar"],
        correctAnswer: 0,
      },
      {
        id: 4,
        question: "{name}, autor de Don Quijote",
        options: [
          "A. Lope de Vega",
          "B. Cervantes",
          "C. Góngora",
          "D. Quevedo",
        ],
        correctAnswer: 1,
      },
      {
        id: 5,
        question: "{name}, plural de 'lápiz'",
        options: ["A. Lápizes", "B. Lápices", "C. Lápizs", "D. Lapiceros"],
        correctAnswer: 1,
      },
      {
        id: 6,
        question: "{name}, ¿qué es una metáfora?",
        options: [
          "A. Comparación directa",
          "B. Exageración",
          "C. Comparación indirecta",
          "D. Sonido",
        ],
        correctAnswer: 2,
      },
      {
        id: 7,
        question: "{name}, sílaba tónica de 'camión'",
        options: ["A. ca", "B. mión", "C. cam", "D. ión"],
        correctAnswer: 1,
      },
      {
        id: 8,
        question: "{name}, 'Correr' es un verbo en...",
        options: ["A. Pasado", "B. Infinitivo", "C. Futuro", "D. Gerundio"],
        correctAnswer: 1,
      },
      {
        id: 9,
        question: "{name}, ¿qué tipo de palabra es 'rápido'?",
        options: ["A. Sustantivo", "B. Adjetivo", "C. Verbo", "D. Adverbio"],
        correctAnswer: 1,
      }, // Can be adj or adv usage dependent, usually adj
      {
        id: 10,
        question: "{name}, ¿cuántas sílabas tiene 'aéreo'?",
        options: ["A. 2", "B. 3", "C. 4", "D. 5"],
        correctAnswer: 2,
      },
      {
        id: 11,
        question: "{name}, género lírico expresa...",
        options: [
          "A. Historias",
          "B. Sentimientos",
          "C. Diálogos",
          "D. Noticias",
        ],
        correctAnswer: 1,
      },
      {
        id: 12,
        question: "{name}, antónimo de 'claro'",
        options: ["A. Oscuro", "B. Blanco", "C. Transparente", "D. Brillante"],
        correctAnswer: 0,
      },
      {
        id: 13,
        question: "{name}, autor de 'Cocorí'",
        options: [
          "A. Carmen Lyra",
          "B. Joaquín Gutiérrez",
          "C. Carlos Luis Fallas",
          "D. Fabián Dobles",
        ],
        correctAnswer: 1,
      },
      {
        id: 14,
        question: "{name}, ¿qué es un sustantivo propio?",
        options: ["A. mesa", "B. Costa Rica", "C. perro", "D. ciudad"],
        correctAnswer: 1,
      },
      {
        id: 15,
        question: "{name}, novela de Carlos Luis Fallas",
        options: [
          "A. Mamita Yunai",
          "B. Única mirando al mar",
          "C. El Moto",
          "D. Murámonos Federico",
        ],
        correctAnswer: 0,
      },
    ],
  };

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
