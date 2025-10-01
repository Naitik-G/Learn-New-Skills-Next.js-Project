import { useEffect, useRef, useState } from "react";

interface SpeechRecognitionHook {
  transcript: string;
  listening: boolean;
  startListening: () => void;
  stopListening: () => void;
  supported: boolean;
}

const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [transcript, setTranscript] = useState<string>("");
  const [listening, setListening] = useState<boolean>(false);
  const [supported] = useState<boolean>("webkitSpeechRecognition" in window || "SpeechRecognition" in window);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!supported) return;

    const SpeechRecognitionClass: typeof SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    recognitionRef.current = new SpeechRecognitionClass();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript;
      }
      setTranscript(finalTranscript);
    };

    recognitionRef.current.onstart = () => setListening(true);
    recognitionRef.current.onend = () => setListening(false);

    return () => {
      recognitionRef.current?.stop();
    };
  }, [supported]);

  const startListening = () => {
    recognitionRef.current?.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
  };

  return { transcript, listening, startListening, stopListening, supported };
};

export default useSpeechRecognition;
