import React, { useState } from 'react';
import CommitGraph from './CommitGraph';
import ChangelogGenerator from './ChangelogGenerator';

export default function LogDashboard({ commits }) {
  return (
    <div className="flex h-full w-full animate-fade-in">
      <div className="w-2/3 h-full">
        <CommitGraph commits={commits} />
      </div>
      <div className="w-1/3 h-full border-l border-cyber-border">
        <ChangelogGenerator commits={commits} />
      </div>
    </div>
  );
}
