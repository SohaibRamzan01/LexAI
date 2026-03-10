const mongoose = require("mongoose");

const researchSchema = new mongoose.Schema({
    case: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Case",
        required: [true, "Case reference is required"],
        unique: true,
    },
    sections: [
        {
            id: String,
            icon: String,
            title: String,
            tag: String,
            content: String,
            highlight: String,
            items: [
                {
                    title: String,
                    detail: String,
                }
            ],
            precedents: [
                {
                    name: String,
                    year: String,
                    court: String,
                    detail: String,
                }
            ]
        }
    ],
    generatedAt: {
        type: Date,
        default: Date.now,
    },
});

const Research = mongoose.model("Research", researchSchema);

module.exports = Research;
