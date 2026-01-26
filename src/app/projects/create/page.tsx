"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateProjectPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<"WRITING" | "CARTOON" | "MUSIC" | "RESEARCH" | null>(null);
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect if unauthenticated
    if (status === "unauthenticated") {
        router.push("/api/auth/signin");
        return null; // Or a loading spinner
    }

    if (status === "loading") {
        return <div className="p-10 text-center">Loading...</div>;
    }

    const handleCreate = async () => {
        if (!content || !selectedCategory) return;
        setIsSubmitting(true);

        try {
            // Map the new categories to the DB types our backend expects (for MVP)
            // WRITING/CARTOON -> STORY
            // MUSIC -> SONGWRITING (if supported) or IDEA
            // RESEARCH -> RESEARCH
            let dbType = "IDEA";
            if (selectedCategory === "WRITING" || selectedCategory === "CARTOON") dbType = "STORY";
            if (selectedCategory === "RESEARCH") dbType = "RESEARCH";
            if (selectedCategory === "MUSIC") dbType = "SONGWRITING"; // Assuming backend handles this or defaults

            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: dbType,
                    content: content,
                    title: `New ${selectedCategory} Seed`,
                    genre: selectedCategory // Pass as genre meta
                }),
            });

            if (res.ok) {
                const project = await res.json();
                router.push(`/projects/${project.id}`);
            } else {
                alert("Failed to create seed.");
            }
        } catch (e) {
            console.error(e);
            alert("Error creating seed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            {step === 1 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6 text-center">
                        Choose Your Medium
                    </h1>
                    <p className="text-xl text-gray-500 text-center mb-12 max-w-2xl mx-auto font-light">
                        What kind of creative seed are you planting today?
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            { id: "WRITING", label: "Writing", sub: "Novels, Screenplays, Lyrics", icon: "✍️", color: "hover:border-blue-500 hover:bg-blue-50" },
                            { id: "CARTOON", label: "Cartoon / Webtoon", sub: "Storyboards, Character Specs", icon: "🎨", color: "hover:border-purple-500 hover:bg-purple-50" },
                            { id: "MUSIC", label: "Music", sub: "Co-composition, Melody Lines", icon: "🎵", color: "hover:border-pink-500 hover:bg-pink-50" },
                            { id: "RESEARCH", label: "Joint Research", sub: "Hypothesis, Academic Inquiry", icon: "🔬", color: "hover:border-green-500 hover:bg-green-50" },
                        ].map((option) => (
                            <button
                                key={option.id}
                                onClick={() => {
                                    setSelectedCategory(option.id as any);
                                    setStep(2);
                                }}
                                className={`group p-8 border border-gray-200 rounded-3xl transition-all text-left flex items-start gap-6 bg-white shadow-sm hover:shadow-xl ${option.color}`}
                            >
                                <div className="text-5xl p-4 bg-gray-50 rounded-2xl group-hover:scale-110 transition-transform">
                                    {option.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-2xl text-gray-900 mb-2">{option.label}</h3>
                                    <p className="text-base text-gray-500 group-hover:text-gray-700">{option.sub}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-3xl mx-auto">
                    <button
                        onClick={() => setStep(1)}
                        className="text-sm font-medium text-gray-400 hover:text-black mb-8 flex items-center gap-2 transition-colors"
                    >
                        ← Back to categories
                    </button>

                    <h1 className="text-4xl font-serif font-bold text-gray-900 mb-3">
                        Plant your <span className="text-blue-600">{selectedCategory?.toLowerCase()}</span> seed.
                    </h1>
                    <p className="text-lg text-gray-500 mb-8 font-light">
                        Describe your initial concept. It can be a rough draft, a character sketch, or a melody idea.
                    </p>

                    <div className="bg-white p-1 rounded-3xl border border-gray-200 shadow-xl focus-within:ring-4 focus-within:ring-blue-50 transition-all">
                        <textarea
                            className="w-full h-80 p-8 bg-white rounded-3xl border-none focus:ring-0 resize-none text-xl leading-relaxed placeholder:text-gray-300 font-serif"
                            placeholder={
                                selectedCategory === "MUSIC" ? "e.g. A lo-fi beat with a walking bassline in A minor... (Paste Soundcloud link or describe vibes)" :
                                    selectedCategory === "CARTOON" ? "e.g. A protagonist who can see sound waves. Setting: Neo-Seoul, 2045..." :
                                        "Start writing here..."
                            }
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            autoFocus
                        />
                        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 rounded-b-3xl">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                <span>🤖 Weaver AI Active</span>
                            </div>
                            <button
                                disabled={isSubmitting || !content.trim()}
                                onClick={handleCreate}
                                className="px-10 py-4 bg-black text-white rounded-2xl font-bold text-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 shadow-lg flex items-center gap-2"
                            >
                                {isSubmitting ? "Planting..." : "Launch Seed 🚀"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
