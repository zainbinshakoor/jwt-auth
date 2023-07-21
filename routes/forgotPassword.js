const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const sendEmail = require('../helperFunction/email')
const UserModel = require("../schema/user");
const {emailTemplate} = require('../emailTemplate/compileEngine')

const JWT_SECRET_KEY = process.env.SECRET_KEY;
const forgotpassword = router.post("/forgotpassword", async (req, res) => {
  const { name } = req.body;

  try {
    const user = await UserModel.findOne({ name });

    if (!user) {
      return res.status(404).json("User not found");
    }

    // Generate a temporary reset token and store it in the user document
    const resetToken = jwt.sign({ name: user.name }, JWT_SECRET_KEY, {
      expiresIn: "15m", // Reset token will expire in 15 minutes
    });

    await UserModel.updateOne({ name }, { $set: { resetToken } });

    // Send the reset token to the user's email
    const resetPasswordURL = `${process.env.RESET_PASSWORD_URL}/${resetToken}`;
    const emailSubject = "Password Reset Request";
    const emailText = `Click the link to reset your password: ${resetPasswordURL}`;

    await sendEmail(user.name, emailSubject, emailTemplate.compiledEmail({ResetURL:resetPasswordURL}),(err, data) => {
      if (err) {
          console.log('Error sending email: ', err)
          return res
              .status(500)
              .json({ message: 'Failed to send email' })
      } else {
          return res
              .status(200)
              .json({ message: 'Email sent successfully', data })
      }
  });

    res.status(200).json("Reset token generated and emailed successfully");
  } catch (error) {
    console.error(error);
    res.status(500).json("Error: Server Error");
  }
});

module.exports = forgotpassword;