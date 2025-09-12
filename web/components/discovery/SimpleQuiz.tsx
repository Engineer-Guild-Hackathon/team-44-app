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
      <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
        <div className="text-center mb-4">
          <div className={`text-4xl mb-2 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
            {isCorrect ? '✓' : '✗'}
          </div>
          <h3 className={`text-xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {isCorrect ? '正解！' : '不正解'}
          </h3>
        </div>

        <div className="mb-4">
          <p className="text-gray-700 mb-2">解説:</p>
          <p className="text-gray-800">{quiz.explanation}</p>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            正解: {quiz.options[quiz.correctAnswer]}
          </span>

          {quiz.googleSearchQuery && (
            <button
              onClick={handleSearchClick}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
            >
              もっと詳しく調べる
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {quiz.primaryCategory} × {quiz.secondaryCategory}
        </h3>
        <p className="text-gray-700">{quiz.question}</p>
      </div>

      <div className="space-y-3 mb-6">
        {quiz.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionSelect(index)}
            className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${selectedOption === index
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            <span className="font-medium text-gray-600 mr-2">
              {String.fromCharCode(65 + index)}.
            </span>
            {option}
          </button>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={selectedOption === null}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${selectedOption !== null
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
      >
        回答する
      </button>
    </div>
  );
};
