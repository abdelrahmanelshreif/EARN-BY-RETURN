const express = require('express');
const transactionController = require('../controllers/transactionController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.post('/add-gift', authController.protect, transactionController.addGift);
router.post(
  '/useVoucher',
  authController.protect,
  transactionController.redeemVoucher
);

router.get('/gift/:giftID',transactionController.giftDetails);

// Adminstrator Features On Transaction Protection
router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    transactionController.getAllTransactions
  );

module.exports = router;
