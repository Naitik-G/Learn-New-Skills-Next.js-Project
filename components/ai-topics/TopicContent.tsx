// components/ai-topics/TopicContent.tsx
'use client';
import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Sparkles, Mic, MicOff, Play, Pause, Trash2, Volume2, VolumeX, Headphones } from 'lucide-react';
import WordPopup from '@/components/DictionaryPopup';
import { SidebarTrigger as UISidebarTrigger } from '@/components/ui/sidebar';
import { Topic } from '@/components/types';

interface TopicContentProps {
  topic: Topic | null;
  user: any;
  selectedWord: string | null;
  popupPos: { x: number; y: number } | null;
  getParticipantIcon: (count: number) => React.ElementType;
  getCurrentConversationLines: () => string[];
  getAvailableScenes: () => { key: string; title: string; setting: string }[];
  currentScene: string | null;
  switchScene: (sceneKey: string) => void;
}

interface Recording {
  blob: Blob;
  url: string;
  timestamp: number;
}

export function TopicContent({
  topic, user, selectedWord, popupPos,
  getParticipantIcon, getCurrentConversationLines, 
  getAvailableScenes, currentScene, switchScene
}: TopicContentProps) {
  
  const conversationLines = getCurrentConversationLines();
  const availableScenes = getAvailableScenes();
  const hasMultipleScenes = availableScenes.length > 1;

  // Recording states
  const [recordings, setRecordings] = useState<Map<number, Recording>>(new Map());
  const [recordingIndex, setRecordingIndex] = useState<number | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  
  // Text-to-Speech states
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(0.7);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Generate storage key based on topic and scene
  const getStorageKey = () => {
    if (!topic) return null;
    const sceneKey = currentScene || 'default';
    return `recording_${topic.id}_${sceneKey}`;
  };

  // Load recordings from localStorage
  useEffect(() => {
    const loadRecordings = async () => {
      const storageKey = getStorageKey();
      if (!storageKey) return;

      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const data = JSON.parse(stored);
          const newRecordings = new Map<number, Recording>();
          
          for (const [index, recording] of Object.entries(data)) {
            const { base64Data, timestamp } = recording as any;
            
            // Convert base64 back to Blob
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'audio/webm' });
            const url = URL.createObjectURL(blob);
            
            newRecordings.set(parseInt(index), { blob, url, timestamp });
          }
          
          setRecordings(newRecordings);
        }
      } catch (error) {
        console.error('Error loading recordings:', error);
      }
    };

    loadRecordings();
  }, [topic, currentScene]);

  // Save recordings to localStorage
  const saveRecordingsToStorage = async (newRecordings: Map<number, Recording>) => {
    const storageKey = getStorageKey();
    if (!storageKey) return;

    try {
      const dataToStore: any = {};
      
      for (const [index, recording] of newRecordings.entries()) {
        // Convert Blob to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
          };
          reader.readAsDataURL(recording.blob);
        });
        
        const base64Data = await base64Promise;
        dataToStore[index] = {
          base64Data,
          timestamp: recording.timestamp
        };
      }
      
      localStorage.setItem(storageKey, JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Error saving recordings:', error);
    }
  };

  // Clean up audio URLs on unmount
  useEffect(() => {
    return () => {
      recordings.forEach(recording => {
        URL.revokeObjectURL(recording.url);
      });
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Start recording
  const startRecording = async (index: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        
        const newRecordings = new Map(recordings);
        
        // Revoke old URL if exists
        const oldRecording = newRecordings.get(index);
        if (oldRecording) {
          URL.revokeObjectURL(oldRecording.url);
        }
        
        newRecordings.set(index, { blob, url, timestamp: Date.now() });
        setRecordings(newRecordings);
        
        // Save to localStorage
        await saveRecordingsToStorage(newRecordings);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        setAudioStream(null);
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setRecordingIndex(index);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setMediaRecorder(null);
      setRecordingIndex(null);
    }
  };

  // Play recording
  const playRecording = (index: number) => {
    const recording = recordings.get(index);
    if (!recording || !audioRef.current) return;

    if (playingIndex === index) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlayingIndex(null);
    } else {
      audioRef.current.src = recording.url;
      audioRef.current.play();
      setPlayingIndex(index);
    }
  };

  // Delete recording
  const deleteRecording = async (index: number) => {
    const recording = recordings.get(index);
    if (recording) {
      URL.revokeObjectURL(recording.url);
    }
    
    const newRecordings = new Map(recordings);
    newRecordings.delete(index);
    setRecordings(newRecordings);
    
    // Save to localStorage
    await saveRecordingsToStorage(newRecordings);
    
    if (playingIndex === index) {
      setPlayingIndex(null);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  };

  // Audio ended event
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setPlayingIndex(null);
    };

    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Text-to-Speech functionality
  const speakText = (text: string, index: number) => {
    // Stop any currently speaking text
    if (speakingIndex !== null) {
      window.speechSynthesis.cancel();
      if (speakingIndex === index) {
        setSpeakingIndex(null);
        return;
      }
    }

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speechRate;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.lang = 'en-US';
      
      utterance.onstart = () => {
        setSpeakingIndex(index);
      };
      
      utterance.onend = () => {
        setSpeakingIndex(null);
      };
      
      utterance.onerror = () => {
        setSpeakingIndex(null);
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech is not supported in your browser.');
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
    }
  };

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Mobile Header
  const MobileHeader = () => (
    <div className="border-b border-slate-800 px-3 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 bg-slate-900/30 backdrop-blur-sm">
      <UISidebarTrigger className="text-slate-400 hover:text-white hover:bg-slate-700/50 p-1.5 sm:p-2 rounded-md transition-colors" />
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        {topic && (
          <>
            <div className="w-1 h-4 sm:h-6 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full flex-shrink-0" />
            {topic.isCustom && (
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-purple-600/20 border border-purple-500/30 rounded-full text-xs text-purple-300">
                <Sparkles size={12} />
                <span>AI Generated</span>
              </div>
            )}
          </>
        )}
        <h1 className="text-sm sm:text-lg font-bold text-slate-100 truncate">
          {topic ? topic.title : 'Learning'}
        </h1>
      </div>
    </div>
  );

  // Scene Navigation Component
  const SceneNavigation = () => {
    if (!hasMultipleScenes) return null;

    return (
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-3">
          <h3 className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wide">
            Scenes
          </h3>
          <div className="h-px flex-1 bg-slate-700/50"></div>
        </div>
        <div className="flex flex-wrap gap-2">
          {availableScenes.map((scene) => (
            <button
              key={scene.key}
              onClick={() => switchScene(scene.key)}
              className={`
                px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 border
                ${currentScene === scene.key
                  ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30 text-blue-300 shadow-lg shadow-blue-500/10'
                  : 'bg-slate-800/30 border-slate-600/30 text-slate-400 hover:bg-slate-700/50 hover:border-slate-500/50 hover:text-slate-200'
                }
              `}
            >
              {scene.title}
            </button>
          ))}
        </div>
        
        {/* Current Scene Setting */}
        {currentScene && (
          <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-slate-800/20 border border-slate-700/30 rounded-lg">
            <p className="text-xs text-slate-400">
              <span className="font-medium text-slate-300">Setting:</span>{' '}
              {availableScenes.find(s => s.key === currentScene)?.setting}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 min-h-0">
      <MobileHeader />
      
      {/* Content Area */}
      <div className="flex-1 p-3 sm:p-6 md:p-8 overflow-y-auto relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {!topic ? (
          <div className="flex items-center justify-center h-full px-4">
            <div className="text-center space-y-4 sm:space-y-6 max-w-md">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-2xl opacity-20 animate-pulse" />
                <BookOpen className="h-12 w-12 sm:h-16 md:h-20 sm:w-16 md:w-20 text-slate-400 mx-auto relative z-10" />
              </div>
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-200">
                  Select a topic to start reading
                </h3>
                <p className="text-sm sm:text-base text-slate-400 leading-relaxed hidden sm:block">
                  Choose from the categories in the sidebar to explore different subjects
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Topic Header */}
            <div className="mb-4 sm:mb-6 md:mb-8 relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-20" />
              <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-3 sm:p-4 md:p-6">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-0">
                  <div className="flex-1 w-full sm:w-auto">
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent break-words">
                      {topic.title}
                    </h1>
                    {topic.summary && (
                      <p className="text-sm sm:text-base text-slate-300 mb-3 sm:mb-4 leading-relaxed">
                        {topic.summary}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-16 sm:w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                      <div className="h-1 w-6 sm:w-8 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full" />
                    </div>
                  </div>
                  
                  {topic.isCustom && topic.participants && (
                    <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-slate-800/50 border border-slate-600/30 rounded-lg shrink-0 self-start sm:self-auto">
                      {React.createElement(getParticipantIcon(topic.participants), {
                        size: 14,
                        className: "text-slate-400 sm:w-4 sm:h-4"
                      })}
                      <span className="text-xs sm:text-sm text-slate-300 whitespace-nowrap">
                        {topic.participants} participants
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Scene Navigation */}
            <SceneNavigation />
            
            {/* Conversation Lines with Recording */}
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              {conversationLines.map((line, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur" />
                  <div className="relative bg-slate-900/30 backdrop-blur-sm border border-slate-700/30 rounded-lg hover:border-slate-600/50 transition-colors duration-200">
                    {/* Paragraph Text */}
                    <p className="text-sm sm:text-base md:text-lg leading-relaxed text-slate-200 p-3 sm:p-4 md:p-6">
                      {line}
                    </p>
                    
                    {/* Recording Controls */}
                    <div className="border-t border-slate-700/30 p-3 sm:p-4 flex items-center justify-between bg-slate-800/20">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Listen (Text-to-Speech) Button */}
                        <button
                          onClick={() => speakingIndex === idx ? stopSpeaking() : speakText(line, idx)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                            speakingIndex === idx
                              ? 'bg-orange-600 hover:bg-orange-700 animate-pulse'
                              : 'bg-purple-600 hover:bg-purple-700'
                          } text-white`}
                        >
                          {speakingIndex === idx ? (
                            <>
                              <VolumeX size={16} />
                              <span className="text-xs sm:text-sm font-medium">Stop</span>
                            </>
                          ) : (
                            <>
                              <Headphones size={16} />
                              <span className="text-xs sm:text-sm font-medium">Listen</span>
                            </>
                          )}
                        </button>

                        {/* Record/Stop Button */}
                        {recordingIndex === idx ? (
                          <button
                            onClick={stopRecording}
                            className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors animate-pulse"
                          >
                            <MicOff size={16} />
                            <span className="text-xs sm:text-sm font-medium">Stop</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => startRecording(idx)}
                            disabled={recordingIndex !== null}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                          >
                            <Mic size={16} />
                            <span className="text-xs sm:text-sm font-medium">Record</span>
                          </button>
                        )}

                        {/* Play Button */}
                        {recordings.has(idx) && (
                          <>
                            <button
                              onClick={() => playRecording(idx)}
                              className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                            >
                              {playingIndex === idx ? (
                                <>
                                  <Pause size={16} />
                                  <span className="text-xs sm:text-sm font-medium">Pause</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 size={16} />
                                  <span className="text-xs sm:text-sm font-medium">Play</span>
                                </>
                              )}
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => deleteRecording(idx)}
                              className="flex items-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-lg transition-colors"
                              title="Delete recording"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Recording Status */}
                      <div className="flex items-center gap-2">
                        {speakingIndex === idx && (
                          <div className="text-xs text-orange-400 flex items-center gap-1">
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                            <span className="hidden sm:inline">Speaking</span>
                          </div>
                        )}
                        {recordings.has(idx) && (
                          <div className="text-xs text-slate-400 hidden sm:block">
                            <span className="inline-flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Recorded
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Popup for selected word */}
        {selectedWord && popupPos && (
          <WordPopup
            word={selectedWord}
            position={popupPos}
            onClose={() => selectedWord}
          />
        )}

        {/* Hidden Audio Element */}
        <audio ref={audioRef} className="hidden" />
      </div>
    </div>
  );
}