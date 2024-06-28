const mongoose = require('mongoose');
const voucherSchema = new mongoose.Schema(
  {
    codes: [
      {
        code: {
          type: String
        },
        active: {
          type: Boolean,
          default: true
        },
        no: Number
      }
    ],
    voucherPhoto: { type: String, default: null },
    voucherName: {
      type: String,
      required: [true, 'You must Specify voucher Name']
    },
    active: {
      type: Boolean,
      default: true
    },
    numberOfCodes: {
      type: Number,
      default: 1,
      required: [true, 'You must Specify desired number of Codes']
    },
    voucherPoints: {
      type: Number,
      // default: 0,
      required: [true, 'There must be voucher points!']
    },
    voucherMoney: {
      type: Number,
      // default: 0,
      required: [true, 'There must be voucher Money!']
    },
    validDays: {
      type: Number,
      // default: 0,
      required: [true, 'You must specify valid Days!']
    },
    expiryDate: Date,
    createdAt: Date,
    merchant: {
      type: mongoose.Schema.ObjectId,
      ref: 'Merchant',
      required: [true, 'A Voucher must belong to a Merchant!']
    }
  },
  /*scema options*/ { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
voucherSchema.virtual('remainingDays').get(function() {
  return (this.expiryDate - this.createdAt) / (1000 * 60 * 60 * 24);
});
voucherSchema.pre('save', function(next) {
  this.expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000 * this.validDays);
  this.createdAt = Date.now();
  next();
});
voucherSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});
voucherSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'merchant',
    select: 'name merchantPhoto'
  });
  next();
});

const Voucher = mongoose.model('Voucher', voucherSchema);

module.exports = Voucher;
