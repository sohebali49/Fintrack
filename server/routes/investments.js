const express = require('express');
const router = express.Router();
const Investment = require('../models/Investment');

// GET all investments
router.get('/', async (req, res) => {
  try {
    const investments = await Investment.find().sort({ date: -1 });
    res.json(investments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create investment
router.post('/', async (req, res) => {
  const investment = new Investment({
    name: req.body.name,
    type: req.body.type,
    amount: req.body.amount,
    currentValue: req.body.currentValue,
    date: req.body.date || Date.now()
  });

  try {
    const newInvestment = await investment.save();
    res.status(201).json(newInvestment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update investment
router.put('/:id', async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    if (req.body.name) investment.name = req.body.name;
    if (req.body.type) investment.type = req.body.type;
    if (req.body.amount) investment.amount = req.body.amount;
    if (req.body.currentValue) investment.currentValue = req.body.currentValue;

    const updatedInvestment = await investment.save();
    res.json(updatedInvestment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE investment
router.delete('/:id', async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    await investment.deleteOne();
    res.json({ message: 'Investment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;