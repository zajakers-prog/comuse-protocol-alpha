"use client";

import { useCallback, useMemo } from 'react';
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, Node, Edge, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { MuseNode } from './MuseNode';

interface MuseGraphProps {
    nodesData: any[]; // TODO: Define strict type
}

const nodeWidth = 200;
const nodeHeight = 150; // Increased for visualizer style

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    dagreGraph.setGraph({ rankdir: 'TB', nodesep: 50, ranksep: 80 });

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
            let label = node.summary || node.content.substring(0, 20);

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
                    summary: node.summary
                },
            };
        });

        const edges: Edge[] = nodesData
            .filter((n) => n.parentId)
            .map((n) => ({
                id: `e${n.parentId}-${n.id}`,
                source: n.parentId,
                target: n.id,
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#94a3b8', strokeWidth: 2, strokeDasharray: '5,5' } // Visualizer style edge
            }));

        return getLayoutedElements(nodes, edges);
    }, [nodesData]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    return (
        <div style={{ width: '100%', height: '600px', background: '#f8fafc', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                minZoom={0.5}
                maxZoom={2}
            >
                <Background color="#cbd5e1" gap={20} size={1} />
                <Controls showInteractive={false} />
                {/* <MiniMap /> Removed for cleaner look */}
            </ReactFlow>
        </div>
    );
}
