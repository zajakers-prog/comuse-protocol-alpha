"use client";

import { useCallback, useMemo } from 'react';
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, Node, Edge, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { MuseNode } from './MuseNode';

interface MuseGraphProps {
    nodesData: any[]; // TODO: Define strict type
    onNodeClick?: (event: React.MouseEvent, node: Node) => void;
}

// ... existing imports ...

export function MuseGraph({ nodesData, onNodeClick }: MuseGraphProps) {
    // ... logic ...

    return (
        <div style={{ width: '100%', height: '600px', background: '#f8fafc', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick} // Pass the click handler
                nodeTypes={nodeTypes}
                fitView
            // ... rest
            >
                <Background color="#cbd5e1" gap={24} size={1} />
                <Controls showInteractive={true} />
            </ReactFlow>

            {/* Legend for Winning Branch */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow-sm border border-gray-200 text-xs text-gray-500 pointer-events-none">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-4 h-1 bg-yellow-500 rounded-full"></div>
                    <span>Winner Path (95+)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-blue-500 rounded-full"></div>
                    <span>High Potential (90+)</span>
                </div>
            </div>
        </div>
    );
}
