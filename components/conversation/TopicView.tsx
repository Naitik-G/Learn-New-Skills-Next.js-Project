'use client';
import React from 'react';
import { Sparkles, BookOpen, } from 'lucide-react';
import { Topic } from '@/components/types';

interface TopicViewProps {
  topic: Topic | null;
  onOpenAIModal: () => void;
  user: any;
}

export const TopicView = ({ topic, onOpenAIModal, user }: TopicViewProps) => {
  if (!topic) {
    return (
      <div className="flex items-center justify-center h-full text-center">
        <div className="max-w-md space-y-6">
          <BookOpen className="h-20 w-20 text-slate-400 mx-auto" />
          <h3 className="text-2xl font-bold">Select a topic to start reading</h3>
          {user && (
            <button onClick={onOpenAIModal} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg">
              <Sparkles size={20} /> Generate AI Conversation
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
        {topic.title}
      </h1>
      <div className="space-y-8">
        {topic.conversation.map((line, idx) => (
          <div key={idx} className="relative group">
            <p className="text-lg leading-relaxed text-slate-200 bg-slate-900/30 border border-slate-700/30 rounded-lg p-6 hover:border-slate-600 transition-colors">
              {line}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};