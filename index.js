const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const secretKey = "FZWYlhoaFYxWndWbHBGWkdoU2EzQldWVzE0YjFkdFJuSk9WRTVYV";

// MongoDB connection
mongoose.connect("mongodb+srv://admin:admin@authnode.luyqfyf.mongodb.net/auth?retryWrites=true&w=majority");

// Import User model
const UserModel = require("./schema/user");

// Health Check endpoint
app.get("/", async (req, res) => {
  res.status(200).json("Health Check is Good");
});

// User Signup endpoint
app.post("/signup", async (req, res) => {
  const { name, password } = req.body;
  console.log(name, password);

  const user = { name, password };
  const newUser = new UserModel(user);
  await newUser.save();

  console.log(newUser);
  res.json(user);
});

// User Login endpoint
// User Login endpoint
app.post("/login", async (req, res) => {
  const { name, password } = req.body;

  try {
    const user = await UserModel.findOne({ name: name });

    if (user && password === user.password) {
      const token = jwt.sign({ name: user.name }, secretKey, { expiresIn: "3000s" });
      await UserModel.updateOne({ name: name }, { $set: { token: token } });

      jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
          return res.status(401).json("Failed to authenticate token");
        }

        res.json({
          token,
          name: user.name,
        });
      });
    } else {
      res.status(401).json("Invalid Credentials");
    }
  } catch (error) {
    console.error(error);
    res.status(500);
  }
});

  

// Server listening on port 9000
app.listen(9000, () => {
  console.log(`Server is running successfully`);
});
