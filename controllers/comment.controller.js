const Answer = require('../model/Answer');
const Comment = require('../model/Comment');

exports.getCommentsByAnswer = async (req, res) => {
  try {
    const { answerId } = req.params;

    const comments = await Comment.find({ answer: answerId })
      .populate('author', 'prenom nom email')
      .sort({ createdAt: 1 });

    return res.status(200).json({ comments });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.createComment = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Vous devez être connecté.' });
    }

    const { answerId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Le contenu du commentaire est obligatoire.' });
    }

    const answer = await Answer.findById(answerId);

    if (!answer) {
      return res.status(404).json({ message: 'Réponse introuvable.' });
    }

    const comment = await Comment.create({
      content: content.trim(),
      answer: answerId,
      author: req.user._id,
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      'author',
      'prenom nom email'
    );

    return res.status(201).json({
      message: 'Commentaire ajouté avec succès.',
      comment: populatedComment,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Vous devez être connecté.' });
    }

    const { id } = req.params;
    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: 'Commentaire introuvable.' });
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Vous ne pouvez pas supprimer ce commentaire.' });
    }

    await Comment.findByIdAndDelete(id);

    return res.status(200).json({ message: 'Commentaire supprimé avec succès.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
