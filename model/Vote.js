const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    targetType: {
        type: String,
        enum: ["Question", "Answer"],
        required: true
    },

    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    value: {
        type: Number,
        enum: [1, -1],
        required: true
    }

}, {
    timestamps: true
});

voteSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

module.exports = mongoose.model("Vote", voteSchema);
