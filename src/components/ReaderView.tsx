"use client";

import { formatDistanceToNow } from "date-fns";
import { User } from "lucide-react";

interface ReaderViewProps {
    project: {
        title: string;
        description: string | null;
        author: { name: string | null };
    };
    nodes: {
        id: string;
        content: string;
        author: { name: string | null };
        createdAt: Date;
    }[];
}

export function ReaderView({ project, nodes }: ReaderViewProps) {
    return (
        <div className="max-w-2xl mx-auto bg-white min-h-screen py-12 px-8 md:px-12 shadow-sm">
            {/* Title Section */}
            <div className="text-center mb-16 border-b pb-8">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4 leading-tight">
                    {project.title}
                </h1>
                <div className="flex items-center justify-center gap-2 text-gray-500 text-sm font-medium">
                    <span>Created by {project.author.name || "Anonymous"}</span>
                </div>
            </div>

            {/* Content Stitching */}
            <div className="prose prose-lg prose-slate max-w-none font-serif leading-relaxed">
                {/* Opening / Premise */}
                {project.description && (
                    <div className="mb-8 first-letter:text-5xl first-letter:font-bold first-letter:mr-1 first-letter:float-left">
                        {project.description.split('\n').map((paragraph, i) => (
                            <p key={i} className="mb-4 text-gray-800">{paragraph}</p>
                        ))}
                    </div>
                )}

                {/* Nodes */}
                {nodes.map((node, index) => (
                    <div key={node.id} className="group relative mb-6">
                        {/* Author Annotation (Visible on Hover) */}
                        <div className="absolute -left-32 top-0 w-28 text-right opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                            <div className="text-xs text-gray-400 flex items-center justify-end gap-1">
                                <span>{node.author.name || "Anon"}</span>
                                <User size={10} />
                            </div>
                        </div>

                        {/* Node Content */}
                        {node.content.split('\n').map((paragraph, i) => (
                            <p key={i} className="mb-4 text-gray-800">{paragraph}</p>
                        ))}

                        {/* Subtle Divider between different authors */}
                        {index < nodes.length - 1 && nodes[index + 1].author.name !== node.author.name && (
                            <div className="w-8 h-px bg-gray-200 mx-auto my-8" />
                        )}
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="mt-24 pt-8 border-t text-center text-gray-400 text-sm italic">
                End of current path
            </div>
        </div>
    );
}
