import React, { useState, useEffect } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useIonRouter } from '@ionic/react';
import StudentHeader from '../components/StudentHeader';
import './PersonalityQuiz.css';
import questionsData from '../locales/PersonalityQuestions.json';

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

// 13 Learning Types based on educational psychology
const learningTypes: { [key: string]: QuizResult } = {
    visual: {
        type: "Aprendizaje Visual",
        title: "¡Eres un Aprendiz Visual! 👁️",
        description: "Aprendes mejor a través de imágenes, gráficos, videos y presentaciones visuales. Tienes una excelente memoria visual y prefieres ver la información.",
        traits: [
            "Memoria visual excepcional",
            "Prefieres diagramas y gráficos",
            "Piensas en imágenes",
            "Entiendes mejor con mapas mentales"
        ],
        recommendations: [
            "Usa mapas mentales y diagramas",
            "Ve videos educativos",
            "Usa colores para organizar notas",
            "Crea infografías propias"
        ]
    },
    auditory: {
        type: "Aprendizaje Auditivo",
        title: "¡Eres un Aprendiz Auditivo! 👂",
        description: "Aprendes mejor escuchando. Las explicaciones verbales, discusiones y podcasts son tu fuerte. Recuerdas mejor lo que escuchas.",
        traits: [
            "Aprendes escuchando",
            "Disfrutas las discusiones",
            "Recuerdas conversaciones fácilmente",
            "Prefieres explicaciones verbales"
        ],
        recommendations: [
            "Escucha podcasts educativos",
            "Graba tus clases",
            "Lee en voz alta",
            "Participa en debates y discusiones"
        ]
    },
    kinesthetic: {
        type: "Aprendizaje Kinestésico",
        title: "¡Eres un Aprendiz Kinestésico! 🤸",
        description: "Aprendes mejor haciendo y tocando. Necesitas movimiento, experimentos prácticos y actividades físicas para aprender efectivamente.",
        traits: [
            "Aprendes haciendo",
            "Necesitas movimiento",
            "Disfrutas experimentos",
            "Bueno construyendo cosas"
        ],
        recommendations: [
            "Haz experimentos prácticos",
            "Usa modelos físicos",
            "Toma descansos activos",
            "Relaciona conceptos con movimientos"
        ]
    },
    reading: {
        type: "Aprendizaje Lector/Escritor",
        title: "¡Eres un Aprendiz Lector/Escritor! 📚",
        description: "Aprendes mejor leyendo y escribiendo. Los libros, artículos y tomar notas son esenciales para tu proceso de aprendizaje.",
        traits: [
            "Amas leer y escribir",
            "Tomas notas detalladas",
            "Aprendes escribiendo",
            "Prefieres textos estructurados"
        ],
        recommendations: [
            "Lee libros y artículos",
            "Escribe resúmenes",
            "Crea listas y esquemas",
            "Mantén un diario de aprendizaje"
        ]
    },
    logical: {
        type: "Aprendizaje Lógico-Matemático",
        title: "¡Eres un Aprendiz Lógico! 🧮",
        description: "Aprendes mejor con razonamiento lógico, patrones y estructuras. Te gustan las matemáticas, los problemas y el análisis sistemático.",
        traits: [
            "Excelente en lógica y matemáticas",
            "Reconoces patrones fácilmente",
            "Piensas de forma estructurada",
            "Disfrutas resolver problemas"
        ],
        recommendations: [
            "Usa diagramas de flujo",
            "Resuelve acertijos lógicos",
            "Organiza información en tablas",
            "Busca patrones en los datos"
        ]
    },
    interpersonal: {
        type: "Aprendizaje Interpersonal",
        title: "¡Eres un Aprendiz Interpersonal! 🤝",
        description: "Aprendes mejor interactuando con otros. Los grupos, discusiones y el trabajo colaborativo potencian tu aprendizaje.",
        traits: [
            "Excelente en grupos",
            "Entiendes a las personas",
            "Disfrutas colaborar",
            "Bueno comunicándote"
        ],
        recommendations: [
            "Forma grupos de estudio",
            "Enseña a otros",
            "Participa en proyectos grupales",
            "Usa debates para aprender"
        ]
    },
    intrapersonal: {
        type: "Aprendizaje Intrapersonal",
        title: "¡Eres un Aprendiz Intrapersonal! 🧘",
        description: "Aprendes mejor solo, mediante autorreflexión. Necesitas tiempo para procesar internamente y conectar con tus propios pensamientos.",
        traits: [
            "Prefieres estudiar solo",
            "Reflexivo y autoconsciente",
            "Aprendes a tu ritmo",
            "Valoras tu independencia"
        ],
        recommendations: [
            "Estudia en ambientes tranquilos",
            "Reflexiona sobre lo aprendido",
            "Lleva un diario personal",
            "Establece metas propias"
        ]
    },
    collaborative: {
        type: "Aprendizaje Colaborativo",
        title: "¡Eres un Aprendiz Colaborativo! 👥",
        description: "Aprendes mejor trabajando en equipo. El intercambio de ideas y el apoyo mutuo son fundamentales para tu éxito académico.",
        traits: [
            "Excelente trabajando en equipo",
            "Compartes conocimientos",
            "Apoyas a tus compañeros",
            "Aprendes enseñando"
        ],
        recommendations: [
            "Únete a grupos de estudio",
            "Crea proyectos en equipo",
            "Usa plataformas colaborativas",
            "Organiza sesiones de tutoría"
        ]
    },
    discovery: {
        type: "Aprendizaje por Descubrimiento",
        title: "¡Eres un Aprendiz por Descubrimiento! 🔍",
        description: "Aprendes mejor explorando y descubriendo por ti mismo. La curiosidad y la experimentación son tus mejores herramientas.",
        traits: [
            "Muy curioso e inquisitivo",
            "Aprendes experimentando",
            "Disfrutas investigar",
            "Autónomo en tu aprendizaje"
        ],
        recommendations: [
            "Realiza proyectos de investigación",
            "Experimenta libremente",
            "Haz preguntas constantemente",
            "Explora temas por tu cuenta"
        ]
    },
    online: {
        type: "Aprendizaje Digital",
        title: "¡Eres un Aprendiz Digital! 💻",
        description: "Aprendes mejor usando tecnología y recursos en línea. Las plataformas digitales, apps y cursos online son ideales para ti.",
        traits: [
            "Te adaptas bien a la tecnología",
            "Prefieres recursos digitales",
            "Aprendes con apps y plataformas",
            "Autodidacta en línea"
        ],
        recommendations: [
            "Usa cursos online (Coursera, Khan Academy)",
            "Prueba apps educativas",
            "Ve tutoriales en YouTube",
            "Únete a comunidades virtuales"
        ]
    },
    naturalist: {
        type: "Aprendizaje Naturalista",
        title: "¡Eres un Aprendiz Naturalista! 🌿",
        description: "Aprendes mejor conectándote con la naturaleza. Clasificar, observar y comprender el mundo natural te ayuda a aprender.",
        traits: [
            "Conexión con la naturaleza",
            "Observador del entorno",
            "Bueno clasificando",
            "Aprecias el mundo natural"
        ],
        recommendations: [
            "Estudia al aire libre",
            "Observa patrones naturales",
            "Usa ejemplos de la naturaleza",
            "Visita museos de ciencias naturales"
        ]
    },
    creative: {
        type: "Aprendizaje Creativo",
        title: "¡Eres un Aprendiz Creativo! 🎨",
        description: "Aprendes mejor a través de la creatividad y la innovación. El arte, la música y los proyectos originales potencian tu aprendizaje.",
        traits: [
            "Muy creativo e imaginativo",
            "Piensas de forma original",
            "Disfrutas proyectos artísticos",
            "Innovador en tus soluciones"
        ],
        recommendations: [
            "Usa proyectos creativos",
            "Dibuja y visualiza conceptos",
            "Crea presentaciones originales",
            "Relaciona temas con arte"
        ]
    },
    multimodal: {
        type: "Aprendizaje Multimodal",
        title: "¡Eres un Aprendiz Multimodal! 🌟",
        description: "Aprendes mejor combinando múltiples métodos. Eres flexible y te adaptas usando diferentes estilos según la situación.",
        traits: [
            "Flexible en tus métodos",
            "Combinas diferentes estilos",
            "Te adaptas fácilmente",
            "Aprendes de múltiples formas"
        ],
        recommendations: [
            "Combina lectura, videos y práctica",
            "Experimenta con diferentes métodos",
            "Adapta tu estilo según el tema",
            "Usa recursos variados"
        ]
    }
};

