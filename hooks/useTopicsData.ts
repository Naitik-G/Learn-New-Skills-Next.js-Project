// hooks/useTopicsData.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { topicsData as staticTopicsData } from '@/data/topicsData';
import { Topic, categories } from '@/components/types';
import { Users2, Users as Users3, Users } from 'lucide-react';

interface PopupPosition {
  x: number;
  y: number;
}

export function useTopicsData() {
  const { user } = useAuth();
  const allCategoryKeys = useMemo(() => Object.keys(categories).filter(k => k !== 'custom'), []);

  // --- Core States ---
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openCategories, setOpenCategories] = useState<string[]>(allCategoryKeys);
  
  // --- Scene Management ---
  const [currentScene, setCurrentScene] = useState<string | null>(null);

  // --- Dictionary Popup States ---
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [popupPos, setPopupPos] = useState<PopupPosition | null>(null);

  // --- Derived Data ---
  const allTopics = useMemo(() => staticTopicsData, []);

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
      return topic.conversations[firstSceneKey].dialogue;
    }
    
    // Fallback to flat conversation structure
    return topic.conversation || [];
  }, [topic, currentScene]);

  const groupedTopics = useMemo(() => {
    return Object.entries(allTopics).reduce((acc, [id, topicItem]) => {
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

  return {
    user,
    topic,
    groupedTopics,
    categories,
    selectedId,
    openCategories,
    selectedWord,
    popupPos,
    currentScene,
    // Methods
    setSelectedId,
    toggleCategory,
    handleTextSelection,
    closeDictionaryPopup,
    getParticipantIcon,
    getCurrentConversationLines,
    getAvailableScenes,
    switchScene
  };
}