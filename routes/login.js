const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const UserModel = require("../schema/user");

const JWT_SECRET_KEY = process.env.SECRET_KEY;

const login = router.post("/login", async (req, res) => {
  const { name, password } = req.body;

  try {
    const user = await UserModel.findOne({ name });

    if (!user) {
      return res.status(401).json("Invalid Credentials");
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      const token = jwt.sign({ name: user.name }, JWT_SECRET_KEY, {
        expiresIn: "3000s",
      });
      await UserModel.updateOne({ name }, { $set: { token } });
      res.status(200).json({ user });
    } else {
      res.status(401).json("Invalid Credentials");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json("Error: Server Error");
  }
});
module.exports = login;
