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

    // Candidates: isCanon false AND parentId matches lastCanonId
    // Note: If lastCanonId is null, we look for nodes with parentId === null (Seed candidates)
    const candidates = nodes.filter(
        (n) => !n.isCanon && n.parentId === lastCanonId
    ).map(n => ({
        ...n,
        hasVoted: n.votes.length > 0
    }));

    // Sort candidates by votes
    candidates.sort((a, b) => b._count.votes - a._count.votes);

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
                project={project}
                nodes={nodes}
                canon={canon}
                candidates={candidates}
                userId={userId}
                lastCanonId={lastCanonId}
            />
        </div>
    );
}
