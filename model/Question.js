const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    tags: [{
        type: String
    }],

    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
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