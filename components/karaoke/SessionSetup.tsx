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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 text-white">
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
            disabled={loadingSession}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg font-medium transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-wait"
          >
            <UserPlus size={20} />
            Create Room
          </button>

          <button
            onClick={() => setShowJoinModal(true)}
            disabled={loadingSession}
            className="w-full px-6 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg font-medium transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-wait"
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
              <button onClick={() => handleModalClose(setShowCreateModal)}>
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
              You&apos;ll be the host and can control playback for all participants.
            </p>

            <button
              onClick={createSession}
              disabled={loadingSession}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-wait"
            >
              {loadingSession ? 'Creating...' : 'Create Room'}
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
              <button onClick={() => handleModalClose(setShowJoinModal)}>
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
              <label className="block text-sm font-medium mb-2 text-slate-300">Room Code</label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-center text-2xl font-mono tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-purple-500"
                maxLength={6}
                disabled={loadingSession}
              />
            </div>

            <button
              onClick={joinSession}
              disabled={joinCode.length !== 6 || loadingSession}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-600 disabled:to-slate-600 rounded-lg font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingSession ? 'Joining...' : 'Join Room'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
