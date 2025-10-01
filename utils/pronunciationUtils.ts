/**
 * Calculates the similarity percentage between two strings based on common words.
 * @param str1 - The first string.
 * @param str2 - The second string.
 * @returns The similarity percentage (0–100).
 */
export const calculateSimilarity = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase().replace(/[^\w\s]/g, "");
  const s2 = str2.toLowerCase().replace(/[^\w\s]/g, "");
  const words1 = s1.split(" ").filter(Boolean);
  const words2 = s2.split(" ").filter(Boolean);

  if (words1.length === 0 && words2.length === 0) return 100;
  if (words1.length === 0 || words2.length === 0) return 0;

  let matches = 0;
  const longerLength = Math.max(words1.length, words2.length);

  for (let i = 0; i < Math.min(words1.length, words2.length); i++) {
    if (words1[i] === words2[i]) {
      matches++;
    }
  }

  return (matches / longerLength) * 100;
};

export interface WordFeedback {
  word: string;
  correct: boolean;
  userWord: string;
  confidence: number;
  extra?: boolean; // flag for extra spoken words
}

/**
 * Compares user's transcript to the target sentence, providing per-word correctness.
 * @param userTranscript - The transcript from speech recognition.
 * @param targetSentence - The original sentence to be pronounced.
 * @param accuracyThreshold - Similarity % required for a word to be correct (default 80).
 * @returns Array of word objects with correctness info.
 */
export const getWordFeedback = (
  userTranscript: string,
  targetSentence: string,
  accuracyThreshold = 80
): WordFeedback[] => {
  const targetWords = targetSentence
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(" ")
    .filter(Boolean);

  const userWords = userTranscript
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(" ")
    .filter(Boolean);

  const feedback: WordFeedback[] = targetWords.map((targetWord, index) => {
    const userWord = userWords[index];
    let isCorrect = false;
    let confidence = 0;

    if (userWord) {
      if (targetWord === userWord) {
        isCorrect = true;
        confidence = 100;
      } else {
        const wordSimilarity = calculateSimilarity(targetWord, userWord);
        if (wordSimilarity >= accuracyThreshold) {
          isCorrect = true;
          confidence = wordSimilarity;
        } else {
          isCorrect = false;
          confidence = wordSimilarity;
        }
      }
    }

    return {
      word: targetWord,
      correct: isCorrect,
      userWord: userWord || "",
      confidence,
    };
  });

  // Extra words
  if (userWords.length > targetWords.length) {
    for (let i = targetWords.length; i < userWords.length; i++) {
      feedback.push({
        word: userWords[i],
        correct: false,
        userWord: userWords[i],
        confidence: 0,
        extra: true,
      });
    }
  }

  return feedback;
};

/**
 * Maps word feedback to highlightedWords format.
 * @param wordFeedback - Array of WordFeedback objects.
 * @returns Array of highlight objects.
 */
export const mapWordFeedbackToHighlightedWords = (
  wordFeedback: WordFeedback[]
): { index: number; correct: boolean }[] => {
  return wordFeedback.map((item, index) => ({
    index,
    correct: item.correct,
  }));
};
