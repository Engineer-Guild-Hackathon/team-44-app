import React, { useState } from 'react';
import { QuizItem, QuizResult } from '../../types/discovery';

interface SimpleQuizProps {
  quiz: QuizItem;
  onAnswer: (result: QuizResult) => void;
}

export const SimpleQuiz: React.FC<SimpleQuizProps> = ({ quiz, onAnswer }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;

    const correct = selectedOption === quiz.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    onAnswer({
      quizId: quiz.id,
      selectedOption,
      isCorrect: correct,
      submittedAt: new Date()
    });
  };

  const handleSearchClick = () => {
    if (quiz.googleSearchQuery) {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(quiz.googleSearchQuery)}`;
      window.open(searchUrl, '_blank');
    }
  };

  if (showResult) {
    return (
      <div className="bg-white dark:bg-[var(--color-bg-dark)] rounded-lg shadow-[var(--shadow-md)] p-6 border border-[var(--color-border)]">
        <div className="text-center mb-4">
          <div className={`text-4xl mb-2 ${isCorrect ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
            {isCorrect ? '✓' : '✗'}
          </div>
          <h3 className={`text-xl font-semibold ${isCorrect ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
            {isCorrect ? '正解！' : '不正解'}
          </h3>
        </div>

        <div className="mb-4">
          <p className="text-[var(--color-text-light)] dark:text-[var(--color-text-dark)] mb-2 font-medium">解説:</p>
          <p className="text-[var(--color-text-light)] dark:text-[var(--color-text-dark)]">{quiz.explanation}</p>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
            正解: {quiz.options[quiz.correctAnswer]}
          </span>

          {quiz.googleSearchQuery && (
            <button
              onClick={handleSearchClick}
              className="text-[var(--color-accent)] hover:text-[var(--color-primary)] text-sm font-medium underline transition-colors"
            >
              もっと詳しく調べる
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[var(--color-bg-dark)] rounded-lg shadow-[var(--shadow-md)] p-6 border border-[var(--color-border)]">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[var(--color-text-light)] dark:text-[var(--color-text-dark)] mb-2">
          {quiz.primaryCategory} × {quiz.secondaryCategory}
        </h3>
        <p className="text-[var(--color-text-light)] dark:text-[var(--color-text-dark)]">{quiz.question}</p>
      </div>

      <div className="space-y-3 mb-6">
        {quiz.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionSelect(index)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${selectedOption === index
              ? 'border-[var(--color-accent)] bg-[var(--color-accent)] bg-opacity-5 dark:bg-opacity-10'
              : 'border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-muted)] dark:hover:bg-[var(--color-bg-dark)]'
              }`}
          >
            <span className="font-medium text-[var(--color-primary)] mr-3">
              {String.fromCharCode(65 + index)}.
            </span>
            <span className="text-[var(--color-text-light)] dark:text-[var(--color-text-dark)]">{option}</span>
          </button>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={selectedOption === null}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${selectedOption !== null
          ? 'bg-[var(--color-primary)] hover:bg-opacity-90 text-[var(--color-text-dark)]'
          : 'bg-[var(--color-muted)] dark:bg-[var(--color-bg-dark)] text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] cursor-not-allowed'
          }`}
      >
        回答する
      </button>
    </div>
  );
};
