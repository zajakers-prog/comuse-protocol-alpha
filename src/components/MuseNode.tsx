"use client";

import { Handle, Position } from '@xyflow/react';
import { User } from 'lucide-react';

interface MuseNodeProps {
    data: {
        label: string;
        isCanon: boolean;
        isRoot: boolean;
        authorName: string; // e.g. "Jason (Founder)"
        aiScore: number;
        equity?: number; // Optional equity percentage
        summary: string;
    };
}

// Helper to get clean name (e.g. "Jason (Founder)" -> "Jason")
const getCleanName = (fullName: string) => {
    return fullName.split(" ")[0].replace(/[()]/g, "");
};

// Helper for initials
const getInitial = (name: string) => {
    return name ? name[0].toUpperCase() : "?";
};

export function MuseNode({ data }: MuseNodeProps) {
    const { label, isCanon, isRoot, authorName, aiScore, equity } = data;
    const cleanName = getCleanName(authorName);
    const initial = getInitial(cleanName);

    // Determine visual style based on node type
    let ringColor = "border-gray-200";
    let bgColor = "bg-white";
    let textColor = "text-gray-800";
    let badgeText = "CONTRIBUTOR";

    if (isRoot) {
        ringColor = "border-blue-200";
        bgColor = "bg-blue-600";
        textColor = "text-white";
        badgeText = "OWNER";
    } else if (label.toLowerCase().includes("ending")) {
        ringColor = "border-green-200";
        bgColor = "bg-green-600";
        textColor = "text-white";
        badgeText = "ENDING";
    }

    return (
        <div className="relative group">
            {/* Handle Top (Input) */}
            {!isRoot && (
                <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-2 !h-2" />
            )}

            <div className="flex flex-col items-center cursor-pointer transition-transform duration-300 hover:scale-110">
                {/* Visualizer-style Node Circle */}
                <div className={`
                    relative flex items-center justify-center w-20 h-20 rounded-full shadow-lg border-4 
                    ${ringColor} ${bgColor} ${textColor}
                `}>
                    <div className="text-center leading-tight">
                        <div className="text-[9px] opacity-70 uppercase tracking-widest mb-0.5">Role</div>
                        <div className="font-bold text-sm">{cleanName}</div>
                        {isRoot && <div className="text-[8px] mt-0.5 font-mono bg-white/20 px-1 rounded inline-block">{badgeText}</div>}
                    </div>
                </div>

                {/* Name/Label Label below node */}
                <div className="mt-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-gray-100 text-xs text-center max-w-[150px]">
                    <div className="font-bold text-gray-700 mb-0.5">{label}</div>
                    {aiScore && <div className="text-[10px] text-gray-400 font-mono">Muse Score: {aiScore}</div>}
                </div>
            </div>

            {/* Handle Bottom (Output) */}
            <Handle type="source" position={Position.Bottom} className="!bg-gray-400 !w-2 !h-2" />
        </div>
    );
}
