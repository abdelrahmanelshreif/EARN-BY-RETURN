const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    time: Date,
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A Transaction must belong to a User!']
    },
    voucher: {
      voucherId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Voucher',
        default: null
      },
      codeId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Voucher.codes',
        default: null
      }
    },
    gift: {
      type: mongoose.Schema.ObjectId,
      ref: 'Gift',
      default: null
    },
    transactionPoints: Number
  } /*scema options*/,
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

transactionSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name'
  });
  next();
});
const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
