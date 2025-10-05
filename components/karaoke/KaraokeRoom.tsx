import React, { useState } from 'react';
import {
  Music, Users, Play, Pause, Copy, Check, MessageCircle, Crown, Mic, AlertCircle, Loader2
} from 'lucide-react';
import { UseKaraokeSession } from '@/hooks/useKaraokeSession';
import { SAMPLE_SONGS, Song } from '@/components/types';

// Define props by picking only what KaraokeRoom needs from the hook
type KaraokeRoomProps = Pick<
  UseKaraokeSession,
  | 'roomCode'
  | 'isHost'
  | 'participants'
  | 'chatMessages'
  | 'selectedSong'
  | 'isPlaying'
  | 'currentLyricIndex'
  | 'error'
  | 'leaveSession'
  | 'togglePlayback'
  | 'changeSong'
  | 'sendMessage'
>;

export const KaraokeRoom: React.FC<KaraokeRoomProps> = ({
  roomCode,
  isHost,
  participants,
  chatMessages,
  selectedSong,
  isPlaying,
  currentLyricIndex,
  error,
  leaveSession,
  togglePlayback,
  changeSong,
  sendMessage,
}) => {
  const [copied, setCopied] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  const chatEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Scroll to the latest message whenever chatMessages updates
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
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
                  <code className="px-2 py-1 bg-slate-800 rounded font-mono tracking-wider">{roomCode}</code>
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
              <AlertCircle size={16} className="text-red-400 mt-0.5" />
              <p className="text-sm text-red-400">Sync Error: {error}</p>
            </div>
        )}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Karaoke Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Current Song & Lyrics */}
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
              <div className="bg-slate-800/50 rounded-lg p-8 min-h-[300px] flex items-center justify-center mb-6 overflow-hidden">
                <div className="text-center space-y-4">
                  {selectedSong.lyrics.map((lyric, idx) => (
                    <p
                      key={idx}
                      className={`text-2xl transition-all duration-300 px-4 py-1 rounded-md ${
                        idx === currentLyricIndex
                          ? 'text-white font-extrabold scale-110 bg-purple-600/30 shadow-lg'
                          : idx === currentLyricIndex - 1 || idx === currentLyricIndex + 1
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
                    className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-full flex items-center justify-center transition-all shadow-xl hover:scale-105"
                  >
                    {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg border border-slate-700">
                    <Mic className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-400">Host controls playback</span>
                  </div>
                </div>
              )}
            </div>

            {/* Song Selection (Host Only) */}
            {isHost && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-purple-300">Select Song</h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  {SAMPLE_SONGS.map((song) => (
                    <button
                      key={song.id}
                      onClick={() => changeSong(song)}
                      className={`p-4 rounded-lg border transition-all text-left shadow-md hover:shadow-purple-500/20 ${
                        selectedSong.id === song.id
                          ? 'bg-purple-600/30 border-purple-500 ring-2 ring-purple-500'
                          : 'bg-slate-800 border-slate-700 hover:border-purple-700'
                      }`}
                    >
                      <div className="font-medium truncate">{song.title}</div>
                      <div className="text-xs text-slate-400">{song.artist}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar (Participants & Chat) */}
          <div className="space-y-6">
            
            {/* Participants */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2"><Users size={20} className="text-pink-400" /> Participants</h3>
                <span className="text-sm text-slate-400">{participants.length} online</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg shadow-inner"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {participant.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 truncate">
                      <div className="font-medium text-sm truncate">{participant.username}</div>
                      {participant.is_host && (
                        <div className="text-xs text-purple-400 flex items-center gap-1">
                            <Crown size={12} /> Host
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageCircle size={20} className="text-purple-400" />
                Chat
              </h3>

              <div className="space-y-3 mb-4 h-64 overflow-y-auto pr-2 flex flex-col justify-end">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="text-sm break-words">
                    <span className="font-medium text-pink-400">{msg.username}:</span>
                    <span className="text-slate-300 ml-2">{msg.message}</span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors disabled:opacity-50"
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
};
