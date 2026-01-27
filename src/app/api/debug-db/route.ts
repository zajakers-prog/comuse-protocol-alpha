
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const projectCount = await prisma.project.count();
        const contributionCount = await prisma.contribution.count();
        const nodeCount = await prisma.node.count();

        const projects = await prisma.project.findMany({
            include: {
                _count: {
                    select: { equity: true, nodes: true }
                },
                equity: true // Include actual records to see if they exist
            }
        });

        return NextResponse.json({
            meta: {
                env: process.env.NODE_ENV,
                dbUrl: process.env.DATABASE_URL ? "Exists (Hidden)" : "Missing"
            },
            counts: {
                projects: projectCount,
                contributions: contributionCount,
                nodes: nodeCount
            },
            details: projects.map(p => ({
                id: p.id,
                title: p.title,
                contributor_count_from_relation: p._count.equity,
                actual_contributions_length: p.equity.length,
                contributions: p.equity
            }))
        }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
