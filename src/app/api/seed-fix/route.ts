
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        console.log("Starting Seed Fix: The Vanishing Window...");

        // 1. Clean up old data
        await prisma.vote.deleteMany({});
        await prisma.contribution.deleteMany({});
        await prisma.node.deleteMany({});
        await prisma.project.deleteMany({});
        await prisma.user.deleteMany({}); // Optional: Reset users too for clean slate

        // 2. Create Users (The Global Team)
        // We use upsert just in case, but deleteMany cleared them mainly.
        const usersData = [
            { name: 'Smith 🇺🇸', email: 'smith@example.com' },
            { name: 'Kimura Shingo 🇯🇵', email: 'kimura@example.com' },
            { name: 'Pierre Buffon 🇮🇹', email: 'pierre@example.com' },
            { name: 'Shim Sa-rang 🇰🇷', email: 'sarang@example.com' },
            { name: 'Ling Ling 🇭🇰', email: 'lingling@example.com' },
            { name: 'Michael 🇨🇦', email: 'michael@example.com' },
            { name: 'Chris (MIT) 🇺🇸', email: 'chris@example.com' },
            { name: 'Ashley (Harvard)', email: 'ashley@example.com' },
            { name: 'Julia', email: 'julia@example.com' },
        ];

        const usersMap: Record<string, string> = {}; // email -> id

        for (const u of usersData) {
            const user = await prisma.user.create({ data: u });
            usersMap[u.email] = user.id;
        }

        const getId = (email: string) => usersMap[email];

        // 3. Create Project
        const project = await prisma.project.create({
            data: {
                title: 'The Vanishing Window',
                description: 'A mystery about a window that only exists when you step on a specific manhole cover.',
                type: 'STORY',
                authorId: getId('smith@example.com'),
            },
        });

        // 4. Create Nodes (The Story Tree)

        // Root Node (Smith's Idea)
        const rootNode = await prisma.node.create({
            data: {
                content: "It started with a rhythmic clack. Every time my right heel struck the manhole cover on 5th Avenue, the window appeared. A small, red-bricked window on the third floor of the bakery. Step off, it's gone. Step on, it's back. I've walked this street a thousand times, but today was the first time I noticed *her* standing in it.",
                type: 'TEXT',
                projectId: project.id,
                authorId: getId('smith@example.com'),
                summary: "The Manhole Trigger",
                isCanon: true,
                aiScore: 92,
                isPaidBoost: true,
            },
        });

        // --- Branch A: Thriller (Kimura -> Pierre) ---
        const nodeA1 = await prisma.node.create({
            data: {
                content: "I tested it three times. Clack. Window. Silence. Wall. It wasn't a hologram. It was a spatial rift. I decided to wait until nightfall. If the window existed, surely the room behind it did too. I bought a ladder.",
                type: 'TEXT',
                projectId: project.id,
                authorId: getId('kimura@example.com'),
                parentId: rootNode.id,
                summary: "Spatial Rift Test",
                isCanon: true,
                aiScore: 85,
                isPaidBoost: true, // Boost high score
            },
        });

        const nodeA2 = await prisma.node.create({
            data: {
                content: "The room wasn't empty. It was filled with files. Government files. Dates from 1950 to 2030. Wait, 2030? That's five years from now. I saw a file labeled 'Project: Vanishing Point' and my own name was on the cover.",
                type: 'TEXT',
                projectId: project.id,
                authorId: getId('pierre@example.com'),
                parentId: nodeA1.id,
                summary: "Future Files Found",
                isCanon: true,
                aiScore: 88,
                isPaidBoost: true,
            },
        });

        // --- Branch B: SF/Multiverse (Michael -> Chris) ---
        const nodeB1 = await prisma.node.create({
            data: {
                content: "The manhole cover wasn't a trigger. It was a stabilizer. The window was always there, vibrating at a frequency our eyes couldn't perceive. The impact of my step synchronized my visual cortex for a split second.",
                type: 'TEXT',
                projectId: project.id,
                authorId: getId('michael@example.com'),
                parentId: rootNode.id,
                summary: "Frequency Stabilizer Idea",
                isCanon: false,
                aiScore: 78,
            },
        });

        const nodeB2 = await prisma.node.create({
            data: {
                content: "Quantum entanglement suggests that the observer affects reality. But here, the observer *creates* it. I calculated the oscillation frequency: 440Hz. The exact pitch of an 'A' note.",
                type: 'TEXT',
                projectId: project.id,
                authorId: getId('chris@example.com'),
                parentId: nodeB1.id,
                summary: "Observer Effect 440Hz",
                isCanon: false,
                aiScore: 81,
            },
        });

        // --- The Ending War (Shim Sa-rang vs Ling Ling) ---

        // Ending 1: Open Ending (Shim Sa-rang) - Currently Winning
        const ending1 = await prisma.node.create({
            data: {
                content: "I left the file there. Some truths represent a burden too heavy for one timeline. I stepped off the manhole, and the window vanished forever. Or so I thought, until I saw the same window on my own apartment building.",
                type: 'TEXT',
                projectId: project.id,
                authorId: getId('sarang@example.com'),
                parentId: nodeA2.id,
                summary: "Burden of Truth",
                isCanon: true,
                aiScore: 95,
                isPaidBoost: true,
            },
        });

        // Ending 2: Tragic Ending (Ling Ling) - Challenger
        const ending2 = await prisma.node.create({
            data: {
                content: "I reached for the file, but a hand grabbed my wrist. 'You shouldn't have seen that,' she whispered. The last thing I felt was the cold air as she pushed me out. The fall didn't kill me. The disappearance of the window did. I was trapped in the wall.",
                type: 'TEXT',
                projectId: project.id,
                authorId: getId('lingling@example.com'),
                parentId: nodeA2.id,
                summary: "Trapped in the Wall",
                isCanon: false,
                aiScore: 89,
                isPaidBoost: true,
            },
        });

        // 5. Simulate Votes
        await prisma.vote.createMany({
            data: [
                { userId: getId('smith@example.com'), nodeId: ending1.id, value: 1 },
                { userId: getId('kimura@example.com'), nodeId: ending1.id, value: 1 },
                { userId: getId('ashley@example.com'), nodeId: ending1.id, value: 1 },
            ]
        });

        await prisma.vote.createMany({
            data: [
                { userId: getId('lingling@example.com'), nodeId: ending2.id, value: 1 },
                { userId: getId('pierre@example.com'), nodeId: ending2.id, value: 1 },
            ]
        });

        // 6. Fix Contributions
        // We explicitly create contributions for all active nodes to ensure Equity View works perfectly.
        const allNodes = [rootNode, nodeA1, nodeA2, nodeB1, nodeB2, ending1, ending2];
        const uniqueAuthors = Array.from(new Set(allNodes.map(n => n.authorId)));

        for (const uid of uniqueAuthors) {
            await prisma.contribution.create({
                data: {
                    projectId: project.id,
                    userId: uid,
                    percentage: 10, // Placeholder, frontend calcs weighted
                    role: uid === project.authorId ? "Founder" : "Contributor"
                }
            });
        }

        return NextResponse.json({ success: true, seeded: [project.title], fixApplied: true });

    } catch (error) {
        console.error("Seeding failed:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
