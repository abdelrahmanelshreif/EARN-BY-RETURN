const express = require('express');
const transactionController = require('../controllers/transactionController');
const authController = require('../controllers/authController');

const router = express.Router();


router.post('/add-gift',authController.protect,transactionController.addGift);



module.exports = router;
