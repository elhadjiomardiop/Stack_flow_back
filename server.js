const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors')
const mongoose = require('mongoose');
//Importation fonction de connexion
const connectBD = require('./config/db');
const authRoute = require('./router/auth.routes');
const questionRoute = require('./router/question.routes');
const answerRoute = require('./router/answer.routes');
const commentRoute = require('./router/comment.routes');
const voteRoute = require('./router/vote.routes');


//Import express from 'express'




//Appeler la fonction dotenv pour utiliser les variables d'environnement
const app = express();
dotenv.config();
const allowedOrigins = [
    process.env.FRONTEND_URL,
    "https://stack-flow-front.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
    })
);
app.use(express.json());

connectBD();



const PORT = process.env.PORT || 3000;



//Dynamiser la valeur du port en utilisant une variable d'environnement
app.listen(PORT, () => {
    console.log(`Server demarrer sur http://localhost:${PORT}/`);
})

//Route de teste
app.get('/', (req, res) => {
    res.send('Bienvenue sur mon server express')
})

app.get('/api/health', (req, res) => {
    res.json({
        ok: true,
        dbState: mongoose.connection.readyState,
    });
});

app.use("/api/auth", authRoute);
app.use("/api/questions", questionRoute);
app.use("/api/answers", answerRoute);
app.use("/api/comments", commentRoute);
app.use("/api/votes", voteRoute);





