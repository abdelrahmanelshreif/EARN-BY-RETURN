const Merchant = require('../model/merchantModel');
const factory = require('./handlerFactory');

exports.uploadMerchantphoto = factory.uploadMerchantPhoto('merchantPhoto');
exports.getAllMerchants = factory.getAll(Merchant);
exports.createMerchant = factory.createOne(Merchant);
