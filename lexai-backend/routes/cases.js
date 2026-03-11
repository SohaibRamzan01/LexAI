const express = require("express");
const router = express.Router();
const Case = require("../models/Case");
const Message = require("../models/Message");
const Research = require("../models/Research");
const { protect } = require("../middleware/authMiddleware");

// All routes in this file require authentication
router.use(protect);

// @route   GET /api/cases
// @desc    Get all cases for logged-in lawyer
// @access  Private
router.get("/", async (req, res) => {
    try {
        // Only return cases where the lawyer matches the logged-in user
        const cases = await Case.find({ lawyer: req.user._id }).sort({ updatedAt: -1 });
        res.status(200).json(cases);
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
});

// @route   POST /api/cases
// @desc    Create a new case
// @access  Private
router.post("/", async (req, res) => {
    try {
        const {
            title,
            clientName,
            section,
            caseType,
            court,
            status,
            language,
            caseNumber,
            caseYear,
            onBehalfOf,
            partyName,
            contactNo,
            respondentName,
            firNumber,
            policeStation,
            adverseAdvocateName,
            adverseAdvocateContact,
        } = req.body;

        const newCase = new Case({
            title,
            clientName,
            section,
            caseType,
            court,
            status,
            language,
            caseNumber,
            caseYear,
            onBehalfOf,
            partyName,
            contactNo,
            respondentName,
            firNumber,
            policeStation,
            adverseAdvocateName,
            adverseAdvocateContact,
            // Associate the user making the request with the new case
            lawyer: req.user.id,
        });

        const savedCase = await newCase.save();
        res.status(201).json(savedCase);
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
});

// @route   GET /api/cases/:id
// @desc    Get one case by ID
// @access  Private
router.get("/:id", async (req, res) => {
    try {
        const caseItem = await Case.findOne({ _id: req.params.id, lawyer: req.user._id });

        if (!caseItem) {
            return res.status(404).json({ message: "Case not found or unauthorized" });
        }

        res.status(200).json(caseItem);
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
});

// @route   PUT /api/cases/:id
// @desc    Update case details or status
// @access  Private
router.put("/:id", async (req, res) => {
    try {
        // Find case by ID and verify ownership
        const caseItem = await Case.findOne({ _id: req.params.id, lawyer: req.user.id });

        if (!caseItem) {
            return res.status(404).json({ message: "Case not found or unauthorized" });
        }

        const {
            title,
            clientName,
            section,
            caseType,
            court,
            status,
            language,
            caseNumber,
            caseYear,
            onBehalfOf,
            partyName,
            contactNo,
            respondentName,
            firNumber,
            policeStation,
            adverseAdvocateName,
            adverseAdvocateContact,
        } = req.body;

        const updateData = {
            title,
            clientName,
            section,
            caseType,
            court,
            status,
            language,
            caseNumber,
            caseYear,
            onBehalfOf,
            partyName,
            contactNo,
            respondentName,
            firNumber,
            policeStation,
            adverseAdvocateName,
            adverseAdvocateContact,
            updatedAt: new Date(),
        };

        // Remove undefined fields so we only update the fields provided
        Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);

        const updatedCase = await Case.findOneAndUpdate(
            { _id: req.params.id, lawyer: req.user.id },
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedCase);
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
});

// @route   DELETE /api/cases/:id
// @desc    Delete a case and its messages
// @access  Private
router.delete("/:id", async (req, res) => {
    try {
        const caseItem = await Case.findOne({ _id: req.params.id, lawyer: req.user._id });

        if (!caseItem) {
            return res.status(404).json({ message: "Case not found or unauthorized" });
        }

        // Delete the case itself
        await Case.findByIdAndDelete(req.params.id);

        // Delete all associated messages and research to prevent orphan documents
        await Message.deleteMany({ case: req.params.id });
        await Research.deleteOne({ case: req.params.id });

        res.status(200).json({ message: "Case and all associated messages/research removed" });
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
});

// @route   POST /api/cases/:id/hearings
// @desc    Add a hearing to a case
// @access  Private
router.post("/:id/hearings", async (req, res) => {
    try {
        const caseDoc = await Case.findOne({ _id: req.params.id, lawyer: req.user.id });
        if (!caseDoc) return res.status(404).json({ error: "Case not found" });

        const { previousDate, adjournDate, step, notes } = req.body;
        caseDoc.hearings.push({ previousDate, adjournDate, step, notes });
        caseDoc.updatedAt = new Date();
        await caseDoc.save();

        res.status(201).json({ success: true, case: caseDoc });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   DELETE /api/cases/:id/hearings/:hearingId
// @desc    Delete a hearing from a case
// @access  Private
router.delete("/:id/hearings/:hearingId", async (req, res) => {
    try {
        const caseDoc = await Case.findOne({ _id: req.params.id, lawyer: req.user.id });
        if (!caseDoc) return res.status(404).json({ error: "Case not found" });

        caseDoc.hearings.pull({ _id: req.params.hearingId });
        await caseDoc.save();

        res.json({ success: true, case: caseDoc });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
