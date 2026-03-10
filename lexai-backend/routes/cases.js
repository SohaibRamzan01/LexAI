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
        const { title, clientName, section, caseType, court, status } = req.body;

        const newCase = new Case({
            title,
            clientName,
            section,
            caseType,
            court,
            status,
            // Associate the user making the request with the new case
            lawyer: req.user._id,
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
        const caseItem = await Case.findOne({ _id: req.params.id, lawyer: req.user._id });

        if (!caseItem) {
            return res.status(404).json({ message: "Case not found or unauthorized" });
        }

        const updatedCase = await Case.findByIdAndUpdate(
            req.params.id,
            req.body,
            // true returns the updated document, runValidators ensures enums like 'status' are valid
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

module.exports = router;
