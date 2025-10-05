// components/ai-topics/TopicContent.tsx
import React from 'react';
import Link from 'next/link';
import { BookOpen, Sparkles, Play, Pause } from 'lucide-react';
import WordPopup from '@/components/DictionaryPopup';
import { SidebarTrigger as UISidebarTrigger } from '@/components/ui/sidebar';
import { Topic, ConversationScene } from '@/components/types';

interface TopicContentProps {
  topic: Topic | null;
  user: any;
  selectedWord: string | null;
  popupPos: { x: number; y: number } | null;
  setShowAIModal: (show: boolean) => void;
  getParticipantIcon: (count: number) => React.ElementType;
  getCurrentConversationLines: () => string[];
  getAvailableScenes: () => { key: string; title: string; setting: string }[];
  currentScene: string | null;
  switchScene: (sceneKey: string) => void;
}

export function TopicContent({
  topic, user, selectedWord, popupPos, setShowAIModal, 
  getParticipantIcon, getCurrentConversationLines, 
  getAvailableScenes, currentScene, switchScene
}: TopicContentProps) {
  
  const conversationLines = getCurrentConversationLines();
  const availableScenes = getAvailableScenes();
  const hasMultipleScenes = availableScenes.length > 1;

  // Mobile Header
  const MobileHeader = () => (
    <div className="border-b border-slate-800 px-6 py-4 flex items-center gap-3 bg-slate-900/30 backdrop-blur-sm">
      <UISidebarTrigger className="text-slate-400 hover:text-white hover:bg-slate-700/50 p-2 rounded-md transition-colors" />
      <div className="flex items-center gap-3">
        {topic && (
          <>
            <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full" />
            {topic.isCustom && (
              <div className="flex items-center gap-1 px-2 py-1 bg-purple-600/20 border border-purple-500/30 rounded-full text-xs text-purple-300">
                <Sparkles size={12} />
                <span>AI Generated</span>
              </div>
            )}
          </>
        )}
        <h1 className="text-lg font-bold text-slate-100 truncate">
          {topic ? topic.title : 'Learning Topics'}
        </h1>
      </div>
    </div>
  );

  // Scene Navigation Component
  const SceneNavigation = () => {
    if (!hasMultipleScenes) return null;

    return (
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-3">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
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
                px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border
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
          <div className="mt-3 p-3 bg-slate-800/20 border border-slate-700/30 rounded-lg">
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
    <div className="flex-1 flex flex-col bg-slate-950">
      <MobileHeader />
      
      {/* Content Area */}
      <div className="flex-1 p-8 overflow-y-auto relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {!topic ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-6 max-w-md">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-2xl opacity-20 animate-pulse" />
                <BookOpen className="h-20 w-20 text-slate-400 mx-auto relative z-10" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-slate-200">
                  Select a topic to start reading
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Choose from the categories in the sidebar to explore different subjects
                  {user && ' or create custom AI-generated conversations'}
                </p>
                {user && (
                  <button
                    onClick={() => setShowAIModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-lg font-medium transition-all duration-200 shadow-lg"
                  >
                    <Sparkles size={20} />
                    Generate AI Conversation
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Topic Header */}
            <div className="mb-8 relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-20" />
              <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                      {topic.title}
                    </h1>
                    {topic.summary && (
                      <p className="text-slate-300 mb-4 leading-relaxed">
                        {topic.summary}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                      <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full" />
                    </div>
                  </div>
                  
                  {topic.isCustom && topic.participants && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 border border-slate-600/30 rounded-lg shrink-0">
                      {React.createElement(getParticipantIcon(topic.participants), {
                        size: 16,
                        className: "text-slate-400"
                      })}
                      <span className="text-sm text-slate-300">
                        {topic.participants} participants
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Scene Navigation */}
            <SceneNavigation />
            
            {/* Conversation Lines */}
            <div className="space-y-8">
              {conversationLines.map((line, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur" />
                  <p className="relative text-lg leading-relaxed text-slate-200 bg-slate-900/30 backdrop-blur-sm border border-slate-700/30 rounded-lg p-6 hover:border-slate-600/50 transition-colors duration-200">
                    {line}
                  </p>
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
      </div>
    </div>
  );
}