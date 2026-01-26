"use client";

import { Handle, Position } from '@xyflow/react';
import { User, Trophy, TrendingUp } from 'lucide-react';

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

export function MuseNode({ data }: MuseNodeProps) {
    const { label, isCanon, isRoot, authorName, aiScore, equity, summary } = data;
    const cleanName = getCleanName(authorName);

    // Visual configurations
    let circleClass = "bg-white border-2 border-slate-200 text-slate-800";
    let roleBadgeClass = "bg-slate-100 text-slate-500";
    let bottomBadgeClass = "bg-slate-100 text-slate-600";
    let roleName = "Contributor";

    if (isRoot) {
        circleClass = "bg-blue-600 border-4 border-blue-200 text-white shadow-blue-300/50 shadow-xl";
        roleBadgeClass = "bg-blue-500/50 text-blue-100";
        bottomBadgeClass = "bg-white text-blue-700 font-bold";
        roleName = "OWNER";
    } else if (label.toLowerCase().includes("ending")) {
        circleClass = "bg-emerald-500 border-4 border-emerald-200 text-white shadow-emerald-300/50 shadow-xl";
        roleBadgeClass = "bg-emerald-400/50 text-emerald-100";
        bottomBadgeClass = "bg-white text-emerald-700 font-bold";
        roleName = "ENDING";
    }

    return (
        <div className="relative group">
            {/* Handle Top (Input) */}
            {!isRoot && (
                <Handle type="target" position={Position.Top} className="!bg-slate-300 !w-3 !h-3 !-top-1" />
            )}

            <div className="flex flex-col items-center">
                {/* 1. The Node Circle */}
                <div className={`
                    relative flex flex-col items-center justify-center w-24 h-24 rounded-full transition-all duration-300 group-hover:scale-110 z-10
                    ${circleClass}
                `}>
                    {/* Top 'ROLE' Label */}
                    <div className={`text-[8px] font-bold tracking-widest px-1.5 py-0.5 rounded-full mb-1 ${roleBadgeClass}`}>
                        ROLE
                    </div>

                    {/* Center Name */}
                    <div className="text-sm font-bold leading-none">{cleanName}</div>

                    {/* Bottom Role Name Badge */}
                    <div className={`absolute -bottom-3 px-2 py-0.5 rounded-full text-[10px] uppercase shadow-sm border border-slate-100 ${bottomBadgeClass}`}>
                        {roleName}
                    </div>
                </div>

                {/* 2. The Hover Card (Replicating the screenshot) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-14 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto z-50 w-72">
                    <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700 p-5 rounded-2xl shadow-2xl text-left transform translate-y-2 group-hover:translate-y-0">
                        {/* Header: Title & Score */}
                        <div className="flex justify-between items-start mb-3 border-b border-slate-700 pb-3">
                            <div className="font-bold text-blue-400 text-md leading-tight max-w-[70%]">
                                {label}
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Muse Score</div>
                                <div className="text-yellow-400 font-bold text-lg">{aiScore || 0}<span className="text-xs text-slate-500">/100</span></div>
                            </div>
                        </div>

                        {/* Content Excerpt */}
                        <p className="text-slate-300 text-xs leading-relaxed italic mb-4">
                            "{summary || 'No summary available...'}"
                        </p>

                        {/* Footer: Contributors & Equity */}
                        <div className="flex items-center justify-between bg-slate-800/50 p-2 rounded-lg">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600 text-xs font-bold text-slate-300">
                                    {cleanName[0]}
                                </div>
                                <div>
                                    <div className="text-[9px] text-slate-500 uppercase">Contributor</div>
                                    <div className="text-xs font-medium text-slate-200">@{cleanName}</div>
                                </div>
                            </div>

                            {equity ? (
                                <div className="text-right">
                                    <div className="text-[9px] text-slate-500 uppercase">Equity Share</div>
                                    <div className="text-green-400 font-bold text-sm">{equity}%</div>
                                </div>
                            ) : (
                                <div className="text-right">
                                    <div className="text-[9px] text-slate-500 uppercase">Status</div>
                                    <div className="text-blue-400 font-bold text-xs">Active</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Arrow/Triangle pointing up */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 rotate-45 border-l border-t border-slate-700"></div>
                </div>
            </div>

            {/* Handle Bottom (Output) */}
            <Handle type="source" position={Position.Bottom} className="!bg-slate-300 !w-3 !h-3 !-bottom-1" />
        </div>
    );
}
