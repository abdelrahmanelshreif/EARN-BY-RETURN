// eslint-disable-next-line import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const User = require('../model/userModel');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const catchAsync = require('../utils/catchAsync');


const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken=(user,statusCode,res)=>{
  const token = signToken(user._id);
  
  const cookieOptions = {
    expires: new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN *24*60*60*1000
    ),
    httpOnly:true
  };
  if (process.env.NODE_ENV==='production') cookieOptions.secure = true; 
  // it hide the password from the output
  user.password = undefined;
  res.cookie('jwt',token,cookieOptions);
  res.status(statusCode).json({
    status:'success',
    token,
    data:{
      user
    }
  });
} 

exports.generateRandomCode = function(length) {
  const characters = '0123456789';
  let code = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }
  return code;
};

exports.emailVerify =catchAsync(async(req,res,next)=>{
  vCode : this.generateRandomCode(4);
  const message = `Welcome To Our Recycling System: ${req.body.name}\nWe Wanna You Use Our Best RVM Machine in MENA.\n
  Your Verification Code is :    ${vCode}`;
    try {
      await sendEmail({
        email: req.body.email,
        subject: 'WELCOME TO EARN BY RETURN',
        message,
      });

      res.status(200).json({
        status: 'success',
        message: 'Email is Valid',
      });
    } catch (err) {
      return next(new AppError('Please Enter A Valid Email!', 500));
    }
  });


exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });
  createSendToken(newUser,201,res);
});

exports.login = catchAsync(async (req, res, next) => { 
  const { email, password } = req.body;
  //  1) Check if email and password exist
  if (!email || !password) {
    return next(
      new AppError('Please provide the email and the password!', 400),
    );
  }
  //  2) Check if email and password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password ', 401));
  }
  // 3) If everything is Ok send token to client
  createSendToken(user,200,res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting the token and check it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError(
        'You are not logged in !! Please log in to get access.',
        401,
      ),
    );
  }

  // 2) verification token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);

  // 3) Check if user still exist
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError(
        'The user belonging to this token that is no longer exist.',
        401,
      ),
    );
  }

  // 4) Check if user change password after the jwt was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password!', 401));
  }

  //GRANT ACESS TO PROTECTED ROUTE
  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles)=>(req,res,next)=>{ 
    // roles['admin','lead-guide'].role='user'
    if(!roles.includes(req.user.role)) {
      return next(
        new AppError("You don't have the permission to do this action ",403)
      );
    } 
    next();
  }

exports.forgetPassword = catchAsync(async(req,res,next)=>{
  // 1) Get user based on POSTed email 
  const user = await User.findOne({email : req.body.email });
  if (!user){
    return next(new AppError('There is no user registered with this email address.',404));
  }
  // 2) Generate random reset token 
  const resetToken = user.createPasswordResetToken();
  await  user.save({validateBeforeSave: false}); 

  // 3) Send it to user's email 
  const resetURL = `${req.protocol}://${req.get(
    'host'
    )}/api/v1/user/resetPassword/${resetToken}`;

  const message = `Forget your password? sumbit a patch request with your new password and passwrodConfirm to : ${resetURL}
  \nIf you didn't forget your passwrod, please ignore this email!`;

  
  try{
    await sendEmail({
      email: user.email, // req.body.email -- is the same actually
      subject: 'Your password reset token (valid only for 10 minutes)',
      message
    });
    res.status(200).json({
      status: 'success',
      message: 'Token was sent to email!'
    })
  }
  catch(err){
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await  user.save({validateBeforeSave: false}); 
    return next(new AppError('There is was an error sending the email. please try again later !',500));
  }
});


exports.resetPassword = catchAsync(async(req,res,next)=>{
  // 1) Get user based on token 
  const hashedToken = crypto
  .createHash('sha256')
  .update(req.params.token)
  .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {$gt: Date.now()}
  });

  // 2) if token has't expired , and there is user , set new password 
  if (!user){
    return next(new AppError('Token is invalid or expired',400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3) Update ChangedPasswordAt property for the current user 

  // 4) Log the user in , send JWT 
  createSendToken(user,200,res);

});

exports.updatePassword =catchAsync(async(req,res,next)=> {
  // 1) Get user from collection 
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct 
  if(!(await user.correctPassword(req.body.passwordCurrent,user.password))){
    return next(new AppError('Your current password is wrong.!',401));
  }
  // 3) if so , update password 
  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  await user.save();
  // 4) Log user in , send JWT
  createSendToken(user,200,res);
   
});


