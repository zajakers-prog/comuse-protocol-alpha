
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

export async function POST(req: Request) {
    try {
        const { nodeId } = await req.json();

        if (!nodeId) return NextResponse.json({ error: "Node ID required" }, { status: 400 });

        // 1. Trace back the path from current node to root
        const path = [];
        let currentId = nodeId;

        while (currentId) {
            const node = await prisma.node.findUnique({
                where: { id: currentId },
                select: { id: true, content: true, parentId: true, author: { select: { name: true } } }
            });

            if (!node) break;
            path.unshift(node); // Add to beginning (to correct order)
            currentId = node.parentId;
        }

        // 2. Construct the full story context
        const fullStory = path.map(n => `[Author: ${n.author.name || "Anonymous"}]\n${n.content}`).join("\n\n---\n\n");

        // 3. Fake Brain Fallback (if no key)
        if (!openai) {
            await new Promise(r => setTimeout(r, 1000));
            return NextResponse.json({
                summary: "[Simulated AI] The story follows a protagonist discovering a mysterious window that reveals parallel realities...",
                issues: [
                    "⚠️ [Simulation] Plot consistency check is unavailable without OPENAI_API_KEY.",
                    "⚠️ [Simulation] Please configure OpenAI to spot real errors."
                ]
            });
        }

        // 4. Ask AI for Analysis
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Or gpt-4-turbo for better logic
            messages: [
                {
                    role: "system",
                    content: `You are an expert Story Editor. Analyze the provided story path.
                    
                    Return a JSON object with two fields:
                    1. "summary": A concise 3-sentence summary of the entire plot flow so far.
                    2. "issues": A bulleted list of consistency errors (e.g., characters appearing after death, sudden tone shifts, plot holes). If none, say "No major issues found."`
                },
                {
                    role: "user",
                    content: fullStory
                }
            ],
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(response.choices[0].message.content || "{}");

        return NextResponse.json(result);

    } catch (error) {
        console.error("Analysis Error:", error);
        return NextResponse.json({ error: "Failed to analyze path" }, { status: 500 });
    }
}
