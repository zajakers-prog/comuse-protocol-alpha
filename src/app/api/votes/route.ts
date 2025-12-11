import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const session = await auth();

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { nodeId } = await req.json();
        const userId = (session.user as any).id;

        if (!nodeId) {
            return NextResponse.json({ error: "Node ID is required" }, { status: 400 });
        }

        // Check if vote exists
        const existingVote = await prisma.vote.findUnique({
            where: {
                userId_nodeId: {
                    userId,
                    nodeId,
                },
            },
        });

        if (existingVote) {
            // Toggle vote (remove if exists)
            await prisma.vote.delete({
                where: { id: existingVote.id },
            });
            return NextResponse.json({ voted: false });
        } else {
            // Create vote
            await prisma.vote.create({
                data: {
                    user: { connect: { id: userId } },
                    node: { connect: { id: nodeId } },
                    value: 1,
                },
            });
            return NextResponse.json({ voted: true });
        }
    } catch (error) {
        console.error("Error voting:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
