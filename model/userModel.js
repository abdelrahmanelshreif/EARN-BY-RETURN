const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: [String], //Array of strings
      required: [true, 'Please Enter Your Name']
    },
    email: {
      type: String,
      required: [true, 'Please Enter Your Email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Plase Provide a Valid Email']
    },
    phoneNumber: {
      type: String,
      required: [true, 'Please Enter Your Mobile Phone Number']
    },
    userPhoto: { type: String, default: null },
    role: {
      type: String,
      enum: ['user', 'admin', 'merchant'],
      default: 'user',
      required: true
    },
    password: {
      type: String,
      required: [true, 'Please Provide Your Password'],
      minlength: 8,
      select: false
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please Confirm Your Password'],
      validate: [
        {
          validator: function(el) {
            return el === this.password;
          },
          message: 'Password not the same'
        }
      ]
    },
    passwordChangedAt: {
      type: Date,
      default: Date.now() - 1
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      select: false,
      default: true
    },
    updatedAt: Date,
    wallet: {
      Coins: { type: Number, default: 0 },
      Money: { type: Number, default: 0 },
      canCount: { type: Number, default: 0 },
      bottleCount: { type: Number, default: 0 },
      updatedAt: { type: Date, default: Date.now }
    },
    machineVisits: {
      type: Number,
      default: 0
    },
    verificationCode:{
      type: Number
    },
    profilePhoto:{
      type: String
    },
  } /*scema options*/,
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema.pre('save', async function(next) {
  //Only run this function if password was actually modified
  if (!this.isModified('password')) return next();
  //hash the password with the cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  //delete password Confirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function(next) {
  // this points to current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (!this.passwordChnagedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimeStamp; //300 < 200
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  // this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
