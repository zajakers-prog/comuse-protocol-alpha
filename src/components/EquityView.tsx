"use client";

import { PieChart, Users } from "lucide-react";

interface EquityViewProps {
    nodes: {
        author: { name: string | null; email: string | null };
        aiScore?: number | null;
    }[];
    projectAuthor: { name: string | null; email: string | null };
}

export function EquityView({ nodes, projectAuthor }: EquityViewProps) {
    // Calculate equity
    // Logic: Project Author gets 10 shares (Spark).
    // Every accepted node (or currently ALL nodes for demo) grants 1 share.

    const scoreMap: Record<string, number> = {};
    const names: Record<string, string> = {};

    // 1. Project Author gets "Founder Bonus" (e.g., 500 points)
    const authorKey = projectAuthor.email || "anonymous";
    scoreMap[authorKey] = 500;
    names[authorKey] = projectAuthor.name || "Anonymous";

    // 2. Calculate Weighted Score for Contributors
    nodes.forEach(node => {
        const key = node.author.email || "anonymous";

        // Equity Formula: Base(10) + AI Score (Quality)
        // If AI Score is null (old nodes), assume 50.
        const qualityScore = node.aiScore || 50;
        const nodeValue = 10 + qualityScore;

        scoreMap[key] = (scoreMap[key] || 0) + nodeValue;

        // Keep name logic safe
        if (!names[key] && node.author.name) {
            names[key] = node.author.name;
        }
    });

    const totalScore = Object.values(scoreMap).reduce((a, b) => a + b, 0);

    const equityData = Object.entries(scoreMap)
        .map(([email, score]) => ({
            name: names[email] || "Anonymous",
            email,
            score: Math.round(score), // Display score for transparency
            percentage: totalScore === 0 ? 0 : (score / totalScore) * 100
        }))
        .sort((a, b) => b.score - a.score);

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-serif font-bold text-gray-900 flex items-center justify-center gap-2">
                    <PieChart className="w-6 h-6" />
                    <span>Ownership & Equity</span>
                </h2>
                <p className="text-gray-500 mt-2">
                    Ownership is dynamically calculated based on accepted contributions.
                </p>
            </div>

            <div className="space-y-4">
                {equityData.map((data, index) => (
                    <div key={data.email} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold">
                                {data.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="font-medium text-gray-900">{data.name}</div>
                                <div className="text-xs text-gray-500">{data.score} points</div>
                            </div>
                        </div>
                        <div className="flex-1 ml-4"> {/* Added ml-4 for spacing */}
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-gray-900">{data.name}</span> {/* Changed c.user.name to data.name */}
                                <span className="text-sm text-gray-500">{data.email === projectAuthor.email ? "Project Creator" : "Contributor"}</span> {/* Added a simple role based on projectAuthor */}
                            </div>

                            {/* Visual Bar */}
                            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${data.percentage}%` }}
                                />
                            </div>

                            <div className="mt-1 text-right text-sm font-bold text-blue-600">
                                {data.percentage.toFixed(1)}% {/* Changed c.percentage to data.percentage */}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t text-center text-xs text-gray-400">
                * Equity is weighted: Base (10) + AI Quality Score (0-100). High quality = More ownership.
            </div>
        </div>
    );
}
