const mongoose = require('mongoose');
const fs = require('fs');

const merchantSchema = new mongoose.Schema({
  name: String,
  address: String,
  branches: {
    type: String,
    default: null
  }, 
   merchantPhoto: { 
    name: String,
    data: Buffer },
});

const Merchant = mongoose.model('Merchant', merchantSchema);

module.exports = Merchant;
