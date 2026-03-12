const mongoose = require("mongoose");

const precedentSchema = new mongoose.Schema({
    name: String,
    citation: String,
    court: String,
    detail: String,
});

const researchVersionSchema = new mongoose.Schema({
    versionNumber: Number,
    applicableLaw: String,
    bailGrounds: String,
    precedents: [precedentSchema],
    defenseStrategy: String,
    courtScript: String,
    constitutionalRights: String,
    changeNote: String,
    savedAt: {
        type: Date,
        default: Date.now
    },
    savedBy: String
});

const researchSchema = new mongoose.Schema(
    {
        case: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Case",
            required: true,
            unique: true,
        },
        currentVersion: {
            type: Number,
            default: 1,
        },
        versions: [researchVersionSchema],
        
        // Top-level shortcut fields
        applicableLaw: String,
        bailGrounds: String,
        precedents: [precedentSchema],
        defenseStrategy: String,
        courtScript: String,
        constitutionalRights: String,

        approvedAt: Date,
        approvedBy: String,
        
        generatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

researchSchema.methods.getLatestVersion = function() {
    if (this.versions && this.versions.length > 0) {
        return this.versions[this.versions.length - 1];
    }
    return null;
};

module.exports = mongoose.model("Research", researchSchema);
