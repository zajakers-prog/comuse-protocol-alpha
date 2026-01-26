import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const demoUserEmail = "demo@comuse.app";

        // ... (existing code)

        // Redirect to home page
        return NextResponse.redirect(new URL('/', req.url), { status: 303 });
        const author = await prisma.user.upsert({
            where: { email: demoUserEmail },
            update: {},
            create: {
                email: demoUserEmail,
                name: "Jason (Founder)",
            }
        });

        // 2. Clear OLD Data (Reset for clean slate)
        await prisma.node.deleteMany({});
        await prisma.project.deleteMany({});

        const results = [];

        // 3. Insert specific cases

        // Case A: Memory Laundromat
        const novel = await prisma.project.create({
            data: {
                title: "Memory Laundromat (기억 세탁소)",
                description: "A selective memory-erasing shop opens in Gangnam.",
                type: "STORY",
                authorId: author.id,
                nodes: {
                    create: {
                        content: "Seed A: Genesis - A mysterious shop in Gangnam offers to erase painful memories. But the owner, 'Mr. K', warns: 'For every memory erased, you lose a piece of your future.'",
                        type: "TEXT",
                        authorId: author.id,
                        summary: "Hypothesis: Selective memory erasure service.",
                        aiScore: 98,
                        aiData: JSON.stringify({
                            scores: { novelty: 10, osmuPotential: 9, collaborativeMagnetism: 10, marketDemand: 10 },
                            totalIpIndex: 98,
                            scoutOpinion: "High-concept K-Drama potential. Global streaming appeal.",
                            builderInvitation: "Branch into Thriller or Romance.",
                            status: "APPROVED"
                        }),
                        isCanon: true
                    }
                }
            }
        });
        results.push(novel.title);

        // Case B: Plastic Degradation
        const research = await prisma.project.create({
            data: {
                title: "Cold Microbial Plastic Degradation",
                description: "Hypothesis: Specific microbes in glaciers might degrade polyethylene.",
                type: "RESEARCH",
                authorId: author.id,
                nodes: {
                    create: {
                        content: "Seed A: Hypothesis - While drilling via the Antarctica core, we found 'Cryo-Bacillus' consuming plastic waste at -20 degrees. This could revolutionize industrial recycling.",
                        type: "TEXT",
                        authorId: author.id,
                        summary: "Discovery of plastic-eating cold microbes.",
                        aiScore: 97,
                        aiData: JSON.stringify({
                            scores: { novelty: 10, osmuPotential: 8, collaborativeMagnetism: 9, marketDemand: 10 },
                            totalIpIndex: 97,
                            scoutOpinion: "Game-changer for Green Tech. Needs bio-med validation.",
                            builderInvitation: "Propose extraction methods.",
                            status: "APPROVED"
                        }),
                        isCanon: true
                    }
                }
            }
        });
        results.push(research.title);

        // Redirect to home page
        return NextResponse.redirect(new URL('/', req.url), { status: 303 });

    } catch (error) {
        console.error("Seeding failed:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
