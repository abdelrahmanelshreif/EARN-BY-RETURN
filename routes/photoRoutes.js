const express = require('express');
const factory = require('../controllers/handlerFactory');
const authController = require('../controllers/authController');

const router = express.Router();
router.route('/:filename').get(factory.accessPhoto);
module.exports = router;
