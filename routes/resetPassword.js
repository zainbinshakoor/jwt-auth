const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const UserModel = require("../schema/user");

const JWT_SECRET_KEY = process.env.SECRET_KEY;
const resetPassword = router.post("/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;
  
    try {
      // Verify the token
      jwt.verify(token, JWT_SECRET_KEY, async (err, decoded) => {
        if (err) {
          return res.status(401).json("Invalid or expired token");
        }
  
        const { name } = decoded;
  
        // Find the user by name in the database
        const user = await UserModel.findOne({ name });
  
        if (!user) {
          return res.status(404).json("User not found");
        }
  
        // Hash the new password using bcrypt
        const hashedPassword = await bcrypt.hash(newPassword, 10);
  
        // Update the user's password in the database
        await UserModel.updateOne(
          { name },
          { $set: { password: hashedPassword } }
        );
  
        // Clear the reset token from the user document
        await UserModel.updateOne({ name }, { $unset: { resetToken: 1 } });
  
        res.status(200).json("Password reset successful");
      });
    } catch (error) {
      console.error(error);
      res.status(500).json("Error: Server Error");
    }
  });

  module.exports=resetPassword
