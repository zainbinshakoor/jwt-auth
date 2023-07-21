const nodemailer = require("nodemailer");
 const sendEmail = async (to, subject,htmlToSend,callBack) => {
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
      html:htmlToSend
    };
  
    transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
          callBack(err, null);
      } else {
          callBack(null, data);
      }
  });
  };
module.exports = sendEmail