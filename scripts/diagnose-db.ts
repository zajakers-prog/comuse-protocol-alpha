
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("--- Projects ---");
        const projects = await prisma.project.findMany({
            include: { _count: { select: { nodes: true, equity: true } } }
        });
        console.table(projects.map(p => ({
            title: p.title,
            nodes: p._count.nodes,
            contributions: p._count.equity
        })));

        console.log("\n--- Contributions ---");
        const contributions = await prisma.contribution.findMany();
        console.log(`Total Contributions: ${contributions.length}`);
        contributions.forEach(c => console.log(`- Project: ${c.projectId.slice(-5)}, User: ${c.userId.slice(-5)}, %: ${c.percentage}`));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
