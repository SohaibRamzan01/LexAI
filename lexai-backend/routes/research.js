const express = require("express");
const router = express.Router();
const Case = require("../models/Case");
const Research = require("../models/Research");
const { protect } = require("../middleware/authMiddleware");
const { getGeminiChatModel } = require("../utils/geminiClient");

router.use(protect);

// Helper function to verify case ownership
const verifyCaseOwnership = async (caseId, userId) => {
    const caseItem = await Case.findById(caseId);
    if (!caseItem) {
        throw new Error("Case not found");
    }
    if (caseItem.lawyer.toString() !== userId.toString()) {
        throw new Error("Not authorized to access this case");
    }
    return caseItem;
};

// @route   GET /api/research/:caseId
// @desc    Get saved research for a case
// @access  Private
router.get("/:caseId", async (req, res) => {
    try {
        await verifyCaseOwnership(req.params.caseId, req.user._id);

        const research = await Research.findOne({ case: req.params.caseId });
        if (!research) {
            return res.status(404).json({ message: "No research found for this case" });
        }

        res.status(200).json(research);
    } catch (error) {
        const status = error.message === "Case not found" ? 404 : error.message === "Not authorized to access this case" ? 401 : 500;
        res.status(status).json({ message: error.message || "Server Error" });
    }
});

// @route   POST /api/research/:caseId
// @desc    Generate and save new research via AI
// @access  Private
router.post("/:caseId", async (req, res) => {
    try {
        const caseItem = await verifyCaseOwnership(req.params.caseId, req.user._id);

        // Check if research already exists
        const existingResearch = await Research.findOne({ case: req.params.caseId });
        if (existingResearch) {
            return res.status(400).json({ message: "Research already exists for this case. Use PUT to update." });
        }

        // Prepare prompt for Gemini to generate structured legal research
        const model = getGeminiChatModel();

        // We request JSON format so we can easily map the AI's response to our Mongoose model
        const prompt = `Act as an expert Pakistani legal AI assistant. Generate comprehensive legal research for the following case:
Title: ${caseItem.title}
Client: ${caseItem.clientName}
Section of Law: ${caseItem.section || 'Not specified'}
Case Type: ${caseItem.caseType || 'Not specified'}
Court: ${caseItem.court || 'Not specified'}

Based on Pakistani law (PPC, CrPC, Constitution of Pakistan, etc.), please provide the output ONLY as a valid JSON object with the following keys exactly:
{
  "applicableLaw": "Detailed explanation of relevant statutes and sections",
  "bailGrounds": "Strong arguments for bail (if applicable) or defense grounds",
  "precedents": ["Citation of relevant Supreme Court or High Court of Pakistan judgments (PLD, SCMR, YLR, etc.)", "Another citation..."],
  "defenseStrategy": "A step-by-step recommended defense strategy",
  "courtScript": "Suggested opening arguments or key points to speak in court",
  "constitutionalRights": "Any fundamental rights under the Constitution of Pakistan implicated here"
}`;

        // Generate content using Gemini
        const result = await model.generateContent(prompt);
        let aiResponse = result.response.text();

        // Clean the response (Gemini sometimes wraps JSON in markdown blocks)
        aiResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();

        let parsedResearch;
        try {
            parsedResearch = JSON.parse(aiResponse);
        } catch (parseError) {
            console.error("Failed to parse Gemini JSON output:", aiResponse);
            return res.status(500).json({ message: "AI generated invalid format. Please try again." });
        }

        // Create and save new research document
        const newResearch = new Research({
            case: caseItem._id,
            applicableLaw: parsedResearch.applicableLaw || "",
            bailGrounds: parsedResearch.bailGrounds || "",
            precedents: Array.isArray(parsedResearch.precedents) ? parsedResearch.precedents : [],
            defenseStrategy: parsedResearch.defenseStrategy || "",
            courtScript: parsedResearch.courtScript || "",
            constitutionalRights: parsedResearch.constitutionalRights || ""
        });

        const savedResearch = await newResearch.save();
        res.status(201).json(savedResearch);

    } catch (error) {
        const status = error.message === "Case not found" ? 404 : error.message === "Not authorized to access this case" ? 401 : 500;
        res.status(status).json({ message: error.message || "Server Error" });
    }
});

// @route   PUT /api/research/:caseId
// @desc    Update existing research (e.g. manual edits by lawyer)
// @access  Private
router.put("/:caseId", async (req, res) => {
    try {
        await verifyCaseOwnership(req.params.caseId, req.user._id);

        const { applicableLaw, bailGrounds, precedents, defenseStrategy, courtScript, constitutionalRights } = req.body;

        const updatedResearch = await Research.findOneAndUpdate(
            { case: req.params.caseId },
            {
                $set: {
                    applicableLaw,
                    bailGrounds,
                    precedents,
                    defenseStrategy,
                    courtScript,
                    constitutionalRights
                }
            },
            { new: true, runValidators: true }
        );

        if (!updatedResearch) {
            return res.status(404).json({ message: "No research found for this case. Try generating it first." });
        }

        res.status(200).json(updatedResearch);
    } catch (error) {
        const status = error.message === "Case not found" ? 404 : error.message === "Not authorized to access this case" ? 401 : 500;
        res.status(status).json({ message: error.message || "Server Error" });
    }
});

module.exports = router;
