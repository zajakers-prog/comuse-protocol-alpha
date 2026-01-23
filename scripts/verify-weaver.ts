
import { weaverAI } from "../src/lib/services/weaver-ai";
import { sheetsLogger } from "../src/lib/services/sheets-logger";
import fs from 'fs';
import path from 'path';

async function main() {
    console.log("Starting Verification...");

    const seed = "기억을 지워주는 세탁소";
    console.log(`Analyzing seed: ${seed}`);

    const analysis = await weaverAI.analyzeSeed(seed);
    console.log("Analysis Result:", JSON.stringify(analysis, null, 2));

    if (analysis.scores.novelty !== 85) {
        throw new Error("Novelty score mismatch. Expected 85 for this seed.");
    }

    const logEntry = {
        timestamp: new Date().toISOString(),
        creatorId: "test-user@example.com",
        seedText: seed,
        totalIpIndex: analysis.totalIpIndex,
        scoutOpinion: analysis.scoutOpinion,
        status: analysis.status,
        genre: analysis.genre || "N/A",
        keyStrategy: analysis.keyStrategy || "N/A"
    };

    console.log("Logging to Sheets...");
    await sheetsLogger.logContribution(logEntry);

    // Verify CSV content
    const csvPath = path.join(process.cwd(), 'public', 'seed_log.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');

    if (csvContent.includes("기억을 지워주는 세탁소") && csvContent.includes("test-user@example.com")) {
        console.log("CSV Logging Verified!");
    } else {
        throw new Error("CSV Logging Failed.");
    }

    console.log("Verification Successful!");
}

main().catch(console.error);
