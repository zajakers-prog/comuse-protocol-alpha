"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function CreateProjectPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Step 1: Type Selection, Step 2: Details
    const [step, setStep] = useState(1);
    const [type, setType] = useState<"STORY" | "IDEA" | "RESEARCH">("STORY");

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/api/auth/signin");
        }
    }, [status, router]);

    if (status === "loading" || status === "unauthenticated") {
        return <div className="container mx-auto px-4 py-8">Loading...</div>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description, type }),
            });

            if (!res.ok) throw new Error("Failed to create project");

            const project = await res.json();
            router.push(`/projects/${project.id}`);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Failed to create project");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            {step === 1 ? (
                // Step 1: Type Selection
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center">
                        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">What are you creating?</h1>
                        <p className="text-gray-500">Choose the format that best fits your vision.</p>
                    </div>

                    <div className="grid gap-4">
                        {[
                            { id: "IDEA", label: "Spark (Idea)", desc: "A raw concept or prompt for others to build on." },
                            { id: "STORY", label: "Story (Narrative)", desc: "A linear or branching narrative with chapters." },
                            { id: "RESEARCH", label: "Joint Research", desc: "Collaborative exploration of a topic." },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setType(item.id as any);
                                    setStep(2);
                                }}
                                className="flex flex-col items-start p-6 bg-white border border-gray-200 rounded-xl hover:border-black hover:shadow-md transition-all text-left group"
                            >
                                <span className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {item.label}
                                </span>
                                <span className="text-sm text-gray-500 mt-1">
                                    {item.desc}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                // Step 2: Details Form
                <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                    <button
                        onClick={() => setStep(1)}
                        className="text-sm text-gray-500 hover:text-black mb-6 flex items-center gap-1"
                    >
                        ← Back to Type Selection
                    </button>

                    <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">
                        {type === "IDEA" ? "Ignite the Spark" : type === "RESEARCH" ? "Define the Topic" : "Start a New Story"}
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                Title
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                autoFocus
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-shadow"
                                placeholder={type === "IDEA" ? "e.g., What if cats ruled the world?" : "The Great Adventure"}
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                {type === "IDEA" ? "Context" : type === "RESEARCH" ? "Research Question" : "The Spark (Premise)"}
                            </label>
                            <p className="text-xs text-gray-500 mb-2">
                                {type === "IDEA"
                                    ? "Give enough detail for others to understand the core concept."
                                    : "Set the scene, introduce the world, or provide the opening paragraph."}
                            </p>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                rows={8}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-shadow font-serif"
                                placeholder="It was a dark and stormy night..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-black text-white py-3 rounded-md font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Creating..." : "Launch Project"}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
