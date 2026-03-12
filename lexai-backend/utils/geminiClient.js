const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access API key from environment variables
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("⚠️ Missing GEMINI_API_KEY environment variable. AI won't work!");
}

// 1. Initialize the Gemini client
const genAI = new GoogleGenerativeAI(apiKey);

// Helper used by other backward-compatible routes (e.g., research)
const getGeminiChatModel = () => {
    return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
};

const buildSystemPrompt = (language) => {
    const langRule = {
        english: "Respond ONLY in formal English.",
        urdu:    "Sirf Urdu mein jawab dein — Urdu script mein.",
        roman:   "SIRF Roman Urdu mein jawab dein (English haroof, Urdu bolain).",
    };
    return `You are LexAI — expert AI legal co-worker for Pakistani lawyers.
    LANGUAGE: ${langRule[language] || langRule.english}
    EXPERTISE: PPC, CrPC, Constitution of Pakistan 1973, MFLO,
    Qanun-e-Shahadat, ATA, NAO, and all superior court precedents.
    BEHAVIOR:
    1. First ask 3-5 clarifying questions to gather full case context.
    2. Then provide: APPLICABLE LAW, BAIL GROUNDS, KEY PRECEDENTS,
       DEFENSE STRATEGY, and COURT SCRIPT.
    3. Always cite real Pakistani cases (e.g. 2019 SCMR 142).
    4. Always mention relevant constitutional articles.
    FOCUS: Bail strategy, court scripts, case research, precedents.
    
    RESEARCH OUTPUT RULE:
    When you have gathered enough case information (after asking your clarifying
    questions and receiving answers), generate a full research document.
    The research document MUST begin with these exact section headers on their
    own lines, in this exact order, in ALL CAPS:

    APPLICABLE LAW
    BAIL GROUNDS
    KEY PRECEDENTS
    DEFENSE STRATEGY
    COURT SCRIPT
    CONSTITUTIONAL RIGHTS

    After generating research, end with this exact line:
    --- RESEARCH COMPLETE. Please review and save if satisfied. ---

    When the lawyer asks for changes, regenerate the FULL research with
    all sections updated, using the same section headers.`;
};

/**
 * Processes a legal query with Gemini AI, managing context and Pakistani law guidelines.
 * 
 * @param {Array} history - Array of previous formatted history messages
 * @param {String} language - Language preference: 'english', 'urdu', or 'roman'
 * @param {String} currentQuery - The user's new message
 * @returns {String} AI's text response
 */
const sendLegalQuery = async (history, language, currentQuery) => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: {
                role: "system",
                parts: [{ text: buildSystemPrompt(language) }]
            }
        });

        const chatSession = model.startChat({ history });

        // 4. Send the query
        const result = await chatSession.sendMessage(currentQuery);
        return result.response.text();
    } catch (error) {
        console.error("LexAI Gemini Error - sendLegalQuery failed:", error.message);
        throw new Error("Failed to communicate with AI model.");
    }
};

module.exports = {
    getGeminiChatModel,
    sendLegalQuery
};
