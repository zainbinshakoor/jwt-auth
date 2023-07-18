const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 9000;
const MONGODB_URI = process.env.URI;
const JWT_SECRET_KEY = process.env.SECRET_KEY;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (error) => console.error("MongoDB connection error:", error));
db.once("open", () => console.log("Connected to MongoDB successfully"));

// Import User model
const UserModel = require("./schema/user");

// Helper function to send email
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

// Health Check endpoint
app.get("/", async (req, res) => {
  res.status(200).json("Health Check is Good");
});

// User Signup endpoint
app.post("/signup", async (req, res) => {
  const { name, password } = req.body;

  try {
    const userAlreadyExist = await UserModel.findOne({ name });
    if (userAlreadyExist) {
      res.status(409).json("Error: Email Already Exists");
    } else {
      // Hash the password using bcrypt
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new UserModel({ name, password: hashedPassword });
      await newUser.save();
      res.status(200).json(newUser);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json("Error: Server Error");
  }
});

// User Login endpoint
app.post("/login", async (req, res) => {
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

// Forgot Password endpoint
app.post("/forgotpassword", async (req, res) => {
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

    await sendEmail(user.name, emailSubject, emailText);

    res.status(200).json("Reset token generated and emailed successfully");
  } catch (error) {
    console.error(error);
    res.status(500).json("Error: Server Error");
  }
});

// Reset Password endpoint
app.post("/reset-password", async (req, res) => {
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json("Error: Server Error");
});

// Server listening on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
