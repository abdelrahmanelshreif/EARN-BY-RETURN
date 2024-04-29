const express = require('express');
const voucherRouter = require('./voucherRoutes');
const merchantController = require('../controllers/merchantController');

const router = express.Router();
router.use('/:merchantId/vouchers', voucherRouter);

router
  .route('/')
  .get(merchantController.getAllMerchants)
  .post(
    merchantController.uploadMerchantphoto,
    merchantController.createMerchant
  );

module.exports = router;
