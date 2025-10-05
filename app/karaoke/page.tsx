'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { useKaraokeSession } from '@/hooks/useKaraokeSession';
import { SessionSetup } from '@/components/karaoke/SessionSetup';
import { KaraokeRoom } from '@/components/karaoke/KaraokeRoom';

export default function KaraokePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // Use the custom hook to get all state and handlers
  const {
    sessionId,
    loadingSession,
    // Setup Props
    showCreateModal, setShowCreateModal,
    showJoinModal, setShowJoinModal,
    joinCode, setJoinCode,
    error, setError,
    createSession, joinSession,
    // Room Props
    roomCode, isHost, participants, chatMessages, selectedSong, isPlaying, currentLyricIndex, leaveSession, togglePlayback, changeSong, sendMessage
  } = useKaraokeSession();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
        <p className="text-lg text-slate-400">Loading session...</p>
      </div>
    );
  }

  if (!sessionId) {
    // Render the initial setup screen if no session is active
    return (
      <SessionSetup 
        createSession={createSession}
        joinSession={joinSession}
        error={error}
        setError={setError}
        showCreateModal={showCreateModal}
        setShowCreateModal={setShowCreateModal}
        showJoinModal={showJoinModal}
        setShowJoinModal={setShowJoinModal}
        joinCode={joinCode}
        setJoinCode={setJoinCode}
        loadingSession={loadingSession}
      />
    );
  }

  // Render the active karaoke room UI
  return (
    <KaraokeRoom 
      roomCode={roomCode}
      isHost={isHost}
      participants={participants}
      chatMessages={chatMessages}
      selectedSong={selectedSong}
      isPlaying={isPlaying}
      currentLyricIndex={currentLyricIndex}
      error={error} // Display hook error in the room header
      leaveSession={leaveSession}
      togglePlayback={togglePlayback}
      changeSong={changeSong}
      sendMessage={sendMessage}
    />
  );
}
