
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        console.log("Starting Seed Fix...");
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

        // 2. Clear OLD Data
        // Order matters: Vote -> Contribution -> Node -> Project
        await prisma.vote.deleteMany({});
        await prisma.contribution.deleteMany({});
        await prisma.node.deleteMany({});
        await prisma.project.deleteMany({});

        const results = [];

        // 3. Upsert Contributors
        const contributors = [
            { email: "alice@comuse.app", name: "Alice (Writer)", handle: "@Alice_Noir" },
            { email: "bob@comuse.app", name: "Bob (SciFi)", handle: "@Bob_SciFi" },
            { email: "david@comuse.app", name: "David (Elite)", handle: "@David_Elite" },
            { email: "eve@comuse.app", name: "Eve (Punk)", handle: "@Eve_Punk" },
            { email: "frank@comuse.app", name: "Frank (Bio)", handle: "@Frank_Bio" },
            { email: "grace@comuse.app", name: "Grace (Cop)", handle: "@Grace_Cop" },
            { email: "sarah@comuse.app", name: "Sarah (Lab)", handle: "@Dr_Sarah" },
            { email: "tom@comuse.app", name: "Tom (Tech)", handle: "@Tech_Tom" },
            { email: "corp@comuse.app", name: "Cyber Corp", handle: "@Cyber_Corp" },
            { email: "monk@comuse.app", name: "Monk AI", handle: "@Monk_AI" },
            { email: "x@comuse.app", name: "Hacker X", handle: "@Hacker_X" },
        ];

        const users: Record<string, string> = {}; // handle -> id

        for (const c of contributors) {
            const u = await prisma.user.upsert({
                where: { email: c.email },
                update: {},
                create: { email: c.email, name: c.name }
            });
            users[c.handle] = u.id;
        }

        const projectAuthorId = author.id;
        users["@Jason_Founder"] = author.id;

        // Case A: Chronicles of the Glass City (Novel)
        const novel = await prisma.project.create({
            data: {
                title: "Chronicles of the Glass City",
                description: "A cyberpunk noir set in a city made entirely of transparent smart-glass, where privacy is the ultimate currency.",
                type: "STORY",
                authorId: projectAuthorId,
            }
        });

        // Seed Nodes for Novel
        const nodeA = await prisma.node.create({
            data: {
                content: "Seed A: Genesis - Welcome to Veridia, the Glass City. Here, walls don't hide secrets; they display them. I am a 'Smudger', one of the few who can buy you an hour of true darkness.",
                type: "TEXT",
                projectId: novel.id,
                authorId: projectAuthorId,
                summary: "Seed A: Genesis",
                isCanon: true,
                aiScore: 94,
                aiData: JSON.stringify({ scores: { novelty: 10, osmuPotential: 9, collaborativeMagnetism: 10, marketDemand: 8 }, scoutOpinion: "Visually stunning concept.", status: "APPROVED" })
            }
        });

        const nodeB = await prisma.node.create({
            data: {
                content: "Branch 1: The Smudgers - We operate in the steam tunnels. The only place the glass can't reach.",
                summary: "Branch 1: The Smudgers",
                type: "TEXT",
                projectId: novel.id,
                authorId: users["@Alice_Noir"],
                parentId: nodeA.id,
                isCanon: false,
                aiScore: 89,
                aiData: JSON.stringify({ scores: { novelty: 8 }, scoutOpinion: "Good expansion.", status: "PENDING" })
            }
        });

        const nodeC = await prisma.node.create({
            data: {
                content: "Twist: The Glass is Alive - It's not just silicone. It's a silicon-based lifeform that feeds on light.",
                summary: "Twist: The Glass is Alive",
                type: "TEXT",
                projectId: novel.id,
                authorId: users["@Bob_SciFi"],
                parentId: nodeB.id,
                isCanon: false,
                aiScore: 95,
                aiData: JSON.stringify({ scores: { novelty: 10 }, scoutOpinion: "Mind-bending twist.", status: "PENDING" })
            }
        });

        const nodeD = await prisma.node.create({
            data: {
                content: "Branch 2: Corporate Eye - From the penthouse, I watch them scurry. The transparency ensures order.",
                summary: "Branch 2: Corporate Eye",
                type: "TEXT",
                projectId: novel.id,
                authorId: users["@David_Elite"],
                parentId: nodeA.id,
                isCanon: false,
                aiScore: 82,
                aiData: JSON.stringify({ scores: { novelty: 6 }, scoutOpinion: "Standard trope.", status: "PENDING" })
            }
        });

        const nodeE = await prisma.node.create({
            data: {
                content: "Ending: Shatter - We found the resonant frequency. Tomorrow, the city falls.",
                summary: "Ending: Shatter",
                type: "TEXT",
                projectId: novel.id,
                authorId: users["@Eve_Punk"],
                parentId: nodeC.id,
                isCanon: false,
                aiScore: 98,
                aiData: JSON.stringify({ scores: { novelty: 9 }, scoutOpinion: "Epic conclusion.", status: "PENDING" })
            }
        });

        const nodeF = await prisma.node.create({
            data: {
                content: "Ending: Symbiosis - We accepted the transparency. We are becoming glass.",
                summary: "Ending: Symbiosis",
                type: "TEXT",
                projectId: novel.id,
                authorId: users["@Frank_Bio"],
                parentId: nodeC.id,
                isCanon: false,
                aiScore: 88,
                aiData: JSON.stringify({ scores: { novelty: 8 }, scoutOpinion: "Poetic but dark.", status: "PENDING" })
            }
        });

        const nodeG = await prisma.node.create({
            data: {
                content: "Subplot: Reflection - The AI fell in love with a reflection in a broken shard.",
                summary: "Subplot: Reflection",
                type: "TEXT",
                projectId: novel.id,
                authorId: users["@Grace_Cop"],
                parentId: nodeD.id,
                isCanon: false,
                aiScore: 80,
                aiData: JSON.stringify({ scores: { novelty: 7 }, scoutOpinion: "Interesting sidebar.", status: "PENDING" })
            }
        });

        // 4. Create Contributions (CRITICAL STEP for "7 Contributors" count)
        const distinctAuthors = [
            users["@Jason_Founder"], users["@Alice_Noir"], users["@Bob_SciFi"],
            users["@David_Elite"], users["@Eve_Punk"], users["@Frank_Bio"], users["@Grace_Cop"]
        ];

        for (const uid of distinctAuthors) {
            if (!uid) continue;
            await prisma.contribution.create({
                data: {
                    projectId: novel.id,
                    userId: uid,
                    percentage: uid === projectAuthorId ? 10 : 1,
                    role: uid === projectAuthorId ? "Founder" : "Contributor"
                }
            });
        }

        results.push(novel.title);


        // Case B: Quantum Consciousness Protocol
        const research = await prisma.project.create({
            data: {
                title: "Quantum Consciousness Protocol",
                description: "Collaborative research paper exploring the intersection of quantum mechanics and human cognition.",
                type: "RESEARCH",
                authorId: projectAuthorId,
            }
        });

        const rNodeA = await prisma.node.create({
            data: {
                content: "Seed A: Hypothesis - Reducing Orch-OR theory to practice. Can we detect quantum vibrations in microtubules?",
                summary: "Seed A: Hypothesis",
                type: "TEXT",
                projectId: research.id,
                authorId: projectAuthorId,
                isCanon: true,
                aiScore: 98,
                aiData: JSON.stringify({ scores: { novelty: 10, osmuPotential: 10, collaborativeMagnetism: 10, marketDemand: 9 }, scoutOpinion: "Paradigm synthesis.", status: "APPROVED" })
            }
        });

        // Similar simplified nodes for Research to save space, but ensuring contributions
        await prisma.contribution.create({
            data: {
                projectId: research.id,
                userId: projectAuthorId,
                percentage: 100,
                role: "Founder"
            }
        });

        results.push(research.title);

        return NextResponse.json({ success: true, seeded: results, fixApplied: true });

    } catch (error) {
        console.error("Seeding failed:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
