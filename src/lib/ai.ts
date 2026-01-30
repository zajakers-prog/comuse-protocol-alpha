import OpenAI from "openai";

// Initialize ONLY if key exists
const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

export const ai = {
    /**
     * Generates a concise 1-sentence summary (TL;DR).
     */
    generateSummary: async (text: string): Promise<string> => {
        // 1. Fallback Mode (Fake Brain)
        if (!openai) {
            console.log("⚠️ No OpenAI Key found. Using Fake Brain.");
            // Simulate thinking time
            await new Promise((resolve) => setTimeout(resolve, 500));

            const words = text.split(" ");
            if (words.length < 5) return text;

            // Simple extraction summary
            const keywords = words.filter(w => w.length > 5).slice(0, 3).join(", ");
            return `[Simulated AI] A story about ${keywords || "something interesting"}... exploring deep themes.`;
        }

        // 2. Real Logic
        try {
            if (text.length < 50) return text;

            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are a creative editor. Summarize the following story segment into one intriguing sentence." },
                    { role: "user", content: text },
                ],
                max_tokens: 60,
            });

            return response.choices[0].message.content || text.substring(0, 100) + "...";
        } catch (error) {
            console.error("AI Summary Error:", error);
            return text.substring(0, 50) + "..."; // Error Fallback
        }
    },

    /**
     * Evaluates text quality (0-100).
     */
    evaluateQuality: async (text: string): Promise<number> => {
        // 1. Fallback Mode (Fake Brain)
        if (!openai) {
            await new Promise((resolve) => setTimeout(resolve, 300));
            // Deterministic "random" score based on text length
            const baseScore = 70;
            const lengthBonus = Math.min(text.length / 10, 20);
            const randomVariance = Math.floor(Math.random() * 10);

            const finalScore = Math.min(Math.floor(baseScore + lengthBonus + randomVariance), 99);
            console.log(`⚠️ Using Fake Brain Score: ${finalScore}`);
            return finalScore;
        }

        // 2. Real Logic
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `Evaluate the following story segment for creativity, grammar, and engagement. 
            Return ONLY a single number between 0 and 100. 
            (Average content = 50, Excellent = 80+, Spam/Gibberish = 0)`
                    },
                    { role: "user", content: text },
                ],
                max_tokens: 10,
            });

            const score = parseInt(response.choices[0].message.content || "50");
            return isNaN(score) ? 50 : Math.min(Math.max(score, 0), 100);
        } catch (error) {
            console.error("AI Score Error:", error);
            return 50;
        }
    }
};
