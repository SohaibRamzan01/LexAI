const express = require("express");
const router = express.Router();
const Case = require("../models/Case");
const Message = require("../models/Message");
const { protect } = require("../middleware/authMiddleware");
const { getGeminiChatModel } = require("../utils/geminiClient");

router.use(protect);

// @route   POST /api/chat/:caseId
// @desc    Send message to Gemini for this specific case & save both msgs
// @access  Private
router.post("/:caseId", async (req, res) => {
    const { caseId } = req.params;
    const { text, language = "en" } = req.body;

    if (!text) {
        return res.status(400).json({ message: "Message text is required" });
    }

    try {
        // 1. Verify case exists and belongs to the user
        const caseItem = await Case.findById(caseId);
        if (!caseItem) {
            return res.status(404).json({ message: "Case not found" });
        }
        if (caseItem.lawyer.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized to access this case" });
        }

        // 2. Fetch all previous messages to rebuild the chat history context
        const previousMessages = await Message.find({ case: caseId }).sort({ timestamp: 1 });

        // 3. Format previous messages into Gemini's multi-turn History format
        // Gemini expects: { role: "user" | "model", parts: [{ text: "..." }] }
        // Mongoose Model uses role = "user" | "ai". So we map "ai" -> "model"
        const history = previousMessages.map((msg) => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.text }],
        }));

        // 4. Construct the System Prompt for a Pakistani Legal Chatbot
        // This primes the AI to act uniquely every time a session is initialized
        let systemInstruction = `You are LexAI, an expert AI legal assistant specifically trained in the laws and constitution of Pakistan. 
You are assisting a Pakistani lawyer representing a client. 
Case Details Context: Target case concerns ${caseItem.title} - ${caseItem.caseType} - Section ${caseItem.section}. 
Your goal is to provide legally sound, precise, and strategic advice referencing Pakistani statutes, IPC/PPC equivalents (Pakistan Penal Code), Criminal Procedure Code (CrPC), and Pakistani constitutional rights where applicable.`;

        // Handle languages explicitly
        if (language.toLowerCase() === "urdu") {
            systemInstruction += " Please respond entirely in proper written Urdu script.";
        } else if (language.toLowerCase() === "roman") {
            systemInstruction += " Please respond entirely in Roman Urdu (Urdu written in English script).";
        } else {
            systemInstruction += " Please respond entirely in proper English.";
        }

        // 5. Initialize Gemini Chat Session with History + System Instruction
        const model = getGeminiChatModel();
        const chatSession = model.startChat({
            history: history,
            systemInstruction: {
                role: "system",
                parts: [{ text: systemInstruction }]
            }
        });

        // 6. Send user's new message to Gemini
        const result = await chatSession.sendMessage(text);
        const aiResponseText = result.response.text();

        // 7. Save BOTH the User's message and the AI's response to your Database
        const userMsg = new Message({
            case: caseId,
            role: "user",
            text: text,
            language: language,
        });
        await userMsg.save();

        const aiMsg = new Message({
            case: caseId,
            role: "ai",
            text: aiResponseText,
            language: language,
        });
        await aiMsg.save();

        // 8. Return the AI's response to frontend
        res.status(201).json({
            userMessage: userMsg,
            aiMessage: aiMsg,
        });
    } catch (error) {
        console.error("Chat API Error:", error);
        res.status(500).json({ message: error.message || "Server Error communicating with AI" });
    }
});

// @route   GET /api/chat/:caseId
// @desc    Get full chat history for a case
// @access  Private
router.get("/:caseId", async (req, res) => {
    const { caseId } = req.params;

    try {
        // 1. Verify case exists and belongs to the user
        const caseItem = await Case.findById(caseId);
        if (!caseItem) {
            return res.status(404).json({ message: "Case not found" });
        }
        if (caseItem.lawyer.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized to access this case" });
        }

        // 2. Fetch messages
        const messages = await Message.find({ case: caseId }).sort({ timestamp: 1 });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
});

// @route   DELETE /api/chat/:caseId
// @desc    Clear all messages for a case (Restarts Context)
// @access  Private
router.delete("/:caseId", async (req, res) => {
    const { caseId } = req.params;

    try {
        // 1. Verify case exists and belongs to the user
        const caseItem = await Case.findById(caseId);
        if (!caseItem) {
            return res.status(404).json({ message: "Case not found" });
        }
        if (caseItem.lawyer.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized to modify this case" });
        }

        // 2. Erase messages
        await Message.deleteMany({ case: caseId });
        res.status(200).json({ message: "All chat history cleared for this case" });
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
});

module.exports = router;
