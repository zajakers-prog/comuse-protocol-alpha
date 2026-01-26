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

        // 1.5 Upsert Demo Contributors
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
        // A
        const nodeA = await prisma.node.create({
            data: {
                content: "Seed A: Genesis - Welcome to Veridia, the Glass City. Here, walls don't hide secrets; they display them. I am a 'Smudger', one of the few who can buy you an hour of true darkness.",
                type: "TEXT",
                projectId: novel.id,
                authorId: projectAuthorId,
                summary: "Seed A: Genesis",
                isCanon: true,
                aiScore: 94,
                aiData: JSON.stringify({ scores: { novelty: 10 }, scoutOpinion: "Visually stunning concept.", status: "APPROVED" })
            }
        });

        // B (Branch 1) -> A
        const nodeB = await prisma.node.create({
            data: {
                content: "Branch 1: The Smudgers - We operate in the steam tunnels. The only place the glass can't reach.",
                summary: "Branch 1: The Smudgers",
                type: "TEXT",
                projectId: novel.id,
                authorId: users["@Alice_Noir"],
                parentId: nodeA.id,
                isCanon: false,
                aiScore: 89
            }
        });

        // C (Twist) -> B
        const nodeC = await prisma.node.create({
            data: {
                content: "Twist: The Glass is Alive - It's not just silicone. It's a silicon-based lifeform that feeds on light.",
                summary: "Twist: The Glass is Alive",
                type: "TEXT",
                projectId: novel.id,
                authorId: users["@Bob_SciFi"],
                parentId: nodeB.id,
                isCanon: false,
                aiScore: 95
            }
        });

        // D (Branch 2) -> A
        const nodeD = await prisma.node.create({
            data: {
                content: "Branch 2: Corporate Eye - From the penthouse, I watch them scurry. The transparency ensures order.",
                summary: "Branch 2: Corporate Eye",
                type: "TEXT",
                projectId: novel.id,
                authorId: users["@David_Elite"],
                parentId: nodeA.id,
                isCanon: false,
                aiScore: 82
            }
        });

        // E (Ending) -> C
        const nodeE = await prisma.node.create({
            data: {
                content: "Ending: Shatter - We found the resonant frequency. Tomorrow, the city falls.",
                summary: "Ending: Shatter",
                type: "TEXT",
                projectId: novel.id,
                authorId: users["@Eve_Punk"],
                parentId: nodeC.id,
                isCanon: false,
                aiScore: 98
            }
        });

        // F (Ending) -> C
        const nodeF = await prisma.node.create({
            data: {
                content: "Ending: Symbiosis - We accepted the transparency. We are becoming glass.",
                summary: "Ending: Symbiosis",
                type: "TEXT",
                projectId: novel.id,
                authorId: users["@Frank_Bio"],
                parentId: nodeC.id,
                isCanon: false,
                aiScore: 88
            }
        });

        // G (Subplot) -> D
        const nodeG = await prisma.node.create({
            data: {
                content: "Subplot: Reflection - The AI fell in love with a reflection in a broken shard.",
                summary: "Subplot: Reflection",
                type: "TEXT",
                projectId: novel.id,
                authorId: users["@Grace_Cop"],
                parentId: nodeD.id,
                isCanon: false,
                aiScore: 80
            }
        });

        // ... (Equity Contributions would be logged here in a real scenario, but we skip for now as strict schema doesn't force it for rendering)

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
                aiData: JSON.stringify({ scores: { novelty: 10 }, scoutOpinion: "Paradigm synthesis.", status: "APPROVED" })
            }
        });

        const rNodeB = await prisma.node.create({
            data: {
                content: "Branch 1: Bio-Physics - Developing an MRI variant to detect coherence.",
                summary: "Branch 1: Bio-Physics",
                type: "TEXT",
                projectId: research.id,
                authorId: users["@Dr_Sarah"],
                parentId: rNodeA.id,
                aiScore: 92
            }
        });

        const rNodeC = await prisma.node.create({
            data: {
                content: "Proof: Time Dilation - Subjects in deep coherence experience time dilation.",
                summary: "Proof: Time Dilation",
                type: "TEXT",
                projectId: research.id,
                authorId: users["@Tech_Tom"],
                parentId: rNodeB.id,
                aiScore: 96
            }
        });

        const rNodeD = await prisma.node.create({
            data: {
                content: "Branch 2: AI Simulation - Building a silicon brain with quantum gates.",
                summary: "Branch 2: AI Simulation",
                type: "TEXT",
                projectId: research.id,
                authorId: users["@Cyber_Corp"],
                parentId: rNodeA.id,
                aiScore: 85
            }
        });

        const rNodeE = await prisma.node.create({
            data: {
                content: "Ending: Transcendence - Consciousness uploaded to the field.",
                summary: "Ending: Transcendence",
                type: "TEXT",
                projectId: research.id,
                authorId: users["@Monk_AI"],
                parentId: rNodeC.id,
                aiScore: 99
            }
        });

        const rNodeF = await prisma.node.create({
            data: {
                content: "Error: Ghost in Machine - The simulation started dreaming.",
                summary: "Error: Ghost in Machine",
                type: "TEXT",
                projectId: research.id,
                authorId: users["@Hacker_X"],
                parentId: rNodeD.id,
                aiScore: 88
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
