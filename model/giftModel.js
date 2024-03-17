const mongoose = require('mongoose');
const QRCode = require('qrcode');
const giftSchema = new mongoose.Schema(
  {
    noOfCans: {
      type: Number,
      default: 0
    },
    noOfBottles: {
      type: Number,
      default: 0
    },
    giftCoins: {
      type: Number,
      default: 0,
    },
    giftMoney: {
      type: Number,
      default: 0,
    },
    QRCode: String,
    active: {
      type: Boolean,
      default: true,
    },
    createdAt: Date
  },
  /*scema options*/ { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
giftSchema.pre('save', async function(next) {
  // Encode the _id in the QR code
  const dataToEncode = this._id.toString();

  // Generate QR code
  const qrCodeDataUrl = await QRCode.toDataURL(dataToEncode);

  // Set the QRCode field with the generated QR code
  this.QRCode = qrCodeDataUrl;

  // Continue with the save operation
  next();
});

const Gift = mongoose.model('Gift', giftSchema);

module.exports = Gift;
