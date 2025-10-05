"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { quizData, QuizQuestion } from "@/data/quizzes";
import { useRouter } from "next/navigation";

export default function QuizPage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [subject, setSubject] = useState<string>("math");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "advanced">("easy");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Limit to 10 questions
  const allQuestions: QuizQuestion[] = quizData[subject][difficulty];
  const questions = allQuestions.slice(0, 10);
  const totalQuestions = questions.length;

  const handleAnswer = (option: string) => {
    setSelectedAnswer(option);
    const correct = option === questions[currentQuestion].answer;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(score + 1);
    }

    // Auto advance after 1 second
    setTimeout(() => {
      if (currentQuestion + 1 < totalQuestions) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        setFinished(true);
        // Only save if user is logged in
        if (user) {
          saveResult();
        }
      }
    }, 1000);
  };

  const saveResult = async () => {
    if (!user) return;
    
    const { error } = await supabase.from("quizzes").insert({
      user_id: user.id,
      subject,
      difficulty,
      score,
      total_questions: totalQuestions,
    });

    if (error) {
      console.error("Error saving result:", error.message);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setFinished(false);
    setQuizStarted(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  const startQuiz = () => {
    setQuizStarted(true);
  };

  const getScorePercentage = () => {
    return Math.round((score / totalQuestions) * 100);
  };

  const getScoreMessage = () => {
    const percentage = getScorePercentage();
    if (percentage >= 90) return { text: "Outstanding! 🎉", color: "text-green-400" };
    if (percentage >= 70) return { text: "Great Job! 👏", color: "text-blue-400" };
    if (percentage >= 50) return { text: "Good Effort! 💪", color: "text-yellow-400" };
    return { text: "Keep Practicing! 📚", color: "text-orange-400" };
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Quiz Challenge
          </h1>
          <p className="text-gray-400">Test your knowledge with 10 questions</p>
          
          {/* Login prompt for non-authenticated users */}
          {!user && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg max-w-md mx-auto">
              <p className="text-sm text-yellow-400">
                💡 Login to save your quiz results and track your progress!
              </p>
            </div>
          )}
        </div>

        {/* Quiz Setup */}
        {!quizStarted && !finished && (
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-center">Choose Your Challenge</h2>
            
            <div className="space-y-6">
              {/* Subject Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">Subject</label>
                <div className="grid grid-cols-3 gap-3">
                  {["math", "english", "history"].map((subj) => (
                    <button
                      key={subj}
                      onClick={() => setSubject(subj)}
                      className={`p-4 rounded-xl font-medium transition-all ${
                        subject === subj
                          ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-750 border border-gray-700"
                      }`}
                    >
                      {subj.charAt(0).toUpperCase() + subj.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">Difficulty</label>
                <div className="grid grid-cols-3 gap-3">
                  {(["easy", "medium", "advanced"] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setDifficulty(diff)}
                      className={`p-4 rounded-xl font-medium transition-all ${
                        difficulty === diff
                          ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-750 border border-gray-700"
                      }`}
                    >
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={startQuiz}
                className="w-full mt-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
              >
                Start Quiz
              </button>
            </div>
          </div>
        )}

        {/* Quiz Questions */}
        {quizStarted && !finished && (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-400">
                  Question {currentQuestion + 1} of {totalQuestions}
                </span>
                <span className="text-sm font-medium text-gray-400">
                  Score: {score}/{totalQuestions}
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 shadow-2xl">
              <div className="mb-8">
                <div className="inline-block px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-medium mb-4">
                  {subject.charAt(0).toUpperCase() + subject.slice(1)} • {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </div>
                <h3 className="text-2xl font-bold leading-relaxed">
                  {questions[currentQuestion].question}
                </h3>
              </div>

              {/* Options */}
              <div className="grid gap-4">
                {questions[currentQuestion].options.map((option, idx) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrectAnswer = option === questions[currentQuestion].answer;
                  
                  let buttonClass = "p-5 rounded-xl font-medium transition-all text-left border-2 ";
                  
                  if (selectedAnswer) {
                    if (isSelected && isCorrect) {
                      buttonClass += "bg-green-500/20 border-green-500 text-green-400";
                    } else if (isSelected && !isCorrect) {
                      buttonClass += "bg-red-500/20 border-red-500 text-red-400";
                    } else if (isCorrectAnswer) {
                      buttonClass += "bg-green-500/20 border-green-500 text-green-400";
                    } else {
                      buttonClass += "bg-gray-800 border-gray-700 text-gray-500";
                    }
                  } else {
                    buttonClass += "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-750 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => !selectedAnswer && handleAnswer(option)}
                      disabled={selectedAnswer !== null}
                      className={buttonClass}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {selectedAnswer && isCorrectAnswer && (
                          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {selectedAnswer && isSelected && !isCorrect && (
                          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {finished && (
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 shadow-2xl text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
            <p className={`text-2xl font-bold mb-8 ${getScoreMessage().color}`}>
              {getScoreMessage().text}
            </p>

            {/* Login reminder if not authenticated */}
            {!user && (
              <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <p className="text-purple-400 mb-3">
                  🔒 Login to save your results and track your progress over time!
                </p>
                <button
                  onClick={() => router.push('/login')}
                  className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
                >
                  Login Now
                </button>
              </div>
            )}

            {user && (
              <p className="text-green-400 mb-6">✓ Results saved to your account</p>
            )}

            {/* Score Display */}
            <div className="bg-gray-800 rounded-xl p-8 mb-8">
              <div className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                {score}/{totalQuestions}
              </div>
              <div className="text-xl text-gray-400">
                {getScorePercentage()}% Correct
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-800 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-400">{score}</div>
                <div className="text-sm text-gray-400">Correct</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-4">
                <div className="text-2xl font-bold text-red-400">{totalQuestions - score}</div>
                <div className="text-sm text-gray-400">Wrong</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-4">
                <div className="text-2xl font-bold text-purple-400">{totalQuestions}</div>
                <div className="text-sm text-gray-400">Total</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={restartQuiz}
                className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/30"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-4 bg-gray-800 hover:bg-gray-750 text-gray-200 font-bold rounded-xl transition-all border border-gray-700"
              >
                New Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}