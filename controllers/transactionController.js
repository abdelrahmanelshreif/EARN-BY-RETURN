const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const Gift = require('../model/giftModel');
const User = require('../model/userModel');
const Voucher = require('../model/voucherModel');
const AppError = require('../utils/appError');
const Transaction = require('../model/transactionModel');
const factory = require('./handlerFactory');
const Merchant = require('../model/merchantModel');

exports.addGift = catchAsync(async (req, res, next) => {
  const giftId = req.header('Gift-Code');

  // Validate giftId
  if (!mongoose.Types.ObjectId.isValid(giftId)) {
    return next(new AppError('Invalid gift ID', 400));
  }

  //Getting Gift Data
  const gift = await Gift.findById(giftId);

  // if Gift Not Exist
  if (!gift.active || !gift) {
    return next(
      new AppError('The Gift is Invalid Please Try Again with a Valid One', 400)
    );
  }
  await Gift.findByIdAndUpdate(giftId, {
    $set: {
      active: false
    }
  });

  // If it's Exist Adding The Gift Value to the User Wallet
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      $inc: {
        'wallet.canCount': gift.noOfCans,
        'wallet.bottleCount': gift.noOfBottles,
        'wallet.Coins': gift.giftCoins,
        'wallet.Money': gift.giftMoney,
        machineVisits: 1
      },
      $set: {
        'wallet.updatedAt': Date.now()
      }
    },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  await Transaction.create({
    time: Date.now(),
    transactionPoints: gift.giftCoins,
    user: req.user.id,
    gift: giftId
  });

  res.status(200).json({
    status: 'Success',
    message: 'Congratulations You Gift is Successfully Added Check Your Wallet'
  });
});
exports.redeemVoucher = catchAsync(async (req, res, next) => {
  //getting the voucher code from header
  const voucherId = req.header('Voucher-Id');
  //getting voucher data
  const voucher = await Voucher.findOne({
    _id: voucherId
  });
  // if Voucher Not Exist
  if (!voucher) {
    return next(
      new AppError('The voucher is Invalid Please Try another Valid One', 400)
    );
  }
  // Find the first active code of the voucher choosen
  const usedCode = await voucher.codes.find(code => code.active === true);
  //console.log(usedCode);
  // If there's no active code
  if (!usedCode) {
    return next(new AppError('No active code found for the voucher', 400));
  }
  if (usedCode.no === voucher.numberOfCodes) {
    await Voucher.updateOne(
      { _id: voucherId }, // Find voucher by ID
      { $set: { active: false } } // Update active attribute of the found code
    );
  }

  // If it exists--> modify the user wallet
  if (req.user.wallet.Coins >= voucher.voucherPoints) {
    // Change the active attribute
    await Voucher.updateOne(
      { _id: voucherId, 'codes._id': usedCode._id }, // Find voucher by ID and code by ID
      { $set: { 'codes.$.active': false } } // Update active attribute of the found code
    );
    await User.findByIdAndUpdate(
      req.user.id,
      {
        $inc: {
          'wallet.Coins': -voucher.voucherPoints
        },
        $set: {
          'wallet.updatedAt': Date.now()
        }
      },
      { new: true, runValidators: true }
    );
  } else {
    return next(new AppError("Sorry, You Don't Have Enough Coins", 400));
  }

  await Transaction.create({
    time: Date.now(),
    user: req.user.id,
    transactionPoints: voucher.voucherPoints,
    voucher: {
      voucherName: voucher.voucherName,
      voucherId: voucherId,
      codeId: usedCode._id
    }
  });

  res.status(200).json({
    status: 'Success',
    message: `Congratulations You used a Voucher Successfully Please Check Your Wallet and give this code to the Merchant`,
    code: usedCode.code
  });
});
exports.getCurrentUserTransactions = catchAsync(async (req, res, next) => {
  const transactions = await Transaction.find({ user: req.user.id }).select(
    '-user'
  );

  for (let i = 0; i < transactions.length; i++) {
    if (transactions[i].voucher) {
      const voucher = await Voucher.findById(transactions[i].voucher.voucherId);
    }
  }
  res.status(200).json({
    status: 'success',
    results: transactions.length,
    data: {
      transactions
    }
  });
});

exports.getOneTransactionById = catchAsync(async (req, res, next) => {
  const transactionId = req.body.TransactionId;
  const transaction = await Transaction.findOne({
    _id: transactionId
  });
  if (!transaction) {
    return next(new AppError('No Transaction found with this ID.', 404));
  }
  // Check if gift or voucher
  if (transaction.gift) {
    const gift = await Gift.findById(transaction.gift).select(
      '-QRCode -active'
    );
    if (!gift) {
      return next(new AppError('Gift not found.', 404));
    }
    res.status(200).json({
      status: 'success',
      result: gift
    });
  } else if (transaction.voucher) {
    const voucher = await Voucher.findById(transaction.voucher.voucherId);
    if (!voucher) {
      return next(new AppError('Voucher not found.', 404));
    }
    const usedCode = voucher.codes.find(
      code => String(code._id) === String(transaction.voucher.codeId)
    );
    //console.log(transaction.voucher.codeId);
    // If voucher is found, send the details as a response
    res.status(200).json({
      status: 'success',
      result: {
        voucherName: voucher.voucherName,
        voucherMoney: voucher.voucherMoney,
        voucherPoints: voucher.voucherPoints,
        voucherCode: usedCode.code,
        merchant: voucher.merchant.name
      }
    });
  }
});

exports.getAllTransactions = factory.getAll(Transaction);
