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

        // 1. Real AI Analysis
        // Run in parallel for speed
        const [summary, aiScore] = await Promise.all([
            ai.generateSummary(content),
            ai.evaluateQuality(content)
        ]);

        // 2. Auto-Boost Logic (Business Logic MVP)
        // If AI score is high (>85), automatically apply "Quality Boost" (Simulating Paid Boost for MVP)
        // Or if the content length is substantial (>1000 chars), give a boost.
        const isPaidBoost = aiScore > 85;

        // 3. Create Node
        const node = await prisma.node.create({
            data: {
                content,
                summary,
                aiScore,
                isPaidBoost, // High quality gets boosted visibility
                type,
                project: { connect: { id: projectId } },
                author: {
                    connectOrCreate: {
                        where: { email: session.user.email! },
                        create: {
                            email: session.user.email!,
                            name: session.user.name || "Anonymous Builder",
                            image: session.user.image,
                        }
                    }
                },
                parent: parentId ? { connect: { id: parentId } } : undefined,
            },
        });

        // 4. Update Project Timestamp (to bump it to top of feed)
        await prisma.project.update({
            where: { id: projectId },
            data: { updatedAt: new Date() }
        });

        return NextResponse.json(node);
    } catch (error) {
        console.error("Error creating node:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
