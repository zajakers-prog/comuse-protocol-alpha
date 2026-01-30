import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Wallet, DollarSign, ArrowUpRight, History } from "lucide-react";

export default async function WalletPage() {
    const session = await auth();
    if (!session?.user) redirect("/");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email! },
        select: {
            id: true,
            name: true,
            walletAddress: true,
            pendingBalance: true
        }
    });

    if (!user) redirect("/");

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <header className="mb-8">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Wallet className="text-indigo-600" />
                    My IP Vault
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    Manage your earnings from story contributions.
                </p>
            </header>

            {/* Balance Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-purple-800 rounded-2xl p-6 text-white shadow-xl mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

                <div className="relative z-10">
                    <p className="text-indigo-200 text-sm font-medium mb-1">Total Pending Revenue</p>
                    <div className="text-4xl font-bold flex items-baseline gap-1">
                        <span className="text-2xl opacity-70">$</span>
                        {user.pendingBalance?.toFixed(2) || "0.00"}
                        <span className="text-base font-normal opacity-70 ml-2">USDC</span>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-indigo-300 uppercase tracking-wider mb-1">Your Virtual Wallet</p>
                            <p className="font-mono text-sm bg-black/20 py-1 px-2 rounded flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                                {user.walletAddress || "Generating on first earnings..."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <button className="bg-white border border-gray-200 p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-sm group">
                    <div className="p-3 bg-green-50 text-green-600 rounded-full group-hover:bg-green-100 transition-colors">
                        <ArrowUpRight size={20} />
                    </div>
                    <span className="font-medium text-sm text-gray-700">Withdraw</span>
                </button>
                <button className="bg-white border border-gray-200 p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-sm group">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-100 transition-colors">
                        <History size={20} />
                    </div>
                    <span className="font-medium text-sm text-gray-700">History</span>
                </button>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
                <div className="text-blue-600 mt-1">
                    <DollarSign size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-blue-800 text-sm">Automated Settlement</h3>
                    <p className="text-blue-600 text-xs leading-relaxed mt-1">
                        When a story branch is licensed (e.g. by HBO, Netflix), revenue is automatically distributed to all Canon contributors based on their stake. Funds appear here instantly.
                    </p>
                </div>
            </div>
        </div>
    );
}
