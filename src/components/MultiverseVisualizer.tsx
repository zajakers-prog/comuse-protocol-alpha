"use client";

import { useState } from "react";
import { User } from "lucide-react";

interface NodeData {
    id: string;
    parent: string | null;
    label: string;
    contributor: string;
    score: number;
    equity: number;
    description: string;
    type: "GENESIS" | "BRANCH" | "ENDING";
}

const CASES: Record<string, NodeData[]> = {
    "Memory Laundromat": [
        { id: "A", parent: null, label: "Seed A: Genesis", contributor: "@Jason_Founder", score: 98, equity: 40, description: "Selective memory-erasing shop opens in Gangnam.", type: "GENESIS" },
        { id: "B", parent: "A", label: "Branch 1: Melodrama", contributor: "@Alice_Writer", score: 88, equity: 15, description: "Builds a romance story around a forgotten lover.", type: "BRANCH" },
        { id: "C", parent: "B", label: "Twist: Future Self", contributor: "@Bob_Builder", score: 92, equity: 15, description: "The customer is actually the owner from the future.", type: "BRANCH" },
        { id: "D", parent: "A", label: "Branch 2: Thriller", contributor: "@David_Noir", score: 85, equity: 10, description: "The shop is a front for a crime syndicate.", type: "BRANCH" },
        { id: "E", parent: "C", label: "Ending: Sad", contributor: "@Eve_Poet", score: 96, equity: 10, description: "He erases himself to save her.", type: "ENDING" },
        { id: "F", parent: "C", label: "Ending: Open", contributor: "@Frank_Indie", score: 84, equity: 5, description: "They choose to remember the pain.", type: "ENDING" },
        { id: "G", parent: "D", label: "Subplot: Detective", contributor: "@Grace_Cop", score: 79, equity: 5, description: "Detective Kang investigates the missing memories.", type: "BRANCH" },
    ],
    "Plastic Degradation": [
        { id: "A", parent: null, label: "Seed A: Hypothesis", contributor: "@Dr_Lee", score: 97, equity: 50, description: "Specific microbes in glaciers might degrade polyethylene.", type: "GENESIS" },
        { id: "B", parent: "A", label: "Branch 1: Bio-Med", contributor: "@Sarah_Lab", score: 91, equity: 20, description: "Proposes medical-grade protein extraction.", type: "BRANCH" },
        { id: "C", parent: "B", label: "Tech: Nano-Capsules", contributor: "@TechBro", score: 93, equity: 15, description: "Encapsulating the enzyme for targeted delivery.", type: "BRANCH" },
        { id: "D", parent: "A", label: "Branch 2: Industrial", contributor: "@EcoCorp", score: 89, equity: 10, description: "Industrial waste logistics using automated bioreactors.", type: "BRANCH" },
        { id: "E", parent: "C", label: "Protocol: Testing", contributor: "@SafeGuard", score: 90, equity: 5, description: "Complete animal testing safety protocols.", type: "ENDING" },
    ]
};

// ... imports

interface MultiverseVisualizerProps {
    initialCase?: string;
    hideSelector?: boolean;
}

