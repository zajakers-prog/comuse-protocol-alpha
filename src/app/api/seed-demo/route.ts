import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const demoUserEmail = "demo@comuse.app";

        // 1. Upsert Demo User
        const author = await prisma.user.upsert({
            where: { email: demoUserEmail },
            update: {},
            create: {
                email: demoUserEmail,
                name: "Jason (Founder)",
            }
        });

        // 2. Clear OLD Data (Reset for clean slate)
        // Order matters for Foreign Key constraints:
        // Vote -> Contribution -> Node -> Project
        await prisma.vote.deleteMany({});
        await prisma.contribution.deleteMany({});
        await prisma.node.deleteMany({});
        await prisma.project.deleteMany({});

        const results = [];

        // 3. Insert specific cases from User Screenshot

        // Case A: Chronicles of the Glass City (Novel)
        const novel = await prisma.project.create({
            data: {
                title: "Chronicles of the Glass City",
                description: "A cyberpunk noir set in a city made entirely of transparent smart-glass, where privacy is the ultimate currency.",
                type: "STORY",
                authorId: author.id,
                nodes: {
                    create: {
                        content: "Seed A: Genesis - Welcome to Veridia, the Glass City. Here, walls don't hide secrets; they display them. I am a 'Smudger', one of the few who can buy you an hour of true darkness.",
                        type: "TEXT",
                        authorId: author.id,
                        summary: "Cyberpunk Noir in a transparent city.",
                        aiScore: 94,
                        aiData: JSON.stringify({
                            scores: { novelty: 10, osmuPotential: 9, collaborativeMagnetism: 10, marketDemand: 9 },
                            totalIpIndex: 94,
                            scoutOpinion: "Visually stunning concept. High Netflix adaptation potential.",
                            builderInvitation: "Explore the crime syndicates or the technology.",
                            status: "APPROVED"
                        }),
                        isCanon: true
                    }
                }
            }
        });
        results.push(novel.title);

        // Case B: Quantum Consciousness Protocol (Research)
        const research = await prisma.project.create({
            data: {
                title: "Quantum Consciousness Protocol",
                description: "Collaborative research paper exploring the intersection of quantum mechanics and human cognition.",
                type: "RESEARCH",
                authorId: author.id,
                nodes: {
                    create: {
                        content: "Seed A: Hypothesis - Reducing Orch-OR theory to practice. Can we detect quantum vibrations in microtubules using standard MRI variations?",
                        type: "TEXT",
                        authorId: author.id,
                        summary: "Testing quantum mechanics in the human brain.",
                        aiScore: 98,
                        aiData: JSON.stringify({
                            scores: { novelty: 10, osmuPotential: 8, collaborativeMagnetism: 10, marketDemand: 10 },
                            totalIpIndex: 98,
                            scoutOpinion: "Paradigm synthesis. Needs physicist validation.",
                            builderInvitation: "Propose experimental setup.",
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
