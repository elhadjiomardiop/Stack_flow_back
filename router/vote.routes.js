const express = require('express');
const auth = require('../middleware/auth.middleware');
const { castVote, removeVote } = require('../controllers/vote.controller');

const router = express.Router();

router.post('/', auth, castVote);
router.delete('/', auth, removeVote);

module.exports = router;
