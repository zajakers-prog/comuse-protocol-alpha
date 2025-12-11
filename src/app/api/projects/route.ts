import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const session = await auth();

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { title, description, type } = await req.json();

        if (!title || !description) {
            return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
        }

        const project = await prisma.project.create({
            data: {
                title,
                description,
                type: type || "STORY",
                author: {
                    connect: { email: session.user.email! },
                },
                equity: {
                    create: {
                        user: { connect: { email: session.user.email! } },
                        percentage: 100,
                        role: "Owner"
                    }
                }
            },
        });

        return NextResponse.json(project);
    } catch (error) {
        console.error("Error creating project:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
