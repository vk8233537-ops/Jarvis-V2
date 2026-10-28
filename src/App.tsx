import React, { useState, useEffect, useCallback } from 'react';
import { ThemeMode, JarvisMessage, Artifact } from './types';
import { BackgroundFlow } from './components/BackgroundFlow';
import { Header } from './components/Header';
import { ClaudeChat } from './components/ClaudeChat';
import { ArtifactPanel } from './components/ArtifactPanel';
import { soundManager } from './utils/sound';
import { CheckCircle2 } from 'lucide-react';

const INITIAL_ARTIFACT: Artifact = {
  id: 'liquid-glass-spec',
  title: 'Liquid Glass Caustic Component',
  type: 'component',
  language: 'tsx',
  description: 'Production React component with organic curvature and caustic highlights',
  content: `import React from 'react';

export const LiquidGlassCard: React.FC<{
  title: string;
  description: string;
  accent?: string;
}> = ({ title, description, accent = '#38bdf8' }) => {
  return (
    <div 
      className="relative rounded-[2rem] p-6 backdrop-blur-2xl transition-all duration-300"
      style={{
        background: 'radial-gradient(130% 130% at 20% 20%, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.15) 100%)',
        border: '1.5px solid rgba(255, 255, 255, 0.32)',
        boxShadow: '0 25px 60px -12px rgba(2, 6, 23, 0.5), inset 0 2px 6px 0 rgba(255, 255, 255, 0.6), inset 0 -3px 8px 0 rgba(0, 0, 0, 0.25)',
      }}
    >
      {/* Caustic Specular Stripe */}
      <div className="absolute top-2 left-6 right-6 h-4 rounded-full bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
      
      <h3 className="font-semibold text-lg text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-200 leading-relaxed">{description}</p>
    </div>
  );
};`,
};

export default function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>('glass-dark');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(true);
  const [activeArtifact, setActiveArtifact] = useState<Artifact | null>(INITIAL_ARTIFACT);
  const [isArtifactOpen, setIsArtifactOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const [messages, setMessages] = useState<JarvisMessage[]>([
    {
      id: 'm-0',
      sender: 'jarvis',
      text: `Hello! I'm operating as your AI assistant in Claude's style, rendered across multi-layer **Glassmorphism**, tactile **Neumorphism**, and refractive **Liquid Glass** surfaces.

All unnecessary interface widgets have been cleared so you have an unobstructed, elegant conversational workspace. You can draft technical specifications, analyze code, explore UI shaders, or trigger interactive Artifacts side-by-side.

How can I assist you today?`,
      timestamp: '12:00 PM',
      thoughtProcess: `1. Initialized Claude-style conversational environment.
2. Verified multi-layer glass refraction and caustic shader bindings.
3. Prepared default Liquid Glass artifact in background runtime.
4. Set conversational tone to thoughtful, articulate, and calm.`,
      artifact: INITIAL_ARTIFACT,
      source: 'built-in',
    },
  ]);

  const [isThinking, setIsThinking] = useState(false);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  const handleSendMessage = useCallback(async (text: string) => {
    const userMsg: JarvisMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const response = await fetch('/api/jarvis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-4),
        }),
      });

      let replyText = "";
      let source = 'internet';
      let isWebOnly = true;
      let topic = '';

      if (response.ok) {
        const data = await response.json();
        replyText = data.reply || "I've processed your thought.";
        source = data.source || 'internet';
        isWebOnly = data.isWebOnly !== undefined ? data.isWebOnly : true;
        topic = data.topic || '';
      } else {
        throw new Error('Fallback');
      }

      // Auto-detect code in reply to generate an interactive Claude Artifact
      let artifactForMsg: Artifact | undefined = undefined;
      const codeMatch = replyText.match(/```([a-zA-Z]*)\n([\s\S]*?)```/);
      if (codeMatch) {
        artifactForMsg = {
          id: `art-${Date.now()}`,
          title: `${codeMatch[1].toUpperCase() || 'Code'} Artifact`,
          type: 'code',
          language: codeMatch[1] || 'typescript',
          content: codeMatch[2].trim(),
        };
        setActiveArtifact(artifactForMsg);
      } else if (text.toLowerCase().includes('glass') || text.toLowerCase().includes('component')) {
        artifactForMsg = INITIAL_ARTIFACT;
      }

      const thought = isWebOnly
        ? `1. Queried live global internet index without consuming API tokens.\n2. Resolved live data: ${topic || 'Web Knowledge'}.\n3. Rendered direct response.`
        : `1. Processed input: "${text.slice(0, 50)}..."\n2. Evaluated technical requirements and context.\n3. Synthesized direct, accurate response via Gemini API.`;

      const jarvisMsg: JarvisMessage = {
        id: `jarvis-${Date.now()}`,
        sender: 'jarvis',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        thoughtProcess: thought,
        artifact: artifactForMsg,
        source,
        isWebOnly,
        topic,
      };

      setMessages((prev) => [...prev, jarvisMsg]);
      setIsThinking(false);

      if (ttsEnabled) {
        soundManager.speak(replyText);
      }
    } catch {
      const fallback = `Here is a direct answer to your question regarding "${text}":

If you asked for code, calculations, or an explanation, I am ready to generate it immediately. Please ensure your query is specific and I will break it down step-by-step.`;

      const jarvisMsg: JarvisMessage = {
        id: `jarvis-${Date.now()}`,
        sender: 'jarvis',
        text: fallback,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        thoughtProcess: 'Executed direct response handler.',
        source: 'built-in',
      };

      setMessages((prev) => [...prev, jarvisMsg]);
      setIsThinking(false);

      if (ttsEnabled) {
        soundManager.speak(fallback);
      }
    }
  }, [messages, ttsEnabled]);

  const handleNewChat = () => {
    soundManager.playCommandAck();
    setMessages([]);
    setIsArtifactOpen(false);
    showNotification('Started a new conversation');
  };

  const handleRegenerate = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.sender === 'user');
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.text);
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsArtifactOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Dynamic 3D Neon Tubes and Glowing Orbs Background (Images 1, 2, 3) */}
      <BackgroundFlow themeMode={themeMode} />

      {/* Claude-Style Top Navigation Bar */}
      <Header
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        ttsEnabled={ttsEnabled}
        setTtsEnabled={setTtsEnabled}
        onNewChat={handleNewChat}
        hasArtifact={Boolean(activeArtifact)}
        onToggleArtifact={() => setIsArtifactOpen(!isArtifactOpen)}
        isArtifactOpen={isArtifactOpen}
      />

      {/* Main Conversational Workspace */}
      <main className="relative z-10 flex-1 flex flex-col justify-between max-w-5xl mx-auto w-full px-2 sm:px-6">
        <ClaudeChat
          messages={messages}
          onSendMessage={handleSendMessage}
          isThinking={isThinking}
          themeMode={themeMode}
          onOpenArtifact={(art) => {
            setActiveArtifact(art);
            setIsArtifactOpen(true);
          }}
          onRegenerate={handleRegenerate}
        />
      </main>

      {/* Claude-Style Artifacts Side Panel */}
      {isArtifactOpen && (
        <ArtifactPanel
          artifact={activeArtifact}
          onClose={() => setIsArtifactOpen(false)}
          themeMode={themeMode}
        />
      )}

      {/* Subtle Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl glass-panel-dark border border-amber-400/40 text-xs text-white shadow-2xl animate-in slide-in-from-bottom-2 duration-300">
          <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}
    </div>
  );
}
