const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access API key from environment variables
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("Missing GEMINI_API_KEY environment variable. AI won't work!");
}

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(apiKey);

// We'll use the recommended `gemini-2.5-flash` model for chat apps
const getGeminiChatModel = () => {
    return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
};

module.exports = {
    getGeminiChatModel,
};
