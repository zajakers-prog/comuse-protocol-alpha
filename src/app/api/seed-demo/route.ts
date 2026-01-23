import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const demoUserEmail = "demo@comuse.app";

        // 1. Ensure Demo Author Exists
        const author = await prisma.user.upsert({
            where: { email: demoUserEmail },
            update: {},
            create: {
                email: demoUserEmail,
                name: "Jason (Founder)",
            }
        });

        // 2. Define Demo Projects
        const projects = [
            {
                title: "Chronicles of the Glass City",
                description: "A cyberpunk noir set in a city made entirely of transparent smart-glass, where privacy is the ultimate currency.",
                type: "NOVEL",
                content: "The rain didn't wash the city clean; it just made the glass slicker. From my office on the 404th floor, I could see them all—millions of lives played out in transparent cages...",
                genre: "Sci-Fi / Noir",
                keyStrategy: "Atmospheric World Building"
            },
            {
                title: "Quantum Consciousness Protocol",
                description: "Collaborative research paper exploring the intersection of quantum mechanics and human cognition. Seeking peer review on Chapter 3.",
                type: "RESEARCH",
                content: "# Abstract\n\nWe propose that human consciousness arises from microtubule quantum vibrations. This project aims to map the 'Orch-OR' theory against recent neurological findings...",
                genre: "Academic / Science",
                keyStrategy: "Hypothesis Testing"
            },
            {
                title: "Neon Heartbeat (Synthwave Ballad)",
                description: "A track needing lyrics and bridge composition. Focusing on retro-future aesthetics.",
                type: "SONGWRITING",
                content: "[Intro]\n(Am - F - C - G)\n\n[Verse 1]\nDriving down the highway of light\nChasing the ghost of the night\nYour voice is static on the radio\nWhere you went, I'll never know...\n\n[Chorus]\n(Need lyrics here - something about 'digital love')",
                genre: "Music / Lyrics",
                keyStrategy: "Hook Development"
            }
        ];

        // 3. Insert Projects
        const results = [];
        for (const p of projects) {
            // Check if exists to avoid dupes
            const existing = await prisma.project.findFirst({
                where: { title: p.title, authorId: author.id }
            });

            if (!existing) {
                const project = await prisma.project.create({
                    data: {
                        title: p.title,
                        description: p.description,
                        type: p.type,
                        authorId: author.id,
                        nodes: {
                            create: {
                                content: p.content,
                                authorId: author.id,
                                summary: p.description,
                                aiScore: 8.5, // Fake high score for demo
                                genre: p.genre,
                                keyStrategy: p.keyStrategy,
                                status: "APPROVED"
                            }
                        }
                    }
                });
                results.push(`Created: ${p.title}`);
            } else {
                results.push(`Skipped (Exists): ${p.title}`);
            }
        }

        return NextResponse.json({
            success: true,
            message: "Demo data seeded successfully",
            details: results
        });

    } catch (error) {
        console.error("Seeding failed:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
