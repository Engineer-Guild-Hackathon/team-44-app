import React, { useState } from 'react';
import { QuizItem, QuizResult } from '../../types/discovery';

interface SimpleQuizProps {
  quiz: QuizItem | null;
  error?: string | null;
  onLoad?: () => void;
  onAnswer: (result: QuizResult) => void;
}

export const SimpleQuiz: React.FC<SimpleQuizProps> = ({ quiz, error, onLoad, onAnswer }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-[var(--color-error)] mb-2">❓</div>
        <p className="text-[var(--color-error)] text-sm mb-4">{error}</p>
        {onLoad && (
          <button
            onClick={onLoad}
            className="bg-[var(--color-accent)] hover:bg-[var(--color-primary)] text-[var(--color-text-dark)] text-sm py-2 px-4 rounded transition-colors duration-200"
          >
            再試行
          </button>
        )}
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-8">
        <div className="text-[var(--color-muted-foreground)] mb-4">❓</div>
        <p className="text-[var(--color-muted-foreground)] text-sm mb-4">クイズを読み込み中...</p>
        {onLoad && (
          <button
            onClick={onLoad}
            className="bg-[var(--color-accent)] hover:bg-[var(--color-primary)] text-[var(--color-text-dark)] text-sm py-2 px-4 rounded transition-colors duration-200"
          >
            読み込む
          </button>
        )}
      </div>
    );
  }

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
      <div className="bg-[var(--color-bg-light)] rounded-lg shadow-[var(--shadow-md)] p-6 border border-[var(--color-border)]">
        <div className="text-center mb-4">
          <div className={`text-4xl mb-2 ${isCorrect ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
            {isCorrect ? '✓' : '✗'}
          </div>
          <h3 className={`text-xl font-semibold ${isCorrect ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
            {isCorrect ? '正解！' : '不正解'}
          </h3>
        </div>

        <div className="mb-4">
          <p className="text-[var(--color-text-light)] mb-2 font-medium">解説:</p>
          <p className="text-[var(--color-text-light)]">{quiz.explanation}</p>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-[var(--color-muted-foreground)]">
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
    <div className="bg-[var(--color-bg-light)] rounded-lg shadow-[var(--shadow-md)] p-6 border border-[var(--color-border)]">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[var(--color-text-light)] mb-2">
          {quiz.primaryCategory} × {quiz.secondaryCategory}
        </h3>
        <p className="text-[var(--color-text-light)]">{quiz.question}</p>
      </div>

      <div className="space-y-3 mb-6">
        {quiz.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionSelect(index)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${selectedOption === index
              ? 'border-[var(--color-accent)] bg-[var(--color-accent)] bg-opacity-5'
              : 'border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-muted)]'
              }`}
          >
            <span className="font-medium text-[var(--color-primary)] mr-3">
              {String.fromCharCode(65 + index)}.
            </span>
            <span className="text-[var(--color-text-light)]">{option}</span>
          </button>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={selectedOption === null}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${selectedOption !== null
          ? 'bg-[var(--color-primary)] hover:bg-opacity-90 text-[var(--color-text-dark)]'
          : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)] cursor-not-allowed'
          }`}
      >
        回答する
      </button>
    </div>
  );
};
