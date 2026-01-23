
export interface WeaverAnalysis {
    scores: {
        novelty: number;        // 희소성 (1-100)
        osmuPotential: number;  // 확장성 (1-100)
        collaborativeMagnetism: number; // 협업 유인력 (1-100)
        marketDemand: number;   // 시장성 (1-100)
    };
    totalIpIndex: number;       // 평균 IP 지수
    summary: string;            // 구매자 관점의 3줄 요약
    scoutOpinion: string;       // 한 줄 요약 (Scout's Opinion)
    builderInvitation: string;  // 빌더들을 위한 질문
    status: 'Open for Building' | 'Rejected';
    suggestedTitle?: string;    // AI Generated Title from the seed

    // New Fields for V2 Logging Protocol
    genre: string;
    keyStrategy: string;
    ledgerString: string;
}

/**
 * Comuse Weaver V1 (Mock)
 * Role: World's Best Content PEF Senior Examiner & Netflix Original IP Strategist
 */
export class WeaverAI {
    // SYSTEM PROMPT FOR FUTURE INTEGRATION
    /*
    [Role]
    You are the Senior Reviewer at the world's best Content PEF and a Netflix Original IP Strategist.
    You analyze ideas not just for their artistic value, but for their "sellability" and "expandability".

    [Analysis Protocol]
    Quantify the User Seed into 4 metrics:
    1. Novelty (1-100): Differentiation from existing commercial content.
    2. OSMU Potential (1-100): Ease of adaptation to Drama, Game, Webtoon.
    3. Collaborative Magnetism (1-100): How much "blank space" is left for Builders (Role B)?
    4. Market Demand (1-100): Fit with current global trends.

    [Output]
    - Scoreboard
    - Investment Summary (3 lines)
    - Builder's Invitation (Provocative question)
    
    ### LOGGING PROTOCOL (IMPORTANT)
    After generating the IP assessment, you MUST produce a "CSV String" for data logging at the very end of your response. Use the exact following format, separated by semicolons (;), so the system can parse it into a spreadsheet.

    Format: [LEDGER]; Timestamp; Contributor_ID; IP_Index; Genre; Key_Strategy;
    Value_Mapping:
    - Timestamp: [Current Time]
    - Contributor_ID: [User Email or Username]
    - IP_Index: [Numerical Average of the Assessment Scores]
    - Genre: [The most applicable genre for this IP]
    - Key_Strategy: [One sentence on why this IP is sellable]
    */

    async analyzeSeed(seed: string): Promise<WeaverAnalysis> {
        // SIMULATED LATENCY
        await new Promise(resolve => setTimeout(resolve, 1500));

        // DEMO SCENARIO: "기억을 지워주는 세탁소"
        if (seed.includes("기억") && seed.includes("세탁소")) {
            return {
                scores: {
                    novelty: 85,
                    osmuPotential: 92,
                    collaborativeMagnetism: 88,
                    marketDemand: 80
                },
                totalIpIndex: 86.25,
                summary: "Memory manipulation is a proven trope, but the 'Laundromat' setting adds a unique grounded fantasy element. High potential for episodic drama implementation. The cleaning process serves as a compelling visual metaphor for game mechanics.",
                scoutOpinion: "희소성 85점. 드라마화 가능성 매우 높음.",
                builderInvitation: "이 시드에는 아직 '세탁소 주인의 비밀'과 '손님들의 기묘한 사연'이 비어있습니다. 빌더가 되어 이를 밝혀주세요.",
                status: 'Open for Building',
                suggestedTitle: "기억을 지워주는 세탁소", // Explicitly returning the known title for this demo case
                genre: "Fantasy Drama",
                keyStrategy: "High OSMU potential in K-drama due to episodic nature and strong visual metaphor.",
                ledgerString: `[LEDGER]; ${new Date().toISOString()}; [USER_ID]; 86.25; Fantasy Drama; High OSMU potential in K-drama due to episodic nature and strong visual metaphor;`
            };
        }

        // DEFAULT / RANDOM SCENARIO
        const novelty = Math.floor(Math.random() * (90 - 60) + 60);
        const osmu = Math.floor(Math.random() * (90 - 50) + 50);
        const magnetism = Math.floor(Math.random() * (95 - 70) + 70);
        const market = Math.floor(Math.random() * (90 - 60) + 60);
        const avg = (novelty + osmu + magnetism + market) / 4;

        // Simple title generation heuristic: First 5 words or first sentence
        const words = seed.split(' ');
        const suggestedTitle = words.length > 6
            ? words.slice(0, 6).join(' ') + "..."
            : seed;

        const genre = "Sci-Fi / Thriller"; // Mock genre
        const keyStrategy = "Scalable world-building with strong franchise potential.";

        return {
            scores: {
                novelty,
                osmuPotential: osmu,
                collaborativeMagnetism: magnetism,
                marketDemand: market
            },
            totalIpIndex: avg,
            summary: "Analyzing potential IP value based on current market trends. The concept shows promise but requires further elaboration on world-building rules. Strong character arcs could significantly boost valuation.",
            scoutOpinion: `잠재력 ${avg.toFixed(0)}점. 구체적인 세계관 확장이 필요함.`,
            builderInvitation: "이 세계의 '핵심 갈등'이 아직 정의되지 않았습니다. 어떤 위기가 도래하고 있나요?",
            status: 'Open for Building',
            suggestedTitle,
            genre,
            keyStrategy,
            ledgerString: `[LEDGER]; ${new Date().toISOString()}; [USER_ID]; ${avg.toFixed(2)}; ${genre}; ${keyStrategy};`
        };
    }
}

export const weaverAI = new WeaverAI();
