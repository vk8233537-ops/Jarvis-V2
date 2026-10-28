export type ThemeMode = 'glass-dark' | 'glass-light' | 'liquid-glass' | 'neumorphic';

export interface Artifact {
  id: string;
  title: string;
  type: 'code' | 'document' | 'component' | 'shader';
  language?: string;
  content: string;
  description?: string;
}

export interface JarvisMessage {
  id: string;
  sender: 'user' | 'jarvis';
  text: string;
  timestamp: string;
  thoughtProcess?: string;
  artifact?: Artifact;
  source?: string;
  isWebOnly?: boolean;
  topic?: string;
  model?: string;
}
