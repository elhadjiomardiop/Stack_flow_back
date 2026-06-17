const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    targetType: {
        type: String,
        enum: ["Question", "Answer"]
    },

    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    value: {
        type: Number,
        enum: [1, -1]
    }

});

module.exports = mongoose.model("Vote", voteSchema);