const mongoose = require('mongoose');


const connectBD = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Mongo DB connecter');
    } catch (error) {
        console.error('Erreur MongoDB: ', error.message);
        process.exit(1);
    }
}

module.exports = connectBD;