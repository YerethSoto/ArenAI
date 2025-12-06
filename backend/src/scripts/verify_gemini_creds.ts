import '../config/env.js'; // This loads env and resolves paths
import { checkGeminiConnection } from '../services/geminiService.js';

console.log("Resolved GOOGLE_APPLICATION_CREDENTIALS:", process.env.GOOGLE_APPLICATION_CREDENTIALS);

async function run() {
  try {
    console.log("Attempting to connect to Gemini...");
    const response = await checkGeminiConnection();
    console.log("Gemini Response:", response);
    console.log("VERIFICATION SUCCESS");
  } catch (error) {
    console.error("Gemini Verification Failed:", error);
    process.exit(1);
  }
}

run();
