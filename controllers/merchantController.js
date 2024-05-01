const Merchant = require("../model/merchantModel");
const factory = require("./handlerFactory");

exports.uploadMerchantphoto = factory.uploadPhoto("merchantPhoto");
exports.getAllMerchants = factory.getAll(Merchant);
exports.createMerchant = factory.createOne(Merchant);

// exports.getPhoto = (req, res) => {
//   // Extract the filename parameter from the request URL
//   //const filename = req.params.filename;

//   // Construct the path to the photo file

//   const photoPath = path.join(__dirname, "../assets/merchant/user1.jpeg");
//   console.log(photoPath);

//   // Send the photo file as a response
//   res.sendFile(photoPath);
// };
