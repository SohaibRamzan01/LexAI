const mongoose = require("mongoose");

const researchSchema = new mongoose.Schema({
    case: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Case",
        required: [true, "Case reference is required"],
        unique: true,
    },
    applicableLaw: {
        type: String,
        default: "",
    },
    bailGrounds: {
        type: String,
        default: "",
    },
    precedents: {
        type: [String],
        default: [],
    },
    defenseStrategy: {
        type: String,
        default: "",
    },
    courtScript: {
        type: String,
        default: "",
    },
    constitutionalRights: {
        type: String,
        default: "",
    },
    generatedAt: {
        type: Date,
        default: Date.now,
    },
});

const Research = mongoose.model("Research", researchSchema);

module.exports = Research;
