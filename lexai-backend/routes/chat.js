const express = require("express");
const router = express.Router();
const Case = require("../models/Case");
const Message = require("../models/Message");
const { protect } = require("../middleware/authMiddleware");
const { getGeminiChatModel, sendLegalQuery } = require("../utils/geminiClient");

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
        const caseItem = await Case.findOne({ _id: caseId, lawyer: req.user._id });
        if (!caseItem) {
            return res.status(404).json({ message: "Case not found or unauthorized to access this case" });
        }

        // 2. Fetch all previous messages to rebuild the chat history context
        const previousMessages = await Message.find({ case: caseId }).sort({ timestamp: 1 });

        // 3. Format previous messages into Gemini's multi-turn History format
        const history = previousMessages.map((msg) => ({
            role: msg.role === "ai" ? "model" : "user",
            parts: [{ text: msg.text }],
        }));

        // 4. Send the query
        const aiResponseText = await sendLegalQuery(history, language, text);

        // 5. Save BOTH the User's message and the AI's response to your Database
        const userMsg = await Message.create({
            case: caseId,
            role: "user",
            text: text,
            language: language,
        });

        const aiMsg = await Message.create({
            case: caseId,
            role: "ai",
            text: aiResponseText,
            language: language,
        });

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
        const caseItem = await Case.findOne({ _id: caseId, lawyer: req.user._id });
        if (!caseItem) {
            return res.status(404).json({ message: "Case not found or unauthorized to access this case" });
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
        const caseItem = await Case.findOne({ _id: caseId, lawyer: req.user._id });
        if (!caseItem) {
            return res.status(404).json({ message: "Case not found or unauthorized to access this case" });
        }

        // 2. Erase messages
        await Message.deleteMany({ case: caseId });
        res.status(200).json({ message: "All chat history cleared for this case" });
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
});

module.exports = router;
