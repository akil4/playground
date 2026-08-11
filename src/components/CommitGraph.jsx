import React, { useRef, useEffect, useState, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

export default function CommitGraph({ commits }) {
  const fgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef();

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight
      });
    }
    
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const graphData = useMemo(() => {
    const nodes = commits.map(c => ({
      id: c.hash,
      name: c.message,
      type: c.type,
      author: c.author,
      date: c.date,
      val: 2 // base size
    }));

    const links = [];
    commits.forEach(c => {
      if (c.parents) {
        c.parents.forEach(p => {
          if (commits.some(node => node.hash === p)) {
            links.push({
              source: c.hash,
              target: p
            });
          }
        });
      }
    });

    return { nodes, links };
  }, [commits]);

  const getNodeColor = (type) => {
    switch (type) {
      case 'feat': return '#00E5FF'; // Neon Cyan
      case 'fix': return '#E0115F';  // Ducati Crimson/Purple-Red
      case 'refactor': return '#E6FF00'; // Neon Yellow
      case 'docs': return '#FFFFFF'; // Clean White
      default: return '#FF6600'; // KTM Orange
    }
  };

  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge').strength(-200);
      fgRef.current.d3Force('link').distance(50);
      // Center the graph after load
      setTimeout(() => {
         if(fgRef.current) fgRef.current.zoomToFit(400, 50);
      }, 500);
    }
  }, [graphData]);

  return (
    <div ref={containerRef} className="w-full h-full bg-cyber-darkest overflow-hidden relative border-r border-cyber-border">
      <div className="absolute top-4 left-4 z-10">
        <h2 className="text-white font-semibold flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-cyber-accent shadow-[0_0_8px_rgba(124,58,237,0.8)]"></span>
          <span>Graph View</span>
        </h2>
      </div>
      
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeRelSize={4}
        linkColor={() => 'rgba(255, 255, 255, 0.15)'}
        linkWidth={1.5}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const color = getNodeColor(node.type);
          const size = 5;

          // Outer Glow
          ctx.beginPath();
          ctx.arc(node.x, node.y, size * 2.5, 0, 2 * Math.PI, false);
          ctx.fillStyle = color + '20'; // 20% opacity
          ctx.fill();

          // Core node
          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
          ctx.fillStyle = color;
          ctx.fill();
          
          // Draw text label if zoomed in enough
          if (globalScale > 1.5) {
            const label = node.name.length > 30 ? node.name.substring(0, 30) + '...' : node.name;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(label, node.x, node.y + size + 2);
          }
        }}
        nodePointerAreaPaint={(node, color, ctx) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI, false);
          ctx.fill();
        }}
        onNodeHover={(node) => {
          if (containerRef.current) {
            containerRef.current.style.cursor = node ? 'pointer' : 'default';
          }
        }}
      />
    </div>
  );
}
