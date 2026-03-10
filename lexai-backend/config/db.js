const mongoose = require("mongoose");
const dns = require("dns");

// Bypass local ISP blocks for MongoDB Atlas SRV queries
dns.setServers(['8.8.8.8', '8.8.4.4']); 

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connection Successful: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
