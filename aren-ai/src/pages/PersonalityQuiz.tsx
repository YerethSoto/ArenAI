import React, { useState, useEffect, useRef } from "react";
import { IonPage, IonContent } from "@ionic/react";
import { useIonRouter } from "@ionic/react";
import { useTranslation } from "react-i18next";
import StudentHeader from "../components/StudentHeader";
import "./PersonalityQuiz.css";
import { useAvatar } from "../context/AvatarContext";
import AnimatedMascot from "../components/AnimatedMascot";

interface QuizQuestion {
  type: string;
  question: string;
  options: string[];
  hint: string;
  learningType: string[];
}

interface QuizResult {
  type: string;
  title: string;
  description: string;
  traits: string[];
  recommendations: string[];
}

const PersonalityQuiz: React.FC = () => {
  const router = useIonRouter();
  const { t, i18n } = useTranslation();
  const contentRef = useRef<HTMLIonContentElement>(null);

  // Avatar
  const { getAvatarAssets } = useAvatar();
  const avatarAssets = getAvatarAssets();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [savedResultType, setSavedResultType] = useState<string | null>(null);

  // Get questions and results from translations
  const questions = t("personalityQuiz.questions", {
    returnObjects: true,
  }) as QuizQuestion[];
  const learningTypes = t("personalityQuiz.results", {
    returnObjects: true,
  }) as { [key: string]: QuizResult };

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  // Calculate raw percentage
  const progressPercentage =
    ((currentQuestionIndex + 1) / totalQuestions) * 100;

  useEffect(() => {
    const saved = localStorage.getItem("personalityQuizResult");
    if (saved && learningTypes && learningTypes[saved]) {
      setSavedResultType(saved);
      setShowResults(true);
    } else if (saved && learningTypes && !learningTypes[saved]) {
      localStorage.removeItem("personalityQuizResult");
    }
  }, [learningTypes]);

  // Scroll to top when results are shown
  useEffect(() => {
    if (showResults && contentRef.current) {
      contentRef.current.scrollToTop(300);
    }
  }, [showResults]);

  const handleOptionSelect = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);

    if (currentQuestionIndex < totalQuestions - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }, 300);
    } else {
      setTimeout(() => {
        setShowResults(true);
      }, 300);
    }
  };

  const calculateResultType = (currentAnswers: number[]): string => {
    const typeCounts: { [key: string]: number } = {};

    currentAnswers.forEach((answerIndex, questionIndex) => {
      if (answerIndex !== undefined && questions[questionIndex]) {
        const learningType = questions[questionIndex].learningType[answerIndex];
        if (learningType) {
          typeCounts[learningType] = (typeCounts[learningType] || 0) + 1;
        }
      }
    });

    let dominantType = "significant";
    let maxCount = 0;

    Object.entries(typeCounts).forEach(([type, count]) => {
      if (count > maxCount && learningTypes[type]) {
        maxCount = count;
        dominantType = type;
      }
    });

    const totalAnswers = currentAnswers.filter((a) => a !== undefined).length;
    if (maxCount < totalAnswers * 0.25) {
      dominantType = "significant";
    }

    return dominantType;
  };

  useEffect(() => {
    if (showResults && !savedResultType && answers.length > 0) {
      const type = calculateResultType(answers);
      localStorage.setItem("personalityQuizResult", type);
    }
  }, [showResults, answers, savedResultType]);

  const getResult = (): QuizResult => {
    if (savedResultType && learningTypes[savedResultType]) {
      return learningTypes[savedResultType];
    }
    const type = calculateResultType(answers);

    if (learningTypes[type]) {
      return learningTypes[type];
    }
    return learningTypes.significant || Object.values(learningTypes)[0];
  };

  const restartQuiz = () => {
    localStorage.removeItem("personalityQuizResult");
    setSavedResultType(null);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setShowResults(false);
  };

  if (!questions || questions.length === 0 || !learningTypes) {
    return (
      <IonPage className="main-student-page">
        <StudentHeader pageTitle="personalityQuiz.title" showNotch={false} />
        <IonContent
          fullscreen
          ref={contentRef}
          className="main-student-content"
        >
          <div className="pq-container">
            <div className="pq-loading-container">
              <p>{t("personalityQuiz.loading")}</p>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (showResults) {
    const result = getResult();

    return (
      <IonPage className="main-student-page">
        <StudentHeader pageTitle="personalityQuiz.title" showNotch={false} />
        <IonContent
          fullscreen
          ref={contentRef}
          className="main-student-content"
        >
          <div className="pq-container results-mode">
            {/* Mascot Section */}
            <div className="pq-mascot-area">
              <div className="pq-mascot-wrapper">
                <AnimatedMascot
                  className="pq-mascot-img"
                  openSrc={avatarAssets.open}
                  closedSrc={avatarAssets.closed}
                  winkSrc={avatarAssets.wink}
                />
              </div>
            </div>

            {/* Results Card */}
            <div className="pq-results-card">
              <div className="pq-results-content">
                <h2 className="pq-results-title">{result.title}</h2>
                <p className="pq-results-description">{result.description}</p>

                <div className="pq-traits-container">
                  <h3 className="pq-traits-title">
                    {t("personalityQuiz.ui.yourTraits")}
                  </h3>
                  <ul className="pq-traits-list">
                    {result.traits.map((trait, index) => (
                      <li key={index} className="pq-trait-item">
                        <span className="pq-trait-bullet">✓</span>
                        {trait}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pq-traits-container pq-recommendations">
                  <h3 className="pq-traits-title">
                    {t("personalityQuiz.ui.recommendations")}
                  </h3>
                  <ul className="pq-traits-list">
                    {result.recommendations.map((rec, index) => (
                      <li key={index} className="pq-trait-item">
                        <span className="pq-trait-bullet">💡</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pq-actions-row">
                  <button className="pq-restart-button" onClick={restartQuiz}>
                    {t("personalityQuiz.ui.restart")}
                  </button>

                  <button
                    className="pq-exit-button"
                    onClick={() => router.push("/page/student", "back")}
                  >
                    {t("personalityQuiz.ui.exit")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage className="main-student-page">
      <StudentHeader pageTitle="personalityQuiz.title" showNotch={false} />
      <IonContent fullscreen ref={contentRef} className="main-student-content">
        <div className="pq-container">
          {/* Header / Intro Section (Like Main Student Pill) */}
          <div className="pq-header-section">
            <div className="pq-mascot-wrapper-small">
              <AnimatedMascot
                className="pq-mascot-img-small"
                openSrc={avatarAssets.open}
                closedSrc={avatarAssets.closed}
                winkSrc={avatarAssets.wink}
              />
            </div>

            {/* Progress Pill matches ms-intro-pill style */}
            <div className="pq-progress-pill">
              <span className="pq-progress-label">
                {t("personalityQuiz.ui.progress")}
              </span>
              <div className="pq-progress-track">
                <div
                  className="pq-progress-bar"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <span className="pq-progress-val">
                {currentQuestionIndex + 1}/{totalQuestions}
              </span>
            </div>
          </div>

          {/* Content Card (Like Bottom Section in Main Student) */}
          <div className="pq-question-card">
            <h2 className="pq-question-text">{currentQuestion.question}</h2>

            <div className="pq-options-list">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  className={`pq-option-btn ${
                    answers[currentQuestionIndex] === index ? "selected" : ""
                  }`}
                  onClick={() => handleOptionSelect(index)}
                >
                  <div className="pq-opt-circle">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="pq-opt-text">{option}</span>
                </button>
              ))}
            </div>

            {currentQuestion.hint && (
              <div className="pq-hint-box">
                <span className="hint-icon">💡</span> {currentQuestion.hint}
              </div>
            )}

            {currentQuestionIndex > 0 && (
              <button
                className="pq-nav-back"
                onClick={() =>
                  setCurrentQuestionIndex(currentQuestionIndex - 1)
                }
              >
                {t("personalityQuiz.ui.previous")}
              </button>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PersonalityQuiz;
