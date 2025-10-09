// components/ai-topics/TopicContent.tsx
'use client';

import React, { useState } from 'react';
import { BookOpen, Sparkles, Headphones } from 'lucide-react';
import WordPopup from '@/components/DictionaryPopup';
import { SidebarTrigger as UISidebarTrigger } from '@/components/ui/sidebar';
import { Topic } from '@/components/types';
import { AudioRecorder } from '@/components/ai-topics/AudioRecorder';

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
  const [expandedAudioIndex, setExpandedAudioIndex] = useState<number | null>(null);

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

  const toggleAudioRecorder = (index: number) => {
    setExpandedAudioIndex(expandedAudioIndex === index ? null : index);
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
            
            {/* Conversation Lines with Audio Recorder */}
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              {conversationLines.map((line, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur" />
                  
                  <div className="relative bg-slate-900/30 backdrop-blur-sm border border-slate-700/30 rounded-lg overflow-hidden hover:border-slate-600/50 transition-colors duration-200">
                    {/* Paragraph Content */}
                    <p className="text-sm sm:text-base md:text-lg leading-relaxed text-slate-200 p-3 sm:p-4 md:p-6">
                      {line}
                    </p>
                    
                    {/* Audio Controls Section */}
                    <div className="border-t border-slate-700/30 bg-slate-900/50 px-3 sm:px-4 md:px-6 py-2">
                      <button
                        onClick={() => toggleAudioRecorder(idx)}
                        className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-blue-400 transition-colors"
                      >
                        <Headphones size={14} className="sm:w-4 sm:h-4" />
                        <span>{expandedAudioIndex === idx ? 'Hide' : 'Show'} Audio Recorder</span>
                      </button>
                      
                      {/* Audio Recorder - Only shown when expanded */}
                      {expandedAudioIndex === idx && (
                        <div className="mt-3">
                          <AudioRecorder
                            topicId={topic.id}
                            parag