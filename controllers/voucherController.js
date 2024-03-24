const Voucher = require('../model/voucherModel');
const Merchant = require('../model/merchantModel');
const catchAsync = require('../utils/catchAsync');
const voucher = require('voucher-code-generator');
const factory = require('./handlerFactory');

exports.createVoucher = catchAsync(async (req, res, next) => {
  const { voucherMoney, voucherPoints, validDays, numberOfVouchers } = req.body;
  const merchant = await Merchant.findById(req.params.merchantId);
  const codes = [];
  const vouchers = voucher.generate({
    length: 10,
    count: numberOfVouchers
  });

  for (let i = 0; i < numberOfVouchers; i++) {
    codes.push({
      code:
        merchant.name.substring(0, 3).toUpperCase() +
        String(voucherMoney) +
        vouchers[i]
    });
  }

  const newVoucher = await Voucher.create({
    merchant: merchant._id,
    voucherPoints: voucherPoints,
    voucherMoney: voucherMoney,
    validDays: validDays,
    codes: codes
  });
  res.status(201).json({
    status: 'success',
    data: {
      newVoucher
    }
  });
});
exports.hideUndesiredData = (req, res, next) => {
  req.query.fields = '-codes';
  next();
};
exports.getAllVouchers = factory.getAll(Voucher);
