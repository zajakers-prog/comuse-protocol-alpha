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
        const { content, projectId, parentId, type } = await req.json();

        if (!content || !projectId || !type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Analyze Contribution (Builder Role)
        const analysis = await weaverAI.analyzeSeed(content);

        // 2. Create Node
        const node = await prisma.node.create({
            data: {
                content,
                type: type || "TEXT",
                summary: analysis.summary,
                aiScore: analysis.totalIpIndex,
                aiData: JSON.stringify(analysis),
                project: { connect: { id: projectId } },
                author: { connect: { email: session.user.email! } },
                parent: parentId ? { connect: { id: parentId } } : undefined,
            },
        });

        // 3. Log to Sheets (Role B - Builder)
        sheetsLogger.logContribution({
            role: "B",
            timestamp: new Date().toISOString(),
            creatorId: session.user.email!,
            seedText: content,
            totalIpIndex: analysis.totalIpIndex,
            scoutOpinion: analysis.scoutOpinion,
            status: analysis.status,
            genre: analysis.genre,
            keyStrategy: analysis.keyStrategy
        });

        return NextResponse.json(node);
    } catch (error) {
        console.error("Error creating node:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
