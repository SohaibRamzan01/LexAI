const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema({
    case: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Case",
        required: true,
    },
    lawyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    totalAgreed: {
        type: Number,
        default: 0,
    },
    notes: {
        type: String,
        default: "",
    },
    installments: [
        {
            title: String,
            amount: Number,
            dueDate: Date,
            status: {
                type: String,
                enum: ["paid", "pending", "upcoming"],
                default: "upcoming"
            }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model("Fee", feeSchema);
