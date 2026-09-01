import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  Compass,
  ArrowUpRight,
  HelpCircle,
  CornerDownRight,
} from 'lucide-react';
import type { Artwork, ChatMessage } from '../types';

interface DocentChatProps {
  artwork: Artwork;
  messages: ChatMessage[];
  isThinking: boolean;
  onSendMessage: (text: string, coordQuery?: { x: number; y: number }) => void;
  pendingCoordQuery: { x: number; y: number } | null;
  onClearCoordQuery: () => void;
}

export const DocentChat: React.FC<DocentChatProps> = ({
  artwork,
  messages,
  isThinking,
  onSendMessage,
  pendingCoordQuery,
  onClearCoordQuery,
}) => {
  const [inputText, setInputText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isThinking) return;

    const query = inputText.trim();
    setInputText('');
    onSendMessage(query, pendingCoordQuery || undefined);
    if (pendingCoordQuery) {
      onClearCoordQuery();
    }
  };

  const handleSuggestionClick = (prompt: string) => {
    if (isThinking) return;
    onSendMessage(prompt);
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

      {/* Suggested Inquiries / Prompt Chips */}
      <div className="px-4 py-2 border-t border-stone-800 bg-stone-950/40">
        <p className="text-[10px] uppercase font-mono tracking-wider text-amber-400/80 mb-2 flex items-center gap-1">
          <HelpCircle className="w-3 h-3" />
          Curatorial Inquiries for {artwork.title}
        </p>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
          {artwork.suggestedQuestions.map((question, i) => (
            <button
              key={i}
              onClick={() => handleSuggestionClick(question)}
              className="text-left text-xs bg-stone-800/70 hover:bg-stone-700/80 text-stone-300 hover:text-amber-200 px-2.5 py-1 rounded-full border border-stone-700/50 transition-colors flex items-center gap-1 group"
            >
              <span className="truncate max-w-[240px]">{question}</span>
              <ArrowUpRight className="w-3 h-3 text-stone-500 group-hover:text-amber-400 shrink-0" />
            </button>
          ))}
        </div>
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

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-stone-800 bg-stone-950">
        <div className="relative flex items-center">
          <input
            id="docent-chat-input"
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about a detail, color theory, or symbolism..."
            disabled={isThinking}
            className="w-full bg-stone-900 border border-stone-700/80 focus:border-amber-500/80 rounded-xl px-4 py-2.5 pr-12 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all font-sans"
          />
          <button
            id="btn-send-message"
            type="submit"
            disabled={!inputText.trim() || isThinking}
            className={`absolute right-1.5 p-2 rounded-lg transition-colors ${
              inputText.trim() && !isThinking
                ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold'
                : 'text-stone-600 bg-transparent cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
