import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProjectInterface } from "@/components/ProjectInterface";

interface PageProps {
    params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function ProjectPage({ params }: PageProps) {
    const { id } = await params;
    const session = await auth();
    const userId = (session?.user as any)?.id;

    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            author: true,
        },
    });

    // Ensure project AND author exist (Seed script might have failed linking?)
    if (!project || !project.author) {
        console.error("Project or Author not found:", id);
        notFound();
    }

    if (!project) notFound();

    // Fetch all nodes
    const nodes = await prisma.node.findMany({
        where: { projectId: id },
        include: {
            author: true,
            _count: { select: { votes: true } },
            votes: userId ? { where: { userId } } : false,
        },
        orderBy: { createdAt: "asc" },
    });

    // Separate Canon vs Candidates
    const canon = nodes.filter((n) => n.isCanon);

    // Candidates are replies to the LAST canon item.
    const lastCanonId = canon.length > 0 ? canon[canon.length - 1].id : null;

    // Candidates: ALL non-canon nodes (Branches, Twists, Endings, etc.)
    // We want to show the entire tree of contributions below the graph.
    const candidates = nodes.filter((n) => !n.isCanon).map(n => ({
        ...n,
        // Safely check votes (it might be undefined if userId is null)
        hasVoted: (n.votes || []).length > 0
    }));

    // Sort candidates by AI Score (Quality first) then Votes
    candidates.sort((a, b) => {
        const scoreA = a.aiScore || 0;
        const scoreB = b.aiScore || 0;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return b._count.votes - a._count.votes;
    });

    const storyParts = canon.map(n => ({
        id: n.id,
        content: n.content,
        author: n.author,
        createdAt: n.createdAt,
        type: n.type,
    }));

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <ProjectInterface
                project={JSON.parse(JSON.stringify(project))}
                nodes={JSON.parse(JSON.stringify(nodes))}
                canon={JSON.parse(JSON.stringify(canon))}
                candidates={JSON.parse(JSON.stringify(candidates))}
                userId={userId}
                lastCanonId={lastCanonId}
            />
        </div>
    );
}
