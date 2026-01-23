import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { weaverAI } from "@/lib/services/weaver-ai";
import { sheetsLogger } from "@/lib/services/sheets-logger";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const session = await auth();

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        console.log("[API] Received Payload:", body);
        const { content, type } = body;

        if (!content) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        // 1. Analyze Seed (Spark)
        const analysis = await weaverAI.analyzeSeed(content);
        const projectTitle = analysis.suggestedTitle || "Untitled Project";

        // 2. Create Project with Root Node
        const project = await prisma.project.create({
            data: {
                title: projectTitle,
                description: content, // The spark content becomes the description/root node
                type: type || "IDEA",
                author: {
                    connect: { email: session.user.email! },
                },
                equity: {
                    create: {
                        user: { connect: { email: session.user.email! } },
                        percentage: 100,
                        role: "Owner"
                    }
                },
                nodes: {
                    create: {
                        content: content,
                        type: "TEXT",
                        summary: analysis.summary,
                        aiScore: analysis.totalIpIndex,
                        aiData: JSON.stringify(analysis),
                        author: { connect: { email: session.user.email! } },
                        isCanon: true
                    }
                }
            },
            include: {
                nodes: true, // Return nodes to frontend
                author: true
            }
        });

        // 3. Log to Sheets (CSV) - Fire and Forget
        sheetsLogger.logContribution({
            timestamp: new Date().toISOString(),
            creatorId: session.user.email!,
            seedText: content,
            totalIpIndex: analysis.totalIpIndex,
            scoutOpinion: analysis.scoutOpinion,
            status: analysis.status,
            genre: analysis.genre,
            keyStrategy: analysis.keyStrategy
        });

        return NextResponse.json(project);
    } catch (error) {
        console.error("Error creating project:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
