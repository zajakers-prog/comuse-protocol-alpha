"use client";

import { useState } from "react";
import { BookOpen, GitGraph, PenTool } from "lucide-react";
import { MuseGraph } from "./MuseGraph";
import { StoryViewer } from "./StoryViewer";
import { ContributionForm } from "./ContributionForm";
import { CandidateList } from "./CandidateList";
import { ReaderView } from "./ReaderView";
import { EquityView } from "./EquityView";
import { WeaverReport } from "./WeaverReport";
import { MultiverseVisualizer } from "./MultiverseVisualizer";

interface ProjectInterfaceProps {
    project: any;
    nodes: any[];
    canon: any[];
    candidates: any[];
    userId: string;
    lastCanonId: string | null;
}

export function ProjectInterface({
    project,
    nodes,
    canon,
    candidates,
    userId,
    lastCanonId
}: ProjectInterfaceProps) {
    const [mode, setMode] = useState<"graph" | "read" | "equity">("graph");

    if (mode === "read") {
        return (
            <div>
                {/* Floating Toggle Button */}
                <div className="fixed bottom-8 right-8 z-50">
                    <button
                        onClick={() => setMode("graph")}
                        className="bg-black text-white p-4 rounded-full shadow-lg hover:bg-gray-800 transition-all flex items-center gap-2"
                    >
                        <GitGraph size={20} />
                        <span className="font-medium">View Graph</span>
                    </button>
                </div>

                <ReaderView project={project} nodes={canon} />
            </div>
        );
    }

    return (
        <div>
            {/* Header / Toggle */}
            <div className="flex justify-between items-center mb-8 border-b pb-4">
                <div className="flex gap-4">
                    <button
                        onClick={() => setMode("graph")}
                        className={`pb-4 px-2 font-medium transition-colors relative ${mode === "graph" ? "text-black" : "text-gray-400 hover:text-gray-600"}`}
                    >
                        Project & Graph
                        {mode === "graph" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />}
                    </button>
                    <button
                        onClick={() => setMode("equity")}
                        className={`pb-4 px-2 font-medium transition-colors relative ${mode === "equity" ? "text-black" : "text-gray-400 hover:text-gray-600"}`}
                    >
                        Equity & Ownership
                        {mode === "equity" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />}
                    </button>
                </div>

                <button
                    onClick={() => setMode("read")}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors shadow-sm text-sm font-medium"
                >
                    <BookOpen size={16} />
                    <span>Read Mode</span>
                </button>
            </div>

            {mode === "equity" ? (
                <div className="animate-in fade-in duration-500">
                    <EquityView nodes={nodes} projectAuthor={project.author} />
                </div>
            ) : (
                <div className="grid md:grid-cols-3 gap-8 animate-in fade-in duration-500">
                    <div className="md:col-span-2 space-y-8">
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span>The Muse Graph</span>
                                <span className="text-xs font-normal text-white bg-blue-600 px-2 py-1 rounded-full">Beta V2</span>
                            </h2>
                            {/* Weaver Report (If applies) */}
                            {canon.length > 0 && (
                                <WeaverReport
                                    aiDataString={canon[0].aiData}
                                    summary={canon[0].summary}
                                />
                            )}

                            {/* UNIFIED GRAPH: Interactive + Rich Metadata */}
                            <MuseGraph nodesData={nodes} />
                        </section>

                        <StoryViewer project={project} nodes={canon} />

                        <div className="border-t pt-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <PenTool size={20} />
                                <span>Contribute to the Project</span>
                            </h3>
                            {userId ? (
                                <ContributionForm
                                    projectId={project.id}
                                    parentId={lastCanonId || undefined}
                                    type="B"
                                />
                            ) : (
                                <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
                                    Sign in to contribute to this project.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <CandidateList
                            candidates={candidates}
                            currentUserId={userId}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
