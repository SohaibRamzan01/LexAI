const express = require("express");
const router = express.Router();
const Fee = require("../models/Fee");
const { protect } = require("../middleware/authMiddleware");

// All routes in this file require authentication
router.use(protect);

// @route   GET /api/fees/:caseId
// @desc    Get fees for a specific case
// @access  Private
router.get("/:caseId", async (req, res) => {
    try {
        let fee = await Fee.findOne({ case: req.params.caseId, lawyer: req.user._id });

        if (!fee) {
            // Create empty fee record if it doesn't exist
            fee = new Fee({
                case: req.params.caseId,
                lawyer: req.user._id,
                totalAgreed: 0,
                notes: "",
                installments: [],
            });
            await fee.save();
        }

        res.status(200).json(fee);
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
});

// @route   PUT /api/fees/:caseId
// @desc    Update fees for a case
// @access  Private
router.put("/:caseId", async (req, res) => {
    try {
        const { totalAgreed, notes, installments } = req.body;

        let fee = await Fee.findOne({ case: req.params.caseId, lawyer: req.user._id });

        if (!fee) {
            return res.status(404).json({ message: "Fee record not found" });
        }

        fee.totalAgreed = totalAgreed !== undefined ? totalAgreed : fee.totalAgreed;
        fee.notes = notes !== undefined ? notes : fee.notes;
        fee.installments = installments !== undefined ? installments : fee.installments;

        const updatedFee = await fee.save();

        res.status(200).json(updatedFee);
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
});

module.exports = router;
