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
  const allCategoryKeys = useMemo(() => Object.keys(categories), []);

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
    return {
      ...staticTopicsData,
      ...customTopics.reduce((acc, topic) => {
        acc[topic.id] = topic;
        return acc;
      }, {} as Record<string, Topic>)
    };
  }, [customTopics]);

  const topic = selectedId ? allTopics[selectedId] : null;

  // Helper to get current conversation lines
  const getCurrentConversationLines = useCallback(() => {
    if (!topic) return [];
    
    // If we have nested conversations and a scene is selected
    if (topic.conversations && currentScene && topic.conversations[currentScene]) {
      return topic.conversations[currentScene].dialogue;
    }
    
    // If we have nested conversations but no scene selected, use first scene
    if (topic.conversations && Object.keys(topic.conversations).length > 0) {
      const firstSceneKey = Object.keys(topic.conversations)[0];
      setCurrentScene(firstSceneKey); // Auto-select first scene
      return topic.conversations[firstSceneKey].dialogue;
    }
    
    // Fallback to flat conversation structure
    return topic.conversation || [];
  }, [topic, currentScene]);

  const groupedTopics = useMemo(() => {
    return Object.entries(allTopics).reduce((acc, [id, topic]) => {
      const categoryKeys = allCategoryKeys.filter(k => k !== 'custom');
      const category = topic.isCustom ? 'custom' : (topic.category || categoryKeys[Math.floor(Math.random() * categoryKeys.length)]);
      
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({ id, ...topic, category });
      return acc;
    }, {} as Record<string, Topic[]>);
  }, [allTopics, allCategoryKeys]);

  // Reset scene when topic changes
  useEffect(() => {
    if (topic && topic.conversations) {
      const firstSceneKey = Object.keys(topic.conversations)[0];
      setCurrentScene(firstSceneKey);
    } else {
      setCurrentScene(null);
    }
  }, [topic]);

  // --- Data Fetching Logic ---
  const loadCustomTopics = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('custom_conversations')
        .select('id, title, conversation, conversations, participants, created_at')
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
        conversations: item.conversations || undefined,
        category: 'custom',
        isCustom: true,
        participants: item.participants || 2,
        createdAt: item.created_at
      })) || [];

      setCustomTopics(topics);
    } catch (error) {
      console.error('Error loading custom topics:', error);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (user) {
      loadCustomTopics();
    }
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
          conversation: data.conversation, // Flat conversation for backward compatibility
          conversations: data.conversations, // Nested conversations if provided
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