const PersonalityQuiz: React.FC = () => {
    const router = useIonRouter();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [savedResultType, setSavedResultType] = useState<string | null>(null);

    const questions = questionsData as QuizQuestion[];
    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;
    const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;

    useEffect(() => {
        const saved = localStorage.getItem('personalityQuizResult');
        if (saved && learningTypes[saved]) {
            setSavedResultType(saved);
            setShowResults(true);
        }
    }, []);

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
        if (savedResultType) {
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

    if (showResults) {
        const result = getResult();

        return (
            <IonPage>
                <StudentHeader pageTitle="quiz.title" showNotch={false} />
                <IonContent fullscreen>
                    <div className="quiz-container">
                        <div className="results-card">
                            <div className="results-content">
                                <div className="results-icon">✨</div>
                                <h2 className="results-title">{result.title}</h2>
                                <p className="results-description">{result.description}</p>

                                <div className="traits-container">
                                    <h3 className="traits-title">Tus Características:</h3>
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
                                    <h3 className="traits-title">Recomendaciones para Ti:</h3>
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
                                    Volver a Hacer el Quiz
                                </button>

                                <button className="exit-button" onClick={() => router.push('/page/student', 'back')}>
                                    Salir al Menú Principal
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
            <StudentHeader pageTitle="quiz.title" showNotch={false} />
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
                                        fill="rgba(91, 110, 126, 0.35)"
                                        stroke="rgba(91, 110, 126, 0.6)"
                                        strokeWidth="4"
                                    />
                                    {/* Progress circle */}
                                    <circle
                                        cx="60"
                                        cy="60"
                                        r="54"
                                        fill="none"
                                        stroke="#78B8B0"
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
                                    <span className="progress-label">Pregunta</span>
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
                                    ← Anterior
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
