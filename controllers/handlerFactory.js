const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const multer = require('multer');

exports.uploadPhoto = (folderName, fieldName) => {
  const multerStorage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, `assets/${folderName}`);
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
  const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
  });

  // Return the Multer middleware for handling file uploads
  return upload.single(fieldName);
};

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
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
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

exports.createOne = (Model, additionalData) =>
  catchAsync(async (req, res, next) => {
    // const newDoc = new doc({})
    // newDoc.save()
    let newDocData = req.body;
    if (additionalData) {
      newDocData = additionalData;
    }
    if (req.file) {
      newDocData[req.file.fieldname] = req.file.originalname;
    }
    const newDoc = await Model.create(newDocData);
    // const newTour = await Tour.findOne({ _id: req.params.id})
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
