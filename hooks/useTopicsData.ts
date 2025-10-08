// hooks/useTopicsData.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { topicsData as staticTopicsData } from '@/data/topicsData';
import { Topic, categories, ConversationScene } from '@/components/types';
import { Users2, Users as Users3, Users } from 'lucide-react';

interface PopupPosition {
  x: number;
  y: number;
}

export function useTopicsData() {
  const { user } = useAuth();
  const supabase = createClient();
  const allCategoryKeys = useMemo(() => Object.keys(categories).filter(k => k !== 'custom'), []);

  // --- Core States ---
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [customTopics, setCustomTopics] = useState<Topic[]>([]);
  const [openCategories, setOpenCategories] = useState<string[]>(allCategoryKeys);
  
  // --- Scene Management ---
  const [currentScene, setCurrentScene] = useState<string | null>(null);

  // --- Dictionary Popup States ---
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [popupPos, setPopupPos] = useState<PopupPosition | null>(null);

  // --- AI Modal States ---
  const [showAIModal, setShowAIModal] = useState(false);
  const [conversationTopic, setConversationTopic] = useState('');
  const [participantCount, setParticipantCount] = useState<2 | 3>(2);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // --- Derived Data ---

  const allTopics = useMemo(() => {
    // Merge static topics with custom topics
    const merged = { ...staticTopicsData };
    
    customTopics.forEach(topic => {
      merged[topic.id] = topic;
    });
    
    return merged;
  }, [customTopics]);

  const topic = selectedId ? allTopics[selectedId] : null;

  // Helper to get current conversation lines (NO STATE UPDATES HERE)
  const getCurrentConversationLines = useCallback(() => {
    if (!topic) return [];
    
    // If we have nested conversations and a scene is selected
    if (topic.conversations && currentScene && topic.conversations[currentScene]) {
      return topic.conversations[currentScene].dialogue;
    }
    
    // If we have nested conversations but no scene selected, use first scene
    if (topic.conversations && Object.keys(topic.conversations).length > 0) {
      const firstSceneKey = Object.keys(topic.conversations)[0];
      return topic.conversations[firstSceneKey].dialogue;
    }
    
    // Fallback to flat conversation structure
    return topic.conversation || [];
  }, [topic, currentScene]);

  const groupedTopics = useMemo(() => {
    return Object.entries(allTopics).reduce((acc, [id, topicItem]) => {
      // Skip custom topics - don't group them
      if (topicItem.isCustom) {
        return acc;
      }
      
      // Only process non-custom topics
      const category = topicItem.category || allCategoryKeys[0] || 'general';
      
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({ id, ...topicItem, category });
      return acc;
    }, {} as Record<string, Topic[]>);
  }, [allTopics, allCategoryKeys]);

  // Auto-select first scene when topic changes or when topic has conversations but no scene is selected
  useEffect(() => {
    if (!topic) {
      setCurrentScene(null);
      return;
    }

    if (topic.conversations && Object.keys(topic.conversations).length > 0) {
      // Only set current scene if it's not already set or if it's invalid
      const conversationKeys = Object.keys(topic.conversations);
      
      if (!currentScene || !topic.conversations[currentScene]) {
        const firstSceneKey = conversationKeys[0];
        setCurrentScene(firstSceneKey);
      }
    } else {
      setCurrentScene(null);
    }
  }, [topic, currentScene]);

  // --- Data Fetching Logic ---
  const loadCustomTopics = useCallback(async () => {
    if (!user) {
      setCustomTopics([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('custom_conversations')
        .select('id, title, conversation, conversations, participants, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading custom topics:', error.message || error);
        // Don't throw, just log and continue with empty array
        setCustomTopics([]);
        return;
      }

      if (!data || data.length === 0) {
        setCustomTopics([]);
        return;
      }

      const topics: Topic[] = data.map(item => ({
        id: item.id,
        title: item.title,
        conversation: item.conversation || [],
        conversations: item.conversations || undefined,
        category: 'custom',
        isCustom: true,
        participants: item.participants || 2,
        createdAt: item.created_at
      }));

      setCustomTopics(topics);
    } catch (error) {
      console.error('Error in loadCustomTopics:', error);
      setCustomTopics([]);
    }
  }, [user, supabase]);

  useEffect(() => {
    loadCustomTopics();
  }, [user, loadCustomTopics]);

  // --- Interaction Handlers ---
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim() !== '') {
      const word = selection.toString().trim();
      const rect = selection.getRangeAt(0).getBoundingClientRect();
      setSelectedWord(word);
      setPopupPos({ x: rect.left + rect.width / 2, y: rect.top - 10 });
    }
  }, []);

  const closeDictionaryPopup = useCallback(() => {
    setSelectedWord(null);
  }, []);

  const toggleCategory = useCallback((categoryId: string) => {
    setOpenCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  const getParticipantIcon = useCallback((count: number) => {
    switch (count) {
      case 2: return Users2;
      case 3: return Users3;
      default: return Users;
    }
  }, []);

  // Scene navigation
  const getAvailableScenes = useCallback(() => {
    if (!topic || !topic.conversations) return [];
    return Object.entries(topic.conversations).map(([key, scene]) => ({
      key,
      title: scene.title,
      setting: scene.setting
    }));
  }, [topic]);

  const switchScene = useCallback((sceneKey: string) => {
    setCurrentScene(sceneKey);
  }, []);
  
  // --- AI Generation Logic ---
  const generateConversation = useCallback(async () => {
    if (!conversationTopic.trim() || !user) {
      setErrorMessage('Please enter a valid topic');
      return;
    }

    setIsGenerating(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/generate_conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: conversationTopic.trim(),
          participants: participantCount
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error || !data.conversation) {
        throw new Error(data.error || 'AI did not return a valid conversation.');
      }

      // Save to database - now supporting both flat and nested structures
      const { data: savedData, error: saveError } = await supabase
        .from('custom_conversations')
        .insert({
          user_id: user.id,
          title: conversationTopic.trim(),
          conversation: data.conversation,
          conversations: data.conversations,
          participants: participantCount,
          topic_description: conversationTopic.trim()
        })
        .select()
        .single();

      if (saveError) {
        throw new Error(saveError.message);
      }

      // Update local state
      const newTopic: Topic = {
        id: savedData.id,
        title: conversationTopic.trim(),
        conversation: data.conversation,
        conversations: data.conversations,
        category: 'custom',
        isCustom: true,
        participants: participantCount,
        createdAt: savedData.created_at
      };

      setCustomTopics(prev => [newTopic, ...prev]);
      setSelectedId(newTopic.id);
      
      // Close modal and reset form
      setConversationTopic('');
      setShowAIModal(false);

    } catch (error: any) {
      console.error('Error generating conversation:', error);
      setErrorMessage(`Failed to generate conversation: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  }, [conversationTopic, participantCount, user, supabase]);
  
  // --- Deletion Logic ---
  const deleteCustomConversation = useCallback(async (topicId: string) => {
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
  }, [user, supabase, selectedId]);

  return {
    user,
    topic,
    groupedTopics,
    customTopics,
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
    getCurrentConversationLines,
    getAvailableScenes,
    switchScene
  };
}