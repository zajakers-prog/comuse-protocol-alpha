import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRandomWallet } from "@/lib/crypto";

// Revenue Distribution Simulation
export async function POST(req: Request) {
    try {
        const { projectId, revenueAmount } = await req.json();

        if (!projectId || !revenueAmount) {
            return NextResponse.json({ error: "Missing projectId or revenueAmount" }, { status: 400 });
        }

        console.log(`💰 Processing Settlement: Project ${projectId}, Amount $${revenueAmount}`);

        // 1. Fetch Project & Canon Nodes
        // We only distribute revenue to "Canon" contributors (official story line).
        // (In a real protocol, "Branch" authors might get a smaller cut too).
        const canonNodes = await prisma.node.findMany({
            where: {
                projectId: projectId,
                isCanon: true
            },
            include: { author: true }
        });

        if (canonNodes.length === 0) {
            return NextResponse.json({ error: "No canon nodes found for this project." }, { status: 404 });
        }

        // 2. Calculate Shares
        // Model: Equal split per canon node.
        // If an author has 3 nodes and total nodes are 10, they get 30%.
        const totalNodes = canonNodes.length;
        const valuePerNode = revenueAmount / totalNodes;

        console.log(`📊 Total Nodes: ${totalNodes}, Value per Node: $${valuePerNode}`);

        // 3. Aggregate by Author
        const distribution: Record<string, { amount: number, authorId: string, authorName: string }> = {};

        for (const node of canonNodes) {
            const authorId = node.authorId;
            if (!distribution[authorId]) {
                distribution[authorId] = {
                    amount: 0,
                    authorId: authorId,
                    authorName: node.author.name || "Anonymous"
                };
            }
            distribution[authorId].amount += valuePerNode;
        }

        // 4. Update Wallets & Balances (Transaction)
        const settlementDetails = [];

        await prisma.$transaction(async (tx) => {
            for (const authorId in distribution) {
                const share = distribution[authorId];

                // Get current user to check wallet
                const user = await tx.user.findUnique({ where: { id: authorId } });
                if (!user) continue;

                // Ensure Wallet Exists
                let walletAddress = user.walletAddress;
                if (!walletAddress) {
                    const newWallet = createRandomWallet();
                    walletAddress = newWallet.address;
                    // Note: We are NOT saving private key here for security simplicity in MVP.
                    // In real app, user creates their own wallet or we use a custodial service properly.
                }

                // Update User
                await tx.user.update({
                    where: { id: authorId },
                    data: {
                        pendingBalance: { increment: share.amount },
                        walletAddress: walletAddress
                    }
                });

                settlementDetails.push({
                    author: share.authorName,
                    address: walletAddress,
                    amount: share.amount,
                    sharePct: (share.amount / revenueAmount) * 100
                });
            }

            // 5. Create Log
            await tx.settlementLog.create({
                data: {
                    projectId,
                    totalAmount: Number(revenueAmount),
                    details: JSON.stringify(settlementDetails)
                }
            });
        });

        return NextResponse.json({
            success: true,
            totalDistributed: revenueAmount,
            beneficiaries: settlementDetails.length,
            details: settlementDetails
        });

    } catch (error) {
        console.error("Settlement Error:", error);
        return NextResponse.json({ error: "Settlement failed" }, { status: 500 });
    }
}
