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
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Music className="w-8 h-8 text-brand" />
              <div>
                <h1 className="text-xl font-bold">Karaoke Room</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Code:</span>
                  <code className="px-2 py-1 bg-muted rounded font-mono tracking-wider">{roomCode}</code>
                  <button onClick={copyRoomCode} className="text-brand hover:text-brand">
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={leaveSession}
              className="px-4 py-2 bg-destructive hover:bg-red-500 rounded-lg text-sm font-medium transition-colors"
            >
              Leave Room
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
              <AlertCircle size={16} className="text-destructive mt-0.5" />
              <p className="text-sm text-destructive">Sync Error: {error}</p>
            </div>
        )}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Karaoke Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Current Song & Lyrics */}
            <div className="bg-card/50 border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedSong.title}</h2>
                  <p className="text-muted-foreground">{selectedSong.artist}</p>
                </div>
                {isHost && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-brand/20 border border-brand/30 rounded-full text-sm">
                    <Crown size={14} className="text-brand" />
                    <span className="text-brand">Host</span>
                  </div>
                )}
              </div>

              {/* Lyrics Display */}
              <div className="bg-muted/50 rounded-lg p-8 min-h-[300px] flex items-center justify-center mb-6 overflow-hidden">
                <div className="text-center space-y-4">
                  {selectedSong.lyrics.map((lyric, idx) => (
                    <p
                      key={idx}
                      className={`text-2xl transition-all duration-300 px-4 py-1 rounded-md ${
                        idx === currentLyricIndex
                          ? 'text-foreground font-extrabold scale-110 bg-brand/30 shadow-lg'
                          : idx === currentLyricIndex - 1 || idx === currentLyricIndex + 1
                          ? 'text-muted-foreground'
                          : 'text-muted-foreground'
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
                    className="w-16 h-16 bg-gradient-to-r from-brand to-brand/70 hover:opacity-90 rounded-full flex items-center justify-center transition-all shadow-xl hover:scale-105"
                  >
                    {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-lg border border-border">
                    <Mic className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Host controls playback</span>
                  </div>
                </div>
              )}
            </div>

            {/* Song Selection (Host Only) */}
            {isHost && (
              <div className="bg-card/50 border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-brand">Select Song</h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  {SAMPLE_SONGS.map((song) => (
                    <button
                      key={song.id}
                      onClick={() => changeSong(song)}
                      className={`p-4 rounded-lg border transition-all text-left shadow-md hover:shadow-brand/20 ${
                        selectedSong.id === song.id
                          ? 'bg-brand/30 border-brand ring-2 ring-ring'
                          : 'bg-muted border-border hover:border-brand'
                      }`}
                    >
                      <div className="font-medium truncate">{song.title}</div>
                      <div className="text-xs text-muted-foreground">{song.artist}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar (Participants & Chat) */}
          <div className="space-y-6">
            
            {/* Participants */}
            <div className="bg-card/50 border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2"><Users size={20} className="text-pink-600 dark:text-pink-400" /> Participants</h3>
                <span className="text-sm text-muted-foreground">{participants.length} online</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg shadow-inner"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-brand to-brand/70 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {participant.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 truncate">
                      <div className="font-medium text-sm truncate">{participant.username}</div>
                      {participant.is_host && (
                        <div className="text-xs text-brand flex items-center gap-1">
                            <Crown size={12} /> Host
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat */}
            <div className="bg-card/50 border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageCircle size={20} className="text-brand" />
                Chat
              </h3>

              <div className="space-y-3 mb-4 h-64 overflow-y-auto pr-2 flex flex-col justify-end">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="text-sm break-words">
                    <span className="font-medium text-pink-600 dark:text-pink-400">{msg.username}:</span>
                    <span className="text-foreground/80 ml-2">{msg.message}</span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50"
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
