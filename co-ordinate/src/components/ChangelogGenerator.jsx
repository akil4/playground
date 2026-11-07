import React, { useMemo } from 'react';
import { Copy, Terminal, CheckCircle } from 'lucide-react';

export default function ChangelogGenerator({ commits }) {
  const [copied, setCopied] = React.useState(false);

  const categorized = useMemo(() => {
    const cats = {
      feat: [],
      fix: [],
      refactor: [],
      docs: [],
      default: []
    };
    commits.forEach(c => {
      if (cats[c.type]) {
        cats[c.type].push(c);
      } else {
        cats.default.push(c);
      }
    });
    return cats;
  }, [commits]);

  const generateMarkdown = () => {
    let md = '# Changelog\n\n';
    
    const addSection = (title, items) => {
      if (items.length > 0) {
        md += `### ${title}\n`;
        items.forEach(c => {
          md += `- **${c.hash.substring(0, 7)}** ${c.message} (${c.author})\n`;
        });
        md += '\n';
      }
    };

    addSection('✨ Features', categorized.feat);
    addSection('🐛 Bug Fixes', categorized.fix);
    addSection('🧹 Maintenance & Refactoring', categorized.refactor);
    addSection('📚 Documentation', categorized.docs);
    addSection('🔧 Other Changes', categorized.default);

    return md;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full w-full bg-cyber-darker flex flex-col p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Terminal className="text-cyber-accent" size={20} />
          <span>Changelog</span>
        </h2>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-2 px-4 py-2 bg-cyber-dark border border-cyber-border hover:border-cyber-accent text-cyber-text text-sm rounded-lg transition-colors"
        >
          {copied ? <CheckCircle size={16} className="text-cyber-nodeFeat" /> : <Copy size={16} />}
          <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {Object.entries({
          '✨ Features': categorized.feat,
          '🐛 Bug Fixes': categorized.fix,
          '🧹 Maintenance & Refactoring': categorized.refactor,
          '📚 Documentation': categorized.docs,
          '🔧 Other Changes': categorized.default,
        }).map(([title, items]) => (
          items.length > 0 && (
            <div key={title} className="mb-8 animate-fade-in">
              <h3 className="text-md font-semibold text-white mb-3 flex items-center space-x-2">
                <span>{title}</span>
                <span className="bg-cyber-border text-cyber-textMuted text-xs px-2 py-0.5 rounded-full">
                  {items.length}
                </span>
              </h3>
              <ul className="space-y-2 pl-1 border-l-2 border-cyber-border ml-2">
                {items.map(c => (
                  <li key={c.hash} className="pl-4 relative group">
                    <div className="absolute w-2 h-2 rounded-full bg-cyber-border group-hover:bg-cyber-accent transition-colors -left-[5px] top-1.5 ring-4 ring-cyber-darker"></div>
                    <div className="flex flex-col text-sm">
                      <span className="text-cyber-text group-hover:text-white transition-colors">
                        {c.message}
                      </span>
                      <div className="flex items-center space-x-2 mt-1 text-xs text-cyber-textMuted">
                        <span className="font-mono text-cyber-accent">{c.hash.substring(0, 7)}</span>
                        <span>•</span>
                        <span>{c.author}</span>
                        {c.date && (
                          <>
                            <span>•</span>
                            <span>{new Date(c.date).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
