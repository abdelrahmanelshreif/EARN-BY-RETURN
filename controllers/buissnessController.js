const Gift = require('../model/giftModel');
const User = require('../model/userModel');
const Transaction = require('../model/transactionModel');
const Merchant = require('../model/merchantModel');
const catchAsync = require('../utils/catchAsync');

exports.getProfitAndCansBottlesPerDay = catchAsync(async (req, res, next) => {
  // Calculate the date range for the last 7 days
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(new Date(date.toISOString().split('T')[0]));
  }

  // Aggregate pipeline to fetch cans, bottles, and coins per day from gifts
  const giftsResults = await Gift.aggregate([
    {
      $match: {
        createdAt: {
          $gte: dates[6], // Start of the 7th day ago
          $lt: new Date(dates[0].getTime() + 24 * 60 * 60 * 1000) // End of today
        }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        totalCans: { $sum: '$noOfCans' },
        totalBottles: { $sum: '$noOfBottles' },
        totalCoins: { $sum: '$giftCoins' }
      }
    }
  ]);

  // Aggregate pipeline to fetch coins per day from vouchers in transactions
  const vouchersResults = await Transaction.aggregate([
    {
      $match: {
        createdAt: {
          $gte: dates[6], // Start of the 7th day ago
          $lt: new Date(dates[0].getTime() + 24 * 60 * 60 * 1000) // End of today
        },
        'voucher.voucherId': { $exists: true, $ne: null } // Vouchers that have a voucherId
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        totalCoins: { $sum: '$transactionPoints' }
      }
    }
  ]);

  // Calculate profit metrics for the last 7 days and total
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const giftsLast7Days = await Gift.find({ createdAt: { $gte: sevenDaysAgo } });
  const usersLast7Days = await User.find({ createdAt: { $gte: sevenDaysAgo } });
  const transLast7Days = await Transaction.find({ time: { $gte: sevenDaysAgo } });
  const giftsTotal = await Gift.find();
  const usersTotal = await User.countDocuments();

  let totalGiftMoneyLast7Days = 0;
  let totalGiftCoinsLast7Days = 0;
  let totalCansLast7Days = 0;
  let totalBottlesLast7Days = 0;
  let usersCountLast7Days = usersLast7Days.length;
  let transactionsCountLast7Days = transLast7Days.length;

  let totalGiftMoney = 0;
  let totalGiftCoins = 0;
  let totalCans = 0;
  let totalBottles = 0;
  let transactionCount = await Transaction.countDocuments();

  giftsLast7Days.forEach(gift => {
    totalGiftMoneyLast7Days += gift.giftMoney;
    totalGiftCoinsLast7Days += gift.giftCoins;
    totalCansLast7Days += gift.noOfCans;
    totalBottlesLast7Days += gift.noOfBottles;
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

  const percentageChangeTransactions = calculatePercentageChange(
    transactionsCountLast7Days ,
    transactionCount 
  );

  // Get top merchants based on number of redeems
  const topMerchants = await Merchant.find()
    .sort({ noOfRedeems: -1 })
    .limit(5)
    .select('name noOfRedeems');

  // Transform results to ensure all dates in the last 7 days are included
  const formattedResults = dates.map(date => {
    const foundGifts = giftsResults.find(
      result => result._id === date.toISOString().split('T')[0]
    );
    const foundVouchers = vouchersResults.find(
      result => result._id === date.toISOString().split('T')[0]
    );

    return {
      _id: {
        date: date.toISOString().split('T')[0],
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' })
      },
      totalCans: foundGifts ? foundGifts.totalCans : 0,
      totalBottles: foundGifts ? foundGifts.totalBottles : 0,
      totalGiftCoins: foundGifts ? foundGifts.totalCoins : 0,
      totalVoucherCoins: foundVouchers ? foundVouchers.totalCoins : 0
    };
  });

  formattedResults.sort((a, b) => new Date(a._id.date) - new Date(b._id.date));

  // Return combined results
  res.status(200).json({
    profitData: {
      totalUsers: usersTotal,
      totalCans: totalCans,
      totalCoins: totalGiftCoins,
      transactionCount: transactionCount,
      profit: totalGiftMoney * 1.5,
      totalBottles: totalBottles,
      topMerchants: topMerchants,
      last7Days: {
        users: usersCountLast7Days,
        transactions: transactionsCountLast7Days,
        cans: totalCansLast7Days,
        coins: totalGiftCoinsLast7Days,
        profit: totalGiftMoneyLast7Days * 1.5,
        bottles: totalBottlesLast7Days,
        percentageChange: {
          users: percentageChangeUsers,
          transactions:percentageChangeTransactions,
          cans: percentageChangeCans,
          coins: percentageChangeCoins,
          profit: percentageChangeProfit,
          bottles: percentageChangeBottles
        }
      }
    },
    cansBottlesData: {
      results: formattedResults
    }
  });
});
