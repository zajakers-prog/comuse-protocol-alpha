"use client";

import { useCallback, useMemo } from 'react';
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, Node, Edge, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';

interface MuseGraphProps {
    nodesData: any[]; // TODO: Define strict type
}

const nodeWidth = 172;
const nodeHeight = 80;

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    dagreGraph.setGraph({ rankdir: 'TB' });

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

export function MuseGraph({ nodesData }: MuseGraphProps) {
    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
        const nodes: Node[] = nodesData.map((node) => {
            const isCanon = node.isCanon;
            const isRoot = !node.parentId;

            const label = node.content.substring(0, 20) + (node.content.length > 20 ? "..." : "");

            // Visual Style for Nodes
            let bg = isCanon ? '#111' : '#fff';
            let color = isCanon ? '#fff' : '#666';
            let border = isCanon ? '2px solid #000' : '2px dashed #ccc';

            if (isRoot) {
                bg = '#2563eb'; // Blue for Root
                color = '#fff';
                border = 'none';
            }

            return {
                id: node.id,
                position: { x: 0, y: 0 }, // Calculated by dagre
                data: { label: label },
                style: {
                    background: bg,
                    color: color,
                    border: border,
                    padding: '10px',
                    borderRadius: '8px',
                    width: 180, // Visual width
                    fontSize: '12px',
                    boxShadow: isCanon ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
                    fontWeight: isCanon ? 'bold' : 'normal',
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
                style: { stroke: '#000' }
            }));

        return getLayoutedElements(nodes, edges);
    }, [nodesData]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    return (
        <div style={{ width: '100%', height: '500px', border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
            >
                <Background color="#f0f0f0" gap={16} />
                <Controls />
                <MiniMap />
            </ReactFlow>
        </div>
    );
}
