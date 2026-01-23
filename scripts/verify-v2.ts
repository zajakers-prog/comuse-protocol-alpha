
import { weaverAI } from "../src/lib/services/weaver-ai";
import { sheetsLogger } from "../src/lib/services/sheets-logger";
import fs from 'fs';
import path from 'path';

async function main() {
    console.log("Starting V2 Verification...");

    const seed = "기억을 지워주는 세탁소";
    console.log(`Analyzing seed: ${seed}`);

    const analysis = await weaverAI.analyzeSeed(seed);

    // Verify new fields
    if (!analysis.genre || !analysis.keyStrategy || !analysis.ledgerString) {
        throw new Error("Missing V2 Logging fields in WeaverAI response.");
    }
    console.log(`Genre: ${analysis.genre}`);
    console.log(`Strategy: ${analysis.keyStrategy}`);

    // Verify Title Generation
    if (analysis.suggestedTitle !== "기억을 지워주는 세탁소") {
        throw new Error(`Title mismatch. Got: ${analysis.suggestedTitle}`);
    }

    const logEntry = {
        timestamp: new Date().toISOString(),
        creatorId: "v2-test-user@example.com",
        seedText: seed,
        totalIpIndex: analysis.totalIpIndex,
        scoutOpinion: analysis.scoutOpinion,
        status: analysis.status,
        genre: analysis.genre,
        keyStrategy: analysis.keyStrategy
    };

    console.log("Logging to Sheets...");
    await sheetsLogger.logContribution(logEntry);

    // Verify CSV content
    const csvPath = path.join(process.cwd(), 'public', 'seed_log.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');

    // Check if header is updated (might fail if file existed, but Logger checks internal structure)
    // Actually Logger only writes header if file missing. 
    // For test we might want to delete file first? 
    // Or just check if our row string contains the genre.

    if (csvContent.includes("Fantasy Drama") && csvContent.includes("High OSMU potential")) {
        console.log("CSV Logging Verified! Found V2 fields.");
    } else {
        throw new Error("CSV Logging Failed. V2 fields missing.");
    }

    console.log("V2 Verification Successful!");
}

main().catch(console.error);
