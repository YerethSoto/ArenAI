import React, { useState, useEffect } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useIonRouter } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import StudentHeader from '../components/StudentHeader';
import './PersonalityQuiz.css';

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
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [savedResultType, setSavedResultType] = useState<string | null>(null);

    // Get questions and results from translations
    const questions = t('personalityQuiz.questions', { returnObjects: true }) as QuizQuestion[];
    const learningTypes = t('personalityQuiz.results', { returnObjects: true }) as { [key: string]: QuizResult };

    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;
    const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;

    useEffect(() => {
        const saved = localStorage.getItem('personalityQuizResult');
        if (saved && learningTypes && learningTypes[saved]) {
            setSavedResultType(saved);
            setShowResults(true);
        }
    }, [learningTypes]);

    const handleOptionSelect = (optionIndex: number) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = optionIndex;
        setAnswers(newAnswers);

        // Move to next question or show results
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

        let dominantType = 'multimodal';
        let maxCount = 0;

        Object.entries(typeCounts).forEach(([type, count]) => {
            if (count > maxCount) {
                maxCount = count;
                dominantType = type;
            }
        });

        const totalAnswers = currentAnswers.filter(a => a !== undefined).length;
        if (maxCount < totalAnswers * 0.25) {
            dominantType = 'multimodal';
        }

        return dominantType;
    };

    useEffect(() => {
        if (showResults && !savedResultType && answers.length > 0) {
            const type = calculateResultType(answers);
            localStorage.setItem('personalityQuizResult', type);
        }
    }, [showResults, answers, savedResultType]);

    const getResult = (): QuizResult => {
        if (savedResultType && learningTypes[savedResultType]) {
            return learningTypes[savedResultType];
        }
        const type = calculateResultType(answers);
        return learningTypes[type] || learningTypes.multimodal;
    };

    const restartQuiz = () => {
        localStorage.removeItem('personalityQuizResult');
        setSavedResultType(null);
        setCurrentQuestionIndex(0);
        setAnswers([]);
        setShowResults(false);
    };

    if (!questions || questions.length === 0 || !learningTypes) {
        return (
            <IonPage>
                <StudentHeader pageTitle="personalityQuiz.title" showNotch={false} />
                <IonContent fullscreen>
                    <div className="quiz-container">
                        <div className="loading-container">
                            <p>{t('personalityQuiz.loading')}</p>
                        </div>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    if (showResults) {
        const result = getResult();

        return (
            <IonPage>
                <StudentHeader pageTitle="personalityQuiz.title" showNotch={false} />
                <IonContent fullscreen>
                    <div className="quiz-container">
                        <div className="results-card">
                            <div className="results-content">
                                <div className="results-icon">✨</div>
                                <h2 className="results-title">{result.title}</h2>
                                <p className="results-description">{result.description}</p>

                                <div className="traits-container">
                                    <h3 className="traits-title">{t('personalityQuiz.ui.yourTraits')}</h3>
                                    <ul className="traits-list">
                                        {result.traits.map((trait, index) => (
                                            <li key={index} className="trait-item">
                                                <span className="trait-bullet">✓</span>
                                                {trait}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="traits-container recommendations">
                                    <h3 className="traits-title">{t('personalityQuiz.ui.recommendations')}</h3>
                                    <ul className="traits-list">
                                        {result.recommendations.map((rec, index) => (
                                            <li key={index} className="trait-item">
                                                <span className="trait-bullet">💡</span>
                                                {rec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <button className="restart-button" onClick={restartQuiz}>
                                    {t('personalityQuiz.ui.restart')}
                                </button>

                                <button className="exit-button" onClick={() => router.push('/page/student', 'back')}>
                                    {t('personalityQuiz.ui.exit')}
                                </button>
                            </div>
                        </div>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            <StudentHeader pageTitle="personalityQuiz.title" showNotch={false} />
            <IonContent fullscreen>
                <div className="quiz-container">
                    <div className="question-card-container">
                        {/* Main Content */}
                        <main className="quiz-content">
                            {/* Progress Indicator with SVG */}
                            <div className="progress-circle">
                                <svg className="progress-svg" width="120" height="120" viewBox="0 0 120 120">
                                    {/* Background circle */}
                                    <circle
                                        cx="60"
                                        cy="60"
                                        r="54"
                                        fill="rgba(var(--ion-color-primary-rgb), 0.1)"
                                        stroke="rgba(var(--ion-color-primary-rgb), 0.2)"
                                        strokeWidth="4"
                                    />
                                    {/* Progress circle */}
                                    <circle
                                        cx="60"
                                        cy="60"
                                        r="54"
                                        fill="none"
                                        stroke="var(--ion-color-primary)"
                                        strokeWidth="5"
                                        strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 54}`}
                                        strokeDashoffset={`${2 * Math.PI * 54 * (1 - progressPercentage / 100)}`}
                                        transform="rotate(-90 60 60)"
                                        className="progress-stroke"
                                    />
                                </svg>
                                <div className="progress-text">
                                    <span className="progress-current">
                                        {currentQuestionIndex + 1}/{totalQuestions}
                                    </span>
                                    <span className="progress-label">{t('personalityQuiz.ui.progress')}</span>
                                </div>
                            </div>

                            {/* Question Visual Icon */}
                            <div className="question-visual-icon" style={{ fontSize: '48px', marginBottom: '16px', animation: 'bounce 2s infinite' }}>
                                {currentQuestionIndex % 5 === 0 ? '🤔' :
                                    currentQuestionIndex % 5 === 1 ? '💡' :
                                        currentQuestionIndex % 5 === 2 ? '✨' :
                                            currentQuestionIndex % 5 === 3 ? '🎯' : '🚀'}
                            </div>

                            {/* Question Text */}
                            <h2 className="question-text">{currentQuestion.question}</h2>

                            {/* Options */}
                            <div className="options-container">
                                {currentQuestion.options.map((option, index) => (
                                    <button
                                        key={index}
                                        className={`option-button ${answers[currentQuestionIndex] === index ? 'selected' : ''}`}
                                        onClick={() => handleOptionSelect(index)}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>

                            {/* Hint - optional display */}
                            {currentQuestion.hint && (
                                <p className="question-hint">💡 {currentQuestion.hint}</p>
                            )}

                            {/* Navigation */}
                            {currentQuestionIndex > 0 && (
                                <button
                                    className="nav-button prev-button"
                                    onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                                >
                                    {t('personalityQuiz.ui.previous')}
                                </button>
                            )}
                        </main>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default PersonalityQuiz;
