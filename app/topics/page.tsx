// /topics/page.tsx
'use client';
import { useState } from 'react';
import { topicsData } from '@/data/topicsData';
import WordPopup from '@/components/DictionaryPopup';
import { cn } from '@/lib/utils';
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
import { ChevronDown, BookOpen, Atom, FlaskConical, Dna, Calculator, Clock, Users } from 'lucide-react';

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
  }
};

export default function TopicsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);
  const [openCategories, setOpenCategories] = useState<string[]>(Object.keys(categories));

  const topic = selectedId ? topicsData[selectedId] : null;

  // Group topics by category (you'll need to add category field to your topicsData)
  const groupedTopics = Object.entries(topicsData).reduce((acc, [id, topic]) => {
    // For demo purposes, assigning random categories. 
    // In real implementation, add category field to your topic data
    const categoryKeys = Object.keys(categories);
    const category = topic.category || categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
    
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ id, ...topic });
    return acc;
  }, {} as Record<string, Array<{ id: string; title: string; conversation: string[]; category?: string }>>);

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

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-slate-950 text-slate-100" onMouseUp={handleTextSelection}>
        {/* Enhanced Dark Theme Sidebar */}
        <Sidebar className="border-r border-slate-800 bg-slate-900">
          <SidebarHeader className="border-b border-slate-800 px-4 py-4 bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Topics
              </h2>
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
                          {categoryTopics.map((topicItem) => (
                            <SidebarMenuSubItem key={topicItem.id}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={selectedId === topicItem.id}
                              >
                                <button
                                  onClick={() => setSelectedId(topicItem.id)}
                                  className={cn(
                                    "w-full text-left px-4 py-2.5 rounded-md text-sm transition-all duration-200",
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
                                    {topicItem.title}
                                  </div>
                                </button>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                          {categoryTopics.length === 0 && (
                            <SidebarMenuSubItem>
                              <div className="px-4 py-3 text-sm text-slate-500 italic border border-slate-700/30 rounded-md bg-slate-800/20">
                                No topics available
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
                <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full" />
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
                      and expand your knowledge
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                <div className="mb-8 relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-20" />
                  <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
                    <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                      {topic.title}
                    </h1>
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                      <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full" />
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
      </div>
    </SidebarProvider>
  );
}