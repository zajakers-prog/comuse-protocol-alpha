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
    hasVoted: boolean; // We'll need to pass this from server or fetch it
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
                No contributions yet. Be the first to write!
            </div>
        );
    }

    return (
        <div className="space-y-6 mt-8">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">
                Community Contributions
            </h3>
            {candidates.map((candidate) => (
                <div key={candidate.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2 text-xs text-gray-500">
                        <span className="font-medium text-gray-900">{candidate.author.name || "Anonymous"}</span>
                        <time>{formatDistanceToNow(new Date(candidate.createdAt), { addSuffix: true })}</time>
                    </div>
                    <div className="prose prose-sm max-w-none text-gray-800 font-serif mb-4 whitespace-pre-wrap">
                        {candidate.content}
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => handleVote(candidate.id)}
                            disabled={votingId === candidate.id}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${candidate.hasVoted
                                ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            <ThumbsUp size={14} className={candidate.hasVoted ? "fill-current" : ""} />
                            <span>{candidate._count.votes}</span>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
