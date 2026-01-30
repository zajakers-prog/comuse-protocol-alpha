import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // 1. Clean up old data
    try {
        await prisma.vote.deleteMany()
        await prisma.contribution.deleteMany() // Clean up contributions too if they exist
        await prisma.node.deleteMany()
        await prisma.project.deleteMany()
        await prisma.user.deleteMany()
    } catch (e) {
        console.log('Clean up skipped or partial (first run)')
    }

    console.log('🧹 Cleaned up database...')

    // 2. Create Users (The Global Team)
    const users = await Promise.all([
        prisma.user.create({ data: { name: 'Smith 🇺🇸', email: 'smith@example.com' } }),
        prisma.user.create({ data: { name: 'Kimura Shingo 🇯🇵', email: 'kimura@example.com' } }),
        prisma.user.create({ data: { name: 'Pierre Buffon 🇮🇹', email: 'pierre@example.com' } }),
        prisma.user.create({ data: { name: 'Shim Sa-rang 🇰🇷', email: 'sarang@example.com' } }),
        prisma.user.create({ data: { name: 'Ling Ling 🇭🇰', email: 'lingling@example.com' } }),
        prisma.user.create({ data: { name: 'Michael 🇨🇦', email: 'michael@example.com' } }),
        prisma.user.create({ data: { name: 'Chris (MIT) 🇺🇸', email: 'chris@example.com' } }),
        prisma.user.create({ data: { name: 'Ashley (Harvard)', email: 'ashley@example.com' } }),
        prisma.user.create({ data: { name: 'Julia', email: 'julia@example.com' } }),
    ])

    const [smith, kimura, pierre, sarang, lingling, michael, chris, ashley, julia] = users

    // 3. Create Project
    const project = await prisma.project.create({
        data: {
            title: 'The Vanishing Window',
            description: 'A mystery about a window that only exists when you step on a specific manhole cover.',
            type: 'STORY',
            authorId: smith.id,
        },
    })

    console.log(`✨ Project Created: ${project.title}`)

    // 4. Create Nodes (The Story Tree)

    // Root Node (Smith's Idea)
    const rootNode = await prisma.node.create({
        data: {
            content: "It started with a rhythmic clack. Every time my right heel struck the manhole cover on 5th Avenue, the window appeared. A small, red-bricked window on the third floor of the bakery. Step off, it's gone. Step on, it's back. I've walked this street a thousand times, but today was the first time I noticed *her* standing in it.",
            type: 'TEXT',
            projectId: project.id,
            authorId: smith.id,
            isCanon: true, // The root is always canon
            aiScore: 92,
        },
    })

    // --- Branch A: Thriller (Kimura -> Pierre) ---
    const nodeA1 = await prisma.node.create({
        data: {
            content: "I tested it three times. Clack. Window. Silence. Wall. It wasn't a hologram. It was a spatial rift. I decided to wait until nightfall. If the window existed, surely the room behind it did too. I bought a ladder.",
            type: 'TEXT',
            projectId: project.id,
            authorId: kimura.id,
            parentId: rootNode.id,
            isCanon: true,
            aiScore: 85,
        },
    })

    const nodeA2 = await prisma.node.create({
        data: {
            content: "The room wasn't empty. It was filled with files. Government files. Dates from 1950 to 2030. Wait, 2030? That's five years from now. I saw a file labeled 'Project: Vanishing Point' and my own name was on the cover.",
            type: 'TEXT',
            projectId: project.id,
            authorId: pierre.id,
            parentId: nodeA1.id,
            isCanon: true,
            aiScore: 88,
        },
    })

    // --- Branch B: SF/Multiverse (Michael -> Chris) ---
    // Note: NOT Canon yet, just a candidate branch
    const nodeB1 = await prisma.node.create({
        data: {
            content: "The manhole cover wasn't a trigger. It was a stabilizer. The window was always there, vibrating at a frequency our eyes couldn't perceive. The impact of my step synchronized my visual cortex for a split second.",
            type: 'TEXT',
            projectId: project.id,
            authorId: michael.id,
            parentId: rootNode.id,
            isCanon: false,
            aiScore: 78,
        },
    })

    const nodeB2 = await prisma.node.create({
        data: {
            content: "Quantum entanglement suggests that the observer affects reality. But here, the observer *creates* it. I calculated the oscillation frequency: 440Hz. The exact pitch of an 'A' note.",
            type: 'TEXT',
            projectId: project.id,
            authorId: chris.id,
            parentId: nodeB1.id,
            isCanon: false,
            aiScore: 81,
        },
    })

    // --- The Ending War (Shim Sa-rang vs Ling Ling) ---

    // Ending 1: Open Ending (Shim Sa-rang) - Currently Winning
    const ending1 = await prisma.node.create({
        data: {
            content: "I left the file there. Some truths represent a burden too heavy for one timeline. I stepped off the manhole, and the window vanished forever. Or so I thought, until I saw the same window on my own apartment building.",
            type: 'TEXT',
            projectId: project.id,
            authorId: sarang.id,
            parentId: nodeA2.id,
            isCanon: true, // Currently winning
            aiScore: 95,
            isPaidBoost: true, // Add boost for high score (logic consistency)
        },
    })

    // Ending 2: Tragic Ending (Ling Ling) - Challenger
    const ending2 = await prisma.node.create({
        data: {
            content: "I reached for the file, but a hand grabbed my wrist. 'You shouldn't have seen that,' she whispered. The last thing I felt was the cold air as she pushed me out. The fall didn't kill me. The disappearance of the window did. I was trapped in the wall.",
            type: 'TEXT',
            projectId: project.id,
            authorId: lingling.id,
            parentId: nodeA2.id,
            isCanon: false,
            aiScore: 89,
            isPaidBoost: true,
        },
    })

    console.log('🌳 Tree Grown: 2 Branches, 2 Endings')

    // 5. Simulate Votes
    // Sa-rang has more votes (Winner)
    await prisma.vote.createMany({
        data: [
            { userId: smith.id, nodeId: ending1.id, value: 1 },
            { userId: kimura.id, nodeId: ending1.id, value: 1 },
            { userId: ashley.id, nodeId: ending1.id, value: 1 },
        ]
    })

    // Ling Ling has fewer votes (Challenger)
    await prisma.vote.createMany({
        data: [
            { userId: lingling.id, nodeId: ending2.id, value: 1 },
            { userId: pierre.id, nodeId: ending2.id, value: 1 },
        ]
    })

    // 6. Fix Contributions (Crucial for Equity View)
    const allNodes = [rootNode, nodeA1, nodeA2, nodeB1, nodeB2, ending1, ending2];
    for (const node of allNodes) {
        if (!node.authorId) continue;
        // Simple duplicate check before insert not needed as we wiped db, but for safety in future logic
        await prisma.contribution.create({
            data: {
                projectId: project.id,
                userId: node.authorId,
                role: node.authorId === smith.id ? 'Founder' : 'Contributor',
                percentage: 0 // Will be calculated by frontend or calc engine
            }
        }).catch(e => { }) // Ignore if already exists (author made multiple nodes)
    }

    console.log('🗳️ Votes Cast: Shim Sa-rang represents the Canon ending.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
