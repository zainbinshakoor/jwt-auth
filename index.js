const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 9000;
const MONGODB_URI = process.env.URI;

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
const login = require("./routes/login");
const signup = require("./routes/signup");
const forgotpassword = require("./routes/forgotPassword");
const resetPassword = require('./routes/resetPassword')

// Health Check endpoint
app.get("/", async (req, res) => {
  res.status(200).json("Health Check is Good");
});

// User Signup endpoint
app.use("/", signup);
// User Login endpoint
app.use("/", login);
// Forgot Password endpoint
app.use("/", forgotpassword);
// Reset Password endpoint
app.use('/',resetPassword)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json("Error: Server Error");
});

// Server listening on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
