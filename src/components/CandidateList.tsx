"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp } from "lucide-react";

interface Candidate {
    id: string;
    content: string;
    author: { name: string | null };
    createdAt: Date;
    _count: { votes: number };
    hasVoted: boolean;
    aiScore?: number | null; // Add AI Score
}

interface CandidateListProps {
    candidates: Candidate[];
    currentUserId?: string;
}

export function CandidateList({ candidates, currentUserId }: CandidateListProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [votingId, setVotingId] = useState<string | null>(null);

    const handleVote = async (nodeId: string) => {
        if (!session) {
            alert("Please sign in to vote");
            return;
        }

        setVotingId(nodeId);
        try {
            const res = await fetch("/api/votes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nodeId }),
            });

            if (!res.ok) throw new Error("Failed to vote");

            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setVotingId(null);
        }
    };

    if (candidates.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 italic">
                No active branches yet. Be the first to extend this story.
            </div>
        );
    }

    return (
        <div className="space-y-6 mt-8">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex justify-between items-center">
                <span>Branch Ledger</span>
                <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{candidates.length} Proposed</span>
            </h3>
            {candidates.map((candidate) => (
                <div key={candidate.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    {/* Header: Author & Score */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-[10px] text-white font-bold">
                                {candidate.author.name?.[0] || "?"}
                            </div>
                            <span className="font-medium text-sm text-gray-900">{candidate.author.name || "Anonymous"}</span>
                        </div>

                        {/* AI Score Badge */}
                        {candidate.aiScore && (
                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold border ${candidate.aiScore >= 90 ? "bg-amber-50 text-amber-700 border-amber-200" :
                                    "bg-gray-50 text-gray-600 border-gray-200"
                                }`}>
                                <span>✦ IP Score: {candidate.aiScore}</span>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="prose prose-sm max-w-none text-gray-700 font-serif mb-4 whitespace-pre-wrap leading-relaxed">
                        {candidate.content}
                    </div>

                    {/* Footer: Time & Votes */}
                    <div className="flex items-center justify-between border-t pt-3 mt-3">
                        <time className="text-xs text-gray-400">{formatDistanceToNow(new Date(candidate.createdAt), { addSuffix: true })}</time>

                        <button
                            onClick={() => handleVote(candidate.id)}
                            disabled={votingId === candidate.id}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${candidate.hasVoted
                                ? "bg-blue-600 text-white shadow-blue-200 shadow-lg"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            <ThumbsUp size={12} className={candidate.hasVoted ? "fill-current" : ""} />
                            <span>{candidate._count.votes} Votes</span>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
