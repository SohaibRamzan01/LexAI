const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    case: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Case",
        required: [true, "Case reference is required"],
        index: true,
    },
    role: {
        type: String,
        enum: {
            values: ["user", "ai"],
            message: "{VALUE} is not a valid role",
        },
        required: [true, "Message role is required"],
    },
    text: {
        type: String,
        required: [true, "Message text is required"],
    },
    language: {
        type: String,
        trim: true,
        default: "en",
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true,
    },
});

// Compound index for fast lookups: all messages for a case, sorted by time
messageSchema.index({ case: 1, timestamp: 1 });

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
