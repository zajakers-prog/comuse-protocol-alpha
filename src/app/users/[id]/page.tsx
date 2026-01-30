import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";

interface PageProps {
    params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function UserProfilePage({ params }: PageProps) {
    const { id } = await params;
    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            projects: { orderBy: { createdAt: "desc" } },
            nodes: {
                orderBy: { createdAt: "desc" },
                include: { project: true }
            },
        },
    });

    if (!user) notFound();

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <header className="mb-12 border-b pb-6">
                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                    {user.name || "Anonymous"}
                </h1>
                <p className="text-gray-500">
                    Joined {formatDistanceToNow(user.createdAt, { addSuffix: true })}
                </p>
            </header>

            <div className="grid md:grid-cols-2 gap-12">
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <span>Stories Started</span>
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                            {user.projects.length}
                        </span>
                    </h2>
                    <div className="space-y-4">
                        {user.projects.map((project) => (
                            <article key={project.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                                <Link href={`/projects/${project.id}`} className="block group">
                                    <h3 className="font-serif font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                                        {project.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                        {project.description}
                                    </p>
                                </Link>
                            </article>
                        ))}
                        {user.projects.length === 0 && (
                            <p className="text-gray-500 italic text-sm">No stories started yet.</p>
                        )}
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <span>Contributions</span>
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                            {user.nodes.length}
                        </span>
                    </h2>
                    <div className="space-y-4">
                        {user.nodes.map((node) => (
                            <article key={node.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                                <Link href={`/projects/${node.projectId}`} className="block group">
                                    <div className="flex items-center gap-2 mb-1 text-xs text-gray-500">
                                        <span className="font-medium text-gray-900">
                                            {node.type}
                                        </span>
                                        <span>in</span>
                                        <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {node.project.title}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 line-clamp-3 font-serif">
                                        {node.content}
                                    </p>
                                    {node.isCanon && (
                                        <div className="mt-2 inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                            Canon Selected
                                        </div>
                                    )}
                                </Link>
                            </article>
                        ))}
                        {user.nodes.length === 0 && (
                            <p className="text-gray-500 italic text-sm">No contributions yet.</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
