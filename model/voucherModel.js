const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema(
  {
    factor: {
      type: Number,
      default: 0,
      required: [true, 'There must be a factor!']
    },
    voucherPoints: {
      type: Number,
      default: 0,
      required: [true, 'There must be voucher points!']
    },
    voucherMoney: {
      type: Number,
      default: 0
    },
    maxPoints: {
      type: Number,
      default: 0
    },
    expirtDate: Date,
    createdAt: Date,
    active: {
      type: Boolean,
      default: true,
      select: false
    },
    merchant: {
      type: mongoose.Schema.ObjectId,
      ref: 'Merchant',
      required: [true, 'A Voucher must belong to a Merchant!']
    }
  },
  /*scema options*/ { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
voucherSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'merchant',
    select: 'name'
  });
  next();
});
voucherSchema.pre(/^find/, function(next) {
  // this points to current query
  this.find({ active: { $ne: false } });
  next();
});

const Voucher = mongoose.model('Voucher', voucherSchema);

module.exports = Voucher;
