'use client';
import React, { useState, useEffect } from 'react';
import { topicsData } from '@/data/topicsData';
import WordPopup from '@/components/DictionaryPopup';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, BookOpen, Atom, FlaskConical, Dna, Calculator, Clock, Users,
  Plus, Sparkles, Loader2, Save, Trash2, User, Users2, Users as Users3,
  MessageCircle, X
} from 'lucide-react';

// Enhanced topic interface
interface Topic {
  id: string;
  title: string;
  conversation: string[];
  category?: string;
  isCustom?: boolean;
  participants?: number;
  createdAt?: string;
}

// Categories configuration with enhanced dark theme colors
const categories = {
  chemistry: {
    name: 'Chemistry',
    icon: FlaskConical,
    color: 'text-emerald-400 group-hover:text-emerald-300',
    bgColor: 'hover:bg-emerald-500/10'
  },
  physics: {
    name: 'Physics',
    icon: Atom,
    color: 'text-cyan-400 group-hover:text-cyan-300',
    bgColor: 'hover:bg-cyan-500/10'
  },
  biology: {
    name: 'Biology',
    icon: Dna,
    color: 'text-green-400 group-hover:text-green-300',
    bgColor: 'hover:bg-green-500/10'
  },
  math: {
    name: 'Mathematics',
    icon: Calculator,
    color: 'text-violet-400 group-hover:text-violet-300',
    bgColor: 'hover:bg-violet-500/10'
  },
  history: {
    name: 'History',
    icon: Clock,
    color: 'text-amber-400 group-hover:text-amber-300',
    bgColor: 'hover:bg-amber-500/10'
  },
  politics: {
    name: 'Politics',
    icon: Users,
    color: 'text-rose-400 group-hover:text-rose-300',
    bgColor: 'hover:bg-rose-500/10'
  },
  custom: {
    name: 'Custom Conversations',
    icon: MessageCircle,
    color: 'text-purple-400 group-hover:text-purple-300',
    bgColor: 'hover:bg-purple-500/10'
  }
};

