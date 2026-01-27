
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Starting Direct Seed Fix...");
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
        console.log("Clearing old data...");
        await prisma.vote.deleteMany({});
        await prisma.contribution.deleteMany({});
        await prisma.node.deleteMany({});
        await prisma.project.deleteMany({});

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

        const users: Record<string, string> = {};

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

        console.log("Creating Chronicles of the Glass City...");
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
                content: "Seed A: Genesis - Welcome to Veridia, the Glass City...",
                type: "TEXT",
                projectId: novel.id,
                authorId: projectAuthorId,
                summary: "Seed A: Genesis",
                isCanon: true,
                aiScore: 94,
                aiData: JSON.stringify({ scores: { novelty: 10 }, scoutOpinion: "Visually stunning.", status: "APPROVED" })
            }
        });

        const nodeB = await prisma.node.create({
            data: {
                content: "Branch 1: The Smudgers...",
                summary: "Branch 1: The Smudgers",
                type: "TEXT",
                projectId: novel.id,
                authorId: users["@Alice_Noir"],
                parentId: nodeA.id,
                isCanon: false,
                aiScore: 89
            }
        });

        const nodeC = await prisma.node.create({
            data: {
                content: "Twist: The Glass is Alive...",
                summary: "Twist: Alive",
                type: "TEXT",
                projectId: novel.id,
                authorId: users["@Bob_SciFi"],
                parentId: nodeB.id,
                isCanon: false,
                aiScore: 95
            }
        });

        // Seed Contributions (CRITICAL fix)
        console.log("Seeding Contributions...");
        const distinctAuthors = Object.values(users);
        for (const uid of distinctAuthors) {
            await prisma.contribution.create({
                data: {
                    projectId: novel.id,
                    userId: uid,
                    percentage: uid === projectAuthorId ? 10 : 1,
                    role: uid === projectAuthorId ? "Founder" : "Contributor"
                }
            });
        }

        console.log("✅ Seed Complete!");

    } catch (error) {
        console.error("Seeding failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
