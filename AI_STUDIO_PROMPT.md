# CoMuse Project Context

**Project Name**: CoMuse (formerly StoryForge)
**Description**: A collaborative content creation platform ("GitHub for Stories") where users create projects (Stories, Ideas, Research) and contribute via a branching node system.
**Tech Stack**: Next.js 16 (App Router), Prisma (SQLite), NextAuth v5, Tailwind CSS, @xyflow/react.

**Key Features**:
1. **Muse Graph**: Visualizes the branching structure of contributions.
2. **Read Mode**: Stitches nodes into a seamless linear reading experience.
3. **AI Engine**: Auto-summarizes nodes and assigns quality scores (Stubbed).
4. **Smart Feed**: Ranks projects by AI score and activity.
5. **Equity View**: Calculates ownership % based on accepted contributions.
6. **Multi-language**: Supports mixed-language projects.

**Current Status**: MVP Complete.

---

# Codebase

Here is the current source code for the core features. Use this context to answer questions or continue development.


## File: prisma/schema.prisma
```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  projects      Project[] // Projects created by user
  nodes         Node[]    // Nodes created by user
  contributions Contribution[] // Equity in projects
  votes         Vote[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model VerificationToken {
  identifier String
  token      String
  expires    DateTime

  @@unique([identifier, token])
}

model Project {
  id          String   @id @default(cuid())
  title       String
  description String?
  type        String   @default("STORY") // STORY, IDEA, RESEARCH
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  nodes       Node[]
  equity      Contribution[] // Equity distribution
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Node {
  id          String   @id @default(cuid())
  content     String
  summary     String?  // AI generated TL;DR
  type        String   // TEXT, AUDIO, IMAGE, etc.
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id])
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  parentId    String?
  parent      Node?    @relation("Tree", fields: [parentId], references: [id])
  children    Node[]   @relation("Tree")
  votes       Vote[]
  aiScore     Float?   // AI Quality Score
  isCanon     Boolean  @default(false)
  isPaidBoost Boolean  @default(false)
  createdAt   DateTime @default(now())
}

model Contribution {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id])
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  percentage Float   // Equity percentage
  role      String   // e.g., "Co-Author", "Editor"
  createdAt DateTime @default(now())

  @@unique([projectId, userId])
}

model Vote {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  nodeId    String
  node      Node     @relation(fields: [nodeId], references: [id])
  value     Int      // 1 for upvote, -1 for downvote
  createdAt DateTime @default(now())

  @@unique([userId, nodeId])
}


```

## File: package.json
```json
{
  "name": "comuse",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@auth/prisma-adapter": "^2.11.1",
    "@prisma/client": "5.22.0",
    "@types/dagre": "^0.7.53",
    "@xyflow/react": "^12.10.0",
    "clsx": "^2.1.1",
    "dagre": "^0.8.5",
    "date-fns": "^4.1.0",
    "lucide-react": "^0.555.0",
    "next": "16.0.5",
    "next-auth": "^5.0.0-beta.30",
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "tailwind-merge": "^3.4.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.0.5",
    "prisma": "5.22.0",
    "tailwindcss": "^4",
    "ts-node": "^10.9.2",
    "tsx": "^4.21.0",
    "typescript": "^5"
  }
}

```

## File: src/auth.ts
```ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
        Credentials({
            name: "Test Login",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "test@example.com" },
            },
            async authorize(credentials) {
                if (!credentials?.email) return null;
                const email = credentials.email as string;

                // Find or create user for testing
                let user = await prisma.user.findUnique({ where: { email } });
                if (!user) {
                    user = await prisma.user.create({
                        data: { email, name: email.split("@")[0] }
                    });
                }
                return user;
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async session({ session, token }) {
            if (session.user && token.sub) {
                (session.user as any).id = token.sub;
            }
            return session;
        },
    },
});

```

