const express = require('express');
const voucherRouter = require('./voucherRoutes');
const merchantController = require('../controllers/merchantController');
const authController = require('../controllers/authController');

const router = express.Router();
router.use('/:merchantId/vouchers', voucherRouter);
router.use(authController.protect);
router
  .route('/')
  .get(merchantController.getAllMerchants)
  .post(
    authController.restrictTo('admin'),
    merchantController.uploadMerchantphoto,
    merchantController.createMerchant
  );
module.exports = router;
