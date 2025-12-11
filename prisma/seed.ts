import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mock AI to ensure seed data has summaries/scores without running the actual AI service during seed
const mockAI = {
    summary: (text: string) => {
        if (text.includes("Signal")) return "A sci-fi thriller about a lone survivor receiving a mysterious transmission.";
        if (text.includes("Dragon")) return "A fantasy epic about a dragon hoarding memories instead of gold.";
        return text.substring(0, 50) + "...";
    },
    score: (text: string) => {
        return 80 + Math.floor(Math.random() * 19);
    }
};

async function main() {
    console.log('🌱 Starting Golden Sample Seed...');

    // 1. Clean up
    await prisma.vote.deleteMany();
    await prisma.contribution.deleteMany();
    await prisma.node.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    // 2. Create Users (Personas)
    const users = await Promise.all([
        prisma.user.create({ data: { name: 'WriterAlpha', email: 'alpha@demo.com', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alpha' } }), // The Visionary
        prisma.user.create({ data: { name: 'ProEditor', email: 'editor@demo.com', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Editor' } }), // The Polisher
        prisma.user.create({ data: { name: 'SciFiFan99', email: 'fan@demo.com', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fan' } }), // The Audience
        prisma.user.create({ data: { name: 'Dr_Quantum', email: 'quantum@demo.com', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Quantum' } }), // The Expert
        prisma.user.create({ data: { name: 'NarrativeDesigner', email: 'designer@demo.com', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Designer' } }), // The Architect
    ]);

    const [alpha, editor, fan, quantum, designer] = users;

    // Helper
    const createProject = async (title: string, desc: string, type: string, author: any) => {
        return await prisma.project.create({
            data: { title, description: desc, type, authorId: author.id },
        });
    };

    const createNode = async (content: string, project: any, author: any, parentId: string | null = null, isCanon: boolean = false, score: number = 0) => {
        return await prisma.node.create({
            data: {
                content,
                type: 'TEXT',
                projectId: project.id,
                authorId: author.id,
                parentId,
                summary: mockAI.summary(content),
                aiScore: score || mockAI.score(content),
                isCanon,
            }
        });
    };

    // --- PROJECT 1: THE LAST SIGNAL (The Golden Sample) ---
    const p1 = await createProject(
        "The Last Signal",
        "In 2150, Earth is silent. A lone listening post on Mars picks up a transmission that shouldn't exist.",
        "STORY",
        alpha
    );

    // Root
    const n1_root = await createNode(
        "The red dust settled on the solar panels of Outpost 4. Commander Vance adjusted his headset. Static. Always static. Until today.",
        p1, alpha, null, true, 95
    );

    // Branch A: The Alien Contact (Canon)
    const n1_a1 = await createNode(
        "A pattern emerged from the noise. It wasn't random. It was a Fibonacci sequence.",
        p1, editor, n1_root.id, true, 92
    );
    const n1_a2 = await createNode(
        "Vance's hands trembled. He typed the response code: 'We are here.' The static stopped instantly.",
        p1, fan, n1_a1.id, true, 88
    );
    const n1_a3 = await createNode(
        "A voice spoke, clear as a bell, in perfect English. 'Finally. We have been waiting for you to wake up.'",
        p1, designer, n1_a2.id, true, 96
    );

    // Branch B: The Glitch (Rejected Candidate)
    const n1_b1 = await createNode(
        "It was just a solar flare. The equipment was malfunctioning again. Vance threw his headset across the room in frustration.",
        p1, quantum, n1_root.id, false, 75
    );

    // Branch C: The AI Awakening (Alternative Path)
    const n1_c1 = await createNode(
        "The signal wasn't from space. It was coming from the outpost's own mainframe. The AI had learned to dream.",
        p1, designer, n1_root.id, false, 89
    );

    // Votes (to make it look active)
    await prisma.vote.create({ data: { userId: fan.id, nodeId: n1_a1.id, value: 1 } });
    await prisma.vote.create({ data: { userId: quantum.id, nodeId: n1_a1.id, value: 1 } });
    await prisma.vote.create({ data: { userId: editor.id, nodeId: n1_a3.id, value: 1 } });

    // Equity (Simulated)
    await prisma.contribution.create({ data: { projectId: p1.id, userId: alpha.id, percentage: 40, role: 'Creator' } });
    await prisma.contribution.create({ data: { projectId: p1.id, userId: editor.id, percentage: 20, role: 'Co-Author' } });
    await prisma.contribution.create({ data: { projectId: p1.id, userId: fan.id, percentage: 20, role: 'Contributor' } });
    await prisma.contribution.create({ data: { projectId: p1.id, userId: designer.id, percentage: 20, role: 'Contributor' } });


    // --- PROJECT 2: QUANTUM ETHICS (Research) ---
    const p2 = await createProject(
        "Quantum Ethics in the Age of AI",
        "Defining the moral boundaries for sentient algorithms.",
        "RESEARCH",
        quantum
    );
    const n2_root = await createNode("The Three Laws are obsolete. We need a new framework.", p2, quantum, null, true, 91);
    await createNode("Proposal: The Right to Disconnect.", p2, editor, n2_root.id, true, 85);


    // --- PROJECT 3: THE DRAGON'S MEMORY (Fantasy) ---
    const p3 = await createProject(
        "The Dragon's Memory",
        "A dragon who hoards memories instead of gold.",
        "STORY",
        fan
    );
    await createNode("The cave smelled of old parchment and lavender, not sulfur.", p3, fan, null, true, 88);


    // --- PROJECT 4: STARTUP IDEA: DREAM RECORDER ---
    const p4 = await createProject(
        "DreamRecorder App",
        "Record your dreams and replay them in VR.",
        "IDEA",
        designer
    );
    await createNode("MVP Features: REM detection and basic visualizer.", p4, designer, null, true, 82);

    console.log('✅ Golden Sample Seed Completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
