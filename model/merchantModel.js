const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema({
  name: String,
  merchantPhoto: { type: String, default: null },
  address: String,
  branches: {
    type: String,
    default: null
  },
  // logo: { type: String, default: null },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  noOfRedeems: {
    type: Number,
    default: 0
  }
});

const Merchant = mongoose.model('Merchant', merchantSchema);

module.exports = Merchant;
