const buissnessController = require('../controllers/buissnessController');
const express = require('express');


const router = express.Router();

router.use('/total', buissnessController.getProfit);

module.exports = router;
