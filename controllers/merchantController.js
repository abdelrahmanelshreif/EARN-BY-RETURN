const Merchant = require('../model/merchantModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const path = require('path');

exports.uploadMerchantphoto = factory.uploadPhoto('merchant', 'merchantPhoto');

exports.createMerchant = catchAsync(async (req, res, next) => {

  console.log(req.file);
  if (!req.file) {
    return next(new AppError('Enter Your Merchant Data Please', 500));
  }
  const { name, address, branches, originalname, buffer } = req.file;

  const newMerchant = new Merchant({
    name,
    address,
    branches,
    merchantPhoto: {
      name: originalname,
      data: buffer
    }
  });

  // Save the merchant to the database
  await newMerchant.save();

  res.status(201).json({
    message: 'Merchant created successfully',
    merchant: newMerchant
  });

  return next(new AppError('Internal Server Error', 500));
});
exports.getAllMerchants = factory.getAll(Merchant);

exports.getPhoto = (req, res) => {
  // Extract the filename parameter from the request URL

  // Construct the path to the photo file
  const photo = req.file.photoPath;
  const photoPath = path.join(__dirname, `../assets/${photo}`);
  console.log(photoPath);

  // Send the photo file as a response
  res.sendFile(photoPath);
};
