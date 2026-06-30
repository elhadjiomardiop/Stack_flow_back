const express = require('express');
const auth = require('../middleware/auth.middleware');
const {
  getAnswersByQuestion,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  acceptAnswer,
} = require('../controllers/answer.controller');

const router = express.Router();

router.get('/question/:questionId', getAnswersByQuestion);
router.post('/question/:questionId', auth, createAnswer);
router.patch('/:id/accept', auth, acceptAnswer);
router.put('/:id', auth, updateAnswer);
router.delete('/:id', auth, deleteAnswer);

module.exports = router;
