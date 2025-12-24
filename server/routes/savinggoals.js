const express = require('express');
const router = express.Router();
const SavingGoal = require('../models/SavingGoal');

// GET all saving goals
router.get('/', async (req, res) => {
  try {
    const goals = await SavingGoal.find().sort({ date: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create saving goal
router.post('/', async (req, res) => {
  const goal = new SavingGoal({
    title: req.body.title,
    targetAmount: req.body.targetAmount,
    savedAmount: req.body.savedAmount || 0,
    category: req.body.category,
    date: req.body.date || Date.now()
  });

  try {
    const newGoal = await goal.save();
    res.status(201).json(newGoal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update saving goal
router.put('/:id', async (req, res) => {
  try {
    const goal = await SavingGoal.findById(req.params.id);
    if (!goal) {
      return res.status(404).json({ message: 'Saving goal not found' });
    }

    if (req.body.title) goal.title = req.body.title;
    if (req.body.targetAmount) goal.targetAmount = req.body.targetAmount;
    if (req.body.savedAmount !== undefined) goal.savedAmount = req.body.savedAmount;
    if (req.body.category) goal.category = req.body.category;

    const updatedGoal = await goal.save();
    res.json(updatedGoal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE saving goal
router.delete('/:id', async (req, res) => {
  try {
    const goal = await SavingGoal.findById(req.params.id);
    if (!goal) {
      return res.status(404).json({ message: 'Saving goal not found' });
    }

    await goal.deleteOne();
    res.json({ message: 'Saving goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;