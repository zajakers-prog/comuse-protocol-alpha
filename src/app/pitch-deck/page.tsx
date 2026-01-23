"use client";

import { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, Terminal, GitBranch, ShieldCheck, Users, TrendingUp, Zap, User } from "lucide-react";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default function PitchDeckPage() {
    const [currentSlide, setCurrentSlide] = useState(0);

    const totalSlides = 10;

    const nextSlide = () => {
        if (currentSlide < totalSlides - 1) setCurrentSlide(prev => prev + 1);
    };

    const prevSlide = () => {
        if (currentSlide > 0) setCurrentSlide(prev => prev - 1);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight" || e.key === "Space") nextSlide();
            if (e.key === "ArrowLeft") prevSlide();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentSlide]);

    return (
        <div className="h-screen w-screen bg-black text-white overflow-hidden font-sans relative">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black z-0 pointer-events-none" />

            {/* Slide Container */}
            <div className="relative z-10 w-full h-full flex items-center justify-center p-8 md:p-16">

                {/* 1. VISION */}
                {currentSlide === 0 && (
                    <SlideWrapper>
                        <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-mono mb-4">
                                <Terminal size={14} />
                                <span>PROTOCOL V1.0</span>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-serif font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-gray-400">
                                CoMuse
                            </h1>
                            <p className="text-2xl md:text-3xl text-gray-400 font-light max-w-2xl mx-auto">
                                The Global <span className="text-blue-400 font-medium">IP Factory</span>.
                            </p>
                            <div className="pt-12 text-gray-500 text-sm uppercase tracking-widest font-mono">
                                Press [Right Arrow] to Start
                            </div>
                        </div>
                    </SlideWrapper>
                )}

                {/* 2. PROBLEM */}
                {currentSlide === 1 && (
                    <SlideWrapper>
                        <SlideHeader title="The Problem" subtitle="Why great stories die" />
                        <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl w-full">
                            <div className="space-y-6">
                                <h2 className="text-4xl font-bold leading-tight">
                                    Creation is <span className="text-red-500">Isolated</span>.
                                    <br />
                                    Value is <span className="text-red-500">Lost</span>.
                                </h2>
                                <p className="text-xl text-gray-400 leading-relaxed">
                                    Today, a writer builds a world alone. If they hit a block, the project dies.
                                    Fan fiction happens in silos, completely disconnected from the original IP's value chain.
                                </p>
                            </div>
                            <div className="p-8 bg-gray-900/50 rounded-2xl border border-red-500/20 flex flex-col items-center justify-center h-64">
                                <span className="text-6xl mb-4">📉</span>
                                <span className="text-red-400 font-mono text-lg">99% of creative WIPs are abandoned.</span>
                            </div>
                        </div>
                    </SlideWrapper>
                )}

                {/* 3. SOLUTION */}
                {currentSlide === 2 && (
                    <SlideWrapper>
                        <SlideHeader title="The Solution" subtitle="A new way to build lore" />
                        <div className="text-center space-y-8 max-w-4xl">
                            <h2 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                                The Branching Multiverse Model
                            </h2>
                            <p className="text-2xl text-gray-300 font-light leading-relaxed">
                                We turn linear stories into <span className="text-white font-medium">Evolutionary Trees</span>.
                                Anyone can branch an existing story. If the community votes for it, it becomes canon in that timeline.
                            </p>
                            <div className="grid grid-cols-3 gap-6 pt-8">
                                <FeatureBox icon={<GitBranch className="text-blue-400" />} title="Branching" desc="Fork any narrative path" />
                                <FeatureBox icon={<Users className="text-purple-400" />} title="Voting" desc="Community consensus" />
                                <FeatureBox icon={<TrendingUp className="text-green-400" />} title="Equity" desc="Contributors earn shares" />
                            </div>
                        </div>
                    </SlideWrapper>
                )}

                {/* 4. WORKFLOW (ABC) */}
                {currentSlide === 3 && (
                    <SlideWrapper>
                        <SlideHeader title="The Protocol" subtitle="A-B-C Workflow" />
                        <div className="flex flex-col md:flex-row gap-4 w-full max-w-6xl items-stretch justify-center h-[50vh]">
                            {/* A */}
                            <div className="flex-1 bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-8 rounded-2xl flex flex-col relative group hover:border-blue-500/50 transition-colors">
                                <div className="absolute top-4 right-4 text-4xl font-black text-gray-800 group-hover:text-blue-900/50">A</div>
                                <h3 className="text-2xl font-bold text-blue-400 mb-2">The Spark</h3>
                                <p className="text-gray-400 text-sm mb-4">Original Creator</p>
                                <p className="text-gray-300">Sets the initial premise, world rules, and "Seed" text.</p>
                            </div>

                            <div className="flex items-center justify-center text-gray-600"><ArrowRight /></div>

                            {/* B */}
                            <div className="flex-1 bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-8 rounded-2xl flex flex-col relative group hover:border-purple-500/50 transition-colors">
                                <div className="absolute top-4 right-4 text-4xl font-black text-gray-800 group-hover:text-purple-900/50">B</div>
                                <h3 className="text-2xl font-bold text-purple-400 mb-2">The Builder</h3>
                                <p className="text-gray-400 text-sm mb-4">Contributor</p>
                                <p className="text-gray-300">Expands the lore, adds chapters, or creates alternative timelines.</p>
                            </div>

                            <div className="flex items-center justify-center text-gray-600"><ArrowRight /></div>

                            {/* C */}
                            <div className="flex-1 bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-8 rounded-2xl flex flex-col relative group hover:border-green-500/50 transition-colors">
                                <div className="absolute top-4 right-4 text-4xl font-black text-gray-800 group-hover:text-green-900/50">C</div>
                                <h3 className="text-2xl font-bold text-green-400 mb-2">The Finisher</h3>
                                <p className="text-gray-400 text-sm mb-4">Editor / Producer</p>
                                <p className="text-gray-300">Polishes, finalizes, and packages the IP for monetization.</p>
                            </div>
                        </div>
                    </SlideWrapper>
                )}

                {/* 5. TECH I (Weaver) */}
                {currentSlide === 4 && (
                    <SlideWrapper>
                        <SlideHeader title="Technology I" subtitle="Weaver AI Agent" />
                        <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl w-full">
                            <div className="relative">
                                <div className="absolute -inset-4 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
                                <div className="relative bg-black border border-blue-500/30 p-8 rounded-2xl aspect-square flex flex-col items-center justify-center text-center">
                                    <Zap size={64} className="text-blue-400 mb-6" />
                                    <div className="text-mono text-sm text-blue-300 mb-2">analyzing_content...</div>
                                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[70%]" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h2 className="text-4xl font-bold">The <span className="text-blue-400">Value Scout</span>.</h2>
                                <p className="text-xl text-gray-400 leading-relaxed">
                                    Our proprietary AI agent, "Weaver," analyzes every submission in real-time.
                                </p>
                                <ul className="space-y-4 text-gray-300">
                                    <li className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                                        Scores novelty and market potential.
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                                        Tags genre and key strategies automatically.
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                                        Reduces friction for human reviewers.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </SlideWrapper>
                )}

                {/* 6. TECH II (Ledger) */}
                {currentSlide === 5 && (
                    <SlideWrapper>
                        <SlideHeader title="Technology II" subtitle="Immutable Audit Ledger" />
                        <div className="max-w-4xl w-full text-center space-y-12">
                            <h2 className="text-4xl font-bold">
                                "Provenance is <span className="text-green-400">Power</span>."
                            </h2>
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 font-mono text-left text-sm text-gray-400 overflow-hidden shadow-2xl">
                                <p className="text-green-500">$ &gt; connect_ledger --secure</p>
                                <p className="mb-4">Connected to CoMuse_Protocol_v1 [Hash: 0x7f...3a]</p>

                                <div className="border-l-2 border-gray-700 pl-4 space-y-2">
                                    <p><span className="text-blue-400">Block #10243</span>: User <span className="text-white">@Alice</span> created Root A.</p>
                                    <p><span className="text-blue-400">Block #10244</span>: User <span className="text-white">@Bob</span> forked to Branch B1.</p>
                                    <p><span className="text-blue-400">Block #10245</span>: <span className="text-purple-400">Weaver AI</span> verified contribution (Score: 8.5).</p>
                                </div>
                            </div>
                            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                                Every simplified contribution is tracked. When the IP is sold (Netflix option, Book deal), royalties are distributed automatically based on this immutable graph.
                            </p>
                        </div>
                    </SlideWrapper>
                )}

                {/* 7. ECONOMICS */}
                {currentSlide === 6 && (
                    <SlideWrapper>
                        <SlideHeader title="Economic Model" subtitle="Confidence Staking" />
                        <div className="grid md:grid-cols-2 gap-16 items-center max-w-5xl">
                            <div className="space-y-8">
                                <h2 className="text-4xl font-bold">Skin in the Game.</h2>
                                <p className="text-xl text-gray-400">
                                    To prevent spam and ensure quality, contributors must stake tokens to participate in high-value projects.
                                </p>
                                <div className="space-y-4">
                                    <div className="p-4 border border-green-500/30 bg-green-900/10 rounded-lg">
                                        <h4 className="font-bold text-green-400">Successful Merge</h4>
                                        <p className="text-sm text-gray-400">Stake returned + Equity earned.</p>
                                    </div>
                                    <div className="p-4 border border-red-500/30 bg-red-900/10 rounded-lg">
                                        <h4 className="font-bold text-red-400">Spam / Low Quality</h4>
                                        <p className="text-sm text-gray-400">Stake slashed (burned).</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-center justify-center">
                                <ShieldCheck size={120} className="text-yellow-500 mb-8" />
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-white mb-2">Quality &gt; Quantity</div>
                                    <div className="text-gray-500">Filter noise through economic alignment.</div>
                                </div>
                            </div>
                        </div>
                    </SlideWrapper>
                )}

                {/* 8. MARKET */}
                {currentSlide === 7 && (
                    <SlideWrapper>
                        <SlideHeader title="Market Opportunity" subtitle="Unlocking the Creator Economy" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl text-center">
                            <MarketStat value="$104B" label="Creator Economy Size" />
                            <MarketStat value="+200%" label="YoY Growth in Fanfic" />
                            <MarketStat value="Zero" label="Current Liquidity for Ideas" />
                        </div>
                        <p className="text-2xl text-gray-300 mt-16 max-w-3xl text-center font-light">
                            "We are building the <span className="text-white font-medium">NASDAQ</span> for Story Inputs."
                        </p>
                    </SlideWrapper>
                )}

                {/* 9. FOUNDER */}
                {currentSlide === 8 && (
                    <SlideWrapper>
                        <SlideHeader title="The Founder" subtitle="Execution Machine" />
                        <div className="flex flex-col items-center justify-center space-y-8">
                            <div className="w-40 h-40 rounded-full bg-gray-800 border-4 border-white/10 overflow-hidden flex items-center justify-center">
                                <User size={64} className="text-gray-500" />
                            </div>
                            <h2 className="text-4xl font-bold">Jaesung "Jason" Lee</h2>
                            <div className="flex gap-4">
                                <span className="px-4 py-1 rounded-full bg-white/10 text-white text-sm">Product Visionary</span>
                                <span className="px-4 py-1 rounded-full bg-white/10 text-white text-sm">12 Years Exp</span>
                            </div>
                            <p className="text-xl text-gray-400 max-w-2xl text-center leading-relaxed">
                                "I don't just dream. I build. With 12 years of business execution background, I know how to turn abstract protocols into profitable products."
                            </p>
                        </div>
                    </SlideWrapper>
                )}

                {/* 10. ROADMAP */}
                {currentSlide === 9 && (
                    <SlideWrapper>
                        <SlideHeader title="Roadmap" subtitle="From Pilot to Protocol" />
                        <div className="space-y-8 w-full max-w-4xl relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                            <RoadmapItem phase="Phase 1" date="Now" title="Web2 Pilot (MVP)" desc="Centralized AI arbiter, standard DB, proving the UX." align="left" active />
                            <RoadmapItem phase="Phase 2" date="Q3 2026" title="Token Integration" desc="Staking mechanism, wallet login, reward distribution." align="right" />
                            <RoadmapItem phase="Phase 3" date="2027+" title="L2 Protocol" desc="Fully decentralized CoMuse Chain. The infrastructure for all IP generation." align="left" />
                        </div>
                    </SlideWrapper>
                )}

            </div>

            {/* Navigation Controls */}
            <div className="absolute bottom-8 right-8 flex gap-4 z-20">
                <button
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    className="p-4 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all backdrop-blur-md"
                >
                    <ArrowLeft />
                </button>
                <div className="flex items-center px-4 font-mono text-gray-400">
                    {currentSlide + 1} / {totalSlides}
                </div>
                <button
                    onClick={nextSlide}
                    disabled={currentSlide === totalSlides - 1}
                    className="p-4 rounded-full bg-white text-black hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
                >
                    <ArrowRight />
                </button>
            </div>
        </div>
    );
}

