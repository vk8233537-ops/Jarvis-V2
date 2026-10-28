import React from 'react';
import { ThemeMode } from '../types';
import { soundManager } from '../utils/sound';
import { 
  Sparkles, 
  Layers, 
  Droplet, 
  Cpu, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Plus, 
  Code2,
  SlidersHorizontal
} from 'lucide-react';

interface HeaderProps {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  ttsEnabled: boolean;
  setTtsEnabled: (v: boolean) => void;
  onNewChat: () => void;
  hasArtifact: boolean;
  onToggleArtifact: () => void;
  isArtifactOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  themeMode,
  setThemeMode,
  soundEnabled,
  setSoundEnabled,
  ttsEnabled,
  setTtsEnabled,
  onNewChat,
  hasArtifact,
  onToggleArtifact,
  isArtifactOpen,
}) => {
  const modes: { id: ThemeMode; label: string; icon: any }[] = [
    { id: 'glass-dark', label: 'Dark Glass', icon: Layers },
    { id: 'glass-light', label: 'Light Glass', icon: Sparkles },
    { id: 'liquid-glass', label: 'Liquid Glass', icon: Droplet },
    { id: 'neumorphic', label: 'Neumorphism', icon: Cpu },
  ];

  const handleModeChange = (mode: ThemeMode) => {
    soundManager.playTactileClick();
    setThemeMode(mode);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.enabled = next;
    if (next) soundManager.playChime(640);
  };

  const toggleTts = () => {
    const next = !ttsEnabled;
    setTtsEnabled(next);
    soundManager.ttsEnabled = next;
    if (next) soundManager.playChime(780);
    else soundManager.stopSpeaking();
  };

  return (
    <header className="relative z-30 w-full px-4 sm:px-8 pt-4 pb-2">
      <div 
        className={`mx-auto max-w-5xl rounded-2xl px-5 py-3 flex flex-wrap items-center justify-between gap-3 transition-all duration-300 ${
          themeMode === 'glass-light'
            ? 'glass-panel-light text-slate-800'
            : themeMode === 'liquid-glass'
            ? 'liquid-glass text-white'
            : themeMode === 'neumorphic'
            ? 'neumorphic-panel text-slate-100'
            : 'glass-panel-dark text-white'
        }`}
      >
        {/* Brand: Claude-style subtle intelligence mark */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-700 shadow-md shadow-amber-500/20 border border-white/20">
            {/* Claude-style warm geometric starburst */}
            <span className="font-serif text-lg font-bold text-white select-none">✦</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-semibold text-sm tracking-wide">
                Claude // Jarvis
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                99% Web Engine · API On-Demand
              </span>
            </div>
          </div>
        </div>

        {/* Center: Material Switcher (Glassmorphism, Neumorphism, Liquid Glass) */}
        <div className="flex items-center bg-black/25 p-1 rounded-xl border border-white/10">
          {modes.map((m) => {
            const Icon = m.icon;
            const isActive = themeMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => handleModeChange(m.id)}
                title={`Switch surface to ${m.label}`}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/80 to-orange-600/80 text-white shadow-sm border border-white/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Actions (Artifacts Toggle, New Chat, Audio Controls) */}
        <div className="flex items-center gap-2">
          {/* Artifacts Viewer Button (Claude style) */}
          <button
            onClick={() => {
              soundManager.playTactileClick();
              onToggleArtifact();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
              isArtifactOpen
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-sm shadow-cyan-500/20'
                : hasArtifact
                ? 'bg-white/10 text-slate-200 border-cyan-400/40 hover:bg-white/15'
                : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
            }`}
            title="Toggle Claude-style Artifact viewer"
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Artifact</span>
            {hasArtifact && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            )}
          </button>

          {/* Sound / TTS toggles */}
          <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl border border-white/10">
            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Mute chimes' : 'Enable chimes'}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                soundEnabled ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={toggleTts}
              title={ttsEnabled ? 'Disable voice read aloud' : 'Enable voice read aloud'}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                ttsEnabled ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {ttsEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={() => {
              soundManager.playCommandAck();
              onNewChat();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 cursor-pointer transition-all"
            title="Start new conversation"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </div>
    </header>
  );
};
