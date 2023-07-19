const nodemailer = require("nodemailer");
 const sendEmail = async (to, subject, text) => {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODE_MAILER_EMAIL,
        pass: process.env.NODE_MAILER_PASSWORD,
      },
    });
  
    const mailOptions = {
      from: process.env.NODE_MAILER_EMAIL,
      to,
      subject,
      text,
    };
  
    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          reject(error);
        } else {
          console.log("Email sent: " + info.response);
          resolve(info.response);
        }
      });
    });
  };
module.exports = sendEmail