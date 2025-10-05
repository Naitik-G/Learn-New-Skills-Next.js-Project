import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import {
  KaraokeSession, Participant, ChatMessage, Song, SAMPLE_SONGS
} from '@/components/types';
import { RealtimeChannel } from '@supabase/supabase-js';

// Define the shape of the data returned by the hook
export interface UseKaraokeSession {
  sessionId: string | null;
  roomCode: string;
  isHost: boolean;
  participants: Participant[];
  chatMessages: ChatMessage[];
  selectedSong: Song;
  isPlaying: boolean;
  currentTime: number;
  currentLyricIndex: number;
  error: string;
  loadingSession: boolean;
  
  // Setup state
  showCreateModal: boolean;
  setShowCreateModal: (show: boolean) => void;
  showJoinModal: boolean;
  setShowJoinModal: (show: boolean) => void;
  joinCode: string;
  setJoinCode: (code: string) => void;
  setError: (msg: string) => void;

  // Methods
  createSession: () => Promise<void>;
  joinSession: () => Promise<void>;
  leaveSession: () => Promise<void>;
  togglePlayback: () => Promise<void>;
  changeSong: (song: Song) => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  updateCurrentLyric: (time: number) => void;
}

export const useKaraokeSession = (): UseKaraokeSession => {
  const { user } = useAuth();
  const supabase = createClient();

  // Session states
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string>('');
  const [isHost, setIsHost] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loadingSession, setLoadingSession] = useState(false);

  // Karaoke states
  const [selectedSong, setSelectedSong] = useState<Song>(SAMPLE_SONGS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);

  // UI states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // --- Core Utility Functions ---

  const loadParticipants = useCallback(async (currentSessionId: string) => {
    const { data, error } = await supabase
      .from('karaoke_participants')
      .select('*')
      .eq('session_id', currentSessionId)
      .order('joined_at', { ascending: true });

    if (!error && data) {
      setParticipants(data);
    } else {
      console.error('Error loading participants:', error);
    }
  }, [supabase]);

  const updateCurrentLyric = useCallback((time: number) => {
    const lyricIndex = selectedSong.lyrics.findIndex((lyric, idx) => {
      const nextLyric = selectedSong.lyrics[idx + 1];
      return time >= lyric.time && (!nextLyric || time < nextLyric.time);
    });
    setCurrentLyricIndex(lyricIndex >= 0 ? lyricIndex : 0);
  }, [selectedSong.lyrics]);

  const updateSessionTime = useCallback(async (time: number) => {
    if (!isHost || !sessionId) return;
    // Debounce this in a real app, but for simplicity, we update frequently
    await supabase
      .from('karaoke_sessions')
      .update({ current_time_ms: time })
      .eq('id', sessionId);
  }, [isHost, sessionId, supabase]);

  const handleSessionUpdate = useCallback((session: KaraokeSession) => {
    // Only non-hosts should update their state based on the database
    if (!isHost) {
      setIsPlaying(session.is_playing);
      setCurrentTime(session.current_time_ms);
      
      // Update song if host changes it
      if (session.current_song && session.current_song !== selectedSong.id) {
        const song = SAMPLE_SONGS.find(s => s.id === session.current_song);
        if (song) setSelectedSong(song);
      }
    }
  }, [isHost, selectedSong.id]);

  // --- Real-time Subscriptions (Setup and Cleanup) ---

  useEffect(() => {
    if (!sessionId || !user) return;

    // Unsubscribe from any previous channel
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }

    // Subscribe to session changes
    const sessionChannel = supabase
      .channel(`session:${sessionId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'karaoke_sessions',
        filter: `id=eq.${sessionId}`
      }, (payload) => {
        handleSessionUpdate(payload.new as KaraokeSession);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'karaoke_participants',
        filter: `session_id=eq.${sessionId}`
      }, () => {
        loadParticipants(sessionId);
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'karaoke_chat',
        filter: `session_id=eq.${sessionId}`
      }, (payload) => {
        setChatMessages(prev => [...prev, payload.new as ChatMessage].slice(-50)); // Keep last 50 messages
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          loadParticipants(sessionId);
          // Load initial chat messages on subscribe
          supabase.from('karaoke_chat')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true })
            .limit(50)
            .then(({ data }) => {
              if (data) setChatMessages(data);
            });
        }
      });

    channelRef.current = sessionChannel;

    return () => {
      sessionChannel.unsubscribe();
    };
  }, [sessionId, user, supabase, handleSessionUpdate, loadParticipants]);

  // --- Playback Timer Effect ---

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1;
          updateCurrentLyric(newTime);
          if (isHost) {
            updateSessionTime(newTime);
          }
          return newTime;
        });
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, isHost, updateCurrentLyric, updateSessionTime]);

  // --- Session Management Handlers ---

  const createSession = async () => {
    if (!user) return;
    setLoadingSession(true);
    setError('');

    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { data: session, error: sessionError } = await supabase
        .from('karaoke_sessions')
        .insert({
          room_code: code,
          host_id: user.id,
          current_song: selectedSong.id,
          is_playing: false,
          current_time_ms: 0
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      const { error: participantError } = await supabase
        .from('karaoke_participants')
        // Check if user has an existing username table for a real app
        .insert({
          session_id: session.id,
          user_id: user.id,
          username: user.email?.split('@')[0] || 'User',
          is_host: true
        });

      if (participantError) throw participantError;

      setSessionId(session.id);
      setRoomCode(code);
      setIsHost(true);
      setShowCreateModal(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create session.');
    } finally {
      setLoadingSession(false);
    }
  };

  const joinSession = async () => {
    if (!user || !joinCode.trim()) return;
    setLoadingSession(true);
    setError('');

    try {
      const code = joinCode.toUpperCase();
      const { data: session, error: findError } = await supabase
        .from('karaoke_sessions')
        .select('*')
        .eq('room_code', code)
        .single();

      if (findError) throw new Error('Room not found or code is invalid.');
      
      // Check if participant is already in the room to prevent duplicate inserts
      const { data: existingParticipant } = await supabase
        .from('karaoke_participants')
        .select('id')
        .eq('session_id', session.id)
        .eq('user_id', user.id)
        .single();

      if (!existingParticipant) {
        const { error: participantError } = await supabase
          .from('karaoke_participants')
          .insert({
            session_id: session.id,
            user_id: user.id,
            username: user.email?.split('@')[0] || 'User',
            is_host: false
          });
          
        if (participantError) throw participantError;
      }

      setSessionId(session.id);
      setRoomCode(session.room_code);
      setIsHost(session.host_id === user.id);
      setShowJoinModal(false);
      setJoinCode('');

      if (session.current_song) {
        const song = SAMPLE_SONGS.find(s => s.id === session.current_song);
        if (song) setSelectedSong(song);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to join session.');
    } finally {
      setLoadingSession(false);
    }
  };

  const leaveSession = async () => {
    if (!sessionId || !user) return;
    
    // Cleanup subscriptions before state reset
    if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
    }

    try {
      await supabase
        .from('karaoke_participants')
        .delete()
        .eq('session_id', sessionId)
        .eq('user_id', user.id);
        
      // If host, delete the entire session
      if (isHost) {
        await supabase
          .from('karaoke_sessions')
          .delete()
          .eq('id', sessionId);
      }
    } catch (err) {
      console.error('Error leaving session:', err);
    } finally {
      setSessionId(null);
      setRoomCode('');
      setIsHost(false);
      setParticipants([]);
      setChatMessages([]);
      setIsPlaying(false);
      setCurrentTime(0);
      setCurrentLyricIndex(0);
      setError('');
    }
  };
  
  // --- Playback Controls (Host Actions) ---
  
  const togglePlayback = async () => {
    if (!isHost || !sessionId) return;

    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState); // optimistic update

    await supabase
      .from('karaoke_sessions')
      .update({ is_playing: newPlayingState })
      .eq('id', sessionId);
  };

  const changeSong = async (song: Song) => {
    if (!isHost || !sessionId) return;

    setSelectedSong(song);
    setCurrentTime(0);
    setCurrentLyricIndex(0);
    setIsPlaying(false);

    await supabase
      .from('karaoke_sessions')
      .update({
        current_song: song.id,
        current_time_ms: 0,
        is_playing: false
      })
      .eq('id', sessionId);
  };
  
  // --- Chat Handler ---

  const sendMessage = async (message: string) => {
    if (!message.trim() || !sessionId || !user) return;

    await supabase
      .from('karaoke_chat')
      .insert({
        session_id: sessionId,
        user_id: user.id,
        username: user.email?.split('@')[0] || 'User',
        message: message.trim()
      });
  };

  return {
    sessionId,
    roomCode,
    isHost,
    participants,
    chatMessages,
    selectedSong,
    isPlaying,
    currentTime,
    currentLyricIndex,
    error,
    loadingSession,
    
    showCreateModal,
    setShowCreateModal,
    showJoinModal,
    setShowJoinModal,
    joinCode,
    setJoinCode,
    setError,

    createSession,
    joinSession,
    leaveSession,
    togglePlayback,
    changeSong,
    sendMessage,
    updateCurrentLyric, // Exposed for external logic if needed, but primarily used internally
  };
};
