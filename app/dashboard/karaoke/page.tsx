// app/dashboard/karaoke/page.tsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  Music, Users, Play, Pause, SkipForward, Volume2, Mic, 
  Copy, Check, Share2, UserPlus, Loader2, MessageCircle,
  Crown, X, Settings, AlertCircle
} from 'lucide-react';

interface KaraokeSession {
  id: string;
  room_code: string;
  host_id: string;
  current_song: string | null;
  is_playing: boolean;
  current_time_ms: number;
  created_at: string;
}

interface Participant {
  id: string;
  user_id: string;
  session_id: string;
  username: string;
  is_host: boolean;
  joined_at: string;
}

interface ChatMessage {
  id: string;
  session_id: string;
  user_id: string;
  username: string;
  message: string;
  created_at: string;
}

const SAMPLE_SONGS = [
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

export default function KaraokePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  // Session states
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string>('');
  const [isHost, setIsHost] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Karaoke states
  const [selectedSong, setSelectedSong] = useState(SAMPLE_SONGS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentLyric, setCurrentLyric] = useState(0);

  // UI states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<any>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Setup real-time subscriptions
  useEffect(() => {
    if (!sessionId || !user) return;

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
        loadParticipants();
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'karaoke_chat',
        filter: `session_id=eq.${sessionId}`
      }, (payload) => {
        setChatMessages(prev => [...prev, payload.new as ChatMessage]);
      })
      .subscribe();

    channelRef.current = sessionChannel;

    return () => {
      sessionChannel.unsubscribe();
    };
  }, [sessionId, user]);

  // Timer for karaoke playback
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
  }, [isPlaying, isHost]);

  const handleSessionUpdate = (session: KaraokeSession) => {
    if (!isHost) {
      setIsPlaying(session.is_playing);
      setCurrentTime(session.current_time);
      if (session.current_song) {
        const song = SAMPLE_SONGS.find(s => s.id === session.current_song);
        if (song) setSelectedSong(song);
      }
    }
  };

  const updateCurrentLyric = (time: number) => {
    const lyricIndex = selectedSong.lyrics.findIndex((lyric, idx) => {
      const nextLyric = selectedSong.lyrics[idx + 1];
      return time >= lyric.time && (!nextLyric || time < nextLyric.time);
    });
    setCurrentLyric(lyricIndex >= 0 ? lyricIndex : 0);
  };

  const createSession = async () => {
    if (!user) return;

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
      loadParticipants();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const joinSession = async () => {
    if (!user || !joinCode.trim()) return;

    try {
      const { data: session, error: findError } = await supabase
        .from('karaoke_sessions')
        .select('*')
        .eq('room_code', joinCode.toUpperCase())
        .single();

      if (findError) throw new Error('Room not found');

      const { error: participantError } = await supabase
        .from('karaoke_participants')
        .insert({
          session_id: session.id,
          user_id: user.id,
          username: user.email?.split('@')[0] || 'User',
          is_host: false
        });

      if (participantError) throw participantError;

      setSessionId(session.id);
      setRoomCode(session.room_code);
      setIsHost(false);
      setShowJoinModal(false);
      loadParticipants();

      if (session.current_song) {
        const song = SAMPLE_SONGS.find(s => s.id === session.current_song);
        if (song) setSelectedSong(song);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadParticipants = async () => {
    if (!sessionId) return;

    const { data, error } = await supabase
      .from('karaoke_participants')
      .select('*')
      .eq('session_id', sessionId)
      .order('joined_at', { ascending: true });

    if (!error && data) {
      setParticipants(data);
    }
  };

  const togglePlayback = async () => {
    if (!isHost || !sessionId) return;

    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);

    await supabase
      .from('karaoke_sessions')
      .update({ is_playing: newPlayingState })
      .eq('id', sessionId);
  };

  const updateSessionTime = async (time: number) => {
    if (!isHost || !sessionId) return;

    await supabase
      .from('karaoke_sessions')
      .update({ current_time_ms: time })
      .eq('id', sessionId);
  };

  const changeSong = async (song: typeof SAMPLE_SONGS[0]) => {
    if (!isHost || !sessionId) return;

    setSelectedSong(song);
    setCurrentTime(0);
    setCurrentLyric(0);
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

  const sendMessage = async () => {
    if (!newMessage.trim() || !sessionId || !user) return;

    await supabase
      .from('karaoke_chat')
      .insert({
        session_id: sessionId,
        user_id: user.id,
        username: user.email?.split('@')[0] || 'User',
        message: newMessage.trim()
      });

    setNewMessage('');
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const leaveSession = async () => {
    if (!sessionId || !user) return;

    await supabase
      .from('karaoke_participants')
      .delete()
      .eq('session_id', sessionId)
      .eq('user_id', user.id);

    if (isHost) {
      await supabase
        .from('karaoke_sessions')
        .delete()
        .eq('id', sessionId);
    }

    setSessionId(null);
    setRoomCode('');
    setIsHost(false);
    setParticipants([]);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4">
              <Music className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Karaoke Together
            </h1>
            <p className="text-slate-400">Sing with friends in real-time</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 space-y-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg font-medium transition-all flex items-center justify-center gap-3"
            >
              <UserPlus size={20} />
              Create Room
            </button>

            <button
              onClick={() => setShowJoinModal(true)}
              className="w-full px-6 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg font-medium transition-all flex items-center justify-center gap-3"
            >
              <Users size={20} />
              Join Room
            </button>
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Create Karaoke Room</h3>
                <button onClick={() => setShowCreateModal(false)}>
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                  <AlertCircle size={16} className="text-red-400 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <p className="text-slate-400 mb-6">
                You'll be the host and can control playback for all participants
              </p>

              <button
                onClick={createSession}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg font-medium transition-all"
              >
                Create Room
              </button>
            </div>
          </div>
        )}

        {/* Join Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Join Karaoke Room</h3>
                <button onClick={() => setShowJoinModal(false)}>
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                  <AlertCircle size={16} className="text-red-400 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Room Code</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-center text-2xl font-mono tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-purple-500"
                  maxLength={6}
                />
              </div>

              <button
                onClick={joinSession}
                disabled={joinCode.length !== 6}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-600 disabled:to-slate-600 rounded-lg font-medium transition-all disabled:cursor-not-allowed"
              >
                Join Room
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Music className="w-8 h-8 text-purple-400" />
              <div>
                <h1 className="text-xl font-bold">Karaoke Room</h1>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <span>Code:</span>
                  <code className="px-2 py-1 bg-slate-800 rounded font-mono">{roomCode}</code>
                  <button onClick={copyRoomCode} className="text-purple-400 hover:text-purple-300">
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={leaveSession}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium transition-colors"
            >
              Leave Room
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Karaoke Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Song */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedSong.title}</h2>
                  <p className="text-slate-400">{selectedSong.artist}</p>
                </div>
                {isHost && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded-full text-sm">
                    <Crown size={14} className="text-purple-400" />
                    <span className="text-purple-300">Host</span>
                  </div>
                )}
              </div>

              {/* Lyrics Display */}
              <div className="bg-slate-800/50 rounded-lg p-8 min-h-[300px] flex items-center justify-center mb-6">
                <div className="text-center space-y-4">
                  {selectedSong.lyrics.map((lyric, idx) => (
                    <p
                      key={idx}
                      className={`text-2xl transition-all duration-300 ${
                        idx === currentLyric
                          ? 'text-white font-bold scale-110'
                          : idx === currentLyric - 1 || idx === currentLyric + 1
                          ? 'text-slate-400'
                          : 'text-slate-600'
                      }`}
                    >
                      {lyric.text}
                    </p>
                  ))}
                </div>
              </div>

              {/* Controls */}
              {isHost ? (
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={togglePlayback}
                    className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-full flex items-center justify-center transition-all shadow-lg"
                  >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg">
                    <Mic className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-400">Host controls playback</span>
                  </div>
                </div>
              )}
            </div>

            {/* Song Selection (Host Only) */}
            {isHost && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Select Song</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {SAMPLE_SONGS.map((song) => (
                    <button
                      key={song.id}
                      onClick={() => changeSong(song)}
                      className={`p-4 rounded-lg border transition-all text-left ${
                        selectedSong.id === song.id
                          ? 'bg-purple-600/20 border-purple-500'
                          : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="font-medium">{song.title}</div>
                      <div className="text-sm text-slate-400">{song.artist}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Participants */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Participants</h3>
                <span className="text-sm text-slate-400">{participants.length} online</span>
              </div>

              <div className="space-y-2">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold">
                      {participant.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{participant.username}</div>
                      {participant.is_host && (
                        <div className="text-xs text-purple-400">Host</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageCircle size={20} />
                Chat
              </h3>

              <div className="space-y-2 mb-4 h-64 overflow-y-auto">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="text-sm">
                    <span className="font-medium text-purple-400">{msg.username}:</span>
                    <span className="text-slate-300 ml-2">{msg.message}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={sendMessage}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}