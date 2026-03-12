const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const CourtGuide = require("../models/CourtGuide");
const Case = require("../models/Case");
const Research = require("../models/Research");

router.use(protect);

const GUIDE_PROMPT = `
  You are LexAI. You have been given the complete legal research for a Pakistan law case.
  Generate a detailed courtroom guide the lawyer will use on the day of hearing.

  You MUST respond with ONLY a valid JSON object — no markdown, no preamble.
  {
    "openingStatement": "Janab-e-Ali, I appear on behalf of the accused...",
    "argumentsSection": "The complete legal arguments to present in order...",
    "precedentArguments": "How to present each cited precedent to the judge...",
    "prayer": "In light of the above, it is respectfully prayed that...",
    "checklist": [
      { "item": "File bail application with court stamp", "completed": false },
      { "item": "Attach copy of FIR", "completed": false },
      { "item": "Prepare certified copies of precedents", "completed": false },
      { "item": "Brief client on court procedure", "completed": false }
    ]
  }

  The openingStatement must be word-for-word, formal Pakistani court language.
  Checklist must have minimum 6 actionable preparation tasks.`;

// 1. GET /api/guide/:caseId
//    Return current guide with full versions array
router.get("/:caseId", async (req, res) => {
    try {
        const caseDoc = await Case.findOne({ _id: req.params.caseId, lawyer: req.user.id });
        if (!caseDoc) return res.status(404).json({ error: "Case not found" });

        const guide = await CourtGuide.findOne({ case: req.params.caseId });
        if (!guide) {
            return res.status(200).json(null);
        }
        res.status(200).json(guide);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 2. POST /api/guide/:caseId/generate
router.post("/:caseId/generate", async (req, res) => {
    try {
        const caseDoc = await Case.findOne({ _id: req.params.caseId, lawyer: req.user.id });
        if (!caseDoc) return res.status(404).json({ error: "Case not found" });

        // 1. Get the finalized research (latest version)
        const research = await Research.findOne({ case: caseDoc._id });
        if (!research) return res.status(404).json({ error: "No research found. Generate research first." });

        // 2. Build the research summary to give to Gemini as context
        const researchContext = `
          APPLICABLE LAW: ${research.applicableLaw}
          BAIL GROUNDS: ${research.bailGrounds}
          PRECEDENTS: ${(research.precedents || []).map(p => `${p.name} (${p.citation}): ${p.detail}`).join("\n")}
          DEFENSE STRATEGY: ${research.defenseStrategy}
          CONSTITUTIONAL RIGHTS: ${research.constitutionalRights}
        `;

        // 3. Send to Gemini
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: GUIDE_PROMPT,
        });
        
        const result = await model.generateContent(researchContext);
        const raw = result.response.text();
        const clean = raw.replace(/```[a-zA-Z]*|```/g, "").trim();
        const parsed = JSON.parse(clean);
        console.log("Parsed Guide:", parsed);

        // 4. Save to MongoDB
        let guide = await CourtGuide.findOne({ case: caseDoc._id });
        const nextVersionNum = guide ? (guide.currentVersion || guide.versions.length) + 1 : 1;

        const versionData = { 
            ...parsed, 
            versionNumber: nextVersionNum, 
            changeNote: nextVersionNum === 1 ? "Initial AI-generated guide" : "AI Re-Generated guide", 
            savedAt: new Date() 
        };
        
        guide = await CourtGuide.findOneAndUpdate(
            { case: caseDoc._id },
            { 
                $set: { ...parsed, currentVersion: nextVersionNum, researchVersion: research.currentVersion, generatedAt: new Date() },
                $push: { versions: versionData } 
            },
            { upsert: true, new: true }
        );

        res.status(201).json({ success: true, guide });

    } catch (err) {
        console.error("Generate CourtGuide Error:", err);
        res.status(500).json({ error: err.message || "Failed to generate AI guide." });
    }
});

// 3. PUT /api/guide/:caseId
router.put("/:caseId", async (req, res) => {
    try {
        const caseDoc = await Case.findOne({ _id: req.params.caseId, lawyer: req.user.id });
        if (!caseDoc) return res.status(404).json({ error: "Case not found" });

        const guide = await CourtGuide.findOne({ case: caseDoc._id });
        if (!guide) return res.status(404).json({ error: "Guide not found" });

        const {
            openingStatement,
            argumentsSection,
            precedentArguments,
            prayer,
            checklist,
            changeNote
        } = req.body;

        const nextVersionNum = (guide.currentVersion || guide.versions.length) + 1;

        const versionData = {
            versionNumber: nextVersionNum,
            openingStatement,
            argumentsSection,
            precedentArguments,
            prayer,
            checklist: checklist || [],
            changeNote: changeNote || "Manual Update",
            savedAt: new Date(),
        };

        guide.versions.push(versionData);
        guide.currentVersion = nextVersionNum;
        
        guide.openingStatement = openingStatement;
        guide.argumentsSection = argumentsSection;
        guide.precedentArguments = precedentArguments;
        guide.prayer = prayer;
        guide.checklist = checklist || [];

        await guide.save();
        res.status(200).json(guide);       

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 4. GET /api/guide/:caseId/versions
router.get("/:caseId/versions", async (req, res) => {
    try {
        const caseDoc = await Case.findOne({ _id: req.params.caseId, lawyer: req.user.id });
        if (!caseDoc) return res.status(404).json({ error: "Case not found" });

        const guide = await CourtGuide.findOne({ case: req.params.caseId });
        if (!guide) {
            return res.status(200).json([]);
        }
        res.status(200).json(guide.versions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 5. GET /api/guide/:caseId/versions/:versionNum
router.get("/:caseId/versions/:versionNum", async (req, res) => {
    try {
        const caseDoc = await Case.findOne({ _id: req.params.caseId, lawyer: req.user.id });
        if (!caseDoc) return res.status(404).json({ error: "Case not found" });

        const guide = await CourtGuide.findOne({ case: req.params.caseId });
        if (!guide) {
            return res.status(404).json({ error: "Guide not found" });
        }
        
        const versionTarget = Number(req.params.versionNum);
        const version = guide.versions.find(v => v.versionNumber === versionTarget);
        
        if (!version) return res.status(404).json({ error: "Version not found" });
        
        res.status(200).json(version);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
