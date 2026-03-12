const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Research = require("../models/Research");
const Case = require("../models/Case");
const Message = require("../models/Message");
const { getGeminiChatModel } = require("../utils/geminiClient");

router.use(protect);

const RESEARCH_PROMPT = `
  You are LexAI. Based on the full conversation history provided,
  generate a complete legal research document for this Pakistan law case.

  You MUST respond with ONLY a valid JSON object — no markdown, no explanation.
  The JSON must have exactly these keys:
  {
    "applicableLaw":        "Full explanation of all relevant PPC/CrPC sections...",
    "bailGrounds":          "Specific grounds for bail in this case...",
    "precedents": [
      {
        "name":     "Case name",
        "citation": "2019 SCMR 142",
        "court":    "Supreme Court of Pakistan",
        "detail":   "How this precedent helps this case..."
      }
    ],
    "defenseStrategy":      "Step by step defense approach...",
    "courtScript":          "Word for word what to say before the judge...",
    "constitutionalRights": "Relevant articles and how they apply..."
  }

  Minimum 3 precedents. All citations must be real Pakistani court cases.
  Language of response: match the language used in the conversation.`;

// 1. GET /api/research/:caseId
//    Return current research with full versions array
router.get("/:caseId", async (req, res) => {
    try {
        const caseDoc = await Case.findOne({ _id: req.params.caseId, lawyer: req.user.id });
        if (!caseDoc) return res.status(404).json({ error: "Case not found" });

        const research = await Research.findOne({ case: req.params.caseId });
        if (!research) {
            return res.status(200).json(null);
        }
        res.status(200).json(research);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 2. POST /api/research/:caseId/generate
//    Call Gemini AI to generate structured research, save as next version
router.post("/:caseId/generate", async (req, res) => {
    try {
        const caseDoc = await Case.findOne({ _id: req.params.caseId, lawyer: req.user.id });
        if (!caseDoc) return res.status(404).json({ error: "Case not found" });

        // 1. Get all messages for this case (the full conversation context)
        const messages = await Message.find({ case: caseDoc._id }).sort({ timestamp: 1 });
        if (messages.length === 0) {
            return res.status(400).json({ error: "No chat history found to base research on." });
        }

        // 2. Format into Gemini history
        const history = messages.map(m => ({
            role: m.role === "ai" ? "model" : "user",
            parts: [{ text: m.text }]
        }));

        // 3. Call Gemini with research prompt as system instruction
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: RESEARCH_PROMPT,
        });

        const chat = model.startChat({ history });
        const result = await chat.sendMessage("Generate the research document now.");
        const raw = result.response.text();

        // 4. Parse JSON — strip any accidental markdown fences
        const clean = raw.replace(/```[a-zA-Z]*|```/g, "").trim();
        const parsed = JSON.parse(clean);
        console.log("Parsed Research:", parsed);

        // 5. Build the version object
        const versionData = {
            ...parsed,
            versionNumber: 1,
            changeNote: "Initial AI-generated research",
            savedAt: new Date(),
        };

        // 6. Save or update (upsert) the Research document
        const research = await Research.findOneAndUpdate(
            { case: caseDoc._id },
            {
                $set: { ...parsed, currentVersion: 1, generatedAt: new Date() },
                $push: { versions: versionData },
            },
            { upsert: true, new: true }
        );

        res.json({ success: true, research });

    } catch (err) {
        console.error("Generate Research Error:", err);
        res.status(500).json({ error: err.message || "Failed to generate AI research." });
    }
});

// 3. PUT /api/research/:caseId
//    Save an updated version manually
router.put("/:caseId", async (req, res) => {
    try {
        const caseDoc = await Case.findOne({ _id: req.params.caseId, lawyer: req.user.id });
        if (!caseDoc) return res.status(404).json({ error: "Case not found" });

        const research = await Research.findOne({ case: caseDoc._id });
        if (!research) return res.status(404).json({ error: "Research not found" });

        const {
            applicableLaw,
            bailGrounds,
            precedents,
            defenseStrategy,
            courtScript,
            constitutionalRights,
            changeNote
        } = req.body;

        const nextVersionNum = (research.currentVersion || research.versions.length) + 1;

        const newVersion = {
            versionNumber: nextVersionNum,
            applicableLaw,
            bailGrounds,
            precedents: precedents || [],
            defenseStrategy,
            courtScript,
            constitutionalRights,
            changeNote: changeNote || "Manual Update",
            savedBy: req.user.firstName || 'Lawyer'
        };

        research.versions.push(newVersion);
        research.currentVersion = nextVersionNum;
        
        research.applicableLaw = applicableLaw;
        research.bailGrounds = bailGrounds;
        research.precedents = precedents || [];
        research.defenseStrategy = defenseStrategy;
        research.courtScript = courtScript;
        research.constitutionalRights = constitutionalRights;

        await research.save();
        res.status(200).json(research);       

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 4. GET /api/research/:caseId/versions
//    Return all versions array only
router.get("/:caseId/versions", async (req, res) => {
    try {
        const caseDoc = await Case.findOne({ _id: req.params.caseId, lawyer: req.user.id });
        if (!caseDoc) return res.status(404).json({ error: "Case not found" });

        const research = await Research.findOne({ case: req.params.caseId });
        if (!research) {
            return res.status(200).json([]);
        }
        res.status(200).json(research.versions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 5. GET /api/research/:caseId/versions/:versionNum
//    Return one specific version by number
router.get("/:caseId/versions/:versionNum", async (req, res) => {
    try {
        const caseDoc = await Case.findOne({ _id: req.params.caseId, lawyer: req.user.id });
        if (!caseDoc) return res.status(404).json({ error: "Case not found" });

        const research = await Research.findOne({ case: req.params.caseId });
        if (!research) {
            return res.status(404).json({ error: "Research not found" });
        }
        
        const versionTarget = Number(req.params.versionNum);
        const version = research.versions.find(v => v.versionNumber === versionTarget);
        
        if (!version) return res.status(404).json({ error: "Version not found" });
        
        res.status(200).json(version);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
