const express = require('express');
const Gift = require('../model/giftModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.createGift = catchAsync(async (req, res, next) => {
  const { noOfCans, noOfBottles } = req.body;

  const newGift = await Gift.create({
    noOfCans: noOfCans,
    noOfBottles: noOfBottles,
    giftCoins: 15 * noOfCans + 8.5 * noOfBottles,
    giftMoney: (15 * noOfCans + 8.5 * noOfBottles) * 0.0416,
  });
  res.status(201).json({
    status:'success',
    data:{
      newGift
    }
  });
});


exports.getQRCode = catchAsync(async (req,res,next)=>{
  const { giftId } = req.params;
  const gift = await Gift.findById(giftId);

  if (!gift) {
    return next(new AppError('Gift not found', 404));
  }

    // Send the QR code image as a response
    res.type('png');
    res.send(Buffer.from(gift.QRCode.split('base64,')[1], 'base64'));
});


