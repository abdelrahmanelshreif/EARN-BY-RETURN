// eslint-disable-next-line no-unused-vars
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const fs = require('fs');
const path = require('path');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];z  
  });
  return newObj;
};
<<<<<<< HEAD
exports.uploadUserphoto = factory.uploadPhoto('avatar', 'userPhoto');

=======
>>>>>>> e46bfbe (Upload User Avatar)
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error here',
    message: 'this url is not yet defined'
  });
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.getWallet = (req, res, next) => {
  req.query.fields = 'wallet,machineVisits';
  next();
};
exports.getUserWithId = (req, res) => {
  res.status(500).json({
    status: 'error here',
    message: 'this url is not yet defined'
  });
};
exports.uploadUserphoto = catchAsync(async (req, res) => {
  const avatarNo = req.body.avatarNo;
  // Construct the file path
  const photoPath = path.join(
    __dirname,
    '..',
    'assets',
    'avatar',
    `${avatarNo}.jpg`
  );
  // Read the file asynchronously
  fs.readFile(photoPath, async (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading photo file' });
    }
    // Update the user document in the database with the photo data
    await User.findByIdAndUpdate(req.user.id, {
      $set: { userPhoto: data.toString('base64') }
    });
    res.sendFile(photoPath);
  });
});
exports.updateMe = catchAsync(async (req, res, next) => {
  console.log(req.file);
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }
  // 2) Filtered out unwanted fileds names that are not allowed to be updated
  const filterbody = filterObj(
    req.body,
    'name',
    'email',
    'phoneNumber',
    'role'
  );
  // if (req.file) filterbody.photo = req.file.filename;

  // 3 ) update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterbody, {
    runValidators: true,
    new: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});
exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
