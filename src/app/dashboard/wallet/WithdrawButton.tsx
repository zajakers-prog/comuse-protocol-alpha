"use client";

import { ArrowUpRight } from "lucide-react";

export function WithdrawButton({ balance }: { balance: number }) {
    const handleWithdraw = () => {
        if (balance <= 0) {
            alert("No funds available to withdraw.");
            return;
        }
        alert(`Initiating withdrawal of $${balance.toFixed(2)} USDC to your connected wallet... \n(Simulation: Transfer Pending)`);
    };

    return (
        <button
            onClick={handleWithdraw}
            className="bg-white border border-gray-200 p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-sm group active:scale-95 duration-100"
        >
            <div className="p-3 bg-green-50 text-green-600 rounded-full group-hover:bg-green-100 transition-colors">
                <ArrowUpRight size={20} />
            </div>
            <span className="font-medium text-sm text-gray-700">Withdraw</span>
        </button>
    );
}
