const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const UserModel = require("../schema/user");

const signup = router.post("/signup", async (req, res) => {
  const { name, password } = req.body;

  try {
    const userAlreadyExist = await UserModel.findOne({ name });
    if (userAlreadyExist) {
      res.status(409).json("Error: Email Already Exists");
    } else {
      // Hash the password using bcrypt
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new UserModel({ role: "candidate", name, password: hashedPassword });
      await newUser.save();
      res.status(200).json(newUser);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json("Error: Server Error");
  }
});

module.exports = signup
