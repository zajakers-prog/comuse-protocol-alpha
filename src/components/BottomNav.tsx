"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PenTool, User } from "lucide-react";

export function BottomNav() {
    const pathname = usePathname();

    const tabs = [
        { name: "Home", href: "/", icon: Home },
        { name: "Write", href: "/projects/create", icon: PenTool },
        { name: "My Equity", href: "/users/me", icon: User }, // Redirects to profile usually
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
            <div className="flex justify-around items-center h-16">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    const Icon = tab.icon;
                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? "text-black" : "text-gray-400"}`}
                        >
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{tab.name}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    );
}
