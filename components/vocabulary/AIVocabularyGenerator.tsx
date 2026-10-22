// components/vocabulary/AIVocabularyGenerator.tsx
"use client";
import React, { useState } from "react";
import { Sparkles, Loader2, X, ChevronDown, Wand2 } from "lucide-react";
import { VocabularyItem } from "@/components/types";

interface AIVocabularyGeneratorProps {
  onWordsGenerated: (topic: string, words: VocabularyItem[]) => void;
}

const SUGGESTED_TOPICS = [
  "Kitchen utensils",
  "Electronic devices",
  "Dry fruits & nuts",
  "Office supplies",
  "Clothing items",
  "Sports equipment",
  "Musical instruments",
  "Body parts",
  "Weather phenomena",
  "Space & astronomy",
  "Ocean creatures",
  "Garden tools",
];

const WORD_COUNTS = [5, 10, 20];

const AIVocabularyGenerator: React.FC<AIVocabularyGeneratorProps> = ({
  onWordsGenerated,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleGenerate = async () => {
    const trimmedTopic = topic.trim();
    if (!trimmedTopic) {
      setError("Please enter a topic.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: trimmedTopic, count }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      if (!data.words?.length) {
        setError("No words were generated. Try a different topic.");
        return;
      }

      onWordsGenerated(trimmedTopic, data.words);
      setIsOpen(false);
      setTopic("");
      setCount(10);
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setTopic(suggestion);
    setShowSuggestions(false);
    setError(null);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 border ${
          isOpen
            ? "bg-primary border-brand text-primary-foreground shadow-lg shadow-brand/25"
            : "bg-brand/10 border-brand/50 text-brand hover:bg-brand/10 hover:border-brand hover:text-brand"
        }`}
      >
        <Sparkles size={16} className={isOpen ? "animate-pulse" : ""} />
        <span>AI Generate</span>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-12 z-20 w-80 bg-card border border-border rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-gradient-to-r from-brand/10 to-brand/5">
              <div className="flex items-center gap-2">
                <Wand2 size={18} className="text-brand" />
                <span className="font-semibold text-foreground text-sm">
                  AI Word Generator
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground/80 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Topic Input */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                  Topic
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => {
                      setTopic(e.target.value);
                      setError(null);
                      setShowSuggestions(false);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                    placeholder="e.g. kitchen utensils, dry fruits..."
                    className="w-full bg-muted border border-border text-foreground placeholder-muted-foreground rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-ring/50 transition-all pr-9"
                  />
                  <button
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground/80 transition-colors"
                  >
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${showSuggestions ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="mt-1 bg-muted border border-border rounded-lg overflow-hidden shadow-xl max-h-48 overflow-y-auto">
                    {SUGGESTED_TOPICS.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSuggestionClick(s)}
                        className="w-full text-left px-3 py-2 text-sm text-foreground/80 hover:bg-secondary hover:text-foreground transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Word Count */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                  Number of Words
                </label>
                <div className="flex gap-2">
                  {WORD_COUNTS.map((n) => (
                    <button
                      key={n}
                      onClick={() => setCount(n)}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${
                        count === n
                          ? "bg-primary border-brand text-primary-foreground shadow-md shadow-brand/25"
                          : "bg-muted border-border text-muted-foreground hover:border-input hover:text-foreground"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 px-3 py-2.5 bg-destructive/10 border border-destructive/60 rounded-lg">
                  <X size={14} className="text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-destructive">{error}</p>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isLoading || !topic.trim()}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  isLoading || !topic.trim()
                    ? "bg-secondary text-muted-foreground cursor-not-allowed"
                    : "bg-gradient-to-r from-brand to-brand/70 hover:opacity-90 text-primary-foreground shadow-lg shadow-brand/25 hover:shadow-brand/40 hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Generating {count} words…</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Generate {count} Words</span>
                  </>
                )}
              </button>

              <p className="text-center text-xs text-muted-foreground">
                Powered by Gemini 2.5 Flash
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIVocabularyGenerator;