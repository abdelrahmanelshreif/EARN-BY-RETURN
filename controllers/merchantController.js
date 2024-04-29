const Merchant = require('../model/merchantModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const path = require('path');
const multer = require('multer');

// Define storage for uploaded files
const multerStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, '../assets/merchant');
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const multerFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Only image files are allowed!'), false); // Reject the file
  }
};

const upload = multer({ storage: multerStorage,fileFilter: multerFilter});

exports.createMerchant =(upload.single('photo'), catchAsync(async (req, res, next) => {
  const newMerchant = await Merchant.create({
    name: req.body.name,
    address: req.body.address,
    merchantPhoto: req.file ? req.file.originalname : null
  });

  res.status(201).json({
    status: 'success',
    data: newMerchant
  });

  return next(new AppError('Please try adding the merchant again.'));
}));

exports.getAllMerchants = factory.getAll(Merchant);
