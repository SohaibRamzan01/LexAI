require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Route imports
const authRoutes = require("./routes/auth");
const casesRoutes = require("./routes/cases");
const chatRoutes = require("./routes/chat");
const researchRoutes = require("./routes/research");
const feesRoutes = require("./routes/fees");
const guideRoutes = require("./routes/guide");
const reportRoutes = require("./routes/reports");

// Load Models
const CourtGuide = require("./models/CourtGuide");

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));
app.use(express.json());

// Routes
app.get("/", (req, res) => res.json({ message: "LexAI Backend Running ⚖" }));
app.use("/api/auth", authRoutes);
app.use("/api/cases", casesRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/research", researchRoutes);
app.use("/api/guide", guideRoutes);
app.use("/api/fees", feesRoutes);
app.use("/api/reports", reportRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
