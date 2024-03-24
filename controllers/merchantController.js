const Merchant = require('../model/merchantModel');
const factory = require('./handlerFactory');

exports.createMerchant = factory.createOne(Merchant);
exports.getAllMerchants = factory.getAll(Merchant);
