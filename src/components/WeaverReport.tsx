
import { useState, useEffect } from "react";
import { Brain, TrendingUp, Users, Zap, Award } from "lucide-react";

interface WeaverReportProps {
    aiDataString?: string | null;
    summary?: string | null;
}

export function WeaverReport({ aiDataString, summary }: WeaverReportProps) {
    if (!aiDataString) return null;

    let analysis;
    try {
        analysis = JSON.parse(aiDataString);
    } catch (e) {
        return null;
    }

    const {
        scores = { novelty: 0, osmuPotential: 0, collaborativeMagnetism: 0, marketDemand: 0 },
        totalIpIndex = 0,
        scoutOpinion = "No analysis available.",
        builderInvitation = "Contribute to this story.",
        status = "PENDING"
    } = analysis || {};

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="bg-black text-white p-6 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 text-blue-400 font-bold text-sm tracking-wider uppercase mb-1">
                        <Brain size={16} />
                        <span>Comuse Weaver V1 Audit</span>
                    </div>
                    <h2 className="text-2xl font-serif font-bold">IP Value Scoreboard</h2>
                </div>
                <div className="text-right">
                    <ScoreDisplay value={totalIpIndex} isTotal />
                    <div className="text-xs text-gray-400 uppercase tracking-widest">Total IP Index</div>
                </div>
            </div>

            {/* Scores */}
            <div className="grid grid-cols-2 md:grid-cols-4 border-b border-gray-100">
                <ScoreItem icon={<Zap />} label="Novelty" score={scores.novelty} color="text-yellow-600" />
                <ScoreItem icon={<TrendingUp />} label="OSMU" score={scores.osmuPotential} color="text-blue-600" />
                <ScoreItem icon={<Users />} label="Magnetism" score={scores.collaborativeMagnetism} color="text-purple-600" />
                <ScoreItem icon={<Award />} label="Market Hit" score={scores.marketDemand} color="text-green-600" />
            </div>

            {/* Analysis Content */}
            <div className="p-6 space-y-6">
                {/* Scout's Opinion */}
                <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Scout's Opinion</h3>
                    <p className="text-lg font-serif italic text-gray-900 leading-relaxed border-l-4 border-black pl-4">
                        "{scoutOpinion}"
                    </p>
                </div>

                {/* Investment Summary */}
                <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Investment Summary</h3>
                    <p className="text-gray-700 leading-relaxed">
                        {analysis.summary || summary}
                    </p>
                </div>

                {/* Builder's Invitation */}
                <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                    <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wide mb-2 flex items-center gap-2">
                        <span>🚀 Builder's Mission</span>
                    </h3>
                    <p className="text-blue-900 font-medium text-lg">
                        {builderInvitation}
                    </p>
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-medium text-gray-600">Status: {status}</span>
                    </div>
                    <div className="text-sm font-bold text-black flex items-center gap-1">
                        <span>Ledger Status:</span>
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs border border-yellow-200">
                            Pending for Equity Points
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ScoreItem({ icon, label, score, color }: any) {
    return (
        <div className="p-4 border-r border-gray-100 last:border-0 flex flex-col items-center text-center">
            <div className={`mb-2 ${color}`}>{icon}</div>
            <div className="text-2xl font-bold text-gray-900">
                <ScoreDisplay value={score} />
            </div>
            <div className="text-xs font-semibold text-gray-500 uppercase">{label}</div>
        </div>
    );
}

function ScoreDisplay({ value, isTotal = false }: { value: number, isTotal?: boolean }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const duration = 1500; // ms
        const steps = 60;
        const stepTime = duration / steps;
        const increment = value / steps;

        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
                setCount(value);
                clearInterval(timer);
            } else {
                setCount(current);
            }
        }, stepTime);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <span className={isTotal ? "tabular-nums" : "tabular-nums"}>
            {isTotal ? count.toFixed(1) : Math.floor(count)}
        </span>
    );
}
