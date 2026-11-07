import React from 'react';
import { FileDiff, FilePlus, FileMinus, FileText, ChevronRight, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

export default function DiffSidebar({ files, selectedFile, onSelectFile }) {
  // We can group files by directory, but a flat list is simpler for now
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'added': return <FilePlus size={16} className="text-cyber-nodeFeat" />;
      case 'deleted': return <FileMinus size={16} className="text-cyber-nodeFix" />;
      default: return <FileDiff size={16} className="text-cyber-nodeDefault" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'added': return <span className="text-[10px] font-bold text-cyber-nodeFeat bg-cyber-nodeFeat/10 px-1 rounded">A</span>;
      case 'deleted': return <span className="text-[10px] font-bold text-cyber-nodeFix bg-cyber-nodeFix/10 px-1 rounded">D</span>;
      default: return <span className="text-[10px] font-bold text-cyber-nodeDefault bg-cyber-nodeDefault/10 px-1 rounded">M</span>;
    }
  };

  return (
    <div className="w-72 flex-shrink-0 h-full bg-cyber-darker border-r border-cyber-border flex flex-col">
      <div className="p-4 border-b border-cyber-border flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Changed Files</h2>
        <span className="text-xs text-cyber-textMuted bg-cyber-darkest px-2 py-0.5 rounded-full border border-cyber-borderHover">
          {files.length}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        <ul className="space-y-1">
          {files.map((file, idx) => (
            <li key={idx}>
              <button
                onClick={() => onSelectFile(file)}
                className={clsx(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors text-left group",
                  selectedFile === file 
                    ? "bg-cyber-border/50 text-white shadow-inner" 
                    : "text-cyber-textMuted hover:bg-cyber-border/30 hover:text-cyber-text"
                )}
              >
                {getStatusIcon(file.status)}
                <span className="flex-1 truncate font-mono text-[12px]">{file.name}</span>
                <div className="flex items-center space-x-2 opacity-80">
                  {file.additions > 0 && <span className="text-cyber-nodeFeat text-[11px]">+{file.additions}</span>}
                  {file.deletions > 0 && <span className="text-cyber-nodeFix text-[11px]">-{file.deletions}</span>}
                  {getStatusBadge(file.status)}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
