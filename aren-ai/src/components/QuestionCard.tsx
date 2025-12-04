import React from 'react';
import './QuestionCard.css';

interface QuestionCardProps {
    currentQuestion?: number;
    totalQuestions?: number;
    questionText?: string;
    options?: string[];
    onOptionSelect?: (option: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
    currentQuestion = 1,
    totalQuestions = 15,
    questionText = "What type of student are you?",
    options = ["A", "B", "C", "D"],
    onOptionSelect
}) => {
    return (
        <div className="question-card-container">
            {/* Header */}
            <header className="question-header">
                <button className="menu-button" aria-label="Menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                <h1 className="app-title">ArenAI</h1>
            </header>

            {/* Main Content */}
            <main className="question-content">
                {/* Progress Indicator */}
                <div className="progress-circle">
                    <div className="progress-text">
                        <span className="progress-current">{currentQuestion}/{totalQuestions}</span>
                        <span className="progress-label">Question</span>
                    </div>
                </div>

                {/* Question Text */}
                <h2 className="question-text">{questionText}</h2>

                {/* Options */}
                <div className="options-container">
                    {options.map((option, index) => (
                        <button
                            key={index}
                            className="option-button"
                            onClick={() => onOptionSelect?.(option)}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default QuestionCard;
