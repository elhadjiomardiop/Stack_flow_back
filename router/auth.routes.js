const express = require('express');
const { inscription, connexion } = require('../controllers/user.controller');

const router = express.Router();

router.post('/inscription', inscription);
router.post('/connexion', connexion);

module.exports = router;
