const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors')
//Importation fonction de connexion
const connectBD = require('./config/db');
//import le user route
const userRoute = require('./router/user.route');


//Import express from 'express'




//Appeler la fonction dotenv pour utiliser les variables d'environnement
const app = express();
dotenv.config();
app.use(cors());    
app.use(express.json());

const allowedOrigins = [
    "https://stack-flow-front.vercel.app/",
    "http://localhost:5173",
    ];

    app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
);

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

app.use("/api/auth", userRoute)





