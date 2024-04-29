const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema({
  name: String,
  address: String,
  merchantPhoto: String,
  branches: {
    type: String,
    default: null
  }
});

const Merchant = mongoose.model('Merchant', merchantSchema);

module.exports = Merchant;
