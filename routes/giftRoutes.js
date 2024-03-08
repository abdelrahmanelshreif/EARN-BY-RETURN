const express = require('express');
const userController = require('../controllers/userControllers');
const giftController = require('../controllers/giftController');


const router = express.Router();

router.post('/create',giftController.createGift);

router.get('/:giftId/qrcode',giftController.getQRCode);

module.exports = router;