## File: src/lib/ai.ts
```ts
export const ai = {
    /**
     * Generates a 1-sentence summary of the provided text.
     * (Stub: Returns a mock summary based on content length)
     */
    generateSummary: async (text: string): Promise<string> => {
        // Simulate API latency
        await new Promise((resolve) => setTimeout(resolve, 500));

        const words = text.split(" ");
        if (words.length < 10) return text;

        const keywords = words.filter(w => w.length > 5).slice(0, 3).join(", ");
        return `A story about ${keywords}... exploring themes of mystery and adventure.`;
    },

    /**
     * Evaluates the quality of the text and returns a score from 0 to 100.
     * (Stub: Returns a random high score for demo purposes)
     */
    evaluateQuality: async (text: string): Promise<number> => {
        // Simulate API latency
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Deterministic "random" score based on text length to feel real but consistent
        const baseScore = 70;
        const lengthBonus = Math.min(text.length / 10, 20);
        const randomVariance = Math.floor(Math.random() * 10);

        return Math.min(Math.floor(baseScore + lengthBonus + randomVariance), 99);
    }
};

```

## File: src/app/page.tsx
```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: true,
      _count: {
        select: { nodes: true },
      },
      // Fetch the root node to get AI summary/score
      nodes: {
        where: { parentId: null },
        take: 1,
        select: {
          summary: true,
          aiScore: true,
        }
      }
    },
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
          Where Ideas Come Alive
        </h1>
        <p className="text-xl text-gray-600 font-light">
          Collaborate, create, and evolve projects together.
        </p>
      </header>

      <div className="space-y-8">
        {projects.map((project) => {
          const rootNode = project.nodes[0];
          const aiScore = rootNode?.aiScore || 0;
          const summary = rootNode?.summary || project.description;

          return (
            <article key={project.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
              {/* AI Score Badge */}
              {aiScore > 0 && (
                <div className="absolute top-0 right-0 bg-black text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  Muse Score: {aiScore}
                </div>
              )}

              <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                <span className="font-medium text-gray-900">{project.author.name || "Anonymous"}</span>
                <span>•</span>
                <time>{formatDistanceToNow(project.createdAt, { addSuffix: true })}</time>
                <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs uppercase tracking-wider">
                  {project.type || "PROJECT"}
                </span>
              </div>

              <Link href={`/projects/${project.id}`} className="group">
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {project.title}
                </h2>
              </Link>

              <p className="text-gray-700 leading-relaxed mb-4 line-clamp-3 font-serif">
                {summary}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{project._count.nodes} contributions</span>
                <Link
                  href={`/projects/${project.id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Project →
                </Link>
              </div>
            </article>
          );
        })}

        {projects.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-600 mb-4">No projects started yet.</p>
            <Link
              href="/projects/create"
              className="inline-block px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
            >
              Start the First Project
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

```

## File: src/app/projects/create/page.tsx
```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function CreateProjectPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Step 1: Type Selection, Step 2: Details
    const [step, setStep] = useState(1);
    const [type, setType] = useState<"STORY" | "IDEA" | "RESEARCH">("STORY");

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/api/auth/signin");
        }
    }, [status, router]);

    if (status === "loading" || status === "unauthenticated") {
        return <div className="container mx-auto px-4 py-8">Loading...</div>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description, type }),
            });

            if (!res.ok) throw new Error("Failed to create project");

            const project = await res.json();
            router.push(`/projects/${project.id}`);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Failed to create project");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            {step === 1 ? (
                // Step 1: Type Selection
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center">
                        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">What are you creating?</h1>
                        <p className="text-gray-500">Choose the format that best fits your vision.</p>
                    </div>

                    <div className="grid gap-4">
                        {[
                            { id: "IDEA", label: "Spark (Idea)", desc: "A raw concept or prompt for others to build on." },
                            { id: "STORY", label: "Story (Narrative)", desc: "A linear or branching narrative with chapters." },
                            { id: "RESEARCH", label: "Joint Research", desc: "Collaborative exploration of a topic." },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setType(item.id as any);
                                    setStep(2);
                                }}
                                className="flex flex-col items-start p-6 bg-white border border-gray-200 rounded-xl hover:border-black hover:shadow-md transition-all text-left group"
                            >
                                <span className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {item.label}
                                </span>
                                <span className="text-sm text-gray-500 mt-1">
                                    {item.desc}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                // Step 2: Details Form
                <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                    <button
                        onClick={() => setStep(1)}
                        className="text-sm text-gray-500 hover:text-black mb-6 flex items-center gap-1"
                    >
                        ← Back to Type Selection
                    </button>

                    <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">
                        {type === "IDEA" ? "Ignite the Spark" : type === "RESEARCH" ? "Define the Topic" : "Start a New Story"}
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                Title
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                autoFocus
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-shadow"
                                placeholder={type === "IDEA" ? "e.g., What if cats ruled the world?" : "The Great Adventure"}
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                {type === "IDEA" ? "Context" : type === "RESEARCH" ? "Research Question" : "The Spark (Premise)"}
                            </label>
                            <p className="text-xs text-gray-500 mb-2">
                                {type === "IDEA"
                                    ? "Give enough detail for others to understand the core concept."
                                    : "Set the scene, introduce the world, or provide the opening paragraph."}
                            </p>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                rows={8}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-shadow font-serif"
                                placeholder="It was a dark and stormy night..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-black text-white py-3 rounded-md font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Creating..." : "Launch Project"}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

