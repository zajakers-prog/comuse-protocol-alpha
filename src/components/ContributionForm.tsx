"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface ContributionFormProps {
    projectId: string;
    parentId?: string;
    parentLabel?: string;
    type: string;
}

export function ContributionForm({ projectId, parentId, parentLabel, type }: ContributionFormProps) {
    // ... existing hooks ...
    const { data: session } = useSession();
    const router = useRouter();
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    if (!session) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        // ... existing submit logic ...
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/nodes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, projectId, parentId, type }),
            });

            if (!res.ok) throw new Error("Failed to submit contribution");

            setContent("");
            setIsOpen(false);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Failed to submit contribution");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="mt-4 px-4 py-2 bg-gray-100 text-gray-900 rounded-full hover:bg-gray-200 transition-colors text-sm font-medium"
            >
                + Extend / Branch from {parentLabel ? `"${parentLabel.substring(0, 15)}..."` : "Current"}
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-gray-900">
                    Extend or Branch Story
                </h3>
                {parentId && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                        ↳ Replying to: {parentLabel || "Selected Node"}
                    </span>
                )}
            </div>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-shadow font-serif mb-4"
                placeholder="Continue the story..."
            />
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                    {isSubmitting ? "Submitting..." : "Submit"}
                </button>
            </div>
        </form>
    );
}
