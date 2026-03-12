const mongoose = require("mongoose");

// HearingSchema — defined ABOVE CaseSchema in models/Case.js
const HearingSchema = new mongoose.Schema({
    previousDate: { type: Date },
    adjournDate:  { type: Date, required: true },
    step:         { type: String },   // "Summon", "Arguments", "Judgment" etc.
    notes:        { type: String },   // optional notes about this hearing
    addedBy:      { type: String },   // lawyer name
    addedAt:      { type: Date, default: Date.now },
}, { _id: true });

const caseSchema = new mongoose.Schema(
    {
        // ── EXISTING FIELDS (keep as-is) ──────────────────────────
        title: {
            type: String,
            required: [true, "Case title is required"],
            trim: true,
        },
        clientName: {
            type: String,
            required: [true, "Client name is required"],
            trim: true,
        },
        section: {
            type: String,
            trim: true,
            default: "",
        },
        caseType: {
            type: String,
            trim: true,
            default: "",
        },
        court: {
            type: String,
            trim: true,
            default: "",
        },
        status: {
            type: String,
            enum: {
                values: ["active", "pending", "done", "urgent", "closed"],
                message: "{VALUE} is not a valid status",
            },
            default: "active",
        },
        outcome: {
            type: String,
            enum: ["ongoing", "won", "lost", "settled", "dismissed"],
            default: "ongoing",
        },
        lawyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Lawyer reference is required"],
        },
        caseCode: {
            type: String,
            unique: true,
        },
        language: {
            type: String,
            enum: ["english", "urdu", "roman"],
            default: "english",
        },

        // ── NEW FIELDS ────────────────────────────────────────────
        caseNumber: {
            type: String,
        },
        caseYear: {
            type: String,
        },
        onBehalfOf: {
            type: String,
            enum: ["Plaintiff", "Defendant", "Petitioner", "Respondent", "Complainant", "Accused"],
        },
        partyName: {
            type: String,
        },
        contactNo: {
            type: String,
        },
        respondentName: {
            type: String,
        },
        firNumber: {
            type: String,
        },
        policeStation: {
            type: String,
        },
        adverseAdvocateName: {
            type: String,
        },
        adverseAdvocateContact: {
            type: String,
        },

        // ── HEARING HISTORY ──────────────────────────────────────
        hearings: [HearingSchema],

        // ── TIMESTAMPS ───────────────────────────────────────────
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    }
);

// --------------- Pre-save hook: auto-generate caseCode ---------------
caseSchema.pre("save", async function () {
    // Only generate on new documents
    if (!this.isNew || this.caseCode) return;

    const year = new Date().getFullYear();

    // Count existing cases for the current year to determine the next sequence
    const yearStart = new Date(`${year}-01-01T00:00:00.000Z`);
    const yearEnd = new Date(`${year + 1}-01-01T00:00:00.000Z`);

    const count = await mongoose.model("Case").countDocuments({
        createdAt: { $gte: yearStart, $lt: yearEnd },
    });

    // Sequence is zero-padded to 4 digits → CR-2026-0001
    const sequence = String(count + 1).padStart(4, "0");
    this.caseCode = `CR-${year}-${sequence}`;
});

const Case = mongoose.model("Case", caseSchema);

module.exports = Case;
