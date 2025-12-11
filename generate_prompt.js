const fs = require('fs');
const path = require('path');

const outputFile = 'AI_STUDIO_PROMPT.md';

const context = `# CoMuse Project Context

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

`;

const files = [
    'prisma/schema.prisma',
    'package.json',
    'src/auth.ts',
    'src/lib/ai.ts',
    'src/app/page.tsx',
    'src/app/projects/create/page.tsx',
    'src/app/projects/[id]/page.tsx',
    'src/app/api/nodes/route.ts',
    'src/components/MuseGraph.tsx',
    'src/components/ProjectInterface.tsx',
    'src/components/ReaderView.tsx',
    'src/components/EquityView.tsx',
    'src/components/ContributionForm.tsx',
    'src/components/CandidateList.tsx',
    'src/app/globals.css',
    'src/app/layout.tsx'
];

let output = context;

files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        const ext = path.extname(file).substring(1);
        output += `\n## File: ${file}\n\`\`\`${ext}\n${content}\n\`\`\`\n`;
        console.log(`Added ${file}`);
    } catch (e) {
        console.error(`Error reading ${file}: ${e.message}`);
    }
});

fs.writeFileSync(outputFile, output);
console.log(`\nSuccessfully generated ${outputFile}`);
