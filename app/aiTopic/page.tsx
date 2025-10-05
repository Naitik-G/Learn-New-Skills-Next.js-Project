// app/dashboard/aiTopic/page.tsx
'use client';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useTopicsData } from '@/hooks/useTopicsData';
import { AISidebar } from '@/components/ai-topics/AISidebar';
import { TopicContent } from '@/components/ai-topics/TopicContent';
import { AIGenerationModal } from '@/components/ai-topics/AIGenerationModal';
import WordPopup from '@/components/DictionaryPopup';
import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function TopicsPage() {
  const router = useRouter();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  const {
    user,
    topic,
    groupedTopics,
    categories,
    selectedId,
    openCategories,
    selectedWord,
    popupPos,
    showAIModal,
    conversationTopic,
    participantCount,
    isGenerating,
    errorMessage,
    currentScene,
    // Methods
    setSelectedId,
    toggleCategory,
    handleTextSelection,
    closeDictionaryPopup,
    setShowAIModal,
    setConversationTopic,
    setParticipantCount,
    generateConversation,
    deleteCustomConversation,
    getParticipantIcon,
    // Add these missing methods from the hook
    getCurrentConversationLines,
    getAvailableScenes,
    switchScene
  } = useTopicsData();

  const handleModalClose = () => {
    setShowAIModal(false);
    setConversationTopic('');
  };

  // Intercept AI generation to check for login
  const handleGenerateClick = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    setShowAIModal(true);
  };

  const handleGenerateConversation = async () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    await generateConversation();
  };

  const handleDeleteCustom = (id: string) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    deleteCustomConversation(id);
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-slate-950 text-slate-100" onMouseUp={handleTextSelection}>
        
        {/* Top Banner for non-authenticated users */}
        {!user && (
          <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-b border-yellow-500/30 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-sm font-medium text-yellow-100">
                      You're browsing in guest mode
                    </p>
                    <p className="text-xs text-yellow-200">
                      Login to generate custom AI conversations and save your progress
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/auth/login')}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-900 rounded-lg font-medium text-sm transition-colors"
                >
                  Login Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar (Navigation) */}
        <AISidebar
          groupedTopics={groupedTopics}
          categories={categories}
          selectedId={selectedId}
          openCategories={openCategories}
          user={user}
          setSelectedId={setSelectedId}
          toggleCategory={toggleCategory}
          deleteCustomConversation={handleDeleteCustom}
          setShowAIModal={handleGenerateClick}
          getParticipantIcon={getParticipantIcon}
        />

        {/* Main Content Area */}
        <div className={`flex-1 ${!user ? 'pt-16' : ''}`}>
          <TopicContent
            topic={topic}
            user={user}
            selectedWord={selectedWord}
            popupPos={popupPos}
            setShowAIModal={handleGenerateClick}
            getParticipantIcon={getParticipantIcon}
            getCurrentConversationLines={getCurrentConversationLines}
            getAvailableScenes={getAvailableScenes}
            currentScene={currentScene}
            switchScene={switchScene}
          />
        </div>

        {/* Login Prompt Modal */}
        {showLoginPrompt && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-slate-800">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white text-center mb-2">
                Login Required for AI Features
              </h2>
              <p className="text-slate-400 text-center mb-6">
                Please login to generate custom AI conversations, save progress, and delete custom topics.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/login')}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 font-medium transition-colors"
                >
                  Login Now
                </button>
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="w-full px-4 py-3 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 font-medium transition-colors"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI Generation Modal - Only show if user is logged in */}
        {user && (
          <AIGenerationModal
            show={showAIModal}
            topic={conversationTopic}
            setTopic={setConversationTopic}
            participantCount={participantCount}
            setParticipantCount={setParticipantCount}
            isGenerating={isGenerating}
            errorMessage={errorMessage}
            onGenerate={handleGenerateConversation}
            onClose={handleModalClose}
            getParticipantIcon={getParticipantIcon}
          />
        )}
        
        {/* Dictionary Popup (must remain high in the DOM for positioning) */}
        {selectedWord && popupPos && (
          <WordPopup
            word={selectedWord}
            position={popupPos}
            onClose={closeDictionaryPopup}
          />
        )}
      </div>
    </SidebarProvider>
  );
}