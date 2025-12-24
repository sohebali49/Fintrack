const mongoose = require('mongoose');

const SavingGoalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  targetAmount: {
    type: Number,
    required: true
  },
  savedAmount: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Emergency', 'Vacation', 'Car', 'House', 'Education', 'Other']
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SavingGoal', SavingGoalSchema);