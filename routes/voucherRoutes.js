const express = require('express');
const voucherController = require('../controllers/voucherController');

//const router = express.Router();
const router = express.Router({ mergeParams: true });

router.post(
  '/',
  voucherController.uploadVoucherPhoto,
  voucherController.createVoucher
);
router.get(
  '/',
  voucherController.hideUndesiredData,
  voucherController.getAllVouchers
);
router.route('/photo/:filename').get(voucherController.getVoucherPhoto);
module.exports = router;
