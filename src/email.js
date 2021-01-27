const nodemailer = require("nodemailer");

module.exports = function emailVideos(emailText) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  let mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: process.env.TO_EMAIL,
    subject: "Youtube Videos for: ",
    text: emailText,
  };

  transporter.sendMail(mailOptions, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log("Email has been sent!!");
    }
  });
};
