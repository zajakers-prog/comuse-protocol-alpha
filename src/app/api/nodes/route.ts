import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ai } from "@/lib/ai";

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

        // Generate AI metadata
        const summary = await ai.generateSummary(content);
        const aiScore = await ai.evaluateQuality(content);

        const node = await prisma.node.create({
            data: {
                content,
                summary,
                aiScore,
                type, // "TEXT", "AUDIO", etc.
                project: { connect: { id: projectId } },
                author: { connect: { email: session.user.email! } },
                parent: parentId ? { connect: { id: parentId } } : undefined,
            },
        });

        return NextResponse.json(node);
    } catch (error) {
        console.error("Error creating node:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
