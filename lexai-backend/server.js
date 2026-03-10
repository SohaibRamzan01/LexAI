require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const casesRoutes = require("./routes/cases");
const chatRoutes = require("./routes/chat");
const researchRoutes = require("./routes/research");
const feesRoutes = require("./routes/fees");

const app = express();

// Middleware
app.use(express.json()); // Parses incoming JSON
app.use(cors()); // Enables Cross-Origin Resource Sharing

// Routes
// Anything sent to /api/auth will be handled by our auth controller
app.use("/api/auth", authRoutes);
app.use("/api/cases", casesRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/research", researchRoutes);
app.use("/api/fees", feesRoutes);

// Test Route
app.get("/", (req, res) => {
    res.send("LexAI Backend is Running...");
});

// Database Connection
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Bypasses local ISP blocks for SRV queries

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connection Successful"))
    .catch((err) => console.log("❌ MongoDB Connection Error: ", err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
