"use client";

import { useCallback, useMemo } from 'react';
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, Node, Edge, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { MuseNode } from './MuseNode';

interface MuseGraphProps {
    nodesData: any[]; // TODO: Define strict type
}

const nodeWidth = 240;
const nodeHeight = 200; // Increased significantly for Hover Cards and spacing

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    // Increased spacing to prevent hover overlap
    dagreGraph.setGraph({ rankdir: 'TB', nodesep: 100, ranksep: 120 });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            targetPosition: Position.Top,
            sourcePosition: Position.Bottom,
            position: {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            },
        };
    });

    return { nodes: layoutedNodes, edges };
};

const nodeTypes = {
    museNode: MuseNode,
};

export function MuseGraph({ nodesData }: MuseGraphProps) {
    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
        const nodes: Node[] = nodesData.map((node) => {
            const isCanon = node.isCanon;
            const isRoot = !node.parentId;

            // Shorten label for display
            let label = node.content.substring(0, 30);
            if (node.title) label = node.title; // If explicit title exists

            // Fetch Author Name (Safe Check)
            const authorName = node.author ? node.author.name : "Anonymous";

            return {
                id: node.id,
                type: 'museNode', // Use Custom Node
                position: { x: 0, y: 0 }, // Calculated by dagre
                data: {
                    label: label,
                    isCanon: isCanon,
                    isRoot: isRoot,
                    authorName: authorName,
                    aiScore: node.aiScore,
                    summary: node.summary || node.content.substring(0, 50) + "..."
                },
            };
        });

        const edges: Edge[] = nodesData
            .filter((n) => n.parentId)
            .map((n) => {
                const isWinner = (n.aiScore || 0) >= 95; // Winner threshold
                const isHighPotential = (n.aiScore || 0) >= 90;

                let strokeColor = '#94a3b8'; // Default Slate
                let strokeWidth = 2;
                let strokeDash = '5,5';
                let animation = true;

                if (isWinner) {
                    strokeColor = '#eab308'; // Gold
                    strokeWidth = 4;
                    strokeDash = '0'; // Solid
                } else if (isHighPotential) {
                    strokeColor = '#3b82f6'; // Blue
                    strokeWidth = 3;
                    strokeDash = '0';
                }

                return {
                    id: `e${n.parentId}-${n.id}`,
                    source: n.parentId,
                    target: n.id,
                    type: 'smoothstep',
                    animated: animation,
                    style: {
                        stroke: strokeColor,
                        strokeWidth: strokeWidth,
                        strokeDasharray: strokeDash,
                        opacity: 0.8
                    }
                };
            });

        return getLayoutedElements(nodes, edges);
    }, [nodesData]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    return (
        <div style={{ width: '100%', height: '600px', background: '#f8fafc', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                minZoom={0.2}
                maxZoom={4}
                panOnScroll={false} // Disable to fix mouse drag pan
                panOnDrag={true}    // Enable standard drag pan
                zoomOnScroll={true}
                zoomOnPinch={true}
                selectionOnDrag={false} // Prioritize Pan over Selection
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
