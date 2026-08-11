import React, { useState } from 'react';
import DiffSidebar from './DiffSidebar';
import DiffFileViewer from './DiffFileViewer';

export default function DiffDashboard({ files }) {
  const [selectedFile, setSelectedFile] = useState(files.length > 0 ? files[0] : null);

  return (
    <div className="flex h-full w-full animate-fade-in">
      <DiffSidebar 
        files={files} 
        selectedFile={selectedFile} 
        onSelectFile={setSelectedFile} 
      />
      <DiffFileViewer file={selectedFile} />
    </div>
  );
}
