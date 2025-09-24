"use client";
import React, { useState, useEffect, useRef } from "react";
import { Volume2, X, BookOpen, Globe, MapPin } from "lucide-react";

// country → language mapping
const countryToLanguage: Record<
  string,
  { code: string; name: string }
> = {
  IN: { code: "hi", name: "Hindi" },
  DE: { code: "de", name: "German" },
  SA: { code: "ar", name: "Arabic" },
  US: { code: "en", name: "English" },
  FR: { code: "fr", name: "French" },
  ES: { code: "es", name: "Spanish" },
  CN: { code: "zh", name: "Chinese" },
  JP: { code: "ja", name: "Japanese" },
  KR: { code: "ko", name: "Korean" },
};

type DictionaryPopupProps = {
  word: string;
  position: { x: number; y: number } | null;
  onClose: () => void;
  isMobile?: boolean;
};

const DictionaryPopup: React.FC<DictionaryPopupProps> = ({
  word,
  position,
  onClose,
  isMobile = false,
}) => {
  const [definition, setDefinition] = useState<string>("");
  const [phonetic, setPhonetic] = useState<string>("");
  const [translation, setTranslation] = useState<string>("");
  const [userLanguage, setUserLanguage] = useState<{ code: string; name: string } | null>(
    null
  );
  const [userLocation, setUserLocation] = useState<string>("US");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // 🔹 Fetch everything (definition + translation + pronunciation)
  const fetchWordData = async (selectedWord: string) => {
    try {
      setLoading(true);
      setError(null);

      const lowerWord = selectedWord.toLowerCase();

      // 1️⃣ Detect user location → language
      let detectedLang = { code: "en", name: "English" };
      try {
        const res = await fetch("https://ipapi.co/json/");
        if (res.ok) {
          const data = await res.json();
          if (countryToLanguage[data.country_code]) {
            detectedLang = countryToLanguage[data.country_code];
            setUserLocation(data.country_code);
          }
        }
      } catch {
        console.log("Location detection failed, fallback to English");
      }
      setUserLanguage(detectedLang);

      // 2️⃣ Fetch definition
      const defRes = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${lowerWord}`
      );
      if (!defRes.ok) throw new Error("Definition not found");
      const defData = await defRes.json();

      setDefinition(
        defData[0]?.meanings[0]?.definitions[0]?.definition || "No definition available"
      );
      setPhonetic(defData[0]?.phonetic || `/${selectedWord}/`);

      // 3️⃣ Fetch translation if needed
      if (detectedLang.code !== "en") {
        try {
          const transRes = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
              lowerWord
            )}&langpair=en|${detectedLang.code}`
          );
          if (transRes.ok) {
            const transData = await transRes.json();
            setTranslation(transData.responseData.translatedText || "");
          }
        } catch {
          console.log("Translation failed");
        }
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Run fetch when word changes
  useEffect(() => {
    if (word) {
      fetchWordData(word);
    }
  }, [word]);

  const playPronunciation = () => {
    try {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.8;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    } catch (err) {
      console.log("Speech synthesis failed:", err);
    }
  };

  if (!word || !position) return null;

  return (
    <>
      {/* mobile backdrop */}
      {isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      <div
        ref={popupRef}
        style={{
          position: "fixed",
          top: position.y + 20,
          left: position.x,
          width: "320px",
          zIndex: 1000,
        }}
        className="bg-zinc-900 text-white border border-zinc-700 rounded-xl shadow-2xl p-4"
      >
        {/* header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-blue-400" />
            <h3 className="font-bold text-lg">{word}</h3>
            {userLocation && (
              <span className="text-xs text-zinc-400 flex items-center gap-1">
                <MapPin size={12} /> {userLocation}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* content */}
        {loading ? (
          <p className="text-sm text-zinc-400">Loading...</p>
        ) : error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : (
          <div className="space-y-3">
            {/* translation */}
            {userLanguage && userLanguage.code !== "en" && (
              <div className="bg-zinc-800 rounded-lg p-3 border border-zinc-600">
                <div className="flex items-center gap-2 mb-2">
                  <Globe size={14} className="text-green-400" />
                  <span className="text-xs font-semibold text-green-400 uppercase">
                    {userLanguage.name} Translation
                  </span>
                </div>
                {translation ? (
                  <p className="text-lg font-semibold text-green-300">{translation}</p>
                ) : (
                  <p className="text-sm text-zinc-400">Translation not available</p>
                )}
              </div>
            )}

            {/* pronunciation */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-300">{phonetic}</span>
              <button
                onClick={playPronunciation}
                className="text-blue-400 hover:text-blue-300"
              >
                <Volume2 size={14} />
              </button>
            </div>

            {/* definition */}
            <p className="text-sm text-zinc-100">{definition}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default DictionaryPopup;
