const express = require('express');
const userController = require('../controllers/userControllers');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgetPassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

// Protect all routes after this middleware
router.use(authController.protect);

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword,
);

router.get(
  '/me',
  authController.protect,
  userController.getMe,
  userController.getUser,
); 

// Adminstrator Features On User Protection
router.use(authController.restrictTo('admin'));
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUserWithId)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
