const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const Gift = require('../model/giftModel');
const User = require('../model/userModel');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const Transaction = require('../model/transactionModel');

exports.addGift = catchAsync(async(req,res,next)=>{
  const giftId = req.header('Gift-Code');

  // Validate giftId  
  if (!mongoose.Types.ObjectId.isValid(giftId)) {
    return next(new AppError('Invalid gift ID', 400));
  }

  //Getting Gift Data
  const gift = await Gift.findById(giftId);

  // if Gift Not Exist 
  if (!gift) {
    return next(new AppError('The Gift is Invalid Please Try Again with a Valid One',400));
  }

  // If it's Exist Adding The Gift Value to the User Wallet
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      $inc: {
        'wallet.canCount': gift.noOfCans,
        'wallet.bottleCount': gift.noOfBottles,
        'wallet.Coins': gift.giftCoins,
        'wallet.Money': gift.giftMoney
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

  const transaction = await Transaction.create({
    time: Date.now(),
    user: req.user.id,
    gift: giftId
  });

  res.status(200).json({
    status: 'Success',
    message: 'Congratulations You Gift is Successfully Added Check Your Wallet',
  });

});