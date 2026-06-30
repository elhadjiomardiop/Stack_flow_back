const express = require('express');
const auth = require('../middleware/auth.middleware');
const {
  getCommentsByAnswer,
  createComment,
  deleteComment,
} = require('../controllers/comment.controller');

const router = express.Router();

router.get('/answer/:answerId', getCommentsByAnswer);
router.post('/answer/:answerId', auth, createComment);
router.delete('/:id', auth, deleteComment);

module.exports = router;
