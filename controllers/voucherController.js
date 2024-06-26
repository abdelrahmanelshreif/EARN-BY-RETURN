const Voucher = require('../model/voucherModel');
const Merchant = require('../model/merchantModel');
const catchAsync = require('../utils/catchAsync');
const voucher = require('voucher-code-generator');
const factory = require('./handlerFactory');

exports.uploadVoucherPhoto = factory.uploadPhoto('voucherPhoto');
exports.getVoucherPhoto = factory.accessPhoto;
exports.createVoucher = catchAsync(async (req, res, next) => {
  let voucherPhoto;
  const { numberOfCodes, voucherMoney } = req.body;
  const merchant = await Merchant.findById(req.params.merchantId);
  const codes = [];
  const vouchers = voucher.generate({
    length: 10,
    count: numberOfCodes
  });

  for (let i = 0; i < numberOfCodes; i++) {
    codes.push({
      code:
        merchant.name.substring(0, 3).toUpperCase() +
        String(voucherMoney) +
        vouchers[i],
      no: i + 1
    });
  }
  if (req.file) {
    const photoURL = `https://earn-by-return.onrender.com/api/v1/photo/${req.file.filename}`;
    voucherPhoto = photoURL;
  }
  const additonalData = {
    merchant: merchant._id,
    codes: codes,
    voucherPhoto: voucherPhoto
  };

  const voucherData = { ...req.body, ...additonalData };

  const newVoucher = await Voucher.create(voucherData);
  res.status(201).json({
    status: 'success',
    data: {
      newVoucher
    }
  });
});
exports.hideUndesiredData = (req, res, next) => {
  req.query.fields = '-codes,-numberOfCodes';
  next();
};
exports.getAllVouchers = factory.getAll(Voucher);
