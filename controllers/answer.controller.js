const Question = require('../model/Question');
const Answer = require('../model/Answer');
const Comment = require('../model/Comment');
const Vote = require('../model/Vote');

exports.getAnswersByQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    const answers = await Answer.find({ question: questionId })
      .populate('author', 'prenom nom email')
      .sort({ isAccepted: -1, votes: -1, createdAt: 1 });

    return res.status(200).json({ answers });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.createAnswer = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Vous devez être connecté.' });
    }

    const { questionId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Le contenu de la réponse est obligatoire.' });
    }

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ message: 'Question introuvable.' });
    }

    const answer = await Answer.create({
      content: content.trim(),
      question: questionId,
      author: req.user._id,
    });

    question.answersCount += 1;
    await question.save();

    const populatedAnswer = await Answer.findById(answer._id).populate(
      'author',
      'prenom nom email'
    );

    return res.status(201).json({
      message: 'Réponse ajoutée avec succès.',
      answer: populatedAnswer,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateAnswer = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Vous devez être connecté.' });
    }

    const { id } = req.params;
    const { content } = req.body;

    const answer = await Answer.findById(id);

    if (!answer) {
      return res.status(404).json({ message: 'Réponse introuvable.' });
    }

    if (answer.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Vous ne pouvez pas modifier cette réponse.' });
    }

    answer.content = content?.trim() || answer.content;
    await answer.save();

    const updatedAnswer = await Answer.findById(id).populate('author', 'prenom nom email');

    return res.status(200).json({
      message: 'Réponse mise à jour avec succès.',
      answer: updatedAnswer,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteAnswer = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Vous devez être connecté.' });
    }

    const { id } = req.params;
    const answer = await Answer.findById(id);

    if (!answer) {
      return res.status(404).json({ message: 'Réponse introuvable.' });
    }

    if (answer.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Vous ne pouvez pas supprimer cette réponse.' });
    }

    await Promise.all([
      Comment.deleteMany({ answer: id }),
      Vote.deleteMany({
        targetType: 'Answer',
        targetId: id,
      }),
      Question.findByIdAndUpdate(answer.question, {
        $inc: { answersCount: -1 },
      }),
      Answer.findByIdAndDelete(id),
    ]);

    return res.status(200).json({ message: 'Réponse supprimée avec succès.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.acceptAnswer = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Vous devez être connecté.' });
    }

    const { id } = req.params;
    const answer = await Answer.findById(id);

    if (!answer) {
      return res.status(404).json({ message: 'Réponse introuvable.' });
    }

    const question = await Question.findById(answer.question);

    if (!question) {
      return res.status(404).json({ message: 'Question introuvable.' });
    }

    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Seul l’auteur de la question peut accepter une réponse.' });
    }

    if (question.acceptedAnswer && question.acceptedAnswer.toString() !== id) {
      await Answer.findByIdAndUpdate(question.acceptedAnswer, { isAccepted: false });
    }

    answer.isAccepted = true;
    question.acceptedAnswer = answer._id;

    await Promise.all([answer.save(), question.save()]);

    return res.status(200).json({ message: 'Réponse marquée comme meilleure réponse.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
