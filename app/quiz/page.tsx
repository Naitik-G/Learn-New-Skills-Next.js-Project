"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { quizData, QuizQuestion } from "@/data/quizzes";
import { useRouter } from "next/navigation";

type QuizMode = "preset" | "ai" | "history";

// Shape of a saved AI quiz row from Supabase
interface SavedAIQuiz {
  id: string;
  topic: string;
  difficulty: "easy" | "medium" | "advanced";
  questions: QuizQuestion[];
  created_at: string;
  last_score?: number | null;
  last_total?: number | null;
}

export default function QuizPage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  // ── Mode ─────────────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<QuizMode>("preset");

  // ── Preset state ──────────────────────────────────────────────────────────────
  const [subject, setSubject] = useState<string>("math");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "advanced">("easy");

  // ── AI generation state ───────────────────────────────────────────────────────
  const [aiTopic, setAiTopic] = useState("");
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "medium" | "advanced">("medium");
  const [aiNumQuestions, setAiNumQuestions] = useState(10);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiQuestions, setAiQuestions] = useState<QuizQuestion[] | null>(null);

  // ── Saved AI quizzes (history tab) ────────────────────────────────────────────
  const [savedQuizzes, setSavedQuizzes] = useState<SavedAIQuiz[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null); // which saved quiz is being played

  // ── Shared quiz state ─────────────────────────────────────────────────────────
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // ── Resolve active questions ──────────────────────────────────────────────────
  const getQuestions = (): QuizQuestion[] => {
    if (mode === "history" && activeQuizId) {
      return savedQuizzes.find((q) => q.id === activeQuizId)?.questions ?? [];
    }
    if (mode === "ai" && aiQuestions) return aiQuestions;
    return (quizData[subject]?.[difficulty] ?? []).slice(0, 10);
  };

  const questions = getQuestions();
  const totalQuestions = questions.length;

  // ── Load saved AI quizzes from Supabase ───────────────────────────────────────
  // Mirrors loadCustomTopics() from TopicsPage exactly
  const loadSavedQuizzes = useCallback(async () => {
    if (!user) return;
    setHistoryLoading(true);
    try {
      const { data, error } = await supabase
        .from("ai_quizzes") // table that stores full AI-generated quizzes
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) { console.error("Error loading saved quizzes:", error); return; }

      setSavedQuizzes(
        (data ?? []).map((row) => ({
          id: row.id,
          topic: row.topic,
          difficulty: row.difficulty,
          questions: row.questions ?? [],
          created_at: row.created_at,
          last_score: row.last_score ?? null,
          last_total: row.last_total ?? null,
        }))
      );
    } finally {
      setHistoryLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (user && mode === "history") loadSavedQuizzes();
  }, [user, mode, loadSavedQuizzes]);

  // ── Delete a saved quiz ───────────────────────────────────────────────────────
  const deleteSavedQuiz = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from("ai_quizzes").delete().eq("id", id);
    if (!error) {
      setSavedQuizzes((prev) => prev.filter((q) => q.id !== id));
      if (activeQuizId === id) setActiveQuizId(null);
    }
  };

  // ── AI generation ─────────────────────────────────────────────────────────────
  const generateAIQuiz = async () => {
    if (!aiTopic.trim() || aiTopic.trim().length < 3) {
      setAiError("Please enter a topic (at least 3 characters).");
      return;
    }
    setAiError(null);
    setAiLoading(true);
    setAiQuestions(null);

    try {
      const res = await fetch("/api/generate_quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiTopic.trim(), difficulty: aiDifficulty, numQuestions: aiNumQuestions }),
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(
          res.status === 404
            ? "API route not found (404). Make sure the file is at app/api/generate_quiz/route.ts and restart your dev server."
            : `Server returned an unexpected response (HTTP ${res.status}). Check your server logs.`
        );
      }

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to generate quiz");

      setAiQuestions(data.questions);

      // Save full quiz to Supabase so it appears in History tab
      if (user) {
        const { error } = await supabase.from("ai_quizzes").insert({
          user_id: user.id,
          topic: aiTopic.trim(),
          difficulty: aiDifficulty,
          questions: data.questions,
        });
        if (error) console.error("Failed to save AI quiz:", error.message);
      }
    } catch (err: any) {
      setAiError(err.message || "Something went wrong. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  // ── Quiz engine ───────────────────────────────────────────────────────────────
  const handleAnswer = (option: string) => {
    setSelectedAnswer(option);
    const correct = option === questions[currentQuestion].answer;
    setIsCorrect(correct);
    if (correct) setScore((s) => s + 1);

    setTimeout(async () => {
      if (currentQuestion + 1 < totalQuestions) {
        setCurrentQuestion((q) => q + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        setFinished(true);
        if (user) await saveResult(correct ? score + 1 : score);
      }
    }, 1000);
  };

  const saveResult = async (finalScore: number) => {
    if (!user) return;

    if (mode === "history" && activeQuizId) {
      // Update last_score on the saved quiz row
      await supabase
        .from("ai_quizzes")
        .update({ last_score: finalScore, last_total: totalQuestions })
        .eq("id", activeQuizId);
      setSavedQuizzes((prev) =>
        prev.map((q) =>
          q.id === activeQuizId ? { ...q, last_score: finalScore, last_total: totalQuestions } : q
        )
      );
      return;
    }

    const label = mode === "ai" ? `ai:${aiTopic}` : subject;
    const diff = mode === "ai" ? aiDifficulty : difficulty;
    await supabase.from("quizzes").insert({
      user_id: user.id,
      subject: label,
      difficulty: diff,
      score: finalScore,
      total_questions: totalQuestions,
    });
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setFinished(false);
    setQuizStarted(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
    if (mode === "ai") setAiQuestions(null);
    if (mode === "history") setActiveQuizId(null);
  };

  const startSavedQuiz = (quiz: SavedAIQuiz) => {
    setActiveQuizId(quiz.id);
    setCurrentQuestion(0);
    setScore(0);
    setFinished(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setQuizStarted(true);
  };

  const startQuiz = () => setQuizStarted(true);
  const getScorePercentage = () => Math.round((score / totalQuestions) * 100);
  const getScoreMessage = () => {
    const p = getScorePercentage();
    if (p >= 90) return { text: "Outstanding! 🎉", color: "text-green-400" };
    if (p >= 70) return { text: "Great Job! 👏", color: "text-blue-400" };
    if (p >= 50) return { text: "Good Effort! 💪", color: "text-yellow-400" };
    return { text: "Keep Practicing! 📚", color: "text-orange-400" };
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const diffColor: Record<string, string> = {
    easy: "text-green-400 bg-green-500/10 border-green-500/30",
    medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    advanced: "text-red-400 bg-red-500/10 border-red-500/30",
  };

  // ── Active quiz topic label ───────────────────────────────────────────────────
  const activeLabel = () => {
    if (mode === "history" && activeQuizId) {
      const q = savedQuizzes.find((s) => s.id === activeQuizId);
      return q ? `✨ ${q.topic} • ${q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}` : "";
    }
    if (mode === "ai") return `✨ ${aiTopic} • ${aiDifficulty.charAt(0).toUpperCase() + aiDifficulty.slice(1)}`;
    return `${subject.charAt(0).toUpperCase() + subject.slice(1)} • ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`;
  };

  // ── JSX ───────────────────────────────────────────────────────────────────────
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
          <p className="text-gray-400">Preset topics, AI-generated, or replay your saved quizzes</p>
          {!user && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg max-w-md mx-auto">
              <p className="text-sm text-yellow-400">
                💡 Login to save your quiz results and track your progress!
              </p>
            </div>
          )}
        </div>

        {/* ── Setup Screen ── */}
        {!quizStarted && !finished && (
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 shadow-2xl">

            {/* Mode Toggle — 3 tabs */}
            <div className="flex rounded-xl overflow-hidden border border-gray-700 mb-8">
              {([
                { key: "preset", label: "📚 Preset" },
                { key: "ai",     label: "✨ AI Generate" },
                { key: "history", label: "🗂️ My AI Quizzes" },
              ] as { key: QuizMode; label: string }[]).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => { setMode(key); setAiError(null); setAiQuestions(null); setActiveQuizId(null); }}
                  className={`flex-1 py-3 font-semibold transition-all text-sm ${
                    mode === key
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* ── Preset Mode ── */}
            {mode === "preset" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-center text-gray-200">Choose Your Challenge</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">Subject</label>
                  <div className="grid grid-cols-3 gap-3">
                    {["math", "english", "history"].map((subj) => (
                      <button key={subj} onClick={() => setSubject(subj)}
                        className={`p-4 rounded-xl font-medium transition-all ${subject === subj ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30" : "bg-gray-800 text-gray-300 hover:bg-gray-750 border border-gray-700"}`}>
                        {subj.charAt(0).toUpperCase() + subj.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">Difficulty</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["easy", "medium", "advanced"] as const).map((diff) => (
                      <button key={diff} onClick={() => setDifficulty(diff)}
                        className={`p-4 rounded-xl font-medium transition-all ${difficulty === diff ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30" : "bg-gray-800 text-gray-300 hover:bg-gray-750 border border-gray-700"}`}>
                        {diff.charAt(0).toUpperCase() + diff.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={startQuiz}
                  className="w-full mt-2 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/30">
                  Start Quiz
                </button>
              </div>
            )}

            {/* ── AI Mode ── */}
            {mode === "ai" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-center text-gray-200">Generate a Custom Quiz</h2>
                <p className="text-center text-sm text-gray-500">Powered by Gemini 2.5 Flash via OpenRouter</p>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Topic <span className="text-pink-400">*</span></label>
                  <input type="text" value={aiTopic}
                    onChange={(e) => { setAiTopic(e.target.value); setAiError(null); }}
                    placeholder="e.g. Photosynthesis, World War II, JavaScript closures..."
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    onKeyDown={(e) => e.key === "Enter" && !aiLoading && generateAIQuiz()}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">Difficulty</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["easy", "medium", "advanced"] as const).map((diff) => (
                      <button key={diff} onClick={() => setAiDifficulty(diff)}
                        className={`p-4 rounded-xl font-medium transition-all ${aiDifficulty === diff ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30" : "bg-gray-800 text-gray-300 hover:bg-gray-750 border border-gray-700"}`}>
                        {diff.charAt(0).toUpperCase() + diff.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">
                    Number of Questions: <span className="text-white font-bold">{aiNumQuestions}</span>
                  </label>
                  <input type="range" min={5} max={15} value={aiNumQuestions}
                    onChange={(e) => setAiNumQuestions(Number(e.target.value))}
                    className="w-full accent-purple-500" />
                  <div className="flex justify-between text-xs text-gray-600 mt-1"><span>5</span><span>10</span><span>15</span></div>
                </div>

                {aiError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">⚠️ {aiError}</div>
                )}

                {aiQuestions && !aiLoading && (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-green-400 text-sm">
                      <span className="font-semibold">{aiQuestions.length} questions</span> generated about &quot;{aiTopic}&quot;
                      {user && <span className="ml-1 opacity-70">— saved to My AI Quizzes</span>}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={generateAIQuiz} disabled={aiLoading || !aiTopic.trim()}
                    className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 border border-purple-500/50 hover:border-purple-500 text-purple-400 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {aiLoading ? (
                      <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Generating…</>
                    ) : <>✨ {aiQuestions ? "Regenerate" : "Generate Quiz"}</>}
                  </button>
                  {aiQuestions && (
                    <button onClick={startQuiz}
                      className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/30">
                      Start Quiz →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── History Mode ── */}
            {mode === "history" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-200">My AI Quizzes</h2>
                  {user && (
                    <button onClick={loadSavedQuizzes} disabled={historyLoading}
                      className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 disabled:opacity-50">
                      <svg className={`w-4 h-4 ${historyLoading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
                  )}
                </div>

                {/* Not logged in */}
                {!user && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <p className="text-gray-400 mb-4">Login to view and replay your AI-generated quizzes.</p>
                    <button onClick={() => router.push("/login")}
                      className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors">
                      Login Now
                    </button>
                  </div>
                )}

                {/* Loading */}
                {user && historyLoading && (
                  <div className="flex items-center justify-center py-12 gap-3 text-gray-400">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading your quizzes…
                  </div>
                )}

                {/* Empty state */}
                {user && !historyLoading && savedQuizzes.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <p className="text-gray-400 mb-2">No AI quizzes yet.</p>
                    <p className="text-gray-500 text-sm mb-4">Switch to <span className="text-purple-400 font-medium">✨ AI Generate</span> to create your first one!</p>
                    <button onClick={() => setMode("ai")}
                      className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium">
                      Generate a Quiz
                    </button>
                  </div>
                )}

                {/* Quiz cards grid */}
                {user && !historyLoading && savedQuizzes.length > 0 && (
                  <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                    {savedQuizzes.map((quiz) => (
                      <div key={quiz.id}
                        className="bg-gray-800 border border-gray-700 rounded-xl p-5 flex items-center justify-between gap-4 hover:border-purple-500/50 transition-all group">
                        {/* Left info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-white font-semibold truncate">{quiz.topic}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${diffColor[quiz.difficulty]}`}>
                              {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                            <span>📅 {formatDate(quiz.created_at)}</span>
                            <span>❓ {quiz.questions.length} questions</span>
                            {quiz.last_score != null && quiz.last_total != null && (
                              <span className={`font-medium ${
                                (quiz.last_score / quiz.last_total) >= 0.7 ? "text-green-400" : "text-orange-400"
                              }`}>
                                🏆 Last: {quiz.last_score}/{quiz.last_total}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => startSavedQuiz(quiz)}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm font-semibold rounded-lg transition-all shadow-md shadow-purple-500/20"
                          >
                            Play →
                          </button>
                          <button
                            onClick={() => deleteSavedQuiz(quiz.id)}
                            className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Delete quiz"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Quiz Questions ── */}
        {quizStarted && !finished && questions.length > 0 && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-400">Question {currentQuestion + 1} of {totalQuestions}</span>
                <span className="text-sm font-medium text-gray-400">Score: {score}/{totalQuestions}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }} />
              </div>
              {(mode === "ai" || mode === "history") && (
                <p className="text-xs text-purple-400 mt-2">✨ AI-generated quiz: {activeLabel()}</p>
              )}
            </div>

            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 shadow-2xl">
              <div className="mb-8">
                <div className="inline-block px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-medium mb-4">
                  {activeLabel()}
                </div>
                <h3 className="text-2xl font-bold leading-relaxed">{questions[currentQuestion].question}</h3>
              </div>

              <div className="grid gap-4">
                {questions[currentQuestion].options.map((option, idx) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrectAnswer = option === questions[currentQuestion].answer;
                  let cls = "p-5 rounded-xl font-medium transition-all text-left border-2 ";
                  if (selectedAnswer) {
                    if (isSelected && isCorrect) cls += "bg-green-500/20 border-green-500 text-green-400";
                    else if (isSelected && !isCorrect) cls += "bg-red-500/20 border-red-500 text-red-400";
                    else if (isCorrectAnswer) cls += "bg-green-500/20 border-green-500 text-green-400";
                    else cls += "bg-gray-800 border-gray-700 text-gray-500";
                  } else {
                    cls += "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-750 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20";
                  }
                  return (
                    <button key={idx} onClick={() => !selectedAnswer && handleAnswer(option)} disabled={selectedAnswer !== null} className={cls}>
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {selectedAnswer && isCorrectAnswer && (
                          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        )}
                        {selectedAnswer && isSelected && !isCorrect && (
                          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Results ── */}
        {finished && (
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 shadow-2xl text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
            <p className={`text-2xl font-bold mb-8 ${getScoreMessage().color}`}>{getScoreMessage().text}</p>

            {!user && (
              <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <p className="text-purple-400 mb-3">🔒 Login to save your results!</p>
                <button onClick={() => router.push("/login")} className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors">Login Now</button>
              </div>
            )}
            {user && <p className="text-green-400 mb-6">✓ Results saved to your account</p>}

            <div className="bg-gray-800 rounded-xl p-8 mb-8">
              <div className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">{score}/{totalQuestions}</div>
              <div className="text-xl text-gray-400">{getScorePercentage()}% Correct</div>
              {(mode === "ai" || mode === "history") && <div className="mt-2 text-sm text-purple-400">✨ {activeLabel()}</div>}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-800 rounded-xl p-4"><div className="text-2xl font-bold text-green-400">{score}</div><div className="text-sm text-gray-400">Correct</div></div>
              <div className="bg-gray-800 rounded-xl p-4"><div className="text-2xl font-bold text-red-400">{totalQuestions - score}</div><div className="text-sm text-gray-400">Wrong</div></div>
              <div className="bg-gray-800 rounded-xl p-4"><div className="text-2xl font-bold text-purple-400">{totalQuestions}</div><div className="text-sm text-gray-400">Total</div></div>
            </div>

            <div className="flex gap-4">
              <button onClick={restartQuiz} className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/30">
                {mode === "history" ? "Back to My Quizzes" : "Try Again"}
              </button>
              <button onClick={() => window.location.reload()} className="flex-1 py-4 bg-gray-800 hover:bg-gray-750 text-gray-200 font-bold rounded-xl transition-all border border-gray-700">
                New Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}