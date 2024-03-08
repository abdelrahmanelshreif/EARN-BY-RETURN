const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema({
  name: String,
  address: String
});

const Merchant = mongoose.model('Merchant', merchantSchema);

module.exports = Merchant;
