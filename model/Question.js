const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true,
        trim: true
    },

    tags: [{
        type: String,
        trim: true
    }],

    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    votes: {
        type: Number,
        default: 0
    },

    answersCount: {
        type: Number,
        default: 0
    },

    acceptedAnswer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Answer",
        default: null
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Question", questionSchema);