export function MultiverseVisualizer({ initialCase = "Memory Laundromat", hideSelector = false }: MultiverseVisualizerProps) {
    const [selectedCase, setSelectedCase] = useState<string>(initialCase);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    // Fallback to initialCase if selectedCase key doesn't exist (safety)
    const nodes = CASES[selectedCase] || CASES[initialCase] || CASES["Memory Laundromat"];

    // Helper to extract clean name from handle (e.g. @Jason_Founder -> Jason)
    const getName = (handle: string) => {
        return handle.replace("@", "").split("_")[0];
    };

    // Helper to calculate position (Simple layout)
    const getPos = (id: string) => {
        const positions: Record<string, { x: number, y: number }> = {
            "A": { x: 50, y: 15 },
            "B": { x: 30, y: 45 },
            "C": { x: 30, y: 75 },
            "D": { x: 70, y: 45 },
            "E": { x: 20, y: 105 }, // Further down for tree feel
            "F": { x: 40, y: 105 },
            "G": { x: 70, y: 75 },
        };
        return positions[id] || { x: 50, y: 50 };
    };

    return (
        <div className="w-full max-w-5xl mx-auto my-8 p-8 bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
            <h2 className="text-3xl font-serif font-bold text-center mb-2">The Multiverse Visualizer</h2>
            <p className="text-center text-gray-500 mb-8">Branching Equity Map (Hover for Details)</p>

            {/* Case Selector - Only show if not hidden */}
            {!hideSelector && (
                <div className="flex justify-center gap-4 mb-12">
                    {Object.keys(CASES).map((caseName) => (
                        <button
                            key={caseName}
                            onClick={() => setSelectedCase(caseName)}
                            className={`px-6 py-2 rounded-full font-medium transition-colors ${selectedCase === caseName
                                ? "bg-black text-white"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                }`}
                        >
                            {caseName}
                        </button>
                    ))}
                </div>
            )}

            {/* Graph Area */}
            <div className="relative w-full h-[600px] bg-slate-50 rounded-xl border border-dashed border-gray-300 overflow-hidden">
                {/* Connections (SVG Lines) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {nodes.map(node => {
                        if (!node.parent) return null;
                        const start = getPos(node.parent);
                        const end = getPos(node.id);
                        return (
                            <line
                                key={`${node.parent}-${node.id}`}
                                x1={`${start.x}%`}
                                y1={`${start.y}%`}
                                x2={`${end.x}%`}
                                y2={`${end.y}%`}
                                stroke="#94A3B8"
                                strokeWidth="2"
                                strokeDasharray="5,5"
                            />
                        );
                    })}
                </svg>

                {/* Nodes */}
                {nodes.map(node => {
                    const pos = getPos(node.id);
                    const isHovered = hoveredNode === node.id;
                    const cleanName = getName(node.contributor);

                    return (
                        <div
                            key={node.id}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-10"
                            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                            onMouseEnter={() => setHoveredNode(node.id)}
                            onMouseLeave={() => setHoveredNode(null)}
                        >
                            <div className="flex flex-col items-center group">
                                <div className={`
                                    relative flex items-center justify-center w-20 h-20 rounded-full shadow-lg border-4 
                                    ${node.type === "GENESIS" ? "bg-blue-600 border-blue-200 text-white" :
                                        node.type === "ENDING" ? "bg-green-600 border-green-200 text-white" :
                                            "bg-white border-gray-200 text-gray-800"}
                                    group-hover:scale-110 cursor-pointer transition-transform
                                `}>
                                    <div className="text-center leading-tight">
                                        <div className="text-[10px] opacity-70 uppercase tracking-widest mb-0.5">Role</div>
                                        <div className="font-bold text-sm">{cleanName}</div>
                                        {node.type === "GENESIS" && <div className="text-[9px] mt-0.5 font-mono bg-white/20 px-1 rounded">OWNER</div>}
                                    </div>

                                    {/* Tooltip */}
                                    {isHovered && (
                                        <div className="absolute top-full mt-4 w-72 p-5 bg-black text-white rounded-xl shadow-2xl z-50 text-left animate-in fade-in slide-in-from-top-2">
                                            <div className="flex justify-between items-start mb-3 border-b border-gray-700 pb-2">
                                                <span className="font-bold text-blue-400 text-lg">{node.label}</span>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs text-gray-400">Muse Score</span>
                                                    <span className="font-mono font-bold text-yellow-400">{node.score}/100</span>
                                                </div>
                                            </div>

                                            <p className="text-sm text-gray-300 mb-4 leading-relaxed italic">
                                                "{node.description}"
                                            </p>

                                            <div className="flex items-center justify-between pt-2 bg-gray-900/50 p-2 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
                                                        {cleanName[0]}
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-300">{node.contributor}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] text-gray-500 uppercase">Equity Share</div>
                                                    <span className="text-green-400 font-bold font-mono text-lg">
                                                        {node.equity}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {/* Name Label below node (Static) */}
                                <div className="mt-2 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-sm border border-gray-100 text-xs font-bold text-gray-600">
                                    {cleanName}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="text-center mt-6 text-sm text-gray-400 font-mono">
                * Real-time Equity Calculation based on Weaver AI Assessment
            </div>
        </div>
    );
}
