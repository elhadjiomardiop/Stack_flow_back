const express = require('express');
const auth = require('../middleware/auth.middleware');
const {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} = require('../controllers/question.controller');

const router = express.Router();

router.get('/', getQuestions);
router.post('/', auth, createQuestion);
router.get('/:id', getQuestionById);
router.put('/:id', auth, updateQuestion);
router.delete('/:id', auth, deleteQuestion);

module.exports = router;
