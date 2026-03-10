const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

// Helper function to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

// @route   POST /api/auth/register
// @desc    Create new lawyer account
// @access  Public
router.post("/register", async (req, res) => {
    const { firstName, lastName, email, password, lawFirm, barEnrollmentNumber } = req.body;

    try {
        // Check if user already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Create a new user 
        // Note: The pre-save hook in models/User.js automatically hashes the password with bcrypt before saving to MongoDB
        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            lawFirm,
            barEnrollmentNumber,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                lawFirm: user.lawFirm,
                barEnrollmentNumber: user.barEnrollmentNumber,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
});

// @route   POST /api/auth/login
// @desc    Login and get JWT token
// @access  Public
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });

        // Check if user exists and password matches (using bcrypt compare attached to the User model)
        if (user && (await user.comparePassword(password))) {
            res.json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                lawFirm: user.lawFirm,
                barEnrollmentNumber: user.barEnrollmentNumber,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
});

// @route   GET /api/auth/me
// @desc    Get current logged-in user info
// @access  Private (Requires JWT)
router.get("/me", protect, async (req, res) => {
    try {
        // req.user is set by the protect middleware. 
        // We do another query here using .select("-password") just to be perfectly sure the password hash is excluded.
        const user = await User.findById(req.user._id).select("-password");

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
});

// @route   POST /api/auth/logout
// @desc    Invalidate session (client-side)
// @access  Private (Requires JWT)
router.post("/logout", protect, (req, res) => {
    // Since we are using standard JWTs (which are stateless), "logging out" is handled on the client-side
    // by simply deleting the token from localStorage/cookies. 
    // We return a 200 OK here to acknowledge the logout request.
    res.status(200).json({ message: "Logged out successfully. Please remove the token on the client side." });
});

module.exports = router;
