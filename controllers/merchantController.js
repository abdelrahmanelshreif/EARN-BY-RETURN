const Merchant = require('../model/merchantModel');
const factory = require('./handlerFactory');

exports.uploadMerchantphoto = factory.uploadPhoto('merchant', 'merchantPhoto');
exports.createMerchant = factory.createOne(Merchant);
exports.getAllMerchants = factory.getAll(Merchant);
