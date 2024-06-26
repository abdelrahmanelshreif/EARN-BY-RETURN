const express = require('express');
const transactionController = require('../controllers/transactionController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.post('/add-gift', authController.protect, transactionController.addGift);
router.get(
  '/useVoucher/:VoucherID',
  authController.protect,
  transactionController.redeemVoucher
);

// Adminstrator Features On Transaction Protection
router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    transactionController.getAllTransactions
  );

module.exports = router;