```

## File: src/app/projects/[id]/page.tsx
```tsx
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProjectInterface } from "@/components/ProjectInterface";

interface PageProps {
    params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function ProjectPage({ params }: PageProps) {
    const { id } = await params;
    const session = await auth();
    const userId = (session?.user as any)?.id;

    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            author: true,
        },
    });

    if (!project) notFound();

    // Fetch all nodes
    const nodes = await prisma.node.findMany({
        where: { projectId: id },
        include: {
            author: true,
            _count: { select: { votes: true } },
            votes: userId ? { where: { userId } } : false,
        },
        orderBy: { createdAt: "asc" },
    });

    // Separate Canon vs Candidates
    const canon = nodes.filter((n) => n.isCanon);

    // Candidates are replies to the LAST canon item.
    const lastCanonId = canon.length > 0 ? canon[canon.length - 1].id : null;

    // Candidates: isCanon false AND parentId matches lastCanonId
    // Note: If lastCanonId is null, we look for nodes with parentId === null (Seed candidates)
    const candidates = nodes.filter(
        (n) => !n.isCanon && n.parentId === lastCanonId
    ).map(n => ({
        ...n,
        hasVoted: n.votes.length > 0
    }));

    // Sort candidates by votes
    candidates.sort((a, b) => b._count.votes - a._count.votes);

    const storyParts = canon.map(n => ({
        id: n.id,
        content: n.content,
        author: n.author,
        createdAt: n.createdAt,
        type: n.type,
    }));

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <ProjectInterface
                project={project}
                nodes={nodes}
                canon={canon}
                candidates={candidates}
                userId={userId}
                lastCanonId={lastCanonId}
            />
        </div>
    );
}

```

## File: src/app/api/nodes/route.ts
```ts
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

        // Generate AI metadata
        const summary = await ai.generateSummary(content);
        const aiScore = await ai.evaluateQuality(content);

        const node = await prisma.node.create({
            data: {
                content,
                summary,
                aiScore,
                type, // "TEXT", "AUDIO", etc.
                project: { connect: { id: projectId } },
                author: { connect: { email: session.user.email! } },
                parent: parentId ? { connect: { id: parentId } } : undefined,
            },
        });

        return NextResponse.json(node);
    } catch (error) {
        console.error("Error creating node:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

```

## File: src/components/MuseGraph.tsx
```tsx
"use client";

import { useCallback, useMemo } from 'react';
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, Node, Edge, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';

interface MuseGraphProps {
    nodesData: any[]; // TODO: Define strict type
}

const nodeWidth = 172;
const nodeHeight = 80;

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    dagreGraph.setGraph({ rankdir: 'TB' });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            targetPosition: Position.Top,
            sourcePosition: Position.Bottom,
            position: {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            },
        };
    });

    return { nodes: layoutedNodes, edges };
};

export function MuseGraph({ nodesData }: MuseGraphProps) {
    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
        const nodes: Node[] = nodesData.map((n) => ({
            id: n.id,
            data: { label: n.content.substring(0, 20) + (n.content.length > 20 ? "..." : "") },
            position: { x: 0, y: 0 }, // Calculated by dagre
            style: {
                background: '#fff',
                border: '1px solid #000',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '12px',
                width: nodeWidth,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }
        }));

        const edges: Edge[] = nodesData
            .filter((n) => n.parentId)
            .map((n) => ({
                id: `e${n.parentId}-${n.id}`,
                source: n.parentId,
                target: n.id,
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#000' }
            }));

        return getLayoutedElements(nodes, edges);
    }, [nodesData]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    return (
        <div style={{ width: '100%', height: '500px', border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
            >
                <Background color="#f0f0f0" gap={16} />
                <Controls />
                <MiniMap />
            </ReactFlow>
        </div>
    );
}

```

## File: src/components/ProjectInterface.tsx
```tsx
"use client";

import { useState } from "react";
import { BookOpen, GitGraph, PenTool } from "lucide-react";
import { MuseGraph } from "./MuseGraph";
import { StoryViewer } from "./StoryViewer";
import { ContributionForm } from "./ContributionForm";
import { CandidateList } from "./CandidateList";
import { ReaderView } from "./ReaderView";
import { EquityView } from "./EquityView";

interface ProjectInterfaceProps {
    project: any;
    nodes: any[];
    canon: any[];
    candidates: any[];
    userId: string;
    lastCanonId: string | null;
}

export function ProjectInterface({
    project,
    nodes,
    canon,
    candidates,
    userId,
    lastCanonId
}: ProjectInterfaceProps) {
    const [mode, setMode] = useState<"graph" | "read" | "equity">("graph");

    if (mode === "read") {
        return (
            <div>
                {/* Floating Toggle Button */}
                <div className="fixed bottom-8 right-8 z-50">
                    <button
                        onClick={() => setMode("graph")}
                        className="bg-black text-white p-4 rounded-full shadow-lg hover:bg-gray-800 transition-all flex items-center gap-2"
                    >
                        <GitGraph size={20} />
                        <span className="font-medium">View Graph</span>
                    </button>
                </div>

                <ReaderView project={project} nodes={canon} />
            </div>
        );
    }

    return (
        <div>
            {/* Header / Toggle */}
            <div className="flex justify-between items-center mb-8 border-b pb-4">
                <div className="flex gap-4">
                    <button
                        onClick={() => setMode("graph")}
                        className={`pb-4 px-2 font-medium transition-colors relative ${mode === "graph" ? "text-black" : "text-gray-400 hover:text-gray-600"}`}
                    >
                        Project & Graph
                        {mode === "graph" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />}
                    </button>
                    <button
                        onClick={() => setMode("equity")}
                        className={`pb-4 px-2 font-medium transition-colors relative ${mode === "equity" ? "text-black" : "text-gray-400 hover:text-gray-600"}`}
                    >
                        Equity & Ownership
                        {mode === "equity" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />}
                    </button>
                </div>

                <button
                    onClick={() => setMode("read")}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors shadow-sm text-sm font-medium"
                >
                    <BookOpen size={16} />
                    <span>Read Mode</span>
                </button>
            </div>

            {mode === "equity" ? (
                <div className="animate-in fade-in duration-500">
                    <EquityView canon={canon} projectAuthor={project.author} />
                </div>
            ) : (
                <div className="grid md:grid-cols-3 gap-8 animate-in fade-in duration-500">
                    <div className="md:col-span-2 space-y-8">
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span>The Muse Graph</span>
                                <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Beta</span>
                            </h2>
                            <MuseGraph nodesData={nodes} />
                        </section>

                        <StoryViewer project={project} nodes={canon} />

                        <div className="border-t pt-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <PenTool size={20} />
                                <span>Contribute to the Project</span>
                            </h3>
                            {userId ? (
                                <ContributionForm
                                    projectId={project.id}
                                    parentId={lastCanonId || undefined}
                                    type="B"
                                />
                            ) : (
                                <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
                                    Sign in to contribute to this project.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <CandidateList
                            candidates={candidates}
                            currentUserId={userId}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

```

## File: src/components/ReaderView.tsx
```tsx
"use client";

import { formatDistanceToNow } from "date-fns";
import { User } from "lucide-react";

interface ReaderViewProps {
    project: {
        title: string;
        description: string | null;
        author: { name: string | null };
    };
    nodes: {
        id: string;
        content: string;
        author: { name: string | null };
        createdAt: Date;
    }[];
}

export function ReaderView({ project, nodes }: ReaderViewProps) {
    return (
        <div className="max-w-2xl mx-auto bg-white min-h-screen py-12 px-8 md:px-12 shadow-sm">
            {/* Title Section */}
            <div className="text-center mb-16 border-b pb-8">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4 leading-tight">
                    {project.title}
                </h1>
                <div className="flex items-center justify-center gap-2 text-gray-500 text-sm font-medium">
                    <span>Created by {project.author.name || "Anonymous"}</span>
                </div>
            </div>

            {/* Content Stitching */}
            <div className="prose prose-lg prose-slate max-w-none font-serif leading-relaxed">
                {/* Opening / Premise */}
                {project.description && (
                    <div className="mb-8 first-letter:text-5xl first-letter:font-bold first-letter:mr-1 first-letter:float-left">
                        {project.description.split('\n').map((paragraph, i) => (
                            <p key={i} className="mb-4 text-gray-800">{paragraph}</p>
                        ))}
                    </div>
                )}

                {/* Nodes */}
                {nodes.map((node, index) => (
                    <div key={node.id} className="group relative mb-6">
                        {/* Author Annotation (Visible on Hover) */}
                        <div className="absolute -left-32 top-0 w-28 text-right opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                            <div className="text-xs text-gray-400 flex items-center justify-end gap-1">
                                <span>{node.author.name || "Anon"}</span>
                                <User size={10} />
                            </div>
                        </div>

                        {/* Node Content */}
                        {node.content.split('\n').map((paragraph, i) => (
                            <p key={i} className="mb-4 text-gray-800">{paragraph}</p>
                        ))}

                        {/* Subtle Divider between different authors */}
                        {index < nodes.length - 1 && nodes[index + 1].author.name !== node.author.name && (
                            <div className="w-8 h-px bg-gray-200 mx-auto my-8" />
                        )}
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="mt-24 pt-8 border-t text-center text-gray-400 text-sm italic">
                End of current path
            </div>
        </div>
    );
}

```

## File: src/components/EquityView.tsx
```tsx
"use client";

import { PieChart, Users } from "lucide-react";

interface EquityViewProps {
    canon: {
        author: { name: string | null; email: string | null };
    }[];
    projectAuthor: { name: string | null; email: string | null };
}

export function EquityView({ canon, projectAuthor }: EquityViewProps) {
    // Calculate equity
    // Logic: Project Author gets 1 share (for the Spark), plus 1 share for each Canon node they wrote.
    // Other authors get 1 share for each Canon node.

    const shares: Record<string, number> = {};
    const names: Record<string, string> = {};

    // Initialize with Project Author (Spark)
    const authorKey = projectAuthor.email || "anonymous";
    shares[authorKey] = 1;
    names[authorKey] = projectAuthor.name || "Anonymous";

    // Add Canon contributions
    canon.forEach(node => {
        const key = node.author.email || "anonymous";
        shares[key] = (shares[key] || 0) + 1;
        names[key] = node.author.name || "Anonymous";
    });

    const totalShares = Object.values(shares).reduce((a, b) => a + b, 0);

    const equityData = Object.entries(shares)
        .map(([email, count]) => ({
            name: names[email],
            email,
            count,
            percentage: (count / totalShares) * 100
        }))
        .sort((a, b) => b.count - a.count);

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-serif font-bold text-gray-900 flex items-center justify-center gap-2">
                    <PieChart className="w-6 h-6" />
                    <span>Ownership & Equity</span>
                </h2>
                <p className="text-gray-500 mt-2">
                    Ownership is dynamically calculated based on accepted contributions.
                </p>
            </div>

            <div className="space-y-4">
                {equityData.map((data, index) => (
                    <div key={data.email} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold">
                                {data.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="font-medium text-gray-900">{data.name}</div>
                                <div className="text-xs text-gray-500">{data.count} contributions</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-bold text-gray-900">{data.percentage.toFixed(1)}%</div>
                            <div className="text-xs text-gray-500">Equity Share</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t text-center text-xs text-gray-400">
                * The Project Creator receives 1 initial share for the Spark.
            </div>
        </div>
    );
}

```

## File: src/components/ContributionForm.tsx
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface ContributionFormProps {
    projectId: string;
    parentId?: string;
    type: string;
}

export function ContributionForm({ projectId, parentId, type }: ContributionFormProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    if (!session) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/nodes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, projectId, parentId, type }),
            });

            if (!res.ok) throw new Error("Failed to submit contribution");

            setContent("");
            setIsOpen(false);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Failed to submit contribution");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="mt-4 px-4 py-2 bg-gray-100 text-gray-900 rounded-full hover:bg-gray-200 transition-colors text-sm font-medium"
            >
                + Write {type === "B" ? "Next Chapter" : "Ending"}
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-2">
                Write {type === "B" ? "Chapter" : "Ending"}
            </h3>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-shadow font-serif mb-4"
                placeholder="Continue the story..."
            />
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                    {isSubmitting ? "Submitting..." : "Submit"}
                </button>
            </div>
        </form>
    );
}

```

## File: src/components/CandidateList.tsx
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp } from "lucide-react";

interface Candidate {
    id: string;
    content: string;
    author: { name: string | null };
    createdAt: Date;
    _count: { votes: number };
    hasVoted: boolean; // We'll need to pass this from server or fetch it
}

interface CandidateListProps {
    candidates: Candidate[];
    currentUserId?: string;
}

export function CandidateList({ candidates, currentUserId }: CandidateListProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [votingId, setVotingId] = useState<string | null>(null);

    const handleVote = async (nodeId: string) => {
        if (!session) {
            alert("Please sign in to vote");
            return;
        }

        setVotingId(nodeId);
        try {
            const res = await fetch("/api/votes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nodeId }),
            });

            if (!res.ok) throw new Error("Failed to vote");

            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setVotingId(null);
        }
    };

    if (candidates.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 italic">
                No contributions yet. Be the first to write!
            </div>
        );
    }

    return (
        <div className="space-y-6 mt-8">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">
                Community Contributions
            </h3>
            {candidates.map((candidate) => (
                <div key={candidate.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2 text-xs text-gray-500">
                        <span className="font-medium text-gray-900">{candidate.author.name || "Anonymous"}</span>
                        <time>{formatDistanceToNow(new Date(candidate.createdAt), { addSuffix: true })}</time>
                    </div>
                    <div className="prose prose-sm max-w-none text-gray-800 font-serif mb-4 whitespace-pre-wrap">
                        {candidate.content}
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => handleVote(candidate.id)}
                            disabled={votingId === candidate.id}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${candidate.hasVoted
                                ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            <ThumbsUp size={14} className={candidate.hasVoted ? "fill-current" : ""} />
                            <span>{candidate._count.votes}</span>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

```

## File: src/app/globals.css
```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #111111;
  --font-serif: var(--font-merriweather), var(--font-noto-serif-kr), serif;
  --font-sans: var(--font-inter), var(--font-noto-sans-kr), sans-serif;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-sans);
  --font-serif: var(--font-serif);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Premium Typography Utilities */
h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: var(--font-serif);
  letter-spacing: -0.02em;
}

.prose {
  font-family: var(--font-serif);
}
```

## File: src/app/layout.tsx
```tsx
import type { Metadata } from "next";
import { Inter, Merriweather, Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const merriweather = Merriweather({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-merriweather"
});

const notoSansKr = Noto_Sans_KR({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-noto-sans-kr",
});

const notoSerifKr = Noto_Serif_KR({
  weight: ["200", "300", "400", "500", "600", "700", "900"],
  subsets: ["latin"],
  variable: "--font-noto-serif-kr",
});

export const metadata: Metadata = {
  title: "CoMuse",
  description: "Collaborative content creation platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${merriweather.variable} ${notoSansKr.variable} ${notoSerifKr.variable} font-sans antialiased bg-gray-50 text-gray-900`}>
        <Providers>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}

```
