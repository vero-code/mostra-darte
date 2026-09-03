import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import {
  // Send,
  Sparkles,
  Volume2,
  VolumeX,
  Compass,
  // ArrowUpRight,
  // HelpCircle,
  CornerDownRight,
} from 'lucide-react';
import type { Artwork, ChatMessage } from '../types';
import { docentSpeech } from '../utils/speech';

interface DocentChatProps {
  artwork: Artwork;
  messages: ChatMessage[];
  isThinking: boolean;
  onSendMessage: (text: string, coordQuery?: { x: number; y: number }) => void;
  pendingCoordQuery: { x: number; y: number } | null;
  onClearCoordQuery: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
}

export const DocentChat: React.FC<DocentChatProps> = ({
  // artwork,
  messages,
  isThinking,
  // onSendMessage,
  pendingCoordQuery,
  onClearCoordQuery,
  voiceEnabled,
  onToggleVoice,
}) => {
  const [, setInputText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync speech speaking state
  useEffect(() => {
    docentSpeech.setSpeakingCallback((speaking) => {
      setIsSpeaking(speaking);
    });
  }, []);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Handle pending coordinate click from canvas
  useEffect(() => {
    if (pendingCoordQuery) {
      setInputText(`What is this detail here at ${pendingCoordQuery.x}% X, ${pendingCoordQuery.y}% Y?`);
      inputRef.current?.focus();
    }
  }, [pendingCoordQuery]);

  const handleReadAloud = (text: string) => {
    docentSpeech.speak(text, true);
  };

  return (
    <div className="flex flex-col h-full bg-stone-900/95 border-l border-stone-800 text-stone-100 relative">
      {/* Docent Header Card */}
      <div className="p-4 border-b border-stone-800/80 bg-stone-950/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-700 via-amber-500 to-amber-300 p-0.5 shadow-lg">
              <div className="w-full h-full bg-stone-950 rounded-full flex items-center justify-center">
                <Compass className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            {isSpeaking && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-stone-950 rounded-full animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-semibold text-sm text-stone-100 tracking-wide">
                Virtual Docent
              </h2>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-medium">
                Director of Attention
              </span>
            </div>
            <p className="text-[11px] text-stone-400 font-serif-body italic">
              {isThinking ? 'Examining brushstrokes...' : isSpeaking ? 'Speaking in gallery...' : 'Guiding Mostra d\'Arte'}
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5">
          <button
            id="btn-voice-toggle"
            title={voiceEnabled ? 'Mute Docent Narration' : 'Enable Voice Narration'}
            onClick={onToggleVoice}
            className={`p-2 rounded-lg transition-colors ${
              voiceEnabled
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'hover:bg-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isAssistant = msg.role === 'assistant';

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
            >
              {/* Message Bubble */}
              <div
                className={`max-w-[92%] rounded-xl px-4 py-3 shadow-md ${
                  isAssistant
                    ? 'bg-stone-800/80 border border-stone-700/60 text-stone-100'
                    : 'bg-gradient-to-br from-amber-700 to-amber-800 text-stone-50 border border-amber-600/60'
                }`}
              >
                {/* Assistant Label */}
                {isAssistant && (
                  <div className="flex items-center justify-between mb-2 text-xs text-amber-400/90 font-display">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Head Curator
                    </span>
                    <button
                      onClick={() => handleReadAloud(msg.content)}
                      title="Read aloud"
                      className="text-stone-400 hover:text-amber-300 transition-colors p-1"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Markdown content */}
                <div className="text-sm font-serif-body leading-relaxed space-y-2">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      strong: ({ children }) => (
                        <strong className="text-amber-300 font-semibold">{children}</strong>
                      ),
                      em: ({ children }) => <em className="italic text-stone-300">{children}</em>,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>

              <span className="text-[10px] text-stone-500 mt-1 px-1 font-mono">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </motion.div>
          );
        })}

        {/* Thinking Indicator */}
        {isThinking && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-stone-400 bg-stone-800/60 border border-stone-700/40 px-3.5 py-2 rounded-xl w-fit"
          >
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs font-serif-body italic">
              The Docent is aligning spatial attention...
            </span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Pending Canvas Coordinate Query Banner */}
      {pendingCoordQuery && (
        <div className="px-4 py-1.5 bg-amber-500/10 border-t border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-1.5">
            <CornerDownRight className="w-3.5 h-3.5 text-amber-400" />
            <span>Targeting Canvas Coordinate: <strong>{pendingCoordQuery.x}% X, {pendingCoordQuery.y}% Y</strong></span>
          </div>
          <button
            onClick={onClearCoordQuery}
            className="text-stone-400 hover:text-stone-200 underline text-[11px]"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};
