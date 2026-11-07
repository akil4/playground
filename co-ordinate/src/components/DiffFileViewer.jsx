import React, { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-json';
import clsx from 'clsx';

export default function DiffFileViewer({ file }) {
  useEffect(() => {
    Prism.highlightAll();
  }, [file]);

  if (!file) {
    return (
      <div className="flex-1 h-full flex items-center justify-center bg-cyber-darkest text-cyber-textMuted">
        Select a file from the sidebar to view its diff
      </div>
    );
  }

  // Very basic language detection by extension
  const ext = file.name.split('.').pop().toLowerCase();
  let lang = 'javascript';
  if (['css', 'scss', 'less'].includes(ext)) lang = 'css';
  if (['html', 'xml'].includes(ext)) lang = 'markup';
  if (['json'].includes(ext)) lang = 'json';

  const renderLine = (line, idx) => {
    const isAdded = line.type === 'addition';
    const isDeleted = line.type === 'deletion';
    
    return (
      <div 
        key={idx} 
        className={clsx(
          "flex font-mono text-[13px] leading-relaxed group",
          isAdded && "bg-cyber-nodeFeat/10 text-cyber-nodeFeat",
          isDeleted && "bg-cyber-nodeFix/10 text-cyber-nodeFix"
        )}
      >
        <div className={clsx(
          "w-12 flex-shrink-0 text-right pr-4 select-none opacity-50 text-[11px] pt-[2px]",
          isAdded && "bg-cyber-nodeFeat/20 text-cyber-nodeFeat font-bold opacity-100",
          isDeleted && "bg-cyber-nodeFix/20 text-cyber-nodeFix font-bold opacity-100"
        )}>
          {isAdded ? '+' : isDeleted ? '-' : ' '}
        </div>
        <div className="px-4 flex-1 whitespace-pre-wrap break-all">
          <code className={`language-${lang} !bg-transparent !p-0 !text-[inherit] !shadow-none !border-none`}>
            {line.content || ' '}
          </code>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-cyber-darkest overflow-hidden">
      <div className="h-12 border-b border-cyber-border flex items-center px-6 bg-cyber-dark">
        <span className="text-white font-mono text-sm">{file.name}</span>
        <div className="ml-4 flex space-x-3 text-xs">
          <span className="text-cyber-nodeFeat font-semibold">+{file.additions}</span>
          <span className="text-cyber-nodeFix font-semibold">-{file.deletions}</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-cyber-darkest pb-8">
        {file.hunks.map((hunk, hIdx) => (
          <div key={hIdx} className="mb-4">
            <div className="bg-cyber-border/30 text-cyber-accent px-12 py-1 font-mono text-xs border-y border-cyber-border/50">
              {hunk.header}
            </div>
            <div className="py-2">
              {hunk.lines.map((line, lIdx) => renderLine(line, lIdx))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
