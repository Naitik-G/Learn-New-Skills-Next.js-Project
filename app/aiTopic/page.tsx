'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { topicsData } from '@/data/topicsData';

// Components
import { TopicsSidebar } from '@/components/conversation/TopicsSidebar';
import { TopicView } from '@/components/conversation/TopicView';
import WordPopup from '@/components/DictionaryPopup';
import { Topic, CATEGORIES } from '@/components/types';
// Import the modal we are about to use logic for
import { Save, Sparkles, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TopicsPage() {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);
  const [openCategories, setOpenCategories] = useState<string[]>(Object.keys(CATEGORIES));
  const [customTopics, setCustomTopics] = useState<Topic[]>([]);

  // AI Generation States
  const [showAIModal, setShowAIModal] = useState(false);
  const [conversationTopic, setConversationTopic] = useState('');
  const [participantCount, setParticipantCount] = useState<2 | 3>(2);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const { user } = useAuth();
  const supabase = createClient();

  // Normalize static topics
  const normalizeTopicData = (rawTopics: Record<string, any>): Record<string, Topic> => {
    return Object.entries(rawTopics).reduce((acc, [id, topic]) => {
      let conversation: string[] = [];
      if (Array.isArray(topic.conversation)) {
        conversation = topic.conversation;
      } else if (topic.conversations && typeof topic.conversations === 'object') {
        conversation = Object.values(topic.conversations)
          .flatMap((scene: any) => scene.dialogue ?? []);
      }
      acc[id] = {
        id,
        title: topic.title,
        conversation,
        category: topic.category || 'chemistry',
        isCustom: false,
      };
      return acc;
    }, {} as Record<string, Topic>);
  };

  const allTopics = useMemo(() => {
    const normalized = normalizeTopicData(topicsData as Record<string, any>);
    const customMap = customTopics.reduce((acc, t) => {
      acc[t.id] = t;
      return acc;
    }, {} as Record<string, Topic>);
    return { ...normalized, ...customMap };
  }, [customTopics]);

  const groupedTopics = useMemo(() => {
    return Object.entries(allTopics).reduce((acc, [id, t]) => {
      const catKey = t.isCustom ? 'custom' : (t.category || 'chemistry');
      if (!acc[catKey]) acc[catKey] = [];
      acc[catKey].push(t);
      return acc;
    }, {} as Record<string, Topic[]>);
  }, [allTopics]);

  const currentTopic = selectedId ? allTopics[selectedId] : null;

  // --- LOGIC: Fetch Custom Topics ---
  const loadCustomTopics = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('custom_conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setCustomTopics(data.map(item => ({
        id: item.id,
        title: item.title,
        conversation: item.conversation || [],
        category: 'custom',
        isCustom: true,
        participants: item.participants || 2
      })));
    }
  };

  // --- LOGIC: Generate Conversation ---
  const handleGenerateAI = async () => {
    if (!conversationTopic.trim() || !user) return;
    setIsGenerating(true);
    setErrorMessage('');
    try {
      const response = await fetch('/api/generate_conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: conversationTopic.trim(), participants: participantCount }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const { data: savedData, error } = await supabase.from('custom_conversations').insert({
        user_id: user.id,
        title: conversationTopic.trim(),
        conversation: data.conversation,
        participants: participantCount,
        topic_description: conversationTopic.trim()
      }).select().single();

      if (error) throw error;

      const newTopic: Topic = {
        id: savedData.id,
        title: savedData.title,
        conversation: savedData.conversation,
        category: 'custom',
        isCustom: true,
        participants: participantCount
      };

      setCustomTopics(prev => [newTopic, ...prev]);
      setSelectedId(newTopic.id);
      setShowAIModal(false);
      setConversationTopic('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('custom_conversations').delete().eq('id', id);
    if (!error) {
      setCustomTopics(prev => prev.filter(t => t.id !== id));
      if (selectedId === id) setSelectedId(null);
    }
  };

  useEffect(() => { if (user) loadCustomTopics(); }, [user]);

  const handleTextSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim()) {
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      setSelectedWord(sel.toString().trim());
      setPopupPos({ x: rect.left + rect.width / 2, y: rect.top - 10 });
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-slate-950 text-slate-100" onMouseUp={handleTextSelection}>
        <TopicsSidebar 
          groupedTopics={groupedTopics} 
          selectedId={selectedId}
          onSelect={setSelectedId}
          // FIX: Pass the modal open function
          onOpenAIModal={() => setShowAIModal(true)} 
          openCategories={openCategories}
          toggleCategory={(id) => setOpenCategories(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
          )}
          onDelete={handleDelete}
          user={user}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="border-b border-slate-800 px-6 py-4 flex items-center gap-3 bg-slate-900/50 backdrop-blur-sm">
            <SidebarTrigger className="hover:bg-slate-800" />
            <div className="w-[2px] h-6 bg-slate-700 mx-2" />
            <h1 className="text-lg font-bold text-slate-100">
              {currentTopic ? currentTopic.title : 'Learning Topics'}
            </h1>
          </header>

          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <TopicView 
              topic={currentTopic} 
              // FIX: Pass the modal open function here too
              onOpenAIModal={() => setShowAIModal(true)} 
              user={user} 
            />
          </main>
        </div>

        {/* --- AI GENERATION MODAL --- */}
        {showAIModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="text-purple-400" /> New AI Conversation
                </h3>
                <button onClick={() => setShowAIModal(false)}>
                  <X className="text-slate-500 hover:text-white" />
                </button>
              </div>
              
              <textarea
                value={conversationTopic}
                onChange={(e) => setConversationTopic(e.target.value)}
                placeholder="What should they talk about? (e.g. Benefits of Solar Energy)"
                className="w-full bg-slate-800 border-slate-700 rounded-xl p-4 mb-4 focus:ring-2 focus:ring-purple-500 outline-none h-32 text-white"
              />

              <div className="flex gap-4 mb-6">
                {[2, 3].map(n => (
                  <button 
                    key={n} 
                    onClick={() => setParticipantCount(n as 2|3)} 
                    className={cn(
                      "flex-1 py-3 border rounded-xl transition-all", 
                      participantCount === n ? "bg-purple-600/20 border-purple-500 text-purple-400" : "bg-slate-800 border-slate-700 text-slate-400"
                    )}
                  >
                    {n} Participants
                  </button>
                ))}
              </div>

              {errorMessage && <p className="text-red-400 text-sm mb-4">{errorMessage}</p>}

              <button
                onClick={handleGenerateAI}
                disabled={isGenerating || !conversationTopic.trim()}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGenerating ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                {isGenerating ? 'Generating...' : 'Start Generating'}
              </button>
            </div>
          </div>
        )}

        {selectedWord && popupPos && (
          <WordPopup 
            word={selectedWord} 
            position={popupPos} 
            onClose={() => setSelectedWord(null)} 
          />
        )}
      </div>
    </SidebarProvider>
  );
}