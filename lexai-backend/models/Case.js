const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema(
    {
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
            default: "pending",
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
    },
    {
        timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    }
);

// --------------- Pre-save hook: auto-generate caseCode ---------------
caseSchema.pre("save", async function (next) {
    // Only generate on new documents
    if (!this.isNew || this.caseCode) return next();

    try {
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

        next();
    } catch (err) {
        next(err);
    }
});

const Case = mongoose.model("Case", caseSchema);

module.exports = Case;
