// eslint-disable-next-line import/no-extraneous-dependencies
const nodemailer = require('nodemailer');


const sendEmail = async options => {
  
  // 1) Create a transporter 
  var transporter = nodemailer.createTransport({
    // host: process.env.EMAIL_HOST,
    // port: process.env.EMAIL_PORT,
    service: 'gmail',
    auth:{
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // 2) Define the email options 
   const emailOptions = {
    from: 'EARN BY RETURN <earnbyreturn@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,  
    // html:
   };

   // 3) Actually send the eamil 
   await transporter.sendMail(emailOptions);
};

module.exports = sendEmail;

