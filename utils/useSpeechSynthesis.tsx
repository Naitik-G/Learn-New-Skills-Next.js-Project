import { useState, useEffect } from "react";

interface SpeechSynthesisHook {
  speak: (text: string) => void;
  cancel: () => void;
  speaking: boolean;
  supported: boolean;
  voices: SpeechSynthesisVoice[];
}

const useSpeechSynthesis = (): SpeechSynthesisHook => {
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [supported] = useState<boolean>("speechSynthesis" in window);

  useEffect(() => {
    if (!supported) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [supported]);

  const speak = (text: string) => {
    if (!supported || !text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voices[0] || null;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const cancel = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  return { speak, cancel, speaking, supported, voices };
};

export default useSpeechSynthesis;