export default function TopicsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);
  const [openCategories, setOpenCategories] = useState<string[]>(Object.keys(categories));

  // AI Conversation Generation States
  const [showAIModal, setShowAIModal] = useState(false);
  const [conversationTopic, setConversationTopic] = useState('');
  const [participantCount, setParticipantCount] = useState<2 | 3>(2);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customTopics, setCustomTopics] = useState<Topic[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const { user } = useAuth();
  const supabase = createClient();

  // Combined topics data
  const allTopics = {
    ...topicsData,
    ...customTopics.reduce((acc, topic) => {
      acc[topic.id] = topic;
      return acc;
    }, {} as Record<string, Topic>)
  };

  const topic = selectedId ? allTopics[selectedId] : null;

  // Group topics by category
  const groupedTopics = Object.entries(allTopics).reduce((acc, [id, topic]) => {
    const categoryKeys = Object.keys(categories).filter(k => k !== 'custom');
    const category = topic.isCustom ? 'custom' : (topic.category || categoryKeys[Math.floor(Math.random() * categoryKeys.length)]);
    
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ id, ...topic });
    return acc;
  }, {} as Record<string, Array<Topic & { id: string }>>);

  // Load custom topics from database
  const loadCustomTopics = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('custom_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading custom topics:', error);
        return;
      }

      const topics: Topic[] = data?.map(item => ({
        id: item.id,
        title: item.title,
        conversation: item.conversation || [],
        category: 'custom',
        isCustom: true,
        participants: item.participants || 2,
        createdAt: item.created_at
      })) || [];

      setCustomTopics(topics);
    } catch (error) {
      console.error('Error loading custom topics:', error);
    }
  };

  // Generate conversation using Gemini AI
  const generateConversation = async () => {
    if (!conversationTopic.trim() || !user) {
      setErrorMessage('Please enter a valid topic');
      return;
    }

    setIsGenerating(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/generate_conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          topic: conversationTopic.trim(),
          participants: participantCount
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Save to database
      const { data: savedData, error } = await supabase
        .from('custom_conversations')
        .insert({
          user_id: user.id,
          title: conversationTopic.trim(),
          conversation: data.conversation,
          participants: participantCount,
          topic_description: conversationTopic.trim()
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Add to local state
      const newTopic: Topic = {
        id: savedData.id,
        title: conversationTopic.trim(),
        conversation: data.conversation,
        category: 'custom',
        isCustom: true,
        participants: participantCount,
        createdAt: savedData.created_at
      };

      setCustomTopics(prev => [newTopic, ...prev]);
      setSelectedId(newTopic.id);
      setConversationTopic('');
      setShowAIModal(false);

    } catch (error: any) {
      console.error('Error generating conversation:', error);
      setErrorMessage(`Failed to generate conversation: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Delete custom conversation
  const deleteCustomConversation = async (topicId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('custom_conversations')
        .delete()
        .eq('id', topicId)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(error.message);
      }

      setCustomTopics(prev => prev.filter(topic => topic.id !== topicId));
      
      if (selectedId === topicId) {
        setSelectedId(null);
      }

    } catch (error: any) {
      console.error('Error deleting conversation:', error);
      setErrorMessage(`Failed to delete conversation: ${error.message}`);
    }
  };

  // Load custom topics when user changes
  useEffect(() => {
    if (user) {
      loadCustomTopics();
    }
  }, [user]);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim() !== '') {
      const word = selection.toString().trim();
      const rect = selection.getRangeAt(0).getBoundingClientRect();
      setSelectedWord(word);
      setPopupPos({ x: rect.left + rect.width / 2, y: rect.top - 10 });
    }
  };

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const getParticipantIcon = (count: number) => {
    switch (count) {
      case 2: return Users2;
      case 3: return Users3;
      default: return Users;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-slate-950 text-slate-100" onMouseUp={handleTextSelection}>
        {/* Enhanced Dark Theme Sidebar */}
        <Sidebar className="border-r border-slate-800 bg-slate-900">
          <SidebarHeader className="border-b border-slate-800 px-4 py-4 bg-slate-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Topics
                </h2>
              </div>
              
              {/* AI Generation Button - Only for authenticated users */}
              {user && (
                <button
                  onClick={() => setShowAIModal(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg"
                >
                  <Sparkles size={16} />
                  <span className="hidden sm:inline">AI</span>
                </button>
              )}
            </div>
          </SidebarHeader>
          
          <SidebarContent className="px-3 py-2 bg-slate-900">
            <SidebarMenu className="space-y-2">
              {Object.entries(categories).map(([categoryId, category]) => {
                const Icon = category.icon;
                const categoryTopics = groupedTopics[categoryId] || [];
                const isOpen = openCategories.includes(categoryId);
                
                return (
                  <SidebarMenuItem key={categoryId}>
                    <Collapsible open={isOpen} onOpenChange={() => toggleCategory(categoryId)}>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton 
                          className={cn(
                            "w-full justify-between py-3 px-3 group",
                            "bg-slate-800/30 hover:bg-slate-700/50",
                            "border border-slate-700/50 hover:border-slate-600",
                            "rounded-lg transition-all duration-200",
                            category.bgColor
                          )}
                          variant="ghost"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={cn("h-5 w-5 transition-colors", category.color)} />
                            <span className="font-semibold text-slate-200 group-hover:text-white">
                              {category.name}
                            </span>
                            <span className="ml-auto text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded-full">
                              {categoryTopics.length}
                            </span>
                          </div>
                          <ChevronDown className={cn(
                            "h-4 w-4 transition-all duration-300 text-slate-400 group-hover:text-slate-300",
                            isOpen ? "rotate-180" : ""
                          )} />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent className="mt-2">
                        <SidebarMenuSub className="ml-2 space-y-1">
                          {categoryTopics.map((topicItem) => {
                            const ParticipantIcon = topicItem.isCustom ? getParticipantIcon(topicItem.participants || 2) : null;
                            
                            return (
                              <SidebarMenuSubItem key={topicItem.id}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={selectedId === topicItem.id}
                                >
                                  <div className="flex items-center w-full">
                                    <button
                                      onClick={() => setSelectedId(topicItem.id)}
                                      className={cn(
                                        "flex-1 text-left px-4 py-2.5 rounded-md text-sm transition-all duration-200",
                                        "border border-transparent",
                                        "hover:bg-slate-700/30 hover:border-slate-600/50 hover:text-white",
                                        selectedId === topicItem.id 
                                          ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30 text-blue-300 shadow-lg shadow-blue-500/10" 
                                          : "text-slate-300"
                                      )}
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className={cn(
                                          "w-1.5 h-1.5 rounded-full transition-colors",
                                          selectedId === topicItem.id ? "bg-blue-400" : "bg-slate-600"
                                        )} />
                                        <span className="flex-1">{topicItem.title}</span>
                                        {ParticipantIcon && (
                                          <ParticipantIcon className="w-3 h-3 text-slate-400" />
                                        )}
                                      </div>
                                    </button>
                                    
                                    {/* Delete button for custom conversations */}
                                    {topicItem.isCustom && user && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteCustomConversation(topicItem.id);
                                        }}
                                        className="ml-2 p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                        title="Delete conversation"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    )}
                                  </div>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                          {categoryTopics.length === 0 && (
                            <SidebarMenuSubItem>
                              <div className="px-4 py-3 text-sm text-slate-500 italic border border-slate-700/30 rounded-md bg-slate-800/20">
                                {categoryId === 'custom' ? 'No custom conversations yet' : 'No topics available'}
                              </div>
                            </SidebarMenuSubItem>
                          )}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-slate-950">
          {/* Header with sidebar trigger for mobile */}
          <div className="border-b border-slate-800 px-6 py-4 flex items-center gap-3 bg-slate-900/30 backdrop-blur-sm">
            <SidebarTrigger className="text-slate-400 hover:text-white hover:bg-slate-700/50 p-2 rounded-md transition-colors" />
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
              <h1 className="text-lg font-bold text-slate-100">
                {topic ? topic.title : 'Learning Topics'}
              </h1>
            </div>
          </div>

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
                <div className="mb-8 relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-20" />
                  <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                          {topic.title}
                        </h1>
                        <div className="flex items-center gap-2">
                          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                          <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full" />
                        </div>
                      </div>
                      
                      {topic.isCustom && topic.participants && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 border border-slate-600/30 rounded-lg">
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
                
                <div className="space-y-8">
                  {topic.conversation.map((line, idx) => (
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
                onClose={() => setSelectedWord(null)}
              />
            )}
          </div>
        </div>

        {/* AI Conversation Generation Modal */}
        {showAIModal && user && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-lg shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                  <Sparkles className="text-purple-400" size={24} />
                  Generate AI Conversation
                </h3>
                <button
                  onClick={() => {
                    setShowAIModal(false);
                    setConversationTopic('');
                    setErrorMessage('');
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Conversation Topic
                  </label>
                  <textarea
                    value={conversationTopic}
                    onChange={(e) => setConversationTopic(e.target.value)}
                    placeholder="Describe the topic you want people to discuss... (e.g., 'The impact of artificial intelligence on education')"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={3}
                    disabled={isGenerating}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Number of Participants
                  </label>
                  <div className="flex gap-3">
                    {[2, 3].map((count) => {
                      const Icon = getParticipantIcon(count);
                      return (
                        <button
                          key={count}
                          onClick={() => setParticipantCount(count as 2 | 3)}
                          disabled={isGenerating}
                          className={cn(
                            "flex items-center gap-2 px-4 py-3 rounded-lg border transition-all",
                            participantCount === count
                              ? "bg-purple-600/20 border-purple-500 text-purple-300"
                              : "bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500"
                          )}
                        >
                          <Icon size={16} />
                          <span>{count} People</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                    {errorMessage}
                  </div>
                )}

                {isGenerating && (
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center gap-2 text-purple-400">
                    <Loader2 className="animate-spin" size={16} />
                    <span>Generating conversation with AI...</span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={generateConversation}
                    disabled={!conversationTopic.trim() || isGenerating}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Generate
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowAIModal(false);
                      setConversationTopic('');
                      setErrorMessage('');
                    }}
                    disabled={isGenerating}
                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-400">
                  <strong>AI-Powered:</strong> Gemini will create realistic conversations between multiple people discussing your chosen topic.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarProvider>
  );
}