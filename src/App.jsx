import React, { useState } from 'react';
import TextInputPane from './components/TextInputPane';
import LogDashboard from './components/LogDashboard';
import DiffDashboard from './components/DiffDashboard';
import { parseGitInput } from './utils/gitParser';
import { ArrowLeft } from 'lucide-react';

export default function App() {
  const [view, setView] = useState('input'); // 'input', 'log', 'diff'
  const [parsedData, setParsedData] = useState(null);

  const handleParse = (text) => {
    try {
      const result = parseGitInput(text);
      setParsedData(result.data);
      setView(result.type);
    } catch (e) {
      console.error('Failed to parse input:', e);
      alert('Failed to parse input text. Are you sure it is valid git log or git diff?');
    }
  };

  const handleBack = () => {
    setView('input');
    setParsedData(null);
  };

  return (
    <div className="h-screen w-screen bg-cyber-darker flex flex-col overflow-hidden">
      {view !== 'input' && (
        <header className="h-14 flex-shrink-0 bg-cyber-dark border-b border-cyber-border flex items-center px-4 justify-between z-20">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-1.5 rounded-lg bg-cyber-border/50 text-cyber-textMuted hover:text-white hover:bg-cyber-border transition-colors"
              title="Back to input"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="font-bold text-white text-lg tracking-tight">The Coordinate</h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-cyber-accent/20 text-cyber-accent px-2 py-1 rounded border border-cyber-accent/30 font-medium">
              {view === 'log' ? 'Log View' : 'Diff View'}
            </span>
          </div>
        </header>
      )}

      <main className="flex-1 overflow-hidden relative">
        {view === 'input' && <TextInputPane onParse={handleParse} />}
        {view === 'log' && <LogDashboard commits={parsedData} />}
        {view === 'diff' && <DiffDashboard files={parsedData} />}
      </main>
    </div>
  );
}
