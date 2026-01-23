
import fs from 'fs';
import path from 'path';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

interface LogEntry {
    timestamp: string;
    creatorId: string;
    seedText: string;
    totalIpIndex: number;
    scoutOpinion: string;
    status: string;
    genre: string;
    keyStrategy: string;
}

export class SheetsLogger {
    private csvPath: string;
    private googleSheet: GoogleSpreadsheet | null = null;
    private isGoogleReady = false;
    private isProd = process.env.NODE_ENV === 'production';

    constructor() {
        this.csvPath = path.join(process.cwd(), 'public', 'seed_log.csv');
        if (!this.isProd) {
            this.ensureCsvExists();
        }
        this.initGoogleSheets();
    }

    private ensureCsvExists() {
        try {
            if (!fs.existsSync(this.csvPath)) {
                const header = 'Timestamp,Creator ID,Seed Text,Total IP Index,Genre,Key Strategy,Scout\'s Opinion,Status\n';
                fs.writeFileSync(this.csvPath, header, 'utf-8');
            }
        } catch (error) {
            console.warn('[SheetsLogger] Failed to ensure CSV exists (likely read-only fs):', error);
        }
    }

    private async initGoogleSheets() {
        const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        const privateKey = process.env.GOOGLE_PRIVATE_KEY;
        const sheetId = process.env.GOOGLE_SHEET_ID;

        if (serviceAccountEmail && privateKey && sheetId) {
            try {
                const serviceAccountAuth = new JWT({
                    email: serviceAccountEmail,
                    key: privateKey.replace(/\\n/g, '\n'), // Handle newline literals in env var
                    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
                });

                this.googleSheet = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
                await this.googleSheet.loadInfo();
                this.isGoogleReady = true;
                console.log(`[SheetsLogger] Connected to Google Sheet: ${this.googleSheet.title}`);
            } catch (error) {
                console.error("[SheetsLogger] Failed to initialize Google Sheets:", error);
            }
        }
    }

    async logContribution(entry: LogEntry) {
        // 1. Log to CSV (Backup/Primary) - ONLY IN DEVELOPMENT
        if (!this.isProd) {
            try {
                const row = [
                    entry.timestamp,
                    entry.creatorId,
                    `"${entry.seedText.replace(/"/g, '""')}"`, // Escape quotes
                    entry.totalIpIndex.toFixed(2),
                    `"${entry.genre}"`,
                    `"${entry.keyStrategy.replace(/"/g, '""')}"`,
                    `"${entry.scoutOpinion.replace(/"/g, '""')}"`,
                    entry.status
                ].join(',');

                fs.appendFileSync(this.csvPath, row + '\n');
                console.log(`[SheetsLogger] Logged to CSV for ${entry.creatorId}`);
            } catch (error) {
                console.error("[SheetsLogger] CSV Log Failed:", error);
            }
        } else {
            console.log(`[SheetsLogger] Production mode: Skipped CSV log for ${entry.creatorId}`);
        }

        // 2. Log to Google Sheets (If Connected)
        if (this.isGoogleReady && this.googleSheet) {
            try {
                const sheet = this.googleSheet.sheetsByIndex[0]; // Write to first tab
                await sheet.addRow({
                    Timestamp: entry.timestamp,
                    "Creator ID": entry.creatorId,
                    "Seed Text": entry.seedText,
                    "Total IP Index": entry.totalIpIndex,
                    "Genre": entry.genre,
                    "Key Strategy": entry.keyStrategy,
                    "Scout's Opinion": entry.scoutOpinion,
                    "Status": entry.status
                });
                console.log(`[SheetsLogger] Appended row to Google Sheet`);
            } catch (error) {
                console.error("[SheetsLogger] Google Sheet Log Failed:", error);
            }
        }
    }
}

export const sheetsLogger = new SheetsLogger();
