import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
}

export interface DynamicAssessmentProps {
  assessmentType: 'aptitude' | 'mock';
  filterParam: string;
}

// Utility to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export const DynamicAssessment: React.FC<DynamicAssessmentProps> = ({ 
  assessmentType, 
  filterParam 
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const fetchAndShuffleQuestions = useCallback(async () => {
    setLoading(true);
    let data: any[] | null = null;
    let error = null;

    if (assessmentType === 'aptitude') {
      const result = await supabase
        .from('aptitude_questions')
        .select('*')
        .eq('category', filterParam);
      data = result.data;
      error = result.error;
    } else {
      const result = await supabase
        .from('mock_test_questions')
        .select('*')
        .eq('company', filterParam);
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error fetching questions:', error);
    } else if (data) {
      setQuestions(shuffleArray(data));
    }
    
    // Reset state for new fetch
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setLoading(false);
  }, [assessmentType, filterParam]);

  useEffect(() => {
    fetchAndShuffleQuestions();

    // Cleanup function: reset questions array when component unmounts
    return () => {
      setQuestions([]);
    };
  }, [fetchAndShuffleQuestions]);

  const handleOptionClick = (option: string) => {
    if (selectedOption) return; // Prevent changing answer
    setSelectedOption(option);
    
    if (option === questions[currentIndex].correct_answer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setCurrentIndex(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[#13161e] border border-gray-800 rounded-xl">
        <div className="text-gray-400">Loading questions...</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-[#13161e] border border-gray-800 rounded-xl p-8 text-center">
        <h3 className="text-xl text-gray-200 mb-2">No Questions Found</h3>
        <p className="text-gray-400">Could not find any questions for {filterParam}.</p>
      </div>
    );
  }

  const isComplete = currentIndex >= questions.length;

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-[#13161e] border border-gray-800 rounded-xl p-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Assessment Complete!</h2>
        <div className="text-6xl font-black text-blue-500 mb-6">
          {score} <span className="text-2xl text-gray-400">/ {questions.length}</span>
        </div>
        <p className="text-gray-400 mb-8">
          You scored {Math.round((score / questions.length) * 100)}%.
        </p>
        <button
          onClick={fetchAndShuffleQuestions}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Retake Test
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="bg-[#13161e] border border-gray-800 rounded-xl p-6 md:p-8 max-w-3xl mx-auto shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-800">
        <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          {assessmentType === 'aptitude' ? 'Aptitude Test' : 'Mock Test'} • {filterParam}
        </span>
        <span className="text-sm font-medium text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">
          Question {currentIndex + 1} of {questions.length}
        </span>
      </div>

      {/* Question */}
      <h3 className="text-xl md:text-2xl font-medium text-gray-100 mb-8 leading-relaxed">
        {currentQuestion.question_text}
      </h3>

      {/* Options */}
      <div className="space-y-3 mb-8">
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedOption === option;
          const isCorrect = option === currentQuestion.correct_answer;
          
          let buttonClass = "w-full text-left px-5 py-4 rounded-lg border transition-all duration-200 flex items-center justify-between group ";
          
          if (!selectedOption) {
            buttonClass += "border-gray-700 bg-[#1a1d27] hover:border-gray-500 hover:bg-[#222631] text-gray-300";
          } else {
            if (isCorrect) {
              buttonClass += "border-green-500/50 bg-green-500/10 text-green-400";
            } else if (isSelected && !isCorrect) {
              buttonClass += "border-red-500/50 bg-red-500/10 text-red-400";
            } else {
              buttonClass += "border-gray-800 bg-[#13161e] text-gray-600 opacity-50";
            }
          }

          return (
            <button
              key={index}
              onClick={() => handleOptionClick(option)}
              disabled={selectedOption !== null}
              className={buttonClass}
            >
              <span className="text-base">{option}</span>
              {selectedOption && isCorrect && (
                <svg className="w-5 h-5 text-green-500 shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              )}
              {selectedOption && isSelected && !isCorrect && (
                <svg className="w-5 h-5 text-red-500 shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Controls */}
      <div className="flex justify-end pt-6 border-t border-gray-800">
        <button
          onClick={handleNext}
          disabled={!selectedOption}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
            selectedOption 
              ? "bg-blue-600 hover:bg-blue-700 text-white" 
              : "bg-gray-800 text-gray-500 cursor-not-allowed"
          }`}
        >
          {currentIndex === questions.length - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
};
