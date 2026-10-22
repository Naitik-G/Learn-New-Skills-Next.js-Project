// hooks/usePronunciationPractice.ts
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { sentencesByLevel } from "@/data/pronunciation"; 
import { 
  Level, WordAccuracy, Sentence, levelConfig 
} from "@/components/types"; 

// --- Math Helpers ---
const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
};

const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
};


export const usePronunciationPractice = () => {
  // --- States ---
  const [selectedLevel, setSelectedLevel] = useState<Level>('beginner');
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [wordAccuracy, setWordAccuracy] = useState<WordAccuracy[]>([]);
  const [recordings, setRecordings] = useState<(string | null)[]>([]);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [currentRecording, setCurrentRecording] = useState<string | null>(null);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);

  // Custom sentence states
  const [customSentences, setCustomSentences] = useState<Sentence[]>([]);
  const [customSentenceText, setCustomSentenceText] = useState('');
  const [isGeneratingPhonetic, setIsGeneratingPhonetic] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Refs
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const chunksRef = useRef<Blob[]>([]);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Hooks & Context
  const supabase = useMemo(() => createClient(), []);
  const { user, loading } = useAuth();
  const router = useRouter();

  // --- Derived Data ---
  const getCurrentSentences = useCallback((): Sentence[] => {
    if (selectedLevel === 'custom') {
      return customSentences;
    }
    return sentencesByLevel[selectedLevel] || [];
  }, [selectedLevel, customSentences]);

  const currentSentences = getCurrentSentences();
  const currentLevelConfig = levelConfig[selectedLevel];
  const currentSentenceData = currentSentences[currentSentenceIndex];

  // --- REMOVED: Auth redirect - now guests can access ---
  // useEffect(() => {
  //   if (!loading && !user) {
  //     router.push('/login');
  //   }
  // }, [user, loading, router]);

  const clearError = useCallback(() => {
    setErrorMessage('');
    setIsRetrying(false);
    retryCountRef.current = 0;
  }, []);

  const analyzeAccuracy = useCallback((userText: string, targetWords: string[], threshold: number) => {
    const userWords = userText.toLowerCase().split(' ');
    const accuracy: WordAccuracy[] = [];
    
    targetWords.forEach((targetWord, index) => {
      const userWord = userWords[index] || '';
      const similarity = calculateSimilarity(
        targetWord.toLowerCase().replace(/[.,!?]/g, ''),
        userWord.replace(/[.,!?]/g, '')
      );
      
      accuracy.push({
        word: targetWord,
        accuracy: similarity,
        isCorrect: similarity > threshold
      });
    });
    
    setWordAccuracy(accuracy);
  }, []);

  // Speech Recognition Initialization
  const initializeSpeechRecognition = useCallback((currentThreshold: number, targetWords: string[]) => {
    if (!speechRecognitionSupported) return null;

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      if ('SpeechGrammarList' in (window as any)) {
         recognition.grammars = new ((window as any).SpeechGrammarList)();
      }
      
      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage('');
        setIsRetrying(false);
        if (retryCountRef.current === 0) {
          setUserTranscript('');
          setWordAccuracy([]);
        }
      };
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setUserTranscript(finalTranscript.trim());
          analyzeAccuracy(finalTranscript.trim(), targetWords, currentThreshold);
          recognition.stop();
          retryCountRef.current = 0;
        } else if (interimTranscript) {
          setUserTranscript(interimTranscript.trim() + '...');
        }
      };
      
      recognition.onerror = (event: any) => {
        const errorMessages: {[key: string]: string} = {
          'network': 'Network connection issue. Please check your internet connection and try again.',
          'not-allowed': 'Microphone access denied. Please allow microphone permissions and try again.',
          'no-speech': 'No speech detected. Please speak clearly into the microphone.',
          'audio-capture': 'No microphone found. Please connect a microphone and try again.',
          'service-not-allowed': 'Speech recognition service not allowed. Please check your browser settings.',
          'bad-grammar': 'Speech recognition grammar error. Please try again.',
          'language-not-supported': 'Language not supported. Please check your browser settings.',
          'aborted': 'Speech recognition was aborted.'
        };

        const userFriendlyMessage = errorMessages[event.error] || `Speech recognition error: ${event.error}`;
        
        if (event.error === 'network') {
          if (retryCountRef.current < maxRetries) {
            retryCountRef.current++;
            setErrorMessage(`Connection issue. Retrying... (${retryCountRef.current}/${maxRetries})`);
            setIsRetrying(true);
            
            setTimeout(() => {
              if (isListening) { 
                try {
                  recognition.start();
                } catch (error) {
                  setIsListening(false);
                  setIsRetrying(false);
                  setErrorMessage('Unable to connect to speech recognition service. Please try again later.');
                }
              }
            }, 2000);
            return;
          } else {
            setErrorMessage('Unable to connect to speech recognition service after multiple attempts. Please check your internet connection.');
          }
        } else if (event.error !== 'no-speech') {
           setErrorMessage(userFriendlyMessage);
        }
        
        setIsListening(false);
        setIsRetrying(false);
      };
      
      recognition.onend = () => {
        if (!isRetrying) {
          setIsListening(false);
        }
      };
      
      return recognition;
    } catch (error) {
      setSpeechRecognitionSupported(false);
      setErrorMessage('Failed to initialize speech recognition. Please refresh the page and try again.');
      return null;
    }
  }, [speechRecognitionSupported, analyzeAccuracy, isListening]);


  const startRecording = useCallback(async () => {
    if (!currentSentenceData) return;
    
    clearError();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      
      recorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };
      
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(blob);

        setRecordings(prev => {
          const newRecordings = [...prev];
          newRecordings[currentSentenceIndex] = audioUrl;
          return newRecordings;
        });
        setCurrentRecording(audioUrl);

        // Only save to database if user is logged in
        if (user) {
          try {
            const fileName = `${user.id}/${selectedLevel}/${Date.now()}-sentence-${currentSentenceIndex + 1}.wav`;

            const { error: uploadError } = await supabase.storage
              .from("pronunciation-audio")
              .upload(fileName, blob, { 
                contentType: "audio/wav",
                cacheControl: '3600',
                upsert: false 
              });

            if (uploadError) {
              setErrorMessage(`Failed to save recording: ${uploadError.message}`);
              return;
            }

            const { data: publicUrlData } = supabase.storage
              .from("pronunciation-audio")
              .getPublicUrl(fileName);

            await supabase
              .from("pronunciation_attempts")
              .insert({
                user_id: user.id,
                sentence: currentSentenceData.text,
                spoken_text: userTranscript,
                audio_url: publicUrlData.publicUrl,
                accuracy: wordAccuracy.map((w) => w.accuracy),
                difficulty_level: selectedLevel,
                sentence_index: currentSentenceIndex
              });

          } catch (error: any) {
            setErrorMessage(`Unexpected error while saving: ${error.message}`);
          }
        }

        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsListening(true);
      
      const recognition = initializeSpeechRecognition(currentLevelConfig.accuracyThreshold, currentSentenceData.words);
      recognitionRef.current = recognition;
      
      if (recognition) {
        setTimeout(() => {
          if (recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (error) {
              setErrorMessage('Failed to start speech recognition. Please try again.');
              setIsListening(false);
            }
          }
        }, 100);
      } else {
        setErrorMessage('Speech recognition is not available. You can still record audio.');
      }
      
    } catch (error: any) {
      setErrorMessage('Error accessing microphone. Please check permissions and try again.');
      setIsListening(false);
    }
  }, [clearError, currentSentenceData, user, supabase, selectedLevel, currentSentenceIndex, userTranscript, wordAccuracy, currentLevelConfig.accuracyThreshold, initializeSpeechRecognition]);


  const stopRecording = useCallback(() => {
    setIsListening(false);
    setIsRetrying(false);
    retryCountRef.current = 0;
    
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log('Recognition already stopped or stopping');
      }
    }
  }, [mediaRecorder]);

  const speakText = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = selectedLevel === 'beginner' ? 0.7 : selectedLevel === 'intermediate' ? 0.8 : 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      
      speechSynthesis.speak(utterance);
    }
  }, [selectedLevel]);

  const stopSpeech = useCallback(() => {
    speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  const resetPractice = useCallback(() => {
    setUserTranscript('');
    setWordAccuracy([]);
    stopSpeech();
    clearError();
    stopRecording();
  }, [stopSpeech, clearError, stopRecording]);

  const playRecording = useCallback((audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
    }
  }, []);

  const handleLevelChange = useCallback((level: Level) => {
    if (isListening) stopRecording();
    if (isPlaying) stopSpeech();
    
    setSelectedLevel(level);
    clearError();
  }, [isListening, isPlaying, stopRecording, stopSpeech, clearError]);

  const goToNextSentence = useCallback(() => {
    if (currentSentenceIndex < currentSentences.length - 1) {
      const nextIndex = currentSentenceIndex + 1;
      setCurrentSentenceIndex(nextIndex);
      setUserTranscript('');
      setWordAccuracy([]);
      setCurrentRecording(recordings[nextIndex] || null);
      clearError();
    }
  }, [currentSentenceIndex, currentSentences.length, recordings, clearError]);

  const goToPreviousSentence = useCallback(() => {
    if (currentSentenceIndex > 0) {
      const prevIndex = currentSentenceIndex - 1;
      setCurrentSentenceIndex(prevIndex);
      setUserTranscript('');
      setWordAccuracy([]);
      setCurrentRecording(recordings[prevIndex] || null);
      clearError();
    }
  }, [currentSentenceIndex, recordings, clearError]);

  // Load custom sentences only if user is logged in
  useEffect(() => {
    const loadCustomSentences = async () => {
      if (!user || selectedLevel !== 'custom') return;

      try {
        const { data } = await supabase
          .from('custom_sentences')
          .select('text, phonetic, readable_phonetic, words')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        const sentences: Sentence[] = data?.map(item => ({
          text: item.text,
          phonetic: item.phonetic || '',
          readablePhonetic: item.readable_phonetic || '',
          words: item.words || []
        })) || [];

        setCustomSentences(sentences);
      } catch (error) {
        console.error('Error loading custom sentences:', error);
      }
    };
    
    if (user) {
      loadCustomSentences();
    }
  }, [user, supabase, selectedLevel]);

  // Reset states when currentSentences list changes
  useEffect(() => {
    setRecordings(new Array(currentSentences.length).fill(null));
    setCurrentSentenceIndex(0);
    setUserTranscript('');
    setWordAccuracy([]);
    setCurrentRecording(null);
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSpeechRecognitionSupported(false);
      setErrorMessage('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
    }
  }, [currentSentences.length, selectedLevel]);
  
  // Custom Sentence Logic - only for logged in users
  const generatePhoneticWithGemini = useCallback(async (text: string): Promise<{phonetic: string, readablePhonetic: string, words: string[]}> => {
    try {
      const response = await fetch('/api/generate_phonetic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      return {
        phonetic: data.phonetic || '',
        readablePhonetic: data.readablePhonetic || '',
        words: text.split(' ').map(word => word.replace(/[.,!?;:]/g, ''))
      };
    } catch (error) {
      console.error('Error generating phonetic:', error);
      throw error;
    }
  }, []);

  const addCustomSentence = useCallback(async () => {
    if (!customSentenceText.trim() || !user) {
      setErrorMessage('Please enter a valid sentence and login');
      return;
    }

    setIsGeneratingPhonetic(true);
    setErrorMessage('');

    try {
      const { phonetic, readablePhonetic, words } = await generatePhoneticWithGemini(customSentenceText.trim());

      const newSentence: Sentence = {
        text: customSentenceText.trim(),
        phonetic,
        readablePhonetic,
        words
      };

      await supabase
        .from('custom_sentences')
        .insert({
          user_id: user.id,
          text: newSentence.text,
          phonetic: newSentence.phonetic,
          readable_phonetic: newSentence.readablePhonetic,
          words: newSentence.words
        })
        .select()
        .single();
        
      setCustomSentences(prev => [...prev, newSentence]);
      setCustomSentenceText('');
      setShowCustomModal(false);
      setRecordings(prev => [...prev, null]); 

    } catch (error: any) {
      console.error('Error adding custom sentence:', error);
      setErrorMessage(`Failed to generate phonetics: ${error.message}`);
    } finally {
      setIsGeneratingPhonetic(false);
    }
  }, [customSentenceText, user, supabase, generatePhoneticWithGemini]);

  const deleteCustomSentence = useCallback(async (index: number) => {
    if (!user) return;

    try {
      const sentenceToDelete = currentSentences[index];
      
      await supabase
        .from('custom_sentences')
        .delete()
        .eq('user_id', user.id)
        .eq('text', sentenceToDelete.text);

      const newCustomSentences = customSentences.filter((_, i) => i !== index);
      setCustomSentences(newCustomSentences);
      
      if (currentSentenceIndex >= newCustomSentences.length && newCustomSentences.length > 0) {
        setCurrentSentenceIndex(newCustomSentences.length - 1);
      } else if (newCustomSentences.length === 0) {
        setCurrentSentenceIndex(0);
      }
      
      setRecordings(new Array(newCustomSentences.length).fill(null));

    } catch (error: any) {
      console.error('Error deleting custom sentence:', error);
      setErrorMessage(`Failed to delete sentence: ${error.message}`);
    }
  }, [user, supabase, customSentences, currentSentences, currentSentenceIndex]);
  
  
  // --- Return object ---
  return {
    user, loading, audioRef, selectedLevel, currentSentenceIndex, isListening, customSentences,
    isPlaying, userTranscript, wordAccuracy, currentRecording, speechRecognitionSupported, 
    errorMessage, isRetrying, customSentenceText, isGeneratingPhonetic, showCustomModal,
    currentSentences, currentLevelConfig, currentSentenceData,
    setSelectedLevel: handleLevelChange, setShowCustomModal, setCustomSentenceText,
    clearError, speakText, stopSpeech, startRecording, stopRecording, playRecording, 
    goToNextSentence, goToPreviousSentence, resetPractice, addCustomSentence, deleteCustomSentence,
  };
};