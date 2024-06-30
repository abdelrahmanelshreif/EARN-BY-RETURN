const gift = require('../model/giftModel');
const user = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.getProfit = catchAsync(async(req,res,next)=>{
  const gifts = await gift.find();
  const users = await user.find();
  let totalGiftMoney = 0;
  let totalGiftCoins = 0;
  let totalCans = 0;
  let totalBottles = 0;
  let usersCount= 0;

  gifts.forEach(gift => {
    totalGiftMoney += gift.giftMoney;
    totalGiftCoins += gift.giftCoins;
    totalCans += gift.noOfCans;
    totalBottles += gift.noOfBottles;
  });

  users.forEach(user => {

    usersCount +=1;
  });


  let tot_profit = totalGiftMoney*1.5;

  res.status(200).json({
    tot_users: usersCount,
    totalCans: totalCans,
    totalCoins: totalGiftCoins,
    profit: tot_profit,
    totalBottles: totalBottles,
    
  });
});