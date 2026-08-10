import React, { useState } from 'react';
import { Terminal, GitBranch, ClipboardCopy } from 'lucide-react';

export default function TextInputPane({ onParse }) {
  const [text, setText] = useState('');

  const handlePaste = (e) => {
    // Optionally auto-parse on paste, or let them click a button
  };

  const handleSubmit = () => {
    if (text.trim()) {
      onParse(text);
    }
  };

  const copyPreset = () => {
    const preset = 'git log --pretty=format:"%h|%p|%an|%ad|%s"';
    navigator.clipboard.writeText(preset);
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-cyber-darker p-6">
      <div className="max-w-3xl w-full bg-cyber-dark border border-cyber-border rounded-xl shadow-2xl p-8 animate-slide-up">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-cyber-border rounded-lg text-cyber-accent">
            <GitBranch size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">The Coordinate</h1>
            <p className="text-cyber-muted text-sm mt-1">Paste your raw git log or diff to visualize the paths</p>
          </div>
        </div>

        <div className="relative mb-6 group">
          <div className="absolute inset-0 bg-cyber-accent opacity-20 blur-xl group-hover:opacity-30 transition-opacity rounded-xl"></div>
          <textarea
            className="relative w-full h-64 bg-cyber-darkest border border-cyber-border rounded-xl p-4 text-cyber-text font-mono text-sm focus:outline-none focus:border-cyber-accentHover transition-colors resize-none placeholder-cyber-borderHover leading-relaxed"
            placeholder="Paste 'git log' or 'git diff' here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onPaste={handlePaste}
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={copyPreset}
            className="flex items-center space-x-2 px-4 py-2 bg-cyber-darker border border-cyber-border rounded-lg text-cyber-textMuted hover:text-white hover:border-cyber-borderHover transition-colors text-sm"
          >
            <ClipboardCopy size={16} />
            <span>Copy Smart Log Command</span>
          </button>
          
          <button
            onClick={handleSubmit}
            className="flex items-center space-x-2 px-6 py-2.5 bg-cyber-accent hover:bg-cyber-accentHover text-white rounded-lg font-medium transition-all shadow-[0_0_15px_rgba(124,58,237,0.4)] hover:shadow-[0_0_25px_rgba(124,58,237,0.6)]"
          >
            <Terminal size={18} />
            <span>Visualize</span>
          </button>
        </div>
      </div>
    </div>
  );
}
