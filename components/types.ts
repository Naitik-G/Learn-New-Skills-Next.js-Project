// components/types.ts
import { LucideIcon } from 'lucide-react';
import { 
  Atom, FlaskConical, Dna, Calculator, Clock, Users, MessageCircle, Star, TrendingUp, Award, Plus, Apple, Utensils, Coffee, Pizza, Sparkles, Briefcase
} from 'lucide-react';


export type QuizResult = {
  id: string;
  subject: string;
  difficulty: string;
  score: number;
  total_questions: number;
  created_at: string;
};

export type UserStats = {
  totalQuizzes: number;
  averageScore: number;
  pronunciationAttempts: number;
  customConversations: number;
  streak: number;
  totalLearningTime: number;
};

export type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string; // Tailwind text color class
  bgColor: string; // Tailwind background color class
};

export type LearningModuleProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  color: string; // Tailwind gradient color class (e.g., "from-purple-500 to-pink-500")
  bgColor: string;
  borderColor: string;
};

// Enhanced topic interface
export interface Topic {
  id: string;
  title: string;
  category: string; // Ensure category is always present after grouping
  isCustom?: boolean;
  participants?: number;
  createdAt?: string;
   conversation?: string[] | ConversationScene[];
  // For the new nested structure
  conversations?: Record<string, ConversationScene>;
  summary?: string;
}

export interface ConversationLine {
  speaker: string;
  text: string;
}

export interface ConversationScene {
  title: string;
  setting: string;
  dialogue: string[];
}

// Category configuration interface
export interface CategoryConfig {
  name: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

// Categories configuration with enhanced dark theme colors
export const categories: Record<string, CategoryConfig> = {
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
  freelancing: {
    name: 'Business & Freelancing',
    icon: Briefcase,
    color: 'text-blue-400 group-hover:text-blue-300',
    bgColor: 'hover:bg-blue-500/10'
  },
  custom: {
    name: 'Custom Conversations',
    icon: MessageCircle,
    color: 'text-purple-400 group-hover:text-purple-300',
    bgColor: 'hover:bg-purple-500/10'
  }
};

export type Level = 'beginner' | 'intermediate' | 'advanced' | 'custom';


// Sentence interface from your file
export interface Sentence {
  text: string;
  phonetic: string;
  readablePhonetic: string;
  words: string[];
}

// Word Accuracy interface from your file
export interface WordAccuracy {
  word: string;
  accuracy: number;
  isCorrect: boolean;
}

export interface LevelConfig {
  name: string;
  icon: LucideIcon; // Correctly referencing the imported component type
  description: string;
  color: 'green' | 'blue' | 'purple' | 'indigo';
  accuracyThreshold: number;
}

// NOTE: Ensure your color classes are safe-listed in your tailwind.config.js 
// if you use dynamic Tailwind strings.
export const levelConfig: Record<Level, LevelConfig> = {
  beginner: {
    name: "Beginner",
    icon: Star, // Reference the component directly
    description: "Simple sentences with basic vocabulary",
    color: "green",
    accuracyThreshold: 0.6
  },
  intermediate: {
    name: "Intermediate", 
    icon: TrendingUp, // Reference the component directly
    description: "Medium complexity sentences with varied vocabulary",
    color: "blue",
    accuracyThreshold: 0.7
  },
  advanced: {
    name: "Advanced",
    icon: Award, // Reference the component directly
    description: "Complex sentences with advanced vocabulary",
    color: "purple",
    accuracyThreshold: 0.8
  },
  custom: {
    name: "Custom",
    icon: Plus, // Reference the component directly
    description: "Your own sentences with AI-generated phonetics",
    color: "indigo",
    accuracyThreshold: 0.7
  }
};

// Shared Interfaces and Data for Karaoke App

export interface Lyric {
  time: number; // Time in seconds
  text: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  lyrics: Lyric[];
}

export interface KaraokeSession {
  id: string;
  room_code: string;
  host_id: string;
  current_song: string | null;
  is_playing: boolean;
  current_time_ms: number;
  created_at: string;
}

export interface Participant {
  id: string;
  user_id: string;
  session_id: string;
  username: string;
  is_host: boolean;
  joined_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  user_id: string;
  username: string;
  message: string;
  created_at: string;
}

export const SAMPLE_SONGS: Song[] = [
  {
    id: '1',
    title: 'Imagine',
    artist: 'John Lennon',
    lyrics: [
      { time: 0, text: 'Imagine there\'s no heaven' },
      { time: 4, text: 'It\'s easy if you try' },
      { time: 8, text: 'No hell below us' },
      { time: 12, text: 'Above us only sky' },
      { time: 16, text: 'Imagine all the people' },
      { time: 20, text: 'Living for today' }
    ]
  },
  {
    id: '2',
    title: 'Yesterday',
    artist: 'The Beatles',
    lyrics: [
      { time: 0, text: 'Yesterday, all my troubles seemed so far away' },
      { time: 5, text: 'Now it looks as though they\'re here to stay' },
      { time: 10, text: 'Oh, I believe in yesterday' },
      { time: 15, text: 'Suddenly, I\'m not half the man I used to be' },
      { time: 20, text: 'There\'s a shadow hanging over me' }
    ]
  },
  {
    id: '3',
    title: 'Let It Be',
    artist: 'The Beatles',
    lyrics: [
      { time: 0, text: 'When I find myself in times of trouble' },
      { time: 4, text: 'Mother Mary comes to me' },
      { time: 8, text: 'Speaking words of wisdom' },
      { time: 12, text: 'Let it be' },
      { time: 16, text: 'And in my hour of darkness' },
      { time: 20, text: 'She is standing right in front of me' }
    ]
  }
];


// Vocabulary data structure
export interface VocabularyItem {
  word: string;
  translation?: string;
  phonetic: string;
  image?: string;
  example: string;
}

// Icon type is a union of the imported Lucide icons
export interface Category {
  id: string;
  name: string;
  icon: typeof Apple | typeof Utensils | typeof Coffee | typeof Pizza | typeof Sparkles; 
  color: string;
  items: VocabularyItem[];
}
