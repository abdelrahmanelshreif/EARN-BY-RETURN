const express = require('express');
const transactionController = require('../controllers/transactionController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/add-gift', authController.protect, transactionController.addGift);
// Adminstrator Features On Transaction Protection
router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    transactionController.getAllTransactions
  );
module.exports = router;
