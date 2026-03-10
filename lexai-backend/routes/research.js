const express = require("express");
const router = express.Router();
const Case = require("../models/Case");
const Research = require("../models/Research");
const { protect } = require("../middleware/authMiddleware");
const { getGeminiChatModel } = require("../utils/geminiClient");

router.use(protect);

// Helper function to verify case ownership
const verifyCaseOwnership = async (caseId, userId) => {
    const caseItem = await Case.findOne({ _id: caseId, lawyer: userId });
    if (!caseItem) {
        throw new Error("Case not found or unauthorized to access this case");
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

        const model = getGeminiChatModel();

        const prompt = `Act as an expert Pakistani legal AI assistant. Generate comprehensive legal research for:
Title: ${caseItem.title}
Client: ${caseItem.clientName}
Section of Law: ${caseItem.section || 'Not specified'}
Case Type: ${caseItem.caseType || 'Not specified'}
Court: ${caseItem.court || 'Not specified'}

Based on Pakistani law (PPC, CrPC, Constitution of Pakistan, etc.), output ONLY a valid JSON array of 5 exact objects representing these sections: law, bail, precedents, defense, constitution. 
Do not wrap it in any other JSON object. Return an ARRAY directly.
Format EXACTLY like this:
[
  {
    "id": "law",
    "icon": "⚖",
    "title": "Applicable Law & Charges",
    "tag": "e.g. PPC § 302",
    "content": "Detailed explanation of relevant statutes.",
    "highlight": "Optional key takeaway point.",
    "items": []
  },
  {
    "id": "bail",
    "icon": "🔓",
    "title": "Bail Grounds & Legal Basis",
    "tag": "e.g. CrPC § 497",
    "content": "Explanation of bail chances.",
    "highlight": null,
    "items": [
      { "title": "Ground 1", "detail": "Detail for ground 1" }
    ]
  },
  {
    "id": "precedents",
    "icon": "📚",
    "title": "Relevant Case Precedents",
    "tag": "e.g. 3 Found",
    "content": "Intro text for precedents.",
    "precedents": [
      { "name": "Party v Party", "year": "2019 SCMR 123", "court": "Supreme Court", "detail": "Precedent ruling..." }
    ]
  },
  {
    "id": "defense",
    "icon": "🛡",
    "title": "Defense Strategy",
    "tag": "Recommended",
    "content": "Step-by-step strategy.",
    "highlight": "Crucial strategic advice.",
    "items": [
      { "title": "Step 1", "detail": "Detail for step 1" }
    ]
  },
  {
    "id": "constitution",
    "icon": "📜",
    "title": "Constitutional Rights",
    "tag": "Arts. 9, 10-A",
    "content": "Fundamental rights implicated.",
    "items": [
      { "title": "Right 1", "detail": "Explanation..." }
    ]
  }
]`;

        const result = await model.generateContent(prompt);
        let aiResponse = result.response.text();
        aiResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();

        let parsedResearch;
        try {
            parsedResearch = JSON.parse(aiResponse);
        } catch (parseError) {
            console.error("Failed to parse Gemini JSON output:", aiResponse);
            return res.status(500).json({ message: "AI generated invalid format. Please try again." });
        }

        const newResearch = new Research({
            case: caseItem._id,
            sections: Array.isArray(parsedResearch) ? parsedResearch : []
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

        const { sections } = req.body;

        const updatedResearch = await Research.findOneAndUpdate(
            { case: req.params.caseId },
            { $set: { sections } },
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
