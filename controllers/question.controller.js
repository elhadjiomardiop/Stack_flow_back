const Question = require('../model/Question');
const Answer = require('../model/Answer');
const Comment = require('../model/Comment');
const Vote = require('../model/Vote');

const normalizeTags = (tags) => {
  if (Array.isArray(tags)) {
    return [...new Set(tags.map((tag) => String(tag).trim()).filter(Boolean))];
  }

  if (typeof tags === 'string') {
    return [...new Set(tags.split(',').map((tag) => tag.trim()).filter(Boolean))];
  }

  return [];
};

exports.createQuestion = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Vous devez être connecté.' });
    }

    const { title, description, tags } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Le titre et la description sont obligatoires.' });
    }

    const question = await Question.create({
      title: title.trim(),
      description: description.trim(),
      tags: normalizeTags(tags),
      author: req.user._id,
    });

    const populatedQuestion = await Question.findById(question._id).populate(
      'author',
      'prenom nom email'
    );

    return res.status(201).json({
      message: 'Question créée avec succès.',
      question: populatedQuestion,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    const {
      search = '',
      tag = '',
      sortBy = 'recent',
      status = '',
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
      ];
    }

    if (tag.trim()) {
      filter.tags = tag.trim();
    }

    if (status === 'unsolved') {
      filter.acceptedAnswer = null;
    }

    const sort = {};

    if (sortBy === 'popular') {
      sort.votes = -1;
      sort.createdAt = -1;
    } else if (sortBy === 'oldest') {
      sort.createdAt = 1;
    } else {
      sort.createdAt = -1;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .populate('author', 'prenom nom email')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Question.countDocuments(filter),
    ]);

    return res.status(200).json({
      questions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.max(1, Math.ceil(total / Number(limit))),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findById(id)
      .populate('author', 'prenom nom email')
      .populate({
        path: 'acceptedAnswer',
        populate: {
          path: 'author',
          select: 'prenom nom email',
        },
      });

    if (!question) {
      return res.status(404).json({ message: 'Question introuvable.' });
    }

    const answers = await Answer.find({ question: id })
      .populate('author', 'prenom nom email')
      .sort({ isAccepted: -1, votes: -1, createdAt: 1 });

    const comments = await Comment.find({
      answer: { $in: answers.map((answer) => answer._id) },
    })
      .populate('author', 'prenom nom email')
      .sort({ createdAt: 1 });

    const answersWithComments = answers.map((answer) => ({
      ...answer.toObject(),
      comments: comments.filter(
        (comment) => comment.answer.toString() === answer._id.toString()
      ),
    }));

    return res.status(200).json({
      question,
      answers: answersWithComments,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Vous devez être connecté.' });
    }

    const { id } = req.params;
    const { title, description, tags } = req.body;

    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({ message: 'Question introuvable.' });
    }

    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Vous ne pouvez pas modifier cette question.' });
    }

    question.title = title?.trim() || question.title;
    question.description = description?.trim() || question.description;
    if (tags !== undefined) {
      question.tags = normalizeTags(tags);
    }

    await question.save();

    const updatedQuestion = await Question.findById(id).populate(
      'author',
      'prenom nom email'
    );

    return res.status(200).json({
      message: 'Question mise à jour avec succès.',
      question: updatedQuestion,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Vous devez être connecté.' });
    }

    const { id } = req.params;
    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({ message: 'Question introuvable.' });
    }

    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Vous ne pouvez pas supprimer cette question.' });
    }

    const answers = await Answer.find({ question: id }).select('_id');
    const answerIds = answers.map((answer) => answer._id);

    await Promise.all([
      Comment.deleteMany({ answer: { $in: answerIds } }),
      Vote.deleteMany({
        $or: [
          { targetType: 'Question', targetId: id },
          { targetType: 'Answer', targetId: { $in: answerIds } },
        ],
      }),
      Answer.deleteMany({ question: id }),
      Question.findByIdAndDelete(id),
    ]);

    return res.status(200).json({ message: 'Question supprimée avec succès.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
