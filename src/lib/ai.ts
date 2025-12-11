export const ai = {
    /**
     * Generates a 1-sentence summary of the provided text.
     * (Stub: Returns a mock summary based on context)
     */
    generateSummary: async (content: string) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const lower = content.toLowerCase();

        if (lower.includes("dragon") || lower.includes("sword")) {
            return "A high-fantasy sequence featuring mythical creatures and ancient weaponry. The tone is epic and adventurous.";
        }
        if (lower.includes("ai") || lower.includes("robot") || lower.includes("signal")) {
            return "A sci-fi narrative exploring themes of artificial intelligence and extraterrestrial contact. The atmosphere is tense and mysterious.";
        }
        if (lower.includes("love") || lower.includes("cafe") || lower.includes("eyes")) {
            return "A romantic interlude focusing on emotional connection and serendipity. The mood is light and heartwarming.";
        }
        if (lower.includes("quantum") || lower.includes("ethics")) {
            return "A philosophical inquiry into the implications of advanced technology on human morality.";
        }

        const words = content.split(" ");
        const preview = words.slice(0, 15).join(" ");
        return `${preview}... (AI Analysis: Content appears to be a narrative segment.)`;
    },

    /**
     * Evaluates the quality of the text and returns a score from 0 to 100.
     */
    evaluateQuality: async (content: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));

        // Deterministic scoring based on length and keywords for demo consistency
        let score = 70;
        if (content.length > 50) score += 10;
        if (content.length > 100) score += 5;

        const keywords = ["dragon", "ai", "love", "quantum", "signal", "mystery"];
        if (keywords.some(k => content.toLowerCase().includes(k))) score += 10;

        // Cap at 99
        return Math.min(99, score);
    }
};
