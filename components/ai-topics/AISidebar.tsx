// components/ai-topics/AISidebar.tsx
import { BookOpen, Sparkles } from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarProvider, 
} from '@/components/ui/sidebar';
import { TopicMenu } from './TopicMenu';
import { Topic, CategoryConfig } from '@/components/types';

interface AISidebarProps {
    groupedTopics: Record<string, Topic[]>;
    categories: Record<string, CategoryConfig>;
    selectedId: string | null;
    openCategories: string[];
    user: any; // User object from AuthContext
    setSelectedId: (id: string | null) => void;
    toggleCategory: (categoryId: string) => void;
    deleteCustomConversation: (topicId: string) => void;
    setShowAIModal: (show: boolean) => void;
    getParticipantIcon: (count: number) => React.ElementType;
}

export function AISidebar({
    groupedTopics, categories, selectedId, openCategories, user,
    setSelectedId, toggleCategory, deleteCustomConversation, setShowAIModal,
    getParticipantIcon
}: AISidebarProps) {
  return (
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
        <TopicMenu 
            groupedTopics={groupedTopics}
            categories={categories}
            selectedId={selectedId}
            openCategories={openCategories}
            user={user}
            setSelectedId={setSelectedId}
            toggleCategory={toggleCategory}
            deleteCustomConversation={deleteCustomConversation}
            getParticipantIcon={getParticipantIcon}
        />
      </SidebarContent>
    </Sidebar>
  );
}