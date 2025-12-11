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
        select: {
          nodes: true,
          equity: true
        },
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white z-0" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            The Future of Collaborative Creation
          </span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-6 leading-tight tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Where Ideas <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Evolve</span> Together.
          </h1>
          <p className="text-xl text-gray-600 font-light mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
            CoMuse is the "GitHub for Creativity." Branch narratives, merge ideas, and earn equity in the next big IP.
          </p>
          <div className="flex justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
            <Link
              href="/projects/create"
              className="px-8 py-4 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-all hover:scale-105 shadow-lg"
            >
              Start a Project
            </Link>
            <a
              href="#trending"
              className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-full font-medium hover:bg-gray-50 transition-all hover:border-gray-400"
            >
              Explore Trending
            </a>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 border-y border-gray-100 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4 text-2xl">✨</div>
              <h3 className="text-lg font-bold mb-2">1. Spark an Idea</h3>
              <p className="text-gray-600 text-sm">Post a story prompt, research question, or startup concept.</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4 text-2xl">🌿</div>
              <h3 className="text-lg font-bold mb-2">2. Branch & Evolve</h3>
              <p className="text-gray-600 text-sm">Contributors add new nodes. The community votes on the best paths.</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4 text-2xl">💎</div>
              <h3 className="text-lg font-bold mb-2">3. Earn Equity</h3>
              <p className="text-gray-600 text-sm">Accepted contributions grant you ownership shares in the final IP.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section id="trending" className="py-20 container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-serif font-bold text-gray-900">Trending Projects</h2>
          <div className="flex gap-2 text-sm font-medium text-gray-500">
            <span className="text-black border-b-2 border-black pb-1">Top Rated</span>
            <span className="hover:text-black cursor-pointer px-2">Newest</span>
          </div>
        </div>

        <div className="grid gap-8">
          {projects.map((project) => {
            const rootNode = project.nodes[0];
            const aiScore = rootNode?.aiScore || 0;
            const summary = rootNode?.summary || project.description;

            return (
              <article key={project.id} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                {/* AI Score Badge */}
                {aiScore > 0 && (
                  <div className="absolute top-0 right-0 bg-black text-white text-xs font-bold px-4 py-2 rounded-bl-2xl z-10">
                    Muse Score: {aiScore}
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4 text-sm text-gray-500">
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                    {/* Placeholder Avatar */}
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${project.author.name}`} alt="avatar" />
                  </div>
                  <span className="font-medium text-gray-900">{project.author.name || "Anonymous"}</span>
                  <span>•</span>
                  <time>{formatDistanceToNow(project.createdAt, { addSuffix: true })}</time>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold uppercase tracking-wider">
                    {project.type || "PROJECT"}
                  </span>
                </div>

                <Link href={`/projects/${project.id}`} className="block">
                  <h2 className="text-3xl font-serif font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {project.title}
                  </h2>
                </Link>

                <p className="text-gray-600 leading-relaxed mb-6 line-clamp-2 font-serif text-lg">
                  {summary}
                </p>

                <div className="flex items-center justify-between border-t pt-6 mt-2">
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <span className="flex items-center gap-2">
                      <span className="text-lg">🌿</span> {project._count.nodes} Nodes
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-lg">👥</span> {project._count.equity} Contributors
                    </span>
                  </div>
                  <Link
                    href={`/projects/${project.id}`}
                    className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    View Project →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
