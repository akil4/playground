export function parseGitInput(text) {
  text = text.trim();
  if (text.startsWith('diff --git') || text.startsWith('--- a/') || text.startsWith('+++ b/')) {
    return { type: 'diff', data: parseGitDiff(text) };
  } else {
    return { type: 'log', data: parseGitLog(text) };
  }
}

export function parseGitLog(text) {
  const lines = text.split('\n');
  const commits = [];
  
  // Check if it's the custom format: %h|%p|%an|%ad|%s
  const isCustomFormat = lines.length > 0 && lines[0].includes('|');

  if (isCustomFormat) {
    for (const line of lines) {
      if (!line.trim()) continue;
      const parts = line.split('|');
      if (parts.length >= 5) {
        const hash = parts[0];
        const parents = parts[1] ? parts[1].split(' ') : [];
        const author = parts[2];
        const date = parts[3];
        const message = parts.slice(4).join('|');
        commits.push({ hash, parents, author, date, message });
      }
    }
  } else {
    // Fallback: simple linear parser for standard `git log`
    let currentCommit = null;
    let inMessage = false;
    let messageLines = [];
    
    for (const line of lines) {
      if (line.startsWith('commit ')) {
        if (currentCommit) {
          currentCommit.message = messageLines.join('\n').trim();
          commits.push(currentCommit);
        }
        currentCommit = { hash: line.substring(7).trim(), parents: [], author: '', date: '', message: '' };
        // In a linear log without parents, we'll assign the previous commit as parent later to make a linear chain
        inMessage = false;
        messageLines = [];
      } else if (currentCommit) {
        if (line.startsWith('Author:')) {
          currentCommit.author = line.substring(7).trim();
        } else if (line.startsWith('Date:')) {
          currentCommit.date = line.substring(5).trim();
        } else if (line === '') {
          if (!inMessage) inMessage = true;
          else messageLines.push(line);
        } else if (inMessage) {
          messageLines.push(line.trim());
        }
      }
    }
    if (currentCommit) {
      currentCommit.message = messageLines.join('\n').trim();
      commits.push(currentCommit);
    }
    
    // Wire up linear parent relationships since standard log lacks them
    for (let i = 0; i < commits.length - 1; i++) {
      commits[i].parents = [commits[i + 1].hash];
    }
  }

  // Categorize commits based on Conventional Commits
  for (const commit of commits) {
    const msg = commit.message.toLowerCase();
    if (msg.startsWith('feat:') || msg.startsWith('feat(')) {
      commit.type = 'feat';
    } else if (msg.startsWith('fix:') || msg.startsWith('fix(')) {
      commit.type = 'fix';
    } else if (msg.startsWith('refactor:') || msg.startsWith('refactor(') || msg.startsWith('chore') || msg.startsWith('style') || msg.startsWith('test')) {
      commit.type = 'refactor';
    } else if (msg.startsWith('docs:') || msg.startsWith('docs(')) {
      commit.type = 'docs';
    } else {
      commit.type = 'default';
    }
  }

  return commits;
}

export function parseGitDiff(text) {
  const lines = text.split('\n');
  const files = [];
  let currentFile = null;
  let currentHunk = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('diff --git')) {
      if (currentFile) files.push(currentFile);
      
      const parts = line.split(' ');
      const aPath = parts[2].substring(2); // remove a/
      const bPath = parts[3].substring(2); // remove b/
      
      currentFile = {
        name: bPath !== 'ev/null' ? bPath : aPath, // fallback for deleted files
        oldPath: aPath,
        newPath: bPath,
        status: 'modified', // default, will refine
        additions: 0,
        deletions: 0,
        hunks: [],
      };
    } else if (currentFile) {
      if (line.startsWith('new file mode')) {
        currentFile.status = 'added';
      } else if (line.startsWith('deleted file mode')) {
        currentFile.status = 'deleted';
      } else if (line.startsWith('@@ ')) {
        const hunkHeaderMatch = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
        if (hunkHeaderMatch) {
          currentHunk = {
            header: line,
            oldStart: parseInt(hunkHeaderMatch[1], 10),
            newStart: parseInt(hunkHeaderMatch[2], 10),
            lines: []
          };
          currentFile.hunks.push(currentHunk);
        }
      } else if (currentHunk) {
        if (line.startsWith('+')) {
          if (!line.startsWith('+++')) {
            currentHunk.lines.push({ type: 'addition', content: line.substring(1) });
            currentFile.additions++;
          }
        } else if (line.startsWith('-')) {
          if (!line.startsWith('---')) {
            currentHunk.lines.push({ type: 'deletion', content: line.substring(1) });
            currentFile.deletions++;
          }
        } else if (line.startsWith(' ')) {
          currentHunk.lines.push({ type: 'context', content: line.substring(1) });
        } else if (line.startsWith('\\ No newline')) {
          currentHunk.lines.push({ type: 'context', content: line });
        } else {
          // Empty or unrecognized line, maybe break?
          // If it's a completely empty line and we are inside a hunk, it's usually empty context
          if (line === '') {
             currentHunk.lines.push({ type: 'context', content: '' });
          }
        }
      }
    }
  }

  if (currentFile) {
    files.push(currentFile);
  }

  return files;
}
