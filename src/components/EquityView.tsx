"use client";

import { PieChart, Users } from "lucide-react";

interface EquityViewProps {
    canon: {
        author: { name: string | null; email: string | null };
    }[];
    projectAuthor: { name: string | null; email: string | null };
}

export function EquityView({ canon, projectAuthor }: EquityViewProps) {
    // Calculate equity
    // Logic: Project Author gets 1 share (for the Spark), plus 1 share for each Canon node they wrote.
    // Other authors get 1 share for each Canon node.

    const shares: Record<string, number> = {};
    const names: Record<string, string> = {};

    // Initialize with Project Author (Spark)
    const authorKey = projectAuthor.email || "anonymous";
    shares[authorKey] = 1;
    names[authorKey] = projectAuthor.name || "Anonymous";

    // Add Canon contributions
    canon.forEach(node => {
        const key = node.author.email || "anonymous";
        shares[key] = (shares[key] || 0) + 1;
        names[key] = node.author.name || "Anonymous";
    });

    const totalShares = Object.values(shares).reduce((a, b) => a + b, 0);

    const equityData = Object.entries(shares)
        .map(([email, count]) => ({
            name: names[email],
            email,
            count,
            percentage: (count / totalShares) * 100
        }))
        .sort((a, b) => b.count - a.count);

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
                                <div className="text-xs text-gray-500">{data.count} contributions</div>
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
                * The Project Creator receives 1 initial share for the Spark.
            </div>
        </div>
    );
}
