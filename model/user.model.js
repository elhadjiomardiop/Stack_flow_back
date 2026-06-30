const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        pseudo: {
            type: String,
            trim: true,
            default: function () {
                const prenom = this.prenom ? this.prenom.trim().toLowerCase() : 'user';
                const nom = this.nom ? this.nom.trim().toLowerCase() : 'member';
                return `${prenom}.${nom}`;
            },
        },

        prenom : {
            type : String ,
            required : true,
            trim: true
        },

        nom : {
            type : String ,
            required : true,
            trim: true
        },

        email : {
            type : String ,
            required : true ,
            unique : true,
            trim: true,
            lowercase: true
        },

        password : {
            type : String ,
            required : true
        },

        image: {
            type: String,
            default: '',
        },

        activity: {
            questionsAsked: {
                type: Number,
                default: 0,
            },
            answersGiven: {
                type: Number,
                default: 0,
            },
            commentsWritten: {
                type: Number,
                default: 0,
            },
            votesGiven: {
                type: Number,
                default: 0,
            },
        },
    },
    {timestamps :true}

    

);


module.exports = mongoose.model("User" , userSchema);

