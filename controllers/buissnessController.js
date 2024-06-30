const Gift = require('../model/giftModel');
const User = require('../model/userModel');
const Merchant = require('../model/merchantModel');
const catchAsync = require('../utils/catchAsync');

exports.getProfit = catchAsync(async (req, res, next) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const giftsLast7Days = await Gift.find({ createdAt: { $gte: sevenDaysAgo } });
  const usersLast7Days = await User.find({ createdAt: { $gte: sevenDaysAgo } });
  const giftsTotal = await Gift.find();
  const usersTotal = await User.countDocuments();

  let totalGiftMoneyLast7Days = 0;
  let totalGiftCoinsLast7Days = 0;
  let totalCansLast7Days = 0;
  let totalBottlesLast7Days = 0;
  let usersCountLast7Days = 0;

  let totalGiftMoney = 0;
  let totalGiftCoins = 0;
  let totalCans = 0;
  let totalBottles = 0;

  giftsLast7Days.forEach(gift => {
    totalGiftMoneyLast7Days += gift.giftMoney;
    totalGiftCoinsLast7Days += gift.giftCoins;
    totalCansLast7Days += gift.noOfCans;
    totalBottlesLast7Days += gift.noOfBottles;
  });
  usersLast7Days.forEach(user => {
    usersCountLast7Days += 1;
  });

  giftsTotal.forEach(gift => {
    totalGiftMoney += gift.giftMoney;
    totalGiftCoins += gift.giftCoins;
    totalCans += gift.noOfCans;
    totalBottles += gift.noOfBottles;
  });
  const calculatePercentageChange = (last7Days, total) => {
    if (total === 0) return 0;
    return (last7Days / total) * 100;
  };

  const percentageChangeUsers = calculatePercentageChange(
    usersCountLast7Days,
    usersTotal
  );
  const percentageChangeCans = calculatePercentageChange(
    totalCansLast7Days,
    totalCans
  );
  const percentageChangeCoins = calculatePercentageChange(
    totalGiftCoinsLast7Days,
    totalGiftCoins
  );
  const percentageChangeBottles = calculatePercentageChange(
    totalBottlesLast7Days,
    totalBottles
  );
  const percentageChangeProfit = calculatePercentageChange(
    totalGiftMoneyLast7Days * 1.5,
    totalGiftMoney * 1.5
  );

  // Get top merchants based on number of redeems
  const topMerchants = await Merchant.find()
    .sort({ noOfRedeems: -1 })
    .limit(5)
    .select('name');

  res.status(200).json({
    tot_users: usersTotal,
    totalCans: totalCans,
    totalCoins: totalGiftCoins,
    profit: totalGiftMoney * 1.5,
    totalBottles: totalBottles,
    topMerchants: topMerchants,
    last7Days: {
      users: usersCountLast7Days,
      cans: totalCansLast7Days,
      coins: totalGiftCoinsLast7Days,
      profit: totalGiftMoneyLast7Days * 1.5,
      bottles: totalBottlesLast7Days
    },
    percentageChange: {
      users: percentageChangeUsers,
      cans: percentageChangeCans,
      coins: percentageChangeCoins,
      profit: percentageChangeProfit,
      bottles: percentageChangeBottles
    }
  });
});
