const mongoose = require('mongoose');

const InvestmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Stock', 'SIP', 'Crypto', 'Gold', 'Bond', 'RealEstate', 'Other']
  },
  amount: {
    type: Number,
    required: true
  },
  currentValue: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Investment', InvestmentSchema);