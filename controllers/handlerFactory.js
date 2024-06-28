const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const multer = require('multer');
const path = require('path');

const multerStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './assets/voucher');
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = file.originalname.split('.').pop();
    cb(null, uniqueSuffix + '.' + extension);
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

exports.uploadPhoto = fieldName =>
  catchAsync(async (req, res, next) => {
    const upload = multer({
      storage: multerStorage,
      fileFilter: multerFilter
    }).single(fieldName);
    // Handle file upload
    upload(req, res, err => {
      if (err) {
        return next(new AppError('Error uploading file', 400));
      }
      next(); // Call next middleware or route handler
    });
  });

exports.accessPhoto = catchAsync(async (req, res, next) => {
  const filename = req.params.filename;
  if (!filename) {
    return next(new AppError('No Photo Found', 404));
  }
  const filePath = path.join(__dirname, '..', 'assets', 'voucher', filename);
  res.sendFile(filePath);
});

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  });
exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    let newDocData = req.body;
    if (req.file) {
      const buffer = req.file.buffer;
      newDocData[req.file.fieldname] = buffer.toString('base64');
    }
    const doc = await Model.findByIdAndUpdate(req.params.id, newDocData, {
      new: true,
      runValidators: true
    });
    if (!doc) {
      return next(new AppError('No document Found with that ID', 404));
    }
    res.status(200).json({
      status: 'sucess',
      data: {
        data: doc
      }
    });
  });
exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    let newDocData = req.body;
    if (req.file) {
      const photoURL = `https://earn-by-return.onrender.com/api/v1/photo/${req.file.filename}`;
      newDocData[req.file.fieldname] = photoURL;
    }
    const newDoc = await Model.create(newDocData);
    res.status(201).json({
      status: 'success',
      data: {
        data: newDoc
      }
    });
  });
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    if (popOptions) query.populate(popOptions);
    const features = new APIFeatures(Model.findById(req.params.id), req.query)
      .filter()
      .sort()
      .fieldLimiting()
      .paginate();
    // const docs = await features.query.explain();
    const doc = await features.query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });
exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    // hack for get all reviews
    let filter = {};
    // eslint-disable-next-line no-unused-vars
    if (req.params.merchantId) filter = { merchant: req.params.merchantId };
    if (req.params.userId) filter = { user: req.params.userId };
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .fieldLimiting()
      .paginate();
    // const docs = await features.query.explain();
    const docs = await features.query;

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        docs
      }
    });
  });
