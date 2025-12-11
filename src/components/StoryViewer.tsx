import { formatDistanceToNow } from "date-fns";

interface StoryPart {
    id: string;
    content: string;
    author: { name: string | null };
    createdAt: Date;
    type: string;
}

interface StoryViewerProps {
    project: {
        title: string;
        description: string | null;
        author: { name: string | null };
        createdAt: Date;
    };
    nodes: StoryPart[];
}

export function StoryViewer({ project, nodes }: StoryViewerProps) {
    return (
        <div className="space-y-8">
            {/* Role A: The Spark */}
            <section className="prose prose-lg max-w-none">
                <div className="mb-6 border-b pb-4">
                    <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">{project.title}</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="font-medium text-gray-900">Spark by {project.author.name || "Anonymous"}</span>
                        <span>•</span>
                        <time>{formatDistanceToNow(project.createdAt, { addSuffix: true })}</time>
                    </div>
                </div>
                <div className="text-xl text-gray-800 font-serif leading-relaxed italic border-l-4 border-gray-200 pl-4">
                    {project.description || ""}
                </div>
            </section>

            {/* Role B/C: The Canon */}
            <div className="space-y-6">
                {nodes.map((part, index) => (
                    <section key={part.id} className="prose prose-lg max-w-none">
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1 uppercase tracking-wider">
                            <span>Chapter {index + 1}</span>
                            <span>•</span>
                            <span>{part.author.name || "Anonymous"}</span>
                        </div>
                        <div className="text-lg text-gray-800 font-serif leading-relaxed">
                            {part.content}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}
