"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { PenTool, LogOut, User } from "lucide-react";

export function Navbar() {
    const { data: session } = useSession();

    return (
        <nav className="border-b border-gray-200 bg-white">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="text-2xl font-serif font-bold text-gray-900 tracking-tight">
                    CoMuse
                </Link>

                <div className="flex items-center gap-4">
                    {session ? (
                        <>
                            <Link
                                href="/projects/create"
                                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors text-sm font-medium"
                            >
                                <PenTool size={16} />
                                Start a Story
                            </Link>
                            <div className="flex items-center gap-4 ml-4">
                                <span className="text-sm text-gray-600 hidden sm:block">
                                    {session.user?.name}
                                </span>
                                <button
                                    onClick={() => signOut()}
                                    className="p-2 text-gray-500 hover:text-gray-900 transition-colors"
                                    title="Sign Out"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <button
                            onClick={() => signIn()}
                            className="px-4 py-2 text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
                        >
                            Sign In
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}