// Subcomponents

function SlideWrapper({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
            {children}
        </div>
    );
}

function SlideHeader({ title, subtitle }: { title: string, subtitle: string }) {
    return (
        <div className="text-center mb-16">
            <h3 className="text-blue-400 font-mono text-sm uppercase tracking-widest mb-2">{title}</h3>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white">{subtitle}</h2>
        </div>
    );
}

function FeatureBox({ icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="p-6 bg-white/5 border border-white/10 rounded-xl text-center hover:bg-white/10 transition-colors">
            <div className="flex justify-center mb-4">{icon}</div>
            <h4 className="text-lg font-bold text-white mb-1">{title}</h4>
            <div className="text-sm text-gray-400">{desc}</div>
        </div>
    );
}

function MarketStat({ value, label }: { value: string, label: string }) {
    return (
        <div className="p-8 border border-gray-800 bg-gradient-to-br from-gray-900 to-black rounded-2xl">
            <div className="text-5xl md:text-7xl font-bold text-white mb-2">{value}</div>
            <div className="text-gray-500 uppercase tracking-wide text-sm">{label}</div>
        </div>
    );
}

function RoadmapItem({ phase, date, title, desc, align, active }: any) {
    const isLeft = align === 'left';
    return (
        <div className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active`}>
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                {active ? <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" /> : <div className="w-3 h-3 bg-gray-600 rounded-full" />}
            </div>
            <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-xl border border-white/10 bg-white/5 ${active ? 'border-blue-500/50 shadow-lg shadow-blue-500/10' : ''}`}>
                <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white">{phase}</span>
                    <time className="font-mono text-xs text-gray-400">{date}</time>
                </div>
                <div className="text-lg font-bold text-blue-200 mb-2">{title}</div>
                <div className="text-gray-400 text-sm">{desc}</div>
            </div>
        </div>
    );
}
