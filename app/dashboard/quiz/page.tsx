"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { quizData, QuizQuestion } from "@/data/quizzes";

export default function QuizPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [subject, setSubject] = useState<string>("math");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "advanced">("easy");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!user) {
    return <p className="text-center mt-10">Please login to take a quiz</p>;
  }

  const questions: QuizQuestion[] = quizData[subject][difficulty];
  const totalQuestions = questions.length;

  const handleAnswer = (option: string) => {
    if (option === questions[currentQuestion].answer) {
      setScore(score + 1);
    }

    if (currentQuestion + 1 < totalQuestions) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setFinished(true);
      saveResult();
    }
  };

  const saveResult = async () => {
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
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6">Quiz Page</h1>

      {/* subject & difficulty selection */}
      {!finished && currentQuestion === 0 && (
        <div className="mb-6 flex gap-4">
          <select
            className="p-2 border rounded"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            <option value="math">Math</option>
            <option value="english">English</option>
            <option value="history">History</option>
          </select>

          <select
            className="p-2 border rounded"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as any)}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      )}

      {/* quiz logic */}
      {finished ? (
        <div className="text-center">
          <h2 className="text-xl font-bold">Quiz Finished!</h2>
          <p>
            Score: {score}/{totalQuestions}
          </p>
          <button
            onClick={restartQuiz}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="w-full max-w-lg">
          <p className="font-semibold mb-4">
            Q{currentQuestion + 1}: {questions[currentQuestion].question}
          </p>
          <div className="grid gap-3">
            {questions[currentQuestion].options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                className="p-2 border rounded hover:bg-blue-100"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
