import React, { useState } from 'react';
import { Artifact, ThemeMode } from '../types';
import { X, Copy, Check, Eye, Code, Maximize2, Minimize2, Sparkles, Droplets } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface ArtifactPanelProps {
  artifact: Artifact | null;
  onClose: () => void;
  themeMode: ThemeMode;
}

export const ArtifactPanel: React.FC<ArtifactPanelProps> = ({
  artifact,
  onClose,
  themeMode,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Playground sliders for preview
  const [blurVal, setBlurVal] = useState(24);
  const [opacityVal, setOpacityVal] = useState(15);
  const [glowColor, setGlowColor] = useState<'cyan' | 'purple' | 'amber'>('cyan');

  if (!artifact) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(artifact.content);
    setCopied(true);
    soundManager.playCommandAck();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className={`fixed top-0 right-0 z-40 h-full p-3 sm:p-4 transition-all duration-300 animate-in slide-in-from-right duration-300 ${
        isFullscreen ? 'w-full' : 'w-full md:w-[540px] lg:w-[620px]'
      }`}
    >
      <div 
        className="w-full h-full rounded-3xl flex flex-col overflow-hidden glass-panel-dark text-white border border-white/20 shadow-2xl backdrop-blur-2xl"
        style={{
          boxShadow: '0 25px 70px -15px rgba(0, 0, 0, 0.8), inset 0 1px 2px rgba(255, 255, 255, 0.25)',
        }}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm leading-tight text-slate-100">
                {artifact.title}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                {artifact.language || 'artifact'} · Claude Live Runtime
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            {/* Tab switch */}
            <div className="flex bg-black/30 p-0.5 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => {
                  soundManager.playTactileClick();
                  setActiveTab('preview');
                }}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  activeTab === 'preview'
                    ? 'bg-cyan-500 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
              <button
                onClick={() => {
                  soundManager.playTactileClick();
                  setActiveTab('code');
                }}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  activeTab === 'code'
                    ? 'bg-cyan-500 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Code</span>
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Copy artifact code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer hidden sm:block"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close artifact"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'preview' ? (
            /* Interactive Live Preview */
            <div className="space-y-6">
              {/* Material Shader Controls */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                  <span>REFRACTIVE SHADER LAB</span>
                  <div className="flex items-center gap-1.5">
                    {(['cyan', 'purple', 'amber'] as const).map((color) => (
                      <button
                        key={color}
                        onClick={() => setGlowColor(color)}
                        className={`w-3.5 h-3.5 rounded-full border border-white/40 cursor-pointer ${
                          color === 'cyan' ? 'bg-cyan-400' : color === 'purple' ? 'bg-purple-400' : 'bg-amber-400'
                        } ${glowColor === color ? 'ring-2 ring-white scale-110' : 'opacity-60'}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono text-slate-400">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Blur:</span>
                      <span className="text-cyan-300">{blurVal}px</span>
                    </div>
                    <input
                      type="range"
                      min="8"
                      max="40"
                      value={blurVal}
                      onChange={(e) => setBlurVal(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Alpha:</span>
                      <span className="text-cyan-300">{opacityVal}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="45"
                      value={opacityVal}
                      onChange={(e) => setOpacityVal(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Rendered Live Component */}
              <div className="relative rounded-3xl p-8 flex flex-col items-center justify-center min-h-[280px] overflow-hidden bg-slate-950/40 border border-white/10">
                {/* Floating ambient colored lights behind component */}
                <div 
                  className={`absolute w-48 h-48 rounded-full blur-3xl transition-all duration-500 pointer-events-none ${
                    glowColor === 'cyan' ? 'bg-cyan-500/30' : glowColor === 'purple' ? 'bg-purple-500/30' : 'bg-amber-500/30'
                  }`}
                />

                {/* The Live Liquid Glass Specimen Card */}
                <div
                  className="relative z-10 w-full max-w-sm rounded-3xl p-6 transition-all duration-300"
                  style={{
                    background: `rgba(255, 255, 255, ${opacityVal / 100})`,
                    backdropFilter: `blur(${blurVal}px) saturate(200%)`,
                    WebkitBackdropFilter: `blur(${blurVal}px) saturate(200%)`,
                    border: '1.5px solid rgba(255, 255, 255, 0.35)',
                    boxShadow: '0 25px 60px -10px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.6)',
                  }}
                >
                  {/* Caustic Highlight Stripe */}
                  <div className="absolute top-2 left-6 right-6 h-4 rounded-full bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

                  <div className="flex items-center gap-2 mb-3">
                    <Droplets className="w-5 h-5 text-cyan-300" />
                    <h4 className="font-display font-bold text-base text-white">
                      Refractive Liquid Glass
                    </h4>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed mb-4">
                    Rendered with dynamic caustic transmission and multi-stop backdrop dispersion matching Claude's aesthetic guidelines.
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/15 text-[11px] font-mono text-cyan-200">
                    <span>STATUS: ACTIVE</span>
                    <span>FPS: 60</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Syntax Formatted Code View */
            <div className="rounded-2xl overflow-hidden bg-black/60 border border-white/10">
              <pre className="p-4 text-xs font-mono text-cyan-200 leading-relaxed overflow-x-auto selection:bg-cyan-500/40">
                <code>{artifact.content}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
