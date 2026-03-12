const mongoose = require("mongoose");

const checklistItemSchema = new mongoose.Schema({
    item: String,
    completed: {
        type: Boolean,
        default: false
    }
});

const courtGuideVersionSchema = new mongoose.Schema({
    versionNumber: Number,
    openingStatement: String,
    argumentsSection: String,
    precedentArguments: String,
    prayer: String,
    checklist: [checklistItemSchema],
    changeNote: String,
    savedAt: {
        type: Date,
        default: Date.now
    }
});

const courtGuideSchema = new mongoose.Schema(
    {
        case: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Case",
            required: true,
            unique: true,
        },
        researchVersion: {
            type: Number,
            default: 1,
        },
        currentVersion: {
            type: Number,
            default: 1,
        },
        versions: [courtGuideVersionSchema],
        
        // Top-level shortcut fields
        openingStatement: String,
        argumentsSection: String,
        precedentArguments: String,
        prayer: String,
        checklist: [checklistItemSchema],
        
        generatedAt: {
            type: Date,
            default: Date.now,
        },
        approvedAt: Date,
    },
    { timestamps: true }
);

courtGuideSchema.methods.getLatestVersion = function() {
    if (this.versions && this.versions.length > 0) {
        return this.versions[this.versions.length - 1];
    }
    return null;
};

module.exports = mongoose.model("CourtGuide", courtGuideSchema);
