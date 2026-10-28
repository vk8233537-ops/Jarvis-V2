import React, { useState, useRef, useEffect } from 'react';
import { JarvisMessage, ThemeMode, Artifact } from '../types';
import { 
  Send, 
  Sparkles, 
  Volume2, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Code2, 
  RotateCcw, 
  ArrowUp,
  Mic,
  MicOff,
  Lightbulb,
  FileCode,
  Layers,
  Palette
} from 'lucide-react';
import { soundManager } from '../utils/sound';

interface ClaudeChatProps {
  messages: JarvisMessage[];
  onSendMessage: (text: string) => void;
  isThinking: boolean;
  themeMode: ThemeMode;
  onOpenArtifact: (artifact: Artifact) => void;
  onRegenerate: () => void;
}

export const ClaudeChat: React.FC<ClaudeChatProps> = ({
  messages,
  onSendMessage,
  isThinking,
  themeMode,
  onOpenArtifact,
  onRegenerate,
}) => {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedThinking, setExpandedThinking] = useState<Record<string, boolean>>({});
  const [isListening, setIsListening] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(180, textareaRef.current.scrollHeight)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isThinking) return;
    const text = input.trim();
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    soundManager.playCommandAck();
    onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    soundManager.playTactileClick();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleThinking = (msgId: string) => {
    soundManager.playTactileClick();
    setExpandedThinking((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const toggleVoiceInput = () => {
    soundManager.playTactileClick();
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        if (isListening) {
          setIsListening(false);
          return;
        }
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';

        rec.onstart = () => {
          setIsListening(true);
          soundManager.playChime(880, 0.15);
        };

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
        };

        rec.onerror = () => setIsListening(false);
        rec.onend = () => setIsListening(false);

        rec.start();
      } else {
        // Fallback simulation
        setInput("Design a production-grade Liquid Glass card component in React with tailwind.");
      }
    }
  };

  // Helper to render Claude markdown (code blocks, bold, headers)
  const renderMessageContent = (msg: JarvisMessage) => {
    const text = msg.text;
    const codeBlockRegex = /```([a-zA-Z]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index),
        });
      }
      parts.push({
        type: 'code',
        language: match[1] || 'typescript',
        content: match[2].trim(),
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex),
      });
    }

    return (
      <div className="space-y-3.5 leading-relaxed text-sm">
        {parts.map((part, idx) => {
          if (part.type === 'code') {
            return (
              <div 
                key={idx} 
                className="my-3 rounded-2xl overflow-hidden border border-white/15 bg-black/40 backdrop-blur-xl shadow-lg"
              >
                <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10 text-xs font-mono text-slate-400">
                  <span>{part.language || 'code'}</span>
                  <button
                    onClick={() => handleCopy(part.content, `code-${idx}`)}
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedId === `code-${idx}` ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy code</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 overflow-x-auto text-xs font-mono text-cyan-200/90 leading-normal selection:bg-cyan-500/40">
                  <code>{part.content}</code>
                </pre>
              </div>
            );
          }

          // Format normal paragraphs and lists
          return (
            <div key={idx} className="whitespace-pre-wrap text-slate-200">
              {part.content}
            </div>
          );
        })}
      </div>
    );
  };

  const starterPrompts = [
    {
      title: 'Live Satellite Weather',
      desc: 'Real-time temperature and forecast from global satellite feeds (0 API).',
      icon: Lightbulb,
      prompt: 'Weather in Delhi',
    },
    {
      title: 'Global Currency & Crypto',
      desc: 'Live financial exchange and Bitcoin rates directly from market index.',
      icon: Palette,
      prompt: 'USD to INR exchange rate',
    },
    {
      title: 'Wikipedia Web Knowledge',
      desc: 'Instant biographical and historical encyclopedia lookup (0 API).',
      icon: Layers,
      prompt: 'Who is Elon Musk',
    },
    {
      title: 'Liquid Glass Component',
      desc: 'Neural code synthesis with caustic shaders and glassmorphism (API).',
      icon: FileCode,
      prompt: 'Write a complete Liquid Glass component in React with caustic specular highlights and tailwind styles.',
    },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto w-full px-2 sm:px-4">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 pt-2 pb-6">
        {messages.length === 0 ? (
          /* Claude-style Clean Welcome Screen */
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center my-auto px-4 animate-in fade-in duration-500">
            {/* Claude-style Warm Starburst Avatar */}
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-700 p-0.5 shadow-xl shadow-orange-500/20 border border-white/30 flex items-center justify-center">
                <span className="font-serif text-3xl font-bold text-white select-none">✦</span>
              </div>
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-amber-500/30 to-cyan-500/30 blur-xl pointer-events-none -z-10" />
            </div>

            <h1 className="font-display font-semibold text-2xl sm:text-3xl text-white tracking-tight mb-2">
              Good afternoon. How can I help you today?
            </h1>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
              Operating with multi-layer Glassmorphism, tactile Neumorphism, and refractive Liquid Glass surfaces.
            </p>

            {/* 4 Sleek Prompt Starter Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-2xl text-left">
              {starterPrompts.map((starter, i) => {
                const Icon = starter.icon;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      soundManager.playCommandAck();
                      onSendMessage(starter.prompt);
                    }}
                    className={`p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer group ${
                      themeMode === 'neumorphic'
                        ? 'neumorphic-panel hover:shadow-cyan-500/10'
                        : 'glass-panel hover:bg-white/12 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="p-1.5 rounded-lg bg-white/10 text-cyan-400 group-hover:text-amber-400 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-display font-medium text-xs text-slate-100 group-hover:text-white">
                        {starter.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal pl-8">
                      {starter.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Conversation Stream */
          messages.map((msg) => {
            const isJarvis = msg.sender === 'jarvis';
            const isThinkingOpen = expandedThinking[msg.id] ?? false;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 ${isJarvis ? 'items-start' : 'items-start justify-end'}`}
              >
                {/* Claude Avatar */}
                {isJarvis && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-600 border border-white/25 flex items-center justify-center text-white shadow-md shadow-orange-500/20 mt-1">
                    <span className="font-serif text-sm font-bold">✦</span>
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`relative max-w-[88%] md:max-w-[82%] rounded-3xl p-5 sm:p-6 transition-all ${
                    isJarvis
                      ? themeMode === 'glass-light'
                        ? 'glass-panel-light text-slate-900 shadow-md'
                        : themeMode === 'liquid-glass'
                        ? 'liquid-glass text-white'
                        : themeMode === 'neumorphic'
                        ? 'neumorphic-panel text-slate-100'
                        : 'glass-panel-dark text-white'
                      : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-orange-500/20 border border-white/20 ml-auto'
                  }`}
                >
                  {/* Collapsible Claude Thinking Process (Like Claude 3.7 Thinking Mode) */}
                  {isJarvis && msg.thoughtProcess && (
                    <div className="mb-4 pb-3 border-b border-white/10">
                      <button
                        onClick={() => toggleThinking(msg.id)}
                        className="flex items-center gap-2 text-xs font-mono text-amber-300/90 hover:text-amber-200 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Thinking Process</span>
                        {isThinkingOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isThinkingOpen && (
                        <div className="mt-2.5 p-3 rounded-xl bg-black/30 border border-white/10 text-xs text-slate-300 font-mono leading-relaxed space-y-1.5 animate-in fade-in duration-200">
                          {msg.thoughtProcess}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Render Main Body */}
                  {isJarvis ? renderMessageContent(msg) : <div className="text-sm leading-relaxed">{msg.text}</div>}

                  {/* Inline Artifact Launcher (Claude style) */}
                  {isJarvis && msg.artifact && (
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <div 
                        onClick={() => {
                          soundManager.playTactileClick();
                          onOpenArtifact(msg.artifact!);
                        }}
                        className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                            <Code2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-100 group-hover:text-cyan-300">
                              {msg.artifact.title}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Click to view interactive Artifact ({msg.artifact.type})
                            </div>
                          </div>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-lg bg-cyan-500 text-white font-medium group-hover:brightness-110">
                          View
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Bar */}
                  {isJarvis && (
                    <div className="flex items-center justify-between mt-4 pt-2.5 border-t border-white/10 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(msg.text, msg.id)}
                          className="p-1 rounded-lg hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => {
                            soundManager.playChime(750, 0.1);
                            soundManager.speak(msg.text);
                          }}
                          className="p-1 rounded-lg hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                          title="Read aloud"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            soundManager.playTactileClick();
                            onRegenerate();
                          }}
                          className="p-1 rounded-lg hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                          title="Regenerate response"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {msg.isWebOnly || msg.source?.startsWith('internet') ? (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Live Web · 0 API Tokens
                          </span>
                        ) : msg.source === 'gemini' ? (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            Gemini API On-Demand
                          </span>
                        ) : null}

                        <span className="text-[10px] font-mono opacity-60">
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-600/40 border border-white/20 flex items-center justify-center text-white animate-pulse">
              <span className="font-serif text-sm font-bold">✦</span>
            </div>
            <div className="rounded-2xl px-4 py-3 glass-panel text-slate-300 text-xs flex items-center gap-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span className="font-mono text-slate-300">Claude is reasoning...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Claude-Style Tactile Input Dock */}
      <div className="relative pt-2 pb-4">
        <form
          onSubmit={handleSubmit}
          className={`relative rounded-3xl p-2.5 sm:p-3 transition-all duration-300 ${
            themeMode === 'glass-light'
              ? 'glass-panel-light'
              : themeMode === 'liquid-glass'
              ? 'liquid-glass'
              : themeMode === 'neumorphic'
              ? 'neumorphic-panel'
              : 'glass-panel-dark'
          }`}
        >
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Reply to Claude... (Shift+Enter for newline)"
            className="w-full bg-transparent px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none leading-relaxed"
            disabled={isThinking}
          />

          {/* Lower Toolbar */}
          <div className="flex items-center justify-between pt-2 px-1 border-t border-white/10">
            {/* Left buttons (Voice input, Style tags) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`p-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isListening
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                title="Voice dictation"
              >
                {isListening ? <Mic className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4" />}
                <span className="text-[11px] font-mono hidden sm:inline">
                  {isListening ? 'Listening...' : 'Dictate'}
                </span>
              </button>

              <span className="text-[11px] font-mono text-slate-500 hidden md:inline">
                ✦ Claude 3.7 Hybrid Engine
              </span>
            </div>

            {/* Right: Send Button with Liquid Glass Highlight */}
            <button
              type="submit"
              disabled={!input.trim() || isThinking}
              className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                input.trim() && !isThinking
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/25 hover:brightness-110 active:scale-95'
                  : 'bg-white/5 text-slate-600 cursor-not-allowed'
              }`}
            >
              <ArrowUp className="w-4 h-4 font-bold" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
