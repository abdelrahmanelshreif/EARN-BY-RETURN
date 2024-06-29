const gift = require('../model/giftModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.getProfit = catchAsync(async(req,res,next)=>{
  const gifts = await gift.find();
  let totalGiftMoney = 0;
  let totalCans = 0;
  let totalBottles = 0;

  gifts.forEach(gift => {
    totalGiftMoney += gift.giftMoney;
    totalCans += gift.noOfCans;
    totalBottles += gift.noOfBottles;
  });

  let tot_profit = totalGiftMoney*1.5;

  res.status(200).json({
    profit: tot_profit,
    totalCans: totalCans,
    totalBottles: totalBottles,
    
  });
});