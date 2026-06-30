const Question = require('../model/Question');
const Answer = require('../model/Answer');
const Vote = require('../model/Vote');

const getTargetModel = (targetType) => {
  if (targetType === 'Question') return Question;
  if (targetType === 'Answer') return Answer;
  return null;
};

exports.castVote = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Vous devez être connecté.' });
    }

    const { targetType, targetId, value } = req.body;

    if (!['Question', 'Answer'].includes(targetType)) {
      return res.status(400).json({ message: 'Type de cible invalide.' });
    }

    if (![1, -1].includes(Number(value))) {
      return res.status(400).json({ message: 'La valeur du vote doit être 1 ou -1.' });
    }

    const model = getTargetModel(targetType);
    const target = await model.findById(targetId);

    if (!target) {
      return res.status(404).json({ message: 'Élément introuvable.' });
    }

    const existingVote = await Vote.findOne({
      user: req.user._id,
      targetType,
      targetId,
    });

    let delta = Number(value);
    let vote;

    if (existingVote) {
      if (existingVote.value === Number(value)) {
        delta = -existingVote.value;
        await Vote.findByIdAndDelete(existingVote._id);
        vote = null;
      } else {
        delta = Number(value) - existingVote.value;
        existingVote.value = Number(value);
        await existingVote.save();
        vote = existingVote;
      }
    } else {
      vote = await Vote.create({
        user: req.user._id,
        targetType,
        targetId,
        value: Number(value),
      });
    }

    await model.findByIdAndUpdate(targetId, {
      $inc: { votes: delta },
    });

    const updatedTarget = await model.findById(targetId).select('votes');

    return res.status(200).json({
      message: 'Vote enregistré.',
      vote,
      votes: updatedTarget?.votes ?? target.votes + delta,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.removeVote = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Vous devez être connecté.' });
    }

    const { targetType, targetId } = req.body;

    if (!['Question', 'Answer'].includes(targetType)) {
      return res.status(400).json({ message: 'Type de cible invalide.' });
    }

    const model = getTargetModel(targetType);
    const vote = await Vote.findOne({
      user: req.user._id,
      targetType,
      targetId,
    });

    if (!vote) {
      return res.status(404).json({ message: 'Vote introuvable.' });
    }

    await Promise.all([
      Vote.findByIdAndDelete(vote._id),
      model.findByIdAndUpdate(targetId, {
        $inc: { votes: -vote.value },
      }),
    ]);

    const updatedTarget = await model.findById(targetId).select('votes');

    return res.status(200).json({
      message: 'Vote supprimé.',
      votes: updatedTarget?.votes ?? 0,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
