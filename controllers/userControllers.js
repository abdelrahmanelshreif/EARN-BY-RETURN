// eslint-disable-next-line no-unused-vars
const express = require('express');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error here',
    message: 'this url is not yet defined',
  });
};

exports.getMe = (req, res,next)=>{
  req.params.id = req.user.id ;
  next();  
}
exports.getUserWithId = (req, res) => {
  res.status(500).json({
    status: 'error here',
    message: 'this url is not yet defined',
  });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400,
      ),
    );
  }
  // 2) Filtered out unwanted fileds names that are not allowed to be updated
  const filterbody = filterObj(req.body, 'name', 'email');

  // 3 ) update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterbody, {
    runValidators: true,
    new: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
