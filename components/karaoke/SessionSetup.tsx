import React from 'react';
import { Music, UserPlus, Users, X, AlertCircle } from 'lucide-react';
import { UseKaraokeSession } from '@/hooks/useKaraokeSession';

type SessionSetupProps = Pick<
  UseKaraokeSession,
  | 'createSession'
  | 'joinSession'
  | 'error'
  | 'setError'
  | 'showCreateModal'
  | 'setShowCreateModal'
  | 'showJoinModal'
  | 'setShowJoinModal'
  | 'joinCode'
  | 'setJoinCode'
  | 'loadingSession'
>;

export const SessionSetup: React.FC<SessionSetupProps> = ({
  createSession,
  joinSession,
  error,
  setError,
  showCreateModal,
  setShowCreateModal,
  showJoinModal,
  setShowJoinModal,
  joinCode,
  setJoinCode,
  loadingSession,
}) => {
  const handleModalClose = (modalSetter: (show: boolean) => void) => {
    modalSetter(false);
    setError(''); // Clear error on close
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center p-4 text-foreground">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-brand to-brand/70 rounded-2xl mb-4">
            <Music className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-brand to-brand/70 bg-clip-text text-transparent">
            Karaoke Together
          </h1>
          <p className="text-muted-foreground">Sing with friends in real-time</p>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-8 space-y-4">
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={loadingSession}
            className="w-full px-6 py-4 bg-gradient-to-r from-brand to-brand/70 hover:opacity-90 rounded-lg font-medium transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-wait"
          >
            <UserPlus size={20} />
            Create Room
          </button>

          <button
            onClick={() => setShowJoinModal(true)}
            disabled={loadingSession}
            className="w-full px-6 py-4 bg-muted hover:bg-secondary border border-border rounded-lg font-medium transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-wait"
          >
            <Users size={20} />
            Join Room
          </button>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Create Karaoke Room</h3>
              <button onClick={() => handleModalClose(setShowCreateModal)}>
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                <AlertCircle size={16} className="text-destructive mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <p className="text-muted-foreground mb-6">
              You&apos;ll be the host and can control playback for all participants.
            </p>

            <button
              onClick={createSession}
              disabled={loadingSession}
              className="w-full px-6 py-3 bg-gradient-to-r from-brand to-brand/70 hover:opacity-90 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-wait"
            >
              {loadingSession ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </div>
      )}

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Join Karaoke Room</h3>
              <button onClick={() => handleModalClose(setShowJoinModal)}>
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                <AlertCircle size={16} className="text-destructive mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-foreground/80">Room Code</label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-center text-2xl font-mono tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-ring"
                maxLength={6}
                disabled={loadingSession}
              />
            </div>

            <button
              onClick={joinSession}
              disabled={joinCode.length !== 6 || loadingSession}
              className="w-full px-6 py-3 bg-gradient-to-r from-brand to-brand/70 hover:opacity-90 disabled:from-muted-foreground/40 disabled:to-muted-foreground/40 rounded-lg font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingSession ? 'Joining...' : 'Join Room'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
