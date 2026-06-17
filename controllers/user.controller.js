const User = require('../model/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

//Inscription
exports.inscription = async (req, res) => {
    try {
        const {prenom , nom , email , password } = req.body;

        //Vérifier si l'email existe déja

        let user = await User.findOne({email});

        //S'il existe il te dira que l'utilisateur à déja un compte avec une message d'erreur

        if(user){
            return res.status(400).json({message: "Utilisateur existe Déja"})
        }

        //Si c'est pas le cas on continue

        //On crypte le password

        const verification = await bcrypt.genSalt(10);
        const passwordHasher = await bcrypt.hash(password, verification);

        // Créer l'utilisateur

        user = await User.create({
            prenom ,
            nom ,
            email ,
            password: passwordHasher
        });

        res.status(201).json({message: "Inscription réussie !"});


    } catch (error) {
        res.status(500).json(error);
        console.log(error);
    }
}


// Connexion

exports.connexion = async (req, res) => {
    try{

    const { email, password } = req.body;

    //Vérifier si l'utilisateur existe
    const user = await User.findOne({email})

    if(!user){
        return res.status(400).json({
            message: "Email ou mot de passe incorrect"
        })
    }

    //Compare les mots de passe saisie
    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch){
        return res.status(400).json({
            message: "Email ou mot de passe incorrect"
        });
    }

    //Générer le token
    const token = jwt.sign(
        {
            id: user._id
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );

    res.status(200).json({
        message: "Connexions réussi",
        token,
        user: {
            id: user._id,
            prenom: user.prenom,
            nom: user.nom,
            email: user.email
        }
    })

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}