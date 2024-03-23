const express = require('express');
const userController = require('../controllers/userControllers');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgetPassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);

router.patch('/updateMe', userController.updateMe);
router.patch('/updateMyPassword', authController.updatePassword);
router.delete('/deleteMe', userController.deleteMe);
router.get(
  '/myWallet',
  userController.getMe,
  userController.getWallet,
  userController.getUser
);
router.get('/me', userController.getMe, userController.getUser);

// Adminstrator Features On User Protection
router.use(authController.restrictTo('admin')); ///////////////////////////////////////////checkkkkkkkkkk
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id/wallet')
  .get(userController.getWallet, userController.getUser);

router
  .route('/:id')
  .get(userController.getUserWithId)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